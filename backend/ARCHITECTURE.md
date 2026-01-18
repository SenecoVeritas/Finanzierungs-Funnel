# Backend-Architektur: Finanzierungs-Funnel
## Schlankes, DSGVO-konformes Lead-Management-System

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
│              GOOGLE APPS SCRIPT WEB APP                          │
│                  (doPost() Handler)                              │
└────────┬────────────────────────────────────────┬───────────────┘
         │                                        │
         │ Schreibt Lead                          │ Sendet Benachrichtigung
         ▼                                        ▼
┌──────────────────────┐              ┌─────────────────────────┐
│  GOOGLE SHEET #1     │              │  E-MAIL / TELEGRAM      │
│  "Leads_raw"         │              │  Notification Service   │
│                      │              └─────────────────────────┘
│  - timestamp         │
│  - vorname           │
│  - nachname          │              ┌─────────────────────────┐
│  - email             │              │   GOOGLE SHEET #2       │
│  - telefon           │◄─────────────│   "Qualifizierung"      │
│  - finanzierungsart  │  Manual      │                         │
│  - objektwert        │  Update      │   - lead_id             │
│  - eigenkapital      │  by          │   - status              │
│  - wunschzeitpunkt   │  Callpartner │   - kurzbewertung       │
│  - quelle            │              │   - empfehlung          │
│  - status            │              │   - kommentar_kurz      │
│  - lead_id           │              └─────────────────────────┘
└──────────────────────┘
         │
         │ Trigger bei Status = "QUALIFIZIERT"
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     APPS SCRIPT TRIGGER                          │
│         E-Mail an RS Finance mit Lead-Details                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Datenschutz-Prinzipien

### ✅ Erlaubt (Lead-Generierung & Vorqualifizierung)
- Kontaktdaten (Name, E-Mail, Telefon)
- Finanzierungsabsicht (Art, Betrag, Zeitpunkt)
- Objektwert, Eigenkapital (grobe Angaben)
- Qualifizierungsstatus

### ❌ VERBOTEN (nur RS Finance)
- Ausweisdokumente
- Kontoauszüge
- Kreditverträge
- Bonitätsdaten (SCHUFA, KSV)
- Gehaltsnachweise

---

## 📊 Google Sheets Struktur

### Sheet 1: `Leads_raw`

| Spalte             | Typ      | Beschreibung                          | Beispiel                    |
|--------------------|----------|---------------------------------------|-----------------------------|
| timestamp          | DateTime | Automatisch (NOW())                   | 2026-01-18 14:32:15         |
| lead_id            | String   | Eindeutige ID (UUID)                  | LD-2026-0118-A3F9           |
| vorname            | String   | Vorname                               | Alexander                   |
| nachname           | String   | Nachname                              | Müller                      |
| email              | String   | E-Mail-Adresse                        | a.mueller@example.com       |
| telefon            | String   | Telefonnummer                         | +43 664 1234567             |
| finanzierungsart   | String   | Immobilienkauf/Umschuldung/etc.       | Immobilienkauf              |
| objektwert         | Number   | Objektwert in EUR                     | 350000                      |
| eigenkapital       | Number   | Eigenkapital in EUR                   | 70000                       |
| wunschzeitpunkt    | String   | Zeitpunkt der Finanzierung            | Innerhalb 3 Monate          |
| quelle             | String   | Traffic-Quelle                        | Funnel                      |
| status             | String   | NEU / KONTAKTIERT / QUALIFIZIERT      | NEU                         |
| nachricht          | String   | Optional: Freitext vom Kunden         | Ich interessiere mich...    |

### Sheet 2: `Qualifizierung`

| Spalte           | Typ      | Beschreibung                          | Beispiel                    |
|------------------|----------|---------------------------------------|-----------------------------|
| lead_id          | String   | Referenz zu Sheet 1                   | LD-2026-0118-A3F9           |
| bearbeiter       | String   | Name des Callpartners                 | Sarah K.                    |
| status           | String   | KONTAKTIERT / QUALIFIZIERT / ABGELEHNT| QUALIFIZIERT                |
| kurzbewertung    | String   | Zusammenfassung des Gesprächs         | Solventer Kunde, gute Bonität|
| empfehlung       | String   | JA / NEIN                             | JA                          |
| kommentar_kurz   | String   | Zusätzliche Notizen                   | Objektbesichtigung geplant  |
| timestamp_quali  | DateTime | Zeitpunkt der Qualifizierung          | 2026-01-18 15:45:00         |

---

## 🔧 Technische Komponenten

### 1. Google Apps Script: Lead-Erfassung (`Code.gs`)

**Endpoint:** `https://script.google.com/macros/s/{SCRIPT_ID}/exec`

**Funktionen:**
- `doPost(e)` - Empfängt Funnel-Daten
- `saveLead(data)` - Schreibt in Sheet "Leads_raw"
- `generateLeadId()` - Erstellt eindeutige Lead-ID
- `sendNotification(leadData)` - Sendet Benachrichtigung

