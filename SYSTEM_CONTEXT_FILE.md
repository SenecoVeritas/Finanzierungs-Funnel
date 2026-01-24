# SYSTEM CONTEXT FILE – LEAD & DOCUMENT UPLOAD ARCHITECTURE

## 1. Ziel des Systems

### Primäre Problemstellung
Das System löst die rechtskonforme Trennung zwischen Werbung/Lead-Generierung und qualifizierter Finanzberatung in regulierten Branchen. Es ermöglicht:

- Lead-Erfassung ohne Beratungstätigkeit
- Vorqualifizierung durch autorisierte Stellen
- Dokumentierte Übergabe an lizenzierte Fachpartner
- Nachvollziehbare Dokumenten-Upload-Prozesse mit Token-basierter Zuordnung

### Zielbranche
Finanzdienstleistungen, insbesondere:
- Kreditvermittlung
- Immobilienfinanzierung
- Versicherungsvermittlung

In diesen Branchen ist die Ausübung von Beratungstätigkeiten an Lizenzen gebunden. Werbedienstleister dürfen Leads generieren, aber keine Beratung durchführen.

### Regulatorische Relevanz
Das System stellt sicher, dass:
- Werbedienstleister keine unerlaubte Beratung durchführen
- Qualifizierung durch autorisierte Stellen erfolgt
- Dokumenten-Upload nachvollziehbar einem Lead zugeordnet werden kann
- Datenflüsse transparent und auditierbar sind
- Übergabepunkte zwischen Rollen klar dokumentiert sind

## 2. Rollen & Verantwortlichkeiten

### Lead (Endkunde)
**Verantwortlichkeiten:**
- Ausfüllen des Funnel-Formulars
- Bereitstellung korrekter Kontaktdaten
- Upload von angeforderten Dokumenten über tokengeschützte URL

**Interaktionspunkte:**
- Frontend-Funnel (rechner.html)
- Upload-Seite (upload-final.html)

**Datenhoheit:**
- Eigentümer der persönlichen Daten
- Muss Datenschutzerklärung akzeptieren

### Werbedienstleister
**Verantwortlichkeiten:**
- Bereitstellung des Lead-Funnels
- Technischer Betrieb der Lead-Erfassungsinfrastruktur
- Weiterleitung von Leads an Pre-Qualification

**Ausdrücklich NICHT erlaubt:**
- Finanzielle Beratung
- Produktempfehlungen
- Vertragsabschlüsse
- Bonitätsprüfungen

**Technische Systeme:**
- Frontend (HTML/JS)
- Make.com Automatisierung
- Airtable (Lead-Datenbank)

### Call / Pre-Qualification
**Verantwortlichkeiten:**
- Telefonische Kontaktaufnahme mit Lead
- Vorqualifizierung (Plausibilitätsprüfung)
- Feststellung der Beratungsbereitschaft
- Einholung der Zustimmung zur Weitergabe
- Dokumentation im Pre-Qualification Record

**Ausdrücklich NICHT erlaubt:**
- Verbindliche Zusagen
- Konditionenverhandlungen
- Vertragsabschlüsse

**Datenquellen:**
- Airtable Tabelle "Leads"
- Airtable Tabelle "Pre-Qualification"

**Ausgabe:**
- Aktualisierter Pre-Qualification Record mit Status

### Fachpartner (z.B. RS Finance)
**Verantwortlichkeiten:**
- Qualifizierte Finanzberatung
- Angebotserstellung
- Vertragsabschluss
- Compliance mit regulatorischen Anforderungen

**Datenquellen:**
- Qualifizierte Leads aus Pre-Qualification
- Hochgeladene Dokumente (OneDrive)
- Airtable "Handover" Tabelle

**Rechtliche Grundlage:**
- Gewerberechtliche Befugnis
- Konzessionierung (falls erforderlich)

### Systeme

#### Frontend (Stateless)
- Lead-Funnel (rechner.html, script.js)
- Upload-Seite (upload-final.html)
- Hosting: Vercel
- Domain: rs-finanzierung.at

#### Make.com (Orchestrierung)
- Workflow-Automatisierung
- Datenvalidierung
- API-Integrationen
- Webhook-basierte Trigger

#### Airtable (Datenhaltung)
- Lead-Datenbank
- Pre-Qualification Records
- Handover Tracking
- Relationship Management via Linked Records

#### OneDrive (File Storage)
- Dokumentenspeicher
- Ordnerstruktur nach Token
- Zugriffskontrolle

## 3. Gesamtarchitektur (High Level)

### Komponenten-Übersicht

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│  ┌──────────────┐              ┌──────────────┐            │
│  │ rechner.html │              │upload-final  │            │
│  │  script.js   │              │    .html     │            │
│  └──────┬───────┘              └───────┬──────┘            │
│         │                              │                    │
│         │ POST /webhook                │ POST /validate    │
│         │ (Lead + Token)               │ POST /upload      │
└─────────┼──────────────────────────────┼────────────────────┘
          │                              │
          ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       MAKE.COM                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Scenario 1: Lead Registration                        │  │
│  │ - Webhook Trigger                                    │  │
│  │ - Create Lead (Airtable)                             │  │
│  │ - Create Pre-Qualification (Airtable)                │  │
│  │ - Generate Upload URL                                │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Scenario 2: Token Validation                         │  │
│  │ - Webhook Trigger                                    │  │
│  │ - Search Records (Airtable)                          │  │
│  │ - Return {valid: true/false}                         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Scenario 3: Document Upload                          │  │
│  │ - Webhook Trigger (multipart/form-data)              │  │
│  │ - Validate Token                                     │  │
│  │ - Upload to OneDrive                                 │  │
│  │ - Update upload_status                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────┬───────────────────────┬───────────────────────┘
              │                       │
              ▼                       ▼
┌─────────────────────────┐  ┌─────────────────────────┐
│      AIRTABLE           │  │      ONEDRIVE           │
│  ┌──────────────────┐   │  │  ┌──────────────────┐   │
│  │ Leads            │   │  │  │ /Uploads/        │   │
│  ├──────────────────┤   │  │  │  └─ {token}/     │   │
│  │ Pre-Qualification│   │  │  │     └─ files     │   │
│  ├──────────────────┤   │  │  └──────────────────┘   │
│  │ Handover         │   │  │                         │
│  └──────────────────┘   │  └─────────────────────────┘
└─────────────────────────┘
```

### Systemgrenzen

**Frontend (Client-Side):**
- HTML, CSS, JavaScript (Vanilla)
- Keine serverseitige Logik
- Token-Generierung erfolgt clientseitig (kryptografisch sicher)
- Stateless: Keine Session-Verwaltung

**Make.com (Backend Logic):**
- Workflow-Orchestrierung
- Datenvalidierung
- API-Aufrufe an Airtable und OneDrive
- Webhook-basierte Trigger (HTTP POST)

**Airtable (Data Layer):**
- Persistente Datenhaltung
- Relationen via Linked Records
- Lookups für Datenintegration
- Keine Business-Logik

**OneDrive (File Storage):**
- Datei-Persistierung
- Ordnerstruktur-Verwaltung
- Kein direkter Frontend-Zugriff

### Kommunikationsprotokolle

| Von | Nach | Protokoll | Format | Zweck |
|-----|------|-----------|--------|-------|
| Frontend Funnel | Make Scenario 1 | HTTPS POST | JSON | Lead + Token übermitteln |
| Frontend Upload | Make Scenario 2 | HTTPS POST | JSON | Token validieren |
| Frontend Upload | Make Scenario 3 | HTTPS POST | multipart/form-data | Dateien hochladen |
| Make | Airtable | HTTPS (Airtable API) | JSON | CRUD Operations |
| Make | OneDrive | HTTPS (Graph API) | Binary + JSON | Datei-Upload |

## 4. Datenobjekte & Schlüsselkonzepte

### Lead

**Zweck:**
Zentrale Entität zur Speicherung von Interessentendaten aus dem Funnel.

**Felder (Airtable Tabelle "Leads"):**

| Feldname | Typ | Pflicht | Herkunft | Zweck |
|----------|-----|---------|----------|-------|
| Vorname | Single Line Text | Ja | Funnel | Identifikation |
| Nachname | Single Line Text | Ja | Funnel | Identifikation |
| E-Mail | Email | Ja | Funnel | Kontakt |
| Telefon | Phone | Ja | Funnel | Kontakt |
| Finanzierungsart | Single Select | Ja | Funnel | kauf, bau, umschuldung, sanierung |
| Betrag | Currency | Ja | Funnel | Darlehenssumme |
| Eigenkapital | Currency | Ja | Funnel | Verfügbares EK |
| Monatliche Rate | Currency | Ja | Funnel | Kalkulierte Rate |
| Rate Realistisch | Single Select | Ja | Funnel | ja, vielleicht, nein |
| Entscheidungszeitraum | Single Select | Ja | Funnel | sofort, monate, offen |
| Nachricht | Long Text | Nein | Funnel | Freitext |
| upload_token | Single Line Text | Ja | Funnel (generiert) | Eindeutiger Zugangsschlüssel |
| upload_status | Single Select | Ja | Funnel (initial: "offen") | offen, abgeschlossen |
| Pre-Qualification | Linked Record | Nein | Make (auto-link) | 1:1 Verknüpfung |
| Erstellt am | Created Time | Auto | System | Audit |

**Herkunft:**
Wird durch Make Scenario 1 erstellt, nachdem Funnel-Daten via Webhook empfangen wurden.

**Lebenszyklus:**
1. Lead-Erstellung (Make): Alle Funnel-Daten + generierter Token
2. Pre-Qualification-Verknüpfung (Make): Automatisch
3. Upload-Status-Update (Make): Bei erfolgreichem Dokumenten-Upload
4. Handover (manuell/automatisiert): Lead wird qualifiziert weitergegeben

**Kritische Abhängigkeiten:**
- `upload_token` muss eindeutig sein (keine Duplikate)
- `upload_status` steuert, ob Upload noch möglich ist

### Upload-Token

**Zweck:**
Einmaliger, kryptografisch sicherer Schlüssel zur Authentifizierung von Dokumenten-Uploads ohne Benutzer-Login.

**Erzeugung:**
```javascript
function generateUploadToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < array.length; i++) {
        token += chars[array[i] % chars.length];
    }
    return token;
}
```

**Eigenschaften:**
- Länge: 32 Zeichen
- Zeichensatz: a-zA-Z0-9 (Base62)
- Entropie: ~190 Bit
- Kollisionswahrscheinlichkeit: vernachlässigbar

**Speicherorte:**
- Airtable (Tabelle "Leads", Feld `upload_token`)
- Frontend (nur zur Übertragung, nicht persistent)
- URL-Parameter der Upload-Seite

**Verwendung:**
1. Funnel generiert Token bei Submit
2. Token wird mit Lead-Daten an Make gesendet
3. Make speichert Token in Airtable
4. Make generiert Upload-URL: `https://rs-finanzierung.at/upload-final?token={TOKEN}`
5. Upload-Seite extrahiert Token aus URL
6. Upload-Seite validiert Token via Make Scenario 2
7. Bei Dokumenten-Upload wird Token mitgesendet (Make Scenario 3)

**Gültigkeitsbedingungen:**
- Token existiert in Airtable (Tabelle "Leads")
- `upload_status` = "offen"
- Token wurde noch nicht für Upload verwendet (optional: kann auch mehrfach verwendet werden)

**Warum NICHT auf Upload-Seite erzeugt:**
- Upload-Seite muss stateless sein
- Token muss vor Upload-Seite existieren (für Validierung)
- Lead muss bereits in Airtable vorhanden sein, bevor Upload möglich ist
- Single Source of Truth: Funnel

### Pre-Qualification

**Zweck:**
Dokumentation der Vorqualifizierung durch Call-Team. Trennt Lead-Erfassung von Qualifizierung.

**Felder (Airtable Tabelle "Pre-Qualification"):**

| Feldname | Typ | Pflicht | Herkunft | Zweck |
|----------|-----|---------|----------|-------|
| Lead | Linked Record | Ja | Make (auto) | 1:1 Verknüpfung zu "Leads" |
| Call-Status | Single Select | Ja | Make (initial: "offen") | offen, kontaktiert, qualifiziert, abgelehnt |
| Empfehlung | Single Select | Nein | Call-Team | weitergeben, ablehnen, nachfassen |
| Kommentar | Long Text | Nein | Call-Team | Freitext-Notizen |
| Kontaktiert am | Date | Nein | Call-Team | Zeitstempel |
| Qualifiziert von | Single Select | Nein | Call-Team | Name des Mitarbeiters |
| Erstellt am | Created Time | Auto | System | Audit |

**Herkunft:**
Wird automatisch von Make Scenario 1 erstellt, unmittelbar nach Lead-Erstellung.

**Lebenszyklus:**
1. Erstellung (Make): Initial mit Call-Status "offen"
2. Bearbeitung (Call-Team): Status-Updates, Kommentare
3. Abschluss (Call-Team): Call-Status → "qualifiziert" oder "abgelehnt"
4. Handover (optional): Basis für Übergabe an Fachpartner

**Kritische Abhängigkeiten:**
- MUSS 1:1 Verknüpfung zu Lead haben
- Call-Status "offen" signalisiert Handlungsbedarf

### Handover

**Zweck:**
Dokumentierte Übergabe qualifizierter Leads an Fachpartner (z.B. RS Finance).

**Felder (Airtable Tabelle "Handover"):**

| Feldname | Typ | Pflicht | Herkunft | Zweck |
|----------|-----|---------|----------|-------|
| Lead | Linked Record | Ja | Manuell | Verknüpfung zu "Leads" |
| Pre-Qualification | Linked Record | Ja | Lookup | Auto-Link via Lead |
| Übergeben am | Date | Ja | System/Manuell | Zeitstempel |
| Übergeben an | Single Select | Ja | Manuell | Fachpartner-Name |
| Status | Single Select | Ja | Manuell | offen, in Bearbeitung, abgeschlossen |
| Dokumente vollständig | Checkbox | Nein | Manuell | Upload-Check |
| Notizen | Long Text | Nein | Manuell | Freitext |

**Herkunft:**
Manuell oder via Automatisierung, nachdem Pre-Qualification abgeschlossen ist.

**Lebenszyklus:**
1. Erstellung: Nach erfolgreicher Pre-Qualification
2. Tracking: Fachpartner arbeitet Lead ab
3. Abschluss: Status → "abgeschlossen"

**Kritische Abhängigkeiten:**
- Pre-Qualification muss Status "qualifiziert" haben
- Dokumente sollten hochgeladen sein (upload_status = "abgeschlossen")

### Upload-Status

**Zweck:**
Status-Flag zur Steuerung der Upload-Berechtigung und Tracking des Upload-Fortschritts.

**Werte (Single Select in Airtable):**

| Wert | Bedeutung | Wer setzt | Wann |
|------|-----------|-----------|------|
| offen | Upload möglich, noch nicht erfolgt | Make (initial) | Bei Lead-Erstellung |
| abgeschlossen | Upload erfolgt, Token verbraucht | Make (Scenario 3) | Nach erfolgreichem Upload |

**Verwendung:**
- Token-Validierung (Make Scenario 2): Nur "offen" → valid=true
- Upload-Seite: Zeigt Form nur bei "offen"
- Optional: Mehrfach-Uploads erlauben (dann Status nicht ändern)

**Kritische Logik:**
```
IF upload_status = "offen" AND token exists:
    → Upload erlauben
ELSE:
    → Upload verweigern, Fehlermeldung anzeigen
```

### Dateien

**Zweck:**
Hochgeladene Dokumente (Einkommensnachweise, Grundbuchauszüge, etc.) zur Bearbeitung durch Fachpartner.

**Metadaten:**

| Attribut | Quelle | Speicherort | Zweck |
|----------|--------|-------------|-------|
| Dateiname | Upload-Formular | OneDrive | Original-Dateiname |
| Token | upload_token (aus Lead) | OneDrive-Ordnername | Zuordnung zu Lead |
| Upload-Zeitstempel | Make (current time) | OneDrive (Datei-Metadaten) | Audit |
| Dateigröße | Browser | OneDrive | Technisch |
| MIME-Type | Browser | OneDrive | Validierung |

**OneDrive Ordnerstruktur:**
```
/Uploads/
  └─ {upload_token}/
      ├─ datei1.pdf
      ├─ datei2.jpg
      └─ datei3.png
```

**Erlaubte Formate:**
- PDF (application/pdf)
- JPEG/JPG (image/jpeg)
- PNG (image/png)

**Größenlimit:**
- Max. 10 MB pro Datei (validiert im Frontend)

**Zugriffskontrolle:**
- Nur via Make (kein direkter Frontend-Zugriff)
- Fachpartner erhält Zugriff via OneDrive-Freigabe

## 5. Funnel-Flow (Frontend)

### Seiten

**Landing Page (index.html):**
- Marketing-Informationen
- CTA: "Finanzierung berechnen"
- Link zu rechner.html

**Funnel/Rechner (rechner.html):**
- Multi-Step-Formular (7 Schritte)
- Client-seitige Validierung
- Token-Generierung bei Submit
- Webhook-Call an Make

**Upload-Seite (upload-final.html):**
- Token-Validierung via URL-Parameter
- Datei-Upload-Formular
- Client-seitige Dateivalidierung
- Upload via Make Webhook

### Funnel-Schritte (rechner.html)

**Schritt 1: Willkommen**
- Begrüßung
- Keine Dateneingabe
- Button: "Jetzt starten"

**Schritt 2: Finanzierungsart**
- Auswahl: kauf, bau, umschuldung, sanierung
- Pflichtfeld
- Visuell: Option-Cards mit Icons

**Schritt 3: Finanzierungsdetails**
- Darlehensbetrag (Slider: 100.000 - 1.000.000)
- Eigenkapital (Slider: 0 - 500.000)
- Laufzeit (Slider: 5 - 35 Jahre)
- Kalkulierte monatliche Rate (automatisch berechnet)

**Schritt 4: Raten-Realismus**
- Frage: "Ist diese Rate für Sie realistisch?"
- Auswahl: ja, vielleicht, nein
- Pflichtfeld

**Schritt 5: Entscheidungszeitraum**
- Frage: "Wann möchten Sie eine Entscheidung treffen?"
- Auswahl: sofort, monate, offen
- Pflichtfeld

**Schritt 6: Kontaktdaten**
- Vorname (Text, Pflicht)
- Nachname (Text, Pflicht)
- E-Mail (Email-Validierung, Pflicht)
- Telefon (Text, Pflicht)
- Nachricht (Textarea, optional)
- Datenschutz-Checkbox (Pflicht)
- Marketing-Checkbox (optional)

**Schritt 7: Bestätigung**
- Danke-Nachricht
- Hinweis: "Wir melden uns in Kürze"
- Optional: Upload-Link anzeigen (falls Token-URL bekannt)

### Token-Generierung (Zeitpunkt)

**Trigger:**
Klick auf "Angebot anfordern" (Submit-Button in Schritt 6)

**Ablauf:**
```javascript
// 1. Validierung der Kontaktdaten
if (!validateContactForm()) return;

// 2. Token-Generierung
const uploadToken = generateUploadToken();
console.log('Generated upload token:', uploadToken);

// 3. Payload zusammenstellen
const payload = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phone: formData.phone,
    financingType: formData.financingType,
    loanAmount: formData.loanAmount,
    equity: formData.equity,
    monthlyRate: formData.monthlyRate,
    rateRealistic: formData.rateRealistic,
    decisionTimeline: formData.decisionTimeline,
    message: formData.message || '',
    upload_token: uploadToken,
    upload_status: 'offen'
};

// 4. Webhook-Call
fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
});
```

