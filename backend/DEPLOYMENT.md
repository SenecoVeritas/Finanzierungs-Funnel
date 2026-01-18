# 🚀 Deployment-Anleitung
## RS Finance Funnel - Backend Setup

Diese Anleitung führt Sie Schritt für Schritt durch die Einrichtung des Backend-Systems.

---

## 📋 Voraussetzungen

- Google Account (kostenlos)
- Zugriff auf Google Drive
- Browser (Chrome/Firefox/Edge empfohlen)
- Ca. 30-45 Minuten Zeit

---

## PHASE 1: Google Sheet erstellen

### Schritt 1.1: Neues Google Sheet anlegen

1. Gehe zu [Google Sheets](https://docs.google.com/spreadsheets)
2. Klicke auf "+ Leer" (Neue Tabelle)
3. Benenne das Sheet: `RS Finance - Lead Management`

### Schritt 1.2: Sheet 1 konfigurieren (Leads_raw)

1. Benenne das erste Tab um: **Rechtsklick auf Tab** → "Umbenennen" → `Leads_raw`
2. Füge folgende Spaltenüberschriften in **Zeile 1** ein:

```
timestamp | lead_id | vorname | nachname | email | telefon | finanzierungsart | objektwert | eigenkapital | wunschzeitpunkt | quelle | status | nachricht
```

**Tipp:** Kopiere diese Zeile und füge sie mit `Strg+V` (oder `Cmd+V` auf Mac) ein. Trenne Spalten mit Tab.

### Schritt 1.3: Sheet 2 erstellen (Qualifizierung)

1. Klicke unten links auf das **+** Symbol (Neues Tab)
2. Benenne es um: `Qualifizierung`
3. Füge folgende Spaltenüberschriften in **Zeile 1** ein:

```
lead_id | bearbeiter | status | kurzbewertung | empfehlung | kommentar_kurz | timestamp_quali | rs_notified | rs_notified_timestamp
```

### Schritt 1.4: Formatierung (optional, aber empfohlen)

**Für Leads_raw:**
- Zeile 1: **Fett** + Hintergrundfarbe hellgrau
- Spalte A (timestamp): Format → Zahlen → Datum + Uhrzeit
- Spalte H+I (Objektwert/Eigenkapital): Format → Zahlen → Währung (€)
- Spalte L (status): Datenvalidierung → Liste → `NEU,KONTAKTIERT,QUALIFIZIERT,ABGELEHNT`

**Für Qualifizierung:**
- Zeile 1: **Fett** + Hintergrundfarbe hellgrün
- Spalte C (status): Datenvalidierung → Liste → `KONTAKTIERT,QUALIFIZIERT,NICHT GEEIGNET`
- Spalte E (empfehlung): Datenvalidierung → Liste → `JA,NEIN`

### Schritt 1.5: Sheet ID notieren

1. Kopiere die **Sheet-ID** aus der URL:
   ```
   https://docs.google.com/spreadsheets/d/THIS_IS_THE_SHEET_ID/edit
   ```
2. Speichere diese ID - du brauchst sie später!

---

## PHASE 2: Google Apps Script einrichten

### Schritt 2.1: Apps Script öffnen

1. Im Google Sheet: **Menü** → **Erweiterungen** → **Apps Script**
2. Ein neuer Tab öffnet sich mit dem Apps Script Editor

### Schritt 2.2: Code einfügen

**Datei 1: Code.gs**
1. Lösche den vorhandenen Code im Editor
2. Öffne `/backend/apps-script/Code.gs` (aus diesem Repository)
3. Kopiere den gesamten Inhalt
4. Füge ihn im Apps Script Editor ein

**Datei 2: Notifications.gs**
1. Klicke auf **+** neben "Dateien" → "Script"
2. Benenne die Datei: `Notifications`
3. Öffne `/backend/apps-script/Notifications.gs`
4. Kopiere den Code und füge ihn ein

**Datei 3: StatusTrigger.gs**
1. Erstelle eine weitere neue Datei: `StatusTrigger`
2. Öffne `/backend/apps-script/StatusTrigger.gs`
3. Kopiere den Code und füge ihn ein

### Schritt 2.3: Konfiguration anpassen

In der Datei **Code.gs**, ändere die folgenden Werte:

```javascript
const CONFIG = {
  // Füge deine Sheet-ID ein (aus Phase 1)
  SHEET_ID: 'DEINE_SHEET_ID_HIER',

  // E-Mail des Callpartners (für sofortige Lead-Benachrichtigungen)
  NOTIFICATION_EMAIL: 'callpartner@example.com',

  // E-Mail von RS Finance (für qualifizierte Leads)
  RS_FINANCE_EMAIL: 'office@rs-finance.at',

  // Telegram (optional - später konfigurierbar)
  TELEGRAM_ENABLED: false,

  // Erlaubte Domains (deine Website-URLs)
  ALLOWED_ORIGINS: [
    'https://DEINE-DOMAIN.com',
    'https://www.DEINE-DOMAIN.com'
  ]
};
```

### Schritt 2.4: Projekt speichern

1. Klicke auf **Disketten-Symbol** (oder `Strg+S`)
2. Benenne das Projekt: `RS Finance Lead API`

---

## PHASE 3: Apps Script deployen

### Schritt 3.1: Web App bereitstellen

1. Klicke oben rechts auf **Bereitstellen** → **Neue Bereitstellung**
2. Wähle **Typ**: "Web-App"
3. Konfiguration:
   - **Beschreibung**: `Lead Capture API v1`
   - **Ausführen als**: `Ich (DEIN_NAME@gmail.com)`
   - **Zugriff**: `Jeder` (wichtig!)
4. Klicke auf **Bereitstellen**

### Schritt 3.2: Berechtigungen erteilen

Es erscheint ein Popup mit **"Autorisierung erforderlich"**:

1. Klicke auf **Zugriff überprüfen**
2. Wähle deinen Google Account
3. Klicke auf **Erweitert**
4. Klicke auf **Zu [Projektname] wechseln (unsicher)**
5. Scrolle nach unten und klicke **Zulassen**

**Warum?** Google zeigt diese Warnung bei selbst erstellten Scripts. Das ist normal und sicher.

### Schritt 3.3: Web-App-URL kopieren

Nach dem Deployment erscheint ein Dialog mit:
- **Web-App-URL**: `https://script.google.com/macros/s/.../exec`

**Wichtig:** Kopiere diese URL! Du brauchst sie für die Frontend-Integration.

---

## PHASE 4: Trigger einrichten

### Schritt 4.1: Automatischen Trigger erstellen

**Option A: Manuell über UI**
1. Im Apps Script Editor: Klicke links auf **⏰ Trigger** (Uhr-Symbol)
2. Klicke unten rechts auf **+ Trigger hinzufügen**
3. Konfiguration:
   - **Funktion**: `onQualificationEdit`
   - **Ereignisquelle**: `Aus Tabelle`
   - **Ereignistyp**: `Bei Bearbeitung`
4. Klicke auf **Speichern**

**Option B: Automatisch über Code**
1. In der Datei `StatusTrigger.gs`
2. Führe die Funktion `setupQualificationTrigger()` manuell aus:
   - Wähle die Funktion aus dem Dropdown
   - Klicke auf **Ausführen** (Play-Button)

---

## PHASE 5: Frontend integrieren

### Schritt 5.1: Apps Script URL einfügen

1. Öffne `script.js` in deinem Funnel-Projekt
2. Finde die Zeile:
   ```javascript
   const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';
   ```
3. Ersetze `YOUR_APPS_SCRIPT_WEB_APP_URL_HERE` durch deine **Web-App-URL** aus Phase 3

### Schritt 5.2: Änderungen deployen

```bash
git add script.js
git commit -m "Backend integriert: Google Apps Script Lead API"
git push
```

Vercel/Netlify deployed automatisch nach dem Push.

---

## PHASE 6: Testen

### Schritt 6.1: End-to-End-Test

1. Öffne deinen Funnel: `https://deine-domain.com/rechner`
2. Fülle das Formular aus mit **Test-Daten**:
   - Vorname: `Test`
   - Nachname: `Kunde`
   - E-Mail: `test@example.com`
   - Telefon: `+43 664 1234567`
3. Klicke auf **"Angebot anfordern"**
4. Prüfe:
   - ✅ Lead erscheint im Google Sheet `Leads_raw`
   - ✅ E-Mail-Benachrichtigung wurde gesendet

### Schritt 6.2: Qualifizierungs-Flow testen

1. Öffne das Sheet `Qualifizierung`
2. Füge eine Zeile manuell hinzu:
   - `lead_id`: (Kopiere die Lead-ID aus Sheet 1)
   - `bearbeiter`: `Sarah K.`
   - `status`: `QUALIFIZIERT`
   - `kurzbewertung`: `Gute Bonität`
   - `empfehlung`: `JA`
3. Prüfe:
   - ✅ E-Mail an RS Finance wurde gesendet
   - ✅ Spalte `rs_notified` wurde auf `JA` gesetzt

---

## PHASE 7: Berechtigungen einrichten

### Schritt 7.1: Callpartner-Zugriff

1. Öffne das Google Sheet
2. Klicke oben rechts auf **Freigeben**
3. Füge die E-Mail des Callpartners hinzu
4. Berechtigungen: **Bearbeiter** (nur für Sheet "Qualifizierung")
5. Optional: **Nur Ansicht** für Sheet "Leads_raw"

**Best Practice:**
- Erstelle separate Google Groups für unterschiedliche Rollen
- Vergebe minimale Berechtigungen (Principle of Least Privilege)

---

## 🔒 DSGVO-Checkliste

Nach dem Deployment:

- [ ] Datenschutzerklärung auf Website aktualisiert
- [ ] Cookie-Consent für Formular aktiv (falls Marketing-Cookies)
- [ ] Aufbewahrungsfrist in Google Sheet dokumentiert (12 Monate)
- [ ] Lösch-Prozess definiert (manuelle Zeilen-Löschung nach 12 Monaten)
- [ ] AVV mit Google Workspace geprüft (wenn Business-Account)
- [ ] Betroffenenrechte-Prozess dokumentiert (Auskunft, Löschung)

---

## 📊 Monitoring & Wartung

### Apps Script Logs prüfen

1. Apps Script Editor → **Ausführungen** (links)
2. Zeigt alle Script-Durchläufe mit Status
3. Bei Fehlern: Klicke auf Zeile → Details ansehen

### E-Mail-Benachrichtigungen testen

Funktion manuell ausführen:
1. `Notifications.gs` → Funktion `testSendNotification()`
2. Ausführen → Prüfe Posteingang

### Google Sheet Quota

- **Kostenlos**: 20.000 Requests/Tag
- **Zellen**: 10 Millionen (ausreichend für ~100.000 Leads)

---

## ⚠️ Troubleshooting

### Problem: "Zugriff verweigert" im Frontend

**Lösung:**
1. Prüfe Apps Script Deployment: "Zugriff" muss auf **"Jeder"** stehen
2. Prüfe `ALLOWED_ORIGINS` in `Code.gs` (enthält deine Domain?)

### Problem: Keine E-Mail-Benachrichtigung

**Lösung:**
1. Prüfe `NOTIFICATION_EMAIL` in `Code.gs`
2. Schaue in **Apps Script Logs** nach Fehlern
3. Prüfe Spam-Ordner
4. Gmail: Max. 100 E-Mails/Tag (kostenloser Account)

### Problem: Trigger funktioniert nicht

**Lösung:**
1. Apps Script → **Trigger** → Prüfe ob `onQualificationEdit` vorhanden
2. Teste manuell: Führe `testNotifyRSFinance()` aus
3. Logs prüfen: Fehler sichtbar?

### Problem: CORS-Fehler im Browser

**Lösung:**
- Apps Script Web Apps haben CORS automatisch aktiviert
- Prüfe ob `mode: 'cors'` im Fetch-Call vorhanden ist
- Cache löschen: `Strg+Shift+R`

---

## 📞 Support

Bei technischen Problemen:
1. Prüfe **Apps Script Logs** (meist steht der Fehler dort)
2. Google Apps Script Dokumentation: [developers.google.com/apps-script](https://developers.google.com/apps-script)
3. Community: [Stack Overflow - google-apps-script tag](https://stackoverflow.com/questions/tagged/google-apps-script)

---

## 🎯 Nächste Schritte

Nach erfolgreichem Deployment:
1. Teste mit echten Leads (Beta-Phase)
2. Überwache E-Mail-Zustellung
3. Sammle Feedback von Callpartnern
4. Optional: Telegram-Integration aktivieren
5. Optional: Google Analytics Events tracken

---

**Deployment-Status:** ✅ Bereit für Produktion

**Version:** 1.0
**Letztes Update:** 2026-01-18
