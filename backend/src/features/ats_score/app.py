import os
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai
from PyPDF2 import PdfReader
from typing import Optional

# Load API key from .env
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# FastAPI app setup
app = FastAPI(title="ATS Score Analyzer")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def read_pdf(file_path: str) -> str:
    pdf_reader = PdfReader(file_path)
    pdf_text = "".join([page.extract_text() or "" for page in pdf_reader.pages])
    return pdf_text.strip()

def get_gemini_output(pdf_text: str, prompt: str) -> str:
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content([pdf_text, prompt])
    return response.text

@app.post("/score")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: Optional[str] = Form(""),
    analysis_option: str = Form("Quick Scan")
):
    # Save uploaded file
    file_path = os.path.join(UPLOAD_FOLDER, resume.filename)
    with open(file_path, "wb") as f:
        f.write(await resume.read())
    
    # Extract text from PDF
    pdf_text = read_pdf(file_path)

    # Define analysis prompts
    analysis_prompts = {
        "Quick Scan": f"""
        Quickly analyze the resume:
        - Identify most suitable profession
        - List 3 key strengths
        - Suggest 2 quick improvements
        - Provide ATS score out of 100
        
        Resume: {pdf_text}
        Job Description: {job_description}
        """,
        "Detailed Analysis": f"""
        Provide comprehensive resume analysis:
        - Most suitable profession
        - 5 key strengths
        - 3-5 improvement suggestions
        - Detailed section ratings (Summary, Experience, Education)
        - ATS compatibility score
        
        Resume: {pdf_text}
        Job Description: {job_description}
        """,
        "ATS Optimization": f"""
        ATS optimization analysis:
        - Missing keywords
        - ATS-friendly formatting tips
        - Keyword optimization suggestions
        - Job-specific recommendations
        - Detailed ATS compatibility score
        
        Resume: {pdf_text}
        Job Description: {job_description}
        """
    }

    # Get AI response
    prompt = analysis_prompts.get(analysis_option, analysis_prompts["Quick Scan"])
    response = get_gemini_output(pdf_text, prompt)

    # Clean up file
    os.unlink(file_path)

    return JSONResponse(content={"response": response})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)