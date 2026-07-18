import Article from "../models/Article.js";
import Category from "../models/Category.js";
import Favorite from "../models/Favorite.js";
import Image from "../models/Image.js";
import Log from "../models/Log.js";
import User from "../models/User.js";
import { writeLog } from "../utils/logger.js";

export async function backup(req, res) {
  const [users, categories, articles, images, favorites, logs] = await Promise.all([
    User.find().select("-password"),
    Category.find(),
    Article.find(),
    Image.find(),
    Favorite.find(),
    Log.find().sort({ createdAt: -1 }).limit(500)
  ]);
  await writeLog(req, "backup", "Database");
  res.json({ exportedAt: new Date().toISOString(), users, categories, articles, images, favorites, logs });
}

export async function restore(req, res) {
  const { categories = [], articles = [] } = req.body;
  if (!Array.isArray(categories) || !Array.isArray(articles)) return res.status(400).json({ message: "Invalid backup payload" });
  await Category.deleteMany({});
  await Article.deleteMany({});
  if (categories.length) await Category.insertMany(categories.map(stripMongoMeta), { ordered: false });
  if (articles.length) await Article.insertMany(articles.map(stripMongoMeta), { ordered: false });
  await writeLog(req, "restore", "Database");
  res.json({ message: "Restore completed", categories: categories.length, articles: articles.length });
}

function stripMongoMeta(item) {
  const { __v, createdAt, updatedAt, ...clean } = item;
  return clean;
}
