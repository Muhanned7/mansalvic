import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Zap, ChevronDown, Users, Code, Wrench, Leaf, Video, Menu, X } from 'lucide-react';
import './Header.css';

export default function Header({ onOpenQuestionnaire, onNavigateHome, onNavigateServices, onNavigateAbout, currentPage }) {
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsServicesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Track scroll for jali texture and shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Escape key closes mobile drawer (QA-023)
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  const serviceOptions = [
    {
      id: 'staffing',
      title: 'IT Staff Augmentation & Teams',
      desc: 'On-demand senior engineers, architects & technical leads',
      icon: Users,
      color: 'var(--emerald-600)',
      bgColor: 'rgba(31, 122, 85, 0.12)'
    },
    {
      id: 'development',
      title: 'Custom Application Development',
      desc: 'Bespoke web, mobile & resilient cloud software platforms',
      icon: Code,
      color: 'var(--emerald-900)',
      bgColor: 'rgba(11, 61, 46, 0.1)'
    },
    {
      id: 'maintenance',
      title: 'Application Maintenance & 24/7 SLAs',
      desc: 'Round-the-clock monitoring, security patching & code health',
      icon: Wrench,
      color: 'var(--sandstone-500)',
      bgColor: 'rgba(181, 101, 58, 0.12)'
    },
    {
      id: 'cloud',
      title: 'Cloud Infrastructure & Modernization',
      desc: 'Microservices, CI/CD automation & compute optimization',
      icon: Leaf,
      color: 'var(--lapis-600)',
      bgColor: 'rgba(30, 90, 138, 0.12)'
    }
  ];

  const handleServiceSelect = (serviceId) => {
    setIsServicesDropdownOpen(false);
    setIsMobileMenuOpen(false);
    document.body.style.overflow = '';
    onNavigateServices(serviceId);
  };

  return (
    <header className={`header-container ${isScrolled ? 'header-scrolled' : ''}`}>
      {/* Decorative Jali Lattice Pattern on Scroll (DES-001) */}
      <div className="header-jali-pattern" aria-hidden="true" />

      {/* Main Navigation Ribbon */}
      <div className="header-ribbon">
        {/* Mobile Hamburger Button (QA-004) */}
        <button
          type="button"
          className="header-mobile-toggle"
          onClick={() => setIsMobileMenuOpen(prev => !prev)}
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>

        {/* Brand Logo */}
        <a
          href="#home"
          className="header-brand"
          onClick={(e) => {
            e.preventDefault();
            onNavigateHome();
            setIsMobileMenuOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          aria-label="Mansalvic Consulting Homepage"
        >
          <div className="header-logo-icon">
            <img src="/mansalvic-mark.png" alt="Mansalvic Logo Mark" className="header-logo-img" aria-hidden="true" />
          </div>
          <div>
            <div className="header-brand-title">
              MANSALVIC <span className="header-brand-accent brand-desktop-suffix">CONSULTING LLC</span>
            </div>
            <div className="header-brand-subtitle">
              IT Consulting & Executive Staffing
            </div>
          </div>
        </a>

        {/* Top Desktop Ribbon Navigation Items (QA-018: accessible anchors) */}
        <nav className="header-nav" aria-label="Main Navigation">
          {/* Home Link */}
          <a
            href="#home"
            className={`header-nav-btn ${currentPage === 'home' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigateHome();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Home
          </a>

          {/* Services with Dropdown Menu */}
          <div ref={dropdownRef} className="dropdown-wrapper">
            <button
              type="button"
              className={`header-nav-dropdown-trigger ${(currentPage === 'services' || isServicesDropdownOpen) ? 'active' : ''}`}
              onClick={() => setIsServicesDropdownOpen(prev => !prev)}
              aria-expanded={isServicesDropdownOpen}
              aria-haspopup="true"
            >
              <span>Services</span>
              <ChevronDown
                size={16}
                className={`dropdown-chevron ${isServicesDropdownOpen ? 'open' : ''}`}
                aria-hidden="true"
              />
            </button>

            {/* Dropdown Menu */}
            {isServicesDropdownOpen && (
              <div className="dropdown-menu" role="menu" aria-label="Services Submenu">
                <div className="dropdown-header">
                  Core Service Offerings
                </div>

                {serviceOptions.map((opt) => {
                  const IconC = opt.icon;
                  return (
                    <a
                      key={opt.id}
                      href={`#services-${opt.id}`}
                      role="menuitem"
                      className="dropdown-item"
                      onClick={(e) => {
                        e.preventDefault();
                        handleServiceSelect(opt.id);
                      }}
                    >
                      <div
                        className="dropdown-item-icon"
                        style={{ background: opt.bgColor }}
                      >
                        <IconC size={18} color={opt.color} aria-hidden="true" />
                      </div>
                      <div>
                        <div className="dropdown-item-title">
                          {opt.title}
                        </div>
                        <div className="dropdown-item-desc">
                          {opt.desc}
                        </div>
                      </div>
                    </a>
                  );
                })}

                {/* View All Services Footer in Dropdown */}
                <a
                  href="#services"
                  role="menuitem"
                  className="dropdown-footer"
                  onClick={(e) => {
                    e.preventDefault();
                    handleServiceSelect('');
                  }}
                >
                  <span>View All Services Directory</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </a>
              </div>
            )}
          </div>

          {/* About Us Link (QA-018) */}
          <a
            href="#about"
            className={`header-nav-btn ${currentPage === 'about' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigateAbout();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            About Us
          </a>
        </nav>

        {/* Actions for Desktop (QA-029, TC-NAV-01, TC-NAV-02, QA-002) */}
        <div className="header-actions">
          <button
            type="button"
            className="btn-primary header-btn-consult"
            onClick={() => onOpenQuestionnaire && onOpenQuestionnaire('')}
            title="Start Technical Consultation Dialogue"
          >
            <span>Start Consultation</span>
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </div>

        {/* Compact Mobile Consultation CTA */}
        <button
          type="button"
          className="header-mobile-cta"
          onClick={() => onOpenQuestionnaire && onOpenQuestionnaire('')}
          title="Start Consultation"
        >
          <span>Consult</span>
          <ArrowRight size={12} aria-hidden="true" />
        </button>
      </div>

      {/* Thin Gold Indo-Islamic Accent Rule (DES-001) */}
      <div className="header-gold-rule" aria-hidden="true" />

      {/* Mobile Slide-Out Drawer Navigation (QA-004) */}
      {isMobileMenuOpen && (
        <div
          className="mobile-drawer-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="mobile-drawer-content"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
          >
            <div className="mobile-drawer-header">
              <div className="header-brand-title">
                MANSALVIC <span className="header-brand-accent">CONSULTING</span>
              </div>
              <button
                type="button"
                className="mobile-drawer-close"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close navigation"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <nav className="mobile-drawer-nav">
              <a
                href="#home"
                className={`mobile-nav-link ${currentPage === 'home' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateHome();
                  setIsMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Home
              </a>

              <div className="mobile-nav-section-title">Services</div>
              {serviceOptions.map((opt) => (
                <a
                  key={opt.id}
                  href={`#services-${opt.id}`}
                  className="mobile-nav-sublink"
                  onClick={(e) => {
                    e.preventDefault();
                    handleServiceSelect(opt.id);
                  }}
                >
                  <opt.icon size={16} color="var(--emerald-600)" aria-hidden="true" />
                  <span>{opt.title}</span>
                </a>
              ))}
              <a
                href="#services"
                className="mobile-nav-sublink mobile-nav-all"
                onClick={(e) => {
                  e.preventDefault();
                  handleServiceSelect('');
                }}
              >
                <span>View All Services Directory</span>
                <ArrowRight size={14} aria-hidden="true" />
              </a>

              <a
                href="#about"
                className={`mobile-nav-link ${currentPage === 'about' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateAbout();
                  setIsMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                About Us
              </a>
            </nav>

            <div className="mobile-drawer-actions">
              <button
                type="button"
                className="btn-primary mobile-drawer-btn"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenQuestionnaire && onOpenQuestionnaire('');
                }}
              >
                <span>Start Consultation Dialogue</span>
                <ArrowRight size={15} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
