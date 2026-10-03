const nodemailer = require('nodemailer');
const analyticsStore = require('./analyticsStore');

let transporter = null;
let etherealAccount = null;

async function getTransporter() {
  if (transporter) return transporter;

  const gmailUser = process.env.GMAIL_USER || (process.env.SMTP_USER && process.env.SMTP_USER.includes('@gmail.com') ? process.env.SMTP_USER : null);
  const gmailPass = process.env.GMAIL_APP_PASSWORD || (gmailUser ? process.env.SMTP_PASS : null);

  // 1. Direct Gmail Configuration (Fastest, zero-config for Google Accounts with 16-char App Password)
  if (gmailUser && gmailPass) {
    try {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass
        }
      });
      console.log(`[Email Service] Authenticated with Gmail service (${gmailUser})`);
      return transporter;
    } catch (gErr) {
      console.warn('[Email Service] Gmail transport initialization warning:', gErr.message);
    }
  }

  // 2. Custom Standard SMTP configuration (AWS SES, SendGrid, Mailgun, Corporate SMTP)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    console.log(`[Email Service] Authenticated with SMTP host ${process.env.SMTP_HOST}`);
    return transporter;
  }

  // 3. Ethereal SMTP test account for instant sandbox preview testing
  try {
    etherealAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: etherealAccount.user,
        pass: etherealAccount.pass
      }
    });
    console.log('Ethereal Email initialized:', etherealAccount.user);
  } catch (err) {
    console.warn('Failed to create Ethereal account, falling back to mock transporter:', err.message);
    transporter = {
      sendMail: async () => ({ messageId: 'mock_' + Date.now() })
    };
  }

  return transporter;
}

function getUtcDateForNewYork(dateStr, timeStr) {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  const [tStr, meridiem] = (timeStr || '09:00 AM').split(' ');
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
}

