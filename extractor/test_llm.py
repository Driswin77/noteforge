import os
import sys
import json
from dotenv import load_dotenv
from google import genai
from schema import NoteSetResponse

load_dotenv()

PROMPT_TEMPLATE = """You are an expert academic note-taker. You will be given raw text extracted from lecture slides, broken into numbered slides. Your job is to restructure this content into organized study notes.

Instructions:
1. Group the slides into logical sections based on topic shifts — not necessarily one section per slide. Let the number of sections be determined naturally by content density.
2. For each section, provide a clear sectionTitle, the sourceSlides it draws from, a 2-3 sentence summary, and notes.
3. CRITICAL: notes must be written in your own words, as if explaining the concept to a student who has never seen these slides. Do NOT reuse the original sentence structure or copy phrases verbatim from the source text — synthesize and simplify instead. A good test: if a note reads almost identically to the source text, rewrite it.
4. Pick out any notable glossary terms with short, plain-language definitions.
5. Write exactly 5 multiple-choice quiz questions per section with 4 options each, the correct answer, and an explanation written in your own words — do not quote the source text directly in explanations, describe the underlying concept instead.

Here is the slide content:
{slide_text}
"""

def build_slide_text(slides):
    lines = []
    for slide in slides:
        lines.append(f"--- Slide {slide['slide_number']} ---")
        lines.append(slide['text'])
    return "\n".join(lines)

def main():
    if len(sys.argv) < 2:
        print("Usage: python test_llm.py <path_to_extracted_json>")
        sys.exit(1)

    json_path = sys.argv[1]
    with open(json_path, "r", encoding="utf-8") as f:
        extracted = json.load(f)

    slide_text = build_slide_text(extracted["slides"])
    prompt = PROMPT_TEMPLATE.format(slide_text=slide_text)

    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": NoteSetResponse,
        },
    )

    result = json.loads(response.text)

    with open("llm_output.json", "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)

    print(f"Generated {len(result['sections'])} sections. Saved to llm_output.json")

if __name__ == "__main__":
    main()