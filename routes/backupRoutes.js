import { Router } from "express";
import { backup, restore } from "../controllers/backupController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, adminOnly, backup);
router.post("/restore", protect, adminOnly, restore);

export default router;
