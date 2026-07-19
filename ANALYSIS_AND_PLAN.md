# PrepAgent - Complete Product Analysis & Redesign Plan

## CURRENT ARCHITECTURE PROBLEMS

### 🔴 Critical Issues

1. **Monolithic App.jsx (775 lines)** - ALL state, ALL logic, ALL pages in ONE file
2. **Dead Code** - Navbar.jsx, Login.jsx, ProblemList.jsx are imported/created but NEVER used
3. **No Router** - Manual state-based page switching (`activePage`) instead of React Router
4. **Props Drilling Hell** - PrepLabs receives 15+ props passed down from App.jsx
5. **Hardcoded Data** - SQL problems, mock voice, mock timer (60s), mock "beats 98.4%" - all fake
6. **Duplicate Problem Lists** - CompanySheets lists problems, Interview page also has dropdown selector
7. **CSS Fragmentation** - App.css (1380 lines) + Dashboard.css + Interview.css + SQL.css + Resume.css + Navbar.css + Login.css + ProblemList.css = 8 CSS files

### 🟡 UX Problems

1. **Confusing Navigation** - "Sheets" → problem list but can't solve there; "AI Arena" → solve problems; "Prep Labs" → resume + SQL (unrelated mix)
2. **No Learning Path** - User logs in and sees random features with no guided journey
3. **Fake Features** - Voice recognition is setTimeout simulation, contest timer is 60s hardcoded, microphone toggle is theater
4. **No OAuth** - Only email/password, no Google/GitHub login
5. **Interview routes UNPROTECTED** - `app.use('/api/interview', interviewRoutes)` has NO auth middleware

### 🟢 Missing Features for 100K Users

1. No onboarding flow
2. No personalized recommendations
3. No progress charts/visualizations
4. No system design practice
5. No behavioral interview bank
6. No company-specific roadmaps
7. No community/leaderboards outside contests
8. No email/password reset
9. No proper error boundaries
10. No analytics dashboard with real insights

## REDESIGN: "PrepAgent OS" - One Dashboard, One Journey

### New Navigation (5 pages, crystal clear purpose)

| Page | Route | Purpose |
|------|-------|---------|
| **Journey** | `/` | Daily goals, progress, placement score, streak, next actions |
| **Practice** | `/practice` | Unified workspace: DSA + SQL + System Design + AI Chat |
| **Assess** | `/assess` | Resume ATS + Mock Interviews + Performance Analytics |
| **Learn** | `/learn` | Company roadmaps + Topic guides + Curated paths |
| **Compete** | `/contests` | Live contests + Leaderboards + Challenges |

### File Restructuring

```
client/src/
  main.jsx ← Add BrowserRouter
  App.jsx ← Just layout shell (<Header/> + <Routes/>)
  index.css ← Single global stylesheet (replaces ALL 8 CSS files)
  
  pages/
    Journey.jsx          (replaces Dashboard)
    Practice.jsx         (replaces Interview + SQL + part of PrepLabs)
    Assess.jsx           (replaces Resume + Interview analytics)
    Learn.jsx            (replaces CompanySheets with roadmaps)
    Compete.jsx          (replaces ContestMode)
  
  components/
    Header.jsx           (replaces inline App.jsx header)
    Practice/
      Workspace.jsx      (3-column unified coding workspace)
      AIChatPanel.jsx    (extracted from App.jsx)
      ProblemPanel.jsx   (extracted from App.jsx)
      CodeEditorPanel.jsx (extracted from App.jsx)
      SQLPanel.jsx       (extracted from PrepLabs)
    Assess/
      ResumeAnalyzer.jsx
      InterviewSession.jsx
      AnalyticsDashboard.jsx
    Learn/
      RoadmapViewer.jsx
      TopicCard.jsx
    common/
      Card.jsx
      Badge.jsx
      ScoreRing.jsx
      LoadingSkeleton.jsx
  
  stores/                (Zustand instead of useState hell)
    authStore.js
    practiceStore.js
    assessmentStore.js
  
  lib/
    api.js               (centralized Axios with interceptors)

server/src/
  app.js                 (add missing auth middleware to interview routes)
  middleware/
    auth.js              (add cookie-based auth alongside Bearer token)
```

### Implementation Order

1. ✅ Install dependencies (react-router-dom, zustand)
2. ✅ Create centralized API client
3. ✅ Create Zustand stores (auth, practice)
4. ✅ Rewrite main.jsx with Router
5. ✅ Create shared components
6. ✅ Create Header component
7. ✅ Rewrite App.jsx as clean layout shell
8. ✅ Create Journey page (new Dashboard)
9. ✅ Create Practice page (unified workspace)
10. ✅ Create Assess page (resume + interview + analytics)
11. ✅ Create Learn page (company roadmaps)
12. ✅ Update Compete page (keep but integrate)
13. ✅ Create single unified CSS (index.css)
14. ✅ Fix backend: add auth to interview routes
15. ✅ Add real OAuth support structure