import Image from "../models/Image.js";
import { writeLog } from "../utils/logger.js";

export async function uploadFiles(req, res) {
  const files = await Promise.all((req.files || []).map((file) => Image.create({
    originalName: file.originalname,
    filename: file.filename,
    url: `/uploads/${file.filename}`,
    mimeType: file.mimetype,
    size: file.size,
    kind: kindFor(file),
    uploadedBy: req.user._id
  })));
  await writeLog(req, "upload", "Image", undefined, { count: files.length });
  res.status(201).json({ files });
}

function kindFor(file) {
  if (file.mimetype.startsWith("image/")) return "image";
  if (file.mimetype === "application/pdf") return "pdf";
  if (file.mimetype.includes("zip")) return "zip";
  return "file";
}
