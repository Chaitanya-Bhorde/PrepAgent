import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Google Gemini API
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

app = FastAPI(title="PrepAgent AI Service", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str
    content: str
    sender: Optional[str] = None

class ChatRequest(BaseModel):
    agent_type: str  # 'dsa', 'system_design', 'hr'
    message: str
    chat_history: List[ChatMessage]
    current_code: Optional[str] = None
    language: Optional[str] = None
    problem_statement: Optional[str] = None

class HintRequest(BaseModel):
    problem_title: str
    problem_description: str
    current_code: str
    language: str
    hint_level: int  # 1, 2, or 3

class ResumeRequest(BaseModel):
    resume_text: str
    job_description: Optional[str] = None
    target_company: Optional[str] = "General"

@app.get("/api/ai/health")
def health_check():
    return {"status": "ok", "message": "FastAPI AI service is active"}

@app.post("/api/ai/chat")
async def chat_endpoint(req: ChatRequest):
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API Key is not configured on AI service.")

    try:
        # Determine agent instructions based on type
        if req.agent_type == "system_design":
            system_instruction = (
                "You are an expert System Design Interviewer panelist. Guide the user through "
                "scalability, functional/non-functional requirements, API design, database choice, "
                "load balancing, and bottlenecks. Point out flaws in their architecture, ask trade-offs, "
                "and keep responses concise and corporate."
            )
        elif req.agent_type == "hr":
            system_instruction = (
                "You are a professional HR Panelist. Ask behavioral and situational questions "
                "relevant to software engineering placements (e.g. conflict resolution, stress, achievements). "
                "Keep responses polite, evaluative, and conversational."
            )
        else:
            system_instruction = (
                "You are a technical DSA coding interviewer. Review the user's logic and code. "
                "Do NOT write full solution code. Guide them with questions, point out edge cases "
                "or efficiency bottlenecks, and keep responses concise."
            )

        # Build prompt using history
        prompt_parts = [system_instruction]
        if req.problem_statement:
            prompt_parts.append(f"Problem Statement:\n{req.problem_statement}")
        if req.current_code:
            prompt_parts.append(f"User's Current Code ({req.language}):\n{req.current_code}")

        prompt_parts.append("\nChat History:")
        for msg in req.chat_history:
            prompt_parts.append(f"{msg.role.capitalize()}: {msg.content}")

        prompt_parts.append(f"User: {req.message}")
        prompt_parts.append("Assistant:")

        prompt = "\n".join(prompt_parts)

        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)

        # Generate suggestions
        sug_prompt = f"Based on the last response: '{response.text}', write 3 short clickable options (one sentence each) that the user might reply with. Return them as a simple bulleted list."
        sug_response = model.generate_content(sug_prompt)
        suggestions = [s.strip("*- ").strip() for s in sug_response.text.split("\n") if s.strip()][:3]

        if not suggestions or len(suggestions) < 2:
            if req.agent_type == "dsa":
                suggestions = ["I have completed the code, can we run it?", "Can you explain this part again?", "How can I optimize this?"]
            elif req.agent_type == "system_design":
                suggestions = ["What database would you choose?", "Let's work on the API design.", "How can we scale this?"]
            else:
                suggestions = ["I handle stress by planning.", "I resolved conflict by talking.", "Thank you!"]

        return {
            "response": response.text,
            "sender": f"{req.agent_type}_interviewer",
            "suggestions": suggestions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/hints")
async def hints_endpoint(req: HintRequest):
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API Key is not configured.")

    try:
        level_instructions = {
            1: "Give a very tiny, subtle nudge or hint about edge cases or sorting without giving away the approach.",
            2: "Provide an approach hint. Suggest algorithms, techniques (e.g. sliding window, two-pointer, hashmap), but no code.",
            3: "Provide a detailed step-by-step pseudocode description of the algorithm. Do NOT write any actual code."
        }

        instruction = level_instructions.get(req.hint_level, level_instructions[1])
        prompt = (
            f"Problem: {req.problem_title}\nDescription: {req.problem_description}\n"
            f"User's Code ({req.language}):\n{req.current_code}\n\n"
            f"Instruction: {instruction}\nGenerate the hint."
        )

        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)

        return {"hint": response.text, "level": req.hint_level}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/resume")
async def resume_endpoint(req: ResumeRequest):
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API Key is not configured.")

    try:
        jd_text = req.job_description or "General Software Engineer role with React, Node.js, databases, and system design."
        prompt = (
            f"Analyze the following resume text against the target company '{req.target_company}' and job description:\n\n"
            f"Job Description:\n{jd_text}\n\nResume Text:\n{req.resume_text}\n\n"
            f"Please output a JSON object exactly with these fields:\n"
            f"- atsScore (integer 0-100)\n"
            f"- companyFit (string: 'Excellent', 'Good', 'Fair', or 'Needs Improvement')\n"
            f"- companyFeedback (brief overall fit description)\n"
            f"- matchedKeywords (array of strings of found skills/terms)\n"
            f"- missingKeywords (array of strings of keywords that should be added)\n"
            f"- improvementSuggestions (array of action items)\n"
            f"- keywordMatchScore (integer 0-100)\n"
            f"- formatScore (integer 0-100)\n"
            f"- sectionCompletenessScore (integer 0-100)\n"
            f"- actionVerbScore (integer 0-100)\n"
            f"- quantificationScore (integer 0-100)\n\n"
            f"Return ONLY valid JSON. No markdown backticks, no other text."
        )

        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)

        import json
        clean_text = response.text.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
        clean_text = clean_text.strip()

        data = json.loads(clean_text)
        return {"data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
