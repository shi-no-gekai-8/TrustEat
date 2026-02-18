import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  // Chi manda il messaggio
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    refPath: 'senderModel' // Riferimento dinamico (può essere User o Agriturismo)
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['User', 'Agriturismo']
  },
  
  // Chi riceve (può essere utile per query veloci)
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },

  // Il Testo (Che sarà salvato CRIPTATO)
  text: { 
    type: String, 
    required: true 
  },

  // Data di creazione
  createdAt: { 
    type: Date, 
    default: Date.now,
    expires: 86400 // 🔥 AUTOCANCELLAZIONE: 86400 secondi = 24 Ore
  }
});

export default mongoose.model("Message", messageSchema);