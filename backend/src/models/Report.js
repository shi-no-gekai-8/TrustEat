import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    agriturismo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agriturismo",
      required: true,
    },
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
    },

    // I dati "congelati" al momento del report
    temperature: Number,
    humidity: Number,
    timestamp: Date,

    // 🔒 LA SICUREZZA
    // Stato dell'integrità: "VERIFIED" (Firma ok) o "TAMPERED" (Firma ko)
    integrityStatus: {
      type: String,
      enum: ["VERIFIED", "TAMPERED", "ERROR"],
      required: true,
    },

    // La prova su Blockchain
    blockchainTxId: {
      type: String,
      required: true, // È obbligatorio: senza TX non esiste report
    },

    // Hash dei dati ricevuti (utile per audit futuri)
    dataHash: String,
  },
  { timestamps: true },
);

export default mongoose.model("Report", ReportSchema);
