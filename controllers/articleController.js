import Article from "../models/Article.js";
import Category from "../models/Category.js";
import Image from "../models/Image.js";
import sanitizeHtml from "../utils/sanitizeHtml.js";
import { writeLog } from "../utils/logger.js";

const populate = [
  { path: "category", select: "name slug icon color" },
  { path: "images attachments", select: "originalName filename url mimeType kind size" },
  { path: "relatedArticles", select: "title slug shortDescription" }
];

export async function listArticles(req, res) {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 12, 50);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  else if (!req.user) filter.status = "published";
  if (req.query.difficulty) filter.difficulty = req.query.difficulty;
  if (req.query.category) {
    const categoryTerms = [{ name: req.query.category }, { slug: req.query.category }];
    if (req.query.category.match(/^[0-9a-fA-F]{24}$/)) categoryTerms.unshift({ _id: req.query.category });
    const category = await Category.findOne({ $or: categoryTerms });
    if (category) filter.category = category._id;
  }
  if (req.query.q) {
    filter.$or = [
      { title: { $regex: req.query.q, $options: "i" } },
      { tags: { $regex: req.query.q, $options: "i" } },
      { shortDescription: { $regex: req.query.q, $options: "i" } },
      { content: { $regex: req.query.q, $options: "i" } }
    ];
  }
  const [articles, total] = await Promise.all([
    Article.find(filter).populate(populate).sort({ isPinned: -1, updatedAt: -1 }).skip((page - 1) * limit).limit(limit),
    Article.countDocuments(filter)
  ]);
  res.json({ articles, page, total, totalPages: Math.max(Math.ceil(total / limit), 1) });
}

export async function getArticle(req, res) {
  const filter = req.params.id.match(/^[0-9a-fA-F]{24}$/) ? { _id: req.params.id } : { slug: req.params.id };
  const article = await Article.findOne(filter).populate(populate);
  if (!article) return res.status(404).json({ message: "Article not found" });
  if (article.status !== "published" && !req.user) return res.status(404).json({ message: "Article not found" });
  article.views += 1;
  await article.save();
  res.json({ article });
}

export async function createArticle(req, res) {
  const payload = normalizeArticle(req.body);
  payload.author = req.user._id;
  payload.updatedBy = req.user._id;
  const article = await Article.create(payload);
  await linkUploads(article);
  await writeLog(req, "create", "Article", article._id);
  res.status(201).json({ article: await article.populate(populate) });
}

export async function updateArticle(req, res) {
  const payload = normalizeArticle(req.body);
  payload.updatedBy = req.user._id;
  const article = await Article.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true }).populate(populate);
  if (!article) return res.status(404).json({ message: "Article not found" });
  await linkUploads(article);
  await writeLog(req, "update", "Article", article._id);
  res.json({ article });
}

export async function deleteArticle(req, res) {
  const article = await Article.findByIdAndDelete(req.params.id);
  if (!article) return res.status(404).json({ message: "Article not found" });
  await writeLog(req, "delete", "Article", article._id);
  res.json({ message: "Article deleted" });
}

export async function stats(_req, res) {
  const [totalArticles, draftArticles, publishedArticles, totalImages, mostViewed, latestArticles] = await Promise.all([
    Article.countDocuments(),
    Article.countDocuments({ status: "draft" }),
    Article.countDocuments({ status: "published" }),
    Image.countDocuments({ kind: "image" }),
    Article.findOne().sort({ views: -1 }).select("title views"),
    Article.find({ status: "published" }).sort({ createdAt: -1 }).limit(5).select("title createdAt")
  ]);
  const totalCategories = await Category.countDocuments();
  res.json({ totalArticles, draftArticles, publishedArticles, totalImages, totalCategories, mostViewed, latestArticles });
}

function normalizeArticle(body) {
  return {
    title: body.title,
    category: body.category,
    subCategory: body.subCategory,
    tags: Array.isArray(body.tags) ? body.tags : String(body.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean),
    difficulty: body.difficulty || "Beginner",
    shortDescription: body.shortDescription,
    content: sanitizeHtml(body.content || ""),
    images: body.images || [],
    attachments: body.attachments || [],
    videoLink: body.videoLink,
    importantNotes: body.importantNotes,
    commands: body.commands,
    codeBlock: body.codeBlock,
    relatedArticles: body.relatedArticles || [],
    status: body.status || "draft",
    isPinned: Boolean(body.isPinned)
  };
}

async function linkUploads(article) {
  const ids = [...(article.images || []), ...(article.attachments || [])];
  if (ids.length) await Image.updateMany({ _id: { $in: ids } }, { article: article._id });
}
