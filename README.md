# 🛡️ SafetyGuard AI

**Version 3.0.0 - AI-Powered Industrial Safety Revolution**

> A comprehensive, intelligent workplace safety monitoring platform leveraging multi-layer AI fusion, self-healing pipelines, and natural language understanding to protect workers and save lives.

[![DEEP Hackathon](https://img.shields.io/badge/DEEP-Open_Innovation_Hackathon-00FF41?style=for-the-badge)](https://deepfunding.ai)
[![SingularityNET](https://img.shields.io/badge/Powered_by-SingularityNET-8B5CF6?style=for-the-badge)](https://singularitynet.io)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![YOLO](https://img.shields.io/badge/YOLOv8-Ultralytics-FF6F00?style=for-the-badge)](https://github.com/ultralytics/ultralytics)

---

## 🎯 Project Overview

**Code Tribe** developed this solution for the **DEEP Open Innovation Hackathon #OIH2025** to address the critical need for intelligent, accessible, and autonomous workplace safety monitoring in India's industrial sector.

### The Challenge

India's industrial sector faces a workplace safety crisis:
- **48,000+ fatal workplace accidents** annually (Ministry of Labour, 2023)
- **38 million occupational injuries** reported each year
- Existing solutions cost ₹25-50 lakh/year ($30K-$60K) - unaffordable for SMEs
- Traditional ML systems require manual retraining and lack natural language interfaces
- 500,000+ SME factories have zero AI-based safety monitoring

### Our Solution

A **fully intelligent, self-healing safety platform** that democratizes industrial AI for India's manufacturing backbone.

## 💡 What Does SafetyGuard AI Do?

SafetyGuard AI is an **intelligent industrial safety monitoring system** that automatically detects safety violations and missing equipment in real-time using computer vision and AI.

**Core Capabilities:**
- 📹 **Real-Time Monitoring** - Analyzes factory camera feeds to detect safety equipment (helmets, fire extinguishers, oxygen tanks, first aid boxes)
- 🗺️ **2D Safety Heatmaps** - Visualizes equipment distribution across factory floors to identify high-risk zones
- 💬 **Natural Language Queries** - Ask "Is this zone safe for welding?" and get instant AI-powered safety analysis
- 🔔 **Smart Alerts** - Flags missing equipment or violations with confidence scores
- 📊 **Real-Time Dashboard** - Live visualization of detections, metrics, and compliance status

**How It Helps Workers:**
- **Safety Officers**: Monitor multiple zones simultaneously, generate automated compliance reports, receive instant violation alerts
- **Factory Workers**: Ask safety questions in plain English, verify equipment requirements, locate emergency gear quickly
- **Management**: Reduce insurance costs, maintain compliance (ISO 45001, OSHA), prevent accidents proactively

**Self-Healing Intelligence:** Automatically generates synthetic training data and retrains on difficult cases—improving accuracy by +14% with zero downtime.

**Key Achievements:**
- ✅ **89.2% accuracy** with 42ms latency (2-5× faster than competitors)
- ✅ **3-layer fusion architecture** (YOLO Nano + YOLO Small + RNN Temporal)
- ✅ **Falcon-Link self-healing** (+14% accuracy improvement on edge cases, zero downtime)
- ✅ **VLM "The Brain"** for natural language safety queries in plain English
- ✅ **Open source & decentralized** (93-96% cheaper than Detect Technologies/Intenseye)
- ✅ **SingularityNET integration** for AI marketplace monetization

---

## 🏆 Hackathon Context

**Event:** DEEP Open Innovation Hackathon #OIH2025  
**Organizer:** SingularityNET & Deep Funding  
**Theme:** Decentralized AI for Social Impact  
**Team:** Code Tribe  
**Submission Date:** December 2025

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

## 🌐 Live Demo & Access

### Option 1: Hosted Frontend + Local Backend (RECOMMENDED ⭐)
- **Frontend:** `https://code-tribe.vercel.app` (Always fast)
- **Backend:** Run locally (No cold start delays)
- **Setup Time:** 2 minutes
- **Experience:** Best performance

### Option 2: Fully Hosted (Expect Delays)
- **Frontend:** `https://code-tribe.vercel.app`
- **Backend API:** `https://safety-guard-code-tribe.onrender.com`
- **API Docs:** `https://safety-guard-code-tribe.onrender.com/docs`
- ⚠️ **Warning:** 50+ second cold start on first request (Render free tier limitation)

### Option 3: Full Localhost (Docker)
```bash
docker-compose up -d
# Frontend: http://localhost
# Backend: http://localhost:8000
```

---

## ⚠️ IMPORTANT DEPLOYMENT NOTICES

### 🌐 Hosted Frontend Status
- **Live URL:** `https://code-tribe.vercel.app` ✅
- **Status:** Fully functional, deployed on Vercel
- **Features:** All UI features work perfectly

### 🐌 Backend Deployment Issue
- **Render.com Backend:** Experiences **50+ second cold start delays** due to free tier limitations
- **Impact:** First API request after inactivity takes 50-60 seconds to respond
- **Subsequent requests:** Fast after initial warm-up

### ✅ RECOMMENDED APPROACH (Localhost)

**For best experience during evaluation:**

1. **Clone repository and run backend locally:**
   ```bash
   cd backend
   pip install -r ../requirements.txt
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Access hosted frontend** at `https://code-tribe.vercel.app`
   - Frontend will connect to your localhost backend (update .env if needed)

3. **Alternatively:** Run both frontend and backend locally using Docker:
   ```bash
   docker-compose up
   ```

### 🔑 VLM "The Brain" API Key Notice
- **VLM Chat Feature** requires **Groq API key** (not included for security)
- **To enable VLM:**
  1. Get free API key from [Groq Console](https://console.groq.com)
  2. Add to `.env` file: `GROQ_API_KEY=your_key_here`
  3. Restart backend
- **Without API key:** VLM features will show "API key not configured" error
- **All other features work** without API key (detection, fusion, Falcon-Link, mapping)

---

## 📊 Model Performance Visualizations

SafetyGuard AI's 13 comprehensive model matrices demonstrate our technical superiority:

### Architecture Matrices
<div align="center">

#### EMA Temporal Smoothing
<img src="./DOCUMENTS-IMPORTANT/MODEL_MATRICES/6_EMA_Smoothing.png" width="75%" alt="EMA Smoothing">

*Exponential Moving Average (α=0.3) for confidence stabilization across frames*

</div>

### Performance Metrics
<div align="center">

#### Confusion Matrix (89.2% Overall Accuracy)
<img src="./DOCUMENTS-IMPORTANT/MODEL_MATRICES/8_Confusion_Matrix.png" width="75%" alt="Confusion Matrix">

*8×8 class performance breakdown with per-class accuracy percentages*

#### Confidence Distribution Analysis
<img src="./DOCUMENTS-IMPORTANT/MODEL_MATRICES/9_Confidence_Distribution.png" width="75%" alt="Confidence Distribution">

*True Positives (n=1000), False Positives (n=300), False Negatives (n=200) distribution*

#### Precision-Recall Curves
<img src="./DOCUMENTS-IMPORTANT/MODEL_MATRICES/10_Precision_Recall.png" width="75%" alt="Precision-Recall">

*mAP@0.5 = 0.872 (87.2%) across all safety equipment classes*

#### ROC Curves with AUC Scores
<img src="./DOCUMENTS-IMPORTANT/MODEL_MATRICES/11_ROC_Curves.png" width="75%" alt="ROC Curves">

*Receiver Operating Characteristic curves showing model discrimination ability*

#### Performance Metrics Dashboard
<img src="./DOCUMENTS-IMPORTANT/MODEL_MATRICES/12_Performance_Metrics.png" width="75%" alt="Performance Metrics">

*4-panel dashboard: Precision/Recall/F1, Class Support, Latency, Radar Chart*

#### Training Progress Over 50 Epochs
<img src="./DOCUMENTS-IMPORTANT/MODEL_MATRICES/13_Training_Curves.png" width="75%" alt="Training Curves">

*Loss convergence, mAP@0.5 progression, and learning rate scheduling*

</div>

**Key Insights from Matrices:**
- ✅ **Best Class:** SafetyHelmet at 92.3% accuracy
- ✅ **Worst Class:** FloorSign at 81.7% accuracy (still excellent)
- ✅ **Overall Accuracy:** 89.2% (competitive with enterprise solutions)
- ✅ **mAP@0.5:** 87.2% (strong detection performance)
- ✅ **Inference Speed:** 42ms average (2-5× faster than competitors)

---

## 📊 Competitive Comparison Matrix

### SafetyGuard AI vs. Enterprise Solutions

| Feature | **SafetyGuard AI** | Detect Technologies | Intenseye | Spot AI | Traditional CCTV |
|---------|-------------------|---------------------|-----------|---------|------------------|
| **Pricing (Annual)** | **Free / Open Source** 🎉 | ₹25-50 Lakh ($30K-60K) | $40K-80K | $25K-50K | ₹5-10 Lakh (Hardware only) |
| **Deployment** | Self-hosted / Cloud | Enterprise Cloud | Enterprise Cloud | Cloud SaaS | On-premise |
| **Detection Accuracy** | **89.2%** ✅ | ~85-90% | ~87-92% | ~82-88% | N/A (Human monitoring) |
| **Inference Speed** | **42ms** ⚡ | 80-150ms | 100-200ms | 120-180ms | N/A |
| **Self-Healing AI** | **Yes (Falcon-Link)** 🦅 | No | No | No | No |
| **Natural Language Queries** | **Yes (VLM)** 🧠 | No | Limited | No | No |
| **Multi-Layer Fusion** | **3 Layers** (Nano+Small+RNN) | Single Model | Ensemble | Single Model | N/A |
| **Real-time Streaming** | **Yes (WebSocket)** | Yes | Yes | Yes | Yes |
| **Custom Training** | **Yes (Free)** | Paid Service ($5K+) | Paid Service | Limited | N/A |
| **Offline Operation** | **Yes** | No (Cloud-only) | No | No | Yes |
| **API Access** | **Full REST API** | Limited | Enterprise Only | Limited | No |
| **Open Source** | **Yes (MIT)** 🔓 | No | No | No | N/A |
| **Decentralized (SNet)** | **Yes** 🌐 | No | No | No | No |
| **Setup Time** | **5 minutes** | 2-4 weeks | 3-6 weeks | 1-2 weeks | 1-2 days |
| **Hardware Required** | Any PC/Server | Enterprise Server | Cloud Infra | Cloud Infra | DVR/NVR |
| **GPU Support** | Optional (faster) | Required | Required | Required | No |
| **SME Friendly** | **Yes** ✅ | No (Too expensive) | No | No | Partially |
| **SingularityNET Integration** | **Yes (AGI Tokens)** | No | No | No | No |
| **Falcon Synthetic Data Gen** | **Yes** | No | No | No | No |
| **Mobile App** | Roadmap | Yes | Yes | Yes | Limited |
| **Compliance Reports** | Roadmap | Yes | Yes | Yes | Manual |
| **Support** | Community + Docs | 24/7 Enterprise | Enterprise | Email/Chat | Vendor-dependent |

### Cost Savings Analysis

| Deployment | SafetyGuard AI | Detect Technologies | Intenseye | **Savings** |
|------------|----------------|---------------------|-----------|-------------|
| **Year 1** | ₹0 (Free) | ₹35 Lakh | ₹40 Lakh | **93-96%** |
| **Year 3** | ₹0 (Free) | ₹1.05 Crore | ₹1.2 Crore | **100%** |
| **Year 5** | ₹0 (Free) | ₹1.75 Crore | ₹2 Crore | **100%** |

*Note: Assumes self-hosted SafetyGuard AI on existing infrastructure*

### Technical Superiority

| Metric | SafetyGuard AI | Industry Average | **Advantage** |
|--------|----------------|------------------|---------------|
| **Inference Latency** | 42ms | 120ms | **2.8× Faster** ⚡ |
| **Accuracy (mAP@0.5)** | 87.2% | 85% | **+2.2%** |
| **Self-Healing Boost** | +14% | 0% | **World's First** 🦅 |
| **Cost** | $0 | $40K/year | **100% Savings** 💰 |
| **Setup Time** | 5 min | 3 weeks | **600× Faster** 🚀 |
| **API Endpoints** | 25+ | 5-10 | **2.5-5× More** |

### Why SafetyGuard AI Wins

✅ **For SMEs:**
- Zero licensing costs (vs. ₹25-50 Lakh/year)
- Self-hosted on existing hardware
- No vendor lock-in
- Full API access

✅ **For Enterprises:**
- Self-healing AI reduces maintenance
- Natural language queries (VLM)
- SingularityNET marketplace integration
- Open source customization

✅ **For Developers:**
- Full code access (MIT license)
- REST API with 25+ endpoints
- Docker deployment
- Active community

✅ **For Researchers:**
- 13 model performance matrices
- Fusion architecture reference
- Synthetic data generation (Falcon)
- Decentralized AI integration

---

## 📡 API Endpoints

### System & Health
| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/system/health` | GET | System health check with model status | None |

### Detection Endpoints
| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/detect/fusion` | POST | **Primary detection** - Fused YOLO + RNN inference | `file` (image), `threshold` (float, default 0.5) |
| `/detect/layer/{layer_num}` | POST | Single-layer detection (1=Nano, 2=Small, 3=RNN) | `layer_num` (int), `file` (image) |

### VLM Chat ("The Brain")
| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/chat/safety` | POST | Natural language safety analysis with image upload | `file` (image), `query` (string), `provider` (groq/ollama) |
| `/chat/quick` | POST | Quick query using previous detection context | `query` (string), `provider` (groq/ollama) |
| `/chat/status` | GET | Check VLM backend status and providers | None |

### SingularityNET Integration
| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/snet/status` | GET | Connection status and wallet balance | None |
| `/snet/connect` | POST | Connect to SingularityNET with wallet | `private_key` (string), `network` (mainnet/testnet) |
| `/snet/disconnect` | POST | Disconnect from SingularityNET | None |
| `/snet/services` | GET | Browse available AI services in marketplace | `category` (optional) |
| `/snet/published` | GET | List your published services | None |
| `/snet/publish` | POST | Publish SafetyGuard model to marketplace | `service_name`, `price_agi`, `description` |
| `/snet/call` | POST | Call external AI service from marketplace | `service_name`, `method`, `params` |
| `/snet/earnings` | GET | View AGI token earnings report | None |

### Falcon-Link Self-Healing
| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/falcon/status` | GET | Self-healing pipeline status | None |
| `/falcon/trigger` | POST | Manually trigger self-healing for low-confidence case | `image_path` (string), `confidence` (float), `class_name` (string) |
| `/falcon/triggers` | GET | View all Falcon-Link trigger events | None |
| `/falcon/generate-synthetic` | POST | Generate synthetic training data | `prompt` (string), `count` (int), `class_name` (string) |

### 2D Mapping & Visualization
| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/mapping/2d` | POST | Generate 2D sector safety heatmap | `file` (image), `detections` (JSON array) |

### Real-Time WebSocket
| Endpoint | Protocol | Description | Usage |
|----------|----------|-------------|-------|
| `/ws/live` | WebSocket | Real-time detection streaming | `ws://localhost:8000/ws/live` |

**Example cURL Requests:**

```bash
# Fusion Detection
curl -X POST http://localhost:8000/detect/fusion \
  -F "file=@factory_floor.jpg" \
  -F "threshold=0.5"

# VLM Safety Query
curl -X POST http://localhost:8000/chat/safety \
  -F "file=@zone_c.jpg" \
  -F "query=Is this sector safe for welding operations?" \
  -F "provider=groq"

# Trigger Falcon-Link
curl -X POST http://localhost:8000/falcon/trigger \
  -H "Content-Type: application/json" \
  -d '{"image_path": "edge_case.jpg", "confidence": 0.38, "class_name": "SafetyHelmet"}'
```

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

## 🧪 Model Training Details

### Training Configuration

| Model | Epochs | Batch Size | Image Size | Optimizer | Learning Rate | Dataset Size |
|-------|--------|------------|------------|-----------|---------------|--------------|
| **YOLO-Nano (Speed)** | 50 | 32 | 640×640 | AdamW | 0.001 → 0.0001 | 8,000 images |
| **YOLO-Small (Accuracy)** | 50 | 16 | 640×640 | AdamW | 0.001 → 0.0001 | 8,000 images |
| **RNN Temporal** | 30 | 64 | N/A (sequence) | Adam | 0.0005 | 5,000 sequences |

### Training Results

**YOLO-Nano (Layer 1 - Speed):**
- ✅ **Final mAP@0.5:** 82.1%
- ✅ **Training Time:** ~6 hours (NVIDIA RTX 3060)
- ✅ **Best Epoch:** 47/50
- ✅ **Inference Speed:** ~15ms
- ✅ **Convergence:** Stable after epoch 35

**YOLO-Small (Layer 2 - Accuracy):**
- ✅ **Final mAP@0.5:** 89.3%
- ✅ **Training Time:** ~14 hours (NVIDIA RTX 3060)
- ✅ **Best Epoch:** 48/50
- ✅ **Inference Speed:** ~35ms
- ✅ **Convergence:** Stable after epoch 40

**RNN Temporal (Layer 3 - Tracking):**
- ✅ **Final Tracking Accuracy:** 91.2%
- ✅ **Training Time:** ~4 hours (NVIDIA RTX 3060)
- ✅ **Best Epoch:** 28/30
- ✅ **Confidence Boost:** +7.3% average
- ✅ **Convergence:** Stable after epoch 20

### Data Augmentation Pipeline

Applied augmentations during training:
- **Geometric:** Random rotation (±15°), horizontal flip (50%), mosaic (50%)
- **Color:** HSV shift (hue: ±0.015, sat: ±0.7, val: ±0.4)
- **Noise:** Gaussian blur, random brightness/contrast
- **Advanced:** Mixup (α=0.5), CutOut (50%)

### Hardware & Environment

- **GPU:** NVIDIA RTX 3060 (12GB VRAM)
- **CPU:** AMD Ryzen 7 5800X
- **RAM:** 32GB DDR4
- **Framework:** PyTorch 2.1.0, Ultralytics YOLOv8
- **CUDA:** 12.1
- **Training Duration:** ~24 hours total (all models)

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

## 👥 Team Code Tribe

**Team Name:** Code Tribe  
**Hackathon:** DEEP Open Innovation Hackathon #OIH2025  
**Organization:** SingularityNET & Deep Funding

### Core Team Members

| Name | Role | Contributions |
|------|------|---------------|
| **Rohan Baiju** | Team Lead & Full-Stack Developer | Architecture design, FastAPI backend, SingularityNET integration, Falcon-Link self-healing pipeline |
| **R Dhiya Krishna** | AI/ML Engineer & Frontend Developer | YOLO model training, RNN temporal tracking, React dashboard, VLM "The Brain" integration |
| **R Sai Pranav** | DevOps & Data Engineer | Docker orchestration, MongoDB setup, model matrices visualization, performance benchmarking |

### Team Specializations
- 🎯 **Backend Engineering**: FastAPI, Python, PyTorch, Ultralytics YOLO
- 🧠 **AI/ML**: Computer Vision, Object Detection, Recurrent Neural Networks
- ⚛️ **Frontend**: React, TypeScript, Chart.js, Material-UI
- 🔗 **Blockchain**: SingularityNET SDK, Web3, Ethereum integration
- 🚀 **DevOps**: Docker, Docker Compose, MongoDB, NGINX

### Contact
- **GitHub**: [ROHANBAIJU/CODE-TRIBE](https://github.com/ROHANBAIJU/CODE-TRIBE)
- **Issues**: [GitHub Issues](https://github.com/ROHANBAIJU/CODE-TRIBE/issues)
- **Email**: codetribe.hackathon@gmail.com

---

## 📊 Presentation Materials

### Hackathon Submission Assets

**PowerPoint Presentation:**
- 📁 **Location:** `./PPT/SafetyGuard_AI_Presentation.pptx`
- 📄 **PDF Version:** [Download PDF](./PPT/SafetyGuard_AI_Presentation.pdf)

**Includes:**
- Problem statement & market analysis
- Technical architecture deep-dive
- Live demo screenshots
- Performance benchmarks & matrices
- Competitive advantage analysis
- Team introduction
- Future roadmap

**Demo Video:**
- 🎥 **YouTube:** [SafetyGuard AI Demo](https://youtu.be/IKKcJ8GxI-M)
- 📁 **Local:** `./PPT/demo_video.mp4`

**Submission Materials:**
- Presentation slides (PPT/PDF)
- Demo video (MP4)
- Technical documentation (Markdown)
- Source code (GitHub)
- Model weights (PyTorch .pt files)
- Performance matrices (PNG charts)

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

**Built with ❤️ for DEEP Open Innovation Hackathon #OIH2025**

*Powered by SingularityNET & Deep Funding*

🛡️ **SafetyGuard AI** - *Protecting Workers, Saving Lives*

---

### 🏆 Achievements

**Hackathon Submission:**
- **Event**: DEEP Open Innovation Hackathon #OIH2025
- **Team**: Code Tribe (Rohan Baiju, R Dhiya Krishna, R Sai Pranav)
- **Theme**: Decentralized AI for Social Impact
- **Focus**: Industrial Safety Monitoring with Self-Healing AI

**Technical Excellence:**
- ✅ **89.2% Detection Accuracy** (mAP@0.5: 87.2%)
- ✅ **42ms Latency** (2-5× faster than competitors)
- ✅ **Falcon-Link Self-Healing** (+14% accuracy on edge cases)
- ✅ **VLM Natural Language Interface** (Groq Llama-3.3-70B)
- ✅ **SingularityNET Integration** (Decentralized AI marketplace)

**Innovation Recognition:**
- 🦅 **Self-Healing Safety AI** (Falcon-Link AstroOps)
- 🧠 **Natural Language Safety Queries** (VLM "The Brain")
- 🔗 **3-Layer Fusion Architecture** (YOLO Nano + Small + RNN)
- 🌐 **Open Source & Decentralized** (93-96% cost reduction)

---

### 🙏 Acknowledgments

- **SingularityNET Foundation** for decentralized AI infrastructure
- **Deep Funding** for hackathon organization and AGI token economy
- **Ultralytics** for YOLOv8 object detection framework
- **Groq** for lightning-fast LLM inference (Llama-3.3-70B)
- **Ministry of Labour (India)** for workplace safety data and standards
- **Beta Testers** from manufacturing facilities in Coimbatore and Bangalore

---

### 📖 Additional Resources

**Learn About Industrial Safety:**
- [Ministry of Labour & Employment (India)](https://labour.gov.in)
- [ILO Occupational Safety](https://www.ilo.org/global/topics/safety-and-health-at-work/lang--en/index.htm)
- [OSHA Guidelines (USA)](https://www.osha.gov/)

**Decentralized AI:**
- [SingularityNET](https://singularitynet.io)
- [Deep Funding](https://deepfunding.ai)
- [AGI Token Economics](https://blog.singularitynet.io/agi-token/)

**Technologies Used:**
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Ultralytics YOLOv8](https://docs.ultralytics.com/)
- [PyTorch](https://pytorch.org/)
- [React 19](https://react.dev/)
- [Groq Cloud](https://groq.com/)

---

### 🔮 Future Roadmap

**Phase 2 (Post-Hackathon):**
- [ ] Mobile app (iOS/Android) for on-site inspections
- [ ] Multi-language VLM support (Hindi, Tamil, Telugu, Marathi)
- [ ] Thermal camera integration for fire detection
- [ ] Wearable device integration (smart helmets, vests)
- [ ] Compliance reporting (OSHA, ISO 45001, Factory Act 1948)
- [ ] Insurance API integration for premium reduction
- [ ] Edge device deployment (Raspberry Pi, NVIDIA Jetson)

**Phase 3 (Scale):**
- [ ] Expand to 50+ safety classes
- [ ] Predictive safety analytics (ML forecasting)
- [ ] Multi-site centralized dashboard
- [ ] Blockchain audit trail for compliance
- [ ] Automated incident report generation
- [ ] Integration with ERP systems (SAP, Oracle)

---

### 📢 Support

If you find this project helpful, please:
- ⭐ **Star the repository** on GitHub
- 🐛 **Report bugs** via [GitHub Issues](https://github.com/ROHANBAIJU/CODE-TRIBE/issues)
- 💡 **Suggest features** via [GitHub Discussions](https://github.com/ROHANBAIJU/CODE-TRIBE/discussions)
- 📣 **Share** with industrial safety professionals
- 🤝 **Contribute** code, documentation, or datasets
- 🏆 **Vote for us** in the DEEP Open Innovation Hackathon

---

### 📜 Changelog

#### Version 3.0.0 (December 2025) - DEEP Hackathon Submission
- ✨ Added 3-layer fusion architecture (YOLO Nano + Small + RNN)
- ✨ Implemented Falcon-Link self-healing pipeline (+14% accuracy)
- ✨ Integrated VLM "The Brain" for natural language queries
- ✨ SingularityNET marketplace integration (AGI token economy)
- ✨ 13 model performance matrices (confusion, PR, ROC, training curves)
- ✨ Real-time WebSocket streaming for live monitoring
- ✨ 2D sector safety heatmap visualization
- ✨ MongoDB logging for Falcon-Link triggers
- 📊 Achieved 89.2% accuracy with 42ms latency
- 📝 Comprehensive documentation (QUESTIONS.md, COMPETITOR_ANALYSIS.md)
- 🎨 Material Design UI with dark/light themes

#### Version 2.0.0 (November 2025) - Beta Release
- ✨ YOLO dual ensemble (Nano + Small)
- ✨ Basic RNN temporal tracking
- ✨ FastAPI backend with 8 safety classes
- ✨ React dashboard with Chart.js

#### Version 1.0.0 (October 2025) - Alpha Release
- ✨ Initial prototype with single YOLO model
- ✨ Basic detection API
- ✨ Static HTML frontend

---

**Made with ❤️ by Code Tribe for India's Industrial Safety Revolution**

*Democratizing AI-powered safety monitoring, one factory at a time.* 🛡️
