import torch
import whisper


device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

model = whisper.load_model("small", device=device)

def transcribe(audio_file_path:str)->list:
    result = model.transcribe(audio_file_path, word_timestamps=True)
    words_with_timestamps = result["segments"]
    
    formatted_transcript = []
    for segment in words_with_timestamps:
        for word_info in segment["words"]:
            formatted_transcript.append((word_info["word"], word_info["start"], word_info["end"]))
    return formatted_transcript
