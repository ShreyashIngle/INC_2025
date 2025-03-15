from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, HTMLResponse
import json
import os
from openai import AzureOpenAI
from typing import Optional
from pydantic import BaseModel

# Initialize FastAPI app
app = FastAPI()

# Get the absolute path of the current script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Set the correct path for static files and topics JSON
STATIC_DIR = os.path.join(BASE_DIR, "static")
TOPICS_FILE_PATH = os.path.join(STATIC_DIR, "topics_and_subtopics.json")

# Configure templates and static files
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Configure OpenAI client for Azure
client = AzureOpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    api_version="2024-08-01-preview",
    azure_endpoint="https://imopenaiswedencentral.openai.azure.com/"
)

# Define a Pydantic model for the MCQ request


class MCQRequest(BaseModel):
    subject: str
    difficulty: str
    topic: Optional[str] = "NA"

# Ensure the static directory exists and create default topics if needed


@app.on_event("startup")
async def startup_event():
    os.makedirs(STATIC_DIR, exist_ok=True)

    if not os.path.exists(TOPICS_FILE_PATH):
        default_topics = {
            "OS": ["Process Management", "Memory Management", "File Systems", "Deadlocks", "Scheduling Algorithms"],
            "CN": ["Network Layers", "Routing Algorithms", "TCP/IP", "Network Security", "Wireless Networks"],
            "DBMS": ["Normalization", "SQL Queries", "Transaction Management", "Indexing", "ACID Properties"],
            "OOPS": ["Inheritance", "Polymorphism", "Encapsulation", "Abstraction", "Design Patterns"]
        }
        with open(TOPICS_FILE_PATH, 'w') as file:
            json.dump(default_topics, file, indent=4)

# Load topics and subtopics for the dropdown


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    if not os.path.exists(TOPICS_FILE_PATH):
        raise HTTPException(
            status_code=500, detail=f"File not found: {TOPICS_FILE_PATH}")

    with open(TOPICS_FILE_PATH, 'r') as file:
        topics_data = json.load(file)

    return templates.TemplateResponse("index.html", {"request": request, "topics_data": topics_data})


@app.post("/generate_mcq")
async def generate_mcq(request: Request, mcq_request: MCQRequest = None):
    if not os.path.exists(TOPICS_FILE_PATH):
        raise HTTPException(
            status_code=500, detail=f"File not found: {TOPICS_FILE_PATH}")

    if not mcq_request:
        form_data = await request.form()
        subject = form_data.get('subject')
        difficulty = form_data.get('difficulty')
        topic = form_data.get('topic', 'NA')
    else:
        subject = mcq_request.subject
        difficulty = mcq_request.difficulty
        topic = mcq_request.topic

    with open(TOPICS_FILE_PATH, 'r') as file:
        topics_and_subtopics = json.load(file)

    try:
        mcq_data = generate_mcqs_with_ai(
            subject, difficulty, topic, topics_and_subtopics)

        if isinstance(mcq_data, str):
            mcq_data = json.loads(mcq_data)

        return mcq_data
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500, detail="Failed to parse AI response")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def generate_mcqs_with_ai(subject, difficulty, topic, topics_and_subtopics):
    delimiter = "####"

    prompt = f"""
    You are an expert educational content creator specializing in Computer Science subjects. Your task is to generate high-quality technical questions based on user specifications.

    {delimiter}
    Context:
    You will receive three key inputs:
    1. Subject(```{subject}```) (One of: OS, CN, OOPS, DBMS)
    2. Difficulty Level(```{difficulty}```)(Easy, Medium, Hard)
    3. Topic(```{topic}```): Specific topics within the subject. This is an optional input. If the user inputs "NA","Na" OR "na" simply mix all the topics and create the questions. You can refer to all the available topic in ```{topics_and_subtopics}```.
    {delimiter}

    {delimiter}
    Question Distribution:
    - Generate exactly 15 questions total
    - Include exactly 6 numerical problem-solving questions per subject
    - Ensure even distribution across specified topics when multiple topics are provided
    {delimiter}

    {delimiter}
    Question Quality Requirements:
    1. Technical Accuracy:
       - Generate only factually correct questions based on established CS principles
       - Avoid any hallucinations or speculative content
       - Include only industry-standard, verified information

    2. Conceptual Testing:
       - Focus on testing deep understanding rather than memorization
       - Include questions that require problem-solving skills
       - Test application of concepts in practical scenarios
       - Incorporate questions that connect multiple related concepts

    3. Option Design Requirements:
       - Include plausible distractors that represent common misconceptions
       - Vary the length of correct answers (avoid making the longest option always correct)
       - Strategically include "All of the above" or "None of the above" options
       - Distribute correct answers evenly among A, B, C, and D (avoid answer bias)
       - Ensure options are mutually exclusive and collectively exhaustive

    4. Bias Prevention:
       - Use neutral language
       - Avoid culture-specific references
       - Ensure questions are accessible to all skill levels within the specified difficulty
       - Remove any gender, age, or geographic biases
       - Use inclusive technical scenarios
    {delimiter}

    {delimiter}
    Difficulty Calibration:
    1. Easy:
       - Basic concept application
       - Single-step problem solving
       - Direct recall and understanding

    2. Medium:
       - Multi-step problem solving
       - Concept integration
       - Practical application scenarios

    3. Hard:
       - Complex problem analysis
       - Multiple concept integration
       - Advanced application scenarios
       - Edge case considerations
    {delimiter}

    {delimiter}
    Output Format:
    Strictly adhere to this JSON format:
    {{
      "question": [
        {{
          "id": number,
          "subject": "string",
          "topic": "string",
          "difficulty": "string",
          "question_type": "multiple_choice",
          "question_text": "string",
          "options": [
            {{"key": "A", "text": "string"}},
            {{"key": "B", "text": "string"}},
            {{"key": "C", "text": "string"}},
            {{"key": "D", "text": "string"}}
          ],
          "correct_answer": "string",
          "explanation": "string",
          "status":"string"
        }}
      ]
    }}

    {delimiter}

    {delimiter}
    "status" should be set as "original" for all the questions.
    {delimiter}
    """

    response = client.chat.completions.create(
        model="GPT4OAISpeaking",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.0
    )

    content = response.choices[0].message.content

    try:
        token_dict = {
            'prompt_tokens': response.usage.prompt_tokens,
            'completion_tokens': response.usage.completion_tokens,
            'total_tokens': response.usage.total_tokens,
        }
        print(f"Prompt Cost: {token_dict}")
    except:
        print("Token usage information not available")

    return content


# Run the application
if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
