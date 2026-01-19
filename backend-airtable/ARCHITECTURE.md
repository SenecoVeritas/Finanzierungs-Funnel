# Backend-Architektur: Airtable + Serverless Webhook
## RS Finance Funnel - Schlankes Lead-Management

---

## 🎯 Systemübersicht

```
┌─────────────────────────────────────────────────────────────────┐
│                      FUNNEL FRONTEND                             │
│                    (rechner.html + script.js)                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS POST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              VERCEL/NETLIFY SERVERLESS FUNCTION                  │
│                  (api/submit-lead.js)                            │
│                                                                  │
│  • Input Validation                                              │
│  • Rate Limiting                                                 │
│  • Lead-ID Generation                                            │
│  • Airtable API Call                                             │
└────────┬────────────────────────────────────────┬───────────────┘
         │                                        │
         │ Schreibt Lead                          │ Sendet Benachrichtigung
         ▼                                        ▼
┌──────────────────────┐              ┌─────────────────────────┐
│  AIRTABLE BASE       │              │  E-MAIL / SLACK         │
│  "RS Finance Leads"  │              │  Notification Service   │
│                      │              └─────────────────────────┘
│  TABLE 1:            │
│  Leads_raw           │              ┌─────────────────────────┐
│  - lead_id           │              │   AIRTABLE TABLE 2      │
│  - created_at        │◄─────────────│   "Qualifizierung"      │
│  - vorname           │  Relation    │                         │
│  - nachname          │  via         │   - lead_id (Link)      │
│  - email             │  lead_id     │   - status              │
│  - telefon           │              │   - kurzbewertung       │
│  - finanzierungsart  │              │   - empfehlung          │
│  - objektwert        │              │   - notizen_kurz        │
│  - eigenkapital      │              └─────────────────────────┘
│  - wunschzeitpunkt   │
│  - quelle            │
│  - status            │
│  - nachricht         │
└──────────────────────┘
         │
         │ Airtable Automation (bei Status = "QUALIFIZIERT")
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     E-MAIL AN RS FINANCE                         │
│         (via Airtable Automation oder Zapier/Make.com)          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technologie-Stack

| Komponente          | Technologie                  | Zweck                                |
|---------------------|------------------------------|--------------------------------------|
| **Datenbank**       | Airtable                     | Lead-Speicherung & Verwaltung        |
| **API Endpoint**    | Vercel/Netlify Function      | Serverless Webhook für Form-Submit   |
| **Notification**    | E-Mail (Resend/SendGrid)     | Sofort-Benachrichtigung bei Lead     |
| **Alternative**     | Slack Webhook                | Team-Benachrichtigung                |
| **Automation**      | Airtable Automation          | RS Finance Übergabe                  |
| **Frontend**        | Unverändert                  | Existing rechner.html + script.js    |

---

## 📊 Airtable Base-Struktur

### Base Name: `RS Finance - Lead Management`

### Table 1: `Leads_raw`

| Feldname          | Typ              | Beschreibung                          | Beispiel                    |
|-------------------|------------------|---------------------------------------|-----------------------------|
| lead_id           | Single line text | Eindeutige Lead-ID (UUID)             | LD-2026-0118-A3F9           |
| created_at        | Created time     | Automatisch (Airtable)                | 2026-01-18 14:32:15         |
| vorname           | Single line text | Vorname                               | Alexander                   |
| nachname          | Single line text | Nachname                              | Müller                      |
| email             | Email            | E-Mail-Adresse                        | a.mueller@example.com       |
| telefon           | Phone number     | Telefonnummer                         | +43 664 1234567             |
| finanzierungsart  | Single select    | Immobilienkauf/Umschuldung/etc.       | Immobilienkauf              |
| objektwert        | Currency (EUR)   | Objektwert in EUR                     | 350000                      |
| eigenkapital      | Currency (EUR)   | Eigenkapital in EUR                   | 70000                       |
| wunschzeitpunkt   | Single select    | Zeitpunkt der Finanzierung            | Innerhalb 3 Monate          |
| quelle            | Single line text | Traffic-Quelle                        | Funnel                      |
| status            | Single select    | NEU / KONTAKTIERT / QUALIFIZIERT      | NEU                         |
| nachricht         | Long text        | Optional: Freitext vom Kunden         | Ich interessiere mich...    |

**Single Select Options:**

- **finanzierungsart**: `Immobilienkauf`, `Umschuldung`, `Sanierung`, `Gewerbefinanzierung`
- **wunschzeitpunkt**: `Innerhalb 1 Monat`, `Innerhalb 3 Monate`, `Innerhalb 6 Monate`, `Über 6 Monate`
- **status**: `NEU`, `KONTAKTIERT`, `QUALIFIZIERT`, `ABGELEHNT`

### Table 2: `Qualifizierung`

| Feldname           | Typ              | Beschreibung                          | Beispiel                    |
|--------------------|------------------|---------------------------------------|-----------------------------|
| lead_id            | Link to record   | Verknüpfung zu Leads_raw              | → Alexander Müller          |
| bearbeiter         | Single line text | Name des Callpartners                 | Sarah K.                    |
| status             | Single select    | KONTAKTIERT / QUALIFIZIERT / ABGELEHNT| QUALIFIZIERT                |
| kurzbewertung      | Long text        | Zusammenfassung des Gesprächs         | Solventer Kunde, gute Bonität|
| empfehlung         | Single select    | JA / NEIN                             | JA                          |
| notizen_kurz       | Long text        | Zusätzliche Notizen                   | Objektbesichtigung geplant  |
| timestamp_quali    | Last modified    | Automatisch (Airtable)                | 2026-01-18 15:45:00         |
| rs_notified        | Checkbox         | RS Finance benachrichtigt?            | ☑                           |

**Single Select Options:**

- **status**: `KONTAKTIERT`, `QUALIFIZIERT`, `NICHT GEEIGNET`
- **empfehlung**: `JA`, `NEIN`

---

## 🌐 Serverless Webhook (Vercel Function)

### Datei: `/api/submit-lead.js`

**Endpoint:** `https://your-domain.com/api/submit-lead`

