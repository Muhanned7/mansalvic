const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const postgres = require('./db/postgres');
const mongo = require('./db/mongo');
const leadsRouter = require('./routes/leads');
const telemetryRouter = require('./routes/telemetry');
const recruitmentRouter = require('./routes/recruitment');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-passcode', 'x-admin-token']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/leads', leadsRouter);
app.use('/api/telemetry', telemetryRouter);
app.use('/api/recruitment', recruitmentRouter);

// Health check endpoint with database diagnostics
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    company: 'Mansalvic Consulting LLC',
    location: 'Ohio, US',
    databases: {
      postgres: postgres.isConnected ? 'CONNECTED' : 'SIMULATED_IN_MEMORY',
      mongo: mongo.isConnected ? 'CONNECTED' : 'SIMULATED_IN_MEMORY'
    },
    timestamp: new Date().toISOString()
  });
});

// Serve frontend build in production mode if static directory exists
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

// Explicit 404 handler for undefined API endpoints (prevents hanging requests)
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API Endpoint Not Found',
    path: req.originalUrl,
    method: req.method
  });
});

// Serve frontend Single Page Application (SPA) for all other web pathways
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Mansalvic Consulting LLC - Page Not Found');
    }
  });
});

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`⚡ Mansalvic Consulting LLC API Server`);
  console.log(`📍 Headquarters: Ohio, US`);
  console.log(`🚀 Server running on: http://localhost:${PORT}`);
  console.log(`🗄️ PostgreSQL: ${postgres.isConnected ? 'CONNECTED' : 'ACTIVE (In-Memory Fallback)'}`);
  console.log(`🍃 MongoDB: ${mongo.isConnected ? 'CONNECTED' : 'ACTIVE (In-Memory Fallback)'}`);
  console.log(`===================================================`);
});
