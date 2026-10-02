import React from 'react';
import { Zap, MapPin, Mail, ShieldCheck, Leaf, Lock, Globe, Video } from 'lucide-react';
import './Footer.css';

export default function Footer({ onOpenQuestionnaire, onOpenAdmin, onNavigateServices, onNavigateAbout }) {
  return (
    <footer className="footer-section">
      {/* Decorative Jali Lattice Band & Gold Rule (DES-001) */}
      <div className="footer-gold-rule" aria-hidden="true" />
      <div className="footer-jali-band" aria-hidden="true" />

      <div className="footer-container">
        <div className="footer-grid">
          {/* Col 1 */}
          <div>
            <div className="footer-brand">
              <div className="footer-logo-icon">
                <img src="/mansalvic-mark.png" alt="Mansalvic Logo Mark" className="footer-logo-img" aria-hidden="true" />
              </div>
              <span className="footer-brand-title">
                MANSALVIC <span className="footer-brand-accent">CONSULTING LLC</span>
              </span>
            </div>

            <p className="footer-brand-desc">
              Mansalvic Consulting LLC is an IT consulting firm delivering enterprise IT staff augmentation, custom application development, and continuous 24/7 application maintenance within an eco-sustainable digital ecosystem.
            </p>

            <div className="footer-location">
              <MapPin size={16} aria-hidden="true" /> Headquartered in Columbus, Ohio, US
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="footer-col-title">
              IT Capabilities
            </h4>
            <ul className="footer-nav-list">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateServices && onNavigateServices('staffing')}
                  className="footer-link-btn"
                >
                  IT Staff Augmentation
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateServices && onNavigateServices('development')}
                  className="footer-link-btn"
                >
                  Custom Application Development
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateServices && onNavigateServices('maintenance')}
                  className="footer-link-btn"
                >
                  Application Maintenance & SLAs
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateServices && onNavigateServices('cloud')}
                  className="footer-link-btn"
                >
                  Cloud Infrastructure & Modernization
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="footer-col-title">
              Client Onboarding
            </h4>
            <p className="footer-cta-text">
              Ready to discuss your IT project or staffing needs? Launch our consultation questionnaire or schedule a video meeting directly on Google Meet / Zoom.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                className="btn-primary footer-cta-btn"
                onClick={() => onOpenQuestionnaire && onOpenQuestionnaire('')}
              >
                Start Consultation
              </button>
              <button
                type="button"
                className="btn-secondary footer-cta-btn"
                style={{
                  background: 'var(--jade-100)',
                  borderColor: 'var(--emerald-600)',
                  color: 'var(--emerald-800)',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
                onClick={() => onOpenQuestionnaire && onOpenQuestionnaire('', 'appointment')}
                title="Skip questions and schedule a video meeting directly on Google Meet or Zoom"
              >
                <Video size={15} color="var(--emerald-600)" aria-hidden="true" />
                <span>Schedule Video Meeting</span>
              </button>
            </div>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="footer-col-title">
              Global Operations
            </h4>
            <div className="footer-compliance-list">
              <div>
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateAbout) onNavigateAbout();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="footer-link-btn"
                  style={{ fontWeight: 700, color: 'var(--gold-400)', marginBottom: '8px' }}
                >
                  About Mansalvic Consulting LLC →
                </button>
              </div>
              <div className="footer-compliance-item">
                <Mail size={14} color="var(--gold-500)" aria-hidden="true" /> hello@mansalvic.com
              </div>
              <div className="footer-compliance-item">
                <Globe size={14} color="var(--jade-300)" aria-hidden="true" /> Global Delivery & Outsourcing Network
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & discrete admin link */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} Mansalvic Consulting LLC. All Rights Reserved. Columbus, Ohio, US.
          </div>
          <div className="footer-bottom-actions">
            <span className="footer-initiative">
              <Leaf size={14} aria-hidden="true" /> Sustainable Infrastructure Initiative
            </span>
            <span>•</span>
            <button 
              type="button"
              onClick={onOpenAdmin}
              className="footer-admin-btn"
              title="Dedicated Admin Endpoint Access"
            >
              <Lock size={12} aria-hidden="true" /> Admin Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
