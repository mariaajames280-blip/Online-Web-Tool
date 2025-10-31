const { BetaAnalyticsDataClient } = require('@google-analytics/data');

class RealGoogleAnalyticsService {
  constructor() {
    try {
      this.analyticsDataClient = new BetaAnalyticsDataClient();
      console.log('✅ Google Analytics client ready');
    } catch (error) {
      console.error('❌ GA client failed:', error);
      throw error;
    }
  }
  
  async getRealTrafficSourcesData(propertyId, dateRange = '30daysAgo') {
    try {
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: dateRange, endDate: 'today' }],
        dimensions: [{ name: 'sessionSource' }],
        metrics: [
          { name: 'sessions' },
          { name: 'engagedSessions' },
          { name: 'averageSessionDuration' }
        ],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10
      });
      
      return this.transformData(response);
      
    } catch (error) {
      console.error('GA4 API Error:', error);
      throw new Error(`GA4 Error: ${error.message}`);
    }
  }
  
  transformData(gaResponse) {
    if (!gaResponse.rows || gaResponse.rows.length === 0) {
      return [];
    }
    
    const totalSessions = gaResponse.rows.reduce((sum, row) => 
      sum + parseInt(row.metricValues[0].value), 0
    );
    
    return gaResponse.rows.map(row => {
      const sessions = parseInt(row.metricValues[0].value);
      const engagedSessions = parseInt(row.metricValues[1].value);
      const avgDurationSeconds = parseFloat(row.metricValues[2].value);
      
      return {
        source: row.dimensionValues[0].value || 'direct',
        sessions: sessions,
        percentage: totalSessions > 0 ? (sessions / totalSessions) * 100 : 0,
        engagementRate: sessions > 0 ? (engagedSessions / sessions) * 100 : 0,
        avgSessionDuration: this.formatDuration(avgDurationSeconds),
        engagedSessions: engagedSessions
      };
    });
  }
  
  formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

module.exports = new RealGoogleAnalyticsService();
