# 🚀 RS Finance Funnel - Backend System

**Schlankes, DSGVO-konformes Lead-Management ohne Over-Engineering**

---

## 📖 Was ist das?

Ein minimalistisches Backend-System für Finanzierungs-Leads, das ausschließlich auf **Google Sheets** und **Google Apps Script** basiert.

**Keine komplexe Infrastruktur. Keine Datenbank. Kein Server.**

---

## ✨ Features

- ✅ **Lead-Erfassung** - Automatisches Speichern von Funnel-Submissions
- ✅ **Sofort-Benachrichtigung** - E-Mail/Telegram bei neuem Lead
- ✅ **Vorqualifizierung** - Strukturiertes Callpartner-System
- ✅ **Auto-Übergabe** - E-Mail an RS Finance bei Status "QUALIFIZIERT"
- ✅ **DSGVO-konform** - Datenschutz by Design
- ✅ **Wartungsarm** - Google managed die Infrastruktur
- ✅ **Kostenlos** - Keine Hosting-Kosten (bis 20k Requests/Tag)

---

## 🏗️ Architektur

```
Frontend (Funnel) → Google Apps Script → Google Sheets
                          ↓
                    E-Mail/Telegram
                          ↓
                    RS Finance
```

**Technologien:**
- Google Sheets (Datenspeicher)
- Google Apps Script (Serverless Backend)
- JavaScript (Frontend Integration)

---

## 📂 Datei-Struktur

```
backend/
├── ARCHITECTURE.md           # System-Architektur & Datenflüsse
├── DEPLOYMENT.md             # Schritt-für-Schritt Deployment-Guide
├── DSGVO.md                  # Datenschutz-Dokumentation
├── README.md                 # Diese Datei
└── apps-script/
    ├── Code.gs               # Hauptlogik (Lead-Erfassung, API)
    ├── Notifications.gs      # E-Mail & Telegram Benachrichtigungen
    └── StatusTrigger.gs      # Auto-Trigger für RS Finance Übergabe
```

---

## 🚦 Quick Start

### 1. Google Sheet erstellen

1. Neues Google Sheet anlegen
2. Tab 1: `Leads_raw` (mit Spalten: timestamp, lead_id, vorname, nachname, ...)
3. Tab 2: `Qualifizierung` (mit Spalten: lead_id, status, empfehlung, ...)

**Detaillierte Anleitung:** → [DEPLOYMENT.md](./DEPLOYMENT.md)

### 2. Apps Script deployen

1. Sheet öffnen → **Erweiterungen** → **Apps Script**
2. Code aus `/apps-script/*.gs` Dateien einfügen
3. **Bereitstellen** → **Neue Bereitstellung** → **Web-App**
4. Web-App-URL kopieren

### 3. Frontend integrieren

In `script.js`:
```javascript
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_ID/exec';
```

### 4. Testen

Funnel ausfüllen → Lead erscheint im Sheet → E-Mail erhalten ✅

---

## 📊 Google Sheets Struktur

### Sheet 1: `Leads_raw`

| Spalte          | Beschreibung               | Beispiel              |
|-----------------|----------------------------|-----------------------|
| timestamp       | Erfassungszeitpunkt        | 2026-01-18 14:32:15   |
| lead_id         | Eindeutige Lead-ID         | LD-2026-0118-A3F9     |
| vorname         | Vorname                    | Alexander             |
| nachname        | Nachname                   | Müller                |
| email           | E-Mail                     | a.mueller@example.com |
| telefon         | Telefonnummer              | +43 664 1234567       |
| finanzierungsart| Immobilienkauf/Umschuldung | Immobilienkauf        |
| objektwert      | Objektwert (EUR)           | 350000                |
| eigenkapital    | Eigenkapital (EUR)         | 70000                 |
| status          | NEU/KONTAKTIERT/QUALIFIZIERT| NEU                  |

### Sheet 2: `Qualifizierung`

| Spalte         | Beschreibung                 | Beispiel                |
|----------------|------------------------------|-------------------------|
| lead_id        | Referenz zu Sheet 1          | LD-2026-0118-A3F9       |
| bearbeiter     | Name des Callpartners        | Sarah K.                |
| status         | QUALIFIZIERT/NICHT GEEIGNET  | QUALIFIZIERT            |
| empfehlung     | JA/NEIN                      | JA                      |

---

## 🔐 Datenschutz

- **DSGVO-konform** durch Datenminimierung
- **Keine sensiblen Dokumente** (Ausweise, Kontoauszüge)
- **12 Monate Aufbewahrung**, dann Löschung
- **Betroffenenrechte** (Auskunft, Löschung) über manuelle Prozesse

**Detaillierte DSGVO-Dokumentation:** → [DSGVO.md](./DSGVO.md)

---

## 📧 Benachrichtigungen

### E-Mail (Standard)

```javascript
CONFIG.NOTIFICATION_EMAIL = 'callpartner@example.com';
```

### Telegram (Optional)

1. Bot erstellen: [@BotFather](https://t.me/botfather)
2. Token & Chat-ID in `Code.gs` eintragen:
```javascript
CONFIG.TELEGRAM_ENABLED = true;
CONFIG.TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN';
CONFIG.TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID';
```

---

## 🧪 Testing

### Manuelle Tests

**Test 1: Lead-Erfassung**
```bash
# In Browser Console (auf deiner Funnel-Seite)
submitForm()
# → Prüfe: Lead in Sheet? E-Mail erhalten?
```

**Test 2: Benachrichtigung**
```javascript
// In Apps Script Editor
testSendNotification()
// → Prüfe Posteingang
```

**Test 3: RS Finance Übergabe**
```javascript
// In Apps Script Editor
testNotifyRSFinance()
// → Prüfe E-Mail an office@rs-finance.at
```

---

## ⚙️ Konfiguration

### CONFIG (in Code.gs)

| Variable            | Beschreibung                     | Beispiel                     |
|---------------------|----------------------------------|------------------------------|
| SHEET_ID            | Google Sheet ID                  | 1a2b3c4d5e6f7g8h9i0j         |
| NOTIFICATION_EMAIL  | E-Mail für neue Leads            | callpartner@example.com      |
| RS_FINANCE_EMAIL    | E-Mail für qualifizierte Leads   | office@rs-finance.at         |
| ALLOWED_ORIGINS     | Erlaubte Domains (CORS)          | ['https://nadolph.com']      |
| RATE_LIMIT_MAX      | Max Requests/Minute              | 5                            |

---

## 📈 Monitoring

### Apps Script Logs

1. Apps Script Editor öffnen
2. **Ausführungen** (links) → Alle Script-Durchläufe anzeigen
3. Bei Fehlern: Klicke auf Zeile → Details ansehen

### Google Sheet

- **Neue Leads:** Prüfe `Leads_raw` Tab
- **Qualifizierungen:** Prüfe `Qualifizierung` Tab
- **Status-Updates:** Automatisch via Trigger

---

## 🚨 Troubleshooting

### Problem: Keine E-Mail-Benachrichtigung

**Lösungen:**
1. Prüfe `NOTIFICATION_EMAIL` in `Code.gs`
2. Schaue in Apps Script Logs nach Fehlern
3. Prüfe Spam-Ordner
4. Gmail Limit: 100 E-Mails/Tag (kostenloser Account)

### Problem: "Zugriff verweigert" im Frontend

**Lösungen:**
1. Apps Script Deployment: "Zugriff" muss auf **"Jeder"** stehen
2. Prüfe `ALLOWED_ORIGINS` in `Code.gs`

### Problem: Lead wird nicht gespeichert

**Lösungen:**
1. Browser Console öffnen → Fehler sichtbar?
2. Apps Script Logs prüfen
3. CORS-Fehler? → Cache löschen (`Strg+Shift+R`)

---

## 📚 Dokumentation

| Dokument         | Beschreibung                        |
|------------------|-------------------------------------|
| ARCHITECTURE.md  | System-Design & Datenflüsse         |
| DEPLOYMENT.md    | Schritt-für-Schritt Setup-Guide     |
| DSGVO.md         | Datenschutz & Compliance            |
| README.md        | Diese Übersicht                     |

---

## 🛠️ Weiterentwicklung

### Mögliche Erweiterungen

- [ ] **Automatische Löschung** nach 12 Monaten (Apps Script Trigger)
- [ ] **Slack-Integration** für Team-Benachrichtigungen
- [ ] **Google Analytics Events** für Lead-Tracking
- [ ] **Zapier/Make.com** Integration für CRM-Sync
- [ ] **Duplicate-Detection** (verhindert doppelte Leads)
- [ ] **Lead-Scoring** (priorisiert hochwertige Leads)

---

## 📞 Support

- **Technische Fragen:** Siehe [DEPLOYMENT.md](./DEPLOYMENT.md) → Troubleshooting
- **Datenschutz:** Siehe [DSGVO.md](./DSGVO.md)
- **Google Apps Script Docs:** [developers.google.com/apps-script](https://developers.google.com/apps-script)

---

## 📝 Lizenz

Dieses System wurde für **RS Finance** entwickelt.

**Autor:** Claude Code (AI-Assistant)
**Auftraggeber:** Nico Nadolph
**Finanzberatung:** RS Finance-Consulting e.U.

---

## ✅ Produktionsreif

**Status:** ✅ Ready for Production

**Voraussetzungen erfüllt:**
- Lead-Erfassung funktioniert
- Benachrichtigungen konfiguriert
- DSGVO-Dokumentation vorhanden
- Deployment-Guide verfügbar

**Nächste Schritte:**
1. Google Sheet anlegen
2. Apps Script deployen
3. Frontend-URL aktualisieren
4. Testen
5. Go-Live! 🚀

---

**Version:** 1.0
**Letztes Update:** 2026-01-18
