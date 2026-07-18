import { Router } from "express";
import { body } from "express-validator";
import { login, me, updateProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.post("/login", [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty()
], validate, login);

router.get("/me", protect, me);
router.put("/profile", protect, [
  body("name").optional().trim().isLength({ min: 2 }),
  body("password").optional({ checkFalsy: true }).isLength({ min: 8 }),
  body("accentColor").optional().matches(/^#[0-9a-fA-F]{6}$/)
], validate, updateProfile);

export default router;
