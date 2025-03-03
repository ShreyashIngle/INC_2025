import os
from fastapi import FastAPI, File, UploadFile, Form, Depends, HTTPException
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import google.generativeai as genai
from PyPDF2 import PdfReader
from werkzeug.utils import secure_filename
from typing import Optional

# Load API key from .env
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# FastAPI app setup
app = FastAPI()
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

@app.post("/analyze")
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
    return JSONResponse(content={"response": response})

# Serve static files for a frontend (if needed)
app.mount("/static", StaticFiles(directory="static"), name="static")
