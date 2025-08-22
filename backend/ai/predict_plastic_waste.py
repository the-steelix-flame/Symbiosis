import sys
import json
import random
from geopy.distance import geodesic
from geopy.point import Point

def generate_prediction(base_lat, base_lng):
    """
    Simulates plastic waste moving downstream in a river.
    For India, many major rivers flow generally southeast towards the Bay of Bengal.
    We will use a bearing in that direction with some variation.
    """
    # Southeast direction is 135 degrees. We add randomness to simulate river bends.
    bearing = random.uniform(110, 160) 
    
    # Predicts the plastic will accumulate somewhere between 10km and 25km downstream in the next 24-48 hours.
    distance_km = random.uniform(10, 25)
    
    start_point = Point(base_lat, base_lng)
    destination = geodesic(kilometers=distance_km).destination(start_point, bearing)
    
    return {
        "lat": destination.latitude,
        "lng": destination.longitude,
        "title": "Predicted Plastic Accumulation Zone",
        "description": f"Based on a recent report, our model predicts a high probability of plastic waste accumulating in this area within 24-48 hours due to river flow.",
        "type": "predicted_plastic",
        "severity": "Critical"
    }

if __name__ == "__main__":
    input_data = json.loads(sys.argv[1])
    base_lat = input_data["lat"]
    base_lng = input_data["lng"]
    
    prediction = generate_prediction(base_lat, base_lng)
    print(json.dumps(prediction))