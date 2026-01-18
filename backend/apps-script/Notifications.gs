// ==========================================
// RS Finance Funnel - Notification System
// Send notifications on new leads
// ==========================================

// ==========================================
// SEND NOTIFICATION (Main Function)
// ==========================================

function sendNotification(leadData) {
  try {
    // Send E-Mail notification
    sendEmailNotification(leadData);

    // Send Telegram notification (if enabled)
    if (CONFIG.TELEGRAM_ENABLED) {
      sendTelegramNotification(leadData);
    }

    Logger.log('Notification sent for lead: ' + leadData.lead_id);
    return true;

  } catch (error) {
    Logger.log('Error sending notification: ' + error.message);
    return false;
  }
}

// ==========================================
// E-MAIL NOTIFICATION
// ==========================================

function sendEmailNotification(leadData) {
  try {
    const subject = `🔔 Neuer Lead: ${leadData.vorname} ${leadData.nachname} (${leadData.finanzierungsart})`;

    const htmlBody = createEmailTemplate(leadData);

    MailApp.sendEmail({
      to: CONFIG.NOTIFICATION_EMAIL,
      subject: subject,
      htmlBody: htmlBody,
      noReply: true
    });

    Logger.log('E-Mail sent to: ' + CONFIG.NOTIFICATION_EMAIL);
    return true;

  } catch (error) {
    Logger.log('Error sending email: ' + error.message);
    return false;
  }
}

// ==========================================
// E-MAIL TEMPLATE (HTML)
// ==========================================

function createEmailTemplate(leadData) {
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
    .header h1 {
      margin: 0;
      font-size: 24px;
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
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .info-row {
      margin: 10px 0;
      display: flex;
      justify-content: space-between;
    }
    .label {
      font-weight: 600;
      color: #587592;
      min-width: 150px;
    }
    .value {
      color: #2c3e50;
      flex: 1;
      text-align: right;
    }
    .cta-button {
      display: inline-block;
      background: #587592;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: 600;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #7f8c8d;
      font-size: 12px;
    }
    .highlight {
      background: #fff3cd;
      padding: 15px;
      border-radius: 6px;
      margin: 15px 0;
      border-left: 4px solid #ffc107;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎯 Neuer Finanzierungs-Lead</h1>
  </div>

  <div class="content">
    <div class="highlight">
      <strong>⏰ Sofortige Kontaktaufnahme empfohlen!</strong><br>
      Lead-ID: <strong>${leadData.lead_id}</strong>
    </div>

    <div class="info-box">
      <h3 style="margin-top: 0; color: #587592;">👤 Kontaktdaten</h3>
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
      <h3 style="margin-top: 0; color: #587592;">💰 Finanzierungsdetails</h3>
      <div class="info-row">
        <span class="label">Finanzierungsart:</span>
        <span class="value"><strong>${leadData.finanzierungsart}</strong></span>
      </div>
      <div class="info-row">
        <span class="label">Objektwert:</span>
        <span class="value">${formatCurrency(leadData.objektwert)}</span>
      </div>
      <div class="info-row">
        <span class="label">Eigenkapital:</span>
        <span class="value">${formatCurrency(leadData.eigenkapital)}</span>
      </div>
      <div class="info-row">
        <span class="label">Wunschzeitpunkt:</span>
        <span class="value">${leadData.wunschzeitpunkt}</span>
      </div>
    </div>

    ${leadData.nachricht ? `
    <div class="info-box">
      <h3 style="margin-top: 0; color: #587592;">💬 Nachricht</h3>
      <p style="margin: 0; font-style: italic;">"${leadData.nachricht}"</p>
    </div>
    ` : ''}

    <div style="text-align: center;">
      <a href="https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}"
         class="cta-button"
         style="color: white;">
        📊 Lead in Google Sheet öffnen
      </a>
    </div>

    <div style="margin-top: 20px; padding: 15px; background: #e8f4f8; border-radius: 6px;">
      <strong>📋 Nächste Schritte:</strong>
      <ol style="margin: 10px 0;">
        <li>Lead innerhalb von 15 Minuten anrufen</li>
        <li>Qualifizierungsgespräch durchführen</li>
        <li>Status im Sheet "Qualifizierung" aktualisieren</li>
      </ol>
    </div>
  </div>

  <div class="footer">
    <p>Diese E-Mail wurde automatisch vom RS Finance Funnel-System generiert.</p>
    <p>Lead erfasst am: ${Utilities.formatDate(leadData.timestamp, 'Europe/Vienna', 'dd.MM.yyyy HH:mm')} Uhr</p>
  </div>
</body>
</html>
  `;
}

// ==========================================
// TELEGRAM NOTIFICATION
// ==========================================

function sendTelegramNotification(leadData) {
  try {
    const message = createTelegramMessage(leadData);
    const url = `https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`;

    const payload = {
      chat_id: CONFIG.TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    };

    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());

    if (result.ok) {
      Logger.log('Telegram notification sent');
      return true;
    } else {
      Logger.log('Telegram error: ' + JSON.stringify(result));
      return false;
    }

  } catch (error) {
    Logger.log('Error sending Telegram: ' + error.message);
    return false;
  }
}

// ==========================================
// TELEGRAM MESSAGE TEMPLATE
// ==========================================

function createTelegramMessage(leadData) {
  return `
🎯 <b>NEUER LEAD</b>

👤 <b>${leadData.vorname} ${leadData.nachname}</b>
📞 ${leadData.telefon}
📧 ${leadData.email}

💰 <b>Finanzierung</b>
Art: ${leadData.finanzierungsart}
Objektwert: ${formatCurrency(leadData.objektwert)}
Eigenkapital: ${formatCurrency(leadData.eigenkapital)}

🆔 Lead-ID: <code>${leadData.lead_id}</code>
⏰ ${Utilities.formatDate(leadData.timestamp, 'Europe/Vienna', 'dd.MM.yyyy HH:mm')}

➡️ <a href="https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}">Sheet öffnen</a>
  `.trim();
}

// ==========================================
// HELPER: Format Currency
// ==========================================

function formatCurrency(amount) {
  return new Intl.NumberFormat('de-AT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// ==========================================
// TEST FUNCTION
// ==========================================

function testSendNotification() {
  const testLead = {
    timestamp: new Date(),
    lead_id: 'LD-TEST-12345',
    vorname: 'Max',
    nachname: 'Mustermann',
    email: 'max@example.com',
    telefon: '+43 664 1234567',
    finanzierungsart: 'Immobilienkauf',
    objektwert: 350000,
    eigenkapital: 70000,
    wunschzeitpunkt: 'Innerhalb 3 Monate',
    quelle: 'Funnel',
    status: 'NEU',
    nachricht: 'Ich suche eine günstige Finanzierung für mein Traumhaus.'
  };

  sendNotification(testLead);
}
