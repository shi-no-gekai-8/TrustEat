import express from "express";
import {
  registerAgriturismo,
  loginAgriturismo,
  getDashboardData,
  getDeviceHistory,
} from "../controllers/agriturismoController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/register", registerAgriturismo);
router.post("/login", loginAgriturismo);

router.get("/dashboard/:id", authMiddleware, getDashboardData);
router.get("/device/:deviceId/history", authMiddleware, getDeviceHistory);

export default router;
