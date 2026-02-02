import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  nonce: {
    type: String,
    required: true,
    default: () => Math.floor(Math.random() * 1000000).toString(),
  },
  role: {
    type: String,
    enum: ["user", "agriturismo"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("User", UserSchema);