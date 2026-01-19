# 🚀 Deployment-Anleitung: Airtable Backend
## RS Finance Funnel - Schritt-für-Schritt Setup

---

## 📋 Voraussetzungen

- Airtable Account (kostenlos)
- Vercel oder Netlify Account (kostenlos)
- Git Repository (bereits vorhanden)
- Ca. 45-60 Minuten Zeit

---

## PHASE 1: Airtable Base erstellen

### Schritt 1.1: Airtable Account erstellen

1. Gehe zu [airtable.com](https://airtable.com)
2. Klicke auf **Sign up** → **Sign up with Email**
3. Bestätige deine E-Mail-Adresse
4. Wähle **Free Plan** (ausreichend für Start)

### Schritt 1.2: Neue Base anlegen

1. Nach Login: Klicke auf **+ Create a base**
2. Wähle **Start from scratch**
3. Benenne die Base: **RS Finance - Lead Management**

### Schritt 1.3: Table 1 konfigurieren (Leads_raw)

1. Benenne das erste Table um: **Rechtsklick auf Table** → **Rename** → `Leads_raw`
2. Lösche die Default-Felder (außer "Name" - umbenennen zu "lead_id")
3. Erstelle folgende Felder:

| Feldname         | Typ                 | Konfiguration                                    |
|------------------|---------------------|--------------------------------------------------|
| lead_id          | Single line text    | -                                                |
| created_at       | Created time        | Same timezone as your location                   |
| vorname          | Single line text    | -                                                |
| nachname         | Single line text    | -                                                |
| email            | Email               | -                                                |
| telefon          | Phone number        | Format: Local                                    |
| finanzierungsart | Single select       | Options: siehe unten                             |
| objektwert       | Currency            | Currency: EUR (€), Precision: 0 decimals         |
| eigenkapital     | Currency            | Currency: EUR (€), Precision: 0 decimals         |
| wunschzeitpunkt  | Single select       | Options: siehe unten                             |
| quelle           | Single line text    | -                                                |
| status           | Single select       | Options: siehe unten                             |
| nachricht        | Long text           | Enable rich text formatting: No                  |

**Single Select Options:**

**finanzierungsart:**
- Immobilienkauf
- Umschuldung
- Sanierung
- Gewerbefinanzierung

**wunschzeitpunkt:**
- Innerhalb 1 Monat
- Innerhalb 3 Monate
- Innerhalb 6 Monate
- Über 6 Monate

**status:**
- NEU (Farbe: Blau)
- KONTAKTIERT (Farbe: Gelb)
- QUALIFIZIERT (Farbe: Grün)
- ABGELEHNT (Farbe: Rot)

### Schritt 1.4: Table 2 erstellen (Qualifizierung)

1. Klicke unten links auf **+ Add or import** → **Create empty table**
2. Benenne das Table: `Qualifizierung`
3. Erstelle folgende Felder:

| Feldname         | Typ                 | Konfiguration                                    |
|------------------|---------------------|--------------------------------------------------|
| lead_id          | Link to another record | Link to table: Leads_raw, Field: lead_id      |
| bearbeiter       | Single line text    | -                                                |
| status           | Single select       | Options: KONTAKTIERT, QUALIFIZIERT, NICHT GEEIGNET |
| kurzbewertung    | Long text           | -                                                |
| empfehlung       | Single select       | Options: JA, NEIN                                |
| notizen_kurz     | Long text           | -                                                |
| timestamp_quali  | Last modified time  | -                                                |
| rs_notified      | Checkbox            | -                                                |

### Schritt 1.5: API-Zugriff einrichten

1. Klicke oben rechts auf **Help** (?) → **API documentation**
2. Wähle deine Base: **RS Finance - Lead Management**
3. In der linken Sidebar: **Authentication**
4. Klicke auf **Generate API key** (oder nutze bestehenden Key)
5. **Kopiere den API Key** → Speichere sicher (z. B. Passwort-Manager)

**Format:** `key...` (ca. 17 Zeichen)

### Schritt 1.6: Base-ID notieren

1. In der API-Dokumentation (gleicher Tab)
2. Oben im Code-Beispiel findest du:
   ```javascript
   const base = require('airtable').base('appXXXXXXXXXXXXXX');
   ```
3. **Kopiere die Base-ID** (`appXXXXXXXXXXXXXX`)

### Schritt 1.7: EU-Server aktivieren (DSGVO)

1. Airtable Account → **Settings** (oben rechts, Profil-Icon)
2. **Account** → **Data residency**
3. Wähle: **Europe (Frankfurt)** ✅
4. Speichern

⚠️ **Wichtig:** Nur verfügbar ab Airtable **Plus Plan** (10 EUR/Monat). Für Free Plan: Daten liegen in USA.

---

## PHASE 2: Serverless Function deployen (Vercel)

### Schritt 2.1: Vercel Account verbinden (falls noch nicht)

1. Gehe zu [vercel.com](https://vercel.com)
2. **Sign up** → **Continue with GitHub**
3. Autorisiere Vercel für dein Repository

### Schritt 2.2: Projekt importieren

1. Vercel Dashboard → **Add New** → **Project**
2. Wähle Repository: `Funnel-Finanzierung`
3. **Import**

### Schritt 2.3: Environment Variables setzen

1. Im Vercel Projekt: **Settings** → **Environment Variables**
2. Füge folgende Variablen hinzu:

| Key                    | Value                                  | Umgebung               |
|------------------------|----------------------------------------|------------------------|
| AIRTABLE_API_KEY       | `keyXXXXXXXXXXXXXX`                    | Production, Preview    |
| AIRTABLE_BASE_ID       | `appXXXXXXXXXXXXXX`                    | Production, Preview    |
| RESEND_API_KEY         | `re_XXXXXXXXXXXXXXXX` (später)         | Production, Preview    |
| NOTIFICATION_EMAIL     | `callpartner@example.com`              | Production, Preview    |
| ALLOWED_ORIGINS        | `https://nadolph.com,https://www.nadolph.com` | Production, Preview |
| RATE_LIMIT_MAX         | `5`                                    | Production, Preview    |

**Klicke jeweils auf "Add"** nach Eingabe.

### Schritt 2.4: Build Settings (falls nicht automatisch erkannt)

1. **Build Command:** (leer lassen - static site)
2. **Output Directory:** (leer lassen)
3. **Install Command:** `npm install`

### Schritt 2.5: Deploy

1. Klicke auf **Deploy**
2. Warte ca. 1-2 Minuten
3. Nach Erfolg: **Visit** → Deine Funnel-URL öffnet sich

---

## PHASE 3: E-Mail-Benachrichtigungen (Resend.com)

### Schritt 3.1: Resend Account erstellen

1. Gehe zu [resend.com](https://resend.com)
2. **Sign up** → **Continue with GitHub**
3. Bestätige E-Mail-Adresse

### Schritt 3.2: API Key generieren

1. Resend Dashboard → **API Keys**
2. **Create API Key**
   - Name: `RS Finance Funnel`
   - Permission: **Full Access**
3. **Kopiere den API Key** (`re_XXXXXXXXXXXXXXXX`)

### Schritt 3.3: Domain verifizieren (wichtig!)

**Option A: Eigene Domain (empfohlen)**

1. Resend → **Domains** → **Add Domain**
2. Domain eingeben: `nadolph.com`
3. DNS-Records hinzufügen (bei deinem Domain-Provider):
   - **TXT** Record für Verifizierung
   - **CNAME** Records für E-Mail-Versand
4. **Verify** klicken (kann 10-30 Min dauern)

**Option B: Resend Test-Domain (nur zum Testen)**

Nutze `onboarding@resend.dev` als Absender (nur für Tests, max. 100 E-Mails)

### Schritt 3.4: API Key in Vercel eintragen

1. Vercel Projekt → **Settings** → **Environment Variables**
2. **Edit** bei `RESEND_API_KEY`
3. Wert eintragen: `re_XXXXXXXXXXXXXXXX`
4. **Save**
5. **Redeploy** (Vercel → Deployments → Neuestes → **...** → Redeploy)

### Schritt 3.5: Absender-E-Mail anpassen

In `/api/submit-lead.js` (wenn Domain verifiziert):

```javascript
from: 'RS Finance Funnel <leads@nadolph.com>'
```

Ersetze `nadolph.com` durch deine verifizierte Domain.

---

## PHASE 4: Airtable Automation (RS Finance Übergabe)

### Schritt 4.1: Automation erstellen

1. Öffne deine Airtable Base
2. Oben rechts: **Automations** (Blitz-Symbol)
3. **Create automation**
4. Name: `RS Finance Benachrichtigung`

### Schritt 4.2: Trigger konfigurieren

1. **Trigger:** `When record matches conditions`
2. **Table:** `Qualifizierung`
3. **Conditions:**
   - **When:** `status` **is** `QUALIFIZIERT`
   - **AND:** `rs_notified` **is not** `checked`
4. **Done**

### Schritt 4.3: Action 1 - E-Mail senden

1. Klicke auf **+ Add action**
2. Wähle: **Send email**
3. Konfiguration:
   - **To:** `office@rs-finance.at`
   - **From name:** `RS Finance Funnel`
   - **Reply to:** (leer lassen oder `nico@nadolph.at`)
   - **Subject:** `Qualifizierter Lead: {vorname} {nachname}`
   - **Message:**

```
Neuer qualifizierter Lead:

👤 KONTAKTDATEN
Name: {vorname} {nachname}
Telefon: {telefon}
E-Mail: {email}

💰 FINANZIERUNG
Art: {finanzierungsart}
Objektwert: {objektwert} EUR
Eigenkapital: {eigenkapital} EUR

✅ QUALIFIZIERUNG
Bewertung: {kurzbewertung}
Empfehlung: {empfehlung}
Notizen: {notizen_kurz}

🔗 Airtable-Link: {Record URL}

---
Diese E-Mail wurde automatisch von Ihrem Lead-Management-System gesendet.
```

4. **Done**

### Schritt 4.4: Action 2 - Checkbox setzen

1. **+ Add action**
2. Wähle: **Update record**
3. Konfiguration:
   - **Table:** `Qualifizierung`
   - **Record ID:** `{Record ID}` (aus Trigger)
   - **Field:** `rs_notified`
   - **Value:** `checked` ☑
4. **Done**

### Schritt 4.5: Automation aktivieren

1. Oben rechts: **Turn on** (Schalter auf Grün)
2. **Test run** (optional, um zu prüfen)

---

## PHASE 5: Testing

### Schritt 5.1: End-to-End-Test

1. Öffne deinen Funnel: `https://your-domain.vercel.app/rechner`
2. Fülle das Formular aus mit **Test-Daten**:
   - Vorname: `Test`
   - Nachname: `Kunde`
   - E-Mail: `test@example.com`
   - Telefon: `+43 664 1234567`
3. Klicke auf **"Angebot anfordern"**

### Schritt 5.2: Prüfungen

✅ **Airtable:**
- Öffne Airtable Base → Table `Leads_raw`
- Neuer Eintrag mit Lead-ID vorhanden?
- Alle Felder korrekt befüllt?

✅ **E-Mail:**
- Posteingang von `callpartner@example.com` prüfen
- E-Mail erhalten (innerhalb 1-2 Minuten)?
- Airtable-Link funktioniert?

✅ **Frontend:**
- Step 5 (Erfolgsseite) angezeigt?
- Keine Fehler in Browser Console (F12)?

### Schritt 5.3: Qualifizierungs-Flow testen

1. Airtable → Table `Qualifizierung`
2. Klicke **+ Add record**
3. Fülle aus:
   - **lead_id:** Wähle Test-Lead aus Dropdown
   - **bearbeiter:** `Sarah K.`
   - **status:** `QUALIFIZIERT`
   - **kurzbewertung:** `Sehr gute Bonität`
   - **empfehlung:** `JA`
4. **Save**

✅ **Prüfung:**
- E-Mail an `office@rs-finance.at` erhalten?
- Feld `rs_notified` automatisch auf ☑ gesetzt?

---

## PHASE 6: Berechtigungen & Zugriff

### Schritt 6.1: Callpartner-Zugang einrichten

1. Airtable Base → Oben rechts: **Share**
2. **Invite by email**
3. E-Mail-Adresse: `callpartner@example.com`
4. Role: **Editor** (kann Daten bearbeiten)
5. **Invite**

**Hinweis:** Callpartner kann jetzt:
- Leads in `Leads_raw` ansehen
- Einträge in `Qualifizierung` erstellen/bearbeiten
- Keine Base-Struktur ändern

### Schritt 6.2: RS Finance (kein Zugang)

RS Finance erhält:
- ✅ E-Mail-Benachrichtigungen bei qualifizierten Leads
- ❌ Keinen Airtable-Zugang
- ❌ Keine Lead-Datenbank-Einsicht

**Begründung:** Datenschutz & klare Rollentrennung

---

## PHASE 7: DSGVO-Checkliste

Nach Deployment abhaken:

- [ ] **Airtable Data Residency:** EU (Frankfurt) aktiviert (nur Plus Plan)
- [ ] **Datenschutzerklärung** auf Website aktualisiert (`datenschutz.html`)
- [ ] **Airtable DPA** unterzeichnet (automatisch bei Plus Plan)
- [ ] **Aufbewahrungsfrist** dokumentiert (12 Monate)
- [ ] **Lösch-Prozess** definiert (manuell nach 12 Monaten)
- [ ] **Betroffenenrechte-Prozess** dokumentiert (Auskunft, Löschung)
- [ ] **SSL/TLS** aktiv (Vercel automatic HTTPS)

---

## ⚙️ Wartung & Monitoring

### Airtable Records prüfen

- Täglich: Neue Leads in `Leads_raw` prüfen
- Wöchentlich: Alte Leads (> 12 Monate) löschen

### Vercel Logs prüfen

1. Vercel Projekt → **Logs**
2. Filter: `api/submit-lead`
3. Fehler sichtbar? → Prüfen & beheben

### Resend E-Mail-Statistiken

1. Resend Dashboard → **Emails**
2. Prüfe: Zustellrate, Bounce-Rate
3. Bei Problemen: Domain-Verifizierung prüfen

---

## 🚨 Troubleshooting

### Problem: "500 Internal Server Error" beim Submit

**Lösungen:**
1. Vercel Logs prüfen (`Logs` Tab)
2. Environment Variables korrekt gesetzt?
3. Airtable API Key valide? (in Airtable → Account → API)

### Problem: Keine E-Mail-Benachrichtigung

**Lösungen:**
1. Resend API Key korrekt in Vercel?
2. Resend Domain verifiziert?
3. Spam-Ordner prüfen
4. Resend Dashboard → Emails → Status prüfen

### Problem: Airtable Automation läuft nicht

**Lösungen:**
1. Automation aktiviert (grüner Schalter)?
2. Trigger-Bedingungen korrekt (Status = "QUALIFIZIERT")?
3. Airtable → Automations → Run history → Fehler sichtbar?

### Problem: CORS-Fehler im Browser

**Lösungen:**
1. `ALLOWED_ORIGINS` in Vercel korrekt gesetzt?
2. Format: `https://domain.com` (kein Trailing Slash)
3. Mehrere Domains mit Komma trennen

---

## 📊 Kosten-Übersicht

| Service  | Plan    | Kosten/Monat | Enthält                     |
|----------|---------|--------------|-----------------------------|
| Airtable | Free    | 0 EUR        | 1.200 Records               |
| Airtable | Plus    | 10 EUR       | 5.000 Records, EU-Server    |
| Vercel   | Hobby   | 0 EUR        | 100 GB Bandwidth            |
| Resend   | Free    | 0 EUR        | 3.000 E-Mails/Monat         |
| **TOTAL**| **Free**| **0 EUR**    | Ausreichend für Start       |

**Empfehlung:**
- Start: Komplett kostenlos (Free Tiers)
- Bei > 100 Leads/Monat: Airtable Plus (10 EUR) für EU-Server
- Bei > 3.000 E-Mails/Monat: Resend Pro (20 EUR)

---

## ✅ Go-Live Checklist

Vor Produktivbetrieb alle Punkte abhaken:

- [ ] Airtable Base erstellt & konfiguriert
- [ ] API Keys generiert & sicher gespeichert
- [ ] Vercel Environment Variables gesetzt
- [ ] Serverless Function deployed & getestet
- [ ] Resend Domain verifiziert (oder Test-Domain genutzt)
- [ ] E-Mail-Benachrichtigungen funktionieren
- [ ] Airtable Automation aktiviert & getestet
- [ ] Callpartner-Zugang eingerichtet
- [ ] End-to-End-Test erfolgreich
- [ ] DSGVO-Dokumentation aktualisiert
- [ ] Monitoring eingerichtet (Vercel Logs, Resend Stats)

---

## 🎯 Nächste Schritte

Nach erfolgreichem Deployment:

1. **Beta-Phase** (1-2 Wochen)
   - Mit echten Leads testen
   - Feedback von Callpartnern sammeln
   - Kleine Anpassungen vornehmen

2. **Optimierungen** (optional)
   - Slack-Integration statt/zusätzlich E-Mail
   - Duplicate-Detection (verhindert doppelte Leads)
   - Lead-Scoring (priorisiert hochwertige Leads)

3. **Skalierung** (bei Erfolg)
   - Airtable Plus Plan (EU-Server + mehr Records)
   - Resend Pro Plan (mehr E-Mails)
   - Zusätzliche Callpartner einbinden

---

**Deployment-Status:** ✅ Bereit für Produktion

**Geschätzte Dauer:** 45-60 Minuten
**Schwierigkeitsgrad:** Mittel (mit Anleitung: Einfach)
**Kosten:** 0 EUR (mit Free Tiers)

---

**Version:** 2.0 (Airtable)
**Letztes Update:** 2026-01-18
