import React, { useEffect, useRef } from 'react';

export default function TelemetryTracker({ visitorId, currentSection, onNewInteraction }) {
  const lastHighlightText = useRef('');
  const hasSentEntrance = useRef(false);

  useEffect(() => {
    if (!visitorId) return;

    // 0. Immediate Visitor Entrance Event
    if (!hasSentEntrance.current) {
      hasSentEntrance.current = true;
      sendTelemetry('VISITOR_ENTER', {
        landingPage: window.location.pathname + window.location.search + window.location.hash,
        referrer: document.referrer || 'Direct / Bookmark',
        currentSection: currentSection || 'hero'
      });
    }

    // 1. Global Click Listener
    const handleClick = (e) => {
      const target = e.target;
      const payload = {
        x: e.clientX,
        y: e.clientY,
        pageX: e.pageX,
        pageY: e.pageY,
        targetTag: target.tagName,
        targetText: (target.innerText || target.alt || target.title || '').substring(0, 100)
      };

      sendTelemetry('CLICK', payload);
      if (onNewInteraction) onNewInteraction({ type: 'CLICK', ...payload });
    };

    // 2. Text Highlight Selection Listener
    const handleMouseUp = () => {
      setTimeout(() => {
        const selection = window.getSelection();
        const selectedText = selection ? selection.toString().trim() : '';

        if (selectedText.length > 3 && selectedText !== lastHighlightText.current) {
          lastHighlightText.current = selectedText;

          const payload = {
            text: selectedText,
            section: currentSection || 'general'
          };

          sendTelemetry('TEXT_HIGHLIGHT', payload);
          if (onNewInteraction) onNewInteraction({ type: 'TEXT_HIGHLIGHT', ...payload });
        }
      }, 200);
    };

    // 3. Heartbeat & Active Section Ping
    const heartbeatInterval = setInterval(() => {
      sendTelemetry('HEARTBEAT', { currentSection: currentSection || 'hero' });
    }, 10000);

    window.addEventListener('click', handleClick);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('mouseup', handleMouseUp);
      clearInterval(heartbeatInterval);
    };
  }, [visitorId, currentSection]);

  const sendTelemetry = (type, payload) => {
    try {
      fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId,
          type,
          payload,
          meta: {
            userAgent: navigator.userAgent,
            screen: `${window.innerWidth}x${window.innerHeight}`,
            location: 'Columbus, OH, US'
          }
        })
      }).catch(err => console.debug('Telemetry error:', err));
    } catch (e) {
      // Ignore background telemetry errors
    }
  };

  return null; // Invisible component
}