### Webhook-Aufruf

**URL:**
```
https://hook.eu2.make.com/kjqducl2q4jfp0p8ti13xi8gripfznyy
```

**Methode:** POST

**Content-Type:** application/json

**Payload-Struktur:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "financingType": "kauf|bau|umschuldung|sanierung",
  "loanAmount": number,
  "equity": number,
  "monthlyRate": number,
  "rateRealistic": "ja|vielleicht|nein",
  "decisionTimeline": "sofort|monate|offen",
  "message": "string",
  "upload_token": "string (32 chars)",
  "upload_status": "offen"
}
```

**Fehlerbehandlung:**
```javascript
.catch(error => {
    console.error('Fehler beim Senden:', error);
    alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    // Button zurücksetzen
});
```

## 6. Token-Architektur (KRITISCH)

### Grundprinzipien

**Single Source of Truth:**
- Token wird AUSSCHLIESSLICH im Funnel (rechner.html, script.js) erzeugt
- Upload-Seite erzeugt NIEMALS Tokens
- Make erzeugt NIEMALS Tokens
- Airtable erzeugt NIEMALS Tokens

**Timing:**
1. User füllt Funnel aus
2. User klickt "Angebot anfordern"
3. Validierung erfolgreich → Token wird erzeugt
4. Token + Lead-Daten werden an Make gesendet
5. Make speichert Token in Airtable
6. Upload-Seite validiert Token gegen Airtable

**Warum nicht auf Upload-Seite:**
- Upload-Seite muss Token bereits kennen (URL-Parameter)
- Token muss VOR Upload existieren (für Validierung)
- Lead muss in Airtable existieren, bevor Upload möglich ist
- Verhindert Race Conditions
- Verhindert Token-Duplikate
- Klare Zuordnung: 1 Token = 1 Lead

### Token-Erzeugung (Technisch)

**Algorithmus:**
```javascript
function generateUploadToken() {
    // 1. Kryptografisch sichere Zufallszahlen
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);

    // 2. Mapping zu Base62 (a-zA-Z0-9)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';

    for (let i = 0; i < array.length; i++) {
        token += chars[array[i] % chars.length];
    }

    return token;
}
```

**Sicherheitseigenschaften:**
- Verwendet Web Crypto API (window.crypto.getRandomValues)
- Keine deterministischen Seeds (Math.random wäre unsicher)
- 32 Byte Entropie → 190 Bit Sicherheit
- Kollisionswahrscheinlichkeit: 1 : 2^190

**Einmaligkeit:**
- Praktisch unmöglich, dass zwei Tokens identisch sind
- Keine Prüfung auf Duplikate in Airtable erforderlich
- Token ist selbst ausreichend eindeutig

### Token-Speicherung

**Airtable (Persistent):**
- Tabelle: "Leads"
- Feld: `upload_token` (Single Line Text)
- Indexiert: Nein (Airtable hat keine Indizes, aber Suche ist schnell)
- Unique Constraint: Nein (aber praktisch einmalig)

**Frontend (Transient):**
- Nur im Scope der submitForm()-Funktion
- Wird NICHT in localStorage gespeichert
- Wird NICHT in Cookies gespeichert
- Wird NICHT in sessionStorage gespeichert

**URL (Transport):**
- Upload-URL: `https://rs-finanzierung.at/upload-final?token={TOKEN}`
- Query-Parameter: `token`
- User erhält URL via E-Mail oder direkt nach Funnel-Submit

### Token-Validierung

**Wann validiert:**
- Beim Laden der Upload-Seite (Page Load)
- VOR Anzeige des Upload-Formulars

**Ablauf:**
```javascript
// 1. Token aus URL extrahieren
const urlParams = new URLSearchParams(window.location.search);
const uploadToken = urlParams.get('token');

// 2. Validierung via Make Webhook
const response = await fetch(WEBHOOK_VALIDATE_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: uploadToken })
});

const result = await response.json();

// 3. Entscheidung
if (result.valid === true) {
    // Upload-Form anzeigen
    mainContent.style.display = 'block';
} else {
    // Fehlerzustand anzeigen
    errorState.classList.add('show');
}
```

**Make Scenario 2 (Token-Validierung):**
1. Webhook empfängt `{ token: "..." }`
2. Airtable: Search Records
   - Tabelle: "Leads"
   - Filter: `upload_token = {token}` AND `upload_status = "offen"`
3. Router:
   - IF Records gefunden: Return `{ valid: true }`
   - ELSE: Return `{ valid: false }`

**Response-Format:**
```json
{ "valid": true }
```
oder
```json
{ "valid": false }
```

### Token-Gültigkeit

**Bedingungen für valid=true:**
- Token existiert in Airtable (Tabelle "Leads", Feld `upload_token`)
- `upload_status` = "offen"
- (Optional) Zeitstempel-Check: Lead nicht älter als X Tage

**Bedingungen für valid=false:**
- Token nicht gefunden
- `upload_status` = "abgeschlossen"
- (Optional) Token abgelaufen

**Statusübergang:**
```
offen → abgeschlossen
```
Erfolgt in Make Scenario 3 nach erfolgreichem Upload.

### Warum NICHT auf Upload-Seite erzeugt

**Problem 1: Chicken-Egg**
- Upload-Seite benötigt Token zur Validierung
- Wie soll Token validiert werden, wenn er gerade erst erzeugt wurde?
- Lead muss ZUERST in Airtable sein, DANN Upload

**Problem 2: Race Conditions**
- User könnte Upload-Seite mehrfach öffnen
- Jedes Mal würde neuer Token erzeugt
- Welcher Token ist der "richtige"?
- Mehrere Tokens pro Lead = Chaos

**Problem 3: Lead-Zuordnung**
- Token auf Upload-Seite erzeugt → zu welchem Lead gehört er?
- Keine Kontaktdaten auf Upload-Seite vorhanden
- Zuordnung unmöglich

**Problem 4: Single Source of Truth**
- Funnel ist die EINZIGE Quelle für Lead-Daten
- Token ist TEIL der Lead-Daten
- Token muss MIT Lead-Daten erzeugt werden
- Klare Verantwortlichkeit: Funnel

**Korrekte Architektur:**
```
Funnel Submit
  → Token erzeugen
  → Lead + Token an Make
  → Make speichert in Airtable
  → Upload-URL mit Token generieren
  → User öffnet Upload-URL
  → Upload-Seite validiert Token
  → Upload-Seite zeigt Form (wenn valid)
```

## 7. Make.com – Szenarien (Detailiert)

### Scenario 1: Lead Registration + Pre-Qualification

**Zweck:**
Empfang von Lead-Daten aus Funnel, Speicherung in Airtable, automatische Erstellung eines Pre-Qualification Records.

**Trigger:**
Custom Webhook (HTTP POST)

**Webhook-URL:**
```
https://hook.eu2.make.com/kjqducl2q4jfp0p8ti13xi8gripfznyy
```

**Module in Reihenfolge:**

**1. Custom Webhook**
- Empfängt JSON Payload
- Struktur siehe Kapitel 5 (Funnel-Flow)
- Keine Validierung in diesem Modul (wird in Airtable durchgeführt)

**2. Airtable: Create Record (Leads)**
- Base: {Ihre Airtable Base}
- Table: "Leads"
- Feldmapping:

| Airtable-Feld | Make-Variable | Typ |
|---------------|---------------|-----|
| Vorname | `{{1.firstName}}` | Text |
| Nachname | `{{1.lastName}}` | Text |
| E-Mail | `{{1.email}}` | Email |
| Telefon | `{{1.phone}}` | Text |
| Finanzierungsart | `{{1.financingType}}` | Single Select |
| Betrag | `{{1.loanAmount}}` | Number |
| Eigenkapital | `{{1.equity}}` | Number |
| Monatliche Rate | `{{1.monthlyRate}}` | Number |
| Rate Realistisch | `{{1.rateRealistic}}` | Single Select |
| Entscheidungszeitraum | `{{1.decisionTimeline}}` | Single Select |
| Nachricht | `{{1.message}}` | Long Text |
| upload_token | `{{1.upload_token}}` | Text |
| upload_status | `{{1.upload_status}}` | Single Select |

**Output:** Record ID (z.B. `rec1234567890abc`)

**3. Airtable: Create Record (Pre-Qualification)**
- Base: {Ihre Airtable Base}
- Table: "Pre-Qualification"
- Feldmapping:

| Airtable-Feld | Make-Variable | Typ |
|---------------|---------------|-----|
| Lead | `{{2.id}}` | Linked Record |
| Call-Status | `"offen"` (statisch) | Single Select |
| Empfehlung | (leer) | Single Select |
| Kommentar | (leer) | Long Text |

**Output:** Record ID

**4. (Optional) Text: Generate Upload URL**
- Formel: `https://rs-finanzierung.at/upload-final?token={{1.upload_token}}`
- Output: String (Upload-URL)

**5. (Optional) Airtable: Update Record (Leads)**
- Base: {Ihre Airtable Base}
- Table: "Leads"
- Record ID: `{{2.id}}`
- Feldmapping:

| Airtable-Feld | Make-Variable |
|---------------|---------------|
| Upload-URL | `{{4.output}}` |

**6. WebHook Response**
- Status: 200
- Body: `Accepted`

**Kritische Mapping-Punkte:**

**Single Select Felder:**
- Airtable erwartet EXAKTE Übereinstimmung mit vorkonfigurierten Optionen
- Wenn Funnel "kauf" sendet, muss Airtable-Option auch "kauf" heißen (nicht "Kauf")
- Bei Mismatch: Airtable-Error 422 "Insufficient permissions to create new select option"

**Lösung:**
- Vorkonfigurierte Optionen in Airtable:
  - Finanzierungsart: kauf, bau, umschuldung, sanierung
  - Rate Realistisch: ja, vielleicht, nein
  - Entscheidungszeitraum: sofort, monate, offen
  - upload_status: offen, abgeschlossen
  - Call-Status: offen, kontaktiert, qualifiziert, abgelehnt

