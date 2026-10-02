// In-memory telemetry & analytics store with automatic cleanup & realistic mock data fallback

class AnalyticsStore {
  constructor() {
    this.activeVisitors = new Map();
    this.recentClicks = [];
    this.textHighlights = [];
    this.sectionReads = [];
    this.leads = [];
    this.outbox = [];
    
    // Seed initial mock data so dashboard is rich upon first load
    this.seedMockData();

    // Periodic cleanup of inactive visitors (> 5 mins)
    setInterval(() => this.cleanupInactiveVisitors(), 30000);
  }

  seedMockData() {
    const mockVisitors = [
      { id: 'vis_ohio_9182', ip: '65.182.12.44', location: 'Columbus, OH, US', city: 'Columbus', state: 'OH', currentSection: 'services', lastActive: Date.now() - 15000, clickCount: 6, highlightCount: 2 },
      { id: 'vis_ohio_4019', ip: '74.217.89.12', location: 'Cleveland, OH, US', city: 'Cleveland', state: 'OH', currentSection: 'hero', lastActive: Date.now() - 40000, clickCount: 3, highlightCount: 1 },
      { id: 'vis_ny_8821', ip: '108.30.122.9', location: 'New York, NY, US', city: 'New York', state: 'NY', currentSection: 'staffing', lastActive: Date.now() - 5000, clickCount: 11, highlightCount: 4 }
    ];

    mockVisitors.forEach(v => this.activeVisitors.set(v.id, v));

    this.recentClicks = [
      { id: 'clk_1', visitorId: 'vis_ohio_9182', x: 540, y: 320, pageX: 540, pageY: 320, targetTag: 'BUTTON', targetText: 'Schedule Consultation', timestamp: Date.now() - 120000 },
      { id: 'clk_2', visitorId: 'vis_ny_8821', x: 210, y: 780, pageX: 210, pageY: 780, targetTag: 'DIV', targetText: 'IT Staff Augmentation', timestamp: Date.now() - 60000 },
      { id: 'clk_3', visitorId: 'vis_ohio_4019', x: 890, y: 150, pageX: 890, pageY: 150, targetTag: 'A', targetText: 'Eco-Tech Services', timestamp: Date.now() - 30000 }
    ];

    this.textHighlights = [
      { id: 'hl_1', visitorId: 'vis_ohio_9182', text: 'application maintenance retargeting & cloud infrastructure', section: 'services', timestamp: Date.now() - 110000 },
      { id: 'hl_2', visitorId: 'vis_ny_8821', text: 'renewable energy natural ecosystem theme', section: 'about', timestamp: Date.now() - 45000 }
    ];

    this.sectionReads = [
      { id: 'sr_1', visitorId: 'vis_ohio_9182', section: 'services', durationMs: 45000, timestamp: Date.now() - 90000 },
      { id: 'sr_2', visitorId: 'vis_ny_8821', section: 'staffing', durationMs: 62000, timestamp: Date.now() - 20000 }
    ];
  }

  registerOrUpdateVisitor(visitorId, data = {}) {
    const existing = this.activeVisitors.get(visitorId) || {
      id: visitorId,
      ip: data.ip || '127.0.0.1',
      location: data.location || 'Columbus, OH, US',
      city: data.city || 'Columbus',
      state: data.state || 'OH',
      country: data.country || 'US',
      userAgent: data.userAgent || 'Modern Browser',
      currentSection: 'hero',
      lastActive: Date.now(),
      clickCount: 0,
      highlightCount: 0
    };

    existing.lastActive = Date.now();
    if (data.currentSection) existing.currentSection = data.currentSection;
    if (data.ip) existing.ip = data.ip;
    if (data.location) existing.location = data.location;

    this.activeVisitors.set(visitorId, existing);
    return existing;
  }

  recordClick(visitorId, clickData) {
    this.registerOrUpdateVisitor(visitorId);
    const visitor = this.activeVisitors.get(visitorId);
    if (visitor) visitor.clickCount += 1;

    const record = {
      id: 'clk_' + Math.random().toString(36).substr(2, 9),
      visitorId,
      x: clickData.x,
      y: clickData.y,
      pageX: clickData.pageX,
      pageY: clickData.pageY,
      targetTag: clickData.targetTag || 'UNKNOWN',
      targetText: (clickData.targetText || '').substring(0, 100),
      timestamp: Date.now()
    };

    this.recentClicks.unshift(record);
    if (this.recentClicks.length > 200) this.recentClicks.pop();
    return record;
  }

  recordTextHighlight(visitorId, highlightData) {
    this.registerOrUpdateVisitor(visitorId);
    const visitor = this.activeVisitors.get(visitorId);
    if (visitor) visitor.highlightCount += 1;

    const record = {
      id: 'hl_' + Math.random().toString(36).substr(2, 9),
      visitorId,
      text: (highlightData.text || '').substring(0, 300),
      section: highlightData.section || 'general',
      timestamp: Date.now()
    };

    this.textHighlights.unshift(record);
    if (this.textHighlights.length > 100) this.textHighlights.pop();
    return record;
  }

  recordSectionRead(visitorId, readData) {
    this.registerOrUpdateVisitor(visitorId, { currentSection: readData.section });

    const record = {
      id: 'sr_' + Math.random().toString(36).substr(2, 9),
      visitorId,
      section: readData.section,
      durationMs: readData.durationMs || 0,
      timestamp: Date.now()
    };

    this.sectionReads.unshift(record);
    if (this.sectionReads.length > 100) this.sectionReads.pop();
    return record;
  }

  addLead(leadData) {
    const lead = {
      id: 'lead_' + Math.random().toString(36).substr(2, 9),
      ...leadData,
      timestamp: Date.now()
    };
    this.leads.unshift(lead);
    return lead;
  }

  addEmailLog(emailData) {
    const email = {
      id: 'em_' + Math.random().toString(36).substr(2, 9),
      ...emailData,
      timestamp: Date.now()
    };
    this.outbox.unshift(email);
    return email;
  }

  cleanupInactiveVisitors() {
    const cutoff = Date.now() - 300000; // 5 minutes
    for (const [id, visitor] of this.activeVisitors.entries()) {
      if (visitor.lastActive < cutoff) {
        this.activeVisitors.delete(id);
      }
    }
  }

  getDashboardSummary() {
    const visitorsArray = Array.from(this.activeVisitors.values());
    return {
      activeVisitorsCount: visitorsArray.length,
      visitors: visitorsArray,
      recentClicks: this.recentClicks.slice(0, 50),
      textHighlights: this.textHighlights.slice(0, 30),
      sectionReads: this.sectionReads.slice(0, 30),
      leads: this.leads,
      outbox: this.outbox.slice(0, 20)
    };
  }
}

module.exports = new AnalyticsStore();
