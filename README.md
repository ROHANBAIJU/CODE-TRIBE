# 🛡️ SafetyGuard AI

> **Industrial Safety Monitoring Platform powered by AI & SingularityNET**
> 
> *DEEP Open Innovation Hackathon #OIH2025 Submission*

<div align="center">

![SafetyGuard AI](https://img.shields.io/badge/SafetyGuard_AI-Industrial_Safety-00FF41?style=for-the-badge&logo=shield&logoColor=white)
[![SingularityNET](https://img.shields.io/badge/Powered_by-SingularityNET-8B5CF6?style=for-the-badge)](https://singularitynet.io)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)

</div>

---

## 🌟 Overview

**SafetyGuard AI** is a next-generation industrial safety monitoring platform designed to revolutionize workplace safety in manufacturing plants, construction sites, and industrial facilities. Built for the **DEEP Open Innovation Hackathon #OIH2025** by SingularityNET and Deep Funding.

### 🎯 Problem Statement

India's industrial sector faces significant safety challenges:
- **48,000+ fatal workplace accidents** annually
- **38 million occupational injuries** reported each year
- Many facilities lack adequate safety monitoring systems
- Existing solutions are expensive and not AI-powered

### 💡 Our Solution

SafetyGuard AI provides:
1. **🔍 Real-time Safety Equipment Detection** - YOLO-powered detection of safety gear
2. **🧠 The Brain (VLM Chat)** - Natural language safety queries using Vision-Language Models
3. **🔗 Fusion Architecture** - Multi-layer YOLO ensemble with RNN temporal tracking
4. **🦅 Falcon-Link** - Self-healing pipeline that auto-generates synthetic data for edge cases
5. **🌐 SingularityNET Integration** - Decentralized AI marketplace monetization

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      SafetyGuard AI Platform                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Camera    │ → │  YOLO Speed │ →  │             │         │
│  │   Input     │    │   (Nano)    │    │   FUSION    │         │
│  └─────────────┘    └─────────────┘    │   ENGINE    │         │
│                                        │             │         │
│  ┌─────────────┐    ┌─────────────┐    │  Weighted   │         │
│  │   Image     │ → │  YOLO Acc   │ →  │  Boxes      │ → API   │
│  │   Upload    │    │  (Small)    │    │  Fusion     │         │
│  └─────────────┘    └─────────────┘    │             │         │
│                                        │             │         │
│  ┌─────────────┐    ┌─────────────┐    │  + RNN      │         │
│  │  Temporal   │ → │    RNN      │ →  │  Temporal   │         │
│  │   Stream    │    │  Tracker    │    │  Boost      │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                              ↓                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    "The Brain" (VLM)                     │  │
│  │  Natural language safety queries powered by Llama Vision │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               Falcon-Link Self-Healing                    │  │
│  │  Low confidence → Synthetic data → Retrain → Hot-swap    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              SingularityNET Integration                   │  │
│  │         Publish models → Earn AGI → Decentralized         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Features

### 1. 🔍 Multi-Layer Detection
- **YOLO Speed (Nano)** - Fast inference for real-time monitoring (~15ms)
- **YOLO Accuracy (Small)** - Higher precision for critical detections (~35ms)
- **RNN Temporal** - Track objects across frames with confidence boosting
- **Total Fusion Latency: ~42ms** ✅

### 2. 🧠 The Brain (VLM Chat)
Ask natural language questions about safety:
- *"Is this sector safe for workers?"*
- *"What safety equipment is missing?"*
- *"Analyze this zone for fire hazards"*

### 3. 🦅 Falcon-Link AstroOps (Self-Healing)
Self-healing pipeline when confidence drops:
1. **Monitor** - Continuous confidence tracking
2. **Detect** - Low confidence threshold triggered (<45%)
3. **Generate** - Duality Falcon creates synthetic training data
4. **Retrain** - Fine-tune model on edge cases
5. **Deploy** - Hot-swap weights at edge (zero downtime)
6. **Result**: +14% average accuracy improvement

### 4. 🌐 SingularityNET Integration
- Publish safety detection models to marketplace
- Earn AGI tokens for API calls
- Access decentralized AI services
- Monetize your AI contributions

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose (for local development)
- Python 3.10+ & Node.js 18+ (for local development)
- NVIDIA GPU (optional, for faster inference)
- Groq API key (optional, for VLM features)

### Option 1: Docker (Recommended for Local Development)

```bash
# Clone the repository
git clone https://github.com/ROHANBAIJU/CODE-TRIBE.git
cd CODE-TRIBE

# Copy environment file
cp .env.example .env
# Edit .env with your GROQ_API_KEY

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:8000
```

### Option 2: Local Development

```bash
# Backend
cd backend
pip install -r ../requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Option 3: Production Deployment

**Backend:** Deploy to [Render.com](https://render.com) (Free tier available)  
**Frontend:** Deploy to [Vercel](https://vercel.com) (Free tier available)

📖 **Deployment Guides:**
- **Backend (Render):** [DEPLOYMENT.md](DEPLOYMENT.md)
- **Frontend (Vercel):** [DEPLOYMENT_FRONTEND.md](DEPLOYMENT_FRONTEND.md)

---

## 🌐 Live Demo

- **Frontend:** `https://code-tribe.vercel.app` (Update with your Vercel URL!)
- **Backend API:** `https://safety-guard-code-tribe.onrender.com`
- **API Docs:** `https://safety-guard-code-tribe.onrender.com/docs`

---

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/system/health` | GET | System health check |
| `/detect/fusion` | POST | Fused detection with YOLO + RNN |
| `/chat/safety` | POST | VLM safety analysis with image |
| `/chat/quick` | POST | Quick query with previous detections |
| `/snet/status` | GET | SingularityNET status |
| `/snet/connect` | POST | Connect to SNet wallet |
| `/snet/publish` | POST | Publish service to marketplace |
| `/snet/call` | POST | Call marketplace service |
| `/snet/earnings` | GET | View AGI earnings report |

---

## 🎯 Safety Classes Detected

| Class | Description | Use Case |
|-------|-------------|----------|
| 🪖 SafetyHelmet | Worker head protection | Construction, Manufacturing |
| 🧯 FireExtinguisher | Fire suppression device | All industrial settings |
| 🫁 OxygenTank | Emergency oxygen supply | Chemical plants, Mines |
| 🩹 FirstAidBox | Medical emergency supplies | All workplaces |
| ☎️ EmergencyPhone | Emergency communication | Factory floors |
| 🚨 FireAlarm | Fire detection/alert system | All buildings |
| 🔵 NitrogenTank | Industrial gas container | Manufacturing |
| ⚡ SafetySwitchPanel | Electrical safety controls | Power plants |

---

## 🏆 Hackathon Alignment

### SingularityNET Theme Fit
- ✅ **Decentralized AI** - Marketplace integration for model monetization
- ✅ **AGI Token Economy** - Earn AGI for API calls
- ✅ **Autonomous Systems** - Self-healing AstroOps pipeline
- ✅ **Multi-modal AI** - Vision + Language understanding
- ✅ **Beneficial AI** - Improving industrial safety, saving lives

### Innovation Points
1. **Self-Healing AI** - AstroOps pipeline mimics biological healing
2. **Fusion Architecture** - Novel multi-layer detection approach
3. **VLM Integration** - Natural language safety queries
4. **Edge Deployment** - Zero-downtime model updates

---

## 📈 Performance Metrics

| Metric | Value | Target |
|--------|-------|--------|
| Detection Latency | ~42ms | <50ms ✅ |
| mAP@0.5 | 0.86 | >0.80 ✅ |
| Fusion Improvement | +19% | - |
| Self-Healing Accuracy Boost | +14% | - |
| Concurrent Users | 100+ | - |

---

## 📚 Documentation

For comprehensive information, see:
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Backend deployment guide for Render
- **[DEPLOYMENT_FRONTEND.md](DEPLOYMENT_FRONTEND.md)** - Frontend deployment guide for Vercel
- **[QUICKSTART.md](QUICKSTART.md)** - Get started in under 5 minutes
- **[PRESENTATION.md](PRESENTATION.md)** - Hackathon presentation script
- **[QUESTIONS.md](DOCUMENTS-IMPORTANT/QUESTIONS.md)** - Judge Q&A preparation
- **[COMPETITOR_ANALYSIS.md](DOCUMENTS-IMPORTANT/COMPETITOR_ANALYSIS.md)** - Market comparison

---

## 📁 Project Structure

```
CODE-TRIBE/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── core/
│   │   ├── fusion_enhanced.py    # YOLO fusion engine
│   │   ├── rnn_temporal.py       # RNN tracking
│   │   ├── vlm_chat.py           # VLM "The Brain"
│   │   └── singularitynet.py     # SNet integration
│   └── models/
│       ├── yolo_speed.pt
│       ├── yolo_accuracy.pt
│       └── rnn_temporal.pt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SafetyChat.tsx
│   │   │   ├── AstroOpsPipeline.tsx
│   │   │   └── SingularityNetPanel.tsx
│   │   └── pages/
│   │       └── Dashboard.tsx
│   └── package.json
├── DOCUMENTS-IMPORTANT/
│   ├── QUESTIONS.md              # Judge Q&A & competitor analysis
│   └── COMPETITOR_ANALYSIS.md    # Market comparison
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
└── requirements.txt
```

---

## 👥 Team CODE-TRIBE

| Role | Contribution |
|------|-------------|
| 🎯 Full-Stack Development | Backend API + Frontend UI |
| 🧠 AI/ML Engineering | YOLO models + RNN tracking |
| 🔗 Integration | SingularityNET + VLM Chat |
| 🎨 UX Design | Dashboard + Visualizations |

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ for DEEP Open Innovation Hackathon #OIH2025**

*Powered by SingularityNET & Deep Funding*

🛡️ **SafetyGuard AI** - *Protecting Workers, Saving Lives*

</div>
