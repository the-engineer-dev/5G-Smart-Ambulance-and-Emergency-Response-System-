import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import axios from "axios";

// Standard Icon Fix
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const ambulanceIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1048/1048315.png",
  iconSize: [45, 45], iconAnchor: [22, 22],
});

function MapComponent() {
  const isMissionTab = window.location.hash === "#mission";
  const isVideoTab = window.location.hash === "#video";
  const isSupportTab = window.location.hash === "#support";
  const isGovTab = window.location.hash === "#gov-112";
  const isConditionTab = window.location.hash === "#condition";
  const isAiTab = window.location.hash === "#ai-chat";

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const ambMarkerRef = useRef(null);
  const localVideoRef = useRef(null);
  const chatEndRef = useRef(null);

  const [userLocation, setUserLocation] = useState([28.6139, 77.2090]);
  const [missionData, setMissionData] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([{r:'ai', t:'NEURAL LINK ACTIVE. STATE SYMPTOMS.'}]);
  const [eta, setEta] = useState("---");
  const [vitalsInput, setVitalsInput] = useState({ bpm: "", spo2: "" });
  const [isVitalsSet, setIsVitalsSet] = useState(false);
  const [textInput, setTextInput] = useState("");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(p => setUserLocation([p.coords.latitude, p.coords.longitude]));
    const saved = localStorage.getItem("active_mission");
    if (saved) {
        const parsed = JSON.parse(saved);
        setMissionData(parsed);
        if (isMissionTab) setTimeout(() => initInteractiveMap(parsed), 300);
        if (isVideoTab) setTimeout(() => startCamera(), 600);
    }
  }, [isMissionTab, isVideoTab]);

  const calculateSurvival = () => {
    const tEta = parseInt(eta) || 5; 
    const sVitals = (100 - parseInt(vitalsInput.spo2 || 100)) / 10 + (parseInt(vitalsInput.bpm || 80) > 100 ? 0.5 : 0.2);
    const result = (1 - ((tEta / 60) * sVitals)) * 100;
    return result > 0 ? result.toFixed(1) : "0.0";
  };

  const initInteractiveMap = (data) => {
    if (mapInstance.current) return;
    mapInstance.current = L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView(userLocation, 15);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);
    
    L.Routing.control({
      waypoints: [L.latLng(data.hospital.lat, data.hospital.lng), L.latLng(...userLocation)],
      lineOptions: { styles: [{ color: "#00ffcc", weight: 6, opacity: 0.8 }] },
      createMarker: () => null, show: false, addWaypoints: false
    }).addTo(mapInstance.current).on("routesfound", (e) => {
      const path = e.routes[0].coordinates;
      if (ambMarkerRef.current) mapInstance.current.removeLayer(ambMarkerRef.current);
      ambMarkerRef.current = L.marker([path[0].lat, path[0].lng], { icon: ambulanceIcon }).addTo(mapInstance.current);
      let i = 0;
      const move = setInterval(() => {
        if (i >= path.length - 1) { clearInterval(move); setEta("0"); return; }
        i += 2;
        if(i >= path.length) i = path.length - 1;
        ambMarkerRef.current.setLatLng([path[i].lat, path[i].lng]);
        setEta(`${Math.ceil(((path.length - i) / path.length) * 5)}`);
        mapInstance.current.panTo([path[i].lat, path[i].lng]);
      }, 100);
    });
  };

  const handleAiInteraction = async (input) => {
    const val = input || textInput;
    if (!val) return;
    setMessages(prev => [...prev, { r: 'u', t: val.toUpperCase() }]);
    setTextInput("");
    setIsTyping(true);
    try {
      const res = await axios.post("http://localhost:5000/api/ai-chat", { text: val });
      setIsTyping(false);
      const u = new SpeechSynthesisUtterance(res.data.reply);
      window.speechSynthesis.speak(u);
      setMessages(prev => [...prev, { r: 'ai', t: res.data.reply.toUpperCase() }]);
    } catch (err) { setIsTyping(false); }
  };

  const handleMicTap = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.onstart = () => setIsListening(true);
    rec.onresult = (e) => handleAiInteraction(e.results[0][0].transcript);
    rec.onend = () => setIsListening(false);
    rec.start();
  };

  const startCamera = async () => {
    if(!localStorage.getItem("active_mission")) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch (err) { alert("Camera Permission Required"); }
  };

  const openTab = (hash) => {
    if ((hash === "#video" || hash === "#condition" || hash === "#mission") && !localStorage.getItem("active_mission") && hash !== "#mission") {
        alert("🚨 PROTOCOL ERROR: Request Ambulance on Home page first to enable this feature.");
        return;
    }
    window.open(window.location.origin + window.location.pathname + hash, "_blank");
  };

  const goHome = () => {
    if (isMissionTab || isVideoTab || isSupportTab || isConditionTab || isGovTab || isAiTab) window.close();
    else { window.location.hash = ""; window.location.reload(); }
  };

  return (
    <div style={{ height: "100vh", background: "#050505", color: "#fff", fontFamily: "'Orbitron', sans-serif", overflow: "hidden" }}>
      <style>{`
        * { box-sizing: border-box; }
        .scifi-header { height: 85px; background: rgba(0, 0, 0, 0.95); backdrop-filter: blur(15px); display: flex; align-items: center; justify-content: space-between; padding: 0 30px; border-bottom: 2px solid #00ffcc; position: fixed; top: 0; width: 100%; z-index: 5000; }
        .nav-item { display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: 0.3s; margin-left: 15px; text-align: center;}
        .nav-label { font-size: 10px; letter-spacing: 1px; font-weight: bold; }
        .nav-desc { font-size: 7px; color: #555; margin-top: 2px; text-transform: uppercase; }
        .nav-item:hover .nav-label { color: #00ffcc; }
        .orb { width: 110px; height: 110px; border-radius: 50%; background: radial-gradient(circle, #00ffcc 0%, #001111 100%); cursor: pointer; border: 2px solid #00ffcc; box-shadow: 0 0 30px #00ffcc; align-self: center; }
        .orb-listening { background: #ff4d4d !important; box-shadow: 0 0 50px #ff4d4d !important; animation: pulse 0.5s infinite; }
        .hud-card { background: rgba(10,10,10,0.9); border: 1px solid #333; padding: 20px; border-radius: 15px; border-left: 5px solid #00ffcc; }
        @keyframes heartbeat { 0% { transform: scale(1); } 20% { transform: scale(1.3); } 100% { transform: scale(1); } }
      `}</style>

      {/* 🚀 RESPONSIVE HEADER */}
      <nav className="scifi-header">
        <div className="logo" style={{ color: "#00ffcc", fontWeight: 900, letterSpacing: 5, fontSize: 18, cursor: 'pointer' }} onClick={goHome}>LIFEROUTE</div>
        <div style={{ display: 'flex', gap: '5px' }}>
          {[
            { label: "HOME", desc: "base", fn: goHome },
            { label: "AI HUB", desc: "neural", fn: () => openTab("#ai-chat") },
            { label: "CONDITION", desc: "vitals", fn: () => openTab("#condition") },
            { label: "VIDEO", desc: "surgeon", fn: () => openTab("#video") },
            { label: "112 GOV", desc: "sos", fn: () => openTab("#gov-112"), color: "#ff4d4d" },
            { label: "SUPPORT", desc: "contact", fn: () => openTab("#support") }
          ].map((i,idx) => (
            <div key={idx} className="nav-item" onClick={i.fn}>
              <span className="nav-label" style={{ color: i.color }}>{i.label}</span>
              <span className="nav-desc">{i.desc}</span>
            </div>
          ))}
        </div>
      </nav>

      {isAiTab ? (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 20px" }}>
            <div style={{ width: "100%", maxWidth: "800px", flex: 1, background: "rgba(255,255,255,0.02)", borderRadius: 20, padding: 25, overflowY: "auto", border: "1px solid #222" }}>
                {messages.map((m, i) => <div key={i} style={{ marginBottom: 15, padding: 12, background: m.r==='ai'?'rgba(0,255,204,0.05)':'transparent', color: m.r==='ai'?'#00ffcc':'#fff', fontSize: 11, borderLeft: m.r==='ai'?'3px solid #00ffcc':'none' }}>{m.t}</div>)}
            </div>
            <div style={{ marginTop: 20, display: 'flex', gap: 15, width: '100%', maxWidth: '800px' }}>
                <input style={{flex: 1, background:'#111', border:'1px solid #333', padding:15, borderRadius:10, color:'#fff', outline:'none', fontFamily:'Orbitron'}} placeholder="TYPE SYMPTOMS..." value={textInput} onChange={e => setTextInput(e.target.value)} onKeyPress={e => e.key==='Enter' && handleAiInteraction()}/>
                <div className={`orb ${isListening ? 'orb-listening' : ''}`} style={{width: 60, height: 60}} onClick={handleMicTap} />
            </div>
        </div>
      ) : isConditionTab ? (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, background: 'radial-gradient(circle, #001a1a 0%, #000 100%)' }}>
            {!isVitalsSet ? (
                <div className="hud-card" style={{ width: "400px", textAlign: 'center' }}>
                    <h2 style={{ color: '#00ffcc', fontSize: 16, marginBottom: 20 }}>INITIALIZING DIAGNOSTICS</h2>
                    <input style={{background:'#111', border:'1px solid #333', color:'#00ffcc', padding:12, borderRadius:8, width:'100%', marginBottom:15}} placeholder="BPM" type="number" value={vitalsInput.bpm} onChange={e => setVitalsInput({...vitalsInput, bpm: e.target.value})} />
                    <input style={{background:'#111', border:'1px solid #333', color:'#00ffcc', padding:15, borderRadius:8, width:'100%', marginBottom:15}} placeholder="SPO2 %" type="number" value={vitalsInput.spo2} onChange={e => setVitalsInput({...vitalsInput, spo2: e.target.value})} />
                    <button style={{ width: '100%', padding: 15, background: '#00ffcc', color: '#000', border: 'none', borderRadius: 10, fontWeight: 'bold', cursor:'pointer' }} onClick={() => setIsVitalsSet(true)}>EXECUTE</button>
                </div>
            ) : (
                <div style={{ textAlign: 'center', width: "100%", maxWidth: "800px" }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
                        <div className="hud-card"><div style={{fontSize:40, color: '#ff4d4d', animation: 'heartbeat 0.8s infinite'}}>❤️</div><div style={{fontSize:30, fontWeight:'bold'}}>{vitalsInput.bpm} BPM</div></div>
                        <div className="hud-card" style={{borderLeftColor: '#ffcc00'}}><div style={{fontSize:30, fontWeight:'bold', marginTop:45}}>{vitalsInput.spo2}% SpO2</div></div>
                    </div>
                    <div className="hud-card" style={{ padding: 40 }}>
                        <small style={{letterSpacing: 4}}>SURVIVAL PROBABILITY</small>
                        <div style={{ fontSize: 80, fontWeight: '900', color: '#00ffcc' }}>{calculateSurvival()}%</div>
                    </div>
                </div>
            )}
        </div>
      ) : isMissionTab ? (
        /* --- 🗺️ MISSION HUD (SPLIT SCREEN) --- */
        <div style={{ display: "flex", flexDirection: "column", height: "100vh", paddingTop: "85px" }}>
          <div ref={mapRef} style={{ height: "55%", width: "100%", borderBottom: '2px solid #00ffcc' }} />
          <div style={{ height: "45%", padding: "20px", display: "flex", gap: "20px", background: "#000" }}>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: "15px", border: "1px solid #222", padding: "15px", overflowY: "auto" }}>
                <small style={{color: '#00ffcc', letterSpacing: 2}}>NEURAL TRANSCRIPT</small>
                {messages.map((m, i) => <div key={i} style={{ fontSize: 9, marginTop: 12, color: m.role==='ai'?'#00ffcc':'#fff' }}>{m.text}</div>)}
                <div ref={chatEndRef} />
            </div>
            <div style={{ width: "300px", textAlign: 'center' }}>
                <div className="hud-card">
                    <small>ETA TO LOCATION</small>
                    <div style={{fontSize: 30, color: '#ff4d4d', fontWeight: 'bold'}}>{eta} MIN</div>
                </div>
                <button onClick={() => openTab("#video")} style={{ width: '100%', background: '#ff4d4d', color: '#fff', padding: 15, borderRadius: 10, border:'none', fontWeight: 'bold', marginTop: 20, cursor: 'pointer' }}>📹 VIDEO CALL</button>
            </div>
          </div>
        </div>
      ) : isVideoTab ? (
        <div style={{ height: "100vh", padding: "100px 20px 20px 20px", display: "flex", flexDirection: "column", background: '#000' }}>
           {!missionData ? (
             <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', border:'2px dashed #ff4d4d', borderRadius:30}}>
                <h1 style={{color:'#ff4d4d', letterSpacing:5}}>ACCESS DENIED</h1>
                <p style={{opacity:0.5}}>PROTOCOL ERROR: REQUEST AMBULANCE FIRST</p>
                <button onClick={goHome} style={{marginTop:20, background:'#00ffcc', color:'#000', border:'none', padding:'10px 20px', borderRadius:5, fontWeight:'bold', cursor:'pointer'}}>RETURN TO BASE</button>
             </div>
           ) : (
             <>
                <div style={{ flex: 1, border: "2px solid #00ffcc", borderRadius: 20, position: "relative", overflow: "hidden", background: "#050505" }}>
                    <video ref={localVideoRef} autoPlay playsInline style={{ position: 'absolute', top: 20, right: 20, width: 180, border: '2px solid #fff', borderRadius: 10, transform: 'scaleX(-1)', zIndex: 100, background: '#000' }} />
                    <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=1200" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }} alt="Doc"/>
                    <div style={{ position: "absolute", bottom: 20, left: 20, background: "rgba(0,0,0,0.8)", padding: 15, borderRadius: 10, borderLeft: "5px solid red", zIndex: 110 }}>
                        <div style={{ fontSize: 16, fontWeight: 'bold' }}>Dr. Vikash Singh (Chief Resident)</div>
                        <div style={{ fontSize: 10, color: '#00ffcc', marginTop: 5 }}>LINK STATUS: ENCRYPTED & ACTIVE</div>
                    </div>
                </div>
                <button onClick={() => window.close()} style={{ background: "red", padding: 20, border: "none", color: "#fff", borderRadius: 10, marginTop: 15, fontWeight: "bold", cursor: 'pointer' }}>DISCONNECT LINK</button>
             </>
           )}
        </div>
      ) : isGovTab ? (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#111" }}>
           <h1 style={{color: "red", letterSpacing: 5}}>GOVERNMENT DISPATCH 112</h1>
           <button onClick={() => window.location.href="tel:112"} style={{background:"red", padding:"30px 60px", borderRadius:"20px", color:"white", fontSize:"30px", border:"none", fontWeight:'bold', cursor: 'pointer', boxShadow:'0 0 50px #f00'}}>CALL 112 NOW</button>
        </div>
      ) : isSupportTab ? (
        <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
           <h1 style={{fontSize: 16, textAlign:'center'}}>Support Contact:<br/>thisisdev.eng@gmail.com</h1>
        </div>
      ) : (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div className="orb" onClick={async () => {
             const res = await axios.post("http://localhost:5000/api/emergency", { lat: userLocation[0], lng: userLocation[1] });
             localStorage.setItem("active_mission", JSON.stringify(res.data));
             openTab("#mission");
          }} />
          <h1 style={{ marginTop: 30, letterSpacing: 15, fontSize: 24, textShadow: '0 0 20px #00ffcc' }}>LIFEROUTE</h1>
        </div>
      )}
    </div>
  );
}

export default MapComponent;