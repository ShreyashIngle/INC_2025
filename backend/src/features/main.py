import os
import sys
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Add the project root directory to Python path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, project_root)

# Correct import paths
from src.features.resume_analyzer.app import app as resume_analyzer_app
from src.features.ats_score.app import app as ats_score_app

# Initialize the main FastAPI app
app = FastAPI(
    title="Resume Analysis Platform",
    description="Comprehensive platform for resume analysis and ATS scoring",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:8000",
    "https://yourdomain.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount feature routes
app.mount("/resume", resume_analyzer_app)
app.mount("/ats", ats_score_app)

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "Welcome to Resume Analysis Platform",
        "features": [
            "/resume/analyze - Resume Analysis",
            "/ats/score - ATS Scoring"
        ]
    }

# Health check endpoint
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "services": {
            "resume_analyzer": "operational",
            "ats_score": "operational"
        }
    }

# Server configuration for direct running
if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000,
        reload=True
    )