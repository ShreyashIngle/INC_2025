from fastapi import FastAPI, Response
from fastapi.responses import StreamingResponse
import cv2
import mediapipe as mp
import numpy as np
import time
from datetime import datetime
import os
import math
import asyncio
from typing import Generator
import threading

app = FastAPI()

# Create folders for logs and captures if they don't exist
if not os.path.exists("attention_captures"):
    os.makedirs("attention_captures")

# Initialize MediaPipe Face Mesh and Drawing utils
mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

# Face mesh with refined landmarks
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=False,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Log file
log_file = "log.txt"

# Constants for attention tracking
LEFT_EYE_INDICES = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]
RIGHT_EYE_INDICES = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]
LEFT_IRIS = [474, 475, 476, 477]
RIGHT_IRIS = [469, 470, 471, 472]
NOSE_TIP = 1
CHIN = 199
LEFT_EYE_LEFT = 33
RIGHT_EYE_RIGHT = 263
LEFT_MOUTH = 61
RIGHT_MOUTH = 291

# Utility functions (unchanged)
def distance(point1, point2):
    return math.sqrt((point2[0] - point1[0])**2 + (point2[1] - point1[1])**2)

def get_landmark_coords(landmarks, idx, img_width, img_height):
    lm = landmarks.landmark[idx]
    return (int(lm.x * img_width), int(lm.y * img_height))

def calculate_eye_aspect_ratio(landmarks, eye_indices, image_width, image_height):
    points = [get_landmark_coords(landmarks, idx, image_width, image_height) for idx in eye_indices]
    vertical_dist1 = distance(points[1], points[5])
    vertical_dist2 = distance(points[2], points[4])
    horizontal_dist = distance(points[0], points[8])
    return (vertical_dist1 + vertical_dist2) / (2.0 * horizontal_dist) if horizontal_dist != 0 else 0

def get_iris_position(landmarks, iris_indices, eye_left_idx, eye_right_idx, img_width, img_height):
    iris_x = sum(landmarks.landmark[idx].x for idx in iris_indices) / len(iris_indices)
    iris_y = sum(landmarks.landmark[idx].y for idx in iris_indices) / len(iris_indices)
    iris_center = (int(iris_x * img_width), int(iris_y * img_height))
    eye_left = get_landmark_coords(landmarks, eye_left_idx, img_width, img_height)
    eye_right = get_landmark_coords(landmarks, eye_right_idx, img_width, img_height)
    eye_width = distance(eye_left, eye_right)
    iris_to_left = distance(iris_center, eye_left)
    return iris_to_left / eye_width if eye_width != 0 else 0.5

def calculate_head_pose(landmarks, image_width, image_height):
    nose = get_landmark_coords(landmarks, NOSE_TIP, image_width, image_height)
    left_face = get_landmark_coords(landmarks, LEFT_EYE_LEFT, image_width, image_height)
    right_face = get_landmark_coords(landmarks, RIGHT_EYE_RIGHT, image_width, image_height)
    top_face = get_landmark_coords(landmarks, NOSE_TIP, image_width, image_height)
    bottom_face = get_landmark_coords(landmarks, CHIN, image_width, image_height)
    face_width = distance(left_face, right_face)
    nose_pos_ratio = distance(nose, left_face) / face_width if face_width > 0 else 0.5
    face_height = distance(top_face, bottom_face)
    vertical_ratio = distance(nose, top_face) / face_height if face_height > 0 else 0.5
    horizontal_threshold = 0.2
    is_facing_camera = (0.5 - horizontal_threshold) < nose_pos_ratio < (0.5 + horizontal_threshold)
    return is_facing_camera, nose_pos_ratio, vertical_ratio

def is_user_attentive(landmarks, image_width, image_height):
    left_ear = calculate_eye_aspect_ratio(landmarks, LEFT_EYE_INDICES, image_width, image_height)
    right_ear = calculate_eye_aspect_ratio(landmarks, RIGHT_EYE_INDICES, image_width, image_height)
    avg_ear = (left_ear + right_ear) / 2
    left_iris_pos = get_iris_position(landmarks, LEFT_IRIS, 362, 263, image_width, image_height)
    right_iris_pos = get_iris_position(landmarks, RIGHT_IRIS, 33, 133, image_width, image_height)
    avg_iris_pos = (left_iris_pos + right_iris_pos) / 2
    facing_camera, head_pos_ratio, vertical_ratio = calculate_head_pose(landmarks, image_width, image_height)
    
    eye_open_threshold = 0.15
    gaze_center_min = 0.25
    gaze_center_max = 0.75
    
    left_eye_center_y = sum(landmarks.landmark[idx].y for idx in LEFT_EYE_INDICES) / len(LEFT_EYE_INDICES)
    right_eye_center_y = sum(landmarks.landmark[idx].y for idx in RIGHT_EYE_INDICES) / len(RIGHT_EYE_INDICES)
    left_iris_y = sum(landmarks.landmark[idx].y for idx in LEFT_IRIS) / len(LEFT_IRIS)
    right_iris_y = sum(landmarks.landmark[idx].y for idx in RIGHT_IRIS) / len(RIGHT_IRIS)
    left_vertical_gaze = left_eye_center_y - left_iris_y
    right_vertical_gaze = right_eye_center_y - right_iris_y
    avg_vertical_gaze = (left_vertical_gaze + right_vertical_gaze) / 2
    vertical_gaze_ok = -0.02 < avg_vertical_gaze < 0.02
    
    eyes_open = avg_ear > eye_open_threshold
    gaze_center = gaze_center_min < avg_iris_pos < gaze_center_max
    
    debug_info = {
        "Eye Ratio": f"{avg_ear:.2f}",
        "Eye Open": "✓" if eyes_open else "✗",
        "Iris Position": f"{avg_iris_pos:.2f}",
        "Gaze Center": "✓" if gaze_center else "✗",
        "Head Position": f"{head_pos_ratio:.2f}",
        "Facing Camera": "✓" if facing_camera else "✗",
        "Vertical Gaze": f"{avg_vertical_gaze:.3f}"
    }
    
    is_attentive = eyes_open and (gaze_center or facing_camera)
    extreme_looking_away = avg_iris_pos < 0.15 or avg_iris_pos > 0.85
    if extreme_looking_away:
        is_attentive = False
        debug_info["Looking Far Away"] = "✓"
    else:
        debug_info["Looking Far Away"] = "✗"
    
    return is_attentive, debug_info