**Funktionen:**
- Empfängt POST-Request vom Frontend
- Validiert Input-Daten
- Generiert eindeutige Lead-ID
- Erstellt Airtable-Record
- Sendet Benachrichtigung
- Gibt Success/Error zurück

**Security:**
- CORS-Header für eigene Domain
- Rate-Limiting (5 Requests/Minute)
- Input-Sanitization
- API-Key in Environment Variables

---

## 🔔 Benachrichtigungssystem

### Option A: E-Mail (Resend.com - empfohlen)

**Vorteile:**
- Kostenlos bis 3.000 E-Mails/Monat
- Einfache API
- React E-Mail Templates (optional)
- Kein SMTP-Setup nötig

**Ablauf:**
1. Neuer Lead in Airtable
2. Webhook sendet E-Mail via Resend API
3. Empfänger: `callpartner@example.com`
4. Inhalt: Lead-Details + Airtable-Link

### Option B: Slack Webhook

**Vorteile:**
- Echtzeit-Notification im Team-Channel
- Kostenlos
- Einfache Integration

**Ablauf:**
1. Slack Incoming Webhook erstellen
2. Webhook-URL in Environment Variables
3. POST-Request mit Lead-Daten

---

## 🔄 Airtable Automation (RS Finance Übergabe)

### Trigger: Record matches conditions

**Bedingung:**
- Table: `Qualifizierung`
- When: `status` = `QUALIFIZIERT`
- AND: `rs_notified` = `unchecked`

### Action 1: Send Email

**Empfänger:** `office@rs-finance.at`
**Betreff:** `Qualifizierter Lead: {vorname} {nachname}`
**Inhalt:**
```
Neuer qualifizierter Lead:

Name: {vorname} {nachname}
Telefon: {telefon}
E-Mail: {email}

Finanzierung:
Art: {finanzierungsart}
Objektwert: {objektwert} EUR
Eigenkapital: {eigenkapital} EUR

Qualifizierung:
Bewertung: {kurzbewertung}
Empfehlung: {empfehlung}

Airtable-Link: {Link to record}
```

### Action 2: Update Record

**Feld:** `rs_notified` → `checked` ☑

---

## 🔐 Sicherheit & API-Keys

### Environment Variables (Vercel/Netlify)

```bash
AIRTABLE_API_KEY=keyXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
RESEND_API_KEY=re_XXXXXXXXXXXXXXXX
ALLOWED_ORIGINS=https://nadolph.com,https://www.nadolph.com
RATE_LIMIT_MAX=5
```

### Best Practices

- ✅ API-Keys niemals im Code hardcoden
- ✅ `.env` in `.gitignore`
- ✅ Vercel/Netlify Environment Variables nutzen
- ✅ Read-Only API-Keys für Frontend (wenn nötig)
- ✅ CORS nur für eigene Domain
- ✅ Rate-Limiting implementieren

---

## 🚀 Deployment-Flow

### 1. Airtable Setup (10 Min)

