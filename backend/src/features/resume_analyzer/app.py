import os
import logging
import yaml
import fitz  # PyMuPDF
import pandas as pd
import re
import json
import nltk
import google.generativeai as genai
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Dict, List
from dotenv import load_dotenv
from pydantic import BaseModel

# Load environment variables
load_dotenv()

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

# Configure Gemini API
def configure_gemini_api() -> None:
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("Missing Gemini API key")
    genai.configure(api_key=api_key)

# Initialize Gemini API
configure_gemini_api()

# FastAPI App Setup
app = FastAPI(title="Resume Analyzer", description="API for analyzing resumes and checking company eligibility")

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

# Pydantic model for manual eligibility check
class EligibilityRequest(BaseModel):
    company_name: str
    cgpa: float
    hsc: float
    ssc: float
    branch: str
    skills: List[str]

def load_config(config_path: str = 'config.yaml') -> dict:
    try:
        with open(config_path, 'r') as file:
            return yaml.safe_load(file)
    except FileNotFoundError:
        logger.warning(f"Configuration file not found: {config_path}")
        return {"MODEL": "gemini-1.5-flash"}
    except yaml.YAMLError as e:
        logger.error(f"YAML configuration error: {e}")
        return {"MODEL": "gemini-1.5-flash"}

# Load company data
def load_company_data(csv_path: str = 'company_data.csv') -> pd.DataFrame:
    try:
        return pd.read_csv(csv_path)
    except FileNotFoundError:
        logger.error(f"Company data file not found: {csv_path}")
        # Create an empty DataFrame with expected columns
        return pd.DataFrame(columns=["Company Name", "Skills Required", "CGPA", "HSC", "SSC", "Branch"])
    except Exception as e:
        logger.error(f"Error loading company data: {e}")
        return pd.DataFrame(columns=["Company Name", "Skills Required", "CGPA", "HSC", "SSC", "Branch"])

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
        model_name = config.get('MODEL', 'gemini-1.5-flash')
        model = genai.GenerativeModel(model_name)
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

# Check missing skills against required ones
def check_skills_match(candidate_skills: List[str], required_skills: str) -> List[str]:
    if not required_skills or pd.isna(required_skills):
        return []
    required_skills_list = [skill.strip().lower() for skill in required_skills.split(',')]
    candidate_skills_lower = [skill.lower() for skill in candidate_skills]
    return [skill for skill in required_skills_list if skill not in candidate_skills_lower]

# Check eligibility based on academic criteria
def check_eligibility(company_row, cgpa, hsc, ssc, branch):
    eligible = True
    reasons = []
    
    # Check CGPA
    if 'CGPA' in company_row and pd.notna(company_row['CGPA']) and float(company_row['CGPA']) > 0:
        if float(cgpa) < float(company_row['CGPA']):
            eligible = False
            reasons.append(f"CGPA requirement not met: {cgpa} < {company_row['CGPA']}")
    
    # Check HSC
    if 'HSC' in company_row and pd.notna(company_row['HSC']) and float(company_row['HSC']) > 0:
        if float(hsc) < float(company_row['HSC']):
            eligible = False
            reasons.append(f"12th percentage requirement not met: {hsc} < {company_row['HSC']}")
    
    # Check SSC
    if 'SSC' in company_row and pd.notna(company_row['SSC']) and float(company_row['SSC']) > 0:
        if float(ssc) < float(company_row['SSC']):
            eligible = False
            reasons.append(f"10th percentage requirement not met: {ssc} < {company_row['SSC']}")
    
    # Check Branch
    if 'Branch' in company_row and pd.notna(company_row['Branch']) and company_row['Branch']:
        eligible_branches = [b.strip() for b in str(company_row['Branch']).split(',')]
        if branch not in eligible_branches and eligible_branches != ['']:
            eligible = False
            reasons.append(f"Branch {branch} not in eligible branches: {', '.join(eligible_branches)}")
    
    return eligible, reasons

