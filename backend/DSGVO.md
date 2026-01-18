# 🔐 DSGVO-Dokumentation
## RS Finance Funnel - Datenschutz & Compliance

---

## 📋 Übersicht

Dieses Dokument beschreibt die DSGVO-Compliance-Maßnahmen für das RS Finance Lead-Management-System.

**System-Typ:** Lead-Generierungs- und Vorqualifizierungssystem
**Datenverarbeiter:** Google LLC (Google Workspace/Apps Script)
**Verantwortlicher:** Nico Nadolph (Marketing & Leadgenerierung)
**Auftraggeber:** RS Finance (Finanzberatung)

---

## 1️⃣ Rechtsgrundlagen

### Art. 6 DSGVO - Rechtmäßigkeit der Verarbeitung

**Anwendbare Rechtsgrundlagen:**

| Datenart           | Rechtsgrundlage                    | Erläuterung                                      |
|--------------------|------------------------------------|--------------------------------------------------|
| Kontaktdaten       | Art. 6 Abs. 1 lit. b DSGVO         | Vertragsanbahnung (Finanzierungsanfrage)         |
| Finanzierungsinfos | Art. 6 Abs. 1 lit. b DSGVO         | Erforderlich für Angebotserstellung              |
| Marketing-Consent  | Art. 6 Abs. 1 lit. a DSGVO         | Freiwillige Einwilligung (Checkbox im Formular)  |

### Art. 13 DSGVO - Informationspflichten

Die **Datenschutzerklärung** auf der Website muss folgende Informationen enthalten:

- Name und Kontaktdaten des Verantwortlichen (Nico Nadolph)
- Zwecke der Datenverarbeitung (Leadgenerierung, Vorqualifizierung)
- Rechtsgrundlagen (Art. 6 Abs. 1 lit. b DSGVO)
- Empfänger der Daten (RS Finance, Google)
- Speicherdauer (12 Monate)
- Betroffenenrechte (Auskunft, Löschung, Widerruf)
- Beschwerderecht bei Datenschutzbehörde

**Vorlage:** Siehe Abschnitt 6 unten.

---

## 2️⃣ Datenminimierung & Zweckbindung

### Erlaubte Daten (Lead-Generierung)

✅ **Gespeichert im System:**
- Vorname, Nachname
- E-Mail-Adresse
- Telefonnummer
- Finanzierungsart (z. B. "Immobilienkauf")
- Objektwert (grobe Angabe)
- Eigenkapital (grobe Angabe)
- Wunschzeitpunkt
- Optional: Freitext-Nachricht

### Verbotene Daten (nur RS Finance)

❌ **NIEMALS im Funnel speichern:**
- Ausweisdokumente (Reisepass, Personalausweis)
- Kontoauszüge
- Gehaltsnachweise
- Kreditverträge
- Bonitätsdaten (SCHUFA, KSV)
- Sozialversicherungsnummern
- Steuer-IDs

**Begründung:** Diese Daten sind nicht erforderlich für die Vorqualifizierung und unterliegen höheren Sicherheitsanforderungen.

---

## 3️⃣ Auftragsverarbeitung (AVV)

### Google als Auftragsverarbeiter

**Status:** Google Workspace/Apps Script verarbeitet Daten im Auftrag.

**AVV-Regelung:**
- Google bietet standardmäßig einen **Data Processing Amendment (DPA)** an
- [Google Cloud Data Processing Addendum](https://cloud.google.com/terms/data-processing-addendum)
- Gilt automatisch für Google Workspace Kunden

**Wichtig für Nico Nadolph:**
- Wenn **kostenloser Google Account** genutzt wird: AVV gilt NICHT automatisch
- Empfehlung: **Google Workspace** (Business) nutzen → AVV inkludiert
- Kosten: ab 6 EUR/Monat pro Nutzer

### AVV mit RS Finance

Da RS Finance der **Endempfänger** qualifizierter Leads ist, wird **kein AVV** mit RS Finance benötigt.

**Rechtliche Einordnung:**
- Nico Nadolph = Verantwortlicher (für Leadgenerierung)
- RS Finance = **Gemeinsam Verantwortlicher** (Art. 26 DSGVO)
- Empfehlung: Schriftliche Vereinbarung über Verantwortlichkeiten

**Muster-Vereinbarung (vereinfacht):**
```
Nico Nadolph ist verantwortlich für:
- Rechtmäßige Erhebung der Kontaktdaten
- Sichere Speicherung bis zur Übergabe
- Information der Betroffenen

RS Finance ist verantwortlich für:
- Finanzberatung und Vertragsabschluss
- Verarbeitung von Bonitätsdaten
- Dokumentenmanagement (Ausweise, Kontoauszüge)
```

---

## 4️⃣ Betroffenenrechte

Kunden haben folgende Rechte gemäß DSGVO:

### Art. 15 - Auskunftsrecht

**Anfrage:** "Welche Daten haben Sie über mich?"

**Prozess:**
1. Lead sendet Anfrage per E-Mail an: `nico@nadolph.at`
2. Identität prüfen (z. B. Rückfrage per Telefon)
3. Google Sheet öffnen → Lead-ID suchen
4. Kopie der Zeile per E-Mail senden (als PDF)
5. Frist: **1 Monat** (Art. 12 Abs. 3 DSGVO)

### Art. 17 - Recht auf Löschung

**Anfrage:** "Löschen Sie meine Daten!"

**Prozess:**
1. Lead sendet Anfrage per E-Mail
2. Identität prüfen
3. Löschung durchführen:
   - Google Sheet `Leads_raw`: Zeile löschen
   - Google Sheet `Qualifizierung`: Zugehörige Zeile löschen
4. Bestätigung per E-Mail: "Ihre Daten wurden gelöscht"
5. Frist: **1 Monat**

**Ausnahme:** Wenn bereits Vertrag mit RS Finance besteht (Art. 17 Abs. 3 lit. b) → Weiterleitung an RS Finance

### Art. 16 - Recht auf Berichtigung

**Anfrage:** "Meine E-Mail-Adresse ist falsch!"

**Prozess:**
1. Zeile im Google Sheet finden
2. Korrektur manuell eintragen
3. Bestätigung per E-Mail

### Art. 21 - Widerspruchsrecht

**Anfrage:** "Ich möchte nicht mehr kontaktiert werden!"

**Prozess:**
1. Status in Sheet ändern: `ABGELEHNT`
2. Optional: Lead-Zeile nach 30 Tagen löschen
3. Bestätigung per E-Mail

---

## 5️⃣ Technische & Organisatorische Maßnahmen (TOMs)

### Datensicherheit

| Maßnahme                     | Umsetzung                                         | Status |
|------------------------------|---------------------------------------------------|--------|
| **Transportverschlüsselung** | HTTPS (TLS 1.3) für alle Verbindungen            | ✅      |
| **Speicherverschlüsselung**  | Google Sheets: Verschlüsselung at Rest (AES-256) | ✅      |
| **Zugriffskonrolle**         | Google Account 2FA aktiviert                      | ⚠️ TODO |
| **Zugriffsbeschränkung**     | Sheet-Freigabe nur an autorisierte Personen      | ✅      |
| **Logging**                  | Apps Script Logs (90 Tage Aufbewahrung)          | ✅      |
| **Backups**                  | Google Drive Versionierung (automatisch)         | ✅      |
| **Rate Limiting**            | Max. 5 Requests/Minute pro IP                     | ✅      |
| **Input Validation**         | Sanitierung aller Eingaben (XSS-Schutz)          | ✅      |

### Organisatorische Maßnahmen

| Maßnahme                     | Umsetzung                                         | Status |
|------------------------------|---------------------------------------------------|--------|
| **Datenschutzerklärung**     | Auf Website veröffentlicht (datenschutz.html)     | ⚠️ TODO |
| **Cookie-Consent**           | Optional: Cookie-Banner (falls Tracking aktiv)    | ⚠️ TODO |
| **Schulung**                 | Callpartner über Datenschutz informieren          | ⚠️ TODO |
| **Löschkonzept**             | Automatische Löschung nach 12 Monaten             | ⚠️ TODO |
| **Meldeprozess**             | Bei Datenpannen: Meldung binnen 72h (Art. 33)     | ✅      |

---

## 6️⃣ Datenschutzerklärung (Vorlage)

### Text für `/datenschutz.html`

```html
<h2>3. Erfassung von Finanzierungsanfragen</h2>

<h3>Art und Umfang der Datenverarbeitung</h3>
<p>Wenn Sie über unseren Online-Funnel eine Finanzierungsanfrage stellen, erheben wir folgende personenbezogene Daten:</p>
<ul>
  <li>Vorname, Nachname</li>
  <li>E-Mail-Adresse</li>
  <li>Telefonnummer</li>
  <li>Finanzierungsart (z. B. Immobilienkauf, Umschuldung)</li>
  <li>Objektwert und Eigenkapital (grobe Angaben)</li>
  <li>Gewünschter Zeitpunkt der Finanzierung</li>
  <li>Optional: Ihre Nachricht an uns</li>
</ul>

<h3>Zweck der Verarbeitung</h3>
<p>Die Daten werden ausschließlich zum Zweck der Vorqualifizierung und Kontaktaufnahme verarbeitet. Wir prüfen Ihre Anfrage und leiten qualifizierte Leads an unseren Finanzierungspartner RS Finance weiter.</p>

<h3>Rechtsgrundlage</h3>
<p>Die Verarbeitung erfolgt auf Grundlage von <strong>Art. 6 Abs. 1 lit. b DSGVO</strong> (Vertragsanbahnung) sowie <strong>Art. 6 Abs. 1 lit. a DSGVO</strong> (Einwilligung für Marketing-Kommunikation, sofern erteilt).</p>

<h3>Speicherdauer</h3>
<p>Ihre Daten werden für <strong>12 Monate</strong> gespeichert und anschließend gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten bestehen.</p>

<h3>Empfänger der Daten</h3>
<p>Qualifizierte Finanzierungsanfragen werden an unseren Partner weitergeleitet:</p>
<ul>
  <li><strong>RS Finance</strong><br>
      RS Finance-Consulting e.U.<br>
      Alpen-Adria-Platz 1, Eingang D<br>
      9020 Klagenfurt am Wörthersee<br>
      E-Mail: office@rs-finance.at</li>
</ul>

<p>Technisch werden Ihre Daten über <strong>Google Workspace</strong> (Google LLC, USA) verarbeitet. Google ist durch die EU-Standardvertragsklauseln zertifiziert.</p>

<h3>Ihre Rechte</h3>
<p>Sie haben das Recht auf:</p>
<ul>
  <li><strong>Auskunft</strong> über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
  <li><strong>Berichtigung</strong> unrichtiger Daten (Art. 16 DSGVO)</li>
  <li><strong>Löschung</strong> Ihrer Daten (Art. 17 DSGVO)</li>
  <li><strong>Widerruf</strong> Ihrer Einwilligung jederzeit (Art. 7 Abs. 3 DSGVO)</li>
  <li><strong>Beschwerde</strong> bei der Datenschutzbehörde (Art. 77 DSGVO)</li>
</ul>

<p>Um Ihre Rechte auszuüben, kontaktieren Sie uns bitte unter:<br>
<strong>E-Mail:</strong> nico@nadolph.at<br>
<strong>Telefon:</strong> +43 664 / 5247909</p>

<h3>Keine automatisierte Entscheidungsfindung</h3>
<p>Ihre Anfrage wird <strong>nicht automatisiert</strong> bearbeitet. Eine persönliche Qualifizierung erfolgt durch unsere Callpartner.</p>
```

---

## 7️⃣ Löschkonzept

### Automatische Löschung (empfohlen)

**Variante A: Google Apps Script (automatisch)**

Erstelle ein neues Script `DataDeletion.gs`:

```javascript
function autoDeleteOldLeads() {
  const RETENTION_DAYS = 365; // 12 Monate
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID)
                              .getSheetByName(CONFIG.SHEET_LEADS);

  const data = sheet.getDataRange().getValues();
  const timestampCol = 0; // Column A

  // Start from last row, delete backwards
  for (let i = data.length - 1; i >= 1; i--) {
    const timestamp = new Date(data[i][timestampCol]);
    if (timestamp < cutoffDate) {
      sheet.deleteRow(i + 1);
      Logger.log('Deleted row ' + (i + 1) + ' (timestamp: ' + timestamp + ')');
    }
  }
}

// Set up trigger (run once)
function setupDeletionTrigger() {
  ScriptApp.newTrigger('autoDeleteOldLeads')
    .timeBased()
    .everyWeeks(1) // Weekly check
    .create();
}
```

**Variante B: Manuelle Prüfung (einfacher)**

- Jeden Monat: Google Sheet öffnen
- Zeilen älter als 12 Monate markieren
- Rechtsklick → "Zeilen löschen"

---

## 8️⃣ Meldepflicht bei Datenpannen

### Art. 33 DSGVO - Meldepflicht

**Wann melden?**
- Datenschutzverletzung (z. B. Zugriff durch Unbefugte)
- Datenverlust
- Versehentliche Weitergabe

**Frist:** **72 Stunden** nach Bekanntwerden

**Meldestelle (Österreich):**
- **Datenschutzbehörde (DSB)**
- Online-Formular: [https://www.dsb.gv.at](https://www.dsb.gv.at/formulare.html)

**Inhalt der Meldung:**
- Art der Verletzung
- Kategorien betroffener Personen
- Wahrscheinliche Folgen
- Ergriffene Maßnahmen

---

## 9️⃣ Checkliste vor Go-Live

Vor dem Produktivstart alle Punkte abhaken:

- [ ] **Datenschutzerklärung** auf Website veröffentlicht (datenschutz.html)
- [ ] **Impressum** enthält Datenschutz-Kontakt
- [ ] **Google Workspace Business** Account aktiviert (oder AVV-Risiko akzeptiert)
- [ ] **2-Faktor-Authentifizierung** für Google Account aktiviert
- [ ] **Sheet-Berechtigungen** korrekt gesetzt (nur autorisierte Personen)
- [ ] **Apps Script deployed** mit "Zugriff: Jeder"
- [ ] **Test-Anfrage** durchgeführt (Lead erfolgreich gespeichert?)
- [ ] **E-Mail-Benachrichtigungen** funktionieren
- [ ] **Callpartner-Schulung** durchgeführt (Datenschutz-Basics)
- [ ] **Löschkonzept** dokumentiert (12 Monate)
- [ ] **Vereinbarung mit RS Finance** über gemeinsame Verantwortlichkeit (optional, aber empfohlen)

---

## 🔟 Zusammenfassung

### Compliance-Status

| Anforderung              | Status | Erläuterung                                   |
|--------------------------|--------|-----------------------------------------------|
| Rechtsgrundlage          | ✅      | Art. 6 Abs. 1 lit. b DSGVO                    |
| Informationspflichten    | ⚠️      | Datenschutzerklärung muss aktualisiert werden |
| Datenminimierung         | ✅      | Nur notwendige Daten werden erhoben           |
| Auftragsverarbeitung     | ⚠️      | Google Workspace Business empfohlen           |
| Betroffenenrechte        | ✅      | Prozesse dokumentiert                         |
| TOMs                     | ✅      | Verschlüsselung, Zugriffskontrolle vorhanden  |
| Löschkonzept             | ⚠️      | Manuell oder per Script                       |

### Risikobewertung

**Risiko-Level:** **Niedrig** ✅

**Begründung:**
- Keine sensiblen Sonderkategorien (Art. 9 DSGVO)
- Keine Bonitätsdaten im Funnel
- Dokumentenhandling nur bei RS Finance
- Google Infrastruktur (hohe Sicherheit)

---

**Dokumenten-Version:** 1.0
**Stand:** 2026-01-18
**Verantwortlich:** Nico Nadolph
**Nächste Überprüfung:** 2026-07-18 (6 Monate)
