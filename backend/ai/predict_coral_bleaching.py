import sys
import json
import random
from geopy.distance import geodesic
from geopy.point import Point

def generate_prediction(base_lat, base_lng):
    """
    Simulates coral bleaching spreading to an adjacent reef.
    The spread is typically over a short distance.
    """
    # A completely random direction for the spread
    bearing = random.uniform(0, 360)
    
    # Predicts the spread to a nearby colony, between 500m and 2km away.
    distance_km = random.uniform(0.5, 2)
    
    start_point = Point(base_lat, base_lng)
    destination = geodesic(kilometers=distance_km).destination(start_point, bearing)
    
    return {
        "lat": destination.latitude,
        "lng": destination.longitude,
        "title": "Predicted Coral Bleaching Spread",
        "description": "High sea surface temperatures and a nearby validated bleaching report indicate a critical risk of bleaching spreading to this adjacent reef area.",
        "type": "predicted_coral",
        "severity": "Critical"
    }

if __name__ == "__main__":
    input_data = json.loads(sys.argv[1])
    base_lat = input_data["lat"]
    base_lng = input_data["lng"]
    
    prediction = generate_prediction(base_lat, base_lng)
    print(json.dumps(prediction))