def draw_debug_info(frame, debug_info, y_start=120):
    y_pos = y_start
    for key, value in debug_info.items():
        text = f"{key}: {value}"
        cv2.putText(frame, text, (10, y_pos), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        y_pos += 20
    return frame

def draw_gaze_region(frame, width, height):
    frame_height, frame_width = frame.shape[:2]
    screen_left = int(frame_width * 0.25)
    screen_right = int(frame_width * 0.75)
    screen_top = int(frame_height * 0.25)
    screen_bottom = int(frame_height * 0.75)
    cv2.rectangle(frame, (screen_left, screen_top), (screen_right, screen_bottom), (0, 255, 255), 1)
    cv2.putText(frame, "Screen Area", (screen_left + 10, screen_top - 10), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1)
    return frame

# Global variables for tracking
session_active = False
cap = None

def process_frame(frame, face_landmarks, total_frames, attention_frames, attention_buffer, buffer_size, session_start_time, last_log_time):
    img_height, img_width = frame.shape[:2]
    attentive, debug_info = is_user_attentive(face_landmarks, img_width, img_height)
    
    total_frames += 1
    attention_buffer.append(1 if attentive else 0)
    if len(attention_buffer) > buffer_size:
        attention_buffer.pop(0)
    
    smoothed_attentive = sum(attention_buffer) > (buffer_size * 0.6)
    if smoothed_attentive:
        attention_frames += 1
    
    attention_score = (attention_frames / total_frames * 100) if total_frames > 0 else 0
    
    mp_drawing.draw_landmarks(
        image=frame,
        landmark_list=face_landmarks,
        connections=mp_face_mesh.FACEMESH_CONTOURS,
        landmark_drawing_spec=None,
        connection_drawing_spec=mp_drawing_styles.get_default_face_mesh_contours_style()
    )
    mp_drawing.draw_landmarks(
        image=frame,
        landmark_list=face_landmarks,
        connections=mp_face_mesh.FACEMESH_IRISES,
        landmark_drawing_spec=None,
        connection_drawing_spec=mp_drawing_styles.get_default_face_mesh_iris_connections_style()
    )
    
    left_iris_x = sum(face_landmarks.landmark[idx].x for idx in LEFT_IRIS) / len(LEFT_IRIS)
    left_iris_y = sum(face_landmarks.landmark[idx].y for idx in LEFT_IRIS) / len(LEFT_IRIS)
    right_iris_x = sum(face_landmarks.landmark[idx].x for idx in RIGHT_IRIS) / len(RIGHT_IRIS)
    right_iris_y = sum(face_landmarks.landmark[idx].y for idx in RIGHT_IRIS) / len(RIGHT_IRIS)
    
    iris_color = (0, 255, 0) if attentive else (0, 0, 255)
    cv2.circle(frame, (int(left_iris_x * img_width), int(left_iris_y * img_height)), 5, iris_color, -1)
    cv2.circle(frame, (int(right_iris_x * img_width), int(right_iris_y * img_height)), 5, iris_color, -1)
    
    status = "ATTENTIVE" if smoothed_attentive else "DISTRACTED"
    border_color = (0, 255, 0) if smoothed_attentive else (0, 0, 255)
    cv2.rectangle(frame, (0, 0), (img_width, img_height), border_color, 3)
    
    elapsed_time = time.time() - session_start_time
    cv2.putText(frame, f"Status: {status}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    cv2.putText(frame, f"Attention Score: {attention_score:.1f}%", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    cv2.putText(frame, f"Session Time: {int(elapsed_time)}s", (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    
    frame = draw_debug_info(frame, debug_info)
    
    current_time = time.time()
    if current_time - last_log_time > 10:  # Changed to 10 seconds
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(f"{timestamp} - Attention Score: {attention_score:.1f}% - {status}\n")
        capture_path = f"attention_captures/capture_{timestamp}.jpg"
        cv2.imwrite(capture_path, frame)
        last_log_time = current_time
    
    return frame, total_frames, attention_frames, attention_buffer, last_log_time

async def video_stream() -> Generator[bytes, None, None]:
    global session_active, cap
    
    if session_active:
        return
    
    session_active = True
    cap = cv2.VideoCapture(0)
    
    session_start_time = time.time()
    last_log_time = time.time()
    total_frames = 0
    attention_frames = 0
    attention_buffer = []
    buffer_size = 10
    
    try:
        while session_active and cap.isOpened():
            success, frame = cap.read()
            if not success:
                break
                
            frame = draw_gaze_region(frame, frame.shape[1], frame.shape[0])
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = face_mesh.process(frame_rgb)
            
            if results.multi_face_landmarks:
                frame, total_frames, attention_frames, attention_buffer, last_log_time = process_frame(
                    frame, results.multi_face_landmarks[0], total_frames, attention_frames, 
                    attention_buffer, buffer_size, session_start_time, last_log_time
                )
            else:
                cv2.putText(frame, "No face detected", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            
            ret, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            
            await asyncio.sleep(0.03)  # Approximately 30 FPS
            
    finally:
        final_attention_score = (attention_frames / total_frames * 100) if total_frames > 0 else 0
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(f"{datetime.now().strftime('%Y-%m-%d %H-%M-%S')} - SESSION ENDED - Final Attention Score: {final_attention_score:.1f}%\n")
        if cap:
            cap.release()
        session_active = False

@app.get("/video")
async def video_feed():
    return StreamingResponse(video_stream(), media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/stop")
async def stop_session():
    global session_active, cap
    session_active = False
    if cap:
        cap.release()
    
    # Read the log file and return its contents
    try:
        with open(log_file, "r", encoding="utf-8") as f:
            log_contents = f.readlines()
        
        # Parse the log to get the final statistics
        total_entries = len(log_contents)
        attention_scores = []
        distracted_count = 0
        attentive_count = 0
        final_score = None

        for line in log_contents:
            if "SESSION ENDED" in line:
                final_score = float(line.split("Final Attention Score: ")[1].strip("%\n"))
            elif "Attention Score" in line:
                score = float(line.split("Attention Score: ")[1].split("%")[0])
                attention_scores.append(score)
                if "DISTRACTED" in line:
                    distracted_count += 1
                elif "ATTENTIVE" in line:
                    attentive_count += 1

        avg_score = sum(attention_scores) / len(attention_scores) if attention_scores else 0

        return {
            "session_log": log_contents,
            "statistics": {
                "total_entries": total_entries,
                "attentive_count": attentive_count,
                "distracted_count": distracted_count,
                "average_score": avg_score,
                "final_score": final_score
            }
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)