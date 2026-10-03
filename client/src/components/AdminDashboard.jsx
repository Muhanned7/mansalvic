import React, { useState, useEffect } from 'react';
import { 
  Activity, MousePointer, Highlighter, Inbox, Mail, RefreshCw, X, 
  ShieldAlert, MapPin, Globe, Lock, Key, ArrowRight, UserCheck, 
  Users, Briefcase, FileText, CheckCircle2, AlertCircle, Sparkles, Send,
  Calendar, Video, Clock, LogOut, ExternalLink, Plus, UserPlus
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db, COLLECTIONS } from '../firebase';

// Helper for formatting any timestamp (Firestore Timestamp, ISO string, milliseconds) safely without Invalid Date (QA-028)
const formatDateTime = (val) => {
  if (!val) return 'Recent';
  if (typeof val === 'object') {
    if (typeof val.toDate === 'function') {
      try { return val.toDate().toLocaleString(); } catch (e) {}
    }
    if (typeof val.toMillis === 'function') {
      try { return new Date(val.toMillis()).toLocaleString(); } catch (e) {}
    }
    if (val.seconds) {
      try { return new Date(val.seconds * 1000).toLocaleString(); } catch (e) {}
    }
  }
  const d = new Date(val);
  return !isNaN(d.getTime()) ? d.toLocaleString() : 'Recent';
};

