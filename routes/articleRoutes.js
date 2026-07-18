import { Router } from "express";
import { body } from "express-validator";
import { createArticle, deleteArticle, getArticle, listArticles, stats, updateArticle } from "../controllers/articleController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.get("/", listArticles);
router.get("/stats/overview", stats);
router.get("/:id", optionalAuth, getArticle);
router.post("/", protect, adminOnly, articleRules(), validate, createArticle);
router.put("/:id", protect, adminOnly, articleRules(), validate, updateArticle);
router.delete("/:id", protect, adminOnly, deleteArticle);

function articleRules() {
  return [
    body("title").trim().isLength({ min: 3 }),
    body("category").isMongoId(),
    body("difficulty").optional().isIn(["Beginner", "Intermediate", "Advanced"]),
    body("status").optional().isIn(["draft", "published"])
  ];
}

async function optionalAuth(req, _res, next) {
  if (!req.headers.authorization) return next();
  const { protect } = await import("../middleware/authMiddleware.js");
  return protect(req, _res, next);
}

export default router;