1. Account erstellen: [airtable.com](https://airtable.com)
2. Neue Base: `RS Finance - Lead Management`
3. Tables erstellen: `Leads_raw` & `Qualifizierung`
4. Felder konfigurieren (siehe Tabelle oben)
5. API-Key generieren: [airtable.com/account](https://airtable.com/account)
6. Base-ID kopieren (aus URL)

### 2. Serverless Function deployen (15 Min)

1. Code in `/api/submit-lead.js` erstellen
2. `package.json` Dependencies: `airtable`, `@vercel/node`
3. Environment Variables in Vercel/Netlify setzen
4. Deployen
5. Endpoint-URL testen

### 3. Frontend anpassen (5 Min)

1. `script.js` → `WEBHOOK_URL` anpassen
2. Git push
3. Vercel/Netlify auto-deploy

### 4. Airtable Automation einrichten (10 Min)

1. Airtable → Automations → Create
2. Trigger: `Qualifizierung` Status = `QUALIFIZIERT`
3. Action: Send Email to RS Finance
4. Action: Update `rs_notified` to checked

---

## 📊 Datenfluss im Detail

### Lead-Erfassung (Form Submit)

```
1. User füllt Funnel aus → Klick "Angebot anfordern"
2. Frontend: fetch POST zu /api/submit-lead
3. Serverless Function:
   a. Validiert Daten
   b. Generiert lead_id (UUID)
   c. Erstellt Airtable Record (Leads_raw)
   d. Sendet E-Mail-Benachrichtigung (Resend)
   e. Gibt Success zurück
4. Frontend: Zeigt Erfolgsseite (Step 5)
```

### Qualifizierung (Callpartner)

```
1. Callpartner öffnet Airtable
2. Findet Lead in "Leads_raw"
3. Erstellt Eintrag in "Qualifizierung"
   - Verknüpft via lead_id
   - Setzt status, empfehlung, kurzbewertung
4. Speichert
```

### RS Finance Übergabe (Automatisch)

```
1. Airtable Automation erkennt: status = QUALIFIZIERT
2. Sendet E-Mail an RS Finance
3. Setzt rs_notified = checked (verhindert Duplikate)
```

---

## 💰 Kostenübersicht

| Service       | Plan         | Kosten/Monat | Limit                  |
|---------------|--------------|--------------|------------------------|
| Airtable      | Free         | 0 EUR        | 1.200 Records          |
| Airtable      | Plus         | 10 EUR       | 5.000 Records          |
| Vercel        | Hobby        | 0 EUR        | 100 GB Bandwidth       |
| Resend        | Free         | 0 EUR        | 3.000 E-Mails          |
| **TOTAL**     | **Free**     | **0 EUR**    | Ausreichend für Start  |

**Skalierung (bei > 1.000 Leads/Monat):**
- Airtable Plus: 10 EUR/Monat
- Resend Pro: 20 EUR/Monat (50k E-Mails)

---

## 🔒 DSGVO-Compliance

### Airtable als Auftragsverarbeiter

- Airtable bietet **Data Processing Addendum (DPA)**
- Server-Standort: **EU (Frankfurt)** wählbar
- DSGVO-konform bei korrekter Konfiguration

**Setup:**
1. Airtable-Account → Settings → Security
2. Data Residency: **Europe** auswählen
3. DPA unterzeichnen (automatisch verfügbar)

### Datenschutz-Maßnahmen

- ✅ Datenminimierung (nur notwendige Felder)
- ✅ Verschlüsselte Übertragung (HTTPS)
- ✅ Zugriffskontrolle (Airtable Permissions)
- ✅ Löschkonzept (12 Monate)
- ✅ Betroffenenrechte (manuell über Airtable)

---

## 📋 Berechtigungsmatrix

| Rolle          | Leads_raw | Qualifizierung | Serverless Function | Airtable API |
|----------------|-----------|----------------|---------------------|--------------|
| Webhook        | ✅ Create | ❌ No          | ✅ Execute          | ✅ Write     |
| Callpartner    | 👁️ View   | ✅ Edit        | ❌ No               | 👁️ View     |
| Nico Nadolph   | ✅ Edit   | 👁️ View        | ✅ Edit             | ✅ Admin     |
| RS Finance     | ❌ No     | ❌ No          | ❌ No               | ❌ No        |

**RS Finance erhält:**
- E-Mail-Benachrichtigungen (automatisch)
- Keine direkten Airtable-Zugänge
- Kein Zugriff auf Lead-Datenbank

---

## 🎯 Vorteile gegenüber Google Sheets

| Feature              | Google Sheets | Airtable      |
|----------------------|---------------|---------------|
| API-Stabilität       | ⚠️ Mittel     | ✅ Hoch       |
| Rate Limits          | ⚠️ Streng     | ✅ Großzügig  |
| Datentypen           | ⚠️ Basic      | ✅ Erweitert  |
| Automations          | ⚠️ Apps Script| ✅ Native     |
| UI für Callpartner   | ⚠️ Basic      | ✅ Modern     |
| DSGVO EU-Server      | ⚠️ Optional   | ✅ Wählbar    |
| Relationen           | ❌ Keine      | ✅ Native     |
| Webhooks             | ⚠️ Complex    | ✅ Simple     |

---

## 🚦 Nächste Schritte

1. **Airtable Base erstellen** (10 Min)
2. **Serverless Function implementieren** (siehe `/api/submit-lead.js`)
3. **Environment Variables setzen** (Vercel/Netlify)
4. **Frontend anpassen** (`script.js`)
5. **Airtable Automation einrichten**
6. **Testing**

**Detaillierte Anleitung:** → `DEPLOYMENT-AIRTABLE.md`

---

**Version:** 2.0 (Airtable)
**Datum:** 2026-01-18
**Migration von:** Google Sheets/Apps Script
**Status:** Bereit für Implementierung
