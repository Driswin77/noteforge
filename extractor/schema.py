from pydantic import BaseModel
from typing import List, Optional

class GlossaryTerm(BaseModel):
    term: str
    definition: str

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correctAnswer: str
    explanation: str

class Section(BaseModel):
    sectionTitle: str
    sourceSlides: List[int]
    summary: str
    notes: List[str]
    glossary: List[GlossaryTerm]
    quiz: List[QuizQuestion]

class NoteSetResponse(BaseModel):
    sections: List[Section]