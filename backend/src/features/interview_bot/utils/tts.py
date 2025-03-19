import soundfile as sf
from kokoro import KPipeline
import numpy as np

pipeline = KPipeline(lang_code='a',device='cuda') 
def text_to_speech(text, voice="af_heart", speed=1.2):
    
    generator = pipeline(text, voice=voice, speed=speed)
    audio_output =[]
    for i, (gs, ps, audio) in enumerate(generator):
        print(f"Generating segment {i}...")
        print("Text:", gs)
        print("Phonemes:", ps)

        
        audio_output.append(audio)

    combined_audio = np.concatenate(audio_output)
    sf.write("output.wav", combined_audio, 24000)
    return "output.wav"
        


