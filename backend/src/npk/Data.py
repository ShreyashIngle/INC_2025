from pydantic import BaseModel

class Cdata(BaseModel):
    N: float  # Nitrogen content in soil
    P: float  # Phosphorus content in soil
    K: float  # Potassium content in soil
    Temp: float  # Temperature (°C)
    Humidity: float  # Humidity (%)
    PH: float  # pH level of the soil
    Rain: float  # Rainfall (mm)
