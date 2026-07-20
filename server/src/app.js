const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const { register, metrics } = require('./services/monitoring');
const { logger, httpLogger, logAPIRequest } = require('./config/logger');
const { setupSwagger } = require('./config/swagger');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Passport Session Initialization
app.use(passport.initialize());

// Logging Middleware
app.use(httpLogger);
app.use(logAPIRequest);

// Prometheus Metrics Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    metrics.httpRequestDurationMicroseconds
      .labels(req.method, req.route ? req.route.path : req.path, res.statusCode)
      .observe(duration);
  });
  next();
});

// Prometheus Metrics Route
app.get('/metrics', async (req, res) => {
  try {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Swagger Documentation
setupSwagger(app);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'PrepAgent API is running' });
});

// Import middleware & routes
const { rateLimiter } = require('./middleware/rateLimiter');
const { protect } = require('./middleware/auth');
const authRoutes = require('./routes/authRoutes');
const oauthRoutes = require('./routes/oauthRoutes');
const executionRoutes = require('./routes/executionRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const sqlRoutes = require('./routes/sqlRoutes');
const sqlProblemRoutes = require('./routes/sqlProblemRoutes');
const hintRoutes = require('./routes/hintRoutes');
const problemRoutes = require('./routes/problemRoutes');
const placementScoreRoutes = require('./routes/placementScoreRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', oauthRoutes); // Mount OAuth routes under the same auth path

// Apply rate limiter and protect all API routes except auth routes and health
app.use('/api/execute', rateLimiter(5, 60), executionRoutes);
app.use('/api/interview', protect, interviewRoutes);
app.use('/api/resume', protect, resumeRoutes);
app.use('/api/sql', protect, sqlRoutes);
app.use('/api/sql-problems', sqlProblemRoutes);
app.use('/api/hints', protect, hintRoutes);
app.use('/api/problems', protect, problemRoutes);
app.use('/api/analytics', protect, analyticsRoutes);
app.use('/api/user/placement-score', protect, placementScoreRoutes);

module.exports = app;