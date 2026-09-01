import { useState, useEffect, useRef } from "react";
import axios from "axios";

function NotesViewer({ noteSetId, onReset }) {
  const [noteSet, setNoteSet] = useState(null);
  const [error, setError] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState({});
  const [activeSection, setActiveSection] = useState(0);
  const sectionRefs = useRef([]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/notesets/${noteSetId}`)
      .then((res) => setNoteSet(res.data))
      .catch((err) => setError(err.response?.data?.error || "Failed to load notes."));
  }, [noteSetId]);

  const handleAnswerSelect = (sectionIdx, questionIdx, option) => {
    setActiveQuiz((prev) => ({ ...prev, [`${sectionIdx}-${questionIdx}`]: option }));
  };

  const scoreForSection = (section, sIdx) => {
    let correct = 0, answered = 0;
    section.quiz.forEach((q, qIdx) => {
      const sel = activeQuiz[`${sIdx}-${qIdx}`];
      if (sel) {
        answered++;
        if (sel === q.correctAnswer) correct++;
      }
    });
    return { correct, answered, total: section.quiz.length };
  };

  const jumpTo = (idx) => {
    setActiveSection(idx);
    sectionRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDownload = () => window.print();

  if (error) return <p className="error-text" style={{ padding: "2rem" }}>{error}</p>;
  if (!noteSet) return <p className="loading-block">Loading notes…</p>;

  return (
    <>
      <div className="topbar">
        <div className="topbar-brand"><span className="dot" />NoteForge</div> &nbsp;&nbsp;
        <div className="topbar-actions">
          <button className="btn-secondary" onClick={handleDownload}>Download PDF</button>
          <button className="btn-secondary" onClick={onReset}>New upload</button>
        </div>
      </div>

      <div className="viewer-layout">
        <aside className="sidebar">
          <div className="sidebar-title">Sections</div>
          {noteSet.sections.map((section, sIdx) => {
            const score = scoreForSection(section, sIdx);
            const done = score.answered === score.total;
            return (
              <div
                key={sIdx}
                className={`sidebar-item ${activeSection === sIdx ? "active" : ""}`}
                onClick={() => jumpTo(sIdx)}
              >
                <span>{section.sectionTitle}</span>
                <span className={`sidebar-score ${done ? "done" : ""}`}>
                  {score.answered}/{score.total}
                </span>
              </div>
            );
          })}
        </aside>

        <div className="main-col">
          <div className="viewer-header">
            <h2>{noteSet.subject}</h2>
          </div>
          <div className="viewer-meta">{noteSet.originalFilename} · {noteSet.sections.length} sections</div>

          {noteSet.sections.map((section, sIdx) => (
            <div
              key={sIdx}
              className="section-card"
              ref={(el) => (sectionRefs.current[sIdx] = el)}
            >
              <div className="slide-tab">
                SLIDES {section.sourceSlides[0]}–{section.sourceSlides[section.sourceSlides.length - 1]}
              </div>
              <h3>{section.sectionTitle}</h3>
              <p className="section-summary">{section.summary}</p>

              <div className="block-label">Notes</div>
              <ul className="notes-list">
                {section.notes.map((note, i) => <li key={i}>{note}</li>)}
              </ul>

              {section.glossary?.length > 0 && (
                <>
                  <div className="block-label">Glossary</div>
                  <ul className="glossary-list">
                    {section.glossary.map((g, i) => (
                      <li key={i}><span className="glossary-term">{g.term}</span> — {g.definition}</li>
                    ))}
                  </ul>
                </>
              )}

              <div className="block-label">Quiz</div>
              {section.quiz.map((q, qIdx) => {
                const key = `${sIdx}-${qIdx}`;
                const selected = activeQuiz[key];
                return (
                  <div key={qIdx} className="quiz-question">
                    <p className="quiz-question-text">{qIdx + 1}. {q.question}</p>
                    {q.options.map((opt, oIdx) => {
                      let cls = "quiz-option";
                      if (selected) {
                        cls += " locked";
                        if (opt === q.correctAnswer) cls += " correct";
                        else if (opt === selected) cls += " incorrect";
                      }
                      return (
                        <div key={oIdx} className={cls} onClick={() => !selected && handleAnswerSelect(sIdx, qIdx, opt)}>
                          <span className="quiz-bubble" />
                          {opt}
                        </div>
                      );
                    })}
                    {selected && <p className="quiz-explanation">{q.explanation}</p>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default NotesViewer;