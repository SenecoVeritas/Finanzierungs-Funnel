# Upload-System - Architektur-Dokumentation

## ✅ AKTIVE DATEIEN (VERWENDEN)

### **Funnel (Token-Erzeugung)**
- **Datei:** `script.js`
- **Funktion:** Generiert Upload-Token bei Lead-Submit
- **Webhook:** `bgbsqrlu16mzzurjhuvpb2k1lnafeuk5`

### **Upload-Seite (Token-Validierung + Upload)**
- **Datei:** `upload-final.html`
- **Webhooks:**
  - Token-Validierung: `ef1r4n20ghhuelklx9l56y2r89dtqwc6`
  - Datei-Upload: `pd6fa46omvydxxyfu8ve1u7tsik76kgu`

---

## ❌ VERALTETE DATEIEN (NICHT VERWENDEN)

Diese Dateien enthalten **alte Token-Logik** und sind **nicht mehr Teil der Architektur:**

- ❌ `upload.html` - Alte Token-Validierung
- ❌ `upload-v2.html` - Clientseitige Token-Generierung (falsch)

**Status:** Können gelöscht werden

---

## 🏗️ TOKEN-ARCHITEKTUR (FINAL)

### **EINZIGE TOKEN-QUELLE:**
```
Funnel (script.js)
  └─ generateUploadToken()
     └─ crypto.getRandomValues()
        └─ Token wird generiert
           └─ Mit Lead-Daten an Make gesendet
```

### **TOKEN-FLOW:**

1. **Lead-Submit (Funnel)**
   - User füllt Funnel aus
   - Submit → Token wird generiert (32 Zeichen, alphanumerisch)
   - Token + Lead-Daten → Make Webhook A
   - Make speichert in Airtable: `upload_token`, `upload_status='offen'`

2. **Upload-Seite Load**
   - User öffnet: `upload-final.html?token=XXX`
   - Token aus URL lesen
   - Token an Make Webhook B senden (Validierung)
   - Make prüft: Token existiert? Status='offen'?
   - Antwort: `{ valid: true/false }`
   - Wenn `false`: Form blockiert

3. **Datei-Upload**
   - User wählt Dateien
   - Submit → Token + Dateien → Make Webhook C
   - Make: Token nochmal prüfen, Dateien speichern
   - Make: `upload_status='abgeschlossen'` setzen

---

## 🎯 WEBHOOKS

| Webhook | ID | Zweck | Sendet | Empfängt |
|---------|-----|-------|--------|----------|
| **A** | `bgbsqrlu16mzzurjhuvpb2k1lnafeuk5` | Lead + Token speichern | Lead-Daten + `upload_token` | - |
| **B** | `ef1r4n20ghhuelklx9l56y2r89dtqwc6` | Token validieren | `{ token }` | `{ valid: true/false }` |
| **C** | `pd6fa46omvydxxyfu8ve1u7tsik76kgu` | Dateien hochladen | `token` + `files[]` | - |

---

## ⚠️ WICHTIGE REGELN

1. **Token wird NUR im Funnel erzeugt** (script.js, Funktion `generateUploadToken()`)
2. **Upload-Seite erzeugt KEINE Tokens** (nur validieren + verwenden)
3. **Ein Token = Ein Upload** (nach Upload: `status='abgeschlossen'`)
4. **Keine Token in localStorage/sessionStorage** (nur aus URL lesen)

---

## 🧪 TESTEN

### **Test 1: Token-Generierung**
1. Funnel ausfüllen: `https://www.rs-finanzierung.at/rechner.html`
2. Submit → Console: "Generated upload token: XXXXXXX"
3. In Make prüfen: Lead mit `upload_token` angekommen?

### **Test 2: Token-Validierung**
1. URL öffnen: `https://www.rs-finanzierung.at/upload-final.html?token=XXXXXXX`
2. Loading → Validierung bei Make
3. Wenn valid: Upload-Form erscheint
4. Wenn invalid: Fehlermeldung

### **Test 3: Upload**
1. Dateien auswählen
2. "Dokumente hochladen" klicken
3. Dateien + Token an Make Webhook C
4. Erfolg: "Upload erfolgreich"

---

**Version:** 3.0 (Single Token Source Architecture)
**Datum:** 2026-01-20
**Status:** ✅ Produktionsreif
