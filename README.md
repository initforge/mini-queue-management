# 🎫 QStream - Smart Queue Management System

> A real-time queue management system for service centers, featuring multi-counter support, WebSocket updates, and performance analytics.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)

---

## 🎯 Problem & Solution

| ❌ Problem | ✅ QStream solves it |
|------------|---------------------|
| Long queues, unknown wait time | Real-time tracking, estimated wait |
| Staff don't know who's next | Auto-call, per-counter notifications |
| Managers lack performance visibility | Dashboard analytics, staff ratings |
| Hard to coordinate shifts | Drag & drop scheduling |

---

## 🏗️ Tech Stack

```
Frontend          Backend           Database         Infra
─────────         ───────           ────────         ─────
React 18          FastAPI           PostgreSQL 15    Docker
TailwindCSS       SQLAlchemy        Redis            Nginx
React Query       WebSocket         
Recharts          JWT Auth          
```

- Designed as a **decoupled SPA + API architecture**
- Optimized for **real-time workloads** using WebSocket & Redis pub/sub

---

## ⚡ Quick Start (5 min)

```bash
# Clone
git clone https://github.com/initforge/mini-queue-management.git
cd mini-queue-management

# Run
docker-compose up -d --build

# Done! 🎉
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000/docs
```

**Login:** `admin@qstream.vn` / `admin123`

---

##  Key Features

- **🔄 Realtime Queue** - WebSocket instant updates
- **📊 Dashboard Analytics** - Hourly/daily/weekly stats
- **👥 Multi-role** - Admin / Manager / Staff
- **📅 Schedule Management** - Drag & drop shifts
- **⭐ Rating System** - 5-star feedback
- **🤖 AI Helper** - Gemini integration

---

## 📁 Project Structure

```
├── backend/     → FastAPI + SQLAlchemy + WebSocket
├── frontend/    → React + TailwindCSS + Recharts
├── database/    → PostgreSQL schema + seed data
└── docs/        → Architecture documentation
```

📖 **Architecture details:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## 🚀 Production Deploy

```bash
# On your VPS
git clone <repo> /opt/qstream && cd /opt/qstream

# Replace <SERVER_IP> with your VPS IP or domain
sed -i 's/YOUR_SERVER_IP/<SERVER_IP>/g' .env.production frontend/.env.production

# Generate secure JWT secret
sed -i "s/CHANGE_THIS.*$/$(openssl rand -hex 32)/g" .env.production

# Deploy
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

---

## 🛠️ Configuration

<details>
<summary><b>Environment Variables</b></summary>

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection |
| `JWT_SECRET_KEY` | Auth secret (`openssl rand -hex 32`) |
| `CORS_ORIGINS` | Allowed origins |
| `REACT_APP_API_URL` | Backend URL for frontend |

</details>

<details>
<summary><b>API Endpoints</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/tickets` | List tickets |
| POST | `/api/v1/tickets` | Create ticket |
| WS | `/ws/{client_id}` | Realtime updates |

Full docs: `http://localhost:8000/docs`

</details>

---

## 💡 What I Learned

- Designing **real-time systems** with WebSocket & Redis pub/sub
- Managing **async state** in React with React Query
- **Dockerizing fullstack applications** for production
- Implementing **role-based access control** (RBAC)
- Building **analytics dashboards** with Recharts

---

## 📄 License

MIT

---

<p align="center">
  <b>Built with ❤️ for learning & portfolio</b>
</p>