**Linked Record (Pre-Qualification → Lead):**
- Modul 3 verwendet `{{2.id}}` (Output von Modul 2)
- Airtable erkennt automatisch, dass es sich um Linked Record handelt
- Keine zusätzliche Suche erforderlich

**Typische Fehlerquellen:**

**Fehler 1: Single Select Options nicht vorhanden**
- Symptom: HTTP 422 Error
- Lösung: In Airtable alle Optionen manuell vorkonfigurieren

**Fehler 2: Feldnamen-Mismatch**
- Symptom: Felder bleiben leer
- Lösung: Exakte Schreibweise prüfen (Groß-/Kleinschreibung, Leerzeichen)

**Fehler 3: Linked Record nicht verknüpft**
- Symptom: Pre-Qualification hat kein Lead
- Lösung: Modul 3 muss `{{2.id}}` verwenden, nicht `{{1.upload_token}}`

### Scenario 2: Token Validation

**Zweck:**
Validierung eines Upload-Tokens gegen Airtable. Rückgabe von `{valid: true/false}`.

**Trigger:**
Custom Webhook (HTTP POST)

**Webhook-URL:**
```
https://hook.eu2.make.com/c17oggbup320rk3rml2xbyzcullbxtzy
```

**Module in Reihenfolge:**

**1. Custom Webhook**
- Empfängt JSON: `{ "token": "string" }`

**2. Airtable: Search Records**
- Base: {Ihre Airtable Base}
- Table: "Leads"
- Formula:
```
AND(
  {upload_token} = "{{1.token}}",
  {upload_status} = "offen"
)
```
- Max Records: 1

**Output:**
- Array of Records (leer oder 1 Record)

**3. Router (2 Paths)**

**Path A (Record gefunden):**
- Condition: `{{length(2.array)}} > 0`
- Module: WebHook Response
  - Status: 200
  - Content-Type: application/json
  - Body:
```json
{
  "valid": true
}
```

**Path B (Kein Record):**
- Condition: `{{length(2.array)}} = 0`
- Module: WebHook Response
  - Status: 200
  - Content-Type: application/json
  - Body:
```json
{
  "valid": false
}
```

**Kritische Punkte:**

**Airtable Formula Syntax:**
- Feldnamen in geschweifte Klammern: `{upload_token}`
- String-Vergleich mit Anführungszeichen: `"{{1.token}}"`
- AND-Funktion: `AND(bedingung1, bedingung2)`

**Router-Bedingung:**
- `length()` gibt Anzahl der Elemente in Array zurück
- `{{2.array}}` ist Output von Modul 2 (Airtable Search)
- Wenn Records gefunden: length > 0
- Wenn keine Records: length = 0

**WebHook Response:**
- MUSS in beiden Router-Paths vorhanden sein
- MUSS identisches Format haben (`{valid: boolean}`)
- Content-Type MUSS `application/json` sein

**Typische Fehlerquellen:**

**Fehler 1: Immer valid=false**
- Ursache: Airtable Formula falsch
- Debug: Modul 2 manuell testen, Records-Output prüfen
- Lösung: Formula-Syntax korrigieren

**Fehler 2: Keine Response**
- Ursache: WebHook Response fehlt in einem Router-Path
- Lösung: Beide Paths mit WebHook Response ausstatten

**Fehler 3: Frontend erhält HTML statt JSON**
- Ursache: Content-Type nicht gesetzt
- Lösung: Explizit `application/json` setzen

### Scenario 3: Document Upload

**Zweck:**
Empfang von Dateien via multipart/form-data, Upload zu OneDrive, Status-Update in Airtable.

**Trigger:**
Custom Webhook (HTTP POST, multipart/form-data)

**Webhook-URL:**
```
https://hook.eu2.make.com/r46106bxn3snsjlisj1iv208po45wvyp
```

**Module in Reihenfolge:**

**1. Custom Webhook**
- Empfängt multipart/form-data
- Felder:
  - `token` (Text)
  - `files` (File Array)

**2. Airtable: Search Records**
- Base: {Ihre Airtable Base}
- Table: "Leads"
- Formula:
```
AND(
  {upload_token} = "{{1.token}}",
  {upload_status} = "offen"
)
```
- Max Records: 1

**3. Router (2 Paths)**

**Path A (Token ungültig):**
- Condition: `{{length(2.array)}} = 0`
- Module: WebHook Response
  - Status: 403
  - Body: `Invalid or expired token`

**Path B (Token gültig):**
- Condition: `{{length(2.array)}} > 0`
- Fortsetzung mit Modulen 4-7

**4. Iterator (Dateien)**
- Source: `{{1.files}}`
- Iteriert über jede hochgeladene Datei

**5. OneDrive: Create Folder**
- Folder Path: `/Uploads/{{1.token}}`
- Falls Ordner existiert: Ignorieren (kein Fehler)

**6. OneDrive: Upload File**
- Folder Path: `/Uploads/{{1.token}}`
- File Name: `{{4.name}}`
- File Data: `{{4.data}}`

**7. Airtable: Update Record**
- Base: {Ihre Airtable Base}
- Table: "Leads"
- Record ID: `{{first(2.array).id}}`
- Feldmapping:

| Airtable-Feld | Make-Variable |
|---------------|---------------|
| upload_status | `"abgeschlossen"` |

**8. WebHook Response**
- Status: 200
- Body: `Accepted`

**Kritische Punkte:**

**Multipart/form-data Handling:**
- Custom Webhook erkennt automatisch multipart
- `{{1.files}}` ist Array von Objekten: `[{name, data, type, size}, ...]`
- `{{1.token}}` ist separates Feld (kein File)

**Iterator:**
- MUSS zwischen Modul 3 und 6 stehen
- Iteriert über `{{1.files}}` Array
- Jede Datei wird einzeln hochgeladen (Modul 6 wird mehrfach ausgeführt)

**OneDrive Folder Creation:**
- Modul 5 MUSS VOR Modul 6 stehen
- Falls Ordner existiert: Kein Fehler (Idempotent)
- Ordnername: Upload-Token (eindeutig)

**OneDrive File Upload:**
- File Name: Original-Dateiname ({{4.name}})
- File Data: Binary ({{4.data}})
- Überschreiben: Ja (falls Datei mit gleichem Namen existiert)

**Airtable Update:**
- Modul 7 läuft NACH Iterator (nur 1x, nicht pro Datei)
- `first(2.array).id` extrahiert Record ID aus Search-Ergebnis
- upload_status wird auf "abgeschlossen" gesetzt

**Typische Fehlerquellen:**

**Fehler 1: Dateien kommen nicht an**
- Ursache: Iterator fehlt oder falsch konfiguriert
- Lösung: Iterator mit Source `{{1.files}}` einfügen

**Fehler 2: Ordner nicht gefunden**
- Ursache: Modul 5 (Create Folder) fehlt oder steht nach Modul 6
- Lösung: Modul 5 VOR Modul 6 platzieren

**Fehler 3: upload_status wird nicht aktualisiert**
- Ursache: Modul 7 steht innerhalb Iterator (wird pro Datei ausgeführt, letzter Durchlauf überschreibt)
- Lösung: Modul 7 NACH Iterator platzieren

**Fehler 4: "first() of empty array"**
- Ursache: Modul 2 findet keinen Record (Token ungültig), aber Modul 7 wird trotzdem ausgeführt
- Lösung: Router (Modul 3) verwenden, Modul 7 nur in Path B

### Scenario 4 (Optional): Email Notification

**Zweck:**
Versand einer E-Mail an Lead mit Upload-URL.

**Trigger:**
Airtable Watch Records (Tabelle "Leads", neuer Record)

**Module:**

**1. Airtable: Watch Records**
- Table: "Leads"
- Trigger Field: "Created Time"

**2. Email: Send Email**
- To: `{{1.E-Mail}}`
- Subject: "Ihre Finanzierungsanfrage"
- Body:
```
Hallo {{1.Vorname}} {{1.Nachname}},

vielen Dank für Ihre Anfrage.

Bitte laden Sie Ihre Dokumente unter folgendem Link hoch:
https://rs-finanzierung.at/upload-final?token={{1.upload_token}}

Mit freundlichen Grüßen
Ihr Team
```

**Kritische Punkte:**

**Datenschutz:**
- E-Mail enthält Upload-Token (sensibel!)
- E-Mail-Übertragung MUSS verschlüsselt sein (TLS)
- Empfänger-Adresse MUSS korrekt sein (Typo = Datenleck)

**Alternative:**
- Upload-URL NICHT per E-Mail senden
- Upload-URL auf Danke-Seite anzeigen (nach Funnel-Submit)
- User notiert sich URL selbst

## 8. Airtable – Datenmodell

### Tabellenübersicht

| Tabelle | Zweck | Primary Key | Beziehungen |
|---------|-------|-------------|-------------|
| Leads | Lead-Datenbank | Record ID | → Pre-Qualification (1:1) |
| Pre-Qualification | Vorqualifizierung | Record ID | ← Lead (1:1), → Handover (1:n) |
| Handover | Übergabe an Fachpartner | Record ID | ← Pre-Qualification (n:1) |

### Tabelle: Leads

**Felder:**

