# 🚑 5G Smart Emergency Response System
### *Integrated AI-based Survival Prediction Engine*

> **"Every minute delayed reduces survival probability by 7–10%. We built a system to eliminate those minutes."**

<p align="center">
  <img src="https://img.shields.io/badge/Hackathon-Devcation%20Delhi%202026-cyan?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Track-Health--Tech%20%2F%20Open%20Innovation-teal?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Team-Devcation-blueviolet?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-Prototype-orange?style=for-the-badge" />
</p>

---

## 🧠 The Problem

**60% of trauma deaths occur within the first hour** — the "Golden Hour."

In India, emergency response times average **15–20 minutes longer** than global benchmarks due to:

| Pain Point | Impact |
|---|---|
| 🚦 Traffic Barrier | Ambulances stuck at manual signals with no dynamic clearing |
| 📡 Communication Gap | Hospitals unaware of patient condition until ambulance arrives |
| 🏥 Zero Preparedness | Surgeons, ER beds, blood types not pre-assigned |
| ⏱️ Delayed Dispatch | No AI-assisted routing to the *optimal* hospital |

---

## 💡 The Solution

A **unified 5G + AI ecosystem** that orchestrates every second between an emergency and patient survival — from the moment an SOS is triggered to the moment the ER team is ready and waiting.

```
USER SOS → AI DISPATCH → OPTIMAL ROUTE → GREEN CORRIDOR → HOSPITAL READY → LIFE SAVED
```

---

## ⚙️ Core Features

### 📱 One-Touch Emergency Trigger
- **Auto-Location Detection** — High-precision GPS pinpoints the user instantly
- **Cond ition Tagging** — Simple icons for Heart Attack, Accident, or Stroke to pre-configure AI response
- **Live Tracking** — Real-time ambulance distance and ETA visualization
- **Direct SOS Link** — One-tap call to the nearest dispatch center

### 🧬 AI Survival Prediction Engine
Our model doesn't just find routes — it evaluates **survival probability** using:

$$P_{survival} = 1 - \left( \frac{T_{ETA}}{T_{critical}} \times S_{vitals} \right)$$

The system recommends the hospital where the patient has the **highest chance of survival**, not simply the closest one.

**AI Prediction Matrix:**

| Parameter | Source | AI Weightage | Impact |
|---|---|---|---|
| Patient Vitals (Heart Rate, SpO2) | Wearables / App | 40% | Critical (Baseline) |
| Time to Arrival (ETA) | Google Maps + AI Route | 35% | High (Time-dependent) |
| Hospital Specialist Availability | Live Dashboards | 15% | Medium (Readiness) |
| Traffic Signal Synchronization | 5G Infrastructure | 10% | Operational Speed |

### 🚦 Smart Traffic Pre-Emption
- **Dynamic Green Corridors** — Traffic lights detect approaching ambulances via 5G and switch to green **500m in advance**
- **Path Clearance Alerts** — Smart vehicles receive dashboard alerts to pull over
- **Automatic Reset** — Signals return to normal flow the moment the ambulance clears the intersection

### 🏥 Hospital-Side Preparedness (Zero-Second Handover)
Hospitals receive patient data **before** the ambulance arrives, enabling:
- ✅ Live streaming of patient vitals
- ✅ Predicted surgery requirements
- ✅ Pre-assignment of surgeons, ER beds, and blood types
- ✅ Instant trauma alerts for specialized staff

---

## 🏗️ System Architecture

```
┌──────────────┐     5G NR      ┌──────────────┐     WebSocket    ┌──────────────┐
│  USER NODE   │ ─────────────► │  5G CLOUD    │ ───────────────► │  AI ENGINE   │
│  Flutter App │                │  Firebase /  │                  │  Python /    │
│  React Native│                │  Node.js     │                  │  PyTorch /   │
└──────────────┘                └──────────────┘                  │  Scikit-Learn│
                                       │                          └──────────────┘
                                       │ MQTT / 5G                        │
                                       ▼                                  │
                               ┌──────────────┐                           │
                               │ EDGE DEVICE  │ ◄─────────────────────────┘
                               │ Smart Signal │   Route + Clearance Logic
                               │ Controller   │
                               └──────────────┘
```

**The 5G Advantage:**
- ⚡ **Ultra-Low Latency** — < 5ms for instantaneous signal control
- 🔗 **Massive Connectivity** — Thousands of traffic sensors and vehicles linked simultaneously
- 🍰 **Network Slicing** — Dedicated bandwidth reserved exclusively for emergency traffic

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React, Flutter (React Native), Google Maps API |
| **Backend** | Node.js, Express, Firebase Cloud Functions |
| **AI / ML** | Python, NumPy, Scikit-Learn, PyTorch |
| **Database** | MongoDB, Firebase Realtime Database |
| **Network** | 5G NR (New Radio), Network Slicing, MQTT |

---

## 🔄 The Digital Lifeline Flow

```
Step 1: TRIGGER    →  User sends SOS via 5G App with condition tag
Step 2: DISPATCH   →  AI identifies nearest available medic unit
Step 3: ROUTE      →  AI predicts optimal path using survival probability
Step 4: CLEAR      →  Traffic signals create a dynamic green corridor
Step 5: READY      →  Hospital pre-assigns ER resources before arrival
Step 6: SAVE       →  Survival probability maximized ✅
```

---

## 📊 Projected Impact

| Metric | Current System | 5G + AI System (Goal) |
|---|---|---|
| Trauma Mortality Probability | 85% | 45% |
| Emergency Response Delay | +15–20 min vs global avg | Reduced to global benchmark |
| Hospital Prep Time | 0 min (reactive) | Pre-arrival (proactive) |
| Signal Clearance | Manual / None | Automated, 500m advance |

> 🎯 **Goal: 40% reduction in emergency mortality rates** through speed optimization and data-driven hospital readiness.

---

## 🚀 Getting Started