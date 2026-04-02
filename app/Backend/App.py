from flask import Flask, request, jsonify
from flask_cors import CORS
import math

app = Flask(__name__)
CORS(app)

# 🏥 Hospital Data
hospitals = [
    {"name": "AIIMS Delhi", "lat": 28.5672, "lng": 77.2100, "phone": "01126588500"},
    {"name": "Apollo Hospital", "lat": 28.5416, "lng": 77.2832, "phone": "01126925858"},
    {"name": "Fortis Hospital", "lat": 28.4595, "lng": 77.0266, "phone": "01244966666"},
    {"name": "Max Hospital", "lat": 28.5733, "lng": 77.2430, "phone": "01140554055"},
]

@app.route("/api/emergency", methods=["POST"])
def emergency():
    data = request.json
    u_lat, u_lng = data['lat'], data['lng']
    # Euclidean distance for simplicity
    nearest = min(hospitals, key=lambda h: math.sqrt((u_lat - h['lat'])**2 + (u_lng - h['lng'])**2))
    return jsonify({"hospital": nearest})

@app.route("/api/ai-chat", methods=["POST"])
def ai_chat():
    data = request.json
    text = data.get("text", "").lower()
    lang = data.get("lang", "en-IN")
    
    if lang == "hi-IN":
        reply = "मैंने आपकी जानकारी नोट कर ली है। एम्बुलेंस रास्ते में है, कृपया शांत रहें।"
    else:
        reply = "I have noted your information. The ambulance is on the way, please stay calm."
        
    print(f"Log: [{lang}] User said: {text}")
    return jsonify({"reply": reply})

if __name__ == "__main__":
    app.run(debug=True, port=5000)