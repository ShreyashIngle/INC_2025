import os
import json
import logging
import yaml
import fitz  # PyMuPDF
import pandas as pd
import re
import nltk
from flask import Flask, request, render_template, jsonify
from werkzeug.utils import secure_filename
import google.generativeai as genai
from typing import List, Dict
from dotenv import load_dotenv
load_dotenv()


# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Download NLTK data
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
        # Create a default configuration
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
def load_company_data(csv_path: str = 'company_data.csv') -> (pd.DataFrame, List[str]):
    try:
        df = pd.read_csv(csv_path)
        company_names = df["Company Name"].dropna().unique().tolist()
        return df, company_names
    except FileNotFoundError:
        logger.error(f"Company data file not found: {csv_path}")
        # Create an empty DataFrame with expected columns
        df = pd.DataFrame(columns=["Company Name", "Skills Required", "CGPA", "HSC", "SSC", "Branch"])
        return df, []
    except Exception as e:
        logger.error(f"Error loading company data: {e}")
        df = pd.DataFrame(columns=["Company Name", "Skills Required", "CGPA", "HSC", "SSC", "Branch"])
        return df, []

# PDF text extraction
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
                # Remove Markdown code block formatting
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

# Check missing skills
def check_skills_match(candidate_skills: List[str], required_skills: str) -> List[str]:
    if not required_skills:
        return []
    required_skills_list = [skill.strip().lower() for skill in required_skills.split(',')]
    candidate_skills_lower = [skill.lower() for skill in candidate_skills]
    return [skill for skill in required_skills_list if skill not in candidate_skills_lower]

# Check eligibility based on academic criteria
def check_eligibility(company_row, cgpa, hsc, ssc, branch):
    eligible = True
    reasons = []
    
    # Check CGPA
    if 'CGPA' in company_row and company_row['CGPA'] > 0:
        if float(cgpa) < company_row['CGPA']:
            eligible = False
            reasons.append(f"CGPA requirement not met: {cgpa} < {company_row['CGPA']}")
    
    # Check HSC
    if 'HSC' in company_row and company_row['HSC'] > 0:
        if float(hsc) < company_row['HSC']:
            eligible = False
            reasons.append(f"12th percentage requirement not met: {hsc} < {company_row['HSC']}")
    
    # Check SSC
    if 'SSC' in company_row and company_row['SSC'] > 0:
        if float(ssc) < company_row['SSC']:
            eligible = False
            reasons.append(f"10th percentage requirement not met: {ssc} < {company_row['SSC']}")
    
    # Check Branch
    if 'Branch' in company_row and company_row['Branch']:
        eligible_branches = [b.strip() for b in company_row['Branch'].split(',')]
        if branch not in eligible_branches:
            eligible = False
            reasons.append(f"Branch {branch} not in eligible branches: {', '.join(eligible_branches)}")
    
    return eligible, reasons

# Create Flask app
def create_app():
    app = Flask(__name__)
    app.config['UPLOAD_FOLDER'] = 'uploads'
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    try:
        config = load_config()
        configure_gemini_api()
    except Exception as e:
        logger.critical(f"Failed to start due to configuration error: {e}")
        raise  
    
    # Load company data
    df, company_names = load_company_data()
    
    @app.route('/')
    def index():
        return render_template('index.html', company_names=company_names)
    
    @app.route("/process", methods=["POST"])
    def process_resume():
        try:
            company = request.form.get("company")
            cv = request.files.get("cv")
            cgpa = request.form.get("cgpa", 0.0)
            hsc = request.form.get("hsc", 0.0)
            ssc = request.form.get("ssc", 0.0)
            branch = request.form.get("branch", "")
            
            if not cv or cv.filename == '':
                return jsonify({"error": "No CV file uploaded."}), 400
            
            filename = secure_filename(cv.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            cv.save(file_path)
            
            cv_text = extract_pdf_text(file_path)
            if not cv_text:
                return jsonify({"error": "Failed to extract text from CV."}), 500
            
            extracted_skills = parse_resume(cv_text, config)
            logger.info(f"Extracted skills from CV: {extracted_skills}")
            
            if company not in company_names:
                return jsonify({"error": "Company not found."}), 404

            company_row = df[df["Company Name"] == company]

            if company_row.empty:
                return jsonify({"error": "Company data not found."}), 404

            company_data = company_row.iloc[0].to_dict()
            
            required_skills = company_data.get("Skills Required", "")
            missing_skills = check_skills_match(extracted_skills, required_skills)
            
            # Check eligibility based on academic criteria if form fields are provided
            eligible, reasons = check_eligibility(company_data, cgpa, hsc, ssc, branch)

            return jsonify({
                "eligibility": "Eligible" if eligible else "Not Eligible",
                "skills": extracted_skills,
                "missing_skills": missing_skills,
                "reasons": reasons if not eligible else []
            })
        
        except Exception as e:
            logger.error(f"Processing error: {e}")
            return jsonify({"error": f"Internal server error: {str(e)}"}), 500
    
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(port=8000, debug=True)