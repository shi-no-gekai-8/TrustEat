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
    lastReportAt: Date,
    missedReports: {
      type: Number,
      default: 0,
    },
    trustIndex: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    lastTrustUpdate: {
      type: Date,
      default: Date.now,
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
