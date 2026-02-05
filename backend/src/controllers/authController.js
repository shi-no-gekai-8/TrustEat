import User from "../models/User.js"; // Nota il .js finale
import jwt from "jsonwebtoken";
import { ethers } from "ethers";

export const getNonce = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) return res.status(400).send("Manca il wallet address");

    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    
    if (!user) {
      user = await User.create({ walletAddress: walletAddress.toLowerCase() });
      console.log("🆕 Nuovo utente creato:", walletAddress);
    }

    res.json({ nonce: user.nonce });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore del server" });
  }
};

export const login = async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;
    if (!walletAddress || !signature) return res.status(400).send("Dati mancanti");

    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) return res.status(404).send("Utente non trovato");

    // Verifica firma
    const recoveredAddress = ethers.verifyMessage(user.nonce, signature);

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).send("Firma non valida!");
    }

    // Aggiorna Nonce
    user.nonce = Math.floor(Math.random() * 1000000).toString();
    await user.save();

    // Token
    const token = jwt.sign(
      { _id: user._id, address: user.walletAddress, role: user.role },
      "SEGRETO_SUPER_SEGRETO", 
      { expiresIn: "24h" }
    );

    res.json({ token, user });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore login" });
  }
};