#import libraries
import uvicorn
from fastapi import FastAPI
from npk.Data import Cdata
import numpy as np
import pickle
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Load pre-trained model
pickle_in = open("src/npk/model.pkl", "rb")
classifier = pickle.load(pickle_in)

# Crop names (map from class index to crop name)
crops = [
    'rice', 'maize', 'chickpea', 'kidneybeans', 'pigeonpeas', 'mothbeans', 
    'mungbean', 'blackgram', 'lentil', 'pomegranate', 'banana', 'mango', 
    'grapes', 'watermelon', 'muskmelon', 'apple', 'orange', 'papaya', 
    'coconut', 'cotton', 'jute', 'coffee'
]


@app.get('/')
def index():
    return {'message': 'FastAPI server'}

@app.post('/predict')
def predict_crop(data: Cdata):
    try:
        # Extract features from the input data
        features = [[
            data.N,  # Nitrogen
            data.P,  # Phosphorus
            data.K,  # Potassium
            data.PH,  # pH level
            data.Temp,  # Temperature
            data.Humidity,  # Humidity
            data.Rain  # Rainfall
        ]]
        
        # Make prediction
        prediction = classifier.predict(features)
        
        # Return the predicted crop directly if it's already a string
        return {'Predicted Crop': prediction[0]}
    except Exception as e:
        return {'error': str(e)}


if __name__ == '__main__':
    uvicorn.run(app, host='127.0.0.1', port=8000)
    
#uvicorn main:app --reload