import cron from "node-cron";
import Agriturismo from "../models/Agriturismo.js";

const REPORT_TIMEOUT_HOURS = 24;
const PENALTY_PER_CYCLE = 5;

export const startTrustDecayJob = () => {
  console.log("⏳ [Cron] Avvio monitoraggio decadimento Trust Index...");

  cron.schedule("0 * * * *", async () => {
    console.log("📉 [Trust Decay] Controllo attività agriturismi...");
    try {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - REPORT_TIMEOUT_HOURS);
      const inattivi = await Agriturismo.find({
        lastReportAt: { $lt: cutoffDate },
        trustIndex: { $gt: 0 },
      });

      for (const agri of inattivi) {
        agri.trustIndex = Math.max(0, agri.trustIndex - PENALTY_PER_CYCLE);
        console.log(
          `🔻 [Trust Decay] ${agri.name} è inattivo. Nuovo Index: ${agri.trustIndex}`,
        );
        await agri.save();
      }
    } catch (error) {
      console.error("❌ [Trust Decay] Errore nel job:", error);
    }
  });
};
