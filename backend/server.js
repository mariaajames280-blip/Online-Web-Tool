const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve all current files

// Import InsightSpark routes
const analyticsRoutes = require('./routes/analytics');

// Use InsightSpark API routes
app.use('/api/analytics', analyticsRoutes);

// Serve InsightSpark tool
app.get('/insightspark.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../insightspark.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'InsightSpark API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Serve all other existing HTML files
app.get('/:page', (req, res) => {
  const page = req.params.page;
  if (page.endsWith('.html')) {
    res.sendFile(path.join(__dirname, `../${page}`));
  } else {
    res.status(404).json({ error: 'Page not found' });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('╔═══════════════════════════════════════╗');
  console.log('║         🚀 Web Tools Server          ║');
  console.log('║                                       ║');
  console.log(`║     Port: ${PORT}                          ║`);
  console.log('║     Environment: development          ║');
  console.log('║                                       ║');
  console.log('║     Main Site: http://localhost:${PORT}    ║');
  console.log('║     InsightSpark: /insightspark.html  ║');
  console.log('║     API: http://localhost:${PORT}/api     ║');
  console.log('║                                       ║');
  console.log('║     Ready to serve tools! 🛠️         ║');
  console.log('╚═══════════════════════════════════════╝');
});
