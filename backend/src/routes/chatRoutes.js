import express from "express";
import { sendMessage, getMessages } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Proteggi tutto con il token
router.use(protect);

router.post("/send", sendMessage);         // POST /api/chat/send
router.get("/:friendId", getMessages);     // GET /api/chat/12345abcde...

export default router;