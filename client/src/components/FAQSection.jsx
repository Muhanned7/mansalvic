import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Shield, FileText, Clock, Code, DollarSign, Video, ArrowRight } from 'lucide-react';
import './FAQSection.css';

export default function FAQSection({ onOpenQuestionnaire }) {
  const [openIndex, setOpenIndex] = useState(0); // First item open by default

  const faqs = [
    {
      q: 'Who owns the intellectual property (IP) and source code created?',
      a: 'You own 100% of all intellectual property, source code, repositories, infrastructure credentials, and documentation from day one. All work product is created under a standard US Master Services Agreement (MSA) with an explicit work-for-hire assignment clause governed by Ohio, US law.',
      category: 'Legal & IP',
      icon: Shield
    },
    {
      q: 'How do time zones and communications work with offshore engineers?',
      a: 'All Mansalvic offshore and nearshore talent are strictly US-aligned, guaranteeing a mandatory 4 to 6-hour daily overlap with US Eastern (EST/EDT) and Central (CST/CDT) working hours. Engineers participate in your daily standups, integrate into your Slack or Teams workspaces, and follow your Git branching workflows.',
      category: 'Operations',
      icon: Clock
    },
    {
      q: 'What is your 2-week risk-free trial guarantee?',
      a: 'We offer a 14-day risk-free evaluation period for all dedicated technical augmentations. If an engineer is not the right technical or cultural fit within the first two weeks, you owe nothing for their billed hours, or we provide an immediate senior replacement at zero transition cost.',
      category: 'Staffing',
      icon: HelpCircle
    },
    {
      q: 'Do we sign a Non-Disclosure Agreement (NDA) before sharing requirements?',
      a: 'Yes, absolutely. Before reviewing proprietary codebase architectures, database schemas, or interview candidate CVs, we execute a mutual Non-Disclosure Agreement (NDA) governed under Ohio, US jurisdiction to guarantee complete confidentiality of your trade secrets.',
      category: 'Security',
      icon: FileText
    },
    {
      q: 'What are your enterprise SLA tiers and production response times?',
      a: 'We provide guaranteed SLAs across three tiers: Silver (8x5 support, 99.9% uptime, 4-hour critical response), Gold (24x7 support, 99.98% uptime, 1-hour critical response), and Platinum Enterprise (24x7x365 support, 99.99% uptime, 15-minute emergency response with dedicated Site Reliability Engineers).',
      category: 'SLAs',
      icon: Code
    },
    {
      q: 'How quickly can we interview and onboard technical talent?',
      a: 'Individual senior engineers and architects can be reviewed, interviewed, and onboarded within 48 to 72 hours. Dedicated multi-disciplinary engineering squads (e.g., Tech Lead + Full-stack + DevOps + QA) typically deploy into active sprints within 5 to 7 business days.',
      category: 'Hiring Speed',
      icon: Clock
    },
    {
      q: 'How does billing work, and are there long-term lock-in contracts?',
      a: 'We provide transparent, predictable bi-weekly or monthly invoicing based on pre-agreed hourly rates with zero hidden recruiter fees, benefits overhead, or placement surcharges. Contracts can be scaled up or down flexibly with a standard 2-week notice period.',
      category: 'Pricing',
      icon: DollarSign
    }
  ];

  const toggleAccordion = (index) => {
    setOpenIndex(prev => prev === index ? -1 : index);
  };

  return (
    <section className="faq-section" id="faq" aria-labelledby="faq-title">
      <div className="faq-jali-bg" aria-hidden="true" />

      <div className="faq-container">
        
        {/* Section Header */}
        <div className="faq-header">
          <div className="faq-pill-badge">
            <span className="girih-star-mini" aria-hidden="true">✦</span>
            <span>TRANSPARENCY & GOVERNANCE</span>
            <span className="girih-star-mini" aria-hidden="true">✦</span>
          </div>

          <h2 id="faq-title" className="faq-title">
            Frequently Asked Questions
          </h2>
          <div className="faq-divider-leaf" aria-hidden="true">
            <div className="divider-line" />
            <div className="divider-star">✦</div>
            <div className="divider-line" />
          </div>
          <p className="faq-subtitle">
            Direct answers on intellectual property, US timezone alignment, trial guarantees, and enterprise SLA contracts.
          </p>
        </div>

        {/* Accordion List */}
        <div className="faq-accordion-list" role="region" aria-label="Frequently Asked Questions Accordion">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const CategoryIcon = faq.icon;
            const contentId = `faq-answer-${idx}`;
            const headerId = `faq-header-${idx}`;

            return (
              <div 
                key={idx} 
                className={`faq-item ${isOpen ? 'open' : ''}`}
              >
                <button
                  type="button"
                  id={headerId}
                  className="faq-question-btn"
                  onClick={() => toggleAccordion(idx)}
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                >
                  <div className="faq-question-left">
                    <span className="faq-category-badge">
                      <CategoryIcon size={12} aria-hidden="true" />
                      <span>{faq.category}</span>
                    </span>
                    <span className="faq-question-text">{faq.q}</span>
                  </div>

                  <div className="faq-chevron-wrapper" aria-hidden="true">
                    <ChevronDown size={18} className={`faq-chevron ${isOpen ? 'rotate' : ''}`} aria-hidden="true" />
                  </div>
                </button>

                <div 
                  id={contentId}
                  role="region"
                  aria-labelledby={headerId}
                  className={`faq-answer-collapse ${isOpen ? 'expanded' : ''}`}
                >
                  <div className="faq-answer-inner">
                    <p className="faq-answer-text">{faq.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Support Callout */}
        <div className="faq-footer-callout">
          <p className="faq-callout-text">
            Have a custom contractual requirement or specific architectural question?
          </p>
          <div className="faq-callout-actions">
            <button
              type="button"
              className="btn-secondary faq-btn-secondary"
              onClick={() => onOpenQuestionnaire && onOpenQuestionnaire('')}
            >
              <span>Ask in Consultation</span>
              <ArrowRight size={14} aria-hidden="true" />
            </button>

            <button
              type="button"
              className="btn-primary faq-btn-primary"
              onClick={() => onOpenQuestionnaire && onOpenQuestionnaire('', 'appointment')}
            >
              <Video size={14} aria-hidden="true" />
              <span>Schedule Technical Discovery</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
