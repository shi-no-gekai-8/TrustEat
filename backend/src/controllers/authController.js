import User from "../models/User.js"; 
import jwt from "jsonwebtoken";
import { ethers } from "ethers";

// 1. GENERA NONCE (Serve per la firma MetaMask)
export const getNonce = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) return res.status(400).send("Manca il wallet address");

    // Cerca l'utente o crealo se non esiste
    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    
    if (!user) {
      user = await User.create({ walletAddress: walletAddress.toLowerCase() });
      console.log("🆕 Nuovo utente creato:", walletAddress);
    }

    // Restituisci il nonce da firmare
    res.json({ nonce: user.nonce });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore del server" });
  }
};

// 2. LOGIN UTENTE (Verifica firma e genera Token)
export const login = async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;
    if (!walletAddress || !signature) return res.status(400).send("Dati mancanti");

    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) return res.status(404).send("Utente non trovato");

    // Verifica la firma crittografica
    // (Recupera l'indirizzo che ha firmato il nonce)
    const recoveredAddress = ethers.verifyMessage(user.nonce, signature);

    // Controlla se l'indirizzo recuperato corrisponde a quello inviato
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).send("Firma non valida!");
    }

    // Aggiorna il Nonce per sicurezza (così la vecchia firma non vale più per il futuro)
    user.nonce = Math.floor(Math.random() * 1000000).toString();
    await user.save();

    // --- MODIFICA FONDAMENTALE QUI SOTTO ---
    // Generiamo il token usando la chiave segreta dal file .env
    // Assicurati che nel file .env ci sia: JWT_SECRET=...
    const token = jwt.sign(
      { 
        _id: user._id, 
        address: user.walletAddress, 
        role: user.role || "user" 
      },
      process.env.JWT_SECRET, // <--- ORA LEGGE DAL FILE .ENV (Coerente con tutto il resto)
      { expiresIn: "24h" }
    );
    // ---------------------------------------

    res.json({ token, user });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore login" });
  }
};