| Feldname | Typ | Pflicht | Index | Beschreibung |
|----------|-----|---------|-------|--------------|
| Vorname | Single Line Text | Ja | Nein | Vorname des Leads |
| Nachname | Single Line Text | Ja | Nein | Nachname des Leads |
| E-Mail | Email | Ja | Nein | Kontakt-E-Mail |
| Telefon | Phone | Ja | Nein | Telefonnummer |
| Finanzierungsart | Single Select | Ja | Nein | kauf, bau, umschuldung, sanierung |
| Betrag | Currency (EUR) | Ja | Nein | Darlehenssumme |
| Eigenkapital | Currency (EUR) | Ja | Nein | Verfügbares Eigenkapital |
| Monatliche Rate | Currency (EUR) | Ja | Nein | Kalkulierte monatliche Rate |
| Rate Realistisch | Single Select | Ja | Nein | ja, vielleicht, nein |
| Entscheidungszeitraum | Single Select | Ja | Nein | sofort, monate, offen |
| Nachricht | Long Text | Nein | Nein | Freitext vom Lead |
| upload_token | Single Line Text | Ja | Nein | Eindeutiger Upload-Schlüssel |
| upload_status | Single Select | Ja | Nein | offen, abgeschlossen |
| Upload-URL | URL | Nein | Nein | Generierte Upload-URL |
| Pre-Qualification | Linked Record | Nein | Nein | Verknüpfung zu Pre-Qualification |
| Erstellt am | Created Time | Auto | Nein | Timestamp (automatisch) |

**Linked Records:**
- Pre-Qualification (1:1)
  - Feldtyp: Link to another record
  - Verknüpfte Tabelle: "Pre-Qualification"
  - Allow linking to multiple records: Nein

### Tabelle: Pre-Qualification

**Felder:**

| Feldname | Typ | Pflicht | Index | Beschreibung |
|----------|-----|---------|-------|--------------|
| Lead | Linked Record | Ja | Nein | Verknüpfung zu "Leads" |
| Call-Status | Single Select | Ja | Nein | offen, kontaktiert, qualifiziert, abgelehnt |
| Empfehlung | Single Select | Nein | Nein | weitergeben, ablehnen, nachfassen |
| Kommentar | Long Text | Nein | Nein | Freitext-Notizen |
| Kontaktiert am | Date | Nein | Nein | Datum des ersten Kontakts |
| Qualifiziert von | Single Select | Nein | Nein | Name des Call-Mitarbeiters |
| Erstellt am | Created Time | Auto | Nein | Timestamp (automatisch) |
| Lead Name (Lookup) | Lookup | Auto | Nein | Lookup: Lead → Vorname & Nachname |
| Lead E-Mail (Lookup) | Lookup | Auto | Nein | Lookup: Lead → E-Mail |
| Lead Telefon (Lookup) | Lookup | Auto | Nein | Lookup: Lead → Telefon |

**Linked Records:**
- Lead (n:1)
  - Feldtyp: Link to another record
  - Verknüpfte Tabelle: "Leads"
  - Allow linking to multiple records: Nein

**Lookup-Felder:**
- Lead Name: `{Lead} → Vorname & Nachname`
- Lead E-Mail: `{Lead} → E-Mail`
- Lead Telefon: `{Lead} → Telefon`

**Zweck der Lookups:**
- Call-Team sieht Kontaktdaten direkt in Pre-Qualification View
- Kein Wechsel zwischen Tabellen nötig

### Tabelle: Handover

**Felder:**

| Feldname | Typ | Pflicht | Index | Beschreibung |
|----------|-----|---------|-------|--------------|
| Lead | Linked Record | Ja | Nein | Verknüpfung zu "Leads" |
| Pre-Qualification | Linked Record | Nein | Nein | Verknüpfung zu "Pre-Qualification" |
| Übergeben am | Date | Ja | Nein | Datum der Übergabe |
| Übergeben an | Single Select | Ja | Nein | Fachpartner-Name (z.B. RS Finance) |
| Status | Single Select | Ja | Nein | offen, in Bearbeitung, abgeschlossen |
| Dokumente vollständig | Checkbox | Nein | Nein | Upload-Check |
| Notizen | Long Text | Nein | Nein | Freitext |
| Erstellt am | Created Time | Auto | Nein | Timestamp |

**Linked Records:**
- Lead (n:1)
- Pre-Qualification (n:1, optional via Lookup)

### Verknüpfungslogik

**1:1 Beziehung (Lead ↔ Pre-Qualification):**
```
Lead (1) ←→ (1) Pre-Qualification
```
- Jeder Lead hat MAXIMAL 1 Pre-Qualification
- Jede Pre-Qualification gehört zu GENAU 1 Lead
- Implementierung: Linked Record mit "Allow linking to multiple records" = Nein

**n:1 Beziehung (Handover → Lead):**
```
Lead (1) ←→ (n) Handover
```
- Ein Lead kann mehrfach übergeben werden (theoretisch)
- Praktisch: 1 Lead = 1 Handover
- Implementierung: Linked Record mit "Allow linking to multiple records" = Ja

### Formula-Felder (Beispiele)

**Full Name (in Leads):**
```
{Vorname} & " " & {Nachname}
```

**Upload Link Valid (in Leads):**
```
IF({upload_status} = "offen", "✅ Ja", "❌ Nein")
```

**Days Since Created (in Leads):**
```
DATETIME_DIFF(NOW(), {Erstellt am}, 'days')
```

### Views (Empfohlen)

**Tabelle: Leads**
- "Alle Leads" (Standard)
- "Upload offen" (Filter: upload_status = "offen")
- "Upload abgeschlossen" (Filter: upload_status = "abgeschlossen")
- "Neue Leads (24h)" (Filter: Erstellt am > NOW() - 1 day)

**Tabelle: Pre-Qualification**
- "Offen" (Filter: Call-Status = "offen")
- "Kontaktiert" (Filter: Call-Status = "kontaktiert")
- "Qualifiziert" (Filter: Call-Status = "qualifiziert")
- "Abgelehnt" (Filter: Call-Status = "abgelehnt")

**Tabelle: Handover**
- "Offen" (Filter: Status = "offen")
- "In Bearbeitung" (Filter: Status = "in Bearbeitung")
- "Abgeschlossen" (Filter: Status = "abgeschlossen")

### Typische Fehlerquellen

**Fehler 1: Lookup zeigt "undefined"**
- Ursache: Linked Record ist leer
- Lösung: Sicherstellen, dass Linked Record befüllt ist (Make Scenario 1)

**Fehler 2: Linked Record kann nicht erstellt werden**
- Ursache: Modul verwendet falschen Record ID
- Lösung: Record ID aus vorherigem Modul verwenden (z.B. `{{2.id}}`)

**Fehler 3: Single Select Optionen fehlen**
- Ursache: Make versucht, Option zu setzen, die nicht existiert
- Lösung: Alle Optionen in Airtable manuell vorkonfigurieren

## 9. Upload-Seite (Security & UX)

### Sicherheitskonzept

**Zugriffskontrolle:**
- Token-basiert (keine Benutzer-Authentifizierung)
- Token-Validierung VOR Anzeige des Formulars
- Server-seitige Validierung (Make) + Client-seitige Validierung (JavaScript)

**Angriffsvektoren:**

| Vektor | Risiko | Mitigation |
|--------|--------|------------|
| Token-Brute-Force | Niedrig | 32 Zeichen, 62^32 Kombinationen |
| Token-Guessing | Vernachlässigbar | Kryptografisch sichere Zufallszahlen |
| Token-Replay | Mittel | upload_status = "abgeschlossen" nach Upload |
| Token-Leak | Hoch | HTTPS, keine Logs mit Tokens |
| CSRF | Niedrig | Stateless, kein Session-Cookie |
| XSS | Mittel | Input-Sanitization, Content-Security-Policy |

**HTTPS:**
- Vercel erzwingt HTTPS automatisch
- Tokens werden NIEMALS über HTTP übertragen

**Token-Lebenszyklus:**
```
Erstellt (offen) → Verwendet (abgeschlossen) → [Ende]
```

Optional: Token-Ablauf nach X Tagen (nicht implementiert, aber möglich via Formula in Airtable)

### UX-Flow

**Schritt 1: Page Load**
```
User öffnet URL: https://rs-finanzierung.at/upload-final?token=XXX
  ↓
JavaScript extrahiert Token aus URL
  ↓
AJAX-Request an Make (Token-Validierung)
  ↓
Response: {valid: true} oder {valid: false}
  ↓
IF valid: Upload-Form anzeigen
ELSE: Fehlerzustand anzeigen
```

**Schritt 2: Dateiauswahl**
```
User klickt "Dateien auswählen"
  ↓
Browser öffnet Dateiauswahl-Dialog
  ↓
User wählt 1-n Dateien aus
  ↓
JavaScript validiert Dateien (Größe, Typ)
  ↓
IF valid: Button "Hochladen" aktivieren
ELSE: Fehlermeldung anzeigen
```

**Schritt 3: Upload**
```
User klickt "Dokumente hochladen"
  ↓
JavaScript erstellt FormData
  ↓
FormData.append('token', uploadToken)
FormData.append('files', file1)
FormData.append('files', file2)
...
  ↓
AJAX-Request an Make (multipart/form-data)
  ↓
Response: HTTP 200 (Accepted) oder Fehler
  ↓
IF 200: Success-Nachricht anzeigen, Form deaktivieren
ELSE: Fehlermeldung anzeigen, Retry erlauben
```

### Token-Validierung (Client-Side)

**Code (upload-final.html):**
```javascript
async function validateTokenWithServer(token) {
    try {
        const response = await fetch(WEBHOOK_VALIDATE_TOKEN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: token })
        });

        if (!response.ok) return false;

        const result = await response.json();
        return result.valid === true;

    } catch (error) {
        console.error('Token validation failed:', error);
        return false;
    }
}
```

**Ablauf:**
1. Token aus URL extrahieren: `URLSearchParams.get('token')`
2. Validierung via Make: `POST /validate { token: "..." }`
3. Response auswerten: `result.valid === true`
4. UI aktualisieren: Form anzeigen/verbergen

**Edge Cases:**

| Fall | Verhalten |
|------|-----------|
| Kein Token in URL | Fehlerzustand anzeigen |
| Token leer | Fehlerzustand anzeigen |
| Token ungültig (Make: valid=false) | Fehlerzustand anzeigen |
| Token gültig, aber Netzwerkfehler | Fehlerzustand anzeigen, Retry erlauben |

### Datei-Validierung (Client-Side)

