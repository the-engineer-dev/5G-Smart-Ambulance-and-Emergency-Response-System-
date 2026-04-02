import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import axios from "axios";

// 🔧 FIX: Leaflet default icon paths
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const ambIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/1048/1048315.png",
    iconSize: [40, 40], iconAnchor: [20, 20]
});

// 🌍 TRANSLATIONS
const translations = {
  "en-IN": {
    head: "LIFEROUTE",
    btn: "🚨 INITIALIZE DISPATCH",
    eta: "ETA",
    call: "CALL HOSPITAL",
    talk: "TALK TO AI",
    arrived: "ARRIVED",
    langPrompt: "Please choose your language. English or Hindi?",
    namePrompt: "What is your name?",
    traffic: "HEAVY TRAFFIC DETECTED"
  },
  "hi-IN": {
    head: "लाइफ़रूट",
    btn: "🚨 डिस्पैच शुरू करें",
    eta: "पहुंचने का समय",
    call: "कॉल करें",
    talk: "AI से बात करें",
    arrived: "पहुंच गए",
    langPrompt: "अपनी भाषा चुनें। अंग्रेज़ी या हिंदी?",
    namePrompt: "आपका नाम क्या है?",
    traffic: "भारी ट्रैफ़िक मिला है"
  }
};

function MapComponent() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const routingRef = useRef(null);
  const ambMarkerRef = useRef(null);

  const [userLocation, setUserLocation] = useState([28.6139, 77.2090]);
  const [hospital, setHospital] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lang, setLang] = useState("en-IN");
  const [chatLog, setChatLog] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [chatStep, setChatStep] = useState("LANG"); // LANG -> NAME -> EMERGENCY
  const [etaText, setEtaText] = useState("SYNCING...");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserLocation([pos.coords.latitude, pos.coords.longitude]);
    });
  }, []);

  // Initialize Map safely
  useEffect(() => {
    if (showMap && !mapInstance.current && mapRef.current) {
      mapInstance.current = L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView(userLocation, 15);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);
      L.marker(userLocation).addTo(mapInstance.current).bindPopup("YOU");
    }
  }, [showMap, userLocation]);

  const speak = (text, l = lang) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = l;
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  };

  const handleRequest = async () => {
    setShowMap(true);
    try {
      const res = await axios.post("http://localhost:5000/api/emergency", { lat: userLocation[0], lng: userLocation[1] });
      setHospital(res.data.hospital);
      initRouting(res.data.hospital);
    } catch (err) { alert("Backend Error"); }
  };

  const initRouting = (hosp) => {
    if (routingRef.current) mapInstance.current.removeControl(routingRef.current);
    routingRef.current = L.Routing.control({
      waypoints: [L.latLng(hosp.lat, hosp.lng), L.latLng(...userLocation)],
      lineOptions: {
        styles: [
          { color: "#ff4d4d", weight: 10, opacity: 0.3, dashArray: "5, 10" }, // Traffic
          { color: "#00ffcc", weight: 6, opacity: 0.9 }
        ]
      },
      createMarker: () => null,
      show: false
    }).addTo(mapInstance.current);

    routingRef.current.on("routesfound", (e) => {
      animateAmbulance(e.routes[0].coordinates);
    });
  };

  const animateAmbulance = (path) => {
    let i = 0;
    if (ambMarkerRef.current) mapInstance.current.removeLayer(ambMarkerRef.current);
    ambMarkerRef.current = L.marker([path[0].lat, path[0].lng], { icon: ambIcon }).addTo(mapInstance.current);

    const timer = setInterval(() => {
      if (i >= path.length - 1) {
        clearInterval(timer);
        setEtaText(translations[lang].arrived);
        speak(lang === "hi-IN" ? "मदद पहुंच गई है" : "Help has arrived.");
        return;
      }
      i++;
      ambMarkerRef.current.setLatLng([path[i].lat, path[i].lng]);
      setEtaText(`${Math.ceil(((path.length - i) / path.length) * 5)} MIN`);
    }, 150);
  };

  // --- Voice AI Logic ---
  const handleMic = () => {
    setShowChat(true);
    if (chatStep === "LANG") {
      const p = translations["en-IN"].langPrompt;
      setChatLog([{ s: "bot", t: p }]);
      speak(p, "en-IN");
    }
    startListening();
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.lang = chatStep === "LANG" ? "en-IN" : lang;
    
    rec.onstart = () => setIsListening(true);
    rec.onresult = async (e) => {
      const text = e.results[0][0].transcript.toLowerCase();
      setChatLog(prev => [...prev, { s: "user", t: text }]);

      if (chatStep === "LANG") {
        const isHindi = text.includes("hindi") || text.includes("हिंदी");
        const newLang = isHindi ? "hi-IN" : "en-IN";
        setLang(newLang);
        setChatStep("NAME");
        const reply = translations[newLang].namePrompt;
        setChatLog(prev => [...prev, { s: "bot", t: reply }]);
        speak(reply, newLang);
      } else {
        const res = await axios.post("http://localhost:5000/api/ai-chat", { text, lang });
        setChatLog(prev => [...prev, { s: "bot", t: res.data.reply }]);
        speak(res.data.reply, lang);
      }
    };
    rec.onend = () => setIsListening(false);
    rec.start();
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#050505", color: "white", fontFamily: "sans-serif", overflow: "hidden" }}>
      <style>{`
        .map-3d { transform: rotateX(25deg) translateY(-40px); perspective: 1000px; transition: 0.5s; }
        .glass { background: rgba(10,10,10,0.8); backdrop-filter: blur(20px); border-top: 2px solid #00ffcc; border-radius: 40px 40px 0 0; padding: 25px; }
        .bot-msg { color: #00ffcc; padding: 10px; border-radius: 10px; background: rgba(0,255,204,0.1); margin: 5px 0; }
        .user-msg { color: white; text-align: right; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 10px; margin: 5px 0; }
      `}</style>

      <header style={{ padding: "20px", textAlign: "center" }}>
        <h1 style={{ letterSpacing: "10px", color: "#00ffcc", margin: 0 }}>{translations[lang].head}</h1>
      </header>

      <div style={{ flex: 1, position: "relative" }}>
        {!showMap ? (
          <div style={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <button onClick={handleRequest} style={{ padding: "20px 40px", background: "red", border: "none", color: "white", fontWeight: "bold", borderRadius: "15px", cursor: "pointer" }}>{translations[lang].btn}</button>
          </div>
        ) : (
          <div ref={mapRef} className="map-3d" style={{ height: "115%", width: "100%" }} />
        )}
      </div>

      {showChat && (
        <div style={{ position: "absolute", bottom: "40%", left: "5%", right: "5%", background: "rgba(5,5,5,0.98)", border: "1px solid #333", height: "300px", zIndex: 1000, padding: "20px", borderRadius: "30px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1 }}>
            {chatLog.map((c, i) => <div key={i} className={c.s === "bot" ? "bot-msg" : "user-msg"}>{c.t}</div>)}
          </div>
          <button onClick={handleMic} style={{ background: isListening ? "red" : "#00ffcc", color: "#000", padding: "12px", border: "none", borderRadius: "15px", fontWeight: "bold" }}>
             {isListening ? "LISTENING..." : translations[lang].talk}
          </button>
        </div>
      )}

      {hospital && (
        <div className="glass" style={{ height: "35%", zIndex: 1001 }}>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ margin: "0" }}>{hospital.name}</h2>
            <p style={{ color: "#ff4d4d", fontSize: "12px" }}>{translations[lang].traffic}</p>
            <div style={{ display: "flex", justifyContent: "space-around", marginTop: "20px" }}>
                <div><small>{translations[lang].eta}</small><br/><b>{etaText}</b></div>
                <div><small>SIGNAL</small><br/><b style={{ color: "#00ffcc" }}>SECURE</b></div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "50px", marginTop: "20px" }}>
            <button onClick={() => window.location.href=`tel:${hospital.phone}`} style={{ width: 65, height: 65, borderRadius: "50%", background: "#2ecc71", border: "none", fontSize: "25px" }}>📞</button>
            <button onClick={handleMic} style={{ width: 65, height: 65, borderRadius: "50%", background: "#222", border: "1px solid #00ffcc", color: "white", fontSize: "25px" }}>🎤</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapComponent;