import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Token mancante o formato non valido" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-this",
    );
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Token non valido" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token scaduto" });
    }
    return res.status(401).json({ error: "Autenticazione fallita" });
  }
}

export function checkOwnership(req, res, next) {
  const requestedId = req.params.id || req.params.agriturismoId;

  if (requestedId !== req.user.id) {
    return res
      .status(403)
      .json({ error: "Non autorizzato ad accedere a questa risorsa" });
  }

  next();
}
