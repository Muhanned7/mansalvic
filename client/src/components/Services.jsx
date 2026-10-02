import React, { useState } from 'react';
import { ArrowRight, Leaf, Sparkles, ExternalLink, ChevronDown, ChevronUp, ShieldCheck, Check, Video } from 'lucide-react';
import { DuolingoStaffingCharacter, DuolingoDevCharacter, DuolingoMaintenanceCharacter } from './EcoMascots';
import './Services.css';


/* ==========================================================================
   Main Services Component with Extra Long Leaves & Dedicated Question Lines
   ========================================================================== */
export default function Services({ onNavigateToServices, onOpenQuestionnaire }) {
  const [expandedLeafId, setExpandedLeafId] = useState(null);
  const [drawerNotes, setDrawerNotes] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({
    staffing_skill: 'Senior Full-Stack Engineers',
    staffing_model: 'Offshore Staff Augmentation',
    staffing_rate: '$35 - $55 / hour',
    dev_scope: 'Full-Stack SaaS Platform',
    dev_stage: 'Concept & Requirements',
    dev_budget: '$30,000 - $60,000',
    maint_system: 'Production Web & Cloud Platform',
    maint_sla: '24/7/365 Emergency SLA (Sub-Hour)',
    maint_retainer: '$5,000 - $10,000 / month'
  });

  const handleSelectOption = (key, value) => {
    setSelectedOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleToggleLeaf = (leafId) => {
    // Only the clicked leaf expands. Sibling leaves never expand.
    setExpandedLeafId(prev => (prev === leafId ? null : leafId));
  };

  const wideLeaves = [
    {
      id: 'staffing',
      CharacterComp: DuolingoStaffingCharacter,
      mascotName: 'Leo',
      badge: 'Talent Scaling',
      title: 'IT Staff Augmentation & Dedicated Teams',
      displayTitle: (
        <>
          IT Staff Augmentation
          <br />
          & Dedicated Teams
        </>
      ),
      actionLabel: 'Explore Staffing Questions',
      growthBenefit: 'We rapidly expand your technical bandwidth with vetted software talent so your business takes on larger enterprise projects and accelerates product delivery without recruitment bottlenecks.',
      tipClass: 'leaf-tip-left',
      highlightBadge: 'Offshore & US-Aligned Coordination',
      highlightText: 'Offshore and US-aligned time zone coordination with sub-14 day candidate placement.',
      questions: [
        {
          key: 'staffing_skill',
          title: 'Skill Expertise Needed',
          options: [
            'Senior Full-Stack Engineers',
            'Cloud / DevOps & SRE Specialists',
            'Mobile App Engineers (iOS / Android)',
            'QA Automation & Test Engineers'
          ]
        },
        {
          key: 'staffing_model',
          title: 'Engagement & Hiring Model',
          options: [
            'Offshore Staff Augmentation',
            'Contract-to-Hire',
            'Dedicated Engineering Squad',
            'Direct Permanent Hire'
          ]
        },
        {
          key: 'staffing_rate',
          title: 'Target Rate Range',
          options: [
            '$35 - $55 / hour',
            '$55 - $80 / hour',
            '$80 - $110+ / hour',
            'Flexible Retainer'
          ]
        }
      ]
    },
    {
      id: 'development',
      CharacterComp: DuolingoDevCharacter,
      mascotName: 'Alex',
      badge: 'Bespoke Software',
      title: 'Custom Application Development',
      displayTitle: (
        <>
          Custom Application
          <br />
          Development
        </>
      ),
      actionLabel: 'Explore Dev Questions',
      growthBenefit: 'We engineer bespoke, cloud-native digital platforms tailored to your operational workflows, modernizing client experiences and opening high-margin digital revenue channels.',
      tipClass: 'leaf-tip-right',
      highlightBadge: 'Full Agile Delivery & IP Handover',
      highlightText: 'Rapid 2-week sprint releases with 100% intellectual property ownership transferred to your enterprise.',
      questions: [
        {
          key: 'dev_scope',
          title: 'Application Architecture Scope',
          options: [
            'Full-Stack SaaS Platform',
            'Native & Cross-Platform Mobile App',
            'Enterprise Microservices API',
            'Rapid MVP / Prototype'
          ]
        },
        {
          key: 'dev_stage',
          title: 'Current Project Stage',
          options: [
            'Concept & Requirements',
            'Wireframes / UI Mockups Ready',
            'Active Development Acceleration',
            'Legacy Platform Refactoring'
          ]
        },
        {
          key: 'dev_budget',
          title: 'Investment Budget Range',
          options: [
            '$15,000 - $30,000',
            '$30,000 - $60,000',
            '$60,000 - $120,000+',
            'Agile Milestone Retainer'
          ]
        }
      ]
    },
    {
      id: 'maintenance',
      CharacterComp: DuolingoMaintenanceCharacter,
      mascotName: 'Pip',
      badge: 'System Reliability',
      title: '24/7 Application Maintenance & SLAs',
      displayTitle: (
        <>
          24/7 Application
          <br />
          Maintenance & SLAs
        </>
      ),
      actionLabel: 'Explore SLA Questions',
      growthBenefit: 'We safeguard your mission-critical uptime with round-the-clock proactive monitoring and zero-downtime security patching, ensuring your revenue operations run completely uninterrupted.',
      tipClass: 'leaf-tip-left',
      highlightBadge: '99.99% Uptime Guarantee',
      highlightText: 'Sub-hour emergency response SLAs with zero-downtime security updates & 24/7 system monitoring.',
      questions: [
        {
          key: 'maint_system',
          title: 'System Environment',
          options: [
            'Production Web & Cloud Platform',
            'Legacy Enterprise Software',
            'Mobile Application Ecosystem',
            'Multi-Cloud Infrastructure'
          ]
        },
        {
          key: 'maint_sla',
          title: 'Required SLA Coverage Tier',
          options: [
            '24/7/365 Emergency SLA (Sub-Hour)',
            'Standard Business Hours SLA',
            'Proactive Security Retainer',
            'DevOps Uptime Retainer'
          ]
        },
        {
          key: 'maint_retainer',
          title: 'Target Monthly Retainer',
          options: [
            '$2,500 - $5,000 / month',
            '$5,000 - $10,000 / month',
            '$10,000+ / mo (Enterprise)',
            'Flexible Support Bank'
          ]
        }
      ]
    }
  ];

  return (
    <section id="services" className="services-section">
      {/* Header */}
      <div className="services-header">
        <span className="glass-pill services-pill">
          <Leaf size={14} color="var(--emerald-600)" aria-hidden="true" /> Sustainable Business Growth
        </span>
        <h2 className="services-title">
          How Our IT Services Grow Your Business
        </h2>
        <p className="services-subtitle">
          Empowering your enterprise with agile engineering talent, tailor-made software solutions, and round-the-clock platform reliability.
        </p>
      </div>

      {/* Extra Long Leaves Spanning Left-to-Right with Duolingo Characters & Dedicated Question Lines */}
      <div className="leaf-wide-list">
        {wideLeaves.map((leaf) => {
          const CharacterComponent = leaf.CharacterComp;
          const isExpanded = expandedLeafId === leaf.id;

          return (
            <div
              key={leaf.id}
              className={`leaf-card-wide ${leaf.tipClass} ${isExpanded ? 'is-expanded' : ''}`}
              onClick={() => handleToggleLeaf(leaf.id)}
            >
              {/* Primary Leaf Top Row */}
              <div className="leaf-card-main-row">
                {/* Left Group: Animated Duolingo Character, Badge & Title */}
                <div className="leaf-left-group">
                  <div className="leaf-mascot-wrap">
                    <CharacterComponent />
                    <span className="leaf-mascot-nametag">{leaf.mascotName}</span>
                  </div>
                  <div className="leaf-title-group">
                    <span className="leaf-badge-wide">
                      {leaf.badge}
                    </span>
                    <h3 className="leaf-title-wide">
                      {leaf.displayTitle || leaf.title}
                    </h3>
                  </div>
                </div>

                {/* Center Group: 1-2 Liner Business Growth Explanation */}
                <div className="leaf-center-growth">
                  <p className="leaf-growth-text-wide">
                    {leaf.growthBenefit}
                  </p>
                </div>

                {/* Right Group: Dynamic Questionnaire Action & Specs Link */}
                <div className="leaf-action-group" onClick={e => e.stopPropagation()}>
                  <button
                    type="button"
                    className={`leaf-action-btn-wide ${isExpanded ? 'active' : ''}`}
                    onClick={() => handleToggleLeaf(leaf.id)}
                  >
                    <span>{isExpanded ? 'Collapse Questions' : leaf.actionLabel}</span>
                    {isExpanded ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
                  </button>

                  <button
                    type="button"
                    className="leaf-secondary-link"
                    onClick={() => onNavigateToServices(leaf.id)}
                  >
                    <span>View Technical Specs</span>
                    <ExternalLink size={13} aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Expanded Inline Question Line Drawer: Rendered ONLY for the clicked leaf */}
              {isExpanded && (
                <div
                  className="leaf-drawer-container"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="leaf-drawer-header">
                    <div className="leaf-drawer-title-box">
                      <span className="leaf-drawer-pill">
                        <Sparkles size={13} aria-hidden="true" /> Tailored Question Line
                      </span>
                      <h4 className="leaf-drawer-heading">
                        {leaf.title} — Key Parameters & Scope
                      </h4>
                    </div>

                    <div className="leaf-drawer-highlight">
                      <ShieldCheck size={16} color="var(--emerald-600)" aria-hidden="true" />
                      <span>{leaf.highlightText}</span>
                    </div>
                  </div>

                  {/* Question Line Steps */}
                  <div className="leaf-questions-grid">
                    {leaf.questions.map((q) => (
                      <div key={q.key} className="leaf-question-block">
                        <div className="leaf-question-title">{q.title}</div>
                        <div className="leaf-options-flex">
                          {q.options.map((opt) => {
                            const isSelected = selectedOptions[q.key] === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                className={`leaf-option-pill ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleSelectOption(q.key, opt)}
                              >
                                {isSelected && <Check size={14} className="leaf-pill-check" aria-hidden="true" />}
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Custom Requirements Field to unlock Skip to Appointment */}
                  <div className="leaf-drawer-notes-block">
                    <label className="leaf-drawer-notes-label">
                      Have specific requirements? Describe them here to pre-fill your meeting notes (or click Schedule Video Meeting below):
                    </label>
                    <textarea
                      rows="2"
                      placeholder="Describe your requirements, tech stack, team size, or objectives in your own words..."
                      className="leaf-drawer-textarea"
                      value={drawerNotes[leaf.id] || ''}
                      onChange={e => setDrawerNotes(prev => ({ ...prev, [leaf.id]: e.target.value }))}
                    />
                  </div>

                  {/* Action Bar inside Drawer */}
                  <div className="leaf-drawer-footer">
                    <div className="leaf-drawer-footer-note">
                      Calibrate your parameters above, or launch our full tailored consultation dialogue to connect with our technical leadership.
                    </div>
                    <div className="leaf-drawer-btn-group">
                      <button
                        type="button"
                        className="btn-skip-appointment active"
                        onClick={() => {
                          const currentNote = (drawerNotes[leaf.id] || '').trim();
                          if (onOpenQuestionnaire) {
                            onOpenQuestionnaire(leaf.id, 'appointment', currentNote);
                          }
                        }}
                        title="Skip questions and schedule video meeting directly on Google Meet or Zoom"
                      >
                        <Video size={15} aria-hidden="true" />
                        <span>Schedule Video Meeting</span>
                      </button>
                      <button
                        type="button"
                        className="btn-primary leaf-submit-inquiry-btn"
                        onClick={() => onOpenQuestionnaire && onOpenQuestionnaire(leaf.id)}
                      >
                        <span>Launch Full Consultation Dialogue</span>
                        <ArrowRight size={16} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="leaf-collapse-btn"
                        onClick={() => handleToggleLeaf(leaf.id)}
                      >
                        <span>Close Questions</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation Ribbon Callout Banner */}
      <div className="services-banner-wide">
        <div>
          <div className="services-banner-title">
            Looking for comprehensive technical breakdowns & SLA specifications?
          </div>
          <div className="services-banner-desc">
            Explore our dedicated services directory with in-depth delivery methodologies and engagement models.
          </div>
        </div>

        <div>
          <button
            type="button"
            className="btn-primary"
            onClick={() => onNavigateToServices()}
          >
            <span>Explore All Services</span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}

