const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Import InsightSpark routes
const analyticsRoutes = require('./routes/analytics');

// Use InsightSpark API routes
app.use('/api/analytics', analyticsRoutes);

// Serve InsightSpark tool
app.get('/insightspark.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../insightspark.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'InsightSpark API is running',
    version: '1.0.0'
  });
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 InsightSpark server running on port ${PORT}`);
});
