import mongoose from "mongoose";

const glossarySchema = new mongoose.Schema({
  term: { type: String, required: true },
  definition: { type: String, required: true }
}, { _id: false });

const quizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: String, required: true },
  explanation: { type: String }
}, { _id: false });

const sectionSchema = new mongoose.Schema({
  sectionTitle: { type: String, required: true },
  sourceSlides: { type: [Number], default: [] },
  summary: { type: String },
  notes: { type: [String], default: [] },
  glossary: { type: [glossarySchema], default: [] },
  quiz: { type: [quizQuestionSchema], default: [] }
}, { _id: false });

const rawSlideSchema = new mongoose.Schema({
  slideNumber: { type: Number, required: true },
  text: { type: String, default: "" }
}, { _id: false });

const noteSetSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  originalFilename: { type: String, required: true },
  status: {
    type: String,
    enum: ["processing", "completed", "failed"],
    default: "processing"
  },
  rawSlides: { type: [rawSlideSchema], default: [] },
  sections: { type: [sectionSchema], default: [] }
}, { timestamps: true });

const NoteSet = mongoose.model("NoteSet", noteSetSchema);

export default NoteSet;