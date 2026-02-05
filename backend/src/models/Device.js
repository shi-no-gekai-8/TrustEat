import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
    },

    agriturismoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agriturismo",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "active", "revoked"],
      default: "pending",
    },
    lastSeen: {
      type: Date,
    },
    publicKey: {
      type: String,
      default: null,
    },

    integrityViolations: {
      type: Number,
      default: 0,
    },
    blockchainTxId: { type: String, default: null },
    provisionedAt: Date,
  },
  { timestamps: true },
);

export default mongoose.model("Device", DeviceSchema);
