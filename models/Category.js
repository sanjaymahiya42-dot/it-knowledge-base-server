import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, unique: true, index: true },
  description: String,
  icon: { type: String, default: "fa-book" },
  color: { type: String, default: "#2563eb" },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

categorySchema.pre("save", function setSlug(next) {
  if (!this.slug || this.isModified("name")) this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

export default mongoose.model("Category", categorySchema);