**Code (upload-final.html):**
```javascript
function validateFiles(files) {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    for (let file of files) {
        // Größenprüfung
        if (file.size > MAX_FILE_SIZE) {
            showStatus('error', 'Datei zu groß', `${file.name} ist größer als 10 MB.`);
            return false;
        }

        // Typprüfung
        if (!allowedTypes.includes(file.type)) {
            showStatus('error', 'Ungültiges Format', `${file.name} hat ein nicht erlaubtes Format.`);
            return false;
        }
    }

    return true;
}
```

**Validierungsregeln:**
- Max. Dateigröße: 10 MB pro Datei
- Erlaubte MIME-Types: PDF, JPEG, PNG
- Anzahl: Unbegrenzt (praktisch: Make-Limit beachten)

**UX-Feedback:**
- Fehlermeldung mit Dateinamen
- Upload-Button bleibt deaktiviert
- User kann andere Dateien auswählen

### Upload-Formular

**HTML (upload-final.html):**
```html
<form id="uploadForm">
    <div class="file-input-wrapper">
        <label for="fileInput">Dateien auswählen</label>
        <input
            type="file"
            id="fileInput"
            class="file-input"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            required
        >
        <p class="file-hint">Erlaubte Formate: PDF, JPG, PNG · Max. 10 MB pro Datei</p>
    </div>

    <button type="submit" class="upload-button" id="uploadButton">
        Dokumente hochladen
    </button>
</form>
```

**JavaScript (Upload-Handler):**
```javascript
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const files = fileInput.files;

    if (files.length === 0) {
        showStatus('error', 'Keine Dateien ausgewählt', '...');
        return;
    }

    if (!validateFiles(files)) {
        return;
    }

    const formData = new FormData();
    formData.append('token', uploadToken);

    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }

    console.log('Upload started:', files.length, 'file(s)');
    showStatus('loading', 'Upload läuft...', '...');
    uploadButton.disabled = true;

    try {
        const response = await fetch(WEBHOOK_UPLOAD, {
            method: 'POST',
            body: formData // KEIN Content-Type Header (Browser setzt automatisch)
        });

        if (response.ok) {
            console.log('Upload successful');
            showStatus('success', 'Upload erfolgreich', '...');
            fileInput.disabled = true;
            uploadButton.textContent = 'Upload abgeschlossen';
        } else {
            throw new Error(`HTTP ${response.status}`);
        }

    } catch (error) {
        console.error('Upload failed:', error);
        showStatus('error', 'Upload fehlgeschlagen', '...');
        uploadButton.disabled = false;
        uploadButton.textContent = 'Dokumente hochladen';
    }
});
```

**Kritische Punkte:**

**FormData:**
- KEIN manueller `Content-Type` Header
- Browser setzt automatisch `multipart/form-data; boundary=...`
- Manuelles Setzen würde Boundary-Fehler verursachen

**File Input:**
- `multiple` Attribut erlaubt mehrere Dateien
- `accept` Attribut schränkt Dateitypen ein (Client-Side Hint)
- `required` Attribut verhindert Submit ohne Dateien (HTML5-Validierung)

**Upload-Status:**
- Loading-State: Button deaktivieren, Text ändern
- Success-State: Form deaktivieren, Success-Nachricht
- Error-State: Button reaktivieren, Fehlermeldung, Retry erlauben

### Fehlerbehandlung

**Fehlerzustände:**

| Zustand | Ursache | User-Feedback | Technische Aktion |
|---------|---------|---------------|-------------------|
| Kein Token | URL ohne `?token=` | "Ungültiger Upload-Link" | Form verstecken, Error anzeigen |
| Token ungültig | Make: valid=false | "Token abgelaufen oder verwendet" | Form verstecken, Error anzeigen |
| Datei zu groß | > 10 MB | "Datei XYZ ist zu groß" | Upload verhindern, Datei entfernen |
| Falsches Format | Nicht PDF/JPG/PNG | "Datei XYZ hat ungültiges Format" | Upload verhindern, Datei entfernen |
| Netzwerkfehler | Timeout, 500, etc. | "Fehler beim Upload, bitte erneut versuchen" | Button reaktivieren, Retry |
| Make-Fehler | 403, 422, etc. | "Fehler beim Upload, bitte Support kontaktieren" | Log-Eintrag, Button reaktivieren |

**Error-Display (UI):**
```html
<div class="status-box error show">
    <h3>Upload fehlgeschlagen</h3>
    <p>Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut oder wenden Sie sich an Ihren Ansprechpartner.</p>
</div>
```

**Console-Logging:**
```javascript
console.log('Upload started:', files.length, 'file(s)');
console.log('Upload successful');
console.error('Upload failed:', error);
```

Zweck: Debugging, Support-Anfragen

## 10. File Storage Logik

### OneDrive Ordnerstruktur

**Root-Pfad:**
```
/Uploads/
```

**Pro Lead:**
```
/Uploads/{upload_token}/
  ├─ datei1.pdf
  ├─ datei2.jpg
  └─ datei3.png
```

**Beispiel:**
```
/Uploads/
  ├─ a7Km9pXq2vB8nR5tL7jY4hW1cF6gD3sZ/
  │   ├─ einkommensnachweis.pdf
  │   ├─ grundbuchauszug.pdf
  │   └─ lichtbildausweis.jpg
  ├─ X9mP2vB8nR5tL7jY4hW1cF6gD3sZ0aE2/
  │   ├─ gehaltsnachweise.pdf
  │   └─ mietvertrag.pdf
  └─ ...
```

### Benennung

**Ordnername:**
- Upload-Token (32 Zeichen, alphanumerisch)
- Eindeutig pro Lead
- Keine Leerzeichen, Sonderzeichen

**Dateinamen:**
- Original-Dateiname vom User
- KEINE Umbenennung (User kann Dateien selbst beschriften)
- Erlaubt: Buchstaben, Zahlen, Unterstriche, Bindestriche, Punkte
- Nicht erlaubt (theoretisch, aber nicht blockiert): Umlaute, Sonderzeichen (Kompatibilität)

**Kollisionen:**
- Falls Datei mit gleichem Namen existiert: Überschreiben
- OneDrive-Standardverhalten: Versionierung (alte Versionen bleiben erhalten)

### Zuordnung zu Leads

**Primärschlüssel:** upload_token

**Lookup-Logik:**
1. Fachpartner öffnet OneDrive
2. Navigiert zu `/Uploads/{upload_token}/`
3. Kopiert Token aus Ordnernamen
4. Sucht in Airtable (Tabelle "Leads"): `{upload_token} = "..."`
5. Findet Lead-Daten (Name, Telefon, E-Mail)

**Warum Token + Klarname kombinieren:**

**Problem:**
- Token allein ist kryptisch
- Fachpartner weiß nicht, welcher Lead welcher ist

**Lösung (optional):**
- Ordnername: `{upload_token}_{Vorname}_{Nachname}`
- Beispiel: `a7Km9p...sZ_Max_Mustermann`

**Implementierung in Make (Modul 5):**
```
Folder Path: /Uploads/{{1.token}}_{{2.Vorname}}_{{2.Nachname}}
```

Wobei `{{2.Vorname}}` aus Airtable Search (Modul 2) stammt.

**Vorteil:**
- Fachpartner sieht sofort, zu welchem Lead die Dateien gehören
- Kein Lookup in Airtable nötig

**Nachteil:**
- Personenbezogene Daten im Ordnernamen (Datenschutz)
- Umlaute, Leerzeichen in Namen → Ordnernamen-Probleme

**Empfehlung:**
- NUR Token verwenden (ohne Namen)
- Fachpartner nutzt Airtable-Lookup
- Datenschutzkonformer

### Datenschutz-Überlegungen

**Speicherort:**
- OneDrive = Cloud-Speicher (Microsoft, DSGVO-konform bei EU-Standort)
- Verschlüsselung: At-rest (Microsoft) + In-transit (HTTPS)

**Zugriffskontrolle:**
- OneDrive-Ordner: Nur für autorisierte Accounts (Fachpartner)
- KEINE öffentlichen Links
- KEIN anonymer Zugriff

**Aufbewahrungsdauer:**
- Gesetzliche Aufbewahrungspflicht: Abhängig von Branche (z.B. 7-10 Jahre)
- Löschung: Manuell oder via OneDrive-Policy

**Datenleck-Risiken:**

| Risiko | Wahrscheinlichkeit | Mitigation |
|--------|-------------------|------------|
| Token-Leak | Niedrig | HTTPS, keine Logs |
| OneDrive-Account-Kompromittierung | Mittel | MFA, starke Passwörter |
| Insider-Zugriff | Mittel | Zugriffsprotokollierung, Need-to-know |
| Upload-Seite-Exploit | Niedrig | Input-Validierung, HTTPS |

**DSGVO-Compliance:**
- Rechtsgrundlage für Verarbeitung: Vertragsbegründung (Art. 6 Abs. 1 lit. b DSGVO)
- Einwilligung für Datenweitergabe: Im Funnel (Datenschutz-Checkbox)
- Auskunftsrecht: Lead kann Zugriff auf Daten verlangen
- Löschrecht: Lead kann Löschung verlangen (nach Aufbewahrungspflicht)

## 11. Benachrichtigungen (Optional)

### E-Mail an Lead

**Trigger:**
- Lead wurde erstellt (Airtable: Watch Records)

**Empfänger:**
- Lead E-Mail (aus Airtable)

**Inhalt:**

**Betreff:**
```
Ihre Finanzierungsanfrage bei {Firmenname}
```

**Body (Text):**
```
Hallo {Vorname} {Nachname},

vielen Dank für Ihre Anfrage.

Wir werden uns in Kürze bei Ihnen melden.

Bitte laden Sie Ihre Dokumente unter folgendem Link hoch:
{Upload-URL}

Mit freundlichen Grüßen
Ihr {Firmenname} Team
```

