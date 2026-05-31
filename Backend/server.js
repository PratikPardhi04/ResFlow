const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');

const env = require('./config/env');
const connectDB = require('./config/db');
const { errorMiddleware } = require('./utils/errorHandler');
const mongoose = require('mongoose');

// ─── Scaffolding & Setup ─────────────────────────────────────────

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ─── Initialize Express App ──────────────────────────────────────
const app = express();

// ─── Connect to Database ─────────────────────────────────────────
connectDB();

// ─── Security & Logging Middleware ────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: env.IS_PRODUCTION ? false : true, // allow all in dev, configure in prod
  credentials: true,
}));

// Request rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
if (env.IS_PRODUCTION) {
  app.use('/api', limiter);
}

// Logger
if (!env.IS_PRODUCTION) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file hosting for local resume files (gitignored)
app.use('/uploads', express.static(uploadsDir));

// ─── Health Check Endpoint ───────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
    db: mongoose?.connection?.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// ─── Mount Routes ────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const chatRoutes = require('./routes/chatRoutes');
const jobRoutes = require('./routes/jobRoutes');
const coverLetterRoutes = require('./routes/coverLetterRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/cover-letter', coverLetterRoutes);

// Catch-all 404 Route
app.use((_req, _res, next) => {
  const { NotFoundError } = require('./utils/errorHandler');
  next(new NotFoundError('API Route'));
});

// ─── Global Error Handler ────────────────────────────────────────
app.use(errorMiddleware);

// ─── Start Server ────────────────────────────────────────────────
const PORT = env.PORT;
const server = app.listen(PORT, () => {
  console.log(`🚀 AntiGravity (ResFlow) Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;
