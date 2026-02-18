import express from "express";
import {
  inviaRichiesta,
  accettaRichiesta,
  rifiutaRichiesta,
  getRichiesteInAttesa,
  getMieiAmici,
  cercaUtente
} from "../controllers/connectionController.js";

// IMPORTANTE: Assicurati che questo sia il percorso giusto del tuo middleware
// Deve essere quello generico che decodifica il token JWT
import { verifyToken } from "../middleware/authMiddleware.js"; 

const router = express.Router();

// 🔒 Tutte le rotte qui sotto richiedono il login (Utente o Agriturismo)
router.use(verifyToken);

// 1. Inviare una richiesta di amicizia
// POST http://localhost:5000/api/connections/request
router.post("/request", inviaRichiesta);

// 2. Accettare una richiesta
// PUT http://localhost:5000/api/connections/accept
router.put("/accept", accettaRichiesta);

// 3. Rifiutare o Cancellare una richiesta
// POST http://localhost:5000/api/connections/reject
router.post("/reject", rifiutaRichiesta);

// 4. Vedere le richieste in arrivo (per il pallino rosso delle notifiche)
// GET http://localhost:5000/api/connections/pending
router.get("/pending", getRichiesteInAttesa);

// 5. Vedere la lista dei propri amici (per la chat)
// GET http://localhost:5000/api/connections/friends
router.get("/friends", getMieiAmici);
router.get("/search", cercaUtente);

export default router;