function generateAdminEmailHtml(leadData) {
  const { answers = {}, contactInfo = {} } = leadData;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #0f172a; color: #e2e8f0; margin: 0; padding: 20px; }
        .container { max-width: 650px; margin: 0 auto; background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 30px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { border-bottom: 2px solid #10b981; padding-bottom: 15px; margin-bottom: 25px; display: flex; align-items: center; justify-content: space-between; }
        .title { color: #10b981; font-size: 24px; font-weight: 700; margin: 0; }
        .badge { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid #10b981; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .section-title { font-size: 16px; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px; margin-top: 25px; margin-bottom: 12px; font-weight: 600; }
        .field-group { background: #0f172a; border-radius: 8px; padding: 12px 16px; margin-bottom: 10px; border-left: 3px solid #06b6d4; }
        .label { font-size: 12px; color: #94a3b8; text-transform: uppercase; }
        .value { font-size: 15px; color: #f8fafc; font-weight: 500; margin-top: 4px; }
        .footer { margin-top: 30px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #334155; padding-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="title">Mansalvic Lead Submission</h1>
          <span class="badge">NEW INQUIRY</span>
        </div>
        
        <p style="color: #cbd5e1; font-size: 15px;">A new client has submitted their business requirements through the Mansalvic Consulting website.</p>

        <div class="section-title">Client Contact Details</div>
        <div class="field-group"><div class="label">Client Name</div><div class="value">${contactInfo.fullName || 'N/A'}</div></div>
        <div class="field-group"><div class="label">Email Address</div><div class="value"><a href="mailto:${contactInfo.email}" style="color: #38bdf8; text-decoration: none;">${contactInfo.email || 'N/A'}</a></div></div>
        <div class="field-group"><div class="label">Phone Number</div><div class="value">${contactInfo.phone || 'Not provided'}</div></div>
        <div class="field-group"><div class="label">Company Name</div><div class="value">${contactInfo.company || 'Not provided'}</div></div>

        <div class="section-title">Project Requirements</div>
        <div class="field-group"><div class="label">Primary Service Required</div><div class="value">${answers.service || 'N/A'}</div></div>
        <div class="field-group"><div class="label">Project Scope & Objectives</div><div class="value">${answers.scope || 'N/A'}</div></div>
        <div class="field-group"><div class="label">Target Timeline</div><div class="value">${answers.timeline || 'N/A'}</div></div>
        <div class="field-group"><div class="label">Estimated Budget</div><div class="value">${answers.budget || 'N/A'}</div></div>
        
        ${contactInfo.notes ? `<div class="field-group"><div class="label">Additional Notes</div><div class="value">${contactInfo.notes}</div></div>` : ''}

        <div class="footer">
          Mansalvic Consulting LLC • Ohio, US • Automated Dispatch System
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateClientEmailHtml(leadData) {
  const { contactInfo = {}, answers = {}, assignedHr, referenceCode, serviceType } = leadData;
  const clientName = contactInfo.fullName || 'Valued Client';
  const hasAppointment = Boolean(answers.appointmentDate && answers.appointmentTime);
  const platformName = (answers.meetingPlatform === 'meet' || answers.meetingPlatform === 'Google Meet')
    ? 'Google Meet'
    : 'Zoom Video Meeting';

  const friendlyRef = referenceCode || answers.referenceCode || leadData.id || ('MSV-2026-' + Math.random().toString(36).substring(2, 6).toUpperCase());

  const serviceLabels = {
    staffing: 'IT Staff Augmentation & Dedicated Teams',
    development: 'Custom Application Development',
    maintenance: '24/7 Application Maintenance & SLAs',
    cloud: 'Cloud Infrastructure & Modernization',
    general: 'Technical Architecture & Engineering Consultation'
  };
  const focusArea = answers.service || serviceLabels[serviceType] || 'Executive Technical Consultation';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmation: Mansalvic Consulting</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f4f6f8;
          color: #1e293b;
          margin: 0;
          padding: 24px 12px;
          -webkit-font-smoothing: antialiased;
        }
        .wrapper {
          max-width: 620px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(11, 61, 46, 0.08);
          border: 1px solid #e2e8f0;
        }
        .header {
          background: #0B3D2E;
          padding: 28px 32px;
          text-align: left;
          border-bottom: 3px solid #C9A227;
        }
        .brand-title {
          color: #FAF7F0;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 0.04em;
          margin: 0;
        }
        .brand-sub {
          color: #7FC8A9;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-top: 4px;
        }
        .content {
          padding: 32px;
        }
        .greeting {
          font-size: 18px;
          font-weight: 700;
          color: #0F172A;
          margin-top: 0;
          margin-bottom: 12px;
        }
        .badge {
          display: inline-block;
          background: #E8F5E9;
          color: #1B5E20;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.06em;
          padding: 4px 10px;
          border-radius: 14px;
          text-transform: uppercase;
          margin-bottom: 16px;
          border: 1px solid #A5D6A7;
        }
        .ticket {
          background: #FAF7F0;
          border: 1px solid #E2D9C8;
          border-left: 4px solid #C9A227;
          border-radius: 8px;
          padding: 20px;
          margin: 24px 0;
        }
        .ticket-title {
          font-size: 12px;
          font-weight: 800;
          color: #8A6D12;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 12px;
        }
        .ticket-grid {
          display: table;
          width: 100%;
        }
        .ticket-row {
          display: table-row;
        }
        .ticket-cell-label {
          display: table-cell;
          padding: 6px 12px 6px 0;
          font-size: 13px;
          color: #64748B;
          font-weight: 600;
          width: 35%;
        }
        .ticket-cell-val {
          display: table-cell;
          padding: 6px 0;
          font-size: 14px;
          color: #0F172A;
          font-weight: 700;
        }
        .features-list {
          margin: 20px 0;
          padding: 0;
          list-style: none;
        }
        .features-item {
          padding: 8px 0;
          font-size: 14px;
          color: #334155;
          display: flex;
          align-items: flex-start;
          line-height: 1.5;
        }
        .features-bullet {
          color: #1F7A55;
          font-weight: 900;
          margin-right: 10px;
        }
        .cta-box {
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          border-radius: 8px;
          padding: 16px;
          margin: 24px 0;
          font-size: 13px;
          color: #166534;
          line-height: 1.5;
        }
        .footer {
          background: #F8FAFC;
          border-top: 1px solid #E2E8F0;
          padding: 24px 32px;
          font-size: 12px;
          color: #64748B;
          line-height: 1.6;
        }
        .footer-brand {
          font-weight: 700;
          color: #0F172A;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div class="brand-title">MANSALVIC CONSULTING</div>
          <div class="brand-sub">IT Consulting & Executive Staffing • Columbus, Ohio</div>
        </div>
        <div class="content">
          ${hasAppointment ? `
            <span class="badge">Confirmed Video Consultation</span>
            <h1 class="greeting">Hi ${clientName},</h1>
            <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
              Thank you for scheduling a technical discovery session with Mansalvic Consulting LLC. We have reserved your dedicated 30-minute consultation with our senior technical leadership team.
            </p>

            <div class="ticket">
              <div class="ticket-title">Executive Briefing & Appointment Details</div>
              <div class="ticket-grid">
                <div class="ticket-row">
                  <span class="ticket-cell-label">Reference ID:</span>
                  <span class="ticket-cell-val" style="color: #0B3D2E; font-family: monospace; letter-spacing: 0.05em;">${friendlyRef}</span>
                </div>
                <div class="ticket-row">
                  <span class="ticket-cell-label">Date:</span>
                  <span class="ticket-cell-val">${answers.appointmentDate}</span>
                </div>
                <div class="ticket-row">
                  <span class="ticket-cell-label">Time:</span>
                  <span class="ticket-cell-val">${answers.appointmentTime} Eastern Time (ET)</span>
                </div>
                <div class="ticket-row">
                  <span class="ticket-cell-label">Platform:</span>
                  <span class="ticket-cell-val" style="color: #1F7A55;">${platformName}</span>
                </div>
                <div class="ticket-row">
                  <span class="ticket-cell-label">Focus Area:</span>
                  <span class="ticket-cell-val">${focusArea}</span>
                </div>
              </div>
            </div>

            <div class="cta-box">
              <strong>📅 Calendar Attachment Included:</strong> An official <code>.ics</code> calendar invite is attached to this email. Opening it will instantly place this confirmed session into your Google Calendar, Microsoft Outlook, or Apple Calendar with all meeting details.
            </div>

            <h3 style="font-size: 15px; color: #0F172A; margin-top: 24px; margin-bottom: 12px;">What to Expect During Our Session:</h3>
            <ul class="features-list">
              <li class="features-item"><span class="features-bullet">✓</span> <span><strong>100% Confidentiality:</strong> All technical reviews and architectural requirements are protected under our mutual US Non-Disclosure Agreement (NDA).</span></li>
              <li class="features-item"><span class="features-bullet">✓</span> <span><strong>Direct Engineering Architects:</strong> You will consult directly with a senior technical architect or engineering director, not a sales representative.</span></li>
              <li class="features-item"><span class="features-bullet">✓</span> <span><strong>Tailored Delivery Scoping:</strong> We will review your architecture, team velocity goals, and explore senior offshore or dedicated augmentation models.</span></li>
            </ul>

            <p style="font-size: 13px; color: #64748B; margin-top: 24px; line-height: 1.5;">
              Need to reschedule or add technical colleagues to the call? Reply directly to this email or contact us at <a href="mailto:hello@mansalvic.com" style="color: #1F7A55; text-decoration: underline;">hello@mansalvic.com</a>.
            </p>
          ` : `
            <span class="badge">Inquiry Received</span>
            <h1 class="greeting">Hi ${clientName},</h1>
            <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
              Thank you for contacting Mansalvic Consulting LLC. We have successfully received your project specifications and requirements.
            </p>

            <div class="ticket">
              <div class="ticket-title">Inquiry Reference & Summary</div>
              <div class="ticket-grid">
                <div class="ticket-row">
                  <span class="ticket-cell-label">Reference ID:</span>
                  <span class="ticket-cell-val" style="color: #0B3D2E; font-family: monospace;">${friendlyRef}</span>
                </div>
                <div class="ticket-row">
                  <span class="ticket-cell-label">Primary Service:</span>
                  <span class="ticket-cell-val">${focusArea}</span>
                </div>
                ${answers.timeline ? `
                  <div class="ticket-row">
                    <span class="ticket-cell-label">Target Timeline:</span>
                    <span class="ticket-cell-val">${answers.timeline}</span>
                  </div>
                ` : ''}
                ${assignedHr ? `
                  <div class="ticket-row">
                    <span class="ticket-cell-label">Assigned Talent Lead:</span>
                    <span class="ticket-cell-val">${assignedHr.name || assignedHr.full_name} (${assignedHr.title || 'Practice Lead'})</span>
                  </div>
                ` : ''}
              </div>
            </div>

            <h3 style="font-size: 15px; color: #0F172A; margin-top: 24px; margin-bottom: 12px;">Next Steps:</h3>
            <ul class="features-list">
              <li class="features-item"><span class="features-bullet">✓</span> <span><strong>Senior Review:</strong> Our US technical leadership and engineering leads are reviewing your requirements.</span></li>
              <li class="features-item"><span class="features-bullet">✓</span> <span><strong>Guaranteed SLA Response:</strong> An assigned practice lead will reach out within 24 business hours.</span></li>
              <li class="features-item"><span class="features-bullet">✓</span> <span><strong>14-Day Risk-Free Guarantee:</strong> All dedicated talent placements include our standard 2-week risk-free trial.</span></li>
            </ul>

            <p style="font-size: 13px; color: #64748B; margin-top: 24px; line-height: 1.5;">
              If you have urgent questions or additional architecture diagrams to share, reply directly to this email or reach us at <a href="mailto:hello@mansalvic.com" style="color: #1F7A55;">hello@mansalvic.com</a>.
            </p>
          `}
        </div>

        <div class="footer">
          <div class="footer-brand">Mansalvic Consulting LLC</div>
          <div>Headquartered in Columbus, Ohio, US</div>
          <div style="margin-top: 4px;">Direct Support: <a href="mailto:hello@mansalvic.com" style="color: #1F7A55;">hello@mansalvic.com</a> • <a href="https://mansalvic.com" style="color: #1F7A55;">mansalvic.com</a></div>
          <div style="margin-top: 8px; font-size: 11px; color: #94A3B8;">© 2026 Mansalvic Consulting LLC. All rights reserved. Confidential & Proprietary.</div>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function sendClientConfirmationEmail(leadData) {
  const { contactInfo = {}, answers = {} } = leadData;
  if (!contactInfo || !contactInfo.email) {
    console.warn('[Client Email] No recipient email provided in contactInfo');
    return { success: false, error: 'No recipient email provided' };
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const enableDevAlerts = process.env.ENABLE_DEV_EMAIL_ALERTS === 'true';
  const clientEmail = contactInfo.email;

  if (!isProduction && !enableDevAlerts) {
    console.log(`[Client Confirmation Email] Suppressed in development mode for ${clientEmail}. Confirmation emails active in production.`);
    return { success: true, skipped: true, reason: 'DEV_MODE_SUPPRESSED' };
  }

  const senderEmail = process.env.GMAIL_USER || process.env.SENDER_EMAIL || 'notifications@mansalvic.com';
  const hasAppointment = Boolean(answers.appointmentDate && answers.appointmentTime);
  const platformName = (answers.meetingPlatform === 'meet' || answers.meetingPlatform === 'Google Meet')
    ? 'Google Meet'
    : 'Zoom Video Meeting';

  const subject = hasAppointment
    ? `⚡ Video Meeting Confirmed: Mansalvic Technical Discovery via ${platformName}`
    : `Mansalvic Consulting: Project Inquiry Confirmation (${answers.service || 'Technical Consultation'})`;

  const htmlContent = generateClientEmailHtml(leadData);

  try {
    const transport = await getTransporter();
    const attachments = [];

    if (hasAppointment) {
      const startUtcDate = getUtcDateForNewYork(answers.appointmentDate, answers.appointmentTime);
      const endUtcDate = new Date(startUtcDate.getTime() + 30 * 60 * 1000); // 30 min duration per BR-02
      const formatIcs = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      const icsData = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Mansalvic Consulting LLC//Engineering Consultation//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:REQUEST',
        'BEGIN:VEVENT',
        `UID:MSV-${Date.now()}@mansalvic.com`,
        `DTSTAMP:${formatIcs(new Date())}`,
        `DTSTART:${formatIcs(startUtcDate)}`,
        `DTEND:${formatIcs(endUtcDate)}`,
        `SUMMARY:Mansalvic Technical Consultation - ${contactInfo.company || contactInfo.fullName}`,
        `DESCRIPTION:Scheduled Technical Discovery via ${platformName}.\\nClient: ${contactInfo.fullName} (${contactInfo.email})\\nOrganizer: hello@mansalvic.com\\nHeadquarters: Columbus, Ohio, US.`,
        `LOCATION:${platformName}`,
        'ORGANIZER;CN="Mansalvic Consulting LLC":mailto:hello@mansalvic.com',
        `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN="${contactInfo.fullName}":mailto:${contactInfo.email}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      attachments.push({
        filename: 'mansalvic-consultation.ics',
        content: icsData,
        contentType: 'text/calendar; charset=utf-8; method=REQUEST'
      });
    }

    const mailOptions = {
      from: `"Mansalvic Consulting LLC" <${senderEmail}>`,
      to: clientEmail,
      replyTo: 'hello@mansalvic.com',
      subject,
      html: htmlContent,
      attachments
    };

    const info = await transport.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info) || null;

    const emailLog = analyticsStore.addEmailLog({
      to: clientEmail,
      subject: mailOptions.subject,
      html: htmlContent,
      previewUrl: previewUrl,
      status: 'SENT',
      messageId: info.messageId,
      recipientType: 'CLIENT'
    });

    console.log(`[Client Email Dispatch] Successfully sent confirmation to ${clientEmail}. Preview URL: ${previewUrl || 'N/A'}`);
    return { success: true, messageId: info.messageId, previewUrl, emailLog };
  } catch (err) {
    console.error('[Client Email Error]', err);
    analyticsStore.addEmailLog({
      to: clientEmail,
      subject,
      html: htmlContent,
      status: 'FAILED',
      error: err.message,
      recipientType: 'CLIENT'
    });
    return { success: false, error: err.message };
  }
}

async function sendLeadNotificationEmail(leadData) {
  const adminEmail = process.env.ADMIN_EMAIL || 'hello@mansalvic.com';
  const senderEmail = process.env.GMAIL_USER || process.env.SENDER_EMAIL || 'notifications@mansalvic.com';

  const { answers = {}, contactInfo = {} } = leadData;
  const htmlContent = generateAdminEmailHtml(leadData);

  let adminResult = { success: false, previewUrl: null };
  let clientResult = { success: false, previewUrl: null };

  // 1. Dispatch internal admin notification
  const isProduction = process.env.NODE_ENV === 'production';
  const enableDevAlerts = process.env.ENABLE_DEV_EMAIL_ALERTS === 'true';

  if (!isProduction && !enableDevAlerts) {
    console.log(`[Admin Lead Alert] Suppressed in development mode for admin (${adminEmail}). Lead alerts active in production.`);
    adminResult = { success: true, skipped: true, reason: 'DEV_MODE_SUPPRESSED' };
  } else {
    try {
      const transport = await getTransporter();
    const attachments = [];
    if (answers.appointmentDate && answers.appointmentTime) {
      const startUtcDate = getUtcDateForNewYork(answers.appointmentDate, answers.appointmentTime);
      const endUtcDate = new Date(startUtcDate.getTime() + 30 * 60 * 1000); // 30 min duration per BR-02
      const formatIcs = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      const icsData = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Mansalvic Consulting LLC//Engineering Consultation//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:REQUEST',
        'BEGIN:VEVENT',
        `UID:MSV-${Date.now()}@mansalvic.com`,
        `DTSTAMP:${formatIcs(new Date())}`,
        `DTSTART:${formatIcs(startUtcDate)}`,
        `DTEND:${formatIcs(endUtcDate)}`,
        `SUMMARY:Mansalvic Consultation - ${contactInfo.company || contactInfo.fullName}`,
        `DESCRIPTION:Scheduled Technical Meeting: ${answers.appointmentDate} at ${answers.appointmentTime} ET via ${answers.meetingPlatform || 'Video'}.\\nClient: ${contactInfo.fullName} (${contactInfo.email})`,
        `LOCATION:${answers.meetingPlatform === 'meet' ? 'Google Meet' : 'Zoom Video'}`,
        'ORGANIZER;CN="Mansalvic Consulting LLC":mailto:hello@mansalvic.com',
        `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN="${contactInfo.fullName}":mailto:${contactInfo.email}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      attachments.push({
        filename: 'mansalvic-consultation.ics',
        content: icsData,
        contentType: 'text/calendar; charset=utf-8; method=REQUEST'
      });
    }

    const mailOptions = {
      from: `"Mansalvic Web Portal" <${senderEmail}>`,
      to: adminEmail,
      subject: `⚡ New Lead: ${contactInfo.company || contactInfo.fullName} - ${answers.service || 'IT Services Inquiry'}`,
      html: htmlContent,
      attachments
    };

    const info = await transport.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info) || null;

    const emailLog = analyticsStore.addEmailLog({
      to: adminEmail,
      subject: mailOptions.subject,
      html: htmlContent,
      previewUrl: previewUrl,
      status: 'SENT',
      messageId: info.messageId,
      recipientType: 'ADMIN'
    });

    console.log(`[Admin Email Dispatch] Sent to ${adminEmail}. Preview URL: ${previewUrl || 'N/A'}`);
    adminResult = { success: true, messageId: info.messageId, previewUrl, emailLog };
  } catch (err) {
    console.error('[Admin Email Error]', err);
    analyticsStore.addEmailLog({
      to: adminEmail,
      subject: `Lead Submission Error: ${contactInfo.fullName}`,
      html: htmlContent,
      status: 'FAILED',
      error: err.message,
      recipientType: 'ADMIN'
    });
    adminResult = { success: false, error: err.message };
    }
  }

  // 2. Automatically dispatch client confirmation email if email is provided
  if (contactInfo && contactInfo.email) {
    try {
      clientResult = await sendClientConfirmationEmail(leadData);
    } catch (clientErr) {
      console.error('[Client Email Auto-Dispatch Error]', clientErr);
      clientResult = { success: false, error: clientErr.message };
    }
  }

  return {
    success: adminResult.success || clientResult.success,
    previewUrl: clientResult.previewUrl || adminResult.previewUrl,
    admin: adminResult,
    client: clientResult
  };
}

async function sendWorkerAssignmentEmail({ worker, client, hr, stage, agreedRate, clientNotes }) {
  if (!worker || !worker.email) {
    console.warn('[Worker Email] No worker email provided');
    return { success: false, error: 'No worker email provided' };
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const enableDevAlerts = process.env.ENABLE_DEV_EMAIL_ALERTS === 'true';
  const workerEmail = worker.email;

  if (!isProduction && !enableDevAlerts) {
    console.log(`[Worker Assignment Email] Suppressed in development mode for ${workerEmail}. Worker emails active in production.`);
    return { success: true, skipped: true, reason: 'DEV_MODE_SUPPRESSED' };
  }

  const senderEmail = process.env.GMAIL_USER || process.env.SENDER_EMAIL || 'notifications@mansalvic.com';
  const stageLabels = {
    SOURCING: 'Candidate Sourcing & Pre-Screening',
    CLIENT_INTERVIEW: 'Client Interview Scheduled',
    ALLOTTED: 'Officially Allotted & Contract Executed',
    ACTIVE: 'Active in Engineering Sprints'
  };
  const stageDisplay = stageLabels[stage] || stage || 'Active Allocation';
  const rateDisplay = agreedRate || worker.hourly_rate || 55;

  const subject = `⚡ New Client Engagement Assignment: ${client.full_name || client.name} (${client.company || 'Enterprise Project'})`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Offshore Engagement Allocation: Mansalvic</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f8; color: #1e293b; margin: 0; padding: 24px 12px; }
        .wrapper { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(11, 61, 46, 0.08); border: 1px solid #e2e8f0; }
        .header { background: #0B3D2E; padding: 24px 32px; border-bottom: 3px solid #C9A227; }
        .brand-title { color: #FAF7F0; font-size: 18px; font-weight: 800; letter-spacing: 0.04em; margin: 0; }
        .brand-sub { color: #7FC8A9; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px; }
        .content { padding: 32px; }
        .badge { display: inline-block; background: #FEF3C7; color: #92400E; font-weight: 800; font-size: 11px; letter-spacing: 0.06em; padding: 4px 10px; border-radius: 14px; text-transform: uppercase; margin-bottom: 16px; border: 1px solid #FCD34D; }
        .greeting { font-size: 18px; font-weight: 700; color: #0F172A; margin: 0 0 12px 0; }
        .card { background: #FAF7F0; border: 1px solid #E2D9C8; border-left: 4px solid #1F7A55; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px dashed #E2D9C8; }
        .row:last-child { border-bottom: none; }
        .label { color: #64748B; font-weight: 600; }
        .val { color: #0F172A; font-weight: 700; }
        .footer { background: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 20px 32px; font-size: 12px; color: #64748B; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div class="brand-title">MANSALVIC TALENT OPERATIONS</div>
          <div class="brand-sub">Offshore Engineering Roster & Client Allocation System</div>
        </div>
        <div class="content">
          <span class="badge">Engagement Allotted</span>
          <h1 class="greeting">Hi ${worker.full_name},</h1>
          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            You have been assigned to an offshore technical engagement with Mansalvic Consulting LLC. Please review the project details below and coordinate with your supervising HR talent partner.
          </p>

          <div class="card">
            <div style="font-size: 11px; font-weight: 800; color: #1F7A55; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.05em;">Engagement Parameters</div>
            <div class="row"><span class="label">Client Account:</span> <span class="val">${client.full_name || client.name} (${client.company || 'Enterprise'})</span></div>
            <div class="row"><span class="label">Client Contact:</span> <span class="val">${client.email || 'N/A'}</span></div>
            <div class="row"><span class="label">Assigned Role:</span> <span class="val">${worker.role}</span></div>
            <div class="row"><span class="label">Engagement Stage:</span> <span class="val" style="color: #059669;">${stageDisplay}</span></div>
            <div class="row"><span class="label">Agreed Compensation:</span> <span class="val">$${rateDisplay}/hr</span></div>
            <div class="row"><span class="label">Timezone Requirement:</span> <span class="val">${worker.timezone || '4–6h Daily US Overlap'}</span></div>
            <div class="row"><span class="label">Supervising HR Lead:</span> <span class="val">${hr?.full_name || hr?.name || 'Talent Acquisition Partner'} (${hr?.email || 'hr@mansalvic.com'})</span></div>
          </div>

          ${clientNotes ? `
            <div style="background: #F1F5F9; border-radius: 8px; padding: 14px 18px; margin: 20px 0; font-size: 13px; color: #334155;">
              <strong style="color: #0F172A;">Client Scoping Notes:</strong><br>
              ${clientNotes}
            </div>
          ` : ''}

          <h3 style="font-size: 14px; color: #0F172A; margin-top: 20px; margin-bottom: 10px;">Mandatory Engagement Guidelines:</h3>
          <ul style="padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.6;">
            <li><strong>US Timezone Alignment:</strong> Guarantee active availability for the mandatory 4 to 6-hour daily overlap with US Eastern/Central hours.</li>
            <li><strong>Git & Security Compliance:</strong> Adhere strictly to the client's Git branching workflow, commit signing, and confidential repository guidelines under US NDA.</li>
            <li><strong>Time Tracking & Standups:</strong> Join daily standups via Slack/Teams and submit verified sprint hours through your HR manager.</li>
          </ul>
        </div>
        <div class="footer">
          <strong>Mansalvic Consulting LLC</strong> • Global Delivery & Offshore Engineering Operations<br>
          For questions, contact your assigned HR partner or <a href="mailto:talent@mansalvic.com" style="color: #1F7A55;">talent@mansalvic.com</a>.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const transport = await getTransporter();
    const mailOptions = {
      from: `"Mansalvic Talent Operations" <${senderEmail}>`,
      to: workerEmail,
      replyTo: hr?.email || 'hello@mansalvic.com',
      subject,
      html: htmlContent
    };

    const info = await transport.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info) || null;

    const emailLog = analyticsStore.addEmailLog({
      to: workerEmail,
      subject: mailOptions.subject,
      html: htmlContent,
      previewUrl: previewUrl,
      status: 'SENT',
      messageId: info.messageId,
      recipientType: 'WORKER'
    });

    console.log(`[Worker Email Dispatch] Sent assignment notification to ${workerEmail}. Preview URL: ${previewUrl || 'N/A'}`);
    return { success: true, messageId: info.messageId, previewUrl, emailLog };
  } catch (err) {
    console.error('[Worker Email Error]', err);
    analyticsStore.addEmailLog({
      to: workerEmail,
      subject,
      html: htmlContent,
      status: 'FAILED',
      error: err.message,
      recipientType: 'WORKER'
    });
    return { success: false, error: err.message };
  }
}

async function sendVisitorArrivalAlert(visitorInfo) {
  const isProduction = process.env.NODE_ENV === 'production';
  const enableDevAlerts = process.env.ENABLE_DEV_EMAIL_ALERTS === 'true';
  const visitorId = visitorInfo.visitorId || 'Anonymous Visitor';

  // Suppress email alerts in development mode; only dispatch real alerts in production
  if (!isProduction && !enableDevAlerts) {
    console.log(`[Visitor Alert Email] Suppressed in development mode (${visitorId}). Alerts are active in production only.`);
    return { success: true, skipped: true, reason: 'DEV_MODE_SUPPRESSED' };
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'hello@mansalvic.com';
  const senderEmail = process.env.SENDER_EMAIL || process.env.GMAIL_USER || process.env.SMTP_USER || 'notifications@mansalvic.com';
  
  const ip = visitorInfo.ip || '127.0.0.1';
  const location = visitorInfo.location || 'Columbus, OH, US';
  const userAgent = visitorInfo.userAgent || 'Desktop Browser';
  const landingPage = visitorInfo.landingPage || '/';
  const referrer = visitorInfo.referrer || 'Direct Visit';
  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' }) + ' ET';

  const subject = `🚨 [Live Visitor] New Visitor Active on Website (${visitorId})`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1e36; color: #e2e8f0; margin: 0; padding: 24px; }
        .card { max-width: 620px; margin: 0 auto; background: #0f172a; border: 1.5px solid #1e293b; border-radius: 14px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #0b1e36 0%, #1e3a8a 100%); padding: 24px 28px; border-bottom: 2px solid #059669; }
        .tag { display: inline-block; background: rgba(5, 150, 105, 0.2); color: #34d399; border: 1px solid #059669; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 10px; border-radius: 20px; }
        .title { color: #ffffff; font-size: 20px; font-weight: 800; margin: 10px 0 4px 0; }
        .body { padding: 24px 28px; }
        .metric-box { background: #1e293b; border-radius: 10px; padding: 14px 18px; margin-bottom: 12px; border-left: 4px solid #059669; }
        .metric-label { font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; font-weight: 700; }
        .metric-value { font-size: 15px; color: #f8fafc; font-weight: 600; margin-top: 3px; word-break: break-all; }
        .btn { display: inline-block; background: #059669; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; margin-top: 16px; }
        .footer { padding: 16px 28px; background: #0b1e36; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b; text-align: center; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <span class="tag">Real-Time Ingestion</span>
          <h1 class="title">New Visitor Landed on Website</h1>
          <div style="font-size: 13px; color: #93c5fd;">Mansalvic Real-Time Visitor Telemetry Monitor</div>
        </div>
        <div class="body">
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5; margin-top: 0;">
            A new visitor has initiated an active session on your website. Here are their live connection details:
          </p>
          <div class="metric-box">
            <div class="metric-label">Visitor Identifier</div>
            <div class="metric-value">${visitorId}</div>
          </div>
          <div class="metric-box">
            <div class="metric-label">Detected Location & IP</div>
            <div class="metric-value">${location} • IP: <code>${ip}</code></div>
          </div>
          <div class="metric-box">
            <div class="metric-label">Arrival Timestamp</div>
            <div class="metric-value">${timestamp}</div>
          </div>
          <div class="metric-box">
            <div class="metric-label">Landing Route / Referrer</div>
            <div class="metric-value">${landingPage} (Source: ${referrer})</div>
          </div>
          <div class="metric-box">
            <div class="metric-label">Device & Browser</div>
            <div class="metric-value" style="font-size: 13px;">${userAgent}</div>
          </div>
          <div style="text-align: center; margin-top: 24px;">
            <a href="http://localhost:3000/#admin" class="btn">Open Admin Command Center</a>
            <div style="font-size: 11px; color: #64748b; margin-top: 8px;">
              Passcode: <code>MansalvicSecure2026!</code>
            </div>
          </div>
        </div>
        <div class="footer">
          Mansalvic Consulting LLC • Executive Real-Time Operations • Automated Dispatch
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const transport = await getTransporter();
    const mailOptions = {
      from: `"Mansalvic Visitor Telemetry" <${senderEmail}>`,
      to: adminEmail,
      subject,
      html: htmlContent
    };

    const info = await transport.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info) || null;

    const emailLog = analyticsStore.addEmailLog({
      to: adminEmail,
      subject,
      html: htmlContent,
      previewUrl,
      status: 'SENT',
      messageId: info.messageId,
      recipientType: 'ADMIN'
    });

    console.log(`[Visitor Alert Email] Sent arrival alert for ${visitorId} to ${adminEmail}. Preview URL: ${previewUrl || 'N/A'}`);
    return { success: true, messageId: info.messageId, previewUrl, emailLog };
  } catch (err) {
    console.error('[Visitor Alert Email Error]', err);
    analyticsStore.addEmailLog({
      to: adminEmail,
      subject,
      html: htmlContent,
      status: 'FAILED',
      error: err.message,
      recipientType: 'ADMIN'
    });
    return { success: false, error: err.message };
  }
}

async function sendTestEmail(toEmail) {
  const adminEmail = process.env.ADMIN_EMAIL || 'hello@mansalvic.com';
  const targetEmail = toEmail || adminEmail;
  const senderEmail = process.env.SENDER_EMAIL || process.env.GMAIL_USER || process.env.SMTP_USER || 'notifications@mansalvic.com';

  const subject = `✅ Mansalvic Live Email Delivery Verification (${new Date().toLocaleTimeString()})`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; background-color: #0b1e36; color: #ffffff; padding: 24px; margin: 0;">
      <div style="max-width: 550px; margin: 0 auto; background: #ffffff; color: #0f172a; border-radius: 14px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
          <h2 style="color: #059669; margin: 0; font-size: 22px;">🎉 Live Email Delivery Successful!</h2>
        </div>
        <p style="font-size: 15px; color: #334155; line-height: 1.6; margin-top: 10px;">
          If you are reading this email in your personal inbox, your email integration with Mansalvic is <strong>100% active, verified, and operational</strong>!
        </p>
        <div style="background: #f1f5f9; padding: 16px 20px; border-radius: 8px; font-size: 14px; margin: 24px 0; border-left: 4px solid #059669;">
          <div style="margin-bottom: 6px;"><strong>Target Recipient:</strong> ${targetEmail}</div>
          <div style="margin-bottom: 6px;"><strong>Dispatched At:</strong> ${new Date().toLocaleString()}</div>
          <div><strong>Transport Engine:</strong> ${process.env.GMAIL_USER ? 'Google Gmail Direct' : (process.env.SMTP_HOST ? 'Custom SMTP' : 'Ethereal Test Sandbox')}</div>
        </div>
        <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
          Mansalvic Consulting LLC • Executive Real-Time Verification
        </p>
      </div>
    </body>
    </html>
  `;

  try {
    const transport = await getTransporter();
    const mailOptions = {
      from: `"Mansalvic Dispatch Test" <${senderEmail}>`,
      to: targetEmail,
      subject,
      html: htmlContent
    };

    const info = await transport.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info) || null;

    const emailLog = analyticsStore.addEmailLog({
      to: targetEmail,
      subject,
      html: htmlContent,
      previewUrl,
      status: 'SENT',
      messageId: info.messageId,
      recipientType: 'TEST'
    });

    console.log(`[Test Email Dispatch] Verified delivery to ${targetEmail}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId, previewUrl, emailLog };
  } catch (err) {
    console.error('[Test Email Error]', err);
    analyticsStore.addEmailLog({
      to: targetEmail,
      subject,
      html: htmlContent,
      status: 'FAILED',
      error: err.message,
      recipientType: 'TEST'
    });
    return { success: false, error: err.message };
  }
}

module.exports = {
  sendLeadNotificationEmail,
  sendClientConfirmationEmail,
  sendWorkerAssignmentEmail,
  sendVisitorArrivalAlert,
  sendTestEmail,
  generateClientEmailHtml,
  generateAdminEmailHtml
};
