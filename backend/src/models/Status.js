import mongoose from "mongoose";

const statusSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      default: "",
    },
    mediaUrl: {
      type: String,
      default: "",
    },
    bgColor: {
      type: String,
      default: "#075e54",
    },
    views: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Automatically delete document 24 hours after creation
statusSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const Status = mongoose.model("Status", statusSchema);
export default Status;
