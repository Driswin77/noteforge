import { spawn } from "child_process";
import path from "path";
import NoteSet from "../models/NoteSet.js";

export const uploadNoteSet = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = req.file.path;
  const subject = req.body.subject || "Untitled";

  try {
    // Create the NoteSet record first, in "processing" state
    const noteSet = await NoteSet.create({
      subject,
      originalFilename: req.file.originalname,
      status: "processing"
    });

        // Call the Python extractor
    const extractorPath = path.join(process.cwd(), "..", "extractor", "extract.py");
    console.log("Extractor path:", extractorPath);
    console.log("File path:", filePath);

    const pythonExecutable = process.env.PYTHON_PATH || path.join(process.cwd(), "..", "extractor", "venv", "Scripts", "python.exe");
const pythonProcess = spawn(pythonExecutable, [extractorPath, filePath]);

    let outputData = "";
    let errorData = "";

    pythonProcess.stdout.on("data", (data) => {
      outputData += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorData += data.toString();
    });

    pythonProcess.on("error", (err) => {
      console.error("Failed to start Python process:", err);
    });

    pythonProcess.on("close", async (code) => {
      console.log("Python process exited with code:", code);
      console.log("stdout:", outputData);
      console.log("stderr:", errorData);
      if (code !== 0) {
        console.error("Extractor failed:", errorData);
        noteSet.status = "failed";
        await noteSet.save();
        return res.status(500).json({ error: "Extraction failed", details: errorData });
      }

      try {
        const result = JSON.parse(outputData);

        if (result.error) {
          noteSet.status = "failed";
          await noteSet.save();
          return res.status(500).json({ error: result.error });
        }

                noteSet.rawSlides = result.slides.map(slide => ({
          slideNumber: slide.slide_number,
          text: slide.text
        }));
        await noteSet.save();

        // Now call the LLM to generate structured notes
        const llmScriptPath = path.join(process.cwd(), "..", "extractor", "generate_notes.py");
        const llmProcess = spawn(pythonExecutable, [llmScriptPath]);

        let llmOutput = "";
        let llmError = "";

        llmProcess.stdout.on("data", (data) => {
          llmOutput += data.toString();
        });

        llmProcess.stderr.on("data", (data) => {
          llmError += data.toString();
        });

        // Send the rawSlides to the LLM script via stdin
        llmProcess.stdin.write(JSON.stringify(noteSet.rawSlides));
        llmProcess.stdin.end();

        llmProcess.on("close", async (llmCode) => {
          if (llmCode !== 0) {
            console.error("LLM generation failed:", llmError);
            noteSet.status = "failed";
            await noteSet.save();
            return res.status(500).json({ error: "LLM generation failed", details: llmError });
          }

          try {
            const llmResult = JSON.parse(llmOutput);

            if (llmResult.error) {
              noteSet.status = "failed";
              await noteSet.save();
              return res.status(500).json({ error: llmResult.error });
            }

            noteSet.sections = llmResult.sections;
            noteSet.status = "completed";
            await noteSet.save();

            res.status(201).json({
              message: "File processed successfully",
              noteSetId: noteSet._id,
              totalSlides: result.total_slides,
              totalSections: llmResult.sections.length
            });
          } catch (parseErr) {
            console.error("Failed to parse LLM output:", parseErr);
            noteSet.status = "failed";
            await noteSet.save();
            res.status(500).json({ error: "Failed to parse LLM result" });
          }
        });
        
      } catch (parseErr) {
        console.error("Failed to parse extractor output:", parseErr);
        noteSet.status = "failed";
        await noteSet.save();
        res.status(500).json({ error: "Failed to parse extraction result" });
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};