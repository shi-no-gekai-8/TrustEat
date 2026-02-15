import express from "express";
import cors from "cors";

// --- CORREZIONE QUI: Usa ./ invece di ../ ---
// Stiamo dicendo: "Nella cartella corrente (src), cerca la cartella routes"
import agriturismiRoutes from "./routes/agriturismo.routes.js";
import authRoutes from "./routes/auth.routes.js";
import bachecaRoutes from "./routes/bacheca.routes.js";
import connectionRoutes from "./routes/connection.routes.js";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  next();
});

// Rotte
app.use("/api/agriturismi", agriturismiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bacheca", bachecaRoutes);
// Rotte Connessioni (Amicizie)
app.use("/api/connections", connectionRoutes);
app.use("/api/chat", chatRoutes);
export default app;