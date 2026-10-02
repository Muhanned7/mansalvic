import React from 'react';
import { Compass, Users, Rocket, CheckCircle2, ArrowRight, Video, Clock, ShieldCheck, FileCode } from 'lucide-react';
import './EngagementProcess.css';

export default function EngagementProcess({ onOpenQuestionnaire }) {
  const steps = [
    {
      number: '01',
      badge: 'Day 1 • Discovery',
      title: 'Scoping & Architecture Discovery',
      desc: 'Collaborative analysis of your tech stack, system architecture, team velocity goals, and SLA tiers. We map exact technical proficiencies to ensure high-impact candidate delivery.',
      icon: Compass,
      highlights: [
        { label: 'Turnaround', value: 'Within 24 Hours', icon: Clock },
        { label: 'Governance', value: 'Mutual US NDA Executed', icon: ShieldCheck },
        { label: 'Leadership', value: 'Assigned US-Aligned Lead', icon: Users }
      ]
    },
    {
      number: '02',
      badge: 'Days 2–3 • Matching',
      title: 'Precision Vetting & Technical Matching',
      desc: 'We present vetted senior engineers from our pre-screened talent roster (top 3% offshore and nearshore architects). You conduct live technical interviews and code walkthroughs before hiring.',
      icon: Users,
      highlights: [
        { label: 'Speed', value: '48 to 72 Hours', icon: Clock },
        { label: 'Validation', value: 'Live Technical Interviews', icon: FileCode },
        { label: 'Transparency', value: 'Zero Placement Fees', icon: CheckCircle2 }
      ]
    },
    {
      number: '03',
      badge: 'Day 4+ • Deployment',
      title: '2-Week Risk-Free Trial & Sprints',
      desc: 'Engineers integrate into your Git repos, Jira boards, and Slack channels with daily US Eastern/Central overlap. If not 100% satisfied within the first 14 days, you pay nothing or receive an immediate senior replacement.',
      icon: Rocket,
      highlights: [
        { label: 'Guarantee', value: '14-Day Risk-Free Trial', icon: ShieldCheck },
        { label: 'Alignment', value: '4–6h Mandatory US Overlap', icon: Clock },
        { label: 'Ownership', value: '100% Client-Owned IP', icon: CheckCircle2 }
      ]
    }
  ];

  return (
    <section className="engagement-section" id="engagement-process" aria-labelledby="engagement-title">
      {/* Decorative Jali Lattice Texture (DES-001) */}
      <div className="engagement-jali-bg" aria-hidden="true" />

      <div className="engagement-container">
        
        {/* Section Header */}
        <div className="engagement-header">
          <div className="engagement-pill-badge">
            <span className="girih-star-mini" aria-hidden="true">✦</span>
            <span>STRUCTURED ENGINEERING DELIVERY</span>
            <span className="girih-star-mini" aria-hidden="true">✦</span>
          </div>

          <h2 id="engagement-title" className="engagement-title">
            How Engagement Works: From Discovery to Deployment
          </h2>
          <div className="engagement-divider-leaf" aria-hidden="true">
            <div className="divider-line" />
            <div className="divider-star">✦</div>
            <div className="divider-line" />
          </div>
          <p className="engagement-subtitle">
            A transparent, low-friction framework designed for CTOs and engineering directors who need verified technical talent without recruiter delays or trial friction.
          </p>
        </div>

        {/* 3-Step Process Grid */}
        <div className="engagement-grid">
          {steps.map((step, idx) => {
            const IconComponent = step.icon;
            return (
              <div key={step.number} className="engagement-card">
                
                {/* Cusped Arch Top Frame Accent */}
                <div className="engagement-card-arch" aria-hidden="true" />

                <div className="engagement-card-content">
                  {/* Step Ribbon */}
                  <div className="engagement-step-header">
                    <span className="engagement-step-number">{step.number}</span>
                    <span className="engagement-step-badge">{step.badge}</span>
                  </div>

                  {/* Icon Circle */}
                  <div className="engagement-icon-wrapper">
                    <IconComponent size={24} color="var(--emerald-600)" aria-hidden="true" />
                  </div>

                  <h3 className="engagement-card-title">{step.title}</h3>
                  <p className="engagement-card-desc">{step.desc}</p>

                  {/* SLA / Commitment Metric Strip */}
                  <div className="engagement-highlights-list">
                    {step.highlights.map((item, hIdx) => {
                      const ItemIcon = item.icon;
                      return (
                        <div key={hIdx} className="engagement-highlight-item">
                          <ItemIcon size={14} className="highlight-icon" aria-hidden="true" />
                          <span className="highlight-label">{item.label}:</span>
                          <strong className="highlight-value">{item.value}</strong>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Connecting Arrow for Desktop */}
                {idx < steps.length - 1 && (
                  <div className="engagement-step-connector" aria-hidden="true">
                    <ArrowRight size={20} color="var(--gold-500)" aria-hidden="true" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Fast-Track Banner */}
        <div className="engagement-cta-banner">
          <div className="engagement-cta-left">
            <h4 className="engagement-cta-title">Ready to accelerate your engineering roadmap?</h4>
            <p className="engagement-cta-desc">
              Book a 15-minute technical discovery session directly on Google Meet or Zoom. Zero sales pressure—direct architecture review.
            </p>
          </div>
          <div className="engagement-cta-right">
            <button
              type="button"
              className="btn-secondary engagement-btn-secondary"
              onClick={() => onOpenQuestionnaire && onOpenQuestionnaire('staffing')}
            >
              <Users size={15} aria-hidden="true" />
              <span>Request Vetted Profiles</span>
            </button>

            <button
              type="button"
              className="btn-primary engagement-btn-primary"
              onClick={() => onOpenQuestionnaire && onOpenQuestionnaire('', 'appointment')}
            >
              <Video size={15} aria-hidden="true" />
              <span>Schedule Discovery Meeting</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
