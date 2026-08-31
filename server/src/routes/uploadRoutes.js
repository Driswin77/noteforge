import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadNoteSet } from "../controllers/uploadController.js";

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = [".pdf", ".pptx"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and PPTX files are allowed"));
  }
};

const upload = multer({ storage, fileFilter });

router.post("/upload", upload.single("file"), uploadNoteSet);

export default router;