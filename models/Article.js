import mongoose from "mongoose";
import slugify from "slugify";

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, index: "text" },
  slug: { type: String, unique: true, index: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  subCategory: { type: String, trim: true },
  tags: [{ type: String, trim: true, index: true }],
  difficulty: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
  shortDescription: { type: String, trim: true, index: "text" },
  content: { type: String, default: "", index: "text" },
  images: [{ type: mongoose.Schema.Types.ObjectId, ref: "Image" }],
  attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Image" }],
  videoLink: String,
  importantNotes: String,
  commands: String,
  codeBlock: String,
  relatedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }],
  status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
  isPinned: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  publishedAt: Date,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

articleSchema.index({ title: "text", shortDescription: "text", content: "text", tags: "text" });

articleSchema.pre("save", function setSlugAndPublishedAt(next) {
  if (!this.slug || this.isModified("title")) this.slug = slugify(this.title, { lower: true, strict: true });
  if (this.status === "published" && !this.publishedAt) this.publishedAt = new Date();
  next();
});

export default mongoose.model("Article", articleSchema);