**Sicherheit:**
- CORS-Header für Funnel-Domain
- Input-Validierung (E-Mail, Telefon)
- Rate-Limiting (max. 1 Request/Sekunde pro IP)

### 2. Google Apps Script: Benachrichtigungen (`Notifications.gs`)

**Optionen:**
- **E-Mail** (MailApp.sendEmail)
- **Telegram** (UrlFetchApp mit Telegram Bot API)
- **Slack** (Webhook)

**Trigger:**
- Sofort nach Lead-Eintrag
- Enthält: Vorname, Telefon, Finanzierungsart, Lead-ID

### 3. Google Apps Script: Qualifizierungs-Trigger (`StatusTrigger.gs`)

**Auslöser:**
- onEdit() Trigger auf Sheet "Qualifizierung"
- Prüft: Wenn Status = "QUALIFIZIERT"

**Aktion:**
- Sendet E-Mail an RS Finance
- Enthält: Lead-Details + Qualifizierungszusammenfassung

---

## 🚀 Implementierungsschritte

### Phase 1: Google Sheets Setup
1. Erstelle Google Sheet mit 2 Tabs
2. Konfiguriere Spalten laut Tabelle oben
3. Setze Berechtigungen (View/Edit-Rechte für Callpartner)

### Phase 2: Apps Script - Lead-Erfassung
1. Erstelle Apps Script Projekt
2. Implementiere `doPost()` Handler
3. Deploye als Web App (Execute as: Me, Who has access: Anyone)

### Phase 3: Apps Script - Benachrichtigungen
1. Richte E-Mail-Template ein
2. Optional: Telegram Bot erstellen
3. Teste Benachrichtigungen

### Phase 4: Apps Script - Status-Trigger
1. Implementiere onEdit() Trigger
2. Erstelle E-Mail-Template für RS Finance
3. Teste Übergabe-Flow

### Phase 5: Frontend-Integration
1. Update `script.js`: submitForm() Funktion
2. Füge Fetch-Call zu Apps Script Web App hinzu
3. Error-Handling & Loading-States

### Phase 6: Testing & DSGVO
1. End-to-End-Test durchführen
2. Datenschutzerklärung aktualisieren
3. Auftragsverarbeitungsvertrag (AVV) mit Google prüfen

---

## 📋 Berechtigungsmatrix

| Rolle          | Leads_raw | Qualifizierung | RS Finance E-Mail |
|----------------|-----------|----------------|-------------------|
| Apps Script    | ✅ Write  | ❌ No Access   | ✅ Send           |
| Callpartner    | 👁️ View   | ✅ Edit        | ❌ No Access      |
| Nico Nadolph   | ✅ Edit   | 👁️ View        | ❌ No Access      |
| RS Finance     | ❌ No     | ❌ No          | ✅ Receive        |

---

## 🔒 DSGVO-Compliance

### Rechtsgrundlage
- **Art. 6 Abs. 1 lit. b DSGVO** - Vertragsanbahnung
- **Art. 6 Abs. 1 lit. a DSGVO** - Einwilligung (Marketing-Checkbox)

### Datenspeicherung
- **Speicherort:** Google Sheets (EU-Server, wenn Google Workspace EU konfiguriert)
- **Aufbewahrungsfrist:** 12 Monate (danach Löschung)
- **Zugriff:** Nur autorisierte Personen

### Betroffenenrechte
- **Auskunft:** Lead kann eigene Daten anfragen
- **Löschung:** Lead-Zeile wird gelöscht
- **Berichtigung:** Manuelle Korrektur in Sheet

### AVV (Auftragsverarbeitungsvertrag)
- Google Workspace: AVV ist standardmäßig inkludiert
- [Google Cloud Data Processing Addendum](https://cloud.google.com/terms/data-processing-addendum)

---

## 🎯 Success Metrics

- **Lead-Erfassungsrate:** > 95%
- **Benachrichtigungs-Latenz:** < 30 Sekunden
- **Qualifizierungszeit:** < 24 Stunden
- **System-Uptime:** > 99.5%

---

## 🛠️ Wartung & Skalierung

### Wartungsarm
- Keine Server zu verwalten
- Automatische Google-Updates
- Kein Datenbank-Management

### Skalierbar
- Google Apps Script: 20.000 Requests/Tag (kostenlos)
- Google Sheets: 10 Millionen Zellen
- Bei > 100 Leads/Tag: Migration zu Google Cloud Run + Firestore

---

## 📞 Support-Kontakte

- **Nico Nadolph:** nico@nadolph.at
- **RS Finance:** office@rs-finance.at
- **Google Workspace Support:** [support.google.com](https://support.google.com)

---

**Version:** 1.0
**Datum:** 2026-01-18
**Autor:** Claude Code (AI-Assistant)
**Status:** Implementierung bereit
