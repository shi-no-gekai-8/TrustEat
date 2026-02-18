import jwt from "jsonwebtoken";

// 1. VERIFICA TOKEN (Rinomata verifyToken)
export function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Token mancante o formato non valido" });
    }
    
    const token = authHeader.split(" ")[1];
    
    // Verifica usando la chiave nel .env
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-this"
    );

    // 2. MODIFICA CRUCIALE: Passiamo tutto l'oggetto decodificato
    // In questo modo passano 'walletAddress' (se utente) o 'email' (se agriturismo)
    req.user = decoded; 

    // 3. COMPATIBILITÀ ID
    // Mongoose usa _id, ma il token generato spesso ha id. 
    // Facciamo in modo che req.user._id esista sempre.
    if (decoded.id && !req.user._id) {
        req.user._id = decoded.id;
    }

    next();
  } catch (error) {
    console.error("Errore Auth:", error.message); // Log utile per debug
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Token non valido" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token scaduto" });
    }
    return res.status(401).json({ error: "Autenticazione fallita" });
  }
}

// Manteniamo questa per le altre tue rotte, se serve
export function checkOwnership(req, res, next) {
  const requestedId = req.params.id || req.params.agriturismoId;

  // Usiamo _id per coerenza con la modifica sopra
  const userId = req.user._id || req.user.id;

  if (requestedId !== userId) {
    return res
      .status(403)
      .json({ error: "Non autorizzato ad accedere a questa risorsa" });
  }

  next();
}

// Alias per compatibilità con vecchio codice (opzionale)
export const authMiddleware = verifyToken;

// --- AGGIUNTA FONDAMENTALE PER FAR FUNZIONARE LA CHAT ---
// Le rotte della chat cercano "protect", quindi creiamo questo alias che punta alla tua funzione verifyToken
export const protect = verifyToken;