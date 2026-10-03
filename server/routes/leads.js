const express = require('express');
const router = express.Router();
const analyticsStore = require('../services/analyticsStore');
const postgres = require('../db/postgres');
const mongo = require('../db/mongo');
const { sendLeadNotificationEmail } = require('../services/emailService');

const { verifyAdminPasscode } = require('../middleware/auth');

// Public Endpoint: Submit new lead from questionnaire dialogue box
router.post('/', async (req, res) => {
  try {
    const { answers = {}, contactInfo = {}, visitorId = 'anonymous', serviceType = 'staffing' } = req.body;

    if (!contactInfo || !contactInfo.email) {
      return res.status(400).json({ error: 'Contact email is required' });
    }

    // Extract any freeform notes the client wrote
    const clientNotes = contactInfo.notes || 
      answers.staffingRoleNote || 
      answers.hiringModelNote || 
      answers.devAppTypeNote || 
      answers.maintSystemTypeNote || 
      '';

    // 1. Store structured client in PostgreSQL (with automatic HR Partner assignment)
    const pgClient = await postgres.createClient({
      full_name: contactInfo.fullName,
      email: contactInfo.email,
      phone: contactInfo.phone || '',
      company: contactInfo.company || '',
      service_type: serviceType,
      visitor_id: visitorId
    });

    // 2. Store unstructured questionnaire parameters & client's written notes in MongoDB
    const mongoRequirement = await mongo.createRequirement({
      postgresClientId: pgClient.id,
      serviceType,
      answers,
      clientNotes,
      telemetryContext: {
        visitorId,
        ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Browser'
      }
    });

    // 3. Get assigned HR info for email notification
    const hrList = await postgres.getHrManagers();
    const assignedHr = hrList.find(h => h.id === pgClient.assigned_hr_id) || null;

    // 4. Also mirror into analyticsStore for backward compatibility and real-time outbox
    const leadRecord = analyticsStore.addLead({
      id: pgClient.id,
      answers,
      contactInfo,
      clientNotes,
      assignedHr,
      visitorId,
      postgresId: pgClient.id,
      mongoId: mongoRequirement?._id
    });

    // 5. Respond immediately to the frontend so the client UI never hangs
    res.status(201).json({
      success: true,
      message: 'Thank you! Your inquiry has been stored across our PostgreSQL & MongoDB systems. An HR talent partner has been assigned.',
      clientId: pgClient.id,
      assignedHr: assignedHr ? { name: assignedHr.full_name, title: assignedHr.title, email: assignedHr.email } : null,
      mongoRequirementId: mongoRequirement?._id
    });

    // 6. Trigger email notification asynchronously in the background (non-blocking)
    sendLeadNotificationEmail({
      ...leadRecord,
      assignedHr,
      referenceCode: req.body.referenceCode || leadRecord.referenceCode
    }).then(emailResult => {
      leadRecord.emailStatus = emailResult.success ? 'SENT' : 'FAILED';
      leadRecord.emailPreviewUrl = emailResult.previewUrl || null;
      leadRecord.clientEmailPreviewUrl = emailResult.client?.previewUrl || null;
    }).catch(emailErr => {
      console.error('[Async Email Dispatch Error]', emailErr.message);
      leadRecord.emailStatus = 'FAILED';
    });
  } catch (error) {
    console.error('Error handling lead submission:', error);
    res.status(500).json({ error: 'Failed to process lead submission' });
  }
});

// Dedicated Protected Admin Endpoint: Retrieve consolidated leads (Postgres + MongoDB)
router.get('/', verifyAdminPasscode, async (req, res) => {
  try {
    // 1. Fetch all clients with their assigned HR and active worker allocation from PostgreSQL
    const pgClients = await postgres.getClients();

    // 2. Fetch all dynamic requirement documents with client's written notes from MongoDB
    const mongoDocs = await mongo.getAllRequirements();
    const mongoMap = new Map();
    mongoDocs.forEach(d => {
      if (d.postgresClientId) mongoMap.set(d.postgresClientId, d);
    });

    // 3. Join PostgreSQL and MongoDB data into consolidated lead objects
    const consolidatedLeads = pgClients.map(c => {
      const mongoData = mongoMap.get(c.id);

      return {
        id: c.id,
        fullName: c.full_name,
        email: c.email,
        phone: c.phone,
        company: c.company,
        serviceType: c.service_type,
        status: c.status,
        visitorId: c.visitor_id,
        createdAt: c.created_at,
        
        // HR Partner Info (PostgreSQL)
        assignedHr: c.assigned_hr_id ? {
          id: c.assigned_hr_id,
          name: c.hr_name,
          email: c.hr_email,
          region: c.hr_region
        } : null,

        // Allotted Worker Info (PostgreSQL)
        allottedWorker: c.worker_id ? {
          id: c.worker_id,
          name: c.worker_name,
          role: c.worker_role,
          rate: c.worker_rate,
          stage: c.recruitment_stage,
          status: c.allocation_status
        } : null,
        allocatedWorkers: c.allocated_workers || (c.worker_id ? [{
          id: c.worker_id,
          worker_id: c.worker_id,
          name: c.worker_name,
          role: c.worker_role,
          rate: c.worker_rate,
          stage: c.recruitment_stage
        }] : []),

        // Unstructured Data & Custom Notes (MongoDB)
        requirements: mongoData ? {
          mongoId: mongoData._id,
          answers: mongoData.answers,
          clientNotes: mongoData.clientNotes,
          hrNotes: mongoData.hrNotes,
          updatedAt: mongoData.updatedAt
        } : { clientNotes: '', answers: {}, hrNotes: [] }
      };
    });

    res.json({
      success: true,
      leads: consolidatedLeads,
      outbox: analyticsStore.outbox,
      totalCount: consolidatedLeads.length
    });
  } catch (error) {
    console.error('Error fetching consolidated leads:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch consolidated leads' });
  }
});

module.exports = router;
