import Connection from "../models/Connection.js";
import User from "../models/User.js";
import Agriturismo from "../models/Agriturismo.js";

// --- DEBUG LOGGER ---
const debugLog = (msg, data) => {
  console.log(`🔍 [DEBUG] ${msg}:`, JSON.stringify(data, null, 2));
};

// 🛠 HELPER: Capisce chi è l'utente
const getCurrentModel = (user) => {
  if (!user) throw new Error("Utente non trovato nel token");
  if (user.role === "agriturismo" || user.email) return "Agriturismo";
  if (user.role === "user" || user.walletAddress || user.address) return "User";
  if (user._id || user.id) return "User"; // Fallback
  throw new Error("Tipo utente sconosciuto");
};

// 1. INVIA RICHIESTA (Già funzionante)
export const inviaRichiesta = async (req, res) => {
  try {
    const requesterId = req.user._id || req.user.id;
    const requesterModel = getCurrentModel(req.user);
    let { recipientId, recipientModel } = req.body;

    console.log(`📡 Richiesta: ${requesterModel} -> ${recipientModel} (${recipientId})`);

    // Auto-fix modello destinatario
    const agriturismoExists = await Agriturismo.findById(recipientId);
    if (agriturismoExists) recipientModel = "Agriturismo";
    else {
        const userExists = await User.findById(recipientId);
        if (userExists) recipientModel = "User";
        else return res.status(404).json({ error: "Destinatario inesistente" });
    }

    if (requesterId.toString() === recipientId) {
        return res.status(400).json({ error: "Non puoi aggiungerti da solo" });
    }

    const existing = await Connection.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
    });

    if (existing) {
        if (existing.status === "pending") return res.status(400).json({ error: "Richiesta già inviata" });
        if (existing.status === "accepted") return res.status(400).json({ error: "Già amici" });
    }

    const newConnection = new Connection({
      requester: requesterId,
      requesterModel,
      recipient: recipientId,
      recipientModel,
      status: "pending",
    });

    await newConnection.save();
    res.status(201).json({ message: "Richiesta inviata!", connection: newConnection });

  } catch (error) {
    console.error("❌ Errore invio:", error);
    res.status(500).json({ error: error.message });
  }
};

// 2. ACCETTA RICHIESTA (IL TASTO VERDE) ✅
export const accettaRichiesta = async (req, res) => {
  try {
    console.log("🟢 Tentativo di accettazione richiesta...");
    const { connectionId } = req.body;
    const myId = req.user._id || req.user.id;

    // 1. Trova la richiesta
    const connection = await Connection.findById(connectionId);
    if (!connection) {
        return res.status(404).json({ error: "Richiesta non trovata" });
    }

    // 2. Verifica che TU sia il destinatario
    if (connection.recipient.toString() !== myId.toString()) {
        console.warn("⚠️ Tentativo non autorizzato di accettare richiesta altrui");
        return res.status(403).json({ error: "Non puoi accettare richieste non tue" });
    }

    // 3. Aggiorna lo stato
    connection.status = "accepted";
    await connection.save();

    console.log("🎉 Richiesta ACCETTATA con successo!");
    res.json({ message: "Connessione stabilita!", connection });

  } catch (error) {
    console.error("❌ Errore accettazione:", error);
    res.status(500).json({ error: error.message });
  }
};

// 3. RIFIUTA RICHIESTA (IL TASTO ROSSO) ❌
export const rifiutaRichiesta = async (req, res) => {
    try {
      console.log("🔴 Tentativo di rifiuto richiesta...");
      const { connectionId } = req.body;
      const myId = req.user._id || req.user.id;
  
      const connection = await Connection.findById(connectionId);
      if (!connection) return res.status(404).json({ error: "Richiesta non trovata" });
  
      // Solo chi riceve o chi invia può cancellare
      if (
        connection.recipient.toString() !== myId.toString() &&
        connection.requester.toString() !== myId.toString()
      ) {
        return res.status(403).json({ error: "Non autorizzato" });
      }
  
      await Connection.findByIdAndDelete(connectionId);
      console.log("🗑️ Richiesta eliminata/rifiutata.");
      
      res.json({ message: "Richiesta rimossa." });
    } catch (error) {
      console.error("❌ Errore rifiuto:", error);
      res.status(500).json({ error: error.message });
    }
  };

