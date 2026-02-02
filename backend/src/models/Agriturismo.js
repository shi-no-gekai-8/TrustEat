import mongoose from "mongoose";

const AgriturismoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    address: {
      type: String,
      required: true,
    },
    ownerName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },

    devices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Device",
      },
    ],

    // 📊 Trust metrics (aggregated)
    lastReportAt: Date,
    missedReports: {
      type: Number,
      default: 0,
    },
    integrityViolations: {
      type: Number,
      default: 0,
    },

    // ⚙️ Stato amministrativo
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Agriturismo", AgriturismoSchema);
