# RS Finance - Finanzierungs-Landingpage & Funnel

Ein professionelles, zweistufiges Lead-Generierungs-System für RS Finance, gestaltet im exakten Stil der Hauptwebsite [rs-finance.at](https://rs-finance.at).

## 🎨 Design

Das gesamte System wurde mit den originalen Design-Elementen von RS Finance erstellt:

### Farbschema
- **Primärfarbe**: `#587592` (Blau-Grau)
- **Hintergründe**: Weiß, `#F9F9F9`, `#FCFEFF`
- **Akzentfarben**: `#CCDBE7` (Hellblau)
- **Text**: `#222222`, `#333333`

### Typografie
- **Schriftart**: Roboto (Google Fonts)
- **Gewichte**: 300, 400, 500, 700

### Design-Elemente
- Abgerundete Buttons (border-radius: 50px)
- Sanfte Schatten und Übergänge
- Moderne, cleane Card-Designs
- Responsive Grid-Layouts
- Timeline-Komponenten

## 📄 System-Übersicht

### 1. Landingpage (`landing.html`)

Eine vollständige Landingpage speziell für Finanzierungen mit folgenden Sections:

#### Sections:
- **Hero**: Beeindruckender Einstieg mit Gradient-Hintergrund und starkem CTA
- **Finanzierungslösungen**: 6 Karten (Kauf, Bau, Umschuldung, Sanierung, Konsum, Leasing)
- **Ihre Vorteile**: 6 Benefit-Cards mit Icons
- **Wie es funktioniert**: 4-Schritte Timeline mit alternierendem Layout
- **CTA-Section**: Aufforderung zum Funnel-Start
- **FAQ**: 5 häufig gestellte Fragen mit Akkordeon
- **Footer**: Kontaktinformationen und Links

#### Features:
- Vollständig responsive
- Smooth Scroll zu Sections
- Animierte Elemente beim Scrollen
- FAQ mit Toggle-Funktion
- Sticky Header

### 2. Finanzierungs-Funnel (`index.html`)

Ein 5-Schritte Funnel zur Lead-Generierung:

1. **Willkommen**: Einführung mit Vorteilen
2. **Finanzierungsart**: Auswahl zwischen Kauf, Bau, Umschuldung, Sanierung
3. **Finanzierungsdetails**: Kreditsumme, Eigenkapital, Laufzeit mit Live-Berechnung
4. **Kontaktdaten**: Name, E-Mail, Telefon, Nachricht
5. **Bestätigung**: Danke-Seite mit nächsten Schritten

#### Features:
- Progress Bar mit 5 Schritten
- Live-Berechnung der monatlichen Rate
- Formular-Validierung
- DSGVO-konforme Checkboxen
- Smooth Animations

## 🚀 Installation & Verwendung

### Lokale Nutzung

1. Öffnen Sie `landing.html` für die Landingpage
2. Öffnen Sie `index.html` für den Funnel direkt
3. Alle Dateien sind standalone und benötigen keinen Server

### Server-Deployment

```bash
# Alle Dateien auf Ihren Webserver hochladen
Funnel-Finanzierung/
├── landing.html           # Landingpage
├── landing-styles.css     # Landingpage Styles
├── landing-script.js      # Landingpage Scripts
├── index.html             # Funnel
├── styles.css             # Funnel Styles
└── script.js              # Funnel Scripts
```

### Empfohlener User-Flow

1. **Traffic** → `landing.html` (SEO-optimierte Landingpage)
2. **CTA-Click** → `index.html` (Finanzierungs-Funnel)
3. **Formular absenden** → Backend-Integration

### Integration in bestehende Website

#### Option 1: Separate URLs
```
https://rs-finance.at/finanzierung/          → landing.html
https://rs-finance.at/finanzierung/rechner/  → index.html
```

#### Option 2: WordPress Integration
- Landingpage als Custom Template
- Funnel als separate Seite oder in Modal/Popup

## 📊 Features

### ✅ Landingpage
- Hero-Section mit starkem CTA
- 6 Finanzierungsarten detailliert erklärt
- Benefits-Section mit 6 Vorteilen
- 4-Schritte "Wie es funktioniert" Timeline
- FAQ mit 5 häufigen Fragen
- Footer mit Kontaktdaten
- Vollständig responsive
- SEO-freundlich
- Scroll-Animationen

### ✅ Funnel
- 5-Schritte Prozess mit Progress Bar
- Interaktive Slider für Kreditsumme, Eigenkapital, Laufzeit
- Live-Berechnung der monatlichen Rate
- Formular-Validierung
- DSGVO-Checkboxen
- Danke-Seite mit Timeline
- Vollständig responsive

## 🔄 Benötigte Integration

### Backend-Integration

Die Formular-Daten müssen an ein Backend gesendet werden. Im `script.js` (Zeile 237) finden Sie einen Platzhalter:

```javascript
// In script.js - submitForm() Funktion
fetch('/api/submit-financing-request', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
})
.then(response => response.json())
.then(data => {
    // Erfolg
})
```

### E-Mail-Benachrichtigungen

Richten Sie ein Backend ein, das:
1. Formulardaten empfängt und validiert
2. E-Mail an RS Finance sendet mit allen Details
3. Bestätigungs-E-Mail an Kunden sendet
4. Optional: Lead in CRM eintragen

### Analytics Integration

#### Landingpage (`landing-script.js`)
```javascript
// Google Analytics
gtag('event', 'page_view', {
    page_title: 'Finanzierungen Landing Page'
});

// Facebook Pixel
fbq('track', 'PageView');
```

#### Funnel (`script.js`)
```javascript
// Funnel Step Tracking
gtag('event', 'funnel_step', {
    'step_number': step,
    'step_name': getStepName(step)
});

// Lead Conversion
fbq('track', 'Lead', {
    value: formData.loanAmount,
    currency: 'EUR'
});
```

## 🎯 Anpassungen

### Logo ändern

Beide Dateien verwenden aktuell ein SVG-Placeholder. Ersetzen Sie es mit Ihrem echten Logo:

```html
<div class="logo">
    <img src="pfad/zu/rs-finance-logo.png" alt="RS Finance" height="50">
    <span class="logo-text">RS Finance</span>
</div>
```

### Farben anpassen

Ändern Sie die CSS-Variablen in beiden CSS-Dateien:

```css
:root {
    --primary-color: #587592;
    --primary-dark: #4a6279;
    --primary-light: #7a94b0;
    /* ... */
}
```

### Zinsrechnung anpassen

In `script.js` (Zeile 190-200):

```javascript
const annualRate = 0.035; // 3.5% - Passen Sie an
```

## 📱 Responsive Design

Beide Seiten sind vollständig responsive und optimiert für:
- **Desktop**: > 1024px (volle Features)
- **Tablet**: 768px - 1024px (angepasstes Layout)
- **Mobile**: < 768px (Stack-Layout, vereinfachte Navigation)

## 🔒 Datenschutz & Compliance

- DSGVO-konforme Checkboxen
- Links zu Datenschutzerklärung, Impressum, Cookie-Richtlinie
- Optionale Marketing-Zustimmung
- Keine Cookies ohne Zustimmung
- Transparente Datennutzung

## 📞 Support & Kontakt

Bei Fragen zur Integration oder Anpassung:
- **E-Mail**: office@rs-finance.at
- **Telefon**: +43 664 / 6392996
- **Adresse**: Alpen-Adria-Platz 1, Eingang D, 9020 Klagenfurt

## 📄 Datei-Struktur

```
Funnel-Finanzierung/
├── landing.html           # Landingpage (Einstieg)
├── landing-styles.css     # Styles für Landingpage
├── landing-script.js      # JavaScript für Landingpage
├── index.html             # Finanzierungs-Funnel
├── styles.css             # Styles für Funnel
├── script.js              # JavaScript für Funnel
└── README.md              # Diese Dokumentation
```

## 🔧 Technische Details

- **HTML5** mit semantischen Tags
- **CSS3** mit CSS Grid & Flexbox
- **Vanilla JavaScript** (keine externen Frameworks)
- **Google Fonts** (Roboto)
- Optimiert für Performance (<100KB gesamt)
- Cross-browser kompatibel (Chrome, Firefox, Safari, Edge)
- Progressive Enhancement
- Accessibility-freundlich (ARIA-Labels)

## ✨ Highlights

### Design
- **Pixel-perfect RS Finance Branding**: Alle Farben, Schriften und Styles exakt wie auf rs-finance.at
- **Modernes Layout**: Hero-Sections, Cards, Timeline, Akkordeon
- **Smooth Animations**: Fade-in, Slide-in, Hover-Effekte
- **Professionell**: Liebe zum Detail in jedem Element

### Conversion-Optimierung
- **Klare User Journey**: Landingpage → Funnel → Lead
- **Multiple CTAs**: Strategisch platzierte Call-to-Actions
- **Social Proof**: Vorteile und Testimonial-Ready
- **Trust-Elemente**: Gütesiegel, Kontaktdaten, Transparenz
- **Low Friction**: Nur 3 Minuten zum Lead

### Performance
- **Schnelle Ladezeiten**: Optimierte Assets
- **Lazy Loading**: Bilder werden bei Bedarf geladen
- **Prefetching**: Nächste Seite wird vorgeladen
- **Caching**: Browser-Cache wird genutzt

## 🎬 Deployment-Checkliste

Vor dem Live-Gang:

- [ ] Echtes RS Finance Logo einsetzen
- [ ] Backend-Endpunkt konfigurieren
- [ ] E-Mail-Templates erstellen
- [ ] Analytics-IDs eintragen (GA, Facebook Pixel)
- [ ] CRM-Integration testen
- [ ] Mobile-Ansicht testen
- [ ] Cross-Browser-Tests durchführen
- [ ] Formular-Spam-Schutz aktivieren (Captcha)
- [ ] SSL-Zertifikat prüfen
- [ ] Datenschutzerklärung aktualisieren

## 📈 Empfohlene Metriken

Tracken Sie diese KPIs:

### Landingpage
- Besucherzahl
- Bounce Rate
- Zeit auf Seite
- CTA-Click-Rate
- Scroll-Tiefe

### Funnel
- Funnel-Starts
- Abbruchrate pro Schritt
- Completion Rate
- Lead Quality Score
- Time to Complete

## 🚀 Nächste Schritte

1. **Testen Sie lokal**: Öffnen Sie beide HTML-Dateien
2. **Backend aufsetzen**: Implementieren Sie die Formular-Verarbeitung
3. **Analytics einrichten**: Fügen Sie Tracking-Codes hinzu
4. **A/B-Tests planen**: Testen Sie verschiedene Headlines, CTAs
5. **Traffic leiten**: SEA, SEO, Social Media

---

**Viel Erfolg mit Ihrem Finanzierungs-Funnel!** 🎉

© 2024 RS Finance. Alle Rechte vorbehalten.