// 4. LISTA RICHIESTE IN ATTESA (Per far apparire i pallini)
export const getRichiesteInAttesa = async (req, res) => {
  try {
    const myId = req.user._id || req.user.id;
    
    // Trova tutte le connessioni dove IO sono il destinatario e lo stato è pending
    const richieste = await Connection.find({
      recipient: myId,
      status: "pending",
    })
    .populate("requester", "name email walletAddress"); // Popola i dati di chi mi cerca

    res.json(richieste);
  } catch (error) {
    console.error("❌ Errore getRichieste:", error);
    res.status(500).json({ error: error.message });
  }
};

// 5. LISTA AMICI (Per la chat)
export const getMieiAmici = async (req, res) => {
    try {
      const myId = req.user._id || req.user.id;
      
      const connessioni = await Connection.find({
        $or: [{ requester: myId }, { recipient: myId }],
        status: "accepted",
      })
      .populate("requester", "name email walletAddress")
      .populate("recipient", "name email walletAddress");
  
      const amici = connessioni.map(conn => {
        const isMeRequester = conn.requester._id.toString() === myId.toString();
        const friendData = isMeRequester ? conn.recipient : conn.requester;
        const friendModel = isMeRequester ? conn.recipientModel : conn.requesterModel;
        
        return {
          connectionId: conn._id,
          friendId: friendData._id,
          type: friendModel,
          name: friendData.name || "Utente Anonimo", 
          identifier: friendData.email || friendData.walletAddress,
        };
      });
      res.json(amici);
    } catch (error) {
      console.error("❌ Errore getAmici:", error);
      res.status(500).json({ error: error.message });
    }

    
};
// ... (tutto il codice di prima resta uguale)

// 🔍 6. CERCA UTENTI O AGRITURISMI (NUOVA FUNZIONE)
export const cercaUtente = async (req, res) => {
  try {
    const { q } = req.query; // q è quello che scrivi nella barra (es. "Cascina")

    if (!q || q.length < 3) {
      return res.status(400).json({ error: "Scrivi almeno 3 lettere per cercare." });
    }

    console.log(`🔎 Ricerca in corso per: "${q}"`);

    // 1. Cerca tra gli AGRITURISMI (per Nome o Email)
    // L'opzione 'i' significa che ignora maiuscole/minuscole
    const agriturismiTrovati = await Agriturismo.find({
      $or: [
        { name: { $regex: q, $options: "i" } }, 
        { email: { $regex: q, $options: "i" } }
      ]
    }).select("_id name email address ownerName"); // Restituisci SOLO dati pubblici

    // 2. Cerca tra gli UTENTI (per Wallet Address esatto)
    // I wallet sono codici precisi, quindi cerchiamo la corrispondenza esatta o parziale
    const utentiTrovati = await User.find({
      walletAddress: { $regex: q, $options: "i" }
    }).select("_id walletAddress");

    // 3. Uniamo i risultati
    const risultati = [
      ...agriturismiTrovati.map(a => ({
        id: a._id,
        name: a.name,
        info: a.address || a.email,
        type: "Agriturismo"
      })),
      ...utentiTrovati.map(u => ({
        id: u._id,
        name: "Utente Crypto",
        info: u.walletAddress,
        type: "User"
      }))
    ];

    console.log(`✅ Trovati ${risultati.length} risultati.`);
    res.json(risultati);

  } catch (error) {
    console.error("❌ Errore ricerca:", error);
    res.status(500).json({ error: "Errore durante la ricerca." });
  }
};