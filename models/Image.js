import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  originalName: String,
  filename: String,
  url: String,
  mimeType: String,
  size: Number,
  kind: { type: String, enum: ["image", "pdf", "zip", "file"], default: "file" },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  article: { type: mongoose.Schema.Types.ObjectId, ref: "Article" }
}, { timestamps: true });

export default mongoose.model("Image", imageSchema);
