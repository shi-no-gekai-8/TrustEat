import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const algorithm = 'aes-256-ctr'; // Un algoritmo standard e veloce
const secretKey = process.env.CHAT_SECRET_KEY; // La tua chiave dal .env

if (!secretKey || secretKey.length !== 32) {
    throw new Error("❌ ERRORE CRITICO: CHAT_SECRET_KEY nel .env deve essere di 32 caratteri esatti!");
}

// Funzione per Criptare (Testo -> Gibberish)
export const encrypt = (text) => {
    const iv = crypto.randomBytes(16); // Crea un valore casuale per rendere unica la criptazione
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    // Restituiamo IV + TestoCriptato separati da due punti
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

// Funzione per Decriptare (Gibberish -> Testo)
export const decrypt = (hash) => {
    const [ivHex, contentHex] = hash.split(':'); // Separiamo IV e contenuto
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), iv);
    const decrypted = Buffer.concat([decipher.update(Buffer.from(contentHex, 'hex')), decipher.final()]);

    return decrypted.toString();
};