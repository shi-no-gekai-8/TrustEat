import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agriturismo",
      required: true,
    },
    caption: {
      type: String,
      required: true,
      trim: true,
      maxlenght: 2000,
    },
    images: [
      {
        type: String,
      },
    ],
    certifiedData: {
      deviceId: { type: String },
      deviceName: { type: String },
      temperature: Number,
      humidity: Number,
      timestamp: Date,
      blockchainId: String,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        username: String,
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Post", PostSchema);
