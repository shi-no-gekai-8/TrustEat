import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import "./mqtt/mqttClient.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 TrustEat is running on port ${PORT}`);
  });
};

startServer();
