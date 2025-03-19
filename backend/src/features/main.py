from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys

# Add the project root directory to Python path
project_root = os.path.abspath(os.path.join(
    os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, project_root)

# Initialize the main FastAPI app
app = FastAPI(
    title="Resume Analysis Platform",
    description="Comprehensive platform for resume analysis and ATS scoring",
    version="1.0.0"
)

# Configure CORS
origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set the working directory to 'backend'
# Get the directory of the script
script_dir = os.path.dirname(os.path.abspath(__file__))
print("Script Directory:", script_dir)

# Set the backend directory relative to the script location
backend_dir = os.path.join(script_dir, "..", "..", "..")

# Change the working directory
os.chdir(backend_dir)

# Verify the change
print("Current Working Directory:", os.getcwd())

from src.features.resume_analyzer.app import app as resume_analyzer_app
from src.features.ats_score.app import app as ats_score_app
from src.features.mcq.app import app as mcq_app
from src.features.attention_tracker.app import app as attention_tracker_app

# Mount feature routes with proper prefixes
app.mount("/api/ats", ats_score_app)
app.mount("/api/resume", resume_analyzer_app)
app.mount("/api/mcq", mcq_app)
app.mount("/api/attention", attention_tracker_app)

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "Welcome to Resume Analysis Platform",
        "features": [
            "/api/resume/analyze - Resume Analysis",
            "/api/ats/score - ATS Scoring",
            "/api/mcq - MCQ Generator",
            "/api/attention - Attention Tracking"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)