export default function AdminDashboard({ isOpen, onClose }) {
  const [sessionToken, setSessionToken] = useState(sessionStorage.getItem('admin_session_token') || '');
  const [inputPasscode, setInputPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState('leads');
  const [data, setData] = useState({
    activeVisitorsCount: 0,
    visitors: [],
    recentClicks: [],
    textHighlights: [],
    sectionReads: [],
    leads: [],
    outbox: []
  });

  const [consolidatedLeads, setConsolidatedLeads] = useState([]);
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [hrList, setHrList] = useState([]);
  const [workerList, setWorkerList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Allotment Modal State
  const [selectedClientForAllot, setSelectedClientForAllot] = useState(null);
  const [selectedWorkerForAllot, setSelectedWorkerForAllot] = useState(null);
  const [targetWorkerId, setTargetWorkerId] = useState('');
  const [selectedWorkerIdsForSquad, setSelectedWorkerIdsForSquad] = useState([]);
  const [targetClientId, setTargetClientId] = useState('');
  const [recruitmentStage, setRecruitmentStage] = useState('ALLOTTED');
  const [agreedRateInput, setAgreedRateInput] = useState('');
  const [allotSubmitting, setAllotSubmitting] = useState(false);

  // Create Worker Modal State
  const [showCreateWorkerModal, setShowCreateWorkerModal] = useState(false);
  const [creatingWorker, setCreatingWorker] = useState(false);
  const [createWorkerError, setCreateWorkerError] = useState('');
  const [newWorkerForm, setNewWorkerForm] = useState({
    full_name: '',
    email: '',
    role: '',
    skills: '',
    timezone: 'Offshore US-Aligned (4–6h Daily US Overlap)',
    hourly_rate: '55',
    availability: 'AVAILABLE'
  });

  // HR Note State per client
  const [hrNoteInputs, setHrNoteInputs] = useState({});

  // Re-assign HR State
  const [reassignClientId, setReassignClientId] = useState(null);
  const [selectedNewHrId, setSelectedNewHrId] = useState('');

  // Live Email Delivery Test State
  const [testEmailInput, setTestEmailInput] = useState('');
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState(null);

  const fetchDashboardData = async (activeAuthKey) => {
    const key = activeAuthKey || sessionToken;
    if (!key) return;

    try {
      setLoading(true);

      // 1. Fetch telemetry & analytics
      const telRes = await fetch('/api/telemetry/admin', {
        headers: { 
          'X-Admin-Token': key,
          'X-Admin-Passcode': key 
        }
      });
      const telJson = await telRes.json();

      if (telRes.ok && telJson.success && telJson.data) {
        setData(telJson.data);
        setIsAuthenticated(true);
        setAuthError('');
        
        // Save session token (never save raw passcode in sessionStorage)
        const currentToken = telJson.token || key;
        sessionStorage.setItem('admin_session_token', currentToken);
        sessionStorage.removeItem('admin_passcode');
        setSessionToken(currentToken);
      } else {
        setIsAuthenticated(false);
        sessionStorage.removeItem('admin_session_token');
        sessionStorage.removeItem('admin_passcode');
        setSessionToken('');
        setAuthError(telJson.error || 'Invalid Admin Passcode or Expired Session.');
        setLoading(false);
        return;
      }

      // 2. Fetch Consolidated Leads (PostgreSQL Clients + Assigned HR + Allotted Worker + MongoDB Notes)
      let pgLeads = [];
      try {
        const leadsRes = await fetch('/api/leads', {
          headers: { 
            'X-Admin-Token': key,
            'X-Admin-Passcode': key 
          }
        });
        const leadsJson = await leadsRes.json();
        if (leadsJson.success && leadsJson.leads) {
          pgLeads = leadsJson.leads;
        }
      } catch (lErr) {
        console.warn('API leads fetch notice:', lErr);
      }

      // 3. Fetch HR Recruitment Partners (PostgreSQL)
      let currentHrs = [];
      try {
        const hrsRes = await fetch('/api/recruitment/hrs', {
          headers: { 
            'X-Admin-Token': key,
            'X-Admin-Passcode': key 
          }
        });
        const hrsJson = await hrsRes.json();
        if (hrsJson.success && hrsJson.hrs) {
          currentHrs = hrsJson.hrs;
          setHrList(hrsJson.hrs);
        }
      } catch (hErr) {
        console.warn('API hrs fetch notice:', hErr);
      }

      // 4. Fetch Available Offshore Workers (PostgreSQL)
      try {
        const workersRes = await fetch('/api/recruitment/workers', {
          headers: { 
            'X-Admin-Token': key,
            'X-Admin-Passcode': key 
          }
        });
        const workersJson = await workersRes.json();
        if (workersJson.success && workersJson.workers) {
          setWorkerList(workersJson.workers);
        }
      } catch (wErr) {
        console.warn('API workers fetch notice:', wErr);
      }

      // 5. Fetch Directly from Firestore 'appointments' (QA-026: Show scheduled video bookings in admin)
      let aptData = [];
      try {
        const aptSnap = await getDocs(collection(db, COLLECTIONS.APPOINTMENTS));
        aptSnap.forEach(docSnap => {
          aptData.push({ id: docSnap.id, ...docSnap.data() });
        });
        aptData.sort((a, b) => {
          const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.appointmentDate ? new Date(a.appointmentDate).getTime() : 0);
          const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.appointmentDate ? new Date(b.appointmentDate).getTime() : 0);
          return tB - tA;
        });
        setAppointmentsList(aptData);
      } catch (aptErr) {
        console.warn('Firestore appointments fetch notice:', aptErr);
      }

      // 6. Fetch Directly from Firestore 'leads' (QA-026: Bridge Firestore vs PostgreSQL split)
      let firestoreLeads = [];
      try {
        const leadSnap = await getDocs(collection(db, COLLECTIONS.LEADS));
        leadSnap.forEach(docSnap => {
          firestoreLeads.push({ id: docSnap.id, ...docSnap.data() });
        });
      } catch (fErr) {
        console.warn('Firestore leads fetch notice:', fErr);
      }

      // 7. Harmonize and merge all leads (PostgreSQL + Firestore + Bookings)
      const combined = [...pgLeads];

      firestoreLeads.forEach(fl => {
        const email = (fl.contactInfo?.email || fl.clientEmail || '').trim().toLowerCase();
        const ref = (fl.referenceCode || fl.id || '').trim();
        const alreadyExists = combined.some(c => 
          (email && c.email && c.email.trim().toLowerCase() === email) ||
          (ref && c.id && c.id === ref)
        );

        const parsedDate = fl.createdAt?.toDate ? fl.createdAt.toDate().toISOString() : (fl.createdAt || new Date().toISOString());

        if (!alreadyExists && email) {
          combined.unshift({
            id: ref || 'MSV-FS-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
            fullName: fl.contactInfo?.fullName || fl.clientName || fl.full_name || 'Website Inquirer',
            full_name: fl.contactInfo?.fullName || fl.clientName || fl.full_name || 'Website Inquirer',
            email: fl.contactInfo?.email || fl.clientEmail || 'N/A',
            phone: fl.contactInfo?.phone || fl.clientPhone || '',
            company: fl.contactInfo?.company || fl.company || 'Direct Web Client',
            service_type: fl.serviceType || 'general',
            createdAt: parsedDate,
            created_at: parsedDate,
            requirement: {
              clientNotes: fl.contactInfo?.notes || fl.customNotes || (fl.answers ? Object.entries(fl.answers).map(([k, v]) => `${k}: ${v}`).join('; ') : 'Direct consultation request'),
              answers: fl.answers || {}
            },
            assignedHr: currentHrs[0] || null,
            allottedWorker: null,
            source: fl.source || 'web_questionnaire'
          });
        }
      });

      // Also ensure all direct appointment bookings appear as clients
      aptData.forEach(apt => {
        const email = (apt.clientEmail || '').trim().toLowerCase();
        const ref = (apt.referenceCode || apt.id || '').trim();
        const alreadyExists = combined.some(c => 
          (email && c.email && c.email.trim().toLowerCase() === email) ||
          (ref && c.id && c.id === ref)
        );

        const parsedDate = apt.createdAt?.toDate ? apt.createdAt.toDate().toISOString() : (apt.createdAt || new Date().toISOString());

        if (!alreadyExists && email) {
          combined.unshift({
            id: ref || 'MSV-APT-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
            fullName: apt.clientName || apt.fullName || 'Video Meeting Client',
            full_name: apt.clientName || apt.fullName || 'Video Meeting Client',
            email: apt.clientEmail,
            phone: apt.clientPhone || '',
            company: apt.company || 'Direct Consultation',
            service_type: apt.serviceType || 'general',
            createdAt: parsedDate,
            created_at: parsedDate,
            requirement: {
              clientNotes: `[Direct Video Meeting on ${apt.appointmentDate} at ${apt.appointmentTime} ET via ${apt.meetingPlatform === 'meet' ? 'Google Meet' : 'Zoom'}] ${apt.customNotes || ''}`,
              answers: {
                meetingPlatform: apt.meetingPlatform,
                appointmentDate: apt.appointmentDate,
                appointmentTime: apt.appointmentTime,
                timeZone: apt.timeZone || 'ET'
              }
            },
            assignedHr: currentHrs[0] || null,
            allottedWorker: null,
            source: 'calendar_booking'
          });
        }
      });

      setConsolidatedLeads(combined);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error('Failed to fetch admin data:', err);
      setAuthError('Connection error connecting to Admin API');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!inputPasscode.trim()) return;
    fetchDashboardData(inputPasscode.trim());
  };

  const handleLogout = async () => {
    try {
      if (sessionToken) {
        await fetch('/api/telemetry/admin/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Token': sessionToken,
            'X-Admin-Passcode': sessionToken
          }
        });
      }
    } catch (e) {
      // ignore
    }
    sessionStorage.removeItem('admin_session_token');
    sessionStorage.removeItem('admin_passcode');
    setSessionToken('');
    setInputPasscode('');
    setIsAuthenticated(false);
    setAuthError('');
  };

  const handleCreateWorker = async (e) => {
    e.preventDefault();
    if (!newWorkerForm.full_name || !newWorkerForm.email || !newWorkerForm.role) {
      setCreateWorkerError('Please fill in Full Name, Email, and Primary Role.');
      return;
    }

    try {
      setCreatingWorker(true);
      setCreateWorkerError('');
      const res = await fetch('/api/recruitment/workers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': sessionToken,
          'X-Admin-Passcode': sessionToken
        },
        body: JSON.stringify(newWorkerForm)
      });

      const json = await res.json();
      setCreatingWorker(false);

      if (json.success) {
        setShowCreateWorkerModal(false);
        setNewWorkerForm({
          full_name: '',
          email: '',
          role: '',
          skills: '',
          timezone: 'Offshore US-Aligned (4–6h Daily US Overlap)',
          hourly_rate: '55',
          availability: 'AVAILABLE'
        });
        fetchDashboardData(sessionToken);
      } else {
        setCreateWorkerError(json.error || 'Failed to register worker');
      }
    } catch (err) {
      setCreatingWorker(false);
      console.error(err);
      setCreateWorkerError('Network error registering offshore worker');
    }
  };

  const handleAllotWorker = async (e) => {
    e.preventDefault();
    const cId = selectedClientForAllot?.id || targetClientId;
    if (!cId) {
      alert('Please select a target client');
      return;
    }

    // Determine target worker(s)
    let wIds = [];
    if (selectedWorkerIdsForSquad.length > 0) {
      wIds = selectedWorkerIdsForSquad;
    } else if (targetWorkerId) {
      wIds = [targetWorkerId];
    } else if (selectedWorkerForAllot) {
      wIds = [selectedWorkerForAllot.id];
    }

    if (wIds.length === 0) {
      alert('Please select at least one worker to allot');
      return;
    }

    const clientObj = consolidatedLeads.find(c => c.id === cId) || selectedClientForAllot;

    try {
      setAllotSubmitting(true);
      const res = await fetch('/api/recruitment/allot-worker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': sessionToken,
          'X-Admin-Passcode': sessionToken
        },
        body: JSON.stringify({
          clientId: cId,
          hrId: clientObj?.assignedHr?.id || hrList[0]?.id || 'hr_nair_01',
          workerIds: wIds,
          workerId: wIds[0],
          stage: recruitmentStage,
          agreedRate: agreedRateInput ? parseFloat(agreedRateInput) : undefined
        })
      });

      const json = await res.json();
      setAllotSubmitting(false);

      if (json.success) {
        setSelectedClientForAllot(null);
        setSelectedWorkerForAllot(null);
        setTargetWorkerId('');
        setSelectedWorkerIdsForSquad([]);
        setTargetClientId('');
        setAgreedRateInput('');
        fetchDashboardData(sessionToken);
      } else {
        alert(json.error || 'Failed to allot worker');
      }
    } catch (err) {
      setAllotSubmitting(false);
      console.error(err);
      alert('Network error allotting worker');
    }
  };

  const handleReassignHr = async (clientId, hrId) => {
    if (!clientId || !hrId) return;
    try {
      const res = await fetch('/api/recruitment/assign-hr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': sessionToken,
          'X-Admin-Passcode': sessionToken
        },
        body: JSON.stringify({ clientId, hrId })
      });
      const json = await res.json();
      if (json.success) {
        setReassignClientId(null);
        fetchDashboardData(sessionToken);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddHrNote = async (clientId, hrId, hrName) => {
    const noteText = hrNoteInputs[clientId];
    if (!noteText || !noteText.trim()) return;

    try {
      const res = await fetch('/api/recruitment/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': sessionToken,
          'X-Admin-Passcode': sessionToken
        },
        body: JSON.stringify({
          clientId,
          hrId: hrId || 'hr_lead',
          hrName: hrName || 'Assigned HR Partner',
          note: noteText.trim()
        })
      });

      const json = await res.json();
      if (json.success) {
        setHrNoteInputs(prev => ({ ...prev, [clientId]: '' }));
        fetchDashboardData(sessionToken);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    if (!testEmailInput.trim()) return;

    try {
      setTestEmailSending(true);
      setTestEmailResult(null);
      const res = await fetch('/api/telemetry/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': sessionToken,
          'X-Admin-Passcode': sessionToken
        },
        body: JSON.stringify({ toEmail: testEmailInput.trim() })
      });
      const json = await res.json();
      setTestEmailSending(false);
      setTestEmailResult(json);
      fetchDashboardData(sessionToken);
    } catch (err) {
      setTestEmailSending(false);
      setTestEmailResult({ success: false, error: err.message });
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    if (sessionToken) {
      fetchDashboardData(sessionToken);
    }

    let interval;
    if (autoRefresh && sessionToken && isAuthenticated) {
      interval = setInterval(() => fetchDashboardData(sessionToken), 4000);
    }

    return () => clearInterval(interval);
  }, [isOpen, autoRefresh, sessionToken, isAuthenticated]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(16px)', zIndex: 1100 }}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{
          maxWidth: '1240px',
          height: '88vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '0',
          overflow: 'hidden',
          borderRadius: '16px'
        }}
      >
        
        {/* Header Bar */}
        <div style={{
          background: '#0b1e36',
          padding: '18px 28px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #059669 0%, #0284c7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Activity size={18} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
                Mansalvic Enterprise Command Center
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Dual Database Architecture: PostgreSQL (Clients, HR, Workers) + MongoDB (Notes & Requirements)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {isAuthenticated && (
              <>
                <button
                  type="button"
                  onClick={() => fetchDashboardData(sessionToken)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#e2e8f0',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 600
                  }}
                >
                  <RefreshCw size={13} className={loading ? 'spin-icon' : ''} />
                  <span>Sync Now</span>
                </button>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '0.8rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={e => setAutoRefresh(e.target.checked)}
                  />
                  Live Sync
                </label>

                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    color: '#fca5a5',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 700
                  }}
                  title="Log Out of Admin Portal"
                >
                  <LogOut size={13} />
                  <span>Log Out</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* AUTHENTICATION WALL */}
        {!isAuthenticated ? (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, #0b1e36 0%, #0f172a 100%)',
            padding: '24px'
          }}>
            <form onSubmit={handleLogin} style={{
              background: '#ffffff',
              padding: '36px',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '440px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: 'rgba(11, 30, 54, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto'
                }}>
                  <Lock size={28} color="#0b1e36" />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0b1e36' }}>
                  Authorized Personnel Access
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px' }}>
                  Enter executive passcode to access PostgreSQL clients, offshore HR recruitment records, and telemetry logs.
                </p>
              </div>

              {authError && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <ShieldAlert size={16} />
                  <span>{authError}</span>
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0b1e36', display: 'block', marginBottom: '6px' }}>
                  Executive Security Passcode
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    placeholder="Enter security passcode"
                    value={inputPasscode}
                    onChange={e => setInputPasscode(e.target.value)}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 38px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                  <Key size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                disabled={loading}
              >
                <span>{loading ? 'Verifying...' : 'Unlock Executive Portal'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Top Metric Strip */}
            <div style={{
              background: '#f1f5f9',
              padding: '14px 28px',
              borderBottom: '1px solid #e2e8f0',
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '12px'
            }}>
              <div style={{ background: '#ffffff', padding: '10px 16px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Client Inquiries</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0284c7' }}>{consolidatedLeads.length} Total</div>
              </div>

              <div style={{ background: '#ffffff', padding: '10px 16px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Video Appointments</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669' }}>{appointmentsList.length} Booked</div>
              </div>

              <div style={{ background: '#ffffff', padding: '10px 16px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Offshore HR Partners</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669' }}>{hrList.length} Active</div>
              </div>

              <div style={{ background: '#ffffff', padding: '10px 16px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Offshore Workers</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0d9488' }}>{workerList.length} Vetted</div>
              </div>

              <div style={{ background: '#ffffff', padding: '10px 16px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Live Telemetry</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0b1e36' }}>{data.activeVisitorsCount} Online</div>
              </div>

              <div style={{ background: '#ffffff', padding: '10px 16px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Email Dispatches</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#9333ea' }}>{data.outbox.length} Sent</div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 28px',
              borderBottom: '1px solid #e2e8f0',
              background: '#ffffff',
              flexWrap: 'wrap'
            }}>
              {[
                { id: 'leads', label: 'Postgres & Web Inquiries', icon: Inbox, count: consolidatedLeads.length },
                { id: 'appointments', label: 'Video Appointments', icon: Calendar, count: appointmentsList.length },
                { id: 'recruitment', label: 'Offshore HR & Worker Roster', icon: Users, count: hrList.length + workerList.length },
                { id: 'visitors', label: 'Live Visitor Movement', icon: Globe, count: data.visitors.length },
                { id: 'highlights', label: 'Text Highlights', icon: Highlighter, count: data.textHighlights.length },
                { id: 'clicks', label: 'Click Coordinates', icon: MousePointer, count: data.recentClicks.length },
                { id: 'outbox', label: 'Email Outbox', icon: Mail, count: data.outbox.length }
              ].map(tab => {
                const IconC = tab.icon;
                const isSel = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      background: isSel ? 'rgba(11, 30, 54, 0.08)' : 'transparent',
                      border: isSel ? '1px solid #0b1e36' : '1px solid transparent',
                      color: isSel ? '#0b1e36' : '#64748b',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <IconC size={15} color={isSel ? '#0b1e36' : '#64748b'} />
                    <span>{tab.label}</span>
                    <span style={{
                      background: isSel ? '#0b1e36' : '#e2e8f0',
                      color: isSel ? '#ffffff' : '#475569',
                      fontSize: '0.75rem',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      fontWeight: 700
                    }}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tab Body */}
            <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto', background: '#f8fafc' }}>

              {/* TAB 1: POSTGRES CLIENTS + HR ALLOTMENTS + MONGO NOTES */}
              {activeTab === 'leads' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0b1e36', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Inbox size={20} color="#0284c7" />
                        Client Inquiries & Offshore Recruitment Pipeline
                      </h4>
                      <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '2px' }}>
                        PostgreSQL manages structured client records, assigned HR partners, and allotted workers. MongoDB stores custom written requirement notes.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => fetchDashboardData(passcode)}
                      style={{
                        background: '#ffffff',
                        border: '1.5px solid #cbd5e1',
                        color: '#0b1e36',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Refresh Records
                    </button>
                  </div>

                  {consolidatedLeads.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                      <Inbox size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
                      <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0b1e36' }}>No Client Inquiries Found</div>
                      <div style={{ fontSize: '0.88rem', marginTop: '4px' }}>Fill out the questionnaire on the homepage to create a client record.</div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '20px' }}>
                      {consolidatedLeads.map(lead => (
                        <div key={lead.id} style={{
                          background: '#ffffff',
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '14px',
                          padding: '24px',
                          boxShadow: '0 4px 16px rgba(11, 30, 54, 0.04)'
                        }}>
                          
                          {/* Card Top Row: Client Info + Status */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1e36', margin: 0 }}>
                                  {lead.fullName || lead.full_name || 'Website Inquirer'}
                                </h3>
                                <span style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  padding: '3px 10px',
                                  borderRadius: '20px',
                                  background: lead.status === 'ALLOCATED' ? '#ecfdf5' : '#e0f2fe',
                                  color: lead.status === 'ALLOCATED' ? '#059669' : '#0284c7',
                                  border: `1px solid ${lead.status === 'ALLOCATED' ? '#059669' : '#0284c7'}`
                                }}>
                                  {lead.status || 'NEW'}
                                </span>
                              </div>

                              <div style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px' }}>
                                <strong>{lead.email}</strong> • {lead.phone || 'No phone'} • <strong>{lead.company || 'Private Client'}</strong> • ID: <code>{lead.id}</code>
                              </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                                Submitted: {formatDateTime(lead.createdAt || lead.created_at || lead.timestamp)}
                              </span>
                            </div>
                          </div>

                          {/* Middle Row: Two Pillars (Assigned HR & Allotted Worker) */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                            
                            {/* Pillar 1: Assigned HR Partner (PostgreSQL) */}
                            <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <UserCheck size={14} /> Assigned HR Partner
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setReassignClientId(lead.id)}
                                  style={{ background: 'transparent', border: 'none', color: '#0284c7', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                >
                                  Re-assign
                                </button>
                              </div>

                              {reassignClientId === lead.id ? (
                                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                                  <select
                                    value={selectedNewHrId}
                                    onChange={e => setSelectedNewHrId(e.target.value)}
                                    style={{ flex: 1, padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                                  >
                                    <option value="">Select HR Partner...</option>
                                    {hrList.map(h => (
                                      <option key={h.id} value={h.id}>{h.full_name} ({h.offshore_region})</option>
                                    ))}
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => handleReassignHr(lead.id, selectedNewHrId)}
                                    style={{ background: '#0b1e36', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer' }}
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setReassignClientId(null)}
                                    style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer' }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : lead.assignedHr ? (
                                <div>
                                  <div style={{ fontWeight: 800, color: '#0b1e36', fontSize: '0.98rem' }}>{lead.assignedHr.name}</div>
                                  <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '2px' }}>{lead.assignedHr.region}</div>
                                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{lead.assignedHr.email}</div>
                                </div>
                              ) : (
                                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No HR partner assigned.</div>
                              )}
                            </div>

                            {/* Pillar 2: Allotted Worker / Squad (PostgreSQL) */}
                            <div style={{ background: '#f0fdf4', border: '1.5px solid rgba(5, 150, 105, 0.3)', borderRadius: '10px', padding: '16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Briefcase size={14} /> Allotted Offshore Worker(s)
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedClientForAllot(lead);
                                    setSelectedWorkerForAllot(null);
                                    setTargetClientId(lead.id);
                                    setTargetWorkerId(lead.allottedWorker?.id || workerList[0]?.id || '');
                                    setSelectedWorkerIdsForSquad([]);
                                    setAgreedRateInput(lead.allottedWorker?.rate || '55');
                                  }}
                                  style={{
                                    background: '#059669',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  {(lead.allocatedWorkers && lead.allocatedWorkers.length > 0) || lead.allottedWorker ? '+ Allot / Add Worker' : '+ Recruit & Allot Worker'}
                                </button>
                              </div>

                              {(lead.allocatedWorkers && lead.allocatedWorkers.length > 0) ? (
                                <div style={{ display: 'grid', gap: '8px' }}>
                                  {lead.allocatedWorkers.map((w, wIdx) => (
                                    <div key={w.id || wIdx} style={{ background: '#ffffff', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(5, 150, 105, 0.2)' }}>
                                      <div style={{ fontWeight: 800, color: '#064e3b', fontSize: '0.94rem' }}>
                                        {w.name}
                                      </div>
                                      <div style={{ fontSize: '0.8rem', color: '#047857', marginTop: '1px' }}>
                                        {w.role}
                                      </div>
                                      <div style={{ fontSize: '0.75rem', color: '#065f46', marginTop: '2px' }}>
                                        Rate: <strong>${w.rate}/hr</strong> • Stage: <strong style={{ color: '#047857' }}>{w.stage}</strong>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : lead.allottedWorker ? (
                                <div>
                                  <div style={{ fontWeight: 800, color: '#064e3b', fontSize: '0.98rem' }}>
                                    {lead.allottedWorker.name}
                                  </div>
                                  <div style={{ fontSize: '0.82rem', color: '#047857', marginTop: '2px' }}>
                                    {lead.allottedWorker.role}
                                  </div>
                                  <div style={{ fontSize: '0.78rem', color: '#065f46', marginTop: '4px' }}>
                                    Rate: <strong>${lead.allottedWorker.rate}/hr</strong> • Stage: <strong>{lead.allottedWorker.stage}</strong>
                                  </div>
                                </div>
                              ) : (
                                <div style={{ color: '#047857', fontSize: '0.85rem' }}>
                                  Awaiting worker recruitment by {lead.assignedHr?.name || 'Assigned HR'}.
                                </div>
                              )}
                            </div>

                          </div>

                          {/* MongoDB Section: Client's Custom Written Notes */}
                          <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                              <FileText size={14} /> Client's Custom Written Notes (MongoDB)
                            </div>
                            <div style={{ fontSize: '0.92rem', color: '#78350f', lineHeight: 1.6, fontStyle: lead.requirements?.clientNotes ? 'normal' : 'italic' }}>
                              {lead.requirements?.clientNotes ? `"${lead.requirements.clientNotes}"` : 'No freeform notes added by client.'}
                            </div>
                          </div>

                          {/* Questionnaire Answers Breakdown */}
                          {lead.requirements?.answers && Object.keys(lead.requirements.answers).length > 0 && (
                            <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px 16px', fontSize: '0.85rem', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                              <div style={{ fontWeight: 800, color: '#0b1e36', marginBottom: '6px' }}>Structured Questionnaire Answers:</div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                                {Object.entries(lead.requirements.answers).filter(([k]) => !k.endsWith('Note')).map(([k, v]) => (
                                  <div key={k}>
                                    <span style={{ color: '#64748b' }}>{k}:</span> <strong>{String(v)}</strong>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* HR Notes / Vetting Log (MongoDB) */}
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', color: '#0b1e36', marginBottom: '8px' }}>
                              HR Recruitment Notes & Interview Log (MongoDB)
                            </div>

                            {lead.requirements?.hrNotes && lead.requirements.hrNotes.length > 0 && (
                              <div style={{ display: 'grid', gap: '6px', marginBottom: '10px' }}>
                                {lead.requirements.hrNotes.map((n, idx) => (
                                  <div key={idx} style={{ background: '#f1f5f9', padding: '8px 12px', borderRadius: '6px', fontSize: '0.82rem' }}>
                                    <span style={{ fontWeight: 700, color: '#0b1e36' }}>{n.hrName}:</span> {n.note}
                                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: '8px' }}>
                                      {new Date(n.timestamp).toLocaleTimeString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Add Note Input */}
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input
                                type="text"
                                placeholder="HR: Append candidate interview notes, screening feedback or status..."
                                value={hrNoteInputs[lead.id] || ''}
                                onChange={e => setHrNoteInputs(prev => ({ ...prev, [lead.id]: e.target.value }))}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleAddHrNote(lead.id, lead.assignedHr?.id, lead.assignedHr?.name);
                                }}
                                style={{
                                  flex: 1,
                                  padding: '8px 12px',
                                  borderRadius: '6px',
                                  border: '1.5px solid #cbd5e1',
                                  fontSize: '0.85rem'
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleAddHrNote(lead.id, lead.assignedHr?.id, lead.assignedHr?.name)}
                                style={{
                                  background: '#0b1e36',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '8px 16px',
                                  borderRadius: '6px',
                                  fontSize: '0.82rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                <Send size={13} />
                                <span>Add Log</span>
                              </button>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: SCHEDULED APPOINTMENTS & VIDEO CONSULTATIONS (QA-026) */}
              {activeTab === 'appointments' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0b1e36', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={20} color="#059669" />
                        Confirmed Video Consultations (Google Meet & Zoom)
                      </h4>
                      <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '2px' }}>
                        Direct client appointments booked through the interactive calendar. Exclusively hosted on Google Meet or Zoom.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => fetchDashboardData(passcode)}
                      style={{
                        background: '#ffffff',
                        border: '1.5px solid #cbd5e1',
                        color: '#0b1e36',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Refresh Appointments
                    </button>
                  </div>

                  {appointmentsList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                      <Calendar size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
                      <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0b1e36' }}>No Video Appointments Scheduled</div>
                      <div style={{ fontSize: '0.88rem', marginTop: '4px' }}>Book a meeting via "Schedule Video Meeting" on the website to see it appear here.</div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                      {appointmentsList.map(apt => (
                        <div key={apt.id} style={{
                          background: '#ffffff',
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '12px',
                          padding: '20px',
                          boxShadow: '0 4px 14px rgba(11, 30, 54, 0.04)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '12px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0b1e36', margin: 0 }}>
                                  {apt.clientName || 'Direct Booking Client'}
                                </h3>
                                <span style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  background: apt.meetingPlatform === 'meet' ? 'rgba(0, 137, 123, 0.12)' : 'rgba(45, 140, 255, 0.12)',
                                  color: apt.meetingPlatform === 'meet' ? '#00897B' : '#2D8CFF',
                                  border: `1px solid ${apt.meetingPlatform === 'meet' ? '#00897B' : '#2D8CFF'}`
                                }}>
                                  {apt.meetingPlatform === 'meet' ? 'Google Meet' : 'Zoom Video'}
                                </span>
                                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                                  Ref: {apt.referenceCode || apt.id}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.86rem', color: '#64748b', marginTop: '4px' }}>
                                <strong>Email:</strong> {apt.clientEmail} {apt.clientPhone && `• Phone: ${apt.clientPhone}`} {apt.company && `• Company: ${apt.company}`}
                              </div>
                            </div>

                            <div style={{
                              background: 'rgba(5, 150, 105, 0.1)',
                              border: '1px solid rgba(5, 150, 105, 0.3)',
                              color: '#059669',
                              padding: '6px 14px',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <Clock size={15} />
                              <span>{apt.appointmentDate} at {apt.appointmentTime} ET</span>
                            </div>
                          </div>

                          {apt.customNotes && (
                            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.88rem', color: '#334155' }}>
                              <strong style={{ color: '#0b1e36' }}>Meeting Notes:</strong> {apt.customNotes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ROSTER OF HR & OFFSHORE WORKERS */}
              {activeTab === 'recruitment' && (
                <div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0b1e36', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={20} color="#059669" />
                    Offshore Recruitment Roster (PostgreSQL Database)
                  </h4>

                  {/* HR Managers Grid */}
                  <h5 style={{ fontSize: '1rem', fontWeight: 800, color: '#0284c7', marginBottom: '12px' }}>
                    Talent Acquisition Partners (hr_managers table)
                  </h5>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                    {hrList.map(hr => (
                      <div key={hr.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0b1e36' }}>{hr.full_name}</span>
                          <span style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                            {hr.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#059669' }}>{hr.title}</div>
                        <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>Region: <strong>{hr.offshore_region}</strong></div>
                        <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Email: {hr.email} • {hr.phone}</div>
                        <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontSize: '0.8rem', color: '#0b1e36', fontWeight: 700 }}>
                          Active Assigned Clients: {hr.active_client_count}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pre-Vetted Offshore Workers Grid */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h5 style={{ fontSize: '1rem', fontWeight: 800, color: '#059669', margin: 0 }}>
                      Pre-Vetted Offshore Technical Talent (workers table)
                    </h5>
                    <button
                      type="button"
                      onClick={() => {
                        setCreateWorkerError('');
                        setShowCreateWorkerModal(true);
                      }}
                      style={{
                        background: '#059669',
                        color: '#ffffff',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(5, 150, 105, 0.2)'
                      }}
                    >
                      <UserPlus size={15} />
                      <span>+ Register New Worker</span>
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                    {workerList.map(w => (
                      <div key={w.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0b1e36' }}>{w.full_name}</span>
                            <span style={{
                              fontSize: '0.75rem',
                              background: w.availability === 'AVAILABLE' ? '#ecfdf5' : '#fef3c7',
                              color: w.availability === 'AVAILABLE' ? '#059669' : '#b45309',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontWeight: 700
                            }}>
                              {w.availability}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0284c7' }}>{w.role}</div>
                          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                            Email: <code>{w.email}</code>
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '6px' }}>
                            Skills: <code>{w.skills}</code>
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
                            Timezone: {w.timezone}
                          </div>
                        </div>

                        <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ fontSize: '0.92rem', color: '#059669', fontWeight: 800 }}>
                            ${w.hourly_rate} <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>/ hour</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedWorkerForAllot(w);
                              setSelectedClientForAllot(null);
                              setTargetWorkerId(w.id);
                              setSelectedWorkerIdsForSquad([w.id]);
                              setTargetClientId(consolidatedLeads[0]?.id || '');
                              setAgreedRateInput(String(w.hourly_rate || 55));
                            }}
                            style={{
                              background: '#0b1e36',
                              color: '#ffffff',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <Briefcase size={13} />
                            <span>Allot to Client</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: VISITORS */}
              {activeTab === 'visitors' && (
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: '#0b1e36', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Globe size={18} color="#059669" />
                    Active Sessions & Live Reading Movement
                  </h4>

                  <div style={{ display: 'grid', gap: '12px' }}>
                    {data.visitors.map(v => (
                      <div key={v.id} style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: '#059669',
                            boxShadow: '0 0 10px #059669'
                          }} />

                          <div>
                            <div style={{ fontWeight: 700, color: '#0b1e36', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>Visitor ID: {v.id}</span>
                              <span style={{ fontSize: '0.75rem', background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(2, 132, 199, 0.3)', fontWeight: 700 }}>
                                <MapPin size={10} style={{ display: 'inline', marginRight: '3px' }} />
                                {v.location}
                              </span>
                            </div>
                            
                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                              IP: <code>{v.ip}</code> • User Agent: {v.userAgent.substring(0, 45)}...
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Currently Reading:</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
                            #{v.currentSection} Section
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                            {v.clickCount} Clicks • {v.highlightCount} Highlights
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: TEXT HIGHLIGHTS */}
              {activeTab === 'highlights' && (
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', color: '#0b1e36', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Highlighter size={18} color="#d97706" />
                    Text Highlighted / Selected by Visitors
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '20px' }}>
                    Captures exact sentences and key terms highlighted by clients as they read through the website content.
                  </p>

                  <div style={{ display: 'grid', gap: '12px' }}>
                    {data.textHighlights.map(hl => (
                      <div key={hl.id} style={{
                        background: '#ffffff',
                        borderLeft: '4px solid #d97706',
                        borderRadius: '8px',
                        padding: '16px',
                        borderTop: '1px solid #e2e8f0',
                        borderRight: '1px solid #e2e8f0',
                        borderBottom: '1px solid #e2e8f0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#b45309' }}>
                            " {hl.text} "
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {new Date(hl.timestamp).toLocaleTimeString()}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: '#64748b' }}>
                          <span>Visitor: <code style={{ color: '#0b1e36' }}>{hl.visitorId}</code></span>
                          <span>Section: <strong style={{ color: '#0284c7' }}>#{hl.section}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: CLICK STREAM */}
              {activeTab === 'clicks' && (
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: '#0b1e36', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MousePointer size={18} color="#0284c7" />
                    Live Visitor Click Stream & Coordinates
                  </h4>

                  <div style={{ display: 'grid', gap: '10px' }}>
                    {data.recentClicks.map(clk => (
                      <div key={clk.id} style={{
                        background: '#ffffff',
                        borderRadius: '8px',
                        padding: '12px 18px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <span style={{
                            background: 'rgba(2, 132, 199, 0.1)',
                            color: '#0284c7',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(2, 132, 199, 0.3)'
                          }}>
                            {clk.targetTag}
                          </span>

                          <div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
                              {clk.targetText || 'Clicked container element'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              Visitor: <code>{clk.visitorId}</code>
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 700 }}>
                            (X: {clk.x}px, Y: {clk.y}px)
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {new Date(clk.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: OUTBOX */}
              {activeTab === 'outbox' && (
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: '#0b1e36', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={18} color="#0284c7" />
                    Email Dispatch Outbox & Live Inboxes
                  </h4>

                  {/* LIVE EMAIL / GMAIL DELIVERY TEST BOX */}
                  <div style={{ background: '#ffffff', border: '1.5px solid #0284c7', borderRadius: '12px', padding: '18px 20px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ fontWeight: 800, color: '#0b1e36', fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Send size={16} color="#0284c7" />
                        <span>Live Personal Email Delivery Verification</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                        Real Inbox Verification
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 12px 0' }}>
                      Enter your personal Gmail address to test real delivery directly to your inbox.
                    </p>

                    <form onSubmit={handleSendTestEmail} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <input
                        type="email"
                        placeholder="yourname@gmail.com"
                        value={testEmailInput}
                        onChange={e => setTestEmailInput(e.target.value)}
                        required
                        style={{ flex: 1, minWidth: '220px', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                      <button
                        type="submit"
                        disabled={testEmailSending}
                        className="btn-primary"
                        style={{ padding: '9px 18px', fontSize: '0.85rem' }}
                      >
                        <span>{testEmailSending ? 'Dispatching...' : 'Send Live Test Email'}</span>
                        <Send size={14} />
                      </button>
                    </form>

                    {testEmailResult && (
                      <div style={{
                        marginTop: '12px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        background: testEmailResult.success ? '#ecfdf5' : '#fef2f2',
                        border: `1px solid ${testEmailResult.success ? '#a7f3d0' : '#fecaca'}`,
                        color: testEmailResult.success ? '#065f46' : '#dc2626'
                      }}>
                        {testEmailResult.success ? (
                          <div>
                            <strong>✓ Verification Dispatched!</strong> Sent test email to <code>{testEmailResult.target}</code>.
                            {testEmailResult.previewUrl && (
                              <div style={{ marginTop: '4px' }}>
                                Sandbox Preview: <a href={testEmailResult.previewUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'underline' }}>Click here to view sandbox email</a>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <strong>✗ Delivery notice:</strong> {testEmailResult.error || 'Failed to dispatch email.'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gap: '12px' }}>
                    {data.outbox.map(email => (
                      <div key={email.id} style={{
                        background: '#ffffff',
                        border: '1px solid rgba(2, 132, 199, 0.3)',
                        borderRadius: '10px',
                        padding: '16px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: email.recipientType === 'WORKER'
                                ? 'rgba(147, 51, 234, 0.15)'
                                : (email.recipientType === 'CLIENT' || email.to !== 'hello@mansalvic.com') 
                                  ? 'rgba(16, 185, 129, 0.15)' 
                                  : 'rgba(2, 132, 199, 0.15)',
                              color: email.recipientType === 'WORKER'
                                ? '#9333ea'
                                : (email.recipientType === 'CLIENT' || email.to !== 'hello@mansalvic.com') 
                                  ? '#059669' 
                                  : '#0284c7',
                              border: `1px solid ${email.recipientType === 'WORKER' 
                                ? 'rgba(147, 51, 234, 0.3)' 
                                : (email.recipientType === 'CLIENT' || email.to !== 'hello@mansalvic.com') 
                                  ? 'rgba(16, 185, 129, 0.3)' 
                                  : 'rgba(2, 132, 199, 0.3)'}`
                            }}>
                              {email.recipientType === 'WORKER' 
                                ? 'Worker Notification' 
                                : (email.recipientType === 'CLIENT' || email.to !== 'hello@mansalvic.com') 
                                  ? 'Client Confirmation' 
                                  : 'Admin Alert'}
                            </span>
                            <span style={{ fontWeight: 700, color: '#0b1e36', fontSize: '0.95rem' }}>
                              {email.subject}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.75rem', background: 'rgba(5, 150, 105, 0.1)', color: '#059669', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                            {email.status}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: email.previewUrl ? '8px' : '4px' }}>
                          To: <strong>{email.to}</strong> • Sent at: {new Date(email.timestamp).toLocaleString()}
                        </div>

                        {email.previewUrl && (
                          <div>
                            <a
                              href={email.previewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                fontSize: '0.82rem',
                                color: '#0284c7',
                                fontWeight: 700,
                                textDecoration: 'none'
                              }}
                            >
                              <span>View Rendered Email</span>
                              <ExternalLink size={13} aria-hidden="true" />
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </>
        )}

        {/* WORKER ALLOTMENT MODAL (Supports Client-to-Worker or Worker-to-Client Allotment) */}
        {(selectedClientForAllot || selectedWorkerForAllot) && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(11, 30, 54, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '20px'
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '580px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Briefcase size={22} color="#059669" />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1e36', margin: 0 }}>
                    {selectedWorkerForAllot ? 'Allot Engineer to Client' : 'Allot Offshore Talent to Client'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClientForAllot(null);
                    setSelectedWorkerForAllot(null);
                  }}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Context Summary Banner */}
              {selectedClientForAllot ? (
                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.88rem', border: '1px solid #e2e8f0' }}>
                  <div>Client: <strong>{selectedClientForAllot.fullName || selectedClientForAllot.full_name}</strong> ({selectedClientForAllot.company || 'Private'})</div>
                  <div style={{ marginTop: '2px', color: '#64748b' }}>Assigned HR: <strong>{selectedClientForAllot.assignedHr?.name || selectedClientForAllot.assignedHr?.full_name || 'Talent Acquisition Team'}</strong></div>
                </div>
              ) : selectedWorkerForAllot ? (
                <div style={{ background: '#ecfdf5', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.88rem', border: '1px solid rgba(5, 150, 105, 0.2)' }}>
                  <div>Offshore Worker: <strong>{selectedWorkerForAllot.full_name}</strong> — {selectedWorkerForAllot.role}</div>
                  <div style={{ marginTop: '2px', color: '#047857' }}>Standard Rate: <strong>${selectedWorkerForAllot.hourly_rate}/hr</strong> • Timezone: {selectedWorkerForAllot.timezone}</div>
                </div>
              ) : null}

              <form onSubmit={handleAllotWorker}>
                {/* If opened from Worker, select target client */}
                {selectedWorkerForAllot && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0b1e36', marginBottom: '6px' }}>
                      Select Target Client / Inquirer
                    </label>
                    <select
                      value={targetClientId}
                      onChange={e => setTargetClientId(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem' }}
                    >
                      <option value="">-- Choose Client --</option>
                      {consolidatedLeads.map(lead => (
                        <option key={lead.id} value={lead.id}>
                          {lead.fullName || lead.full_name} ({lead.company || lead.email}) — Ref: {lead.id}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* If opened from Client, select single worker or multi-worker squad */}
                {selectedClientForAllot && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0b1e36' }}>
                        Select Pre-Vetted Offshore Worker
                      </label>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Multiple workers can form an engineering squad
                      </span>
                    </div>

                    <select
                      value={targetWorkerId}
                      onChange={e => {
                        setTargetWorkerId(e.target.value);
                        const w = workerList.find(item => item.id === e.target.value);
                        if (w) setAgreedRateInput(String(w.hourly_rate));
                      }}
                      required={selectedWorkerIdsForSquad.length === 0}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem', marginBottom: '10px' }}
                    >
                      <option value="">-- Choose Primary Candidate --</option>
                      {workerList.map(w => (
                        <option key={w.id} value={w.id}>
                          {w.full_name} — {w.role} (${w.hourly_rate}/hr) [{w.availability}]
                        </option>
                      ))}
                    </select>

                    {/* Quick multi-select squad checkboxes */}
                    <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>
                        Or Build a Squad (Check All Applicable Workers):
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                        {workerList.map(w => {
                          const isChecked = selectedWorkerIdsForSquad.includes(w.id) || (targetWorkerId === w.id);
                          return (
                            <label key={w.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#0f172a', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setSelectedWorkerIdsForSquad(prev => [...new Set([...prev, w.id])]);
                                    if (!targetWorkerId) setTargetWorkerId(w.id);
                                  } else {
                                    setSelectedWorkerIdsForSquad(prev => prev.filter(id => id !== w.id));
                                    if (targetWorkerId === w.id) setTargetWorkerId('');
                                  }
                                }}
                              />
                              <span><strong>{w.full_name}</strong> ({w.role}) — ${w.hourly_rate}/hr</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0b1e36', marginBottom: '6px' }}>
                      Recruitment Stage
                    </label>
                    <select
                      value={recruitmentStage}
                      onChange={e => setRecruitmentStage(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem' }}
                    >
                      <option value="SOURCING">Sourcing & Pre-Screening</option>
                      <option value="CLIENT_INTERVIEW">Client Interview Scheduled</option>
                      <option value="ALLOTTED">Officially Allotted</option>
                      <option value="ACTIVE">Active in Sprints</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0b1e36', marginBottom: '6px' }}>
                      Agreed Hourly Rate ($/hr)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 55"
                      value={agreedRateInput}
                      onChange={e => setAgreedRateInput(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClientForAllot(null);
                      setSelectedWorkerForAllot(null);
                    }}
                    style={{ background: '#f1f5f9', border: 'none', padding: '10px 18px', borderRadius: '8px', color: '#475569', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={allotSubmitting}
                    style={{ padding: '10px 22px' }}
                  >
                    <span>{allotSubmitting ? 'Allotting...' : 'Confirm Allotment & Notify'}</span>
                    <CheckCircle2 size={16} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CREATE OFFSHORE WORKER MODAL */}
        {showCreateWorkerModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(11, 30, 54, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '20px'
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserPlus size={22} color="#059669" />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1e36', margin: 0 }}>
                    Register New Offshore Worker
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateWorkerModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={20} />
                </button>
              </div>

              {createWorkerError && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} />
                  <span>{createWorkerError}</span>
                </div>
              )}

              <form onSubmit={handleCreateWorker}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0b1e36', marginBottom: '6px' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Liam Sterling"
                      value={newWorkerForm.full_name}
                      onChange={e => setNewWorkerForm(prev => ({ ...prev, full_name: e.target.value }))}
                      required
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0b1e36', marginBottom: '6px' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. liam@mansalvic.dev"
                      value={newWorkerForm.email}
                      onChange={e => setNewWorkerForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0b1e36', marginBottom: '6px' }}>
                    Primary Role / Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Full-Stack Engineer (React, Node.js, GraphQL)"
                    value={newWorkerForm.role}
                    onChange={e => setNewWorkerForm(prev => ({ ...prev, role: e.target.value }))}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0b1e36', marginBottom: '6px' }}>
                    Core Technical Skills
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. React, TypeScript, Python, FastAPI, Docker, AWS"
                    value={newWorkerForm.skills}
                    onChange={e => setNewWorkerForm(prev => ({ ...prev, skills: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0b1e36', marginBottom: '6px' }}>
                      Hourly Rate ($ USD / hr)
                    </label>
                    <input
                      type="number"
                      placeholder="55"
                      value={newWorkerForm.hourly_rate}
                      onChange={e => setNewWorkerForm(prev => ({ ...prev, hourly_rate: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0b1e36', marginBottom: '6px' }}>
                      Availability Status
                    </label>
                    <select
                      value={newWorkerForm.availability}
                      onChange={e => setNewWorkerForm(prev => ({ ...prev, availability: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
                    >
                      <option value="AVAILABLE">AVAILABLE (Immediate)</option>
                      <option value="ALLOCATED">ALLOCATED (Active Client)</option>
                      <option value="INTERVIEWING">INTERVIEWING</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '22px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0b1e36', marginBottom: '6px' }}>
                    Timezone & Overlap
                  </label>
                  <input
                    type="text"
                    placeholder="Offshore US-Aligned (4–6h Daily US Overlap)"
                    value={newWorkerForm.timezone}
                    onChange={e => setNewWorkerForm(prev => ({ ...prev, timezone: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateWorkerModal(false)}
                    style={{ background: '#f1f5f9', border: 'none', padding: '10px 18px', borderRadius: '8px', color: '#475569', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={creatingWorker}
                    style={{ padding: '10px 22px' }}
                  >
                    <span>{creatingWorker ? 'Registering...' : 'Register Worker in PostgreSQL'}</span>
                    <CheckCircle2 size={16} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
