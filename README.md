# 🐛 Bug Tracker — Frontend

React.js frontend for Bug Tracker, a Jira-inspired issue tracking application.

## 🌐 Live Demo
**Vercel:** `https://bug-tracker-client-8667.vercel.app/`

---

## ⚙️ Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React.js | 18 | UI framework |
| React Router | v6 | Client-side routing |
| Tailwind CSS | 3 | Styling |
| Axios | latest | API calls |
| HTML5 DnD API | — | Drag & drop (no library) |
| Context API | — | Global state |

---

## 📁 Folder Structure

```
client/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Sidebar.js        # Left navigation with project links
│   │   ├── Navbar.js         # Top bar with search + user avatar
│   │   └── Toast.js          # Notification system (success/error/info)
│   ├── context/
│   │   ├── AuthContext.js    # User login state, JWT token management
│   │   └── ProjectContext.js # Projects list, CRUD operations
│   ├── pages/
│   │   ├── Landing.js        # Animated marketing homepage
│   │   ├── Login.js          # Sign in page
│   │   ├── Register.js       # Sign up page
│   │   ├── Dashboard.js      # Projects overview (table view)
│   │   ├── Board.js          # Kanban board with drag & drop
│   │   ├── Backlog.js        # List view with filters
│   │   ├── Sprint.js         # Sprint planning & management
│   │   ├── Members.js        # Team member management
│   │   └── Profile.js        # User profile & settings
│   ├── utils/
│   │   └── api.js            # Axios instance with auth interceptor
│   ├── App.js                # All routes defined here
│   └── index.css             # Tailwind + custom CSS animations
├── vercel.json               # Vercel SPA routing config
├── .env.production           # Production API URL
└── package.json
```

---

## 🚀 Local Setup

```bash
# 1. Go to client folder
cd client

# 2. Install dependencies
npm install

# 3. Create .env file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# 4. Start dev server
npm start
# Runs on http://localhost:3000
```

---

## 🌐 Pages & Routes

| Route | Page | Auth Required |
|-------|------|--------------|
| `/` | Landing | ❌ |
| `/login` | Login | ❌ |
| `/register` | Register | ❌ |
| `/dashboard` | Dashboard | ✅ |
| `/board/:id` | Kanban Board | ✅ |
| `/backlog/:id` | Backlog | ✅ |
| `/sprint/:id` | Sprint Planning | ✅ |
| `/members/:id` | Team Members | ✅ |
| `/profile` | Profile | ✅ |

---

## 🎨 Design System

```
Background:     #F1F5F9  (light gray)
Sidebar:        #1E1B4B → #0F172A  (dark gradient)
Primary Accent: #7C3AED  (violet)
Secondary:      #0891B2  (teal)
Tertiary:       #EC4899  (pink)
Cards:          #FFFFFF with #E2E8F0 border
Text Primary:   #0F172A
Text Muted:     #64748B
```

**Gradient Button:**
```css
background: linear-gradient(135deg, #0891B2, #7C3AED, #EC4899);
```

---

## 🔐 Authentication Flow

```
User fills form
    ↓
POST /api/auth/login
    ↓
Server returns JWT token
    ↓
Token saved in localStorage
    ↓
Axios interceptor adds token to every request header
    ↓
Protected routes check token via AuthContext
```

---

## 🧩 Key Features

### 1. Kanban Board (Board.js)
- 3 columns: To Do, In Progress, Done
- HTML5 Drag & Drop (no library — `draggable`, `onDragStart`, `onDrop`)
- Ticket cards with priority badges and ticket IDs (BUG-1, BUG-2)
- Click ticket → right-side detail panel slides in
- Edit and delete tickets inline

### 2. Sprint Planning (Sprint.js)
- Create sprints with name, goal, start/end date
- Start → Active → Complete workflow
- Assign/remove tickets from sprints
- Progress bar showing completion percentage

### 3. Landing Page (Landing.js)
- Typewriter effect (pure JS — no library)
- Floating animated kanban cards
- Intersection Observer for stats counter animation
- Auto-sliding testimonials carousel
- Pricing section with 3 tiers

---

## 🚀 Deploy to Vercel

### Step 1 — Create `vercel.json` in `client/` folder:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### Step 2 — Create `.env.production` in `client/` folder:
```
REACT_APP_API_URL=https://your-render-url.onrender.com/api
```

### Step 3 — Push to GitHub:
```bash
git add .
git commit -m "ready for deployment"
git push origin main
```

### Step 4 — Vercel Settings:
```
Root Directory    → client
Framework Preset  → Create React App
Build Command     → npm run build
Output Directory  → build

Environment Variables:
REACT_APP_API_URL = https://your-render-url.onrender.com/api
```

### Step 5 — Deploy!

---

## 📦 Dependencies

```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "react-router-dom": "^6.0.0",
  "axios": "^1.0.0"
}
```

---

## 👩‍💻 Built By
**Shishanki Vishwakarma** — MERN Stack Internship Project
