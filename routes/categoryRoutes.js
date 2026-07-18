import { Router } from "express";
import { body } from "express-validator";
import { createCategory, deleteCategory, listCategories, updateCategory } from "../controllers/categoryController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.get("/", listCategories);
router.post("/", protect, adminOnly, [
  body("name").trim().isLength({ min: 2 }),
  body("color").optional({ checkFalsy: true }).matches(/^#[0-9a-fA-F]{6}$/)
], validate, createCategory);
router.put("/:id", protect, adminOnly, updateCategory);
router.delete("/:id", protect, adminOnly, deleteCategory);

export default router;
