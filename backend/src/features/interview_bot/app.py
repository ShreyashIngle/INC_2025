from fastapi import FastAPI, UploadFile, File, Form, WebSocket
from fastapi.responses import FileResponse,JSONResponse
import os
from pydantic import BaseModel
import json
import uuid
import cv2
import numpy as np
import base64

from src.features.interview_bot.models.interviewbot import InterviewBot, CandidateInfo

from src.features.interview_bot.models.face_mesh_detector import get_eye_contact_ratio
from src.features.interview_bot.models.emotion_recognition import get_facial_expression_score
from src.features.interview_bot.models.head_movement_tracker import detect_head_movement
from src.features.interview_bot.utils.confidence_calculator import calculate_confidence

app = FastAPI()
UPLOAD_DIR = "uploads"

interview_sessions = {}

class CandidateRequest(BaseModel):
    name: str
    education: str
    skills: str
    position: str
    experience: str
    projects: str

@app.post("/start_interview/")
def start_interview(candidate: CandidateRequest):
    candidate_info = CandidateInfo(**candidate.dict())
    bot = InterviewBot(candidate_info)
    session_id = str(uuid.uuid4())  
    interview_sessions[session_id] = bot
    response = bot.start_interview()
    return {
        "session_id": session_id,
        "question": response['question'],
        "difficulty_level": response['difficulty_level'],
        "audio_file_url": f"/download_audio/?file={response['audio_file']}"
    }


@app.post("/answer_question/")
def answer_question(session_id: str , text: str = Form(None),audio_file:UploadFile = File(None)):
    if session_id not in interview_sessions:
        return JSONResponse(content={"error": "Invalid session ID"}, status_code=400)

    
    if not audio_file and not text:
        return JSONResponse(content={"error": "No audio file or text provided"})
    if audio_file:
        audio_filename = audio_file.filename
    else:
        audio_filename = None
    bot = interview_sessions[session_id]
    response = bot.answerandquestion(audio_filename, text)

    return {
        "question": response["question"],
        "difficulty_level": response["difficulty_level"],
        "interview_done": response["interview_done"],
        "audio_file_url": f"/download_audio/?file={response['audio_file']}"
    }


@app.get("/download_audio/")
def download_audio(file: str):
    """ Serve the generated audio file """
    file_path = os.path.join(UPLOAD_DIR, os.path.basename(file))
    if not os.path.exists(file_path):
        return JSONResponse(content={"error": "File not found."}, status_code=404)
    return FileResponse(file_path, media_type="audio/wav", filename=os.path.basename(file))
@app.get("/get_results/")
def get_results(session_id: str):
    if session_id not in interview_sessions:
        return {"error": "Invalid or expired session ID."}
    
    bot = interview_sessions[session_id]
    return bot.exit_interview()

@app.websocket("/video_stream/")
async def video_stream(websocket: WebSocket):
    """ WebSocket connection to receive video frames from client """
    await websocket.accept()
    prev_frame = None
    confidence_scores = []

    try:
        while True:
            # Receive frame from WebSocket
            data = await websocket.receive_text()
            
            # If client sends "close", exit the loop
            if data == "close":
                print("Client requested to close the connection.")
                break

            # Parse frame data
            try:
                frame_data = json.loads(data)["frame"]
                frame_bytes = base64.b64decode(frame_data)
                frame_np = np.frombuffer(frame_bytes, dtype=np.uint8)
                frame = cv2.imdecode(frame_np, cv2.IMREAD_COLOR)
            except Exception as e:
                print(f"Error decoding frame: {e}")
                continue  # Skip this frame and wait for the next one

            # Process frame
            eye_contact = get_eye_contact_ratio(frame) or 5
            expression = get_facial_expression_score(frame) or 5
            head_movement_penalty = detect_head_movement(frame, prev_frame) if prev_frame is not None else 0
            prev_frame = frame.copy()

            # Compute confidence score and store it
            confidence_score = calculate_confidence(eye_contact, expression, head_movement_penalty)
            confidence_scores.append(confidence_score)

    except Exception as e:
        print(f"WebSocket error: {e}")

    finally:
        print("Closing WebSocket connection.")
        
        # Calculate average confidence score
        if confidence_scores:
            avg_confidence = sum(confidence_scores) / len(confidence_scores)
            final_feedback = get_suggestions(avg_confidence)
        else:
            avg_confidence = 0
            final_feedback = "No data available to provide feedback."

        # Send final feedback before closing
        await websocket.send_json({
            "average_confidence_score": avg_confidence,
            "final_suggestion": final_feedback
        })

        await websocket.close()

def get_suggestions(confidence):
    """ Provide feedback based on confidence score """
    if confidence >= 8:
        return "Great job! Maintain steady eye contact and a calm expression."
    elif confidence >= 5:
        return "Try improving eye contact and reducing head movements."
    else:
        return "Work on reducing nervous gestures and practicing relaxed facial expressions."

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
