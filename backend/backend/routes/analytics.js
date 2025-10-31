const express = require('express');
const router = express.Router();

// Import services
const realGoogleAnalytics = require('../services/google-analytics-real');
const mockGoogleAnalytics = require('../services/google-analytics-mock');

// Analyze traffic sources
router.post('/traffic-sources', async (req, res) => {
  try {
    const { websiteUrl, gaPropertyId, dateRange = '30daysAgo' } = req.body;
    
    if (!websiteUrl || !gaPropertyId) {
      return res.status(400).json({ 
        error: 'Website URL and GA Property ID are required' 
      });
    }

    console.log(`📊 Analyzing: ${websiteUrl} (GA: ${gaPropertyId})`);
    
    // Try to get real data first
    const trafficData = await realGoogleAnalytics.getRealTrafficSourcesData(
      gaPropertyId, 
      dateRange
    );
    
    res.json({
      success: true,
      website: websiteUrl,
      gaProperty: gaPropertyId,
      dataSource: 'REAL_GOOGLE_ANALYTICS',
      trafficSources: trafficData
    });
    
  } catch (error) {
    console.error('❌ Real analysis failed:', error);
    
    // Fallback to demo data
    console.log('🔄 Using demo data...');
    const fallbackData = await mockGoogleAnalytics.getTrafficSourcesData();
    
    res.json({
      success: false,
      error: error.message,
      fallback: true,
      dataSource: 'DEMO_DATA',
      trafficSources: fallbackData,
      message: 'Check GA4 configuration - using demo data'
    });
  }
});

module.exports = router;
