import { useState } from "react";
import UploadForm from "./components/UploadForm";
import NotesViewer from "./components/NotesViewer";

function App() {
  const [noteSetId, setNoteSetId] = useState(null);

  return (
    <div>
       <div className="topbar">
        <div className="topbar-brand"><span className="dot" />NoteForge</div> &nbsp;&nbsp;
      </div>
      {!noteSetId ? (
        <div className="hero">
          <div className="hero-eyebrow">Lecture slides → study notes</div>
          <h1 className="hero-title">Turn any deck into notes you'll actually use.</h1>
          <p className="hero-subtitle">Upload a PDF or PPTX. Get structured notes, a glossary, and a self-test quiz — organized by topic, not by slide.</p>
          <UploadForm onUploadComplete={setNoteSetId} />
        </div>
      ) : (
        <NotesViewer noteSetId={noteSetId} onReset={() => setNoteSetId(null)} />
      )}
    </div>
  );
}

export default App;