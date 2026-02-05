import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import "./mqtt/mqttClient.js";
import { startTrustDecayJob } from "./services/trustDecayService.js";

const PORT = process.env.PORT || 5002;

const startServer = async () => {
  await connectDB();
  startTrustDecayJob();

  app.listen(PORT, () => {
    console.log(`🚀 TrustEat is running on port ${PORT}`);
  });
};

startServer();
