import path from "node:path";
import multer from "multer";
import { Router } from "express";
import { uploadFiles } from "../controllers/uploadController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = Router();
const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf", "application/zip", "application/x-zip-compressed"]);
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    cb(null, `${Date.now()}-${base}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: (Number(process.env.MAX_FILE_SIZE_MB) || 15) * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowed.has(file.mimetype)) return cb(new Error("Unsupported file type"));
    cb(null, true);
  }
});

router.post("/", protect, adminOnly, upload.array("files", 12), uploadFiles);

export default router;
