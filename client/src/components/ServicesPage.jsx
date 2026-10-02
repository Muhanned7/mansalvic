import React, { useEffect } from 'react';
import { Users, Code, Wrench, Leaf, ArrowRight, CheckCircle2, ShieldCheck, Zap, ArrowLeft, Video, Calendar, Clock, Star } from 'lucide-react';
import './ServicesPage.css';

export default function ServicesPage({ onOpenQuestionnaire, onBackToHome, activeServiceId, scrollNonce }) {
  useEffect(() => {
    if (activeServiceId) {
      const cleanId = activeServiceId.replace('services-', '');
      const scrollToTarget = () => {
        const el = document.getElementById(`services-${cleanId}`) || document.getElementById(cleanId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };

      // Double requestAnimationFrame ensures complete mount, style recalculation, and layout reflow
      const rAF1 = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToTarget();
        });
      });

      // Single settling check to handle mobile drawer exit transition
      const timer = setTimeout(scrollToTarget, 150);

      return () => {
        cancelAnimationFrame(rAF1);
        clearTimeout(timer);
      };
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeServiceId, scrollNonce]);

  const detailedServices = [
    {
      id: 'staffing',
      icon: Users,
      color: 'var(--emerald-600)',
      bgColor: 'var(--jade-100)',
      title: 'IT Staff Augmentation & Dedicated Teams',
      badge: 'Talent Acquisition',
      summary: 'Rapidly scale your technical capabilities with top 3% pre-vetted software engineers, architects, and technical project leaders matched precisely to your stack and company culture.',
      overview: 'Whether you require short-term specialized reinforcements or long-term dedicated software engineering squads, Mansalvic Consulting provides flexible talent augmentation solutions that integrate seamlessly into your existing agile workflows.',
      capabilities: [
        'Senior Full-Stack & Mobile Engineers (React, Node, Python, Java, .NET, Swift, Kotlin)',
        'DevOps, SRE & Cloud Infrastructure Specialists (AWS, Azure, GCP, Kubernetes, Terraform)',
        'QA Automation & Manual Testing Engineers (Selenium, Cypress, Playwright, CI/CD pipelines)',
        'Technical Product Managers, Scrum Masters & Solution Architects',
        'Direct Hire, Contract, and Flexible Contract-to-Hire Engagement Models',
        'Rigorous technical vetting, coding assessments, and cultural alignment interviews'
      ],
      deliverables: [
        'Time-to-hire reduced to under 14 days',
        'Offshore and US-aligned time zone coordination',
        'Zero onboarding friction with pre-configured development environments'
      ]
    },
    {
      id: 'development',
      icon: Code,
      color: 'var(--emerald-900)',
      bgColor: 'rgba(11, 61, 46, 0.08)',
      title: 'Custom Application Development',
      badge: 'Full-Lifecycle Engineering',
      summary: 'Architecting modern, resilient web, enterprise, and mobile platforms engineered from scratch to deliver measurable commercial value and long-term scalability.',
      overview: 'From initial requirements discovery and UI/UX design to robust cloud-native architecture and production deployment, our teams deliver tailor-made software solutions across any technology stack.',
      capabilities: [
        'Full-Lifecycle Web Applications & SaaS Platforms with modern, responsive UI/UX',
        'Native & Cross-Platform Mobile Applications (iOS, Android, React Native, Flutter)',
        'High-Throughput RESTful & GraphQL Microservices Architecture',
        'Enterprise Database Architecture & Optimization (PostgreSQL, MongoDB, Redis, SQL Server)',
        'Secure Payment Gateways, CRM/ERP Integrations & Third-Party API Orchestration',
        'Comprehensive Code Reviews, Automated Test Coverage & Strict Cyber Security Compliance'
      ],
      deliverables: [
        'Agile 2-week sprint releases with interactive progress demos',
        '100% Intellectual Property and complete source code repository handover',
        'Modular, microservices-ready architectures built for high concurrency'
      ]
    },
    {
      id: 'maintenance',
      icon: Wrench,
      color: 'var(--sandstone-500)',
      bgColor: 'var(--sandstone-100)',
      title: '24/7 Application Maintenance & SLAs',
      badge: 'System Reliability',
      summary: 'Round-the-clock proactive monitoring, automated security patch management, performance optimization, and guaranteed sub-hour SLA response times.',
      overview: 'Prevent downtime before it impacts revenue. Our dedicated maintenance engineers monitor health vitals, address regression bugs, and deploy automated continuous updates with zero client disruption.',
      capabilities: [
        '24/7/365 Real-Time Infrastructure & Application Health Monitoring',
        'Guaranteed Emergency Incident Response SLAs (Sub-Hour Escalation Protocols)',
        'Continuous Operating System & Dependency Security Patching & Vulnerability Scans',
        'Cloud Database Health Checks, Index Optimization, & Automated Backups',
        'Legacy Codebase Modernization, Deprecation Mitigation & Refactoring',
        'Multi-Tier Helpdesk Support (L1 triage, L2 technical investigation, L3 core engineering)'
      ],
      deliverables: [
        '99.98% System Uptime SLA Commitment',
        'Monthly Transparent Incident & Health Audit Reports',
        'Dedicated Escalation Hotline & Real-Time Status Dashboard Access'
      ]
    },
    {
      id: 'cloud',
      icon: Leaf,
      color: 'var(--lapis-600)',
      bgColor: 'var(--lapis-100)',
      title: 'Cloud Infrastructure & Modernization',
      badge: 'Cloud Optimization',
      summary: 'Sustainable, cost-efficient cloud architecture engineered on AWS, Azure, and Google Cloud with optimized resource utilization.',
      overview: 'Mansalvic Consulting helps enterprises transition from bloated legacy servers to streamlined, energy-efficient microservices architectures that reduce operating expenses by up to 40%.',
      capabilities: [
        'Cloud Migration, Serverless Engineering & Containerization (Docker, Kubernetes)',
        'Infrastructure-as-Code (Terraform, CloudFormation, Ansible)',
        'Automated CI/CD Deployment Pipelines (GitHub Actions, GitLab CI, Jenkins)',
        'FinOps Compute Optimization & Right-Sizing Workloads',
        'Multi-Region Redundancy & Automated Disaster Recovery (RTO < 15 min, RPO < 5 min)',
        'Strict Regulatory Compliance Auditing (SOC2, HIPAA, PCI-DSS)'
      ],
      deliverables: [
        'Up to 40% reduction in monthly cloud infrastructure compute spend',
        'Zero-downtime rolling deployments',
        'Comprehensive infrastructure observability and distributed tracing'
      ]
    }
  ];

  return (
    <div className="services-page-container">
      {/* Back Button */}
      <div style={{ marginBottom: '24px' }}>
        <button
          type="button"
          className="breadcrumb-btn"
          onClick={onBackToHome}
        >
          <ArrowLeft size={16} aria-hidden="true" /> Back to Homepage
        </button>
      </div>

      {/* Page Header */}
      <div className="services-page-header">
        <span className="glass-pill">
          <Zap size={14} color="var(--emerald-600)" aria-hidden="true" /> Service Directory & Capabilities
        </span>
        <h1 className="services-page-title">
          Comprehensive Technology Services & IT Staffing Solutions
        </h1>
        <p className="services-page-subtitle">
          Mansalvic Consulting LLC provides end-to-end technical execution across staffing, bespoke software engineering, and continuous 24/7 application maintenance to empower enterprise scalability.
        </p>

        {/* Girih Star Divider */}
        <div className="girih-divider" aria-hidden="true">
          <span className="girih-divider-line" />
          <svg viewBox="0 0 24 24" className="girih-divider-star" fill="currentColor" aria-hidden="true">
            <polygon points="12,1 15,8 23,12 15,16 12,23 9,16 1,12 9,8" />
          </svg>
          <span className="girih-divider-line" />
        </div>
      </div>

      {/* Detailed Services Breakdown */}
      <div className="services-list">
        {detailedServices.map((svc) => {
          const IconComp = svc.icon;
          return (
            <div
              id={`services-${svc.id}`}
              key={svc.id}
              className="glass-panel service-detail-card"
            >
              {/* Alias Anchor for #${svc.id} */}
              <span id={svc.id} className="service-anchor-span" />

              <div className="service-card-top">
                <div className="service-card-brand-group">
                  <div
                    className="service-card-icon-box"
                    style={{ background: svc.bgColor, border: `1.5px solid ${svc.color}` }}
                  >
                    <IconComp size={28} color={svc.color} aria-hidden="true" />
                  </div>
                  <div>
                    <span className="service-badge-text" style={{ color: svc.color }}>
                      {svc.badge}
                    </span>
                    <h2 className="service-card-heading">
                      {svc.title}
                    </h2>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => onOpenQuestionnaire && onOpenQuestionnaire(svc.id)}
                  >
                    <span>Request Proposal</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{
                      background: 'var(--jade-100)',
                      borderColor: 'var(--emerald-600)',
                      color: 'var(--emerald-800)',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onClick={() => onOpenQuestionnaire && onOpenQuestionnaire(svc.id, 'appointment')}
                    title="Skip questions and schedule a video meeting directly on Google Meet or Zoom"
                  >
                    <Video size={15} color="var(--emerald-600)" aria-hidden="true" />
                    <span>Schedule Meeting</span>
                  </button>
                </div>
              </div>

              <p className="service-summary-text">
                {svc.summary}
              </p>
              <p className="service-overview-text">
                {svc.overview}
              </p>

              {/* Core Capabilities Breakdown */}
              <div className="capabilities-box">
                <h3 className="capabilities-title">
                  What We Deliver & Specialize In
                </h3>
                <div className="capabilities-grid">
                  {svc.capabilities.map((item, i) => (
                    <div key={i} className="capability-item">
                      <CheckCircle2 size={18} color={svc.color} className="capability-icon" aria-hidden="true" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Commercial Value & Key Highlights */}
              <div className="deliverables-row">
                <span className="deliverables-label">
                  Key Engagement Highlights:
                </span>
                {svc.deliverables.map((del, dIdx) => (
                  <span key={dIdx} className="deliverable-pill">
                    <ShieldCheck size={14} color="var(--emerald-600)" aria-hidden="true" /> {del}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Enterprise SLA Tiers Section (QA-015 Spec Alignment) */}
      <div className="services-sla-section">
        <div className="services-sla-header">
          <span className="glass-pill">
            <ShieldCheck size={14} color="var(--emerald-600)" aria-hidden="true" /> Service Level Agreements
          </span>
          <h2 className="services-sla-heading">
            Enterprise Support & SLA Tiers
          </h2>
          <p className="services-sla-subtitle">
            Guaranteed response times, dedicated engineering escalation paths, and system uptime commitments tailored to your operational criticality.
          </p>
        </div>

        <div className="services-sla-grid">
          {/* Silver Tier */}
          <div className="glass-panel sla-tier-card">
            <div className="sla-tier-badge">Silver Tier</div>
            <h3 className="sla-tier-title">Standard 8x5 Business Support</h3>
            <div className="sla-tier-uptime">99.9% Uptime Commitment</div>
            <p className="sla-tier-desc">Ideal for non-critical internal tools, staging environments, and standard operational applications.</p>
            <ul className="sla-tier-features">
              <li><Clock size={14} className="sla-feature-icon" aria-hidden="true" /> <strong>Critical Incidents:</strong> &lt; 4-hour response</li>
              <li><Clock size={14} className="sla-feature-icon" aria-hidden="true" /> <strong>High Severity:</strong> &lt; 8-hour response</li>
              <li><CheckCircle2 size={14} className="sla-feature-icon" aria-hidden="true" /> <strong>Coverage:</strong> Mon–Fri, 9:00 AM – 5:00 PM ET</li>
              <li><CheckCircle2 size={14} className="sla-feature-icon" aria-hidden="true" /> Ticketing portal & business email triage</li>
              <li><CheckCircle2 size={14} className="sla-feature-icon" aria-hidden="true" /> Monthly vulnerability scans & patch updates</li>
            </ul>
          </div>

          {/* Gold Tier (Featured) */}
          <div className="glass-panel sla-tier-card sla-tier-featured">
            <div className="sla-tier-badge-featured">
              <Star size={13} aria-hidden="true" /> Most Popular · Gold Tier
            </div>
            <h3 className="sla-tier-title">Proactive 24x7 Production Coverage</h3>
            <div className="sla-tier-uptime">99.98% Uptime Commitment</div>
            <p className="sla-tier-desc">Engineered for client-facing SaaS, e-commerce, and high-concurrency production platforms.</p>
            <ul className="sla-tier-features">
              <li><Clock size={14} className="sla-feature-icon" aria-hidden="true" /> <strong>Critical Incidents:</strong> &lt; 1-hour response</li>
              <li><Clock size={14} className="sla-feature-icon" aria-hidden="true" /> <strong>High Severity:</strong> &lt; 2-hour response</li>
              <li><CheckCircle2 size={14} className="sla-feature-icon" aria-hidden="true" /> <strong>Coverage:</strong> 24/7/365 continuous monitoring</li>
              <li><CheckCircle2 size={14} className="sla-feature-icon" aria-hidden="true" /> Dedicated Slack / Microsoft Teams bridge</li>
              <li><CheckCircle2 size={14} className="sla-feature-icon" aria-hidden="true" /> Bi-weekly sprint deployments & architecture reviews</li>
            </ul>
          </div>

          {/* Platinum Tier */}
          <div className="glass-panel sla-tier-card">
            <div className="sla-tier-badge">Platinum Tier</div>
            <h3 className="sla-tier-title">Mission-Critical Enterprise</h3>
            <div className="sla-tier-uptime">99.99% Uptime Commitment</div>
            <p className="sla-tier-desc">Designed for enterprise financial systems, healthcare platforms, and global mission-critical workloads.</p>
            <ul className="sla-tier-features">
              <li><Clock size={14} className="sla-feature-icon" aria-hidden="true" /> <strong>Critical Incidents:</strong> &lt; 15-minute response</li>
              <li><Clock size={14} className="sla-feature-icon" aria-hidden="true" /> <strong>High Severity:</strong> &lt; 30-minute response</li>
              <li><CheckCircle2 size={14} className="sla-feature-icon" aria-hidden="true" /> <strong>Coverage:</strong> 24/7/365 dedicated on-call squad</li>
              <li><CheckCircle2 size={14} className="sla-feature-icon" aria-hidden="true" /> Designated Named Principal Solution Architect</li>
              <li><CheckCircle2 size={14} className="sla-feature-icon" aria-hidden="true" /> Zero-downtime blue/green deployment pipelines</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Consultation Banner */}
      <div className="services-cta-banner">
        <div className="services-cta-content">
          <span className="services-cta-tag">
            Tailored Engagement
          </span>
          <h2 className="services-cta-heading">
            Ready to Build, Scale, or Maintain Your Software?
          </h2>
          <p className="services-cta-desc">
            Tell us about your technical timeline and project parameters. We will evaluate your scope and dispatch an executive consultation proposal immediately.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            className="btn-primary services-cta-btn"
            onClick={() => onOpenQuestionnaire && onOpenQuestionnaire('')}
          >
            <span>Launch Consultation Dialogue</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="btn-secondary services-cta-skip-btn"
            style={{
              background: 'var(--jade-100)',
              borderColor: 'var(--emerald-600)',
              color: 'var(--emerald-800)',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 22px',
              borderRadius: '10px'
            }}
            onClick={() => onOpenQuestionnaire && onOpenQuestionnaire('', 'appointment')}
            title="Skip questions and schedule a video meeting directly on Google Meet or Zoom"
          >
            <Video size={18} color="var(--emerald-600)" aria-hidden="true" />
            <span>Schedule Video Meeting (Skip Questions)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
