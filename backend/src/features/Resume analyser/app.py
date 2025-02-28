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

# Create Flask app
def create_app():
    app = Flask(__name__)
    app.config['UPLOAD_FOLDER'] = 'uploads'
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    try:
        config = load_config()
        configure_gemini_api(config)
    except Exception as e:
        logger.critical(f"Failed to start due to configuration error: {e}")
        raise  
    
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
    
    @app.route('/')
    def index():
        return render_template('index.html', company_names=company_names)
    
    @app.route("/process", methods=["POST"])
    def process_resume():
        try:
            company = request.form.get("company")
            cv = request.files.get("cv")
            
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

            required_skills = company_row["Skills Required"].iloc[0] if "Skills Required" in company_row else ""
            missing_skills = check_skills_match(extracted_skills, required_skills)

            return jsonify({
                "eligibility": "Eligible",
                "skills": extracted_skills,
                "missing_skills": missing_skills,
            })
        
        except Exception as e:
            logger.error(f"Processing error: {e}")
            return jsonify({"error": "Internal server error"}), 500
    
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(port=8000, debug=True)