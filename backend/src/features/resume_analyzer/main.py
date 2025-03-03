import os
import json
import logging
import yaml
import fitz  # PyMuPDF
import pandas as pd
import re
import nltk
import argparse
from typing import List, Dict
import google.generativeai as genai
from dotenv import load_dotenv

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

# Load Configuration
def load_config(config_path: str = 'config.yaml') -> Dict:
    try:
        with open(config_path, 'r') as file:
            return yaml.safe_load(file)
    except FileNotFoundError as e:
        logger.error(f"Configuration file not found: {e}")
        # Return default configuration
        return {"MODEL": "gemini-pro"}
    except yaml.YAMLError as e:
        logger.error(f"YAML configuration error: {e}")
        return {"MODEL": "gemini-pro"}

# Configure Gemini API
def configure_gemini_api() -> None:
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("Missing Gemini API key")
    genai.configure(api_key=api_key)

# Load company data safely
def load_company_data(csv_path: str) -> pd.DataFrame:
    try:
        return pd.read_csv(csv_path)
    except FileNotFoundError:
        logger.error(f"Company data file not found: {csv_path}")
        # Create an empty DataFrame with expected columns
        return pd.DataFrame(columns=["Company Name", "Skills Required", "CGPA", "HSC", "SSC", "Branch"])
    except Exception as e:
        logger.error(f"Error loading company data: {e}")
        return pd.DataFrame(columns=["Company Name", "Skills Required", "CGPA", "HSC", "SSC", "Branch"])

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
        if branch not in eligible_branches:
            eligible = False
            reasons.append(f"Branch {branch} not in eligible branches: {', '.join(eligible_branches)}")
    
    return eligible, reasons

def process_resume(company_name, cv_path, cgpa, hsc, ssc, branch, config_path='config.yaml', csv_path='company_data.csv'):
    try:
        # Load configuration and set up Gemini API
        config = load_config(config_path)
        configure_gemini_api()
        
        # Load company data
        df = load_company_data(csv_path)
        
        # Check if company exists
        company_row = df[df["Company Name"] == company_name]
        if company_row.empty:
            return {"error": "Company not found."}
        
        company_data = company_row.iloc[0].to_dict()
        
        # Extract text from PDF
        cv_text = extract_pdf_text(cv_path)
        if not cv_text:
            return {"error": "Failed to extract text from CV."}
        
        # Parse resume to extract skills
        extracted_skills = parse_resume(cv_text, config)
        logger.info(f"Extracted skills from CV: {extracted_skills}")
        
        # Get required skills from the company row if available
        required_skills = company_data.get("Skills Required", "")
        missing_skills = check_skills_match(extracted_skills, required_skills)
        
        # Check eligibility based on academic criteria
        eligible, reasons = check_eligibility(company_data, cgpa, hsc, ssc, branch)
        
        result = {
            "eligibility": "Eligible" if eligible else "Not Eligible",
            "skills": extracted_skills,
            "missing_skills": missing_skills,
            "reasons": reasons if not eligible else []
        }
        
        return result
    except Exception as e:
        logger.error(f"Processing error: {e}")
        return {"error": f"Internal server error: {str(e)}"}

from fastapi import FastAPI

app = FastAPI()

@app.post("/process_resume")
def process_resume_endpoint(company: str, cv: str, cgpa: str, hsc: str, ssc: str, branch: str, config: str = 'config.yaml', company_data: str = 'company_data.csv'):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(script_dir, config)
    company_data_path = os.path.join(script_dir, company_data)
    result = process_resume(company, cv, cgpa, hsc, ssc, branch, config_path, company_data_path)
    return result

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Process resume for job application')
    parser.add_argument('--company', required=True, help='Company name')
    parser.add_argument('--cv', required=True, help='Path to CV file')
    parser.add_argument('--cgpa', required=True, help='CGPA')
    parser.add_argument('--hsc', required=True, help='12th percentage')
    parser.add_argument('--ssc', required=True, help='10th percentage')
    parser.add_argument('--branch', required=True, help='Branch')
    parser.add_argument('--config', default='config.yaml', help='Path to config file')
    parser.add_argument('--company_data', default='company_data.csv', help='Path to company data CSV')
    
    args = parser.parse_args()
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(script_dir, args.config)
    company_data_path = os.path.join(script_dir, args.company_data)
    
    result = process_resume(args.company, args.cv, args.cgpa, args.hsc, args.ssc, args.branch, 
                           config_path, company_data_path)
    print(json.dumps(result))