# 🚀 RS Finance Funnel - Airtable Backend

**Schlankes, DSGVO-konformes Lead-Management mit Airtable**

---

## 📖 Was ist das?

Das neue Backend-System basiert vollständig auf **Airtable** + **Serverless Functions** (Vercel).

**Ersetzt:** Google Sheets + Google Apps Script

**Vorteile:**
- ✅ Modernere UI für Callpartner
- ✅ Bessere API-Stabilität
- ✅ Native Relationen zwischen Tables
- ✅ Eingebaute Automations
- ✅ EU-Server wählbar (DSGVO)
- ✅ Kein Apps Script mehr nötig

---

## 🏗️ Architektur

```
Frontend (Funnel)
     ↓
Vercel Serverless Function (/api/submit-lead.js)
     ↓
Airtable API
     ↓
Airtable Base (Leads_raw + Qualifizierung)
     ↓
Airtable Automation
     ↓
E-Mail an RS Finance
```

---

## 📂 Datei-Struktur

```
backend-airtable/
├── ARCHITECTURE.md              # System-Design & Datenflüsse
├── DEPLOYMENT-AIRTABLE.md       # Schritt-für-Schritt Setup-Guide
└── README.md                    # Diese Datei

api/
└── submit-lead.js               # Serverless Webhook (Vercel Function)

package.json                     # Dependencies (airtable)
.env.example                     # Environment Variables Template
script.js                        # Frontend (angepasst für neues Backend)
```

---

## 🚦 Quick Start

### 1. Airtable Base erstellen

1. Account: [airtable.com](https://airtable.com)
2. Neue Base: `RS Finance - Lead Management`
3. Tables: `Leads_raw` & `Qualifizierung`
4. Felder konfigurieren (siehe DEPLOYMENT-AIRTABLE.md)

### 2. API Keys generieren

- **Airtable API Key:** [airtable.com/account](https://airtable.com/account)
- **Resend API Key:** [resend.com/api-keys](https://resend.com/api-keys)

### 3. Environment Variables setzen

In Vercel → Settings → Environment Variables:

```
AIRTABLE_API_KEY=keyXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
RESEND_API_KEY=re_XXXXXXXXXXXXXXXX
NOTIFICATION_EMAIL=callpartner@example.com
ALLOWED_ORIGINS=https://nadolph.com
```

### 4. Deploy

```bash
git add .
git commit -m "Airtable Backend integriert"
git push
```

Vercel deployed automatisch.

### 5. Testen

Funnel ausfüllen → Lead in Airtable → E-Mail erhalten ✅

---

## 📊 Airtable Tables

### Table 1: `Leads_raw`

| Feld             | Typ          | Beschreibung          |
|------------------|--------------|-----------------------|
| lead_id          | Text         | Eindeutige Lead-ID    |
| created_at       | Created time | Automatisch           |
| vorname          | Text         | Vorname               |
| nachname         | Text         | Nachname              |
| email            | Email        | E-Mail                |
| telefon          | Phone        | Telefonnummer         |
| finanzierungsart | Single select| Art der Finanzierung  |
| objektwert       | Currency     | Objektwert (EUR)      |
| eigenkapital     | Currency     | Eigenkapital (EUR)    |
| status           | Single select| NEU/KONTAKTIERT/...   |

### Table 2: `Qualifizierung`

| Feld            | Typ            | Beschreibung                    |
|-----------------|----------------|---------------------------------|
| lead_id         | Link to record | Verknüpfung zu Leads_raw        |
| status          | Single select  | QUALIFIZIERT/NICHT GEEIGNET     |
| kurzbewertung   | Long text      | Zusammenfassung Qualif.-Gespräch|
| empfehlung      | Single select  | JA/NEIN                         |

---

## 🔔 Benachrichtigungen

### Sofort-Benachrichtigung (bei neuem Lead)

- **Service:** Resend.com
- **Trigger:** Serverless Function nach Airtable-Eintrag
- **Empfänger:** Callpartner
- **Inhalt:** Lead-Details + Airtable-Link

### RS Finance Übergabe (bei Qualifizierung)

- **Service:** Airtable Automation
- **Trigger:** Status = "QUALIFIZIERT"
- **Empfänger:** office@rs-finance.at
- **Inhalt:** Qualifizierte Lead-Details

---

## 🔐 Sicherheit

- ✅ **CORS:** Nur eigene Domain erlaubt
- ✅ **Rate Limiting:** Max 5 Requests/Minute
- ✅ **Input Validation:** E-Mail, Telefon, Required Fields
- ✅ **Sanitization:** XSS-Schutz
- ✅ **API Keys:** In Environment Variables (nicht im Code)

---

## 💰 Kosten

| Service  | Plan  | Preis/Monat | Limit                |
|----------|-------|-------------|----------------------|
| Airtable | Free  | 0 EUR       | 1.200 Records        |
| Vercel   | Hobby | 0 EUR       | 100 GB Bandwidth     |
| Resend   | Free  | 0 EUR       | 3.000 E-Mails/Monat  |
| **TOTAL**|       | **0 EUR**   | Ausreichend für Start|

---

## 📚 Dokumentation

| Dokument                  | Beschreibung                        |
|---------------------------|-------------------------------------|
| ARCHITECTURE.md           | System-Design, Datenflüsse          |
| DEPLOYMENT-AIRTABLE.md    | Schritt-für-Schritt Setup (45 Min) |
| README.md                 | Diese Übersicht                     |

---

## 🚨 Troubleshooting

### Lead wird nicht gespeichert

1. Vercel Logs prüfen: `Logs` → Filter `api/submit-lead`
2. Environment Variables korrekt?
3. Airtable API Key valide?

### Keine E-Mail-Benachrichtigung

1. Resend API Key gesetzt?
2. Domain verifiziert? (Resend Dashboard)
3. Spam-Ordner prüfen

### Airtable Automation läuft nicht

1. Automation aktiviert (grüner Schalter)?
2. Trigger-Bedingungen korrekt?
3. Run History prüfen (Airtable → Automations)

---

## 🔄 Migration von Google Sheets

**Alte Files (nicht mehr benötigt):**
- ❌ `backend/apps-script/*.gs`
- ❌ `backend/ARCHITECTURE.md` (Google-basiert)
- ❌ `backend/DEPLOYMENT.md` (Google-basiert)

**Neue Files:**
- ✅ `backend-airtable/ARCHITECTURE.md`
- ✅ `backend-airtable/DEPLOYMENT-AIRTABLE.md`
- ✅ `api/submit-lead.js`
- ✅ `package.json`

**Frontend-Änderung:**
```javascript
// Vorher (Google Apps Script):
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/.../exec';

// Nachher (Vercel Function):
const WEBHOOK_URL = '/api/submit-lead';
```

---

## ✅ Produktionsreif

**Status:** ✅ Ready for Deployment

**Voraussetzungen erfüllt:**
- Lead-Erfassung über Serverless Function
- Airtable als zentrale Datenbank
- E-Mail-Benachrichtigungen (Resend)
- Automation für RS Finance Übergabe
- DSGVO-konform (EU-Server optional)
- Vollständig dokumentiert

**Nächste Schritte:**
1. Airtable Base erstellen (10 Min)
2. Environment Variables setzen (5 Min)
3. Deployen (automatisch via Vercel)
4. Testen

**Detaillierte Anleitung:** → `DEPLOYMENT-AIRTABLE.md`

---

**Version:** 2.0 (Airtable)
**Letztes Update:** 2026-01-18
**Migration von:** Google Sheets/Apps Script
**Status:** Bereit für Produktion
