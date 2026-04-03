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
|🔗 Lack of Real-Time Coordination | No proper communication between ambulance, traffic systems, and hospitals
|🤖 Lack of Intelligent Decision Support | Absence of AI for route optimization, hospital selection, and survival prediction


---

## 💡 The Solution

A **unified 5G + AI ecosystem** that orchestrates every second between an emergency and patient survival — from the moment an SOS is triggered to the moment the ER team is ready and waiting.

```
USER SOS → AI DISPATCH → OPTIMAL ROUTE → GREEN CORRIDOR → HOSPITAL READY → LIFE SAVED
```
---

## 📱 App Screenshots

| One-Tap SOS Activation System | Live Ambulance Tracking | Predictive Survival Analytics | Smart Clinical Reasoning Agent | Government Ambulance Dispatch System | Live Patient Monitoring & Consultation |
|:---:|:---:|:---:|:---:|:---:|:---:|
| ![SOS](assets/screenshots/Screenshot%202026-04-04%20004302.png) | ![Tracking](assets/screenshots/Screenshot%202026-04-04%20004715.png) | ![Vitals](assets/screenshots/Screenshot%202026-04-04%20004508.png) | ![AI](assets/screenshots/Screenshot%202026-04-04%20004330.png) | ![Dispatch](assets/screenshots/Screenshot%202026-04-04%20004638.png) | ![Consult](assets/screenshots/Screenshot%202026-04-04%20004602.png) |

### 🚀 Features Overview
- **One-Tap SOS Activation System** → Triggers full emergency response chain instantly  
- **Live Ambulance Tracking** → Real-time route + ETA visualization  
- **Predictive Survival Analytics Engine** → AI-based survival probability estimation  
- **Smart Clinical Reasoning Agent** → Detects diseases via voice & text symptoms  
- **Government Ambulance Dispatch System** → Assigns nearest public ambulance  
- **Live Patient Monitoring & Consultation** → Real-time doctor communication  

---
## ⚙️ Core Features

### 📱 One-Touch Emergency Trigger

A unified interface that instantly activates the entire emergency response chain.

**Key Capabilities:**

* **Auto-Location Detection** — Instantly pinpoints the user using high-precision GPS
* **Condition Tagging** — Simple icons for Heart Attack, Accident, or Stroke to pre-configure AI response
* **Live Tracking** — Real-time ambulance distance and ETA visualization for the user
* **Direct SOS Link** — One-tap call to the nearest dispatch center

---

### 🧬 AI Survival Prediction Engine

Our model doesn't just find routes — it evaluates **survival probability** using:

```math
P_{survival} = 1 - \left( \frac{T_{ETA}}{T_{critical}} \times S_{vitals} \right)
```

The system recommends the hospital where the patient has the **highest chance of survival**, not simply the closest one.

#### 📊 AI Prediction Matrix

| Parameter                         | Source               | AI Weightage | Impact                |
| --------------------------------- | -------------------- | ------------ | --------------------- |
| Patient Vitals (Heart Rate, SpO2) | Wearables / App      | 40%          | Critical (Baseline)   |
| Time to Arrival (ETA)             | Maps + AI Routing    | 35%          | High (Time-dependent) |
| Hospital Specialist Availability  | Live Dashboards      | 15%          | Medium (Readiness)    |
| Traffic Signal Synchronization    | Smart Infrastructure | 10%          | Operational Speed     |

---

### 🚦 Smart Traffic Pre-Emption

* **Dynamic Green Corridors** — Traffic lights switch to green in advance for ambulances
* **Path Clearance Alerts** — Nearby vehicles receive alerts to clear the route
* **Automatic Reset** — Signals return to normal after ambulance passes

---

### 🚑 Government Ambulance Dispatch System

* **Automated Ambulance Assignment** — Assigns nearest available government ambulance
* **Geo-Optimized Routing** — Selects fastest route based on real-time traffic
* **Public Infrastructure Integration** — Connects with emergency response networks

---

### 🧠 Smart Clinical Reasoning Agent

* **Multimodal Interaction** — Supports both voice and text input
* **Symptom-Based Diagnosis** — Predicts possible diseases using AI
* **Real-Time Health Guidance** — Provides immediate actionable insights

---

### 🎥 Live Patient Monitoring & Consultation

* **Real-Time Telemedicine Interface** — Enables video communication with doctors
* **Live Vitals Streaming** — Patient condition shared continuously
* **Doctor Preparedness** — Enables faster medical decision-making

---

### 🏥 Hospital-Side Preparedness (Zero-Second Handover)

Hospitals receive patient data **before** the ambulance arrives, enabling:

* ✅ Live streaming of patient vitals
* ✅ Predicted surgery requirements
* ✅ Pre-assignment of surgeons, ER beds, and blood types
* ✅ Instant trauma alerts for specialized staff

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
| **Frontend** | React, Flutter (React Native), leaflet |
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


## 👥 Team

| Name | Role | GitHub | LinkedIn |
|---|---|---|---|
| RAJ SONI | Full Stack | [@rajsoni1819](https://github.com/rajsoni1819) | [Raj Soni](https://www.linkedin.com/in/raj-soni-4428013a9) |
| ARYAN SINGH | PPT + CODE | [@aryansingh1501](https://github.com/aryansingh1501) | [Aryan Singh](https://www.linkedin.com/in/aryan-singh-1aa628320) |
| DEV | GitHub Repo Creator | [@the-engineer-dev](https://github.com/the-engineer-dev) | [Dev Srivastava](https://www.linkedin.com/in/dev-srivastava-950417397) |
| SOMYA YADAV | Deployment | [@somya2212-hub](https://github.com/somya2212-hub) | [Somya Yadav](https://www.linkedin.com/in/somya-yadav-4aa6383a3) |

---

## 🚀 Getting Started