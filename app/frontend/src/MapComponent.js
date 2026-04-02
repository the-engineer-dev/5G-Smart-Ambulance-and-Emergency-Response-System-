import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import axios from "axios";

// Standard Leaflet Marker Fix
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

function MapComponent() {
  const isMissionTab = window.location.hash === "#mission";
  const isVideoTab = window.location.hash === "#video";

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const ambMarkerRef = useRef(null);
  const localVideoRef = useRef(null);

  const [userLocation, setUserLocation] = useState([28.6139, 77.2090]);
  const [missionData, setMissionData] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const [eta, setEta] = useState("---");

  // 1. Initial Setup
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => console.log("Location Denied")
    );

    if (isMissionTab || isVideoTab) {
      const saved = localStorage.getItem("active_mission");
      if (saved) {
        const parsed = JSON.parse(saved);
        setMissionData(parsed);
        if (isMissionTab) setTimeout(() => initInteractiveMap(parsed), 500);
        if (isVideoTab) setTimeout(() => startCamera(), 500);
      }
    }
  }, [isMissionTab, isVideoTab]);

  // 2. Interactive Map Logic
  const initInteractiveMap = (data) => {
    if (mapInstance.current) return;
    
    mapInstance.current = L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView(userLocation, 15);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);
    
    // User Pulsing Marker
    L.circle(userLocation, { color: '#00ffcc', radius: 30, fillOpacity: 0.6 }).addTo(mapInstance.current);

    const route = L.Routing.control({
      waypoints: [L.latLng(data.hospital.lat, data.hospital.lng), L.latLng(...userLocation)],
      lineOptions: { styles: [{ color: "#00ffcc", weight: 6, opacity: 0.8 }] },
      createMarker: () => null, show: false, addWaypoints: false
    }).addTo(mapInstance.current);

    route.on("routesfound", (e) => {
      const path = e.routes[0].coordinates;
      if (ambMarkerRef.current) mapInstance.current.removeLayer(ambMarkerRef.current);
      
      ambMarkerRef.current = L.marker([path[0].lat, path[0].lng], {
        icon: L.icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/1048/1048315.png", iconSize: [40, 40] })
      }).addTo(mapInstance.current);

      let i = 0;
      const move = setInterval(() => {
        if (i >= path.length - 1) {
          clearInterval(move);
          setEta("ARRIVED");
          speak("The ambulance has arrived.");
          return;
        }
        i += 1;
        ambMarkerRef.current.setLatLng([path[i].lat, path[i].lng]);
        setEta(`${Math.ceil(((path.length - i) / path.length) * 5)}m`);
        mapInstance.current.panTo([path[i].lat, path[i].lng]);
      }, 200);
    });

    speak(`Mission link active. Survival rate is ${data.survival} percent.`, "en-IN");
  };

  const speak = (text, lang = "en-IN") => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    setMessages(prev => [...prev, { role: "ai", text: text.toUpperCase() }]);
    window.speechSynthesis.speak(u);
  };

  // 3. Handle First Request (Opens New Tab)
  const requestEmergency = async () => {
    try {
      // Correct absolute URL
      const res = await axios.post("http://localhost:5000/api/emergency", { lat: userLocation[0], lng: userLocation[1] });
      localStorage.setItem("active_mission", JSON.stringify(res.data));
      window.open(window.location.origin + window.location.pathname + "#mission", "_blank");
    } catch (err) {
      console.error("Network Error: Using Demo Data");
      const demoData = { hospital: { name: "Demo Hospital", lat: 28.5672, lng: 77.2100, phone: "102" }, survival: 95 };
      localStorage.setItem("active_mission", JSON.stringify(demoData));
      window.open(window.location.origin + window.location.pathname + "#mission", "_blank");
    }
  };

  const handleMicTap = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.onstart = () => setIsListening(true);
    rec.onresult = async (e) => {
      const text = e.results[0][0].transcript;
      setMessages(prev => [...prev, { role: "user", text: text.toUpperCase() }]);
      try {
        const res = await axios.post("http://localhost:5000/api/ai-chat", { text });
        speak(res.data.reply, res.data.lang);
      } catch (e) { speak("I am processing your data."); }
    };
    rec.onend = () => setIsListening(false);
    rec.start();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch (e) { console.log("Camera Blocked"); }
  };

  return (
    <div style={{ height: "100vh", background: "#000", color: "#fff", fontFamily: "'Orbitron', sans-serif", overflow: "hidden" }}>
      <style>{`
        .orb { width: 140px; height: 140px; border-radius: 50%; background: radial-gradient(circle, #00ffcc 0%, #001111 100%); cursor: pointer; border: 2px solid #00ffcc; box-shadow: 0 0 30px #00ffcc; }
        .hud { background: rgba(0,0,0,0.8); backdrop-filter: blur(20px); border: 1px solid rgba(0,255,204,0.3); padding: 20px; border-radius: 15px; position: absolute; z-index: 100; }
        .pip-cam { position: absolute; top: 20px; right: 20px; width: 150px; border: 2px solid #fff; border-radius: 10px; transform: scaleX(-1); }
      `}</style>

      {!isMissionTab && !isVideoTab ? (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div className="orb" onClick={requestEmergency} />
          <h1 style={{ marginTop: 30, letterSpacing: 10 }}>LIFEROUTE</h1>
          <p style={{ opacity: 0.4 }}>TAP ORB TO DISPATCH</p>
        </div>
      ) : isMissionTab ? (
        <>
          <div ref={mapRef} style={{ height: "100%", width: "100%", filter: 'brightness(0.5)' }} />
          <div className="hud" style={{ top: 20, left: 20, width: "300px" }}>
            <small style={{ color: "#00ffcc" }}>MISSION LOG</small>
            <div style={{ height: "30vh", overflowY: "auto", fontSize: "10px", marginTop: 10 }}>
              {messages.map((m, i) => <div key={i} style={{ marginBottom: 10 }}>{m.role === 'ai' ? '🤖' : '➤'} {m.text}</div>)}
            </div>
            <button onClick={() => window.open(window.location.origin + window.location.pathname + "#video", "_blank")} style={{ width: "100%", background: "red", color: "#fff", padding: "10px", border: "none", borderRadius: "5px", fontWeight: "bold", marginTop: 10, cursor: "pointer" }}>📹 VIDEO LINK</button>
          </div>
          <div className="hud" style={{ top: 20, right: 20, textAlign: "right" }}>
            <small style={{ color: "#00ffcc" }}>SURVIVAL</small>
            <div style={{ fontSize: 24, fontWeight: "bold", color: "#00ffcc" }}>{missionData?.survival}%</div>
            <small>ETA: {eta}</small>
          </div>
          <div style={{ position: "absolute", bottom: "5%", left: "50%", transform: "translateX(-50%)" }}>
            <div className="orb" style={{ width: 100, height: 100, background: isListening ? 'red' : '' }} onClick={handleMicTap} />
          </div>
        </>
      ) : (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", padding: 20 }}>
          <div style={{ flex: 1, border: "2px solid #00ffcc", position: "relative", borderRadius: 20, overflow: "hidden" }}>
             <video ref={localVideoRef} autoPlay playsInline className="pip-cam" />
             <img src="https://img.freepik.com/free-photo/doctor-offering-medical-advice_23-2149329020.jpg" style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Doc"/>
          </div>
          <button onClick={() => window.close()} style={{ background: "red", padding: 20, border: "none", color: "#fff", borderRadius: 10, marginTop: 10 }}>CLOSE CALL</button>
        </div>
      )}
    </div>
  );
}

export default MapComponent;