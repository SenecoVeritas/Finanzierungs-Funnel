# 🎯 SZENARIO 1 - Implementierung

**Status:** ✅ Vollständig implementiert und bereit zum Testen

---

## **📊 EXAKTE CODE-ÄNDERUNGEN**

### **1. script.js - Payload angepasst**

**Datei:** `script.js`
**Zeilen:** 347-380

#### **VORHER (alte Feldnamen):**
```javascript
const payload = {
    first_name: formData.firstName,      // ❌ snake_case
    last_name: formData.lastName,        // ❌ snake_case
    financing_type: formData.financingType,  // ❌ snake_case
    // ...
    lead_status: 'New',                  // ❌ nicht gebraucht
    call_status: 'Neu',                  // ❌ nicht gebraucht
    source: 'RS Finance Funnel'          // ❌ nicht gebraucht
};
```

#### **NACHHER (Szenario 1 Spezifikation):**
```javascript
const payload = {
    // Lead-Daten (für Airtable: Leads)
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

    // Upload-Token (generiert im Frontend)
    upload_token: uploadToken,
    upload_status: 'offen'
};
```

---

## **🗑️ ENTFERNTE FELDER**

Diese Felder wurden ENTFERNT (nicht mehr Teil von Szenario 1):

| Altes Feld | Grund |
|------------|-------|
| `lead_status` | Nicht in Spezifikation |
| `call_status` | Wird in Pre-Qualification gesetzt |
| `source` | Nicht in Spezifikation |
| Snake-case Namen | Auf camelCase geändert |

---

## **📡 WEBHOOK-ÄNDERUNGEN**

### **ALTER Webhook (deaktiviert):**
```javascript
// ALTE URL (nicht mehr verwendet)
const WEBHOOK_URL = 'https://hook.eu2.make.com/bgbsqrlu16mzzurjhuvpb2k1lnafeuk5';
```

### **NEUER Webhook (Szenario 1):**
```javascript
// NEUE URL für Szenario 1
const WEBHOOK_URL = 'https://hook.eu2.make.com/kjqducl2q4jfp0p8ti13xi8gripfznyy';
```

**✅ AKTIV:** Webhook URL ist jetzt konfiguriert

---

## **🔐 TOKEN-GENERIERUNG**

### **Funktion bleibt unverändert:**

**Datei:** `script.js`
**Zeilen:** 318-331

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
- ✅ Kryptografisch sicher (crypto.getRandomValues)
- ✅ 32 Zeichen lang
- ✅ Alphanumerisch (a-zA-Z0-9)
- ✅ Einmalig pro Lead-Submit

---

## **📦 MAKE - EMPFANGENE DATEN**

### **JSON Payload:**

```json
{
  "firstName": "Max",
  "lastName": "Mustermann",
  "email": "max@example.com",
  "phone": "+43 664 1234567",

  "financingType": "kauf",
  "loanAmount": 250000,
  "equity": 50000,
  "monthlyRate": 950,

  "rateRealistic": "ja",
  "decisionTimeline": "sofort",

  "message": "Interessiert an Finanzierung",

  "upload_token": "a7Km9pXq2vB4nR8tL3jY6hW1cF5gD0sZ",
  "upload_status": "offen"
}
```

---

## **🗄️ AIRTABLE - MAKE WORKFLOW**

### **Schritt 1: Webhook empfängt Daten**
```
Custom Webhook
└─ Empfängt alle Felder aus payload
```

### **Schritt 2: Create Record - Leads**
```
Airtable: Create Record
Tabelle: Leads

Felder:
├─ Vorname: {{firstName}}
├─ Nachname: {{lastName}}
├─ E-Mail: {{email}}
├─ Telefon: {{phone}}
├─ Finanzierungsart: {{financingType}}
├─ Betrag: {{loanAmount}}
├─ Eigenkapital: {{equity}}
├─ Monatliche Rate: {{monthlyRate}}
├─ Rate Realistisch: {{rateRealistic}}
├─ Entscheidungszeitraum: {{decisionTimeline}}
├─ Nachricht: {{message}}
├─ Upload-Token: {{upload_token}}
└─ Upload-Status: {{upload_status}}

Output: Lead Record ID
```

### **Schritt 3: Create Record - Pre-Qualification**
```
Airtable: Create Record
Tabelle: Pre-Qualification

Felder:
├─ Lead: {{Lead Record ID}} (Linked Record)
├─ Call-Status: "offen"
├─ Empfehlung: (leer)
└─ Kommentar: (leer)
```

---

## **✅ BESTÄTIGUNGEN**

### **Token-Quelle:**
- ✅ Es gibt **GENAU EINE** Token-Quelle: `script.js` → `generateUploadToken()`
- ✅ Upload-Seiten erzeugen **KEINE** Tokens
- ✅ Token wird **EINMALIG** bei Funnel-Submit generiert

### **Szenario 1 isoliert:**
- ✅ Alte Webhooks **NICHT** mehr verwendet
- ✅ Payload **NUR** mit spezifizierten Feldern
- ✅ Keine `lead_status`, `call_status`, `source` Felder
- ✅ Saubere camelCase Feldnamen

### **Pre-Qualification:**
- ✅ Wird **AUTOMATISCH** in Make erstellt
- ✅ Verknüpft mit Lead (Linked Record)
- ✅ Call-Status = "offen"
- ✅ Empfehlung & Kommentar leer

---

## **🔧 NÄCHSTE SCHRITTE**

1. **✅ Make Webhook URL eingetragen:**
   ```javascript
   // In script.js Zeile 350:
   const WEBHOOK_URL = 'https://hook.eu2.make.com/kjqducl2q4jfp0p8ti13xi8gripfznyy';
   ```

2. **Make Scenario konfigurieren:**
   - Custom Webhook erstellen
   - Airtable: Create Record (Leads)
   - Airtable: Create Record (Pre-Qualification)

3. **Testen:**
   - Funnel ausfüllen und absenden
   - In Make prüfen: Daten angekommen?
   - In Airtable prüfen: Lead + Pre-Qualification erstellt?

---

## **📋 ALTE FUNKTIONEN / WEBHOOKS**

### **Entfernt / Deaktiviert:**

| Was | Wo | Status |
|-----|-----|--------|
| Alter Webhook `bgbsqrlu16mzzurjhuvpb2k1lnafeuk5` | `script.js` Zeile 350 | ❌ Ersetzt durch neuen Webhook |
| Felder `lead_status`, `call_status`, `source` | `script.js` Payload | ❌ Entfernt |
| Snake-case Feldnamen | `script.js` Payload | ❌ Auf camelCase geändert |

### **NICHT berührt (separate Systeme):**

| Was | Wo | Status |
|-----|-----|--------|
| `upload.html` | Alte Upload-Seite | ⚠️ Veraltet, nicht gelöscht |
| `upload-v2.html` | Alte Upload-Seite | ⚠️ Veraltet, nicht gelöscht |
| `upload-final.html` | Aktive Upload-Seite | ✅ Szenario 2 (separate) |

---

**Version:** 1.0 (Szenario 1 - Sauber)
**Datum:** 2026-01-22
**Status:** ✅ Webhook konfiguriert - Bereit zum Testen