@app.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    company: Optional[str] = Form(None),
    cgpa: Optional[float] = Form(None),
    hsc: Optional[float] = Form(None),
    ssc: Optional[float] = Form(None),
    branch: Optional[str] = Form(None)
):
    try:
        # Save uploaded file
        file_path = os.path.join(UPLOAD_FOLDER, resume.filename)
        with open(file_path, "wb") as f:
            f.write(await resume.read())
        
        # Extract text from PDF
        cv_text = extract_pdf_text(file_path)
        if not cv_text:
            os.unlink(file_path)
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": "Failed to extract text from resume"}
            )
        
        # Load configuration
        config = load_config()
        
        # Parse resume
        extracted_data = parse_resume(cv_text, config)
        response_data = {
            "success": True,
            "skills": extracted_data.get("skills", []),
            "experience_domains": extracted_data.get("experience_domains", []),
            "academic_details": extracted_data.get("academic_details", {})
        }
        
        # If company is provided, check eligibility
        if company and cgpa is not None and hsc is not None and ssc is not None and branch:
            # Load company data
            df = load_company_data()
            
            # Check if company exists
            company_row = df[df["Company Name"] == company]
            if not company_row.empty:
                company_data = company_row.iloc[0].to_dict()
                
                # Check missing skills
                required_skills = company_data.get("Skills Required", "")
                missing_skills = check_skills_match(extracted_data.get("skills", []), required_skills)
                
                # Check eligibility based on academic criteria
                eligible, reasons = check_eligibility(company_data, cgpa, hsc, ssc, branch)
                
                # Add eligibility info to response
                response_data.update({
                    "eligibility": "Eligible" if eligible else "Not Eligible",
                    "missing_skills": missing_skills,
                    "reasons": reasons if not eligible else []
                })
        
        # Clean up file
        os.unlink(file_path)
        
        return JSONResponse(content=response_data)
    
    except Exception as e:
        logger.error(f"Resume processing error: {e}")
        # Clean up file if it exists
        if 'file_path' in locals() and os.path.exists(file_path):
            os.unlink(file_path)
        return JSONResponse(
            status_code=500, 
            content={"success": False, "error": str(e)}
        )

@app.post("/check_eligibility")
async def check_company_eligibility(request: EligibilityRequest):
    try:
        # Load company data
        df = load_company_data()
        
        # Check if company exists
        company_row = df[df["Company Name"] == request.company_name]
        if company_row.empty:
            return JSONResponse(
                status_code=404,
                content={"success": False, "error": "Company not found"}
            )
        
        company_data = company_row.iloc[0].to_dict()
        
        # Check missing skills
        required_skills = company_data.get("Skills Required", "")
        missing_skills = check_skills_match(request.skills, required_skills)
        
        # Check eligibility based on academic criteria
        eligible, reasons = check_eligibility(
            company_data, 
            request.cgpa, 
            request.hsc, 
            request.ssc, 
            request.branch
        )
        
        return JSONResponse(content={
            "success": True,
            "eligibility": "Eligible" if eligible else "Not Eligible",
            "missing_skills": missing_skills,
            "reasons": reasons if not eligible else []
        })
    
    except Exception as e:
        logger.error(f"Eligibility check error: {e}")
        return JSONResponse(
            status_code=500, 
            content={"success": False, "error": str(e)}
        )

@app.get("/companies")
async def get_companies():
    try:
        # Load company data
        df = load_company_data()
        
        # Return list of company names
        companies = df["Company Name"].tolist()
        return JSONResponse(content={"success": True, "companies": companies})
    
    except Exception as e:
        logger.error(f"Get companies error: {e}")
        return JSONResponse(
            status_code=500, 
            content={"success": False, "error": str(e)}
        )

@app.get("/company/{company_name}")
async def get_company_requirements(company_name: str):
    try:
        # Load company data
        df = load_company_data()
        
        # Check if company exists
        company_row = df[df["Company Name"] == company_name]
        if company_row.empty:
            return JSONResponse(
                status_code=404,
                content={"success": False, "error": "Company not found"}
            )
        
        company_data = company_row.iloc[0].to_dict()
        
        # Extract required skills as a list
        skills_required = []
        if "Skills Required" in company_data and pd.notna(company_data["Skills Required"]):
            skills_required = [skill.strip() for skill in company_data["Skills Required"].split(',')]
        
        # Extract eligible branches as a list
        eligible_branches = []
        if "Branch" in company_data and pd.notna(company_data["Branch"]):
            eligible_branches = [branch.strip() for branch in str(company_data["Branch"]).split(',')]
        
        # Prepare response
        requirements = {
            "company_name": company_name,
            "skills_required": skills_required,
            "cgpa": company_data.get("CGPA", 0) if pd.notna(company_data.get("CGPA", 0)) else 0,
            "hsc": company_data.get("HSC", 0) if pd.notna(company_data.get("HSC", 0)) else 0,
            "ssc": company_data.get("SSC", 0) if pd.notna(company_data.get("SSC", 0)) else 0,
            "eligible_branches": eligible_branches
        }
        
        return JSONResponse(content={"success": True, "requirements": requirements})
    
    except Exception as e:
        logger.error(f"Get company requirements error: {e}")
        return JSONResponse(
            status_code=500, 
            content={"success": False, "error": str(e)}
        )

@app.get("/")
async def root():
    return {"message": "Resume Analyzer API is running", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)