import mongoose from "mongoose";

const ConnectionSchema = new mongoose.Schema(
  {
    // CHI FA LA RICHIESTA (Requester)
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "requesterModel", // <--- MAGIA: Il modello dipende dal campo sotto
    },
    requesterModel: {
      type: String,
      required: true,
      enum: ["User", "Agriturismo"], // Può essere solo uno di questi due
    },

    // CHI RICEVE LA RICHIESTA (Recipient)
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "recipientModel", // <--- MAGIA: Anche qui riferimento dinamico
    },
    recipientModel: {
      type: String,
      required: true,
      enum: ["User", "Agriturismo"],
    },

    // STATO DELLA CONNESSIONE
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { 
    timestamps: true // Ci serve per sapere QUANDO è stata fatta la richiesta
  }
);

// 🔒 SICUREZZA & INTEGRITÀ DATI
// Questo indice composto assicura che A non possa chiedere amicizia a B due volte.
// Indipendentemente se lo stato è pending o accepted.
ConnectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export default mongoose.model("Connection", ConnectionSchema);