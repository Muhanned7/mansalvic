const express = require('express');
const router = express.Router();
const analyticsStore = require('../services/analyticsStore');
const emailService = require('../services/emailService');

const { verifyAdminPasscode, revokeSession } = require('../middleware/auth');

// In-memory cache to prevent accidental email spamming if visitor refreshes frequently
const visitorAlertCache = new Map(); // visitorId -> timestamp

// Endpoint for client telemetry ingestion (clicks, highlights, section reads, heartbeats, visitor entrance)
router.post('/', (req, res) => {
  try {
    const { visitorId, type, payload, meta } = req.body;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    if (!visitorId) {
      return res.status(400).json({ error: 'visitorId is required' });
    }

    analyticsStore.registerOrUpdateVisitor(visitorId, {
      ip: clientIp,
      location: meta?.location || 'Columbus, OH, US',
      city: meta?.city || 'Columbus',
      state: meta?.state || 'OH',
      country: meta?.country || 'US',
      userAgent: meta?.userAgent || req.headers['user-agent']
    });

    let result = null;

    if (type === 'VISITOR_ENTER') {
      const isProduction = process.env.NODE_ENV === 'production';
      const enableDevAlerts = process.env.ENABLE_DEV_EMAIL_ALERTS === 'true';

      if (!isProduction && !enableDevAlerts) {
        console.log(`[Telemetry] Visitor entrance logged for ${visitorId} (Email alert suppressed in development mode).`);
      } else {
        const now = Date.now();
        const lastAlert = visitorAlertCache.get(visitorId);
        if (!lastAlert || (now - lastAlert > 15 * 60 * 1000)) {
          visitorAlertCache.set(visitorId, now);
          emailService.sendVisitorArrivalAlert({
            visitorId,
            ip: clientIp,
            location: meta?.location || 'Columbus, OH, US',
            userAgent: meta?.userAgent || req.headers['user-agent'],
            landingPage: payload?.landingPage || '/',
            referrer: payload?.referrer || 'Direct Visit'
          }).catch(err => console.error('[Visitor Arrival Alert Notice]', err.message));
        }
      }
    } else if (type === 'CLICK') {
      result = analyticsStore.recordClick(visitorId, payload);
    } else if (type === 'TEXT_HIGHLIGHT') {
      result = analyticsStore.recordTextHighlight(visitorId, payload);
    } else if (type === 'SECTION_READ') {
      result = analyticsStore.recordSectionRead(visitorId, payload);
    } else if (type === 'HEARTBEAT') {
      analyticsStore.registerOrUpdateVisitor(visitorId, { currentSection: payload?.currentSection });
    }

    res.json({ success: true, recorded: result });
  } catch (error) {
    console.error('Error handling telemetry:', error);
    res.status(500).json({ error: 'Failed to record telemetry event' });
  }
});

// Endpoint for instant live Gmail / email delivery testing
router.post('/test-email', async (req, res) => {
  try {
    const { toEmail } = req.body;
    const target = toEmail || process.env.ADMIN_EMAIL || 'hello@mansalvic.com';
    const result = await emailService.sendTestEmail(target);
    res.json({
      success: result.success,
      target,
      messageId: result.messageId,
      previewUrl: result.previewUrl,
      error: result.error
    });
  } catch (err) {
    console.error('Test email dispatch error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Dedicated SEPARATE Endpoint for Admin Movement & Visitor Tracking (Protected)
router.get('/admin', verifyAdminPasscode, (req, res) => {
  res.json({
    success: true,
    token: req.adminToken || null,
    data: analyticsStore.getDashboardSummary()
  });
});

// Admin session logout
router.post('/admin/logout', (req, res) => {
  const token = req.headers['x-admin-token'] || req.headers['x-admin-passcode'] || req.body?.token;
  if (token) revokeSession(token);
  res.json({ success: true, message: 'Logged out successfully' });
});

// Telemetry Health Endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'telemetry', timestamp: new Date().toISOString() });
});

module.exports = router;
