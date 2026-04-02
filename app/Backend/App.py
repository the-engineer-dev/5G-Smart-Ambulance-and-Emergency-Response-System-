from flask import Flask, request, jsonify
from flask_cors import CORS
import math, random, re

app = Flask(__name__)
# IMPORTANT: This line fixes the Network Error by allowing React to talk to Flask
CORS(app)

hospitals = [
    {"name": "AIIMS Trauma Centre", "lat": 28.5672, "lng": 77.2100, "phone": "01126588500"},
    {"name": "Apollo Super Speciality", "lat": 28.5416, "lng": 77.2832, "phone": "01126925858"},
    {"name": "Max Healthcare Saket", "lat": 28.5275, "lng": 77.2105, "phone": "01126515050"},
]

@app.route("/api/emergency", methods=["POST"])
def emergency():
    data = request.json
    u_lat = data.get('lat', 28.6139)
    u_lng = data.get('lng', 77.2090)
    # Find nearest hospital
    nearest = min(hospitals, key=lambda h: math.sqrt((u_lat - h['lat'])**2 + (u_lng - h['lng'])**2))
    return jsonify({
        "hospital": nearest,
        "survival": random.randint(90, 98),
        "status": "success"
    })

@app.route("/api/ai-chat", methods=["POST"])
def ai_chat():
    data = request.json
    text = data.get("text", "").lower()
    
    # Auto-detect Hindi/English
    hindi_signals = r"bachao|madad|naam|mera|dard|chot|khoon"
    lang = "hi-IN" if re.search(hindi_signals, text) else "en-IN"
    
    reply = "Medics are dispatched. Stay calm." if lang == "en-IN" else "एम्बुलेंस भेज दी गई है। शांत रहें।"
    return jsonify({"reply": reply, "lang": lang})

if __name__ == "__main__":
    # Ensure it runs on port 5000
    app.run(debug=True, port=5000)