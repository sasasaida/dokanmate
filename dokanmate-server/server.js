// server.js
// Entry point for the DokanMate backend.
// Starts Express, connects to MongoDB, registers routes.

require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const connectDB    = require('./config/database');
const syncRoutes   = require('./routes/sync');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Connect to MongoDB ──────────────────────────────────────
connectDB();

// ── Middleware ──────────────────────────────────────────────

// Security headers
app.use(helmet());

// Allow requests from the React Native app
app.use(cors({
  origin: '*', // In production, restrict to your app's domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Routes ──────────────────────────────────────────────────

app.use('/api/sync', syncRoutes);
app.use('/api/auth', authRoutes);

// Root — quick sanity check
app.get('/', (req, res) => {
  res.json({ message: 'DokanMate API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler — must be last
app.use(errorHandler);

// ── Start server ────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} ✓`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;