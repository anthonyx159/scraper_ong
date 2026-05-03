# Análisis Preliminar del Sitio: WePrope Oportunidades

## 📍 URL Target
https://www.wepropel.org/oportunidades

## 🔍 Notas Importantes para Scraping

Este documento guía el desarrollo del scraper. Debe ser actualizado cuando cambie la estructura del sitio.

## 🎯 Objetivo
Extraer información sobre oportunidades de empleo/voluntariado/capacitación ofrecidas por WePrope.

## 📊 Datos a Extraer

### Campos Principales (Implementado)

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `id` | string | ID único del registro | ✅ |
| `title` | string | Título de la oportunidad | ✅ |
| `description` | string | Descripción completa | ✅ |
| `organization` | string | Organización que ofrece | ✅ |
| `category` | string | Categoría (Empleo, Voluntariado, etc) | ✅ |
| `location` | string | Ubicación geográfica | ✅ |
| `deadline` | Date | Fecha límite de aplicación | ❌ |
| `link` | string | URL de la oportunidad | ✅ |
| `scrapedAt` | Date | Cuándo fue extraído | ✅ |

### Posibles Campos Futuros

- Salario / Rango salarial
- Tipo de contrato (Full-time, Part-time)
- Nivel de experiencia requerido
- Habilidades necesarias
- Beneficios
- Empresa (si aplica)

## 🔧 Indicadores de Cambios Estructurales

Para saber si necesitas actualizar el scraper:

**El scraper falla cuando:**
- ❌ El selector `[data-test="opportunity-item"]` no encuentra elementos
- ❌ Los campos esperados no están presentes
- ❌ La URL cambió o el sitio está en mantenimiento

**Indicadores visuales de cambio:**
- 📱 Layout completamente diferente
- 🔄 Paginación diferente
- 🆕 Nuevos campos o diferentes nombres
- 🗑️ Campos removidos

## 📌 Próximos Pasos para Mejorar el Scraper

### Phase 1: Verificación Manual
- [ ] Acceder a https://www.wepropel.org/oportunidades
- [ ] Inspeccionar estructura HTML (DevTools)
- [ ] Identificar selectores CSS/XPath reales
- [ ] Actualizar selectores en [src/scrapers/wepropel.ts](../src/scrapers/wepropel.ts)

### Phase 2: Testing y Ajustes
- [ ] Ejecutar `npm run scrape` con headless=false para debugging
- [ ] Ajustar timeouts si es necesario
- [ ] Validar que todos los datos se extraen correctamente
- [ ] Capturar imágenes/screenshots para referencia

### Phase 3: Optimización
- [ ] Agregar caché de resultados
- [ ] Implementar detección de cambios
- [ ] Agregar más campos si están disponibles
- [ ] Optimizar selectores para performance

## 🚨 Debugging

### Ejecutar en modo visual (no headless)

```bash
# Editar .env
PLAYWRIGHT_HEADLESS=false

npm run scrape
```

### Agregar logs detallados

```typescript
// En src/scrapers/wepropel.ts
logger.debug('Page content:', await this.page?.content());
logger.debug('Found elements:', opportunityElements.length);
```

### Captura de pantalla para debugging

```typescript
await this.page?.screenshot({ path: 'debug.png' });
```

## 📋 Checklist de Mantenimiento

Revisa regularmente:

- [ ] ¿El sitio sigue en línea?
- [ ] ¿El estructura HTML cambió?
- [ ] ¿Los selectores siguen siendo válidos?
- [ ] ¿Hay nuevos campos disponibles?
- [ ] ¿El rendimiento es óptimo?
- [ ] ¿Hay errores en logs?

## 🔗 Recursos Útiles

- [DevTools de Chrome para inspeccionar](https://developer.chrome.com/docs/devtools/)
- [Selector CSS reference](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors)
- [XPath reference](https://developer.mozilla.org/en-US/docs/Web/XPath)
- [Playwright selectors](https://playwright.dev/docs/locators)

---

**Última verificación**: Abril 2026  
**Estado**: Pronto a ser testeado  
**Responsable**: Equipo de desarrollo
