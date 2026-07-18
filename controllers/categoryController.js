import Category from "../models/Category.js";
import { writeLog } from "../utils/logger.js";

export async function listCategories(_req, res) {
  const categories = await Category.find().sort({ sortOrder: 1, name: 1 });
  res.json({ categories });
}

export async function createCategory(req, res) {
  const category = await Category.create(req.body);
  await writeLog(req, "create", "Category", category._id);
  res.status(201).json({ category });
}

export async function updateCategory(req, res) {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) return res.status(404).json({ message: "Category not found" });
  await writeLog(req, "update", "Category", category._id);
  res.json({ category });
}

export async function deleteCategory(req, res) {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).json({ message: "Category not found" });
  await writeLog(req, "delete", "Category", category._id);
  res.json({ message: "Category deleted" });
}
