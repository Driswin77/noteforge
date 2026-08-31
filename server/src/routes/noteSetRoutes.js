import express from "express";
import NoteSet from "../models/NoteSet.js";

const router = express.Router();

router.get("/notesets/:id", async (req, res) => {
  try {
    const noteSet = await NoteSet.findById(req.params.id);
    if (!noteSet) {
      return res.status(404).json({ error: "NoteSet not found" });
    }
    res.json(noteSet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;