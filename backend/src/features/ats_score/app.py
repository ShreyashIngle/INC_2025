import os
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import google.generativeai as genai
from PyPDF2 import PdfReader
from werkzeug.utils import secure_filename
from typing import Optional

# Load API key from .env
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# FastAPI app setup
app = FastAPI(title="Resume ATS Score Analyzer")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure upload folder
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"pdf"}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Ensure upload folder exists

# Function to check allowed file type
def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# Function to extract text from PDF
def read_pdf(file_path: str) -> str:
    pdf_reader = PdfReader(file_path)
    pdf_text = "".join([page.extract_text() or "" for page in pdf_reader.pages])
    return pdf_text.strip()

# Function to get AI response from Gemini
def get_gemini_output(pdf_text: str, prompt: str) -> str:
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content([pdf_text, prompt])
    return response.text

@app.post("/ats_analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: Optional[str] = Form(""),
    analysis_option: str = Form(...),
):
    if not allowed_file(resume.filename):
        raise HTTPException(status_code=400, detail="Invalid file! Please upload a PDF.")
    
    # Securely save the uploaded file
    filename = secure_filename(resume.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    with open(file_path, "wb") as f:
        f.write(await resume.read())
    
    # Extract text from the PDF
    pdf_text = read_pdf(file_path)

    # Define prompts for different analysis types
    if analysis_option == "Quick Scan":
        prompt = f"""
        You are ResumeChecker, an expert in resume analysis. Provide a quick scan:
        - Identify the most suitable profession.
        - List 3 key strengths.
        - Suggest 2 quick improvements.
        - Give an overall ATS score out of 100.
        
        Resume: {pdf_text}
        Job Description: {job_description}
        """
    elif analysis_option == "Detailed Analysis":
        prompt = f"""
        You are ResumeChecker, an expert in resume analysis. Provide a detailed analysis:
        - Identify the most suitable profession.
        - List 5 strengths.
        - Suggest 3-5 improvements.
        - Rate: Impact, Brevity, Style, Structure, Skills (out of 10).
        - Review each section (Summary, Experience, Education).
        - ATS score out of 100 with reasoning.
        
        Resume: {pdf_text}
        Job Description: {job_description}
        """
    else:  # ATS Optimization
        prompt = f"""
        You are ResumeChecker, an expert in ATS optimization. Analyze the resume:
        - Identify missing keywords.
        - Suggest ATS-friendly formatting.
        - Recommend keyword optimizations.
        - Provide 3-5 job-specific suggestions.
        - ATS compatibility score out of 100.
        
        Resume: {pdf_text}
        Job Description: {job_description}
        """
    
    # Get AI response
    response = get_gemini_output(pdf_text, prompt)
    
    # Clean up file after processing
    os.unlink(file_path)
    
    return JSONResponse(content={"response": response})

@app.post("/score")
async def score_resume(
    resume: UploadFile = File(...),
    job_description: Optional[str] = Form(""),
    analysis_option: str = Form("Quick Scan")
):
    if not allowed_file(resume.filename):
        raise HTTPException(status_code=400, detail="Invalid file! Please upload a PDF.")
    
    # Securely save the uploaded file
    filename = secure_filename(resume.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
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

# Serve static files for a frontend (if needed)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    return {"message": "Resume Analyzer API is running. Use /analyze or /score endpoints to analyze resumes."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)