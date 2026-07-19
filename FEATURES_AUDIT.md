# PrepAgent Feature Audit

## ✅ Already Built (present in codebase)

| Feature | File(s) | Status |
|---------|---------|--------|
| Docker Sandbox (Java, Python, C++, JS) | sandboxService.js | ✅ 4 languages |
| AI Interviewer (DSA + HR) | interviewerService.js | ✅ 2 agents |
| PDF Resume Parser | resumeController.js | ✅ |
| ATS Score Checker | resumeController.js | ✅ |
| SQL Simulator | sqlController.js | ✅ 3 problems |
| Placement Score (Resume + Coding) | placementScoreService.js | ✅ Company weights |
| Hint Engine (progressive 1-3) | hintEngine.js | ✅ |
| Rate Limiting | rateLimiter.js | ✅ |
| JWT Auth | authController.js | ✅ |
| User Performance Model | UserPerformance.js | ✅ |
| Problem Model (starter templates) | Problem.js | ✅ |
| Contest System | contestRoutes.js | ✅ |

## 🔴 What's MISSING for 100K Users Production

### 1. WebSocket Real-Time Terminal
- ExecutionController returns HTTP responses, not WebSocket streams
- Need: Socket.io for live terminal output streaming

### 2. Multi-Agent Interviewer
- Only DSA + HR interviewers exist
- Need: System Design interviewer agent + code generation

### 3. RAG-based Company Questions
- No vector search infrastructure
- Need: Embedding pipeline for company-specific question retrieval

### 4. Dynamic Difficulty Adjustment
- No adaptive difficulty based on user performance
- Need: AI that tracks solve rate and adjusts next problem difficulty

### 5. Combined Placement Score Display
- placementScoreService.js exists but NOT called anywhere in UI
- Need: Wire it into Journey dashboard

### 6. Weak Topics Identification
- UserPerformance has `weakTopics` array but never populated
- Need: Analytics engine to track per-topic performance

### 7. OAuth 2.0 (Google/GitHub)
- Only email/password auth
- Need: Passport.js Google + GitHub strategies

### 8. RBAC (Student/Mentor/Admin)
- User model has role field but never enforced
- Need: Role-based route protection middleware

### 9. Company-Specific SQL Patterns
- SQL problems are generic LeetCode, not Cognizant/TCS pattern
- Need: Company-specific SQL problem sets

### 10. Kafka Submission Queue
- No async processing infrastructure
- Need: Kafka producer for code submissions, consumer for results

### 11. Interview Replay (Keystroke Level)
- No recording of editor state changes
- Need: Socket.io events for code changes + playback system

## IMMEDIATE BUILD ORDER (Production-Ready)

1. 🔴 Wire Placement Score to Journey Dashboard
2. 🔴 Add C++ and Java support to Practice editor
3. 🔴 Build Multi-Agent with System Design interviewer
4. 🔴 Add company-specific SQL problems  
5. 🔴 Add weak topics analytics
6. 🔴 Add OAuth structure (Google/GitHub buttons)
7. 🔴 Add RBAC middleware
8. 🔴 Add WebSocket terminal streaming