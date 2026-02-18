import express from "express";
import { getNonce, login } from "../controllers/authController.js";

const router = express.Router();

router.post("/nonce", getNonce);
router.post("/login", login);

export default router;