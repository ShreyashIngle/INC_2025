import os
import logging
import yaml
import fitz  # PyMuPDF
import pandas as pd
import re
import json
import google.generativeai as genai
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# FastAPI App Setup
app = FastAPI(title="Resume Analyzer")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def load_config(config_path: str = 'config.yaml') -> dict:
    try:
        with open(config_path, 'r') as file:
            return yaml.safe_load(file)
    except FileNotFoundError:
        logger.warning(f"Configuration file not found: {config_path}")
        return {"MODEL": "gemini-pro"}
    except yaml.YAMLError as e:
        logger.error(f"YAML configuration error: {e}")
        return {"MODEL": "gemini-pro"}

def extract_pdf_text(file_path: str) -> str:
    try:
        doc = fitz.open(file_path)
        text = " ".join(page.get_text() for page in doc)
        doc.close()
        return text
    except Exception as e:
        logger.error(f"PDF extraction error: {e}")
        return ""

def parse_resume(text: str, config: dict) -> dict:
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = """
        Analyze this resume text and extract:
        1. Skills: Technical, soft skills, domain knowledge
        2. Experience: Areas and domains
        3. Academic Details: Degree, institution, graduation year
        
        Return as JSON with keys: skills, experience_domains, academic_details
        """
        
        response = model.generate_content([prompt, text], 
                                          generation_config={'temperature': 0.2})
        
        if response.text:
            try:
                # Clean JSON response
                cleaned_text = re.sub(r"```json\n(.*?)\n```", r"\1", response.text, flags=re.DOTALL)
                return json.loads(cleaned_text)
            except json.JSONDecodeError:
                logger.error(f"JSON decode error: {response.text}")
                return {"skills": [], "experience_domains": [], "academic_details": {}}
        return {"skills": [], "experience_domains": [], "academic_details": {}}
    except Exception as e:
        logger.error(f"Resume parsing error: {e}")
        return {"skills": [], "experience_domains": [], "academic_details": {}}

@app.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    company: Optional[str] = Form(None),
    cgpa: Optional[str] = Form(None),
    hsc: Optional[str] = Form(None),
    ssc: Optional[str] = Form(None),
    branch: Optional[str] = Form(None)
):
    try:
        # Save uploaded file
        file_path = os.path.join(UPLOAD_FOLDER, resume.filename)
        with open(file_path, "wb") as f:
            f.write(await resume.read())
        
        # Extract text from PDF
        cv_text = extract_pdf_text(file_path)
        
        # Load configuration
        config = load_config()
        
        # Parse resume
        extracted_data = parse_resume(cv_text, config)
        
        # Clean up file
        os.unlink(file_path)
        
        return JSONResponse(content={
            "success": True,
            "skills": extracted_data.get("skills", []),
            "experience_domains": extracted_data.get("experience_domains", []),
            "academic_details": extracted_data.get("academic_details", {})
        })
    
    except Exception as e:
        logger.error(f"Resume processing error: {e}")
        return JSONResponse(
            status_code=500, 
            content={"error": str(e)}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)