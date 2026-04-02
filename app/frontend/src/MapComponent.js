import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import axios from "axios";

const HUD_UI = {
  "en-IN": { head: "TACTICAL HUD", eta: "ARRIVAL", surv: "SURVIVAL RATE", video: "DOCTOR LINK" },
  "hi-IN": { head: "टैक्टिकल HUD", eta: "आगमन", surv: "जीवन दर", video: "डॉक्टर लिंक" }
};

function MapComponent() {
  // Check if we are in the Mission Tab or Main Tab
  const isMissionTab = window.location.hash === "#mission";

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const ambMarker = useRef(null);
  const localVideoRef = useRef(null);

  const [userLocation, setUserLocation] = useState([28.6139, 77.2090]);
  const [missionData, setMissionData] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lang, setLang] = useState("en-IN");
  const [eta, setEta] = useState("---");
  const [messages, setMessages] = useState([]);
  const [mode, setMode] = useState("MAP");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(p => setUserLocation([p.coords.latitude, p.coords.longitude]));
    
    if (isMissionTab) {
      const saved = JSON.parse(localStorage.getItem("active_mission"));
      if (saved) {
        setMissionData(saved);
        setTimeout(() => initMissionMap(saved), 500);
      }
    }
  }, [isMissionTab]);

  // --- 🗺️ MISSION PAGE LOGIC ---
  const initMissionMap = (data) => {
    if (mapInstance.current) return;
    mapInstance.current = L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView(userLocation, 16);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);
    
    // Start Route
    const route = L.Routing.control({
      waypoints: [L.latLng(data.hospital.lat, data.hospital.lng), L.latLng(...userLocation)],
      lineOptions: { styles: [{ color: "#00ffcc", weight: 6, opacity: 0.8 }] },
      createMarker: () => null, show: false
    }).addTo(mapInstance.current);

    route.on("routesfound", (e) => {
      const path = e.routes[0].coordinates;
      ambMarker.current = L.marker([path[0].lat, path[0].lng], { 
        icon: L.icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/1048/1048315.png", iconSize: [40, 40] }) 
      }).addTo(mapInstance.current);
      
      let i = 0;
      const move = setInterval(() => {
        if (i >= path.length - 1) { clearInterval(move); setEta("0m"); return; }
        i += 2;
        ambMarker.current.setLatLng([path[i].lat, path[i].lng]);
        setEta(`${Math.ceil(((path.length-i)/path.length)*5)}m`);
        mapInstance.current.panTo([path[i].lat, path[i].lng]);
      }, 200);
    });

    speak(`Mission link established. Survival probability is ${data.survival} percent. Please state your name.`, "en-IN");
  };

  // --- 🎙️ VOICE ENGINE ---
  const speak = (text, targetLang) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = targetLang; u.rate = 0.95;
    setMessages(prev => [...prev, { role: "ai", text }]);
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const handleMicTap = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.onstart = () => setIsListening(true);
    rec.onresult = async (e) => {
      const text = e.results[0][0].transcript;
      setMessages(prev => [...prev, { role: "user", text }]);
      const res = await axios.post("http://localhost:5000/api/ai-chat", { text });
      setLang(res.data.lang);
      speak(res.data.reply, res.data.lang);
    };
    rec.onend = () => setIsListening(false);
    rec.start();
  };

  // --- 🚨 MAIN TAB: INITIALIZE ---
  const requestEmergency = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/emergency", { lat: userLocation[0], lng: userLocation[1] });
      // Save data for the next tab
      localStorage.setItem("active_mission", JSON.stringify(res.data));
      // Open new tab
      window.open(window.location.origin + window.location.pathname + "#mission", "_blank");
    } catch (err) { alert("Link Error"); }
  };

  return (
    <div style={{ height: "100vh", background: "#000", color: "#fff", fontFamily: "'Orbitron', sans-serif", overflow: "hidden" }}>
      <style>{`
        .neural-orb { width: 150px; height: 150px; border-radius: 50%; background: radial-gradient(circle, #ff0000 0%, #330000 100%); cursor: pointer; transition: 0.5s; box-shadow: 0 0 30px #ff0000; border: 3px solid rgba(255,255,255,0.2); }
        .orb-active { background: radial-gradient(circle, #00ffcc 0%, #002222 100%); box-shadow: 0 0 50px #00ffcc; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        .hud-glass { background: rgba(0,0,0,0.8); backdrop-filter: blur(25px); border: 1px solid rgba(0,255,204,0.3); padding: 15px; border-radius: 15px; position: absolute; z-index: 100; }
        .surv-val { color: #00ffcc; font-size: 28px; font-weight: 900; text-shadow: 0 0 10px #00ffcc; }
      `}</style>

      {/* --- PAGE 1: STANDBY --- */}
      {!isMissionTab ? (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div className="neural-orb" onClick={requestEmergency} />
          <h1 style={{ marginTop: 40, letterSpacing: 15 }}>LIFEROUTE</h1>
          <p style={{ opacity: 0.4, letterSpacing: 5 }}>INITIALIZE EMERGENCY LINK</p>
        </div>
      ) : (
        /* --- PAGE 2: MISSION HUD --- */
        <>
          <div ref={mapRef} style={{ height: "100%", width: "100%", filter: 'brightness(0.5) contrast(1.2)' }} />
          
          {/* TOP HUD: SURVIVAL & ETA */}
          <div className="hud-glass" style={{ top: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between' }}>
            <div>
                <small style={{ color: "#00ffcc" }}>{HUD_UI[lang].surv}</small>
                <div className="surv-val">{missionData?.survival}%</div>
            </div>
            <div style={{ textAlign: "right" }}>
                <small style={{ color: "#00ffcc" }}>{HUD_UI[lang].eta}</small>
                <div style={{ fontSize: 24 }}>{eta}</div>
            </div>
          </div>

          {/* TRANSCRIPT HUD */}
          <div className="hud-glass" style={{ top: 120, left: 20, width: "250px", height: "30vh", overflowY: "auto", fontSize: "10px" }}>
             {messages.map((m, i) => (
                 <div key={i} style={{ marginBottom: 8, color: m.role === 'ai' ? '#00ffcc' : '#fff' }}>
                    {m.role === 'ai' ? '🤖 ' : '➤ '}{m.text.toUpperCase()}
                 </div>
             ))}
          </div>

          {/* INTERACTIVE ORB */}
          <div style={{ position: "absolute", bottom: "6%", left: "50%", transform: "translateX(-50%)", textAlign: "center", zIndex: 1001 }}>
            <div 
              className={`neural-orb orb-active ${isListening ? 'listening' : ''}`} 
              style={{ width: 100, height: 100, background: isListening ? 'red' : '' }}
              onClick={handleMicTap} 
            />
            <div style={{ marginTop: 10, fontSize: 10, color: "#00ffcc" }}>NEURAL LINK ACTIVE</div>
          </div>

          {missionData && (
            <div className="hud-glass" style={{ bottom: "22%", left: 20, width: "280px" }}>
               <small style={{ color: "#00ffcc" }}>NEAREST: {missionData.hospital.name}</small>
               <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button onClick={() => setMode("VIDEO")} style={{ flex: 1, background: "#ff4d4d", border: "none", padding: "12px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", color: "#fff" }}>📹 {HUD_UI[lang].video}</button>
                  <button onClick={() => window.location.href=`tel:${missionData.hospital.phone}`} style={{ width: "50px", background: "#00ffcc", border: "none", borderRadius: "10px", cursor: "pointer" }}>📞</button>
               </div>
            </div>
          )}
        </>
      )}

      {/* --- VIDEO OVERLAY (REUSED) --- */}
      {mode === "VIDEO" && (
          <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 9999, display: 'flex', flexDirection: 'column', padding: 20 }}>
             <div style={{ flex: 1, border: '2px solid #00ffcc', borderRadius: 20, overflow: 'hidden' }}>
                <img src="https://img.freepik.com/free-photo/doctor-offering-medical-advice_23-2149329020.jpg" style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Doc"/>
             </div>
             <button onClick={() => setMode("MAP")} style={{ background: 'red', color: '#fff', padding: 20, marginTop: 10, border: 'none', borderRadius: 10 }}>END LINK</button>
          </div>
      )}
    </div>
  );
}

export default MapComponent;