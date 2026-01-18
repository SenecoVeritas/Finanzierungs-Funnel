// ==========================================
// RS Finance Funnel - Status Trigger
// Automatically notify RS Finance when lead is qualified
// ==========================================

// ==========================================
// ON EDIT TRIGGER (Auto-runs when sheet edited)
// ==========================================

/**
 * This function needs to be set up as an installable trigger:
 * 1. In Apps Script Editor: Triggers (clock icon in left sidebar)
 * 2. Add Trigger: onQualificationEdit, From spreadsheet, On edit
 */
function onQualificationEdit(e) {
  try {
    // Get edited sheet
    const sheet = e.source.getActiveSheet();

    // Only run for "Qualifizierung" sheet
    if (sheet.getName() !== CONFIG.SHEET_QUALI) {
      return;
    }

    // Get edited range
    const range = e.range;
    const row = range.getRow();
    const col = range.getColumn();

    // Get column headers (row 1)
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const statusCol = headers.indexOf('status') + 1;

    // Only trigger if "status" column was edited
    if (col !== statusCol || row === 1) {
      return; // Header row or wrong column
    }

    // Get the new status value
    const newStatus = range.getValue();

    // Only proceed if status is "QUALIFIZIERT"
    if (newStatus.toUpperCase() !== 'QUALIFIZIERT') {
      return;
    }

    // Get lead data from this row
    const rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
    const leadData = parseQualificationRow(headers, rowData);

    // Check if RS Finance was already notified (avoid duplicate emails)
    const notifiedCol = headers.indexOf('rs_notified') + 1;
    if (notifiedCol > 0) {
      const alreadyNotified = sheet.getRange(row, notifiedCol).getValue();
      if (alreadyNotified === 'JA' || alreadyNotified === true) {
        Logger.log('RS Finance already notified for: ' + leadData.lead_id);
        return;
      }
    }

    // Get original lead data from Leads_raw sheet
    const originalLead = getOriginalLeadData(leadData.lead_id);
    if (!originalLead) {
      Logger.log('Original lead not found: ' + leadData.lead_id);
      return;
    }

    // Send notification to RS Finance
    const emailSent = notifyRSFinance(originalLead, leadData);

    // Mark as notified (if column exists)
    if (emailSent && notifiedCol > 0) {
      sheet.getRange(row, notifiedCol).setValue('JA');
      sheet.getRange(row, notifiedCol + 1).setValue(new Date()); // timestamp
    }

    Logger.log('RS Finance notified for qualified lead: ' + leadData.lead_id);

  } catch (error) {
    Logger.log('Error in onQualificationEdit: ' + error.message);
    Logger.log('Stack: ' + error.stack);
  }
}

// ==========================================
// GET ORIGINAL LEAD DATA
// ==========================================

function getOriginalLeadData(leadId) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID)
                                .getSheetByName(CONFIG.SHEET_LEADS);

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const leadIdCol = headers.indexOf('lead_id');

    // Find row with matching lead_id
    for (let i = 1; i < data.length; i++) {
      if (data[i][leadIdCol] === leadId) {
        return parseLeadRow(headers, data[i]);
      }
    }

    return null;

  } catch (error) {
    Logger.log('Error getting original lead: ' + error.message);
    return null;
  }
}

// ==========================================
// PARSE ROW DATA
// ==========================================

function parseLeadRow(headers, row) {
  const data = {};
  headers.forEach((header, index) => {
    data[header] = row[index];
  });
  return data;
}

function parseQualificationRow(headers, row) {
  const data = {};
  headers.forEach((header, index) => {
    data[header] = row[index];
  });
  return data;
}

// ==========================================
// NOTIFY RS FINANCE
// ==========================================

function notifyRSFinance(originalLead, qualificationData) {
  try {
    const subject = `✅ Qualifizierter Lead: ${originalLead.vorname} ${originalLead.nachname}`;
    const htmlBody = createRSFinanceEmailTemplate(originalLead, qualificationData);

    MailApp.sendEmail({
      to: CONFIG.RS_FINANCE_EMAIL,
      subject: subject,
      htmlBody: htmlBody,
      replyTo: originalLead.email
    });

    Logger.log('RS Finance notification sent to: ' + CONFIG.RS_FINANCE_EMAIL);
    return true;

  } catch (error) {
    Logger.log('Error notifying RS Finance: ' + error.message);
    return false;
  }
}

// ==========================================
// RS FINANCE E-MAIL TEMPLATE
// ==========================================

function createRSFinanceEmailTemplate(originalLead, qualificationData) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 700px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #28a745 0%, #218838 100%);
      color: white;
      padding: 30px 20px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
    }
    .content {
      background: #f8f9fa;
      padding: 30px 20px;
      border-radius: 0 0 8px 8px;
    }
    .info-box {
      background: white;
      border-left: 4px solid #28a745;
      padding: 20px;
      margin: 15px 0;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .info-row {
      margin: 12px 0;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #e9ecef;
      padding-bottom: 8px;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .label {
      font-weight: 600;
      color: #495057;
      min-width: 180px;
    }
    .value {
      color: #212529;
      flex: 1;
      text-align: right;
      font-weight: 500;
    }
    .qualification-box {
      background: #d4edda;
      border: 2px solid #28a745;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .qualification-box h3 {
      margin-top: 0;
      color: #155724;
    }
    .cta-section {
      background: white;
      padding: 20px;
      text-align: center;
      border-radius: 8px;
      margin: 20px 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .cta-button {
      display: inline-block;
      background: #28a745;
      color: white;
      padding: 15px 40px;
      text-decoration: none;
      border-radius: 6px;
      margin: 10px;
      font-weight: 600;
      font-size: 16px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6c757d;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>✅ Qualifizierter Finanzierungs-Lead</h1>
    <p style="margin: 10px 0 0 0; font-size: 14px;">
      Vorqualifizierung abgeschlossen – bereit für Finanzberatung
    </p>
  </div>

  <div class="content">
    <div class="qualification-box">
      <h3>🎯 Qualifizierungsergebnis</h3>
      <p><strong>Empfehlung:</strong> ${qualificationData.empfehlung || 'JA'}</p>
      <p><strong>Bewertung:</strong> ${qualificationData.kurzbewertung || 'Keine Bewertung vorhanden'}</p>
      ${qualificationData.kommentar_kurz ? `<p><strong>Kommentar:</strong> ${qualificationData.kommentar_kurz}</p>` : ''}
      <p style="font-size: 12px; color: #666; margin-top: 15px;">
        Qualifiziert von: ${qualificationData.bearbeiter || 'System'} am
        ${qualificationData.timestamp_quali ? Utilities.formatDate(new Date(qualificationData.timestamp_quali), 'Europe/Vienna', 'dd.MM.yyyy HH:mm') : 'N/A'}
      </p>
    </div>

    <div class="info-box">
      <h3 style="margin-top: 0; color: #28a745;">👤 Kundendaten</h3>
      <div class="info-row">
        <span class="label">Name:</span>
        <span class="value">${originalLead.vorname} ${originalLead.nachname}</span>
      </div>
      <div class="info-row">
        <span class="label">Telefon:</span>
        <span class="value"><strong>${originalLead.telefon}</strong></span>
      </div>
      <div class="info-row">
        <span class="label">E-Mail:</span>
        <span class="value">${originalLead.email}</span>
      </div>
      <div class="info-row">
        <span class="label">Lead-ID:</span>
        <span class="value"><code>${originalLead.lead_id}</code></span>
      </div>
    </div>

    <div class="info-box">
      <h3 style="margin-top: 0; color: #28a745;">💰 Finanzierungsvorhaben</h3>
      <div class="info-row">
        <span class="label">Finanzierungsart:</span>
        <span class="value"><strong>${originalLead.finanzierungsart}</strong></span>
      </div>
      <div class="info-row">
        <span class="label">Objektwert:</span>
        <span class="value">${formatCurrency(originalLead.objektwert)}</span>
      </div>
      <div class="info-row">
        <span class="label">Eigenkapital:</span>
        <span class="value">${formatCurrency(originalLead.eigenkapital)}</span>
      </div>
      <div class="info-row">
        <span class="label">Finanzierungsbedarf:</span>
        <span class="value"><strong>${formatCurrency(originalLead.objektwert - originalLead.eigenkapital)}</strong></span>
      </div>
      <div class="info-row">
        <span class="label">Eigenkapitalquote:</span>
        <span class="value">${Math.round((originalLead.eigenkapital / originalLead.objektwert) * 100)}%</span>
      </div>
      <div class="info-row">
        <span class="label">Wunschzeitpunkt:</span>
        <span class="value">${originalLead.wunschzeitpunkt}</span>
      </div>
    </div>

    ${originalLead.nachricht ? `
    <div class="info-box">
      <h3 style="margin-top: 0; color: #28a745;">💬 Kundennachricht</h3>
      <p style="margin: 0; font-style: italic; color: #495057;">"${originalLead.nachricht}"</p>
    </div>
    ` : ''}

    <div class="cta-section">
      <h3 style="margin-top: 0;">📞 Nächste Schritte</h3>
      <p>Dieser Lead wurde vorqualifiziert und wartet auf Ihre Finanzberatung.</p>
      <a href="tel:${originalLead.telefon.replace(/\s/g, '')}"
         class="cta-button"
         style="color: white;">
        📞 Kunde anrufen
      </a>
      <a href="mailto:${originalLead.email}"
         class="cta-button"
         style="color: white; background: #0056b3;">
        📧 E-Mail senden
      </a>
    </div>

    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0;">
      <strong>⚠️ Wichtig:</strong><br>
      Die Dokumentensammlung (Ausweis, Kontoauszüge, etc.) erfolgt ausschließlich über Ihre sicheren Systeme bei RS Finance.
      Der Funnel-Betreiber hat keinen Zugriff auf Kundendokumente.
    </div>
  </div>

  <div class="footer">
    <p><strong>RS Finance - Finanzierungs-Funnel</strong></p>
    <p>Diese E-Mail wurde automatisch generiert, wenn ein Lead den Status "QUALIFIZIERT" erhält.</p>
    <p>Lead erfasst am: ${Utilities.formatDate(new Date(originalLead.timestamp), 'Europe/Vienna', 'dd.MM.yyyy HH:mm')} Uhr</p>
  </div>
</body>
</html>
  `;
}

// ==========================================
// TEST FUNCTION
// ==========================================

function testNotifyRSFinance() {
  const testOriginalLead = {
    timestamp: new Date(),
    lead_id: 'LD-TEST-12345',
    vorname: 'Maria',
    nachname: 'Schmidt',
    email: 'maria@example.com',
    telefon: '+43 664 9876543',
    finanzierungsart: 'Immobilienkauf',
    objektwert: 450000,
    eigenkapital: 100000,
    wunschzeitpunkt: 'Innerhalb 6 Monate',
    nachricht: 'Ich suche eine Finanzierung für mein Eigenheim.'
  };

  const testQualification = {
    lead_id: 'LD-TEST-12345',
    bearbeiter: 'Sarah K.',
    status: 'QUALIFIZIERT',
    kurzbewertung: 'Sehr gute Bonität, festes Einkommen, keine negativen Einträge',
    empfehlung: 'JA',
    kommentar_kurz: 'Kunde wirkt sehr seriös und gut vorbereitet',
    timestamp_quali: new Date()
  };

  notifyRSFinance(testOriginalLead, testQualification);
}

// ==========================================
// MANUAL SETUP HELPER
// ==========================================

/**
 * Run this function once to create the trigger automatically
 * (Alternative to manual trigger setup in UI)
 */
function setupQualificationTrigger() {
  // Delete existing triggers to avoid duplicates
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'onQualificationEdit') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create new trigger
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  ScriptApp.newTrigger('onQualificationEdit')
    .forSpreadsheet(spreadsheet)
    .onEdit()
    .create();

  Logger.log('Qualification trigger created successfully');
}
