const mongoose = require('mongoose');

class MongoDatabaseManager {
  constructor() {
    this.isConnected = false;
    this.RequirementModel = null;

    // Fallback in-memory document store
    this.memoryDocuments = new Map();

    this.init();
  }

  async init() {
    const mongoUri = process.env.MONGODB_URI;

    // Define Schema
    const requirementSchema = new mongoose.Schema({
      postgresClientId: { type: String, required: true, index: true },
      serviceType: { type: String, default: 'staffing' },
      answers: { type: mongoose.Schema.Types.Mixed, default: {} },
      clientNotes: { type: String, default: '' },
      hrNotes: [
        {
          hrId: String,
          hrName: String,
          note: String,
          timestamp: { type: Date, default: Date.now }
        }
      ],
      telemetryContext: {
        visitorId: String,
        ip: String,
        location: String,
        userAgent: String
      },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    try {
      this.RequirementModel = mongoose.models.RequirementDocument || mongoose.model('RequirementDocument', requirementSchema);
    } catch (err) {
      // If already compiled
      this.RequirementModel = mongoose.model('RequirementDocument');
    }

    if (mongoUri) {
      try {
        await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 4000
        });
        this.isConnected = true;
        console.log('✅ MongoDB connected successfully to:', mongoUri.replace(/:[^:@]+@/, ':****@'));
      } catch (err) {
        console.warn('⚠️ MongoDB connection failed, switching to persistent in-memory fallback:', err.message);
        this.isConnected = false;
      }
    } else {
      console.log('ℹ️ No MONGODB_URI provided. Operating with MongoDB simulated in-memory document store.');
    }
  }

  // Create new requirement document with freeform client notes
  async createRequirement(data) {
    const docData = {
      postgresClientId: data.postgresClientId,
      serviceType: data.serviceType || 'staffing',
      answers: data.answers || {},
      clientNotes: data.clientNotes || data.notes || '',
      hrNotes: [],
      telemetryContext: data.telemetryContext || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (this.isConnected && this.RequirementModel) {
      try {
        const doc = new this.RequirementModel(docData);
        await doc.save();
        return doc.toObject();
      } catch (err) {
        console.error('Error saving MongoDB document:', err);
      }
    }

    // Fallback store
    const mockDoc = {
      _id: 'mongo_' + Math.random().toString(36).substring(2, 9),
      ...docData
    };
    this.memoryDocuments.set(data.postgresClientId, mockDoc);
    return mockDoc;
  }

  // Retrieve requirement document by PostgreSQL client ID
  async getRequirementByClientId(postgresClientId) {
    if (this.isConnected && this.RequirementModel) {
      try {
        const doc = await this.RequirementModel.findOne({ postgresClientId }).lean();
        if (doc) return doc;
      } catch (err) {
        console.error('Error querying MongoDB document:', err);
      }
    }

    return this.memoryDocuments.get(postgresClientId) || null;
  }

  // Append HR recruitment notes into the requirement document
  async appendHrNote(postgresClientId, hrData) {
    const noteEntry = {
      hrId: hrData.hrId,
      hrName: hrData.hrName || 'Assigned HR Lead',
      note: hrData.note,
      timestamp: new Date()
    };

    if (this.isConnected && this.RequirementModel) {
      try {
        const updated = await this.RequirementModel.findOneAndUpdate(
          { postgresClientId },
          { 
            $push: { hrNotes: noteEntry },
            $set: { updatedAt: new Date() }
          },
          { new: true }
        ).lean();
        if (updated) return updated;
      } catch (err) {
        console.error('Error updating MongoDB document:', err);
      }
    }

    const memDoc = this.memoryDocuments.get(postgresClientId);
    if (memDoc) {
      memDoc.hrNotes.push(noteEntry);
      memDoc.updatedAt = new Date();
      return memDoc;
    }

    return null;
  }

  async getAllRequirements() {
    if (this.isConnected && this.RequirementModel) {
      try {
        return await this.RequirementModel.find().sort({ createdAt: -1 }).lean();
      } catch (err) {
        console.error('Error listing MongoDB documents:', err);
      }
    }

    return Array.from(this.memoryDocuments.values());
  }
}

module.exports = new MongoDatabaseManager();