**Datenschutz-Hinweis:**
- Upload-URL enthält Token (sensitiv!)
- E-Mail-Übertragung MUSS verschlüsselt sein (SMTP TLS)
- Empfänger-Adresse MUSS korrekt sein (Typo = Token-Leak)

**Alternative (sicherer):**
- Upload-URL NICHT per E-Mail
- Upload-URL auf Danke-Seite anzeigen (nach Funnel-Submit)
- User notiert sich URL selbst

### E-Mail an Call-Team

**Trigger:**
- Pre-Qualification wurde erstellt (Airtable: Watch Records)

**Empfänger:**
- Call-Team E-Mail (fix konfiguriert)

**Inhalt:**

**Betreff:**
```
Neuer Lead: {Vorname} {Nachname}
```

**Body (Text):**
```
Neuer Lead in Pre-Qualification:

Name: {Vorname} {Nachname}
Telefon: {Telefon}
Finanzierungsart: {Finanzierungsart}
Betrag: {Betrag}

Bitte kontaktieren und qualifizieren.

Link: {Airtable-Record-URL}
```

**Erlaubte Daten:**
- Kontaktdaten (Name, Telefon)
- Finanzierungsart, Betrag
- Link zu Airtable-Record

**NICHT erlaubte Daten:**
- Upload-Token (unnötig, sensibel)
- E-Mail-Adresse des Leads (Datensparsamkeit)

### E-Mail an Fachpartner

**Trigger:**
- Handover wurde erstellt (Airtable: Watch Records)
- Oder: Pre-Qualification Status = "qualifiziert"

**Empfänger:**
- Fachpartner E-Mail (aus Handover-Record oder fix konfiguriert)

**Inhalt:**

**Betreff:**
```
Neuer qualifizierter Lead: {Vorname} {Nachname}
```

**Body (Text):**
```
Neuer Lead zur Bearbeitung:

Name: {Vorname} {Nachname}
Telefon: {Telefon}
E-Mail: {E-Mail}
Finanzierungsart: {Finanzierungsart}
Betrag: {Betrag}

Dokumente: {OneDrive-Link}

Pre-Qualification Kommentar:
{Kommentar}

Bitte kontaktieren.
```

**Erlaubte Daten:**
- Alle Lead-Daten (mit Einwilligung des Leads)
- Pre-Qualification Kommentar
- OneDrive-Link (falls Zugriff freigegeben)

**NICHT erlaubte Daten:**
- Upload-Token (technisch, nicht relevant)

### SMS (Optional)

**Trigger:**
- Lead wurde erstellt

**Empfänger:**
- Lead Telefon (aus Airtable)

**Inhalt:**
```
Danke für Ihre Anfrage bei {Firmenname}. Wir melden uns in Kürze. Upload-Link: {Upload-URL}
```

**Hinweis:**
- SMS kostet Geld (pro Nachricht)
- SMS ist weniger sicher als E-Mail (kein TLS)
- SMS-Länge: Max. 160 Zeichen (Upload-URL ist lang!)

**Empfehlung:**
- Keine SMS (zu teuer, zu unsicher)
- E-Mail oder Upload-URL auf Danke-Seite

## 12. Typische Fehler & Lessons Learned

### Token-Mapping-Probleme

**Fehler:**
Make Scenario 3 (Upload) verwendet falschen Token für Airtable-Suche.

**Symptom:**
- Upload schlägt fehl mit "Token ungültig"
- Obwohl Token korrekt ist

**Ursache:**
```
Modul 2 (Airtable Search): Formula verwendet {{1.upload_token}}
```
Aber `{{1.upload_token}}` existiert nicht (Webhook empfängt `{{1.token}}`).

**Lösung:**
```
Formula: {upload_token} = "{{1.token}}"
```

**Lesson Learned:**
- Feldnamen in Make exakt prüfen
- Webhook-Payload-Struktur dokumentieren
- Test mit ungültigem Token durchführen

### Make-Router-Fallen

**Fehler:**
Router-Bedingung `{{2.array}} > 0` ist syntaktisch falsch.

**Symptom:**
- Router führt immer denselben Path aus (oder gar keinen)

**Ursache:**
- `{{2.array}}` ist Array, kein Number
- Vergleich `Array > 0` ergibt immer `false`

**Lösung:**
```
Bedingung: {{length(2.array)}} > 0
```

**Lesson Learned:**
- `length()` Funktion verwenden für Arrays
- Make-Router-Bedingungen immer testen (mit Debug-Output)

### Lookup-Fallen in Airtable

**Fehler:**
Lookup-Feld zeigt "undefined" statt Wert.

**Symptom:**
- Pre-Qualification: "Lead Name" ist leer
- Obwohl Lead verknüpft ist

**Ursache:**
- Lookup-Feld referenziert falsches Feld
- Beispiel: `{Lead} → Vorname` (korrekt)
- Aber konfiguriert: `{Lead} → Name` (Feld "Name" existiert nicht)

**Lösung:**
- Lookup-Feld neu konfigurieren
- Exakte Feldnamen verwenden (aus verknüpfter Tabelle)

**Lesson Learned:**
- Airtable Lookup-Felder nach Erstellung testen
- Dummy-Record anlegen, Lookup prüfen

### Single Select Options

**Fehler:**
Make-Error 422 "Insufficient permissions to create new select option".

**Symptom:**
- Lead kann nicht erstellt werden
- Obwohl alle Felder korrekt sind

**Ursache:**
- Funnel sendet `"financingType": "kauf"`
- Airtable hat Option "Kauf" (Großschreibung)
- Airtable erwartet EXAKTE Übereinstimmung

**Lösung:**
- In Airtable alle Optionen GENAU SO anlegen, wie Funnel sie sendet
- Kleinschreibung: kauf, bau, umschuldung, sanierung

**Lesson Learned:**
- Single Select Optionen VOR Make-Test in Airtable anlegen
- Case-sensitive: "kauf" ≠ "Kauf"

### FormData Content-Type

**Fehler:**
Upload schlägt fehl mit "Boundary not found" oder "Malformed multipart".

**Symptom:**
- Make empfängt keine Dateien
- Oder: Make-Error "Invalid request"

**Ursache:**
```javascript
fetch(WEBHOOK_UPLOAD, {
    method: 'POST',
    headers: { 'Content-Type': 'multipart/form-data' }, // FALSCH
    body: formData
});
```

**Lösung:**
```javascript
fetch(WEBHOOK_UPLOAD, {
    method: 'POST',
    body: formData // KEIN Content-Type Header
});
```

**Grund:**
- Browser setzt `Content-Type` automatisch
- Inkl. Boundary: `multipart/form-data; boundary=----WebKitFormBoundary...`
- Manuelles Setzen überschreibt Boundary → Fehler

**Lesson Learned:**
- Bei FormData: NIEMALS Content-Type Header setzen
- Browser macht das automatisch (und korrekt)

### Token-Erzeugung auf Upload-Seite

**Fehler (Design):**
Upload-Seite erzeugt Token clientseitig.

**Symptom:**
- Mehrfache Uploads erzeugen mehrere Tokens
- Token kann nicht in Airtable gefunden werden
- Zuordnung zu Lead unmöglich

**Warum falsch:**
- Upload-Seite weiß nicht, zu welchem Lead Token gehört
- Lead muss ZUERST existieren, DANN Upload
- Token muss TEIL der Lead-Daten sein (nicht nachträglich)

**Lösung:**
- Token NUR im Funnel erzeugen
- Token MIT Lead-Daten speichern
- Upload-Seite validiert Token (liest aus URL)

**Lesson Learned:**
- Klare Verantwortlichkeiten: Funnel = Token-Quelle
- Upload-Seite = Token-Nutzer (nicht Erzeuger)

### Linked Record nicht verknüpft

**Fehler:**
Pre-Qualification hat kein verknüpftes Lead-Record.

**Symptom:**
- Pre-Qualification: Feld "Lead" ist leer
- Lookups zeigen nichts an

**Ursache:**
Make Scenario 1, Modul 3 (Create Pre-Qualification):
```
Lead: {{1.upload_token}} // FALSCH
```

**Lösung:**
```
Lead: {{2.id}} // Record ID aus Modul 2 (Create Lead)
```

**Lesson Learned:**
- Linked Records benötigen Record ID (nicht Token oder anderes Feld)
- Record ID ist Output des Create-Record-Moduls

### Airtable Formula Syntax

**Fehler:**
Airtable Search findet keine Records, obwohl sie existieren.

**Symptom:**
- Make Scenario 2 (Token-Validierung): Immer `valid = false`

**Ursache:**
```
Formula: upload_token = {{1.token}} // FALSCH (keine geschweifte Klammern)
```

**Lösung:**
```
Formula: {upload_token} = "{{1.token}}" // KORREKT
```

**Lesson Learned:**
- Airtable-Feldnamen: `{feldname}` (geschweifte Klammern)
- Make-Variablen: `{{modul.variable}}` (doppelt geschweifte Klammern)
- String-Vergleich: Anführungszeichen um Make-Variable

### Iterator-Platzierung

**Fehler:**
Airtable-Update läuft pro Datei (statt 1x pro Upload).

**Symptom:**
- `upload_status` wird mehrfach aktualisiert
- Performance-Problem bei vielen Dateien

**Ursache:**
```
Modul 4: Iterator (files)
Modul 5: OneDrive Upload
Modul 6: Airtable Update // FALSCH (innerhalb Iterator)
```

**Lösung:**
```
Modul 4: Iterator (files)
Modul 5: OneDrive Upload
[Ende Iterator]
Modul 6: Airtable Update // KORREKT (nach Iterator)
```

**Lesson Learned:**
- Iterator MUSS klar abgegrenzt sein
- Module NACH Iterator laufen nur 1x (nicht pro Iteration)

## 13. Replikations-Anleitung

### Fixe Komponenten

