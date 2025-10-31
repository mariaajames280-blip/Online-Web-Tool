class MockGoogleAnalyticsService {
  async getTrafficSourcesData() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        source: '(direct)',
        sessions: 15420,
        percentage: 52.4,
        engagementRate: 78.0,
        avgSessionDuration: '6:23',
        engagedSessions: 12028
      },
      {
        source: 'google',
        sessions: 8920,
        percentage: 30.3,
        engagementRate: 79.8,
        avgSessionDuration: '3:35',
        engagedSessions: 7120
      },
      {
        source: 'facebook.com',
        sessions: 3240,
        percentage: 11.0,
        engagementRate: 64.8,
        avgSessionDuration: '2:25',
        engagedSessions: 2100
      },
      {
        source: 'linkedin.com',
        sessions: 1560,
        percentage: 5.3,
        engagementRate: 84.6,
        avgSessionDuration: '5:20',
        engagedSessions: 1320
      }
    ];
  }
}

module.exports = new MockGoogleAnalyticsService();
