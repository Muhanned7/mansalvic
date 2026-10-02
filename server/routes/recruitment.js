const express = require('express');
const router = express.Router();
const postgres = require('../db/postgres');
const mongo = require('../db/mongo');

const { verifyAdminPasscode } = require('../middleware/auth');
const { sendWorkerAssignmentEmail } = require('../services/emailService');

// 1. Get all HR Recruitment Partners (PostgreSQL)
router.get('/hrs', verifyAdminPasscode, async (req, res) => {
  try {
    const hrs = await postgres.getHrManagers();
    res.json({ success: true, hrs });
  } catch (error) {
    console.error('Error fetching HR managers:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch HR managers' });
  }
});

// 2. Get all Pre-Vetted Offshore Workers (PostgreSQL)
router.get('/workers', verifyAdminPasscode, async (req, res) => {
  try {
    const { role } = req.query;
    const workers = await postgres.getWorkers(role);
    res.json({ success: true, workers });
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch workers' });
  }
});

// 2b. Admin Creates New Pre-Vetted Offshore Worker (PostgreSQL)
router.post('/workers', verifyAdminPasscode, async (req, res) => {
  try {
    const { full_name, email, role, skills, timezone, hourly_rate, availability } = req.body;
    if (!full_name || !email || !role) {
      return res.status(400).json({ success: false, error: 'Full name, email, and role are required' });
    }

    const worker = await postgres.createWorker({
      full_name,
      email,
      role,
      skills,
      timezone,
      hourly_rate,
      availability
    });

    res.status(201).json({
      success: true,
      message: 'New offshore engineer registered successfully',
      worker
    });
  } catch (error) {
    console.error('Error creating worker:', error);
    res.status(500).json({ success: false, error: 'Failed to create worker' });
  }
});

// 3. Assign or Re-assign HR Partner to Client (PostgreSQL)
router.post('/assign-hr', verifyAdminPasscode, async (req, res) => {
  try {
    const { clientId, hrId } = req.body;
    if (!clientId || !hrId) {
      return res.status(400).json({ success: false, error: 'clientId and hrId are required' });
    }

    const updated = await postgres.assignHrToClient(clientId, hrId);
    res.json({ success: true, message: 'HR partner assigned successfully', updated });
  } catch (error) {
    console.error('Error assigning HR partner:', error);
    res.status(500).json({ success: false, error: 'Failed to assign HR partner' });
  }
});

// 4. HR Allots Worker / Squad to Client (PostgreSQL)
router.post('/allot-worker', verifyAdminPasscode, async (req, res) => {
  try {
    const { clientId, hrId, workerId, workerIds, stage = 'ALLOTTED', agreedRate } = req.body;

    const targetIds = Array.isArray(workerIds) && workerIds.length > 0
      ? workerIds
      : (workerId ? [workerId] : []);

    if (!clientId || targetIds.length === 0) {
      return res.status(400).json({ success: false, error: 'clientId and at least one workerId are required' });
    }

    const allWorkers = await postgres.getWorkers();
    const clients = await postgres.getClients();
    const clientObj = clients.find(c => c.id === clientId) || { id: clientId, full_name: 'Client', email: 'N/A' };
    const hrs = await postgres.getHrManagers();
    const hrObj = hrs.find(h => h.id === hrId) || null;
    const reqDoc = await mongo.getRequirementByClientId(clientId);
    const clientNotes = reqDoc?.clientNotes || reqDoc?.answers?.scope || '';

    const allocations = [];
    const emailResults = [];

    for (const wId of targetIds) {
      const allocation = await postgres.allotWorkerToClient(clientId, hrId, wId, stage, agreedRate);
      allocations.push(allocation);

      const workerObj = allWorkers.find(w => w.id === wId);
      const workerName = workerObj ? `${workerObj.full_name} (${workerObj.role})` : wId;

      await mongo.appendHrNote(clientId, {
        hrId: hrId || 'system',
        hrName: 'Recruitment Allocation System',
        note: `Allotted offshore worker ${workerName} at agreed rate of $${agreedRate || workerObj?.hourly_rate || 55}/hr (Stage: ${stage}).`
      });

      if (workerObj) {
        try {
          const emailRes = await sendWorkerAssignmentEmail({
            worker: workerObj,
            client: clientObj,
            hr: hrObj,
            stage,
            agreedRate,
            clientNotes
          });
          emailResults.push({ workerId: wId, ...emailRes });
        } catch (emailErr) {
          console.warn('Worker assignment email notice:', emailErr.message);
        }
      }
    }

    res.json({
      success: true,
      message: `${targetIds.length} worker(s) allotted to client successfully and notified via email`,
      allocations,
      workerEmailPreviewUrl: emailResults[0]?.previewUrl || null,
      emailResults
    });
  } catch (error) {
    console.error('Error allotting worker to client:', error);
    res.status(500).json({ success: false, error: 'Failed to allot worker to client' });
  }
});

// 5. Append HR Recruitment Notes to MongoDB Requirement Document
router.post('/notes', verifyAdminPasscode, async (req, res) => {
  try {
    const { clientId, hrId, hrName, note } = req.body;

    if (!clientId || !note) {
      return res.status(400).json({ success: false, error: 'clientId and note text are required' });
    }

    const updatedDoc = await mongo.appendHrNote(clientId, {
      hrId: hrId || 'hr_lead',
      hrName: hrName || 'Assigned HR Partner',
      note
    });

    res.json({
      success: true,
      message: 'Recruitment note added to MongoDB successfully',
      document: updatedDoc
    });
  } catch (error) {
    console.error('Error appending HR note in MongoDB:', error);
    res.status(500).json({ success: false, error: 'Failed to append HR note' });
  }
});

// 6. Complete 360-Degree View: Postgres Client + Assigned HR + Allotted Worker + MongoDB Requirements
router.get('/client-detail/:id', verifyAdminPasscode, async (req, res) => {
  try {
    const { id } = req.params;
    const clients = await postgres.getClients();
    const client = clients.find(c => c.id === id);

    if (!client) {
      return res.status(404).json({ success: false, error: 'Client not found in PostgreSQL' });
    }

    // Query MongoDB for the requirements & client's written notes
    const requirements = await mongo.getRequirementByClientId(id);

    res.json({
      success: true,
      client,
      requirements
    });
  } catch (error) {
    console.error('Error retrieving client 360 view:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve client details' });
  }
});

module.exports = router;