**NICHT ändern:**
- Token-Erzeugungsmechanismus (crypto.getRandomValues, 32 Zeichen)
- Token-Validierungs-Flow (Upload-Seite → Make → Airtable)
- FormData-Struktur für Upload (token + files)
- Ordnerstruktur in OneDrive (/Uploads/{token}/)
- Airtable-Verknüpfungen (Lead ↔ Pre-Qualification)

**Grund:**
- Diese Komponenten sind aufeinander abgestimmt
- Änderungen brechen die Architektur

### Variable Komponenten

**Anpassbar pro Projekt:**

**1. Funnel-Felder:**
- Finanzierungsarten (z.B. + "Leasing")
- Zusätzliche Felder (z.B. "Objekt-PLZ")
- Validierungsregeln

**2. Airtable-Felder:**
- Zusätzliche Felder in "Leads"
- Zusätzliche Tabellen (z.B. "Angebote")
- Custom Formulas, Views

**3. Upload-Datei-Typen:**
- Zusätzliche MIME-Types (z.B. .doc, .xlsx)
- Größenlimit anpassen

**4. E-Mail-Benachrichtigungen:**
- Texte anpassen
- Empfänger ändern
- Trigger ändern

**5. Branding:**
- Farben, Logo (CSS)
- Firmennamen
- Domain

### Checkliste für neues Projekt

**1. Airtable Setup:**
- [ ] Base erstellen
- [ ] Tabelle "Leads" mit Feldern (siehe Kapitel 8)
- [ ] Tabelle "Pre-Qualification" mit Feldern
- [ ] Tabelle "Handover" (optional)
- [ ] Linked Records konfigurieren
- [ ] Single Select Optionen anlegen
- [ ] Views erstellen

**2. Make.com Setup:**
- [ ] Scenario 1: Lead Registration (siehe Kapitel 7)
- [ ] Scenario 2: Token Validation
- [ ] Scenario 3: Document Upload
- [ ] Webhook-URLs notieren
- [ ] Airtable-Verbindung herstellen
- [ ] OneDrive-Verbindung herstellen
- [ ] Test mit Dummy-Daten

**3. OneDrive Setup:**
- [ ] Ordner `/Uploads/` erstellen
- [ ] Zugriff für Make-Account (OAuth)
- [ ] Zugriff für Fachpartner (Share)

**4. Frontend Setup:**
- [ ] `rechner.html` anpassen (Funnel-Felder)
- [ ] `script.js` anpassen (Webhook-URL, Payload-Struktur)
- [ ] `upload-final.html` anpassen (Webhooks für Validation + Upload)
- [ ] Domain konfigurieren (Vercel)
- [ ] SSL-Zertifikat prüfen (HTTPS)

**5. Testing:**
- [ ] Funnel-Submit → Lead in Airtable
- [ ] Pre-Qualification automatisch erstellt
- [ ] Upload-URL funktioniert
- [ ] Token-Validierung funktioniert
- [ ] Dokumenten-Upload → OneDrive
- [ ] `upload_status` wird aktualisiert

**6. Go-Live:**
- [ ] DNS auf Produktions-Domain umstellen
- [ ] Make-Szenarien aktivieren (ON)
- [ ] Monitoring einrichten (Make-Execution-Logs)
- [ ] Support-Prozess definieren

### Was darf NIEMALS geändert werden

**1. Token-Länge:**
- IMMER 32 Zeichen
- Änderung → Kompatibilitätsprobleme mit Airtable, OneDrive

**2. Token-Quelle:**
- IMMER im Funnel erzeugen
- NIEMALS auf Upload-Seite erzeugen

**3. Payload-Struktur (Funnel → Make):**
- IMMER JSON
- IMMER Feldname `upload_token` (nicht `token` oder anders)
- IMMER Feldname `upload_status` (nicht `status`)

**4. FormData-Struktur (Upload → Make):**
- IMMER `token` (Text-Feld)
- IMMER `files` (File-Array)
- KEIN Content-Type Header

**5. Airtable-Verknüpfungen:**
- IMMER Lead ↔ Pre-Qualification (1:1)
- IMMER via Linked Record (nicht via Lookup oder Formula)

**6. OneDrive-Ordner-Struktur:**
- IMMER `/Uploads/{token}/`
- NICHT `/Uploads/{name}/` oder andere Varianten

**Grund für diese Regeln:**
- Make-Szenarien sind darauf konfiguriert
- Änderungen erfordern komplettes Rewriting aller Szenarien
- Fehleranfälligkeit steigt exponentiell

## 14. Abgrenzung & Compliance-Hinweis

### Warum speziell für regulierte Branchen

**Rechtlicher Hintergrund:**

In vielen Branchen (Finanzdienstleistungen, Versicherungen, Immobilienvermittlung) gilt:

- **Beratungspflicht:** Fachliche Beratung darf nur durch lizenzierte Personen erfolgen
- **Haftung:** Unlizenzierte Beratung führt zu Haftungsrisiken
- **Bußgelder:** Verstoß gegen Gewerbeordnung, Finanzmarktaufsicht

**Problem ohne klare Trennung:**

Werbedienstleister (Lead-Generator) könnte versehentlich:
- Produktempfehlungen aussprechen
- Konditionen verhandeln
- Bonitätsprüfungen durchführen
- Vertragsabschlüsse initiieren

→ Alles NICHT erlaubt ohne Lizenz.

**Lösung durch dieses System:**

Klare Trennung:
1. **Lead-Generierung** (Werbedienstleister): Nur Datenerfassung, keine Beratung
2. **Pre-Qualification** (autorisierte Stelle): Plausibilitätsprüfung, Einholung Zustimmung
3. **Beratung & Abschluss** (lizenzierter Fachpartner): Alle regulierten Tätigkeiten

### Welche Tätigkeiten bewusst ausgelagert sind

**Werbedienstleister darf NICHT:**
- Bonitätsprüfung durchführen (z.B. SCHUFA-Abfrage)
- Zinskonditionen nennen oder vergleichen
- Produktempfehlungen aussprechen ("Sie sollten Kredit X nehmen")
- Verträge vorbereiten oder versenden
- Rechtliche Beratung geben
- Finanzielle Entscheidungen beeinflussen

**Werbedienstleister darf:**
- Lead-Daten erfassen (Name, Kontakt, Finanzierungswunsch)
- Kalkulatorische Schätzung (monatliche Rate, basierend auf Standardformel)
- Dokumente entgegennehmen (Upload-Seite)
- Lead an Fachpartner weiterleiten

**Pre-Qualification darf:**
- Telefonische Kontaktaufnahme
- Plausibilitätsprüfung (Ist Finanzierung realistisch?)
- Einholung der Zustimmung zur Weitergabe
- KEINE verbindlichen Zusagen

**Fachpartner (lizenziert) darf:**
- Alles (Beratung, Angebotserstellung, Vertragsabschluss)

### Warum rechtlich relevant

**1. Gewerberecht:**
- Kreditvermittlung: Gewerbeerlaubnis nach § 34c GewO (Deutschland) oder § 136 GewO (Österreich)
- Versicherungsvermittlung: § 34d GewO bzw. § 137 GewO
- Ohne Erlaubnis: Bußgeld bis € 50.000

**2. Finanzmarktaufsicht:**
- MiFID II (EU): Anforderungen an Finanzberatung
- Dokumentationspflicht: Beratungsgespräche müssen dokumentiert werden
- Haftung bei Fehlberatung: Schadensersatz

**3. Datenschutz:**
- DSGVO: Rechtsgrundlage für Datenverarbeitung
- Weitergabe an Dritte: Einwilligung erforderlich (Datenschutz-Checkbox im Funnel)
- Datenminimierung: Nur notwendige Daten erheben

**4. Wettbewerbsrecht:**
- Irreführende Werbung: Keine falschen Versprechungen (z.B. "Kredit garantiert")
- Transparenz: Klare Information über Rolle des Werbedienstleisters

### Dokumentationspflicht

**Was dokumentiert wird:**

| Dokument | Zweck | Aufbewahrung |
|----------|-------|--------------|
| Lead-Daten (Airtable) | Nachweis der Einwilligung | 7-10 Jahre |
| Pre-Qualification (Airtable) | Nachweis der Vorqualifizierung | 7-10 Jahre |
| Hochgeladene Dokumente (OneDrive) | Unterlagen für Fachpartner | 7-10 Jahre |
| Handover (Airtable) | Nachweis der Weitergabe | 7-10 Jahre |

**Warum wichtig:**
- Aufsichtsbehörden können Dokumentation verlangen
- Haftungsfälle: Nachweis, dass korrekt gehandelt wurde
- Steuerprüfung: Nachweis von Provisionsansprüchen

### Compliance-Checkliste

**Vor Go-Live:**

- [ ] Datenschutzerklärung auf Website vorhanden
- [ ] Impressum mit korrekten Angaben
- [ ] Funnel: Datenschutz-Checkbox (Pflicht)
- [ ] Funnel: Hinweis auf Weitergabe an Fachpartner
- [ ] Upload-Seite: Hinweis auf Verschlüsselung
- [ ] Make: Keine Logs mit personenbezogenen Daten
- [ ] Airtable: Zugriffsrechte korrekt konfiguriert
- [ ] OneDrive: Nur autorisierte Accounts
- [ ] Fachpartner: Lizenz vorhanden (§ 34c GewO oder equivalent)
- [ ] Provisionsvereinbarung: Schriftlich, rechtssicher

**Laufend:**

- [ ] Dokumentation vollständig (Airtable, OneDrive)
- [ ] Aufbewahrungsfristen einhalten
- [ ] Löschfristen beachten (nach Aufbewahrungspflicht)
- [ ] Auskunftsanfragen bearbeiten (DSGVO Art. 15)
- [ ] Datenpannen melden (DSGVO Art. 33, 34)

---

**Ende des Kontextfiles**

**Version:** 1.0
**Datum:** 2026-01-23
**Autor:** System-Architekt (KI-gestützt)
**Zweck:** Permanente Referenz für Lead & Document Upload Architektur
