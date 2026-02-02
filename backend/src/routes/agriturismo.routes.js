import express from "express";
import { registerAgriturismo } from "../controllers/agriturismoController.js";
const router = express.Router();

router.post("/register", registerAgriturismo);

export default router;
