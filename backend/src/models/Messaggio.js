import mongoose from "mongoose";

const MessaggioSchema = new mongoose.Schema({
  autore: { type: String, required: true },
  testo: { type: String, required: true },
  risposte: [
    {
      autoreRisposta: String,
      testoRisposta: String,
      dataRisposta: { type: Date, default: Date.now }
    }
  ],
  dataCreazione: { 
    type: Date, 
    default: Date.now, 
    expires: 86400 // 24 ore
  }
});

export default mongoose.model("Messaggio", MessaggioSchema);