import express from "express";
import { leggiMessaggi, scriviMessaggio, rispondiMessaggio } from "../controllers/bachecaController.js";

const router = express.Router();

router.get("/leggi", leggiMessaggi);
router.post("/scrivi", scriviMessaggio);
router.put("/rispondi/:id", rispondiMessaggio);

export default router;