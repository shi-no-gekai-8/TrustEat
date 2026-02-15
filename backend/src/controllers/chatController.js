import Message from "../models/Message.js";
import Connection from "../models/Connection.js";
import { encrypt, decrypt } from "../utils/crypto.js"; // Importiamo il criptatore

// 1. INVIA MESSAGGIO
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id || req.user.id;
    const { recipientId, text } = req.body; // Dal frontend arriva testo in chiaro

    if (!text || !recipientId) return res.status(400).json({ error: "Dati mancanti" });

    // A. Verifica che siano AMICI (Sicurezza)
    const connection = await Connection.findOne({
      $or: [
        { requester: senderId, recipient: recipientId },
        { requester: recipientId, recipient: senderId }
      ],
      status: "accepted"
    });

    if (!connection) {
      return res.status(403).json({ error: "Non puoi scrivere a chi non è tuo amico." });
    }

    // B. Cripta il messaggio prima di salvarlo
    const encryptedText = encrypt(text);

    // C. Salva nel DB
    const newMessage = await Message.create({
      sender: senderId,
      senderModel: req.user.role === "agriturismo" || req.user.email ? "Agriturismo" : "User",
      recipient: recipientId,
      text: encryptedText // Salviamo quello illeggibile!
    });

    // D. Rispondi al frontend (qui possiamo ridarglielo in chiaro o criptato, meglio chiaro per conferma)
    res.status(201).json({ 
        _id: newMessage._id,
        text: text, // Al mittente lo mostriamo subito in chiaro
        createdAt: newMessage.createdAt 
    });

  } catch (error) {
    console.error("Errore invio messaggio:", error);
    res.status(500).json({ error: "Errore server" });
  }
};

// 2. LEGGI MESSAGGI (Chat History)
export const getMessages = async (req, res) => {
  try {
    const myId = req.user._id || req.user.id;
    const { friendId } = req.params;

    // Recupera i messaggi dove IO sono mittente O destinatario con quell'amico
    const messages = await Message.find({
      $or: [
        { sender: myId, recipient: friendId },
        { sender: friendId, recipient: myId }
      ]
    }).sort({ createdAt: 1 }); // Dal più vecchio al più nuovo

    // Decripta i messaggi prima di mandarli al frontend
    const decryptedMessages = messages.map(msg => {
      try {
        return {
          _id: msg._id,
          sender: msg.sender,
          senderModel: msg.senderModel,
          text: decrypt(msg.text), // 🔥 QUI DECRIPTIAMO
          createdAt: msg.createdAt,
          isMe: msg.sender.toString() === myId.toString() // Flag utile per il frontend (destra/sinistra)
        };
      } catch (err) {
        return { ...msg.toObject(), text: "⚠️ Messaggio illeggibile (Chiave persa?)" };
      }
    });

    res.json(decryptedMessages);

  } catch (error) {
    console.error("Errore recupero messaggi:", error);
    res.status(500).json({ error: "Errore server" });
  }
};