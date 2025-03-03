import os
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai
from PyPDF2 import PdfReader
from werkzeug.utils import secure_filename

# Load API key from .env
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Flask app setup
app = Flask(__name__)
CORS(app)  # Enable CORS for API requests
app.secret_key = "supersecretkey"  # For flash messages
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"pdf"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Ensure upload folder exists

# Function to check allowed file type
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# Function to extract text from PDF
def read_pdf(file_path):
    pdf_reader = PdfReader(file_path)
    pdf_text = "".join([page.extract_text() or "" for page in pdf_reader.pages])
    return pdf_text.strip()

# Function to get AI response from Gemini
def get_gemini_output(pdf_text, prompt):
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content([pdf_text, prompt])
    return response.text

@app.route("/", methods=["GET"])
def home():
    return render_template("index.html")

@app.route("/analyze", methods=["POST"])
def analyze_resume():
    # Check if request is from web or API
    is_api_request = request.headers.get('Content-Type', '').startswith('multipart/form-data') and \
                    not request.headers.get('Content-Type', '').startswith('multipart/form-data; boundary=----WebKitFormBoundary')
    
    if "resume" not in request.files:
        if is_api_request:
            return jsonify({"error": "No file uploaded"}), 400
        flash("No file uploaded!", "danger")
        return redirect(url_for("home"))

    uploaded_file = request.files["resume"]
    job_description = request.form.get("job_description", "").strip()
    analysis_option = request.form.get("analysis_option", "Quick Scan")

    if uploaded_file.filename == "" or not allowed_file(uploaded_file.filename):
        if is_api_request:
            return jsonify({"error": "Invalid file! Please upload a PDF."}), 400
        flash("Invalid file! Please upload a PDF.", "danger")
        return redirect(url_for("home"))

    # Securely save the uploaded file
    filename = secure_filename(uploaded_file.filename)
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    uploaded_file.save(file_path)

    # Extract text from the PDF
    pdf_text = read_pdf(file_path)
    
    # Define prompts for different analysis types
    if analysis_option == "Quick Scan":
        prompt = f"""
        You are ResumeChecker, an expert in resume analysis. Provide a quick scan of the following resume:
        - Identify the most suitable profession for this resume.
        - List 3 key strengths of the resume.
        - Suggest 2 quick improvements.
        - Give an overall ATS score out of 100.
        
        Resume: {pdf_text}
        Job Description (if provided): {job_description}
        """
    elif analysis_option == "Detailed Analysis":
        prompt = f"""
        You are ResumeChecker, an expert in resume analysis. Provide a detailed analysis of the following resume:
        - Identify the most suitable profession.
        - List 5 strengths of the resume.
        - Suggest 3-5 specific areas for improvement.
        - Rate the following aspects out of 10: Impact, Brevity, Style, Structure, Skills.
        - Provide a short review of each section (e.g., Summary, Experience, Education).
        - Give an ATS score out of 100 with reasoning.
        
        Resume: {pdf_text}
        Job Description: {job_description}
        """
    else:  # ATS Optimization
        prompt = f"""
        You are ResumeChecker, an expert in ATS optimization. Analyze the resume and provide improvements:
        - Identify missing keywords from the job description.
        - Suggest reformatting for better ATS readability.
        - Recommend keyword optimizations without stuffing.
        - Provide 3-5 suggestions to tailor the resume for the job.
        - Give an ATS compatibility score out of 100.
        
        Resume: {pdf_text}
        Job Description: {job_description}
        """

    try:
        # Get AI response
        response = get_gemini_output(pdf_text, prompt)
        
        # Clean up the file
        try:
            os.remove(file_path)
        except:
            pass
            
        # Return JSON response for API requests
        if is_api_request:
            return jsonify({"response": response})
        
        # Render template for web requests
        return render_template("result.html", response=response)
        
    except Exception as e:
        # Clean up the file in case of error
        try:
            os.remove(file_path)
        except:
            pass
            
        if is_api_request:
            return jsonify({"error": str(e)}), 500
            
        flash(f"Error analyzing resume: {str(e)}", "danger")
        return redirect(url_for("home"))

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)