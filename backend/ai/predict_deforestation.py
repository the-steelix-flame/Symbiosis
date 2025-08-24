import sys
import json
import random
from geopy.distance import geodesic
from geopy.point import Point

def generate_prediction(base_lat, base_lng):
    """
    Simulates deforestation spreading along a random cardinal or intercardinal direction.
    This is more realistic than a simple random point.
    """
    # Define cardinal and intercardinal directions in degrees
    directions = {
        "North": 0, "Northeast": 45, "East": 90, "Southeast": 135,
        "South": 180, "Southwest": 225, "West": 270, "Northwest": 315
    }
    chosen_direction_name = random.choice(list(directions.keys()))
    bearing = directions[chosen_direction_name]
    
    # Predict a new hotspot between 2km and 5km away along that direction
    distance_km = random.uniform(2, 5)
    
    start_point = Point(base_lat, base_lng)
    destination = geodesic(kilometers=distance_km).destination(start_point, bearing)
    
    return {
        "lat": destination.latitude,
        "lng": destination.longitude,
        "title": "Predicted Deforestation Hotspot",
        "description": f"AI model predicts a high risk of deforestation spreading {chosen_direction_name} from a recent validated incident.",
        "type": "predicted_deforestation",
        "severity": "High"
    }

if __name__ == "__main__":
    input_data = json.loads(sys.argv[1])
    base_lat = input_data["lat"]
    base_lng = input_data["lng"]
    
    prediction = generate_prediction(base_lat, base_lng)
    print(json.dumps(prediction))