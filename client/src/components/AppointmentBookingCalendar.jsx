import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles, 
  Send, 
  ShieldCheck, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  FileText,
  Video,
  Download,
  ExternalLink
} from 'lucide-react';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db, COLLECTIONS } from '../firebase';
import './AppointmentBookingCalendar.css';

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
];

export default function AppointmentBookingCalendar({
  serviceType = 'general',
  initialNotes = '',
  onBack,
  onClose,
  visitorId
}) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [meetingPlatform, setMeetingPlatform] = useState('Google Meet'); // 'Google Meet' | 'Zoom'
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [customNotes, setCustomNotes] = useState(initialNotes || '');

  const [contactInfo, setContactInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: ''
  });

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Keep customNotes in sync with initialNotes when opened
  useEffect(() => {
    setCustomNotes(initialNotes || '');
  }, [initialNotes]);

  // Auto-select first available weekday
  useEffect(() => {
    let d = new Date();
    // If today is weekend or after 5pm EST, advance to next weekday
    if (d.getDay() === 0) d.setDate(d.getDate() + 1); // Sunday -> Monday
    else if (d.getDay() === 6) d.setDate(d.getDate() + 2); // Saturday -> Monday

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const defaultDateStr = `${year}-${month}-${day}`;
    setSelectedDate(defaultDateStr);
  }, []);

  // Fetch booked slots from Firebase Firestore whenever selectedDate changes
  useEffect(() => {
    if (!selectedDate) return;

    const fetchBookedSlots = async () => {
      setLoadingSlots(true);
      try {
        const q = query(
          collection(db, COLLECTIONS.APPOINTMENTS),
          where('appointmentDate', '==', selectedDate)
        );
        const querySnapshot = await getDocs(q);
        const booked = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.appointmentTime) booked.push(data.appointmentTime);
        });
        setBookedSlots(booked);
      } catch (err) {
        console.warn('Could not query existing appointments (Firestore may be initializing):', err);
        setBookedSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchBookedSlots();
    setSelectedTime(''); // Reset time selection on date change
  }, [selectedDate]);

  // Calendar generation helpers
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    const prev = new Date(year, month - 1, 1);
    if (prev >= new Date(today.getFullYear(), today.getMonth(), 1)) {
      setViewDate(prev);
    }
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const formatDateStr = (d, m, y) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Check if date is available (Mon-Fri, today or future)
  const isDateAvailable = (dateObj) => {
    const dayOfWeek = dateObj.getDay();
    // Monday (1) to Friday (5)
    if (dayOfWeek === 0 || dayOfWeek === 6) return false;

    // Check if past
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return dateObj >= todayMidnight;
  };

  const handleDateClick = (dayNum) => {
    const clickedDate = new Date(year, month, dayNum);
    if (!isDateAvailable(clickedDate)) return;
    const dateStr = formatDateStr(dayNum, month, year);
    setSelectedDate(dateStr);
    setErrorMsg('');
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!selectedDate) {
      setErrorMsg('Please select an available date on the calendar.');
      return;
    }
    if (!selectedTime) {
      setErrorMsg('Please select an available appointment time slot.');
      return;
    }
    if (!contactInfo.fullName || !contactInfo.email) {
      setErrorMsg('Please enter your full name and business email address.');
      return;
    }

    setErrorMsg('');
    setLoadingSubmit(true);

    try {
      const friendlyRef = 'MSV-2026-' + Math.random().toString(36).substring(2, 6).toUpperCase();

      // 1. Save to appointments collection
      const appointmentRef = await addDoc(collection(db, COLLECTIONS.APPOINTMENTS), {
        referenceCode: friendlyRef,
        serviceType: serviceType || 'general',
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        meetingPlatform,
        timeZone: 'ET',
        clientName: contactInfo.fullName,
        clientEmail: contactInfo.email,
        clientPhone: contactInfo.phone || '',
        company: contactInfo.company || '',
        customNotes: customNotes || '',
        visitorId: visitorId || 'anonymous',
        status: 'confirmed',
        createdAt: serverTimestamp(),
        source: 'skip_to_appointment'
      });

      // 2. Also register lead in 'leads' collection
      await addDoc(collection(db, COLLECTIONS.LEADS), {
        referenceCode: friendlyRef,
        serviceType: serviceType || 'general',
        leadType: 'fast_track_appointment',
        appointmentId: appointmentRef.id,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        meetingPlatform,
        contactInfo: {
          ...contactInfo,
          notes: customNotes
        },
        visitorId: visitorId || 'anonymous',
        createdAt: serverTimestamp(),
        source: 'calendar_booking'
      });

      // 3. Mirror into Backend Database (PostgreSQL + MongoDB + Analytics)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            answers: {
              appointmentDate: selectedDate,
              appointmentTime: selectedTime,
              meetingPlatform,
              timeZone: 'ET',
              appointmentDetails: `Video Consultation on ${selectedDate} at ${selectedTime} ET via ${meetingPlatform === 'meet' ? 'Google Meet' : 'Zoom'}`
            },
            contactInfo: {
              ...contactInfo,
              notes: customNotes ? `[Video Meeting: ${selectedDate} ${selectedTime} ET (${meetingPlatform === 'meet' ? 'Google Meet' : 'Zoom'})] ${customNotes}` : `[Video Meeting: ${selectedDate} ${selectedTime} ET (${meetingPlatform === 'meet' ? 'Google Meet' : 'Zoom'})]`
            },
            visitorId: visitorId || 'anonymous',
            serviceType: serviceType || 'general',
            referenceCode: friendlyRef,
            source: 'calendar_booking'
          })
        });
        clearTimeout(timeoutId);
      } catch (apiErr) {
        console.warn('Backend API booking mirror notice:', apiErr);
      }

      setLoadingSubmit(false);
      setSuccessData({
        appointmentId: appointmentRef.id,
        referenceCode: friendlyRef,
        date: selectedDate,
        time: selectedTime,
        meetingPlatform
      });
    } catch (err) {
      setLoadingSubmit(false);
      console.error('Error saving appointment:', err);
      setErrorMsg('Unable to save appointment to Firebase: ' + (err.message || 'Please check connection.'));
    }
  };

  const getServiceLabel = () => {
    switch (serviceType) {
      case 'staffing': return 'IT Staff Augmentation & Dedicated Teams';
      case 'development': return 'Custom Application Development';
      case 'maintenance': return '24/7 Application Maintenance & SLAs';
      case 'cloud': return 'Cloud Infrastructure & Modernization';
      default: return 'Mansalvic Technical Consultation';
    }
  };

  const getUtcDateForNewYork = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return new Date();
    const [year, month, day] = dateStr.split('-').map(Number);
    const [tStr, meridiem] = timeStr.split(' ');
    let [hours, minutes] = tStr.split(':').map(Number);
    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    let utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
    for (let i = 0; i < 3; i++) {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        hour12: false
      }).formatToParts(utcDate);
      const p = {};
      parts.forEach(x => { p[x.type] = parseInt(x.value, 10); });
      if (p.hour === 24) p.hour = 0;
      const nyUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
      const targetUtc = Date.UTC(year, month - 1, day, hours, minutes, 0);
      const diff = targetUtc - nyUtc;
      if (diff === 0) break;
      utcDate = new Date(utcDate.getTime() + diff);
    }
    return utcDate;
  };

  const getVisitorLocalTime = (timeStr, dateStr = selectedDate) => {
    if (!timeStr) return '';
    try {
      const dStr = dateStr || new Date().toISOString().slice(0, 10);
      const guessUtc = getUtcDateForNewYork(dStr, timeStr);

      const localTimeStr = guessUtc.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      const nyTimeStr = guessUtc.toLocaleTimeString([], { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' });

      if (localTimeStr === nyTimeStr) return '';
      return `${localTimeStr} your time`;
    } catch {
      return '';
    }
  };

  const generateIcsFile = () => {
    if (!successData) return;
    const { date, time, referenceCode, meetingPlatform } = successData;
    const serviceLabel = getServiceLabel();
    const platformName = meetingPlatform === 'meet' || meetingPlatform === 'Google Meet' ? 'Google Meet' : 'Zoom Video';

    // Parse date & time into dynamic UTC for America/New_York (EDT/EST) per IMP-04
    const startUtcDate = getUtcDateForNewYork(date, time);
    const endUtcDate = new Date(startUtcDate.getTime() + 30 * 60 * 1000); // 30 min consultation per BR-02

    const formatIcsDate = (d) => {
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const startUtc = formatIcsDate(startUtcDate);
    const endUtc = formatIcsDate(endUtcDate);
    const nowUtc = formatIcsDate(new Date());

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Mansalvic Consulting LLC//Engineering Consultation//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:MSV-${referenceCode}@mansalvic.com`,
      `DTSTAMP:${nowUtc}`,
      `DTSTART:${startUtc}`,
      `DTEND:${endUtc}`,
      `SUMMARY:Mansalvic Technical Consultation - ${serviceLabel}`,
      `DESCRIPTION:Video Consultation with Mansalvic Consulting LLC via ${platformName}.\\nReference ID: ${referenceCode}\\nClient: ${contactInfo.fullName} (${contactInfo.email})\\nOrganizer: hello@mansalvic.com\\nColumbus, Ohio, US.`,
      `LOCATION:${platformName}`,
      'ORGANIZER;CN="Mansalvic Consulting LLC":mailto:hello@mansalvic.com',
      `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN="${contactInfo.fullName}":mailto:${contactInfo.email}`,
      'STATUS:CONFIRMED',
      'CLASS:PUBLIC',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `mansalvic-consultation-${referenceCode}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getGoogleCalendarUrl = () => {
    if (!successData) return '#';
    const { date, time, referenceCode, meetingPlatform } = successData;
    const serviceLabel = getServiceLabel();
    const platformName = meetingPlatform === 'meet' || meetingPlatform === 'Google Meet' ? 'Google Meet' : 'Zoom Video';

    // Parse date & time into dynamic UTC for America/New_York (EDT/EST) per IMP-04
    const startUtcDate = getUtcDateForNewYork(date, time);
    const endUtcDate = new Date(startUtcDate.getTime() + 30 * 60 * 1000); // 30 min consultation per BR-02
    const formatIcs = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const title = encodeURIComponent(`Mansalvic Technical Consultation - ${serviceLabel}`);
    const details = encodeURIComponent(`Video Consultation with Mansalvic Consulting LLC via ${platformName}.\nReference ID: ${referenceCode}\nOrganizer: hello@mansalvic.com`);
    const location = encodeURIComponent(platformName);
    const dates = `${formatIcs(startUtcDate)}/${formatIcs(endUtcDate)}`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  };

  // If successfully booked
  if (successData) {
    return (
      <div className="booking-success-wrap">
        <div className="booking-success-icon">
          <CheckCircle2 size={38} color="var(--emerald-600)" aria-hidden="true" />
        </div>

        <h3 className="booking-success-title">
          Video Meeting Confirmed!
        </h3>

        <p className="booking-success-subtitle">
          Thank you <strong>{contactInfo.fullName}</strong>. A confirmation email and calendar invitation have been sent to <strong>{contactInfo.email}</strong>. Your technical video meeting has been scheduled via <strong>{successData.meetingPlatform}</strong> directly with our leadership team.
        </p>

        <div className="booking-ticket arch-frame">
          <div className="booking-ticket-header">
            <span>⚡ Mansalvic Executive Confirmation</span>
            <span className="booking-ticket-tag">CONFIRMED</span>
          </div>
          <div className="booking-ticket-row">
            <span className="booking-ticket-label">Reference ID:</span>
            <span className="booking-ticket-value">{successData.referenceCode}</span>
          </div>
          <div className="booking-ticket-row">
            <span className="booking-ticket-label">Meeting Format:</span>
            <span className="booking-ticket-value" style={{ color: 'var(--emerald-600)', fontWeight: 700 }}>
              {successData.meetingPlatform} (Video Meeting)
            </span>
          </div>
          <div className="booking-ticket-row">
            <span className="booking-ticket-label">Focus Area:</span>
            <span className="booking-ticket-value">{getServiceLabel()}</span>
          </div>
          <div className="booking-ticket-row">
            <span className="booking-ticket-label">Confirmed Date:</span>
            <span className="booking-ticket-value" style={{ color: 'var(--emerald-900)', fontWeight: 700 }}>{successData.date}</span>
          </div>
          <div className="booking-ticket-row">
            <span className="booking-ticket-label">Time (ET):</span>
            <span className="booking-ticket-value" style={{ color: 'var(--emerald-600)', fontWeight: 700 }}>
              {successData.time} ET {getVisitorLocalTime(successData.time, successData.date) ? `(${getVisitorLocalTime(successData.time, successData.date)})` : ''}
            </span>
          </div>
          <div className="booking-ticket-row">
            <span className="booking-ticket-label">Meeting Link Delivery:</span>
            <span className="booking-ticket-value">{contactInfo.email}</span>
          </div>
        </div>

        {/* Calendar Integration Options (IMP-04) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '440px', margin: '0 auto 20px auto' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={generateIcsFile}
            style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: '0.88rem' }}
          >
            <Download size={15} color="var(--emerald-600)" aria-hidden="true" />
            <span>Download .ICS Calendar Invite</span>
          </button>

          <a
            href={getGoogleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: '0.88rem', textDecoration: 'none' }}
          >
            <ExternalLink size={15} color="var(--emerald-600)" aria-hidden="true" />
            <span>Add to Google Calendar</span>
          </a>
        </div>

        <button type="button" className="btn-primary" onClick={onClose} style={{ margin: '0 auto', minWidth: '220px', justifyContent: 'center' }}>
          <span>Done & Return to Site</span>
        </button>
      </div>
    );
  }

  // Render Day Cells
  const dayCells = [];
  // Empty padding cells before 1st of month
  for (let i = 0; i < firstDayIndex; i++) {
    dayCells.push(<div key={`empty-${i}`} className="calendar-day-cell empty" />);
  }

  // Month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = formatDateStr(d, month, year);
    const available = isDateAvailable(dateObj);
    const selected = selectedDate === dateStr;

    let cellClass = 'calendar-day-cell';
    if (!available) cellClass += ' disabled';
    else cellClass += ' available';
    if (selected) cellClass += ' selected';

    dayCells.push(
      <button
        key={`day-${d}`}
        type="button"
        disabled={!available}
        className={cellClass}
        onClick={() => handleDateClick(d)}
        title={available ? 'Available business day' : 'Unavailable (Weekend or Past)'}
      >
        <span>{d}</span>
        {selected && (
          <span className="calendar-girih-dot" aria-hidden="true">✦</span>
        )}
      </button>
    );
  }

  return (
    <div className="appointment-booking-wrap">
      {/* Header Badge & Title */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
          <div className="appointment-header-badge">
            <Video size={13} aria-hidden="true" /> Video Meeting Scheduling
          </div>
          <div className="appointment-service-chip" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--jade-100)',
            color: 'var(--emerald-900)',
            border: '1px solid var(--emerald-600)',
            padding: '3px 10px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: 700
          }}>
            <span>Booking for: <strong>{getServiceLabel()}</strong></span>
          </div>
        </div>
        <h3 className="appointment-title">
          Schedule Your Technical Video Meeting
        </h3>
        <p className="appointment-subtitle">
          Select an available date (marked in green) and choose an open 30-minute time slot between 9:00 AM – 5:00 PM ET. Meetings are hosted on <strong>Google Meet</strong> or <strong>Zoom</strong>.
        </p>
      </div>

      {/* Custom Requirements Notes Review */}
      {customNotes && (
        <div className="appointment-notes-preview">
          <div className="appointment-notes-title">
            <FileText size={14} aria-hidden="true" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
            Your Written Project Requirements:
          </div>
          <div className="appointment-notes-content">
            {customNotes}
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="modal-error-banner">
          {errorMsg}
        </div>
      )}

      {/* Calendar & Time Slots Grid */}
      <div className="appointment-picker-grid">
        {/* Left: Interactive Month Calendar */}
        <div className="calendar-card">
          <div className="calendar-month-bar">
            <div className="calendar-month-heading">
              {monthNames[month]} {year}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className="calendar-nav-btn"
                onClick={handlePrevMonth}
                aria-label="Previous Month"
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="calendar-nav-btn"
                onClick={handleNextMonth}
                aria-label="Next Month"
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="calendar-weekdays-grid">
            <div className="calendar-weekday-col">Sun</div>
            <div className="calendar-weekday-col">Mon</div>
            <div className="calendar-weekday-col">Tue</div>
            <div className="calendar-weekday-col">Wed</div>
            <div className="calendar-weekday-col">Thu</div>
            <div className="calendar-weekday-col">Fri</div>
            <div className="calendar-weekday-col">Sat</div>
          </div>

          {/* Day Grid */}
          <div className="calendar-days-grid">
            {dayCells}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '14px', fontSize: '0.78rem', color: 'var(--ink-500)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--emerald-600)' }} />
              Available Business Day
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--slate-border)' }} />
              Weekend / Closed
            </span>
          </div>
        </div>

        {/* Right: Available Time Slots */}
        <div className="time-slots-card">
          <div className="time-slots-heading">
            <Clock size={16} aria-hidden="true" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', color: 'var(--emerald-600)' }} />
            Available Times
          </div>
          <div className="time-slots-tz-note">
            {selectedDate ? `Showing slots for ${selectedDate} (9:00 AM – 5:00 PM ET)` : 'Select a green date on the calendar'}
          </div>

          {loadingSlots ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--ink-500)', fontSize: '0.88rem' }}>
              Checking real-time calendar availability...
            </div>
          ) : (
            <div className="time-slots-list">
              {TIME_SLOTS.map((time) => {
                const isBooked = bookedSlots.includes(time);
                const isSelected = selectedTime === time;

                return (
                  <button
                    key={time}
                    type="button"
                    disabled={isBooked}
                    className={`time-slot-btn ${isSelected ? 'selected' : ''} ${isBooked ? 'unavailable' : ''}`}
                    onClick={() => {
                      if (!isBooked) {
                        setSelectedTime(time);
                        setErrorMsg('');
                      }
                    }}
                    title={isBooked ? 'Slot already booked' : `Book ${time} ET`}
                  >
                    <span>{time}</span>
                    {isSelected && <CheckCircle2 size={13} color="var(--white)" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          )}

          {selectedTime && (
            <div style={{ marginTop: '12px', padding: '8px 12px', background: 'var(--jade-100)', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--emerald-800)', fontWeight: 600 }}>
              ✓ Selected Slot: {selectedDate} at {selectedTime} ET {getVisitorLocalTime(selectedTime) ? `(${getVisitorLocalTime(selectedTime)})` : ''}
            </div>
          )}
        </div>
      </div>

      {/* Attendee Contact Details Form */}
      <form onSubmit={handleBookAppointment}>
        <div className="booking-contact-box">
          <div className="booking-contact-title">
            <User size={16} aria-hidden="true" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', color: 'var(--emerald-600)' }} />
            Your Contact & Video Meeting Details
          </div>

          {/* Video Platform Selection (Google Meet / Zoom) */}
          <div className="platform-selection-container">
            <label className="modal-input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Video size={15} color="var(--emerald-600)" aria-hidden="true" />
              <span>Select Video Meeting Platform *</span>
            </label>
            <div className="platform-toggle-row">
              <button
                type="button"
                className={`platform-toggle-btn ${meetingPlatform === 'Google Meet' ? 'active' : ''}`}
                onClick={() => setMeetingPlatform('Google Meet')}
              >
                <span className="platform-icon-indicator google-meet-indicator">M</span>
                <span>Google Meet</span>
              </button>
              <button
                type="button"
                className={`platform-toggle-btn ${meetingPlatform === 'Zoom' ? 'active' : ''}`}
                onClick={() => setMeetingPlatform('Zoom')}
              >
                <span className="platform-icon-indicator zoom-indicator">Z</span>
                <span>Zoom</span>
              </button>
            </div>
            <div className="platform-notice-text">
              Direct video meeting invitation link for {meetingPlatform} will be emailed to you upon booking confirmation.
            </div>
          </div>

          <div className="booking-form-grid">
            <div>
              <label htmlFor="apt-fullName" className="modal-input-label">Full Name *</label>
              <input
                id="apt-fullName"
                type="text"
                name="fullName"
                autoComplete="name"
                placeholder="e.g. John Doe"
                className="form-input"
                value={contactInfo.fullName}
                onChange={handleContactChange}
                required
              />
            </div>
            <div>
              <label htmlFor="apt-email" className="modal-input-label">Business Email *</label>
              <input
                id="apt-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="e.g. john@enterprise.com"
                className="form-input"
                value={contactInfo.email}
                onChange={handleContactChange}
                required
              />
            </div>
            <div>
              <label htmlFor="apt-phone" className="modal-input-label">Phone Number</label>
              <input
                id="apt-phone"
                type="tel"
                name="phone"
                autoComplete="tel"
                placeholder="e.g. +1 (614) 555-0199"
                className="form-input"
                value={contactInfo.phone}
                onChange={handleContactChange}
              />
            </div>
            <div>
              <label htmlFor="apt-company" className="modal-input-label">Company Name</label>
              <input
                id="apt-company"
                type="text"
                name="company"
                autoComplete="organization"
                placeholder="e.g. Acme Innovations Corp"
                className="form-input"
                value={contactInfo.company}
                onChange={handleContactChange}
              />
            </div>
          </div>

          {/* Edit Requirements Notes if needed */}
          <div style={{ marginTop: '12px' }}>
            <label htmlFor="apt-customNotes" className="modal-input-label">Project Requirements Notes (Optional Edit)</label>
            <textarea
              id="apt-customNotes"
              rows="2"
              placeholder="Your project notes and specifications..."
              className="form-input modal-textarea"
              value={customNotes}
              onChange={e => setCustomNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="booking-actions-row">
          {onBack ? (
            <button
              type="button"
              className="btn-secondary"
              onClick={onBack}
            >
              <ChevronLeft size={16} aria-hidden="true" /> Back to Questions
            </button>
          ) : <div />}

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {!selectedTime && (
              <span style={{ fontSize: '0.84rem', color: 'var(--error-red)', fontWeight: 600 }}>
                Select a time slot to continue
              </span>
            )}
            <button
              type="submit"
              className="btn-primary"
              disabled={loadingSubmit || !selectedDate || !selectedTime}
              style={{
                opacity: (!selectedDate || !selectedTime) ? 0.6 : 1,
                cursor: (!selectedDate || !selectedTime) ? 'not-allowed' : 'pointer'
              }}
            >
              <span>{loadingSubmit ? 'Confirming Video Meeting...' : 'Confirm & Book Video Meeting'}</span>
              <Send size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
