// ==========================================
// RS Finance Funnel - Lead Management System
// Google Apps Script - Main Handler
// ==========================================

// ==========================================
// CONFIGURATION
// ==========================================

const CONFIG = {
  // Google Sheet ID (get from URL: https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit)
  SHEET_ID: 'YOUR_GOOGLE_SHEET_ID_HERE',

  // Sheet Names
  SHEET_LEADS: 'Leads_raw',
  SHEET_QUALI: 'Qualifizierung',

  // Notification Settings
  NOTIFICATION_EMAIL: 'callpartner@example.com', // E-Mail des Callpartners
  RS_FINANCE_EMAIL: 'office@rs-finance.at',

  // Telegram (optional)
  TELEGRAM_ENABLED: false,
  TELEGRAM_BOT_TOKEN: 'YOUR_BOT_TOKEN',
  TELEGRAM_CHAT_ID: 'YOUR_CHAT_ID',

  // Security
  ALLOWED_ORIGINS: [
    'https://nadolph.com',
    'https://www.nadolph.com',
    'https://funnel-finanzierung.vercel.app'
  ],

  // Rate Limiting (max requests per minute per IP)
  RATE_LIMIT_MAX: 5,
  RATE_LIMIT_WINDOW: 60000 // 1 minute in ms
};

// ==========================================
// MAIN ENTRY POINT - Handle POST Requests
// ==========================================

function doPost(e) {
  try {
    // CORS headers
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);

    // Parse incoming data
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return createResponse(false, 'Ungültige Daten', output);
    }

    // Validate origin (Security)
    const origin = e.parameter.origin || '';
    if (!isAllowedOrigin(origin)) {
      Logger.log('Blocked request from origin: ' + origin);
      return createResponse(false, 'Zugriff verweigert', output);
    }

    // Validate required fields
    const validation = validateLeadData(data);
    if (!validation.valid) {
      return createResponse(false, validation.error, output);
    }

    // Rate limiting check
    if (!checkRateLimit(data.email)) {
      return createResponse(false, 'Zu viele Anfragen. Bitte warten Sie einen Moment.', output);
    }

    // Generate unique Lead ID
    const leadId = generateLeadId();

    // Prepare lead data
    const leadData = {
      timestamp: new Date(),
      lead_id: leadId,
      vorname: sanitizeInput(data.firstName),
      nachname: sanitizeInput(data.lastName),
      email: sanitizeInput(data.email),
      telefon: sanitizeInput(data.phone),
      finanzierungsart: sanitizeInput(data.financingType),
      objektwert: parseInt(data.loanAmount) || 0,
      eigenkapital: parseInt(data.equity) || 0,
      wunschzeitpunkt: 'Innerhalb 3-6 Monate', // Default oder aus Formular
      quelle: 'Funnel',
      status: 'NEU',
      nachricht: sanitizeInput(data.message || '')
    };

    // Save to Google Sheet
    const saveResult = saveLead(leadData);
    if (!saveResult.success) {
      return createResponse(false, 'Fehler beim Speichern', output);
    }

    // Send notification (async - don't wait)
    try {
      sendNotification(leadData);
    } catch (notifError) {
      Logger.log('Notification error: ' + notifError.message);
      // Don't fail the request if notification fails
    }

    // Success response
    return createResponse(true, 'Lead erfolgreich erfasst', output, {
      lead_id: leadId
    });

  } catch (error) {
    Logger.log('Error in doPost: ' + error.message);
    Logger.log('Stack: ' + error.stack);

    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    return createResponse(false, 'Interner Serverfehler', output);
  }
}

// ==========================================
// HANDLE GET Requests (Health Check)
// ==========================================

function doGet(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  return createResponse(true, 'RS Finance Lead API aktiv', output, {
    version: '1.0',
    timestamp: new Date().toISOString()
  });
}

// ==========================================
// SAVE LEAD TO GOOGLE SHEET
// ==========================================

function saveLead(leadData) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID)
                                .getSheetByName(CONFIG.SHEET_LEADS);

    if (!sheet) {
      throw new Error('Sheet "' + CONFIG.SHEET_LEADS + '" nicht gefunden');
    }

    // Prepare row data (must match column order)
    const rowData = [
      leadData.timestamp,
      leadData.lead_id,
      leadData.vorname,
      leadData.nachname,
      leadData.email,
      leadData.telefon,
      leadData.finanzierungsart,
      leadData.objektwert,
      leadData.eigenkapital,
      leadData.wunschzeitpunkt,
      leadData.quelle,
      leadData.status,
      leadData.nachricht
    ];

    // Append row
    sheet.appendRow(rowData);

    Logger.log('Lead saved: ' + leadData.lead_id);
    return { success: true };

  } catch (error) {
    Logger.log('Error saving lead: ' + error.message);
    return { success: false, error: error.message };
  }
}

// ==========================================
// GENERATE UNIQUE LEAD ID
// ==========================================

function generateLeadId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `LD-${year}-${month}${day}-${random}`;
}

// ==========================================
// VALIDATION
// ==========================================

function validateLeadData(data) {
  // Check required fields
  const required = ['firstName', 'lastName', 'email', 'phone', 'financingType'];

  for (let field of required) {
    if (!data[field] || data[field].trim() === '') {
      return {
        valid: false,
        error: `Pflichtfeld fehlt: ${field}`
      };
    }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return {
      valid: false,
      error: 'Ungültige E-Mail-Adresse'
    };
  }

  // Validate phone (basic check)
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
// SECURITY
// ==========================================

function isAllowedOrigin(origin) {
  if (!origin) return true; // Allow if no origin header (testing)
  return CONFIG.ALLOWED_ORIGINS.some(allowed => origin.includes(allowed));
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return String(input);

  // Remove potential XSS/injection attempts
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .substring(0, 500); // Max 500 chars
}

// ==========================================
// RATE LIMITING (Simple In-Memory)
// ==========================================

const rateLimitCache = {};

function checkRateLimit(identifier) {
  const now = Date.now();
  const key = identifier;

  if (!rateLimitCache[key]) {
    rateLimitCache[key] = { count: 1, resetTime: now + CONFIG.RATE_LIMIT_WINDOW };
    return true;
  }

  // Reset if window expired
  if (now > rateLimitCache[key].resetTime) {
    rateLimitCache[key] = { count: 1, resetTime: now + CONFIG.RATE_LIMIT_WINDOW };
    return true;
  }

  // Increment count
  rateLimitCache[key].count++;

  // Check limit
  return rateLimitCache[key].count <= CONFIG.RATE_LIMIT_MAX;
}

// ==========================================
// HELPER: Create JSON Response
// ==========================================

function createResponse(success, message, output, data = null) {
  const response = {
    success: success,
    message: message,
    timestamp: new Date().toISOString()
  };

  if (data) {
    response.data = data;
  }

  output.setContent(JSON.stringify(response));
  return output;
}

// ==========================================
// TEST FUNCTIONS (Run manually)
// ==========================================

function testSaveLead() {
  const testData = {
    timestamp: new Date(),
    lead_id: generateLeadId(),
    vorname: 'Test',
    nachname: 'Kunde',
    email: 'test@example.com',
    telefon: '+43 664 1234567',
    finanzierungsart: 'Immobilienkauf',
    objektwert: 350000,
    eigenkapital: 70000,
    wunschzeitpunkt: 'Innerhalb 3 Monate',
    quelle: 'Funnel',
    status: 'NEU',
    nachricht: 'Test-Nachricht'
  };

  const result = saveLead(testData);
  Logger.log('Test result: ' + JSON.stringify(result));
}

function testGenerateLeadId() {
  const leadId = generateLeadId();
  Logger.log('Generated Lead ID: ' + leadId);
}
