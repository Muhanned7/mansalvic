import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, ChevronRight, ChevronLeft, Send, Sparkles, ShieldCheck, Calendar, Video } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import AppointmentBookingCalendar from './AppointmentBookingCalendar';
import './QuestionnaireModal.css';

export default function QuestionnaireModal({ 
  isOpen, 
  onClose, 
  visitorId, 
  initialService = '', 
  initialMode = 'questions', 
  initialRequirementsNotes = '' 
}) {
  const modalRef = useRef(null);
  const previousActiveElementRef = useRef(null);
  const [activeService, setActiveService] = useState('');
  const [viewMode, setViewMode] = useState('questions'); // 'questions' | 'appointment'
  const [skipNotes, setSkipNotes] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Service-specific answers structure
  const [answers, setAnswers] = useState({
    // Staffing Specific
    staffingRole: 'Senior Full-Stack Engineers',
    staffingRoleNote: '',
    hiringModel: 'Contract / Staff Augmentation',
    hiringModelNote: '',
    hourlyRate: '$55 - $80 / hour',
    hourlyRateNote: '',
    staffingTimeline: 'Immediate (Within 1 to 2 Weeks)',
    staffingTimelineNote: '',

    // Development Specific
    devAppType: 'Full-Stack Web Application / SaaS Platform',
    devAppTypeNote: '',
    devStage: 'Concept & Requirements Scoping',
    devStageNote: '',
    devBudget: '$30,000 - $60,000',
    devBudgetNote: '',
    devTimeline: 'Rapid Prototype (1 to 2 Months)',
    devTimelineNote: '',

    // Maintenance Specific
    maintSystemType: 'Production Web & Cloud Platform',
    maintSystemTypeNote: '',
    slaTier: '24/7/365 Emergency SLA (Sub-Hour Response)',
    slaTierNote: '',
    maintRetainer: '$5,000 - $10,000 / month',
    maintRetainerNote: '',
    maintStart: 'Immediate / Urgent (Active Incident)',
    maintStartNote: ''
  });

  const [contactInfo, setContactInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (initialService && typeof initialService === 'string') {
        if (initialService.includes('staff')) setActiveService('staffing');
        else if (initialService.includes('dev')) setActiveService('development');
        else if (initialService.includes('maint')) setActiveService('maintenance');
        else setActiveService(initialService);
      } else {
        setActiveService('');
      }
      setViewMode(initialMode || 'questions');
      setSkipNotes(initialRequirementsNotes || '');
      setAnswers({});
      setContactInfo({ fullName: '', email: '', phone: '', company: '', notes: '' });
      setStep(1);
      setErrorMsg('');
      setSuccessData(null);
    }
  }, [initialService, initialMode, initialRequirementsNotes, isOpen]);

  // Focus trap, initial focus & focus return for accessibility (QA-016)
  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement;

      // Auto-focus first focusable element inside modal
      const focusTimer = setTimeout(() => {
        if (modalRef.current) {
          const focusables = modalRef.current.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          if (focusables.length > 0) {
            focusables[0].focus();
          } else {
            modalRef.current.focus();
          }
        }
      }, 60);

      const handleKeyDown = (e) => {
        if (!isOpen) return;

        // Escape closes modal
        if (e.key === 'Escape') {
          onClose();
          return;
        }

        // Tab key focus trap
        if (e.key === 'Tab' && modalRef.current) {
          const focusables = Array.from(modalRef.current.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          ));
          if (focusables.length === 0) return;

          const firstEl = focusables[0];
          const lastEl = focusables[focusables.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstEl) {
              e.preventDefault();
              lastEl.focus();
            }
          } else {
            if (document.activeElement === lastEl) {
              e.preventDefault();
              firstEl.focus();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(focusTimer);
        window.removeEventListener('keydown', handleKeyDown);
        if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
          previousActiveElementRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectAnswer = (field, value) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
    setErrorMsg('');
  };

  const handleNoteChange = (field, value) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
    if (value && value.trim()) {
      setSkipNotes(value);
      setErrorMsg('');
    }
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step === 1 && !activeService) {
      setErrorMsg('Please select one of the services above to proceed.');
      return;
    }
    if (step === 2) {
      const step2Value = 
        activeService === 'staffing' ? (answers.staffingRole || answers.staffingRoleNote) :
        activeService === 'development' ? (answers.devAppType || answers.devAppTypeNote) :
        activeService === 'maintenance' ? (answers.maintSystemType || answers.maintSystemTypeNote) : null;
      
      if (!step2Value && !skipNotes) {
        setErrorMsg('Please select an option above or enter your requirements to proceed.');
        return;
      }
    }
    setErrorMsg('');
    setStep(prev => prev + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contactInfo.email || !contactInfo.fullName) {
      setErrorMsg('Please enter your full name and email address.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const friendlyLeadId = 'MSV-2026-' + Math.random().toString(36).substring(2, 6).toUpperCase();

      // 1. Store directly into Firebase Firestore 'leads' collection
      const docRef = await addDoc(collection(db, 'leads'), {
        referenceCode: friendlyLeadId,
        serviceType: activeService || 'general',
        answers,
        contactInfo,
        visitorId: visitorId || 'anonymous',
        createdAt: serverTimestamp(),
        source: 'web_questionnaire'
      });

      // 2. Mirror into Backend Database (PostgreSQL + MongoDB + Analytics)
      try {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answers,
            contactInfo,
            visitorId: visitorId || 'anonymous',
            serviceType: activeService || 'general',
            referenceCode: friendlyLeadId,
            source: 'web_questionnaire'
          })
        });
      } catch (apiErr) {
        console.warn('Backend API leads mirror notice:', apiErr);
      }

      setLoading(false);
      setSuccessData({
        success: true,
        leadId: friendlyLeadId,
        docId: docRef.id
      });
    } catch (err) {
      setLoading(false);
      console.error('Firestore submission error:', err);
      setErrorMsg('Error saving to Firebase Firestore: ' + (err.message || 'Please check your connection and rules.'));
    }
  };

  const totalSteps = 6;

  const activeNotes = skipNotes || answers.staffingRoleNote || answers.devAppTypeNote || answers.maintSystemTypeNote || '';
  const isSkipEnabled = activeNotes.trim().length > 0;

  const renderSkipButtonBanner = () => (
    <div className="skip-appointment-box">
      <div className="skip-appointment-text">
        <div className="skip-appointment-badge">
          <Video size={13} aria-hidden="true" /> Video Meeting Fast-Track (Google Meet / Zoom)
        </div>
        <p className="skip-appointment-hint">
          {isSkipEnabled
            ? 'Requirements noted! You can now skip remaining questions and schedule a video meeting directly on Google Meet or Zoom.'
            : 'Enter your requirements above, or skip directly to selecting a time on our video meeting calendar.'}
        </p>
      </div>

      <button
        type="button"
        className="btn-skip-appointment active"
        onClick={() => {
          setViewMode('appointment');
        }}
        title="Skip remaining questions and select a meeting time on Google Meet or Zoom"
      >
        <Video size={16} aria-hidden="true" />
        <span>Skip Questions & Schedule Meeting</span>
      </button>
    </div>
  );

  const renderFreeTextArea = (field, placeholder) => (
    <div style={{ marginTop: '16px' }}>
      <label className="modal-input-label">Tell us more in your own words (or write notes to skip questions)</label>
      <textarea
        rows="3"
        placeholder={placeholder}
        className="form-input modal-textarea"
        value={answers[field] || ''}
        onChange={e => handleNoteChange(field, e.target.value)}
      />
      {renderSkipButtonBanner()}
    </div>
  );

  const getServiceBadgeName = () => {
    if (step === 1 || !activeService) return 'Choose Service';
    switch (activeService) {
      case 'staffing': return 'IT Staff Augmentation & Dedicated Teams';
      case 'development': return 'Custom Application Development';
      case 'maintenance': return '24/7 Application Maintenance & SLAs';
      default: return 'Mansalvic IT Consultation';
    }
  };

  if (viewMode === 'appointment') {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div
          ref={modalRef}
          className="modal-content"
          onClick={e => e.stopPropagation()}
          style={{ maxWidth: '820px', width: '92%' }}
          role="dialog"
          aria-modal="true"
          aria-label="Video Meeting Booking Calendar"
        >
          <button type="button" onClick={onClose} className="modal-close-btn" aria-label="Close dialog">
            <X size={20} aria-hidden="true" />
          </button>
          <AppointmentBookingCalendar
            serviceType={activeService}
            initialNotes={activeNotes}
            onBack={() => setViewMode('questions')}
            onClose={onClose}
            visitorId={visitorId}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        className="modal-content"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Assessment Questionnaire"
      >
        {/* Close Button */}
        <button type="button" onClick={onClose} className="modal-close-btn" aria-label="Close dialog">
          <X size={20} aria-hidden="true" />
        </button>

        {!successData ? (
          <>
            {/* Modal Header */}
            <div className="modal-header-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span className="glass-pill modal-step-badge">
                  <Sparkles size={12} aria-hidden="true" /> Step {step} of {totalSteps}{step >= 3 && step <= 5 ? ' (Optional)' : ''}
                </span>
                <span className="modal-dialogue-tag">
                  {getServiceBadgeName()}
                </span>
              </div>
              {/* Progress Bar */}
              <div className="modal-progress-track">
                <div
                  className="modal-progress-bar"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* Direct Video Meeting Skip Shortcut Banner */}
            <div className="modal-skip-shortcut-banner">
              <div className="modal-skip-shortcut-info">
                <Video size={16} color="var(--emerald-600)" aria-hidden="true" />
                <span>Prefer to talk directly? Skip questions and schedule a 1-on-1 meeting on <strong>Google Meet</strong> or <strong>Zoom</strong>.</span>
              </div>
              <button
                type="button"
                className="btn-modal-skip-direct"
                onClick={() => setViewMode('appointment')}
                title="Skip questions and select meeting time"
              >
                <Calendar size={14} aria-hidden="true" />
                <span>Schedule Video Meeting</span>
              </button>
            </div>

            {errorMsg && (
              <div className="modal-error-banner">
                {errorMsg}
              </div>
            )}

            {/* ====================================================================
                STEP 1: SERVICE SELECTION
                ==================================================================== */}
            {step === 1 && (
              <div>
                <h3 className="modal-question-heading">
                  Which of our core services would you like to explore?
                </h3>
                <p className="modal-question-subtitle">
                  Select the primary capability or solution that aligns with your organization's technical needs.
                </p>

                {[
                  {
                    id: 'staffing',
                    badge: 'Talent Scaling',
                    title: 'IT Staff Augmentation & Dedicated Teams',
                    desc: 'Rapidly onboard vetted software engineers, cloud architects, and dedicated engineering squads.'
                  },
                  {
                    id: 'development',
                    badge: 'Bespoke Software',
                    title: 'Custom Application Development',
                    desc: 'Engineer bespoke web, mobile, and cloud-native software platforms tailored to your operational workflows.'
                  },
                  {
                    id: 'maintenance',
                    badge: 'System Reliability',
                    title: '24/7 Application Maintenance & SLAs',
                    desc: 'Safeguard uptime with round-the-clock proactive monitoring, zero-downtime patching, and guaranteed SLAs.'
                  }
                ].map(opt => (
                  <div
                    key={opt.id}
                    className={`option-card ${activeService === opt.id ? 'selected' : ''}`}
                    onClick={() => {
                      setActiveService(opt.id);
                      setErrorMsg('');
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: 'var(--emerald-600)',
                          background: 'rgba(31, 122, 85, 0.1)',
                          padding: '2px 8px',
                          borderRadius: '12px'
                        }}>
                          {opt.badge}
                        </span>
                        <div className="option-card-title" style={{ fontSize: '1.05rem' }}>{opt.title}</div>
                      </div>
                      <div className="option-card-desc">{opt.desc}</div>
                    </div>
                    {activeService === opt.id && <CheckCircle2 size={22} className="option-card-check" aria-hidden="true" style={{ flexShrink: 0, marginLeft: '12px' }} />}
                  </div>
                ))}

                {/* Option to enter custom requirements notes directly and skip */}
                <div style={{ marginTop: '20px' }}>
                  <label className="modal-input-label">
                    Have specific project requirements? Describe them here to unlock direct appointment booking:
                  </label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Looking for 2 Senior Full-Stack engineers to augment our React & Node team starting next month..."
                    className="form-input modal-textarea"
                    value={skipNotes}
                    onChange={e => setSkipNotes(e.target.value)}
                  />
                </div>

                {renderSkipButtonBanner()}
              </div>
            )}

            {/* ====================================================================
                PATH 1: IT STAFF AUGMENTATION & DEDICATED TEAMS
                ==================================================================== */}
            {activeService === 'staffing' && (
              <>
                {step === 2 && (
                  <div>
                    <h3 className="modal-question-heading">
                      What skill expertise or technical roles are you looking to onboard?
                    </h3>
                    <p className="modal-question-subtitle">
                      Select the primary engineering role or technical domain required for your team.
                    </p>

                    {[
                      { id: 'Senior Full-Stack Engineers', desc: 'React, Node.js, Python, TypeScript, Java / .NET engineers' },
                      { id: 'Cloud, DevOps & SRE Specialists', desc: 'AWS, Azure, GCP, Kubernetes, Docker, Terraform & CI/CD automation' },
                      { id: 'Mobile Application Engineers', desc: 'React Native, Flutter, Swift iOS, and Kotlin Android developers' },
                      { id: 'QA Automation & Testing Leads', desc: 'Selenium, Playwright, Cypress, and automated test suite architects' }
                    ].map(opt => (
                      <div
                        key={opt.id}
                        className={`option-card ${answers.staffingRole === opt.id ? 'selected' : ''}`}
                        onClick={() => handleSelectAnswer('staffingRole', opt.id)}
                      >
                        <div>
                          <div className="option-card-title">{opt.id}</div>
                          <div className="option-card-desc">{opt.desc}</div>
                        </div>
                        {answers.staffingRole === opt.id && <CheckCircle2 size={20} className="option-card-check" aria-hidden="true" />}
                      </div>
                    ))}

                    {renderFreeTextArea('staffingRoleNote', 'Specify any required programming languages, libraries, or years of experience...')}
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <h3 className="modal-question-heading">
                      What hiring or engagement model fits your organization?
                    </h3>
                    <p className="modal-question-subtitle">
                      Choose whether you require contract augmentation, contract-to-hire, or full-time placement.
                    </p>

                    {[
                      { id: 'Contract / Staff Augmentation', desc: 'Elastic developer capacity integrated directly into your active sprints' },
                      { id: 'Contract-to-Hire', desc: 'Evaluate engineers on contract with the flexibility to transition to permanent full-time' },
                      { id: 'Direct Full-Time Placement', desc: 'Dedicated headhunting and executive vetting for permanent senior hires' },
                      { id: 'Dedicated Engineering Squad', desc: 'Fully pre-assembled team: Tech Lead, Developers, QA & DevOps' }
                    ].map(opt => (
                      <div
                        key={opt.id}
                        className={`option-card ${answers.hiringModel === opt.id ? 'selected' : ''}`}
                        onClick={() => handleSelectAnswer('hiringModel', opt.id)}
                      >
                        <div>
                          <div className="option-card-title">{opt.id}</div>
                          <div className="option-card-desc">{opt.desc}</div>
                        </div>
                        {answers.hiringModel === opt.id && <CheckCircle2 size={20} className="option-card-check" aria-hidden="true" />}
                      </div>
                    ))}

                    {renderFreeTextArea('hiringModelNote', 'Tell us about your team setup or specific contract terms...')}
                  </div>
                )}

                {step === 4 && (
                  <div>
                    <h3 className="modal-question-heading">
                      What target rate range or budget parameters are you looking into?
                    </h3>
                    <p className="modal-question-subtitle">
                      This allows us to calibrate candidate seniority and global placement tiers.
                    </p>

                    {[
                      { id: '$35 - $55 / hour', desc: 'Mid-level specialized global engineers with verified English fluency' },
                      { id: '$55 - $80 / hour', desc: 'Senior software engineers, technical leads & certified cloud specialists' },
                      { id: '$80 - $110+ / hour', desc: 'Principal architects, DevOps specialists & mission-critical consultants' },
                      { id: 'Flexible / Retainer Model', desc: 'Open to rate recommendations based on candidate seniority and scope' }
                    ].map(opt => (
                      <div
                        key={opt.id}
                        className={`option-card ${answers.hourlyRate === opt.id ? 'selected' : ''}`}
                        onClick={() => handleSelectAnswer('hourlyRate', opt.id)}
                      >
                        <div>
                          <div className="option-card-title">{opt.id}</div>
                          <div className="option-card-desc">{opt.desc}</div>
                        </div>
                        {answers.hourlyRate === opt.id && <CheckCircle2 size={20} className="option-card-check" aria-hidden="true" />}
                      </div>
                    ))}

                    {renderFreeTextArea('hourlyRateNote', 'Any budget flexibility, salary ceilings, or compensation details?')}
                  </div>
                )}

                {step === 5 && (
                  <div>
                    <h3 className="modal-question-heading">
                      When would you like the engineers onboarded and deployed?
                    </h3>
                    <p className="modal-question-subtitle">
                      Our global talent pipeline enables deployment in as little as 1 to 2 weeks.
                    </p>

                    {[
                      { id: 'Immediate (Within 1 to 2 Weeks)', desc: 'Active sprint bottleneck or urgent project deadline needing reinforcements' },
                      { id: 'Short-Term (2 to 4 Weeks)', desc: 'Planning upcoming feature sprint or quarterly roadmap scale-up' },
                      { id: 'Future Pipeline (1 to 3 Months)', desc: 'Evaluating partner capabilities for future quarter initiatives' }
                    ].map(opt => (
                      <div
                        key={opt.id}
                        className={`option-card ${answers.staffingTimeline === opt.id ? 'selected' : ''}`}
                        onClick={() => handleSelectAnswer('staffingTimeline', opt.id)}
                      >
                        <div>
                          <div className="option-card-title">{opt.id}</div>
                          <div className="option-card-desc">{opt.desc}</div>
                        </div>
                        {answers.staffingTimeline === opt.id && <CheckCircle2 size={20} className="option-card-check" aria-hidden="true" />}
                      </div>
                    ))}

                    {renderFreeTextArea('staffingTimelineNote', 'Any specific milestone dates or project kickoff schedules?')}
                  </div>
                )}
              </>
            )}

            {/* ====================================================================
                PATH 2: CUSTOM APPLICATION DEVELOPMENT
                ==================================================================== */}
            {activeService === 'development' && (
              <>
                {step === 2 && (
                  <div>
                    <h3 className="modal-question-heading">
                      What type of software application are you looking to build?
                    </h3>
                    <p className="modal-question-subtitle">
                      Select the primary application architecture or digital platform.
                    </p>

                    {[
                      { id: 'Full-Stack Web Application / SaaS Platform', desc: 'Modern responsive web platform with microservices & secure database' },
                      { id: 'Mobile Application (iOS & Android)', desc: 'Cross-platform or native mobile app with backend cloud API orchestration' },
                      { id: 'Enterprise API & Backend Ecosystem', desc: 'High-throughput microservices, database architecture & enterprise integrations' },
                      { id: 'End-to-End MVP (Prototype to Production)', desc: 'Complete product scoping, UI/UX design, architecture, and production launch' }
                    ].map(opt => (
                      <div
                        key={opt.id}
                        className={`option-card ${answers.devAppType === opt.id ? 'selected' : ''}`}
                        onClick={() => handleSelectAnswer('devAppType', opt.id)}
                      >
                        <div>
                          <div className="option-card-title">{opt.id}</div>
                          <div className="option-card-desc">{opt.desc}</div>
                        </div>
                        {answers.devAppType === opt.id && <CheckCircle2 size={20} className="option-card-check" aria-hidden="true" />}
                      </div>
                    ))}

                    {renderFreeTextArea('devAppTypeNote', 'Describe the key features, business goals, or preferred technology stacks...')}
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <h3 className="modal-question-heading">
                      What stage is your development project currently in?
                    </h3>
                    <p className="modal-question-subtitle">
                      Help us assess technical maturity, wireframes, and engineering scope.
                    </p>

                    {[
                      { id: 'Concept & Requirements Scoping', desc: 'Initial vision, looking for architecture scoping and design direction' },
                      { id: 'Wireframes / UI Design Ready', desc: 'Have Figma or product specifications ready to begin engineering sprints' },
                      { id: 'Existing Application Refactor', desc: 'Modernizing legacy code, fixing performance bottlenecks, or adding modules' },
                      { id: 'Active Development Acceleration', desc: 'Augmenting an existing codebase with dedicated full-lifecycle velocity' }
                    ].map(opt => (
                      <div
                        key={opt.id}
                        className={`option-card ${answers.devStage === opt.id ? 'selected' : ''}`}
                        onClick={() => handleSelectAnswer('devStage', opt.id)}
                      >
                        <div>
                          <div className="option-card-title">{opt.id}</div>
                          <div className="option-card-desc">{opt.desc}</div>
                        </div>
                        {answers.devStage === opt.id && <CheckCircle2 size={20} className="option-card-check" aria-hidden="true" />}
                      </div>
                    ))}

                    {renderFreeTextArea('devStageNote', 'Share any design links, repository details, or technical specs...')}
                  </div>
                )}

                {step === 4 && (
                  <div>
                    <h3 className="modal-question-heading">
                      What is your estimated investment range for the project?
                    </h3>
                    <p className="modal-question-subtitle">
                      We assemble dedicated engineering squads tailored to deliver maximum commercial value.
                    </p>

                    {[
                      { id: '$15,000 - $30,000', desc: 'Rapid MVP build, targeted enterprise feature, or initial proof of concept' },
                      { id: '$30,000 - $60,000', desc: 'Full custom web or mobile platform with UI/UX, database & integrations' },
                      { id: '$60,000 - $120,000+', desc: 'Comprehensive enterprise application with complex cloud infrastructure' },
                      { id: 'Agile Milestone Retainer', desc: 'Sprint-by-sprint release billing with flexible scope adjustments' }
                    ].map(opt => (
                      <div
                        key={opt.id}
                        className={`option-card ${answers.devBudget === opt.id ? 'selected' : ''}`}
                        onClick={() => handleSelectAnswer('devBudget', opt.id)}
                      >
                        <div>
                          <div className="option-card-title">{opt.id}</div>
                          <div className="option-card-desc">{opt.desc}</div>
                        </div>
                        {answers.devBudget === opt.id && <CheckCircle2 size={20} className="option-card-check" aria-hidden="true" />}
                      </div>
                    ))}

                    {renderFreeTextArea('devBudgetNote', 'Any funding details, budget milestones, or billing preferences?')}
                  </div>
                )}

                {step === 5 && (
                  <div>
                    <h3 className="modal-question-heading">
                      What is your target launch or delivery milestone?
                    </h3>
                    <p className="modal-question-subtitle">
                      We execute in structured 2-week agile sprint cadences with live demonstrations.
                    </p>

                    {[
                      { id: 'Rapid Prototype (1 to 2 Months)', desc: 'High-speed MVP delivery to hit market opportunity quickly' },
                      { id: 'Quarterly Release (3 to 4 Months)', desc: 'Complete production release with automated test suites & polish' },
                      { id: 'Comprehensive Platform (4 to 6+ Months)', desc: 'Multi-phased enterprise roadmap with continuous deployments' }
                    ].map(opt => (
                      <div
                        key={opt.id}
                        className={`option-card ${answers.devTimeline === opt.id ? 'selected' : ''}`}
                        onClick={() => handleSelectAnswer('devTimeline', opt.id)}
                      >
                        <div>
                          <div className="option-card-title">{opt.id}</div>
                          <div className="option-card-desc">{opt.desc}</div>
                        </div>
                        {answers.devTimeline === opt.id && <CheckCircle2 size={20} className="option-card-check" aria-hidden="true" />}
                      </div>
                    ))}

                    {renderFreeTextArea('devTimelineNote', 'Any hard launch deadlines, investor demos, or marketing events?')}
                  </div>
                )}
              </>
            )}

            {/* ====================================================================
                PATH 3: 24/7 APPLICATION MAINTENANCE & SUPPORT
                ==================================================================== */}
            {activeService === 'maintenance' && (
              <>
                {step === 2 && (
                  <div>
                    <h3 className="modal-question-heading">
                      What type of system or application requires ongoing maintenance?
                    </h3>
                    <p className="modal-question-subtitle">
                      Help us understand your technical environment and current platform health.
                    </p>

                    {[
                      { id: 'Production Web & Cloud Platform', desc: 'Live web app or SaaS platform requiring 24/7 uptime & active patch management' },
                      { id: 'Legacy Enterprise Software & Database', desc: 'Core business system needing code cleanup, database tuning & security updates' },
                      { id: 'Mobile Application Ecosystem', desc: 'iOS & Android apps needing continuous OS upgrades, bug fixes & API sync' },
                      { id: 'Multi-Cloud Infrastructure & DevOps', desc: 'Kubernetes, AWS/GCP clusters needing continuous monitoring & failover support' }
                    ].map(opt => (
                      <div
                        key={opt.id}
                        className={`option-card ${answers.maintSystemType === opt.id ? 'selected' : ''}`}
                        onClick={() => handleSelectAnswer('maintSystemType', opt.id)}
                      >
                        <div>
                          <div className="option-card-title">{opt.id}</div>
                          <div className="option-card-desc">{opt.desc}</div>
                        </div>
                        {answers.maintSystemType === opt.id && <CheckCircle2 size={20} className="option-card-check" aria-hidden="true" />}
                      </div>
                    ))}

                    {renderFreeTextArea('maintSystemTypeNote', 'Tell us about your current technology stack, hosting, or main pain points...')}
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <h3 className="modal-question-heading">
                      What level of SLA coverage and emergency response do you require?
                    </h3>
                    <p className="modal-question-subtitle">
                      Select the support agreement that matches your business criticality.
                    </p>

                    {[
                      { id: '24/7/365 Emergency SLA (Sub-Hour Response)', desc: 'Round-the-clock on-call engineers for critical system incidents' },
                      { id: 'Standard Business Hours Coverage', desc: 'Daily monitoring, ticket resolution & scheduled patches during work hours' },
                      { id: 'Proactive Security & Performance Retainer', desc: 'Continuous vulnerability scanning, dependency updates & database tuning' },
                      { id: 'DevOps & Server Uptime Retainer', desc: 'Automated backup verification, CI/CD pipelines & cloud scaling oversight' }
                    ].map(opt => (
                      <div
                        key={opt.id}
                        className={`option-card ${answers.slaTier === opt.id ? 'selected' : ''}`}
                        onClick={() => handleSelectAnswer('slaTier', opt.id)}
                      >
                        <div>
                          <div className="option-card-title">{opt.id}</div>
                          <div className="option-card-desc">{opt.desc}</div>
                        </div>
                        {answers.slaTier === opt.id && <CheckCircle2 size={20} className="option-card-check" aria-hidden="true" />}
                      </div>
                    ))}

                    {renderFreeTextArea('slaTierNote', 'Any specific SLA uptime requirements, compliance needs, or incident history?')}
                  </div>
                )}

                {step === 4 && (
                  <div>
                    <h3 className="modal-question-heading">
                      What monthly maintenance retainer range are you targeting?
                    </h3>
                    <p className="modal-question-subtitle">
                      Enjoy transparent, predictable monthly maintenance without unexpected billing spikes.
                    </p>

                    {[
                      { id: '$2,500 - $5,000 / month', desc: 'Standard system health, routine maintenance & essential bug resolution' },
                      { id: '$5,000 - $10,000 / month', desc: '24/7 monitoring, priority emergency response & dedicated developer hours' },
                      { id: '$10,000+ / month (Enterprise SLA)', desc: 'Dedicated support squad with guaranteed sub-30min critical response' },
                      { id: 'Flexible Hourly Support Bank', desc: 'Pre-purchased block of support hours drawn as needed' }
                    ].map(opt => (
                      <div
                        key={opt.id}
                        className={`option-card ${answers.maintRetainer === opt.id ? 'selected' : ''}`}
                        onClick={() => handleSelectAnswer('maintRetainer', opt.id)}
                      >
                        <div>
                          <div className="option-card-title">{opt.id}</div>
                          <div className="option-card-desc">{opt.desc}</div>
                        </div>
                        {answers.maintRetainer === opt.id && <CheckCircle2 size={20} className="option-card-check" aria-hidden="true" />}
                      </div>
                    ))}

                    {renderFreeTextArea('maintRetainerNote', 'Any budget flexibility or retainer structure preferences?')}
                  </div>
                )}

                {step === 5 && (
                  <div>
                    <h3 className="modal-question-heading">
                      When would you like maintenance coverage to commence?
                    </h3>
                    <p className="modal-question-subtitle">
                      We can handle immediate emergency onboarding or execute smooth knowledge transfer.
                    </p>

                    {[
                      { id: 'Immediate / Urgent (Active Incident)', desc: 'Current system instability or bugs requiring immediate technical resolution' },
                      { id: 'Within 2 Weeks', desc: 'Smooth repository onboarding, credential setup & initial audit' },
                      { id: 'Upcoming Month', desc: 'Transitioning from another provider or establishing a new retainer' }
                    ].map(opt => (
                      <div
                        key={opt.id}
                        className={`option-card ${answers.maintStart === opt.id ? 'selected' : ''}`}
                        onClick={() => handleSelectAnswer('maintStart', opt.id)}
                      >
                        <div>
                          <div className="option-card-title">{opt.id}</div>
                          <div className="option-card-desc">{opt.desc}</div>
                        </div>
                        {answers.maintStart === opt.id && <CheckCircle2 size={20} className="option-card-check" aria-hidden="true" />}
                      </div>
                    ))}

                    {renderFreeTextArea('maintStartNote', 'Tell us any urgent issues or timeline constraints...')}
                  </div>
                )}
              </>
            )}

            {/* ====================================================================
                STEP 6: CONTACT INFORMATION & PROPOSAL DISPATCH
                ==================================================================== */}
            {step === 6 && (
              <form onSubmit={handleSubmit}>
                <h3 className="modal-question-heading">
                  Where should we send your customized {getServiceBadgeName()} proposal?
                </h3>
                <p className="modal-question-subtitle">
                  Enter your details below. Our technical leadership will review your requirements and dispatch a detailed proposal immediately.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label htmlFor="lead-fullName" className="modal-input-label">Full Name *</label>
                    <input
                      id="lead-fullName"
                      type="text"
                      name="fullName"
                      autoComplete="name"
                      placeholder="e.g. Sarah Jenkins"
                      className="form-input"
                      value={contactInfo.fullName}
                      onChange={handleContactChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lead-email" className="modal-input-label">Business Email *</label>
                    <input
                      id="lead-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="e.g. sarah@company.com"
                      className="form-input"
                      value={contactInfo.email}
                      onChange={handleContactChange}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label htmlFor="lead-phone" className="modal-input-label">Phone Number</label>
                    <input
                      id="lead-phone"
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      placeholder="e.g. +1 (614) 555-0192"
                      className="form-input"
                      value={contactInfo.phone}
                      onChange={handleContactChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="lead-company" className="modal-input-label">Company Name</label>
                    <input
                      id="lead-company"
                      type="text"
                      name="company"
                      autoComplete="organization"
                      placeholder="e.g. Enterprise Solutions Corp"
                      className="form-input"
                      value={contactInfo.company}
                      onChange={handleContactChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="lead-notes" className="modal-input-label">Additional Project Details / Requirements (Optional)</label>
                  <textarea
                    id="lead-notes"
                    name="notes"
                    rows="3"
                    placeholder="Provide any additional specifications, links, or specific expectations in your own words..."
                    className="form-input modal-textarea"
                    value={contactInfo.notes}
                    onChange={handleContactChange}
                  />
                </div>

                <div style={{
                  background: 'var(--emerald-50)', border: '1px solid var(--emerald-200)',
                  padding: '12px 16px', borderRadius: '10px',
                  fontSize: '0.86rem', color: 'var(--emerald-900)',
                  display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'
                }}>
                  <ShieldCheck size={18} aria-hidden="true" />
                  <span>Submitting triggers direct notification to our <strong>technical delivery leadership</strong></span>
                </div>
              </form>
            )}

            {/* Navigation Buttons */}
            <div className="modal-nav-row">
              {step > 1 ? (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setStep(prev => prev - 1)}
                >
                  <ChevronLeft size={16} aria-hidden="true" /> Back
                </button>
              ) : <div />}

              {step < totalSteps ? (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleNext}
                >
                  <span>Next Step</span>
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  <span>{loading ? 'Submitting & Dispatching...' : 'Submit Requirements'}</span>
                  <Send size={16} aria-hidden="true" />
                </button>
              )}
            </div>
          </>
        ) : (
          /* SUCCESS STATE */
          <div className="modal-success-box">
            <div className="modal-success-icon-wrap">
              <CheckCircle2 size={40} className="option-card-check" aria-hidden="true" />
            </div>

            <h3 className="modal-success-title">
              Requirements Received!
            </h3>

            <p className="modal-success-desc">
              Thank you <strong>{contactInfo.fullName}</strong>! A confirmation summary has been sent to <strong>{contactInfo.email}</strong>. Your customized {getServiceBadgeName()} requirements have been registered, and our leadership team has been notified.
            </p>

            <div className="modal-receipt-box">
              <div className="modal-receipt-header">
                <span style={{ fontSize: '0.85rem', color: 'var(--lapis-600)', fontWeight: 700, textTransform: 'uppercase' }}>
                  ⚡ Consultation Receipt
                </span>
                <span className="modal-receipt-badge">
                  DELIVERED
                </span>
              </div>
              <div className="modal-receipt-line">
                <strong className="modal-receipt-label">Lead Reference ID:</strong> <span>{successData.leadId}</span>
              </div>
              <div className="modal-receipt-line">
                <strong className="modal-receipt-label">Target Capability:</strong> <span>{getServiceBadgeName()}</span>
              </div>
            </div>

            <button type="button" className="btn-primary" onClick={onClose}>
              Close & Return to Website
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
