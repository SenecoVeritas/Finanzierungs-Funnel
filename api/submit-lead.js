// ==========================================
// RS Finance Funnel - Serverless Webhook
// Vercel/Netlify Function
// ==========================================

const Airtable = require('airtable');

// ==========================================
// CONFIGURATION
// ==========================================

const CONFIG = {
  // Airtable credentials (from Environment Variables)
  AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
  AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
  AIRTABLE_TABLE_LEADS: 'Leads_raw',

  // Resend.com for email notifications
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  NOTIFICATION_EMAIL: process.env.NOTIFICATION_EMAIL || 'callpartner@example.com',

  // Security
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || '').split(','),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '5'),
  RATE_LIMIT_WINDOW: 60000 // 1 minute
};

// Simple in-memory rate limiting (for serverless)
const rateLimitCache = new Map();

// ==========================================
// MAIN HANDLER
// ==========================================

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCORS(res);
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed'
    });
  }

  try {
    // CORS check
    const origin = req.headers.origin || req.headers.referer;
    if (!isAllowedOrigin(origin)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - Invalid origin'
      });
    }

    // Get request body
    const data = req.body;

    // Validate required fields
    const validation = validateLeadData(data);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    // Rate limiting check
    const clientId = getClientIdentifier(req);
    if (!checkRateLimit(clientId)) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please wait a moment.'
      });
    }

    // Generate unique Lead ID
    const leadId = generateLeadId();

    // Prepare Airtable record
    const leadRecord = {
      'lead_id': leadId,
      'vorname': sanitize(data.firstName),
      'nachname': sanitize(data.lastName),
      'email': sanitize(data.email),
      'telefon': sanitize(data.phone),
      'finanzierungsart': sanitize(data.financingType),
      'objektwert': parseInt(data.loanAmount) || 0,
      'eigenkapital': parseInt(data.equity) || 0,
      'wunschzeitpunkt': 'Innerhalb 3-6 Monate', // Default or from form
      'quelle': 'Funnel',
      'status': 'NEU',
      'nachricht': sanitize(data.message || '')
    };

    // Save to Airtable
    const airtableResult = await saveToAirtable(leadRecord);

    if (!airtableResult.success) {
      throw new Error('Failed to save to Airtable');
    }

    // Send notification (async - don't wait)
    sendNotification(leadRecord, airtableResult.recordId).catch(err => {
      console.error('Notification error:', err);
      // Don't fail the request if notification fails
    });

    // Success response
    return res.status(200).json({
      success: true,
      message: 'Lead erfolgreich erfasst',
      data: {
        lead_id: leadId
      }
    });

  } catch (error) {
    console.error('Error in submit-lead:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ==========================================
// AIRTABLE INTEGRATION
// ==========================================

async function saveToAirtable(leadData) {
  try {
    const base = new Airtable({ apiKey: CONFIG.AIRTABLE_API_KEY })
      .base(CONFIG.AIRTABLE_BASE_ID);

    const records = await base(CONFIG.AIRTABLE_TABLE_LEADS).create([
      {
        fields: leadData
      }
    ]);

    return {
      success: true,
      recordId: records[0].id
    };

  } catch (error) {
    console.error('Airtable error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ==========================================
// NOTIFICATION (E-MAIL)
// ==========================================

async function sendNotification(leadData, recordId) {
  if (!CONFIG.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set - skipping notification');
    return;
  }

  try {
    const emailHtml = createEmailTemplate(leadData, recordId);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'RS Finance Funnel <leads@nadolph.com>',
        to: CONFIG.NOTIFICATION_EMAIL,
        subject: `🔔 Neuer Lead: ${leadData.vorname} ${leadData.nachname}`,
        html: emailHtml
      })
    });

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.statusText}`);
    }

    console.log('Notification sent successfully');
    return true;

  } catch (error) {
    console.error('Email notification error:', error);
    return false;
  }
}

// ==========================================
// E-MAIL TEMPLATE
// ==========================================

function createEmailTemplate(leadData, recordId) {
  const airtableLink = `https://airtable.com/${CONFIG.AIRTABLE_BASE_ID}/${CONFIG.AIRTABLE_TABLE_LEADS}/${recordId}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #587592 0%, #4a6380 100%);
      color: white;
      padding: 30px 20px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .content {
      background: #f8f9fa;
      padding: 30px 20px;
      border-radius: 0 0 8px 8px;
    }
    .info-box {
      background: white;
      border-left: 4px solid #587592;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .info-row {
      margin: 10px 0;
      display: flex;
      justify-content: space-between;
    }
    .label {
      font-weight: 600;
      color: #587592;
    }
    .value {
      color: #2c3e50;
    }
    .cta-button {
      display: inline-block;
      background: #587592;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎯 Neuer Finanzierungs-Lead</h1>
  </div>

  <div class="content">
    <p><strong>Lead-ID:</strong> ${leadData.lead_id}</p>

    <div class="info-box">
      <h3>👤 Kontaktdaten</h3>
      <div class="info-row">
        <span class="label">Name:</span>
        <span class="value">${leadData.vorname} ${leadData.nachname}</span>
      </div>
      <div class="info-row">
        <span class="label">Telefon:</span>
        <span class="value"><strong>${leadData.telefon}</strong></span>
      </div>
      <div class="info-row">
        <span class="label">E-Mail:</span>
        <span class="value">${leadData.email}</span>
      </div>
    </div>

    <div class="info-box">
      <h3>💰 Finanzierungsdetails</h3>
      <div class="info-row">
        <span class="label">Art:</span>
        <span class="value">${leadData.finanzierungsart}</span>
      </div>
      <div class="info-row">
        <span class="label">Objektwert:</span>
        <span class="value">${formatCurrency(leadData.objektwert)}</span>
      </div>
      <div class="info-row">
        <span class="label">Eigenkapital:</span>
        <span class="value">${formatCurrency(leadData.eigenkapital)}</span>
      </div>
    </div>

    ${leadData.nachricht ? `
    <div class="info-box">
      <h3>💬 Nachricht</h3>
      <p><em>"${leadData.nachricht}"</em></p>
    </div>
    ` : ''}

    <div style="text-align: center;">
      <a href="${airtableLink}" class="cta-button" style="color: white;">
        📊 In Airtable öffnen
      </a>
    </div>

    <p style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 6px;">
      <strong>⏰ Nächster Schritt:</strong> Lead innerhalb von 15 Minuten kontaktieren!
    </p>
  </div>
</body>
</html>
  `;
}

// ==========================================
// VALIDATION
// ==========================================

function validateLeadData(data) {
  const required = ['firstName', 'lastName', 'email', 'phone', 'financingType'];

  for (const field of required) {
    if (!data[field] || String(data[field]).trim() === '') {
      return {
        valid: false,
        error: `Pflichtfeld fehlt: ${field}`
      };
    }
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return {
      valid: false,
      error: 'Ungültige E-Mail-Adresse'
    };
  }

  // Phone validation (basic)
  const phoneRegex = /^[\d\s\+\-\(\)]{8,20}$/;
  if (!phoneRegex.test(data.phone)) {
    return {
      valid: false,
      error: 'Ungültige Telefonnummer'
    };
  }

  return { valid: true };
}

// ==========================================
// SECURITY HELPERS
// ==========================================

function isAllowedOrigin(origin) {
  if (!origin) return false;

  return CONFIG.ALLOWED_ORIGINS.some(allowed =>
    origin.includes(allowed.trim())
  );
}

function sanitize(input) {
  if (typeof input !== 'string') return String(input);

  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .substring(0, 500);
}

function checkRateLimit(identifier) {
  const now = Date.now();
  const key = identifier;

  if (!rateLimitCache.has(key)) {
    rateLimitCache.set(key, { count: 1, resetTime: now + CONFIG.RATE_LIMIT_WINDOW });
    return true;
  }

  const entry = rateLimitCache.get(key);

  // Reset if window expired
  if (now > entry.resetTime) {
    rateLimitCache.set(key, { count: 1, resetTime: now + CONFIG.RATE_LIMIT_WINDOW });
    return true;
  }

  // Increment count
  entry.count++;

  // Check limit
  return entry.count <= CONFIG.RATE_LIMIT_MAX;
}

function getClientIdentifier(req) {
  // Try to get client IP (works on Vercel/Netlify)
  return req.headers['x-forwarded-for']?.split(',')[0] ||
         req.headers['x-real-ip'] ||
         req.socket?.remoteAddress ||
         'unknown';
}

function handleCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Or specific origin
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
}

// ==========================================
// UTILITIES
// ==========================================

function generateLeadId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `LD-${year}-${month}${day}-${random}`;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('de-AT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}
