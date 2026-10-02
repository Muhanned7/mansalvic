import React, { useEffect } from 'react';
import { ArrowLeft, ArrowRight, MapPin, Building2, Users, Code, Wrench, Leaf, Globe, CheckCircle2, Zap, Video, Calendar } from 'lucide-react';
import './AboutPage.css';

export default function AboutPage({ onBackToHome, onOpenQuestionnaire }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const coreValues = [
    {
      icon: Globe,
      color: 'var(--lapis-600)',
      bgColor: 'var(--lapis-100)',
      title: 'Global Outsourcing Delivery',
      desc: 'We leverage a high-performing international talent network and proven outsourcing model, allowing companies to scale engineering bandwidth rapidly and cost-effectively.'
    },
    {
      icon: Code,
      color: 'var(--emerald-600)',
      bgColor: 'var(--jade-100)',
      title: 'Full-Lifecycle Engineering',
      desc: 'Every application we build is engineered with modern, maintainable code architectures, rapid sprint cadence, and seamless integration into your business workflows.'
    },
    {
      icon: Wrench,
      color: 'var(--sandstone-500)',
      bgColor: 'var(--sandstone-100)',
      title: '24/7 Global System Reliability',
      desc: 'Our round-the-clock maintenance squads monitor system uptime, deploy continuous security updates, and handle technical support across global time zones.'
    }
  ];

  return (
    <div className="about-page-container">
      {/* Navigation Breadcrumb / Back Button */}
      <div>
        <button
          type="button"
          className="breadcrumb-btn"
          onClick={onBackToHome}
        >
          <ArrowLeft size={16} aria-hidden="true" /> Back to Homepage
        </button>
      </div>

      {/* Page Header */}
      <div className="about-page-header">
        <span className="glass-pill">
          <Building2 size={14} color="var(--emerald-600)" aria-hidden="true" /> Corporate Overview
        </span>
        <h1 className="about-page-title">
          About Mansalvic Consulting LLC
        </h1>
        <p className="about-page-subtitle">
          Engineering sustainable digital velocity and empowering enterprise technology roadmaps through high-impact global outsourcing and IT consulting.
        </p>

        {/* Girih Star Divider (DES-001) */}
        <div className="girih-divider" aria-hidden="true">
          <span className="girih-divider-line" />
          <svg viewBox="0 0 24 24" className="girih-divider-star" fill="currentColor" aria-hidden="true">
            <polygon points="12,1 15,8 23,12 15,16 12,23 9,16 1,12 9,8" />
          </svg>
          <span className="girih-divider-line" />
        </div>
      </div>

      {/* Central Corporate Statement Box (Requested Description) */}
      <div className="about-statement-card">
        <div className="about-statement-badge">
          <Leaf size={14} color="var(--emerald-600)" aria-hidden="true" /> Executive Mission
        </div>
        <p className="about-statement-text">
          Mansalvic Consulting LLC delivers high-impact IT talent acquisition, end-to-end custom application development, and continuous 24/7 application maintenance. Headquartered in Columbus, Ohio, US, we power North American and global enterprise technology initiatives.
        </p>
      </div>

      {/* 3 Core Values / Pillars */}
      <div className="about-grid">
        {coreValues.map((val, idx) => {
          const IconC = val.icon;
          return (
            <div key={idx} className="about-card">
              <div>
                <div
                  className="about-card-icon-box"
                  style={{ background: val.bgColor, border: `1.5px solid ${val.color}` }}
                >
                  <IconC size={26} color={val.color} aria-hidden="true" />
                </div>
                <h3 className="about-card-title">
                  {val.title}
                </h3>
                <p className="about-card-desc">
                  {val.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Global Delivery & Outsourcing Spotlight */}
      <div className="about-hq-banner">
        <div>
          <span className="glass-pill" style={{ marginBottom: '14px' }}>
            <Globe size={14} color="var(--lapis-600)" aria-hidden="true" /> Global Delivery Model
          </span>
          <h2 className="about-hq-title">
            Global Outsourcing • Columbus, Ohio Headquarters
          </h2>
          <p className="about-hq-text">
            Mansalvic Consulting LLC combines Columbus, Ohio-based strategic engagement with an agile global delivery network. By deploying vetted international engineering squads, we empower enterprises to accelerate software delivery, unlock round-the-clock development cycles, and maximize engineering efficiency.
          </p>
          <ul className="about-hq-list">
            <li className="about-hq-item">
              <Globe size={18} color="var(--emerald-600)" aria-hidden="true" /> Agile Global Delivery Model & Outsourced Tech Squads
            </li>
            <li className="about-hq-item">
              <Zap size={18} color="var(--emerald-600)" aria-hidden="true" /> 24/7 Continuous Development Across Global Time Zones
            </li>
            <li className="about-hq-item">
              <CheckCircle2 size={18} color="var(--emerald-600)" aria-hidden="true" /> High-Velocity Engineering Scaling Without Local Hiring Delays
            </li>
          </ul>
        </div>

        <div>
          <div className="glass-panel" style={{ padding: '28px 20px', background: 'var(--marble-50)', border: '1px solid var(--border-card)', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--emerald-900)', marginBottom: '12px' }}>
              Sustainable IT Philosophy
            </h3>
            <p style={{ fontSize: '0.94rem', color: 'var(--ink-700)', lineHeight: 1.7, marginBottom: '20px' }}>
              We design software architectures and cloud computing topologies inspired by renewable energy ecosystems: lean, efficient, zero-waste compute footprints that reduce operating costs while scaling indefinitely.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', whiteSpace: 'normal', textAlign: 'center' }}
                onClick={() => onOpenQuestionnaire && onOpenQuestionnaire('general')}
              >
                <span>Request Enterprise Deck & Consultation</span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', background: 'var(--jade-100)', borderColor: 'var(--jade-300)', color: 'var(--emerald-900)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '8px', whiteSpace: 'normal', textAlign: 'center' }}
                onClick={() => onOpenQuestionnaire && onOpenQuestionnaire('general', 'appointment')}
                title="Skip questions and schedule directly on Google Meet or Zoom"
              >
                <Video size={16} color="var(--emerald-600)" aria-hidden="true" />
                <span>Schedule Video Meeting (Skip Questions)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Consultation Banner */}
      <div className="about-cta-banner">
        <div className="about-cta-content">
          <span className="about-cta-tag">
            Partner With Us
          </span>
          <h2 className="about-cta-heading">
            Let’s Accelerate Your Technology Roadmap
          </h2>
          <p className="about-cta-desc">
            Connect directly with our leadership and technical architects on Google Meet or Zoom to discuss your staffing needs, software builds, or 24/7 SLA maintenance agreements.
          </p>
        </div>

        <div className="about-cta-actions" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            className="btn-primary about-cta-btn"
            onClick={() => onOpenQuestionnaire && onOpenQuestionnaire('')}
          >
            <span>Start Consultation Dialogue</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="btn-secondary about-cta-skip-btn"
            style={{
              background: 'var(--jade-100)',
              borderColor: 'var(--emerald-600)',
              color: 'var(--emerald-900)',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 22px',
              borderRadius: '10px',
              whiteSpace: 'normal',
              maxWidth: '100%',
              textAlign: 'center'
            }}
            onClick={() => onOpenQuestionnaire && onOpenQuestionnaire('', 'appointment')}
            title="Skip questions and go straight to Google Meet / Zoom meeting booking"
          >
            <Video size={18} color="var(--emerald-600)" aria-hidden="true" />
            <span>Schedule Video Meeting (Skip Questions)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
