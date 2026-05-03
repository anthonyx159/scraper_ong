# Documentación Adicional - Google Sheets Integration

## Configuración Detallada de Google Sheets

### Paso 1: Crear el Google Sheet

1. Ir a [Google Sheets](https://sheets.google.com)
2. Crear nuevo sheet
3. Copiar el ID del sheet de la URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

### Paso 2: Configurar Apps Script

1. En el Google Sheet, ir a **Extensiones** → **Apps Script**
2. Reemplazar el código con:

```javascript
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSheet();
    
    // Limpiar datos antiguos (opcional)
    if (payload.clearPrevious) {
      sheet.clearContents();
    }
    
    // Agregar headers si está vacío
    if (sheet.getLastRow() === 0) {
      const headers = [
        'ID',
        'Título',
        'Descripción',
        'Organización',
        'Categoría',
        'Ubicación',
        'Fecha Límite',
        'Enlace',
        'Fecha de Scraping'
      ];
      sheet.appendRow(headers);
      
      // Formatear headers
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackgroundColor('#4CAF50');
      headerRange.setFontColor('#FFFFFF');
    }
    
    // Agregar filas de datos
    const opportunities = payload.opportunities || [];
    opportunities.forEach(opp => {
      sheet.appendRow([
        opp.id,
        opp.title,
        opp.description,
        opp.organization,
        opp.category,
        opp.location,
        opp.deadline || '',
        opp.link,
        opp.scrapedAt
      ]);
    });
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, headers.length);
    
    Logger.log(`Agregadas ${opportunities.length} oportunidades`);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        addedCount: opportunities.length,
        totalCount: sheet.getLastRow() - 1
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (e) {
    Logger.log('Error: ' + e.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: e.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Para testing
function testPost() {
  const mockEvent = {
    postData: {
      contents: JSON.stringify({
        opportunities: [
          {
            id: 'test-1',
            title: 'Test Opportunity',
            description: 'Test description',
            organization: 'Test Org',
            category: 'Tech',
            location: 'Remote',
            deadline: new Date().toISOString(),
            link: 'https://example.com',
            scrapedAt: new Date().toISOString()
          }
        ],
        totalCount: 1,
        scrapedAt: new Date().toISOString()
      })
    }
  };
  
  Logger.log(doPost(mockEvent));
}
```

### Paso 3: Crear Deployment

1. Ir a **Implementaciones** → **Implementar nuevas**
2. Seleccionar tipo: **Aplicación web**
3. Ejecutar como: Tu cuenta
4. Quien tiene acceso: **Cualquiera**
5. Copiar la URL de la aplicación web
6. Pegarla en `.env` como `GOOGLE_SHEETS_SCRIPT_URL`

### Paso 4: Compartir el Sheet

Si quieres que otros vean los datos:
1. Click en **Compartir**
2. Seleccionar permisos (Editor, Visualizador, etc.)
3. Copiar el enlace

## Alternativa: Usar Google Sheets API (Opcional)

Si prefieres más control y funcionalidades avanzadas:

```typescript
// services/google-sheets-api.ts
import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';

export class GoogleSheetsAPIService {
  private sheets = google.sheets({ version: 'v4' });
  private auth: GoogleAuth;

  constructor(credentials: string) {
    this.auth = new GoogleAuth({
      keyFile: credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
  }

  async appendRows(spreadsheetId: string, values: any[][]): Promise<boolean> {
    try {
      await this.sheets.spreadsheets.values.append({
        auth: this.auth,
        spreadsheetId,
        range: 'Sheet1!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values
        }
      });
      return true;
    } catch (error) {
      console.error('Error appending to sheet:', error);
      return false;
    }
  }
}
```

## Troubleshooting Google Sheets

| Problema | Solución |
|----------|----------|
| 403 Forbidden | URL inválida o deployment privado |
| 401 Unauthorized | Verificar permisos del Sheet |
| Timeout | Aumentar `PLAYWRIGHT_TIMEOUT` |
| Datos duplicados | Usar `clearPrevious: true` en payload |
| Formato incorrecto | Revisar mapping de campos |

## Monitoring y Alertas

Para monitorear los scraping automáticamente:

```typescript
// Integración con Slack (opcional)
async function notifySlack(result: ScraperResult) {
  const webhook = process.env.SLACK_WEBHOOK_URL;
  
  await axios.post(webhook, {
    text: result.success 
      ? `✅ Scraping exitoso: ${result.scrapedCount} oportunidades`
      : `❌ Error en scraping: ${result.error}`
  });
}
```

---

**Nota**: Esta documentación asume que estás usando Google Sheets como almacenamiento. Puedes reemplazar esto con cualquier base de datos según tus necesidades.
