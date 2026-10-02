import React from 'react';
import { ArrowRight, Users, Leaf, Cpu, Globe, Video, Sparkles } from 'lucide-react';
import './Hero.css';

export default function Hero({ onOpenQuestionnaire }) {
  return (
    <section id="hero" className="hero-section">
      <div className="hero-arch-wrapper">
        <div className="hero-jali-backdrop" aria-hidden="true" />
        
        <div className="hero-content">
          <div className="hero-arch-badge">
            <Sparkles size={14} className="hero-arch-star" aria-hidden="true" />
            <span>Sustainable IT & Executive Engineering</span>
            <Sparkles size={14} className="hero-arch-star" aria-hidden="true" />
          </div>

          <h1 className="hero-heading">
            Accelerating Enterprise Growth — IT Staffing & Custom Software Engineered for Sustainable Velocity
          </h1>

          <p className="hero-description">
            Mansalvic Consulting LLC orchestrates top-tier engineering talent, bespoke cloud platforms, and 24/7 mission-critical maintenance within a clean energy digital ecosystem.
          </p>

          {/* Action Buttons */}
          <div className="hero-actions">
            <button
              type="button"
              className="btn-primary hero-btn-primary"
              onClick={() => onOpenQuestionnaire && onOpenQuestionnaire('')}
            >
              <span>Start Interactive Assessment</span>
              <ArrowRight size={18} aria-hidden="true" />
            </button>
            
            <button
              type="button"
              className="btn-secondary hero-btn-meeting"
              onClick={() => onOpenQuestionnaire && onOpenQuestionnaire('', 'appointment')}
              title="Skip questions and schedule a video meeting directly on Google Meet or Zoom"
            >
              <Video size={17} color="var(--emerald-600)" aria-hidden="true" />
              <span>Schedule Video Meeting</span>
            </button>

            <a href="#services" className="btn-secondary hero-btn-secondary">
              <span>Explore IT Services</span>
              <ArrowRight size={17} aria-hidden="true" />
            </a>
          </div>

          {/* Girih 8-Point Star Section Divider (DES-001) */}
          <div className="girih-divider" aria-hidden="true">
            <span className="girih-divider-line" />
            <svg viewBox="0 0 24 24" className="girih-divider-star" fill="currentColor" aria-hidden="true">
              <polygon points="12,1 15,8 23,12 15,16 12,23 9,16 1,12 9,8" />
            </svg>
            <span className="girih-divider-line" />
          </div>
        </div>
      </div>

      {/* Feature Metrics Showcase (Cards styled with Indo-Islamic & Sustainable cues) */}
      <div className="hero-metrics-grid">
        <div className="glass-panel metric-card">
          <div className="metric-card-arch" aria-hidden="true" />
          <div className="metric-card-header">
            <Users size={28} color="var(--emerald-600)" aria-hidden="true" />
            <span className="metric-card-label" style={{ color: 'var(--emerald-600)' }}>IT STAFFING NETWORK</span>
          </div>
          <div className="metric-card-value">500+</div>
          <div className="metric-card-desc">
            Vetted Full-Stack & DevOps engineers ready for immediate placement.
          </div>
        </div>

        <div className="glass-panel metric-card">
          <div className="metric-card-arch" aria-hidden="true" />
          <div className="metric-card-header">
            <Cpu size={28} color="var(--sandstone-500)" aria-hidden="true" />
            <span className="metric-card-label" style={{ color: 'var(--sandstone-500)' }}>APP MAINTENANCE</span>
          </div>
          <div className="metric-card-value">99.98%</div>
          <div className="metric-card-desc">
            SLA Uptime commitment with zero-downtime deployment pipelines.
          </div>
        </div>

        <div className="glass-panel metric-card">
          <div className="metric-card-arch" aria-hidden="true" />
          <div className="metric-card-header">
            <Leaf size={28} color="var(--emerald-600)" aria-hidden="true" />
            <span className="metric-card-label" style={{ color: 'var(--emerald-600)' }}>CLOUD OPTIMIZATION</span>
          </div>
          <div className="metric-card-value">40%</div>
          <div className="metric-card-desc">
            Average compute and resource optimization achieved across client workloads.
          </div>
        </div>

        <div className="glass-panel metric-card">
          <div className="metric-card-arch" aria-hidden="true" />
          <div className="metric-card-header">
            <Globe size={28} color="var(--lapis-600)" aria-hidden="true" />
            <span className="metric-card-label" style={{ color: 'var(--lapis-600)' }}>GLOBAL DELIVERY</span>
          </div>
          <div className="metric-card-value">Worldwide</div>
          <div className="metric-card-desc">
            High-impact global team and specialized outsourcing engineering squads.
          </div>
        </div>
      </div>
    </section>
  );
}
