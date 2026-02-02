import Messaggio from "../models/Messaggio.js";

export const leggiMessaggi = async (req, res) => {
  try {
    const messaggi = await Messaggio.find().sort({ dataCreazione: -1 });
    res.json(messaggi);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const scriviMessaggio = async (req, res) => {
  try {
    const nuovoMessaggio = new Messaggio({
      autore: req.body.walletAddress,
      testo: req.body.testo
    });

    const messaggioSalvato = await nuovoMessaggio.save();
    res.status(200).json(messaggioSalvato);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const rispondiMessaggio = async (req, res) => {
  try {
    const messaggio = await Messaggio.findById(req.params.id);
    if (!messaggio) return res.status(404).json("Messaggio non trovato");

    await messaggio.updateOne({
      $push: {
        risposte: {
          autoreRisposta: req.body.walletAddress,
          testoRisposta: req.body.risposta
        }
      }
    });
    res.status(200).json("Risposta inviata!");
  } catch (err) {
    res.status(500).json(err);
  }
};