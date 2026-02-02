import express from "express";
import cors from "cors";
import agriturismiRoutes from "./routes/agriturismo.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`Richiesta ricevuta: ${req.method} ${req.url}`);
  next();
});

app.use("/api/agriturismi", agriturismiRoutes);

export default app;
