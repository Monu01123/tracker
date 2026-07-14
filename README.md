# 🏆 DSA A2Z Team Tracker

> A gamified, real-time 4-person team competition & progress tracker built for practicing [Striver's A2Z DSA Sheet](https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/).

![Node.js](https://img.shields.io/badge/Node.js-24+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-node:sqlite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Vanilla CSS](https://img.shields.io/badge/Vanilla_CSS-Design_System-ff007f?style=for-the-badge&logo=css3&logoColor=white)

---

## ✨ Features

- **👥 Fixed 4-Person Roster**: Simple 1-click name-based profile switching (no password friction). Teammate names and neon avatar themes can be customized in Settings.
- **⚡ Quick Problem Logging**: Stepper counters (`Easy / Medium / Hard`) with 1-tap `+1` preset buttons, custom past-date selectors, and instant rolling `Undo` rollback.
- **👑 XP Arena Leaderboards**:
  - **All-Time & Weekly Tabs**: Ranked strictly by XP (`Easy = 10 XP | Medium = 20 XP | Hard = 30 XP`) with E/M/H breakdown pills.
  - **Live Spotlight #1**: Highlighted with a glowing golden crown and animated progress bars.
  - **Automatic Weekly Reset**: Resets every Monday at `00:00` local time while keeping all-time scores intact.
- **🔥 13-Week Contribution Heatmap**: GitHub-style 91-day activity grid with daily problem counts, streak trackers (`Current Streak` and `Max Streak`), and hover breakdowns.
- **🎖️ Trophy Cabinet & Badges**: Categorized achievement grid (`Milestone`, `Difficulty`, `Streak`, `Weekly Challenge`) with real-time unlocked/locked status and progress indicators.
- **📝 Live Sync across Devices**: SQLite database (`node:sqlite`) with instant 10-second background polling and inline history management (edit solve counts across devices or delete entries).

---

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript + Vite + Lucide Icons + Custom Vanilla CSS Design System (`index.css`).
- **Backend**: Node.js 24 (`node:sqlite` built-in native SQLite engine) + Express + CORS + Zod validation.
- **Deployment**: Unified root build pipeline ready for **Render.com** (`render.yaml`) and Docker containerization (`Dockerfile`).

---

## 🚀 Getting Started Locally

### 1. Requirements
Ensure you have **Node.js v22.5+ or v24+** installed:
```bash
node -v
```

### 2. Install Dependencies
Run from the root directory to install all packages for both `frontend` and `backend`:
```bash
npm install
```

### 3. Build & Run Production Bundle
Build both apps and start the full-stack Express server on port `5000`:
```bash
npm run build
npm start
```

Open your browser at: **[http://localhost:5000](http://localhost:5000)**

---

## ☁️ Cloud Deployment (Turnkey)

### Option 1: Render.com (1-Click Blueprint)
1. Push this repository to GitHub.
2. Sign in to [Render.com](https://render.com) and go to **New** → **Blueprint**.
3. Select your repository. Render will automatically detect `render.yaml`, mount a persistent disk at `/opt/render/project/src/backend/data`, build both bundles, and start the app!

### Option 2: Docker / Railway / Fly.io
Use the included multi-stage `Dockerfile`:
```bash
docker build -t dsa-tracker .
docker run -p 5000:5000 -v $(pwd)/data:/app/backend/data dsa-tracker
```

---

## 📄 License
MIT License. Built with ❤️ for competitive programming teams.
