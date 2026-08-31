import { useState } from "react";
import axios from "axios";

function UploadForm({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Choose a PDF or PPTX file to continue.");
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("subject", subject || "Untitled");

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUploadComplete(response.data.noteSetId);
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed. Try again.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="upload-card loading-block">
        <div className="spinner" />
        <p><strong>Reading your slides and writing your notes.</strong></p>
        <p style={{ fontSize: "0.85rem" }}>Usually 30–90 seconds. Don't close this tab.</p>
      </div>
    );
  }

  return (
    <form className="upload-card" onSubmit={handleSubmit}>
      <label className="field-label">Subject</label>
      <input
        className="field-input"
        type="text"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="e.g. Digital Twins Seminar"
        style={{ marginBottom: "1.25rem" }}
      />

      <label className="field-label">Slides (PDF or PPTX)</label>
      <div className="file-drop">
        <input type="file" accept=".pdf,.pptx" onChange={(e) => setFile(e.target.files[0])} />
        {file && <p style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>{file.name}</p>}
      </div>

      {error && <p className="error-text">{error}</p>}

      <button className="btn-primary" type="submit">Generate Notes</button>
    </form>
  );
}

export default UploadForm;