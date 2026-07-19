# PrepAgent - Full-Stack Placement Preparation Platform

PrepAgent is an enterprise-grade, high-fidelity Placement Preparation Platform designed to help candidates prepare for coding, system design, and database SQL interview rounds with real-time AI recruitment feedback.

## 🚀 Key Features

1. **Coding IDE & Interview (Multi-Agent Panel)**:
   - Live Monaco coding workspace (JavaScript, Python, C++, Java).
   - Configurable interview timer & progressive 3-level Hint Engine.
   - Keystroke-by-keystroke **Interview Playback** walkthrough.
   - Asynchronous compiler execution powered by Apache Kafka submissions.
   - Multi-agent recruiters (DSA Specialist, System Design Expert, HR Panelist).

2. **SQL Simulator**:
   - Visual schema diagrams and sample database rows.
   - expected vs actual query validations.
   - TCS, Cognizant, and Amazon practice queries.

3. **Resume ATS Analyzer**:
   - Circular animated ATS score gauge.
   - Keyword Match %, Formatting, and Action Verb scores.
   - Keyword Gap Analyzer and printable suggestion PDF downloads.

4. **Analytics Command Center**:
   - Native interactive SVG stats charts.
   - CSS streak contribution heatmap.
   - Redis-based global leaderboards.

---

## 🛠️ Technology Stack

* **Frontend**: React.js, Monaco Editor, TailwindCSS, Socket.io Client
* **Backend**: Node.js, Express, Apollo GraphQL, gRPC (Insecure Port `50051`), Passport Auth, Redis, Kafka
* **AI Layer**: Python FastAPI, Gemini API (`gemini-pro`), LangChain/LangGraph
* **Databases**: MongoDB (Mongoose schemas), PostgreSQL/SQLite (Sequelize relational models)

---

## ⚙️ Quick Start Setup

### Prerequisites
* Node.js (v18+)
* MongoDB (running local or remote URI)

### Local Configuration
1. Clone the repository and install all dependencies:
   ```bash
   npm run install:all
   ```
2. Set up the API Key in `server/.env` (and optionally `ai-service/.env`):
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   MONGODB_URI=mongodb://localhost:27017/prep-agent
   JWT_SECRET=your_super_secret_prep_agent_jwt_key_here
   GEMINI_API_KEY=AQ.Ab8RN6KERSlw2rZgvqa4pktnXeZJHe9A4d5itWGjJVt153M8Jw
   ```

### Running Locally (Without Docker)
To run the platform instantly using the built-in local fallback layers (SQLite for Postgres, local memory emitters for Kafka, local cache overrides for Redis):
```bash
# Run server & client concurrently
npm run dev:all
```
* Frontend client runs on: http://localhost:5173
* Backend server runs on: http://localhost:5000
* GraphQL console is at: http://localhost:5000/graphql
* gRPC server listens on: `0.0.0.0:50051`

---

## 🐳 Docker Compose Deployment
To launch the full containerized suite including Kafka brokers, Postgres database, Redis cache, Prometheus metrics scraper, and Grafana:
```bash
docker-compose up --build
```
* Client: http://localhost:5173
* Prometheus Metrics: http://localhost:9090
* Grafana: http://localhost:3000
* GraphQL API: http://localhost:5000/graphql
* FastAPI AI Service: http://localhost:8000/docs
