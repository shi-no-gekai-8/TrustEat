import express from "express";
import { startReport, checkStatus } from "../controllers/reportController.js";

const router = express.Router();

router.post("/:deviceId/start-report", startReport);
router.get("/:deviceId/check-status", checkStatus);

export default router;
