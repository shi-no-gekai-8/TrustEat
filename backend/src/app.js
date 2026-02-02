import express from "express";
import cors from "cors";

// --- CORREZIONE QUI: Usa ./ invece di ../ ---
// Stiamo dicendo: "Nella cartella corrente (src), cerca la cartella routes"
import agriturismiRoutes from "./routes/agriturismo.routes.js";
import authRoutes from "./routes/auth.routes.js";
import bachecaRoutes from "./routes/bacheca.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`Richiesta ricevuta: ${req.method} ${req.url}`);
  next();
});

// Rotte
app.use("/api/agriturismi", agriturismiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bacheca", bachecaRoutes);

export default app;