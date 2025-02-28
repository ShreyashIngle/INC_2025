import os
import json
import logging
import yaml
import fitz  # PyMuPDF
import pandas as pd
import re
import nltk
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from werkzeug.utils import secure_filename
import google.generativeai as genai
from typing import List, Dict

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Download NLTK data if not already present
try:
    nltk.data.find("tokenizers/punkt")
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find("corpora/stopwords")
except LookupError:
    nltk.download('stopwords')

# Load Configuration
def load_config(config_path: str = 'config.yaml') -> Dict:
    try:
        with open(config_path, 'r') as file:
            return yaml.safe_load(file)
    except FileNotFoundError as e:
        logger.error(f"Configuration file not found: {e}")
        raise
    except yaml.YAMLError as e:
        logger.error(f"YAML configuration error: {e}")
        raise

# Configure Gemini API
def configure_gemini_api(config: Dict) -> None:
    api_key = config.get('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("Missing Gemini API key")
    genai.configure(api_key=api_key)

# PDF text extraction using PyMuPDF
def extract_pdf_text(file_path: str) -> str:
    try:
        doc = fitz.open(file_path)
        text = " ".join(page.get_text() for page in doc)
        doc.close()
        return text
    except Exception as e:
        logger.error(f"PDF extraction error: {e}")
        return None

# Extract skills using Gemini API
def parse_resume(text: str, config: Dict) -> List[str]:
    try:
        model_name = config.get('MODEL', 'gemini-pro')
        model = genai.GenerativeModel(model_name)
        prompt = """
        Extract skills from this resume, focusing on skills relevant for job applications.
        Return the skills as a valid JSON array of strings.

        Example:
        {
            "skills": ["Python", "Machine Learning", "SQL", "Communication", "Teamwork"]
        }
        """
        response = model.generate_content([prompt, text],
                                          generation_config={'temperature': 0.2, 'max_output_tokens': 2000})
        if response.text:
            try:
                # Remove Markdown code block formatting if present
                cleaned_text = re.sub(r"```json\n(.*?)\n```", r"\1", response.text, flags=re.DOTALL)
                extracted_data = json.loads(cleaned_text)
                return extracted_data.get("skills", [])
            except json.JSONDecodeError:
                logger.error(f"JSON decode error: {response.text}")
                return []
        else:
            return []
    except Exception as e:
        logger.error(f"Resume parsing error: {e}")
        return []

# Check missing skills against required ones
def check_skills_match(candidate_skills: List[str], required_skills: str) -> List[str]:
    if not required_skills:
        return []
    required_skills_list = [skill.strip().lower() for skill in required_skills.split(',')]
    candidate_skills_lower = [skill.lower() for skill in candidate_skills]
    return [skill for skill in required_skills_list if skill not in candidate_skills_lower]

# Create uploads folder if it doesn't exist
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load configuration and set up Gemini API
try:
    config = load_config()
    configure_gemini_api(config)
except Exception as e:
    logger.critical(f"Failed to start due to configuration error: {e}")
    raise

# Load company data from CSV
try:
    df = pd.read_csv("company_data.csv")
    company_names = df["Company Name"].dropna().unique().tolist()
except FileNotFoundError:
    logger.error("company_data.csv not found.")
    df = pd.DataFrame()
    company_names = []
except Exception as e:
    logger.error(f"Error loading company data: {e}")
    df = pd.DataFrame()
    company_names = []

# Create FastAPI app and template configuration
app = FastAPI()
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "company_names": company_names})

@app.post("/process")
async def process_resume(company: str = Form(...), cv: UploadFile = File(...)):
    try:
        # Validate file upload
        if not cv or cv.filename == '':
            raise HTTPException(status_code=400, detail="No CV file uploaded.")
        
        filename = secure_filename(cv.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        
        # Save the uploaded file
        with open(file_path, "wb") as f:
            content = await cv.read()
            f.write(content)
        
        # Extract text from PDF
        cv_text = extract_pdf_text(file_path)
        if not cv_text:
            raise HTTPException(status_code=500, detail="Failed to extract text from CV.")
        
        # Parse resume to extract skills
        extracted_skills = parse_resume(cv_text, config)
        logger.info(f"Extracted skills from CV: {extracted_skills}")
        
        if company not in company_names:
            raise HTTPException(status_code=404, detail="Company not found.")
        
        company_row = df[df["Company Name"] == company]
        if company_row.empty:
            raise HTTPException(status_code=404, detail="Company data not found.")
        
        # Get required skills from the company row if available
        required_skills = company_row["Skills Required"].iloc[0] if "Skills Required" in company_row.columns else ""
        missing_skills = check_skills_match(extracted_skills, required_skills)
        
        return {
            "eligibility": "Eligible",
            "skills": extracted_skills,
            "missing_skills": missing_skills,
        }
    except HTTPException as http_exc:
        # Re-raise HTTP exceptions directly
        raise http_exc
    except Exception as e:
        logger.error(f"Processing error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
