import React, { useState, useEffect } from 'react';
import EcoLandscapeScene from './components/EcoLandscapeScene';
import EnergyEcosystemBg from './components/EnergyEcosystemBg';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import ServicesPage from './components/ServicesPage';
import AboutPage from './components/AboutPage';
import NotFoundPage from './components/NotFoundPage';
import QuestionnaireModal from './components/QuestionnaireModal';
import AdminDashboard from './components/AdminDashboard';
import TelemetryTracker from './components/TelemetryTracker';
import EngagementProcess from './components/EngagementProcess';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';
import './App.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'services' | 'about'
  const [activeServiceId, setActiveServiceId] = useState('');
  const [scrollNonce, setScrollNonce] = useState(0);
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const [questionnaireService, setQuestionnaireService] = useState('');
  const [questionnaireMode, setQuestionnaireMode] = useState('questions');
  const [questionnaireNotes, setQuestionnaireNotes] = useState('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [visitorId, setVisitorId] = useState('');
  const [currentSection, setCurrentSection] = useState('hero');

  useEffect(() => {
    // Generate or retrieve persistent visitor session ID
    let vid = localStorage.getItem('mansalvic_visitor_id');
    if (!vid) {
      vid = 'vis_ohio_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('mansalvic_visitor_id', vid);
    }
    setVisitorId(vid);

    const handleRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const pathname = window.location.pathname.toLowerCase();
      const isRootPath = pathname === '/' || pathname === '/index.html' || pathname === '';

      if (hash.includes('admin') || pathname === '/admin') {
        setIsAdminOpen(true);
      } else if (hash.startsWith('#services') || pathname.startsWith('/services')) {
        setCurrentPage('services');
        const svc = hash.replace('#services-', '').replace('#services', '');
        setActiveServiceId(svc);
        setScrollNonce(Date.now());
        if (!svc) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (hash === '#about' || pathname === '/about') {
        setCurrentPage('about');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if ((hash === '#home' || hash === '') && isRootPath) {
        setCurrentPage('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Unrecognized route or hash - render 404
        setCurrentPage('404');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    handleRoute();
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('popstate', handleRoute);

    // Section visibility observer for telemetry reading tracking
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.id) {
          setCurrentSection(entry.target.id);
        }
      });
    }, { threshold: 0.4 });

    sections.forEach(s => observer.observe(s));

    return () => {
      observer.disconnect();
      window.removeEventListener('hashchange', handleRoute);
      window.removeEventListener('popstate', handleRoute);
    };
  }, []);

  const navigateToHome = () => {
    setCurrentPage('home');
    if (window.location.hash) {
      window.history.pushState(null, '', window.location.pathname === '/' ? '/' : '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToServices = (serviceId = '') => {
    setCurrentPage('services');
    setActiveServiceId(serviceId);
    const targetHash = serviceId ? `services-${serviceId}` : 'services';
    if (window.location.hash.toLowerCase() === `#${targetHash.toLowerCase()}`) {
      setScrollNonce(Date.now());
    } else {
      window.location.hash = targetHash;
    }
  };

  const navigateToAbout = () => {
    setCurrentPage('about');
    window.location.hash = 'about';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenQuestionnaire = (serviceId = '', mode = 'questions', initialNotes = '') => {
    const cleanServiceId = typeof serviceId === 'string' ? serviceId : '';
    const cleanMode = typeof mode === 'string' ? mode : 'questions';
    const cleanNotes = typeof initialNotes === 'string' ? initialNotes : '';
    setQuestionnaireService(cleanServiceId);
    setQuestionnaireMode(cleanMode);
    setQuestionnaireNotes(cleanNotes);
    setIsQuestionnaireOpen(true);
  };

  return (
    <div className="app-root">
      
      {/* Full-page Eco Landscape Background Scene */}
      <EcoLandscapeScene mode="light" />

      {/* Background canvas particle ecosystem (layered on top of landscape) */}
      <EnergyEcosystemBg />

      {/* Invisible client telemetry tracker */}
      <TelemetryTracker
        visitorId={visitorId}
        currentSection={
          currentPage === 'services' ? 'services-page' :
          currentPage === 'about' ? 'about-page' : currentSection
        }
      />

      {/* Top Navigation Ribbon with Services Dropdown */}
      <Header 
        onOpenQuestionnaire={handleOpenQuestionnaire}
        onNavigateHome={navigateToHome}
        onNavigateServices={navigateToServices}
        onNavigateAbout={navigateToAbout}
        currentPage={currentPage}
      />

      {/* Main Page View Switcher */}
      {currentPage === 'home' && (
        <main>
          {/* Hero Section */}
          <Hero onOpenQuestionnaire={handleOpenQuestionnaire} />

          {/* Structured 3-Step Engineering Engagement Process (IMP-02) */}
          <EngagementProcess onOpenQuestionnaire={handleOpenQuestionnaire} />

          {/* Organic Leaf Cards Services Overview with Tailored Question Lines */}
          <Services 
            onNavigateToServices={navigateToServices}
            onOpenQuestionnaire={handleOpenQuestionnaire}
          />

          {/* Enterprise B2B Governance & Contract FAQ (IMP-06) */}
          <FAQSection onOpenQuestionnaire={handleOpenQuestionnaire} />
        </main>
      )}

      {currentPage === 'services' && (
        <main>
          {/* Dedicated In-Depth Services Page */}
          <ServicesPage 
            onOpenQuestionnaire={handleOpenQuestionnaire}
            onBackToHome={navigateToHome}
            activeServiceId={activeServiceId}
            scrollNonce={scrollNonce}
          />
        </main>
      )}

      {currentPage === 'about' && (
        <main>
          {/* Dedicated About Us Page */}
          <AboutPage 
            onBackToHome={navigateToHome}
            onOpenQuestionnaire={handleOpenQuestionnaire}
          />
        </main>
      )}

      {currentPage === '404' && (
        <main>
          {/* Dedicated Branded 404 Not Found Page */}
          <NotFoundPage 
            onNavigateHome={navigateToHome}
            onNavigateServices={navigateToServices}
            onOpenQuestionnaire={handleOpenQuestionnaire}
          />
        </main>
      )}

      {/* Footer */}
      <Footer 
        onOpenQuestionnaire={handleOpenQuestionnaire}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onNavigateServices={navigateToServices}
        onNavigateAbout={navigateToAbout}
      />

      {/* Dynamic Multiple Choice Questionnaire Dialogue Box */}
      <QuestionnaireModal
        isOpen={isQuestionnaireOpen}
        onClose={() => setIsQuestionnaireOpen(false)}
        visitorId={visitorId}
        initialService={questionnaireService}
        initialMode={questionnaireMode}
        initialRequirementsNotes={questionnaireNotes}
      />

      {/* Dedicated Passcode-Protected Admin Movement & Telemetry Endpoint Portal */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

    </div>
  );
}
