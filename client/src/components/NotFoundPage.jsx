import React from 'react';
import { Home, Compass, ArrowRight, AlertTriangle, Users, Code, Wrench, Leaf } from 'lucide-react';
import './NotFoundPage.css';

export default function NotFoundPage({ onNavigateHome, onNavigateServices, onOpenQuestionnaire }) {
  const quickLinks = [
    {
      id: 'staffing',
      title: 'IT Staff Augmentation',
      desc: 'Offshore technical engineering squads & tech leads',
      icon: Users,
      color: '#059669'
    },
    {
      id: 'development',
      title: 'Custom App Development',
      desc: 'Resilient cloud, web, and enterprise platforms',
      icon: Code,
      color: '#0284c7'
    },
    {
      id: 'maintenance',
      title: '24/7 SLA Maintenance',
      desc: 'Security patches, code health & round-the-clock monitoring',
      icon: Wrench,
      color: '#d97706'
    },
    {
      id: 'cloud',
      title: 'Cloud Infrastructure',
      desc: 'DevOps automation, Docker, AWS & compute scaling',
      icon: Leaf,
      color: '#7c3aed'
    }
  ];

  return (
    <div className="not-found-container">
      {/* Background radial glow */}
      <div className="not-found-glow" aria-hidden="true" />

      <div className="not-found-card">
        {/* Badge */}
        <div className="not-found-badge">
          <AlertTriangle size={14} />
          <span>Error 404 • Destination Unresolved</span>
        </div>

        {/* Big Code */}
        <div className="not-found-code">404</div>

        {/* Title & Description */}
        <h1 className="not-found-title">Pathway Not Found</h1>
        <p className="not-found-desc">
          The requested URL does not match any active routing pathways within our enterprise directory.
          It may have been moved, renamed, or is currently undergoing scheduled deployment.
        </p>

        {/* Primary Action Buttons */}
        <div className="not-found-actions">
          <button
            type="button"
            className="btn-primary not-found-btn-primary"
            onClick={onNavigateHome}
          >
            <Home size={16} />
            <span>Return to Homepage</span>
          </button>

          <button
            type="button"
            className="btn-secondary not-found-btn-secondary"
            onClick={() => onNavigateServices && onNavigateServices('')}
          >
            <Compass size={16} />
            <span>Browse Services</span>
          </button>

          <button
            type="button"
            className="btn-secondary not-found-btn-consult"
            onClick={() => onOpenQuestionnaire && onOpenQuestionnaire('')}
          >
            <span>Start Consultation</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Directory Assistance Section */}
        <div className="not-found-directory">
          <div className="not-found-directory-title">
            Explore Core Engineering Services
          </div>
          <div className="not-found-grid">
            {quickLinks.map(link => {
              const IconC = link.icon;
              return (
                <div
                  key={link.id}
                  className="not-found-grid-item"
                  onClick={() => onNavigateServices && onNavigateServices(link.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter') onNavigateServices && onNavigateServices(link.id);
                  }}
                >
                  <div className="not-found-item-header">
                    <div className="not-found-icon-wrap" style={{ background: `${link.color}15`, color: link.color }}>
                      <IconC size={18} />
                    </div>
                    <span className="not-found-item-name">{link.title}</span>
                  </div>
                  <div className="not-found-item-desc">{link.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Support Info */}
        <div className="not-found-footer">
          Mansalvic Consulting LLC • Ohio, US • Direct Assistance: <a href="mailto:hello@mansalvic.com">hello@mansalvic.com</a>
        </div>
      </div>
    </div>
  );
}
