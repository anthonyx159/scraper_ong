# 📁 Documentación del Proyecto

Este directorio contiene documentación adicional sobre el proyecto scraper-ong.

## Documentos Disponibles

### 1. [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md)
**Configuración completa de Google Sheets**
- Cómo crear un Google Sheet y Apps Script
- Deployment de la aplicación web
- Código de Apps Script listo para usar
- Troubleshooting de problemas comunes
- Alternativa: Google Sheets API

**Para quién**: Desarrolladores que configuran la integración por primera vez

### 2. [DEPLOYMENT.md](./DEPLOYMENT.md)
**Guía de deployment en producción**
- Deployment en Heroku, Railway, AWS Lambda, Docker
- Scheduling automático (Cron, Bull, GitHub Actions)
- Monitoreo con Sentry
- CI/CD con GitHub Actions
- Roadmap de escalabilidad

**Para quién**: DevOps engineers y desarrolladores senior

### 3. [BEST_PRACTICES.md](./BEST_PRACTICES.md)
**Guía de arquitectura y buenas prácticas**
- Principios SOLID
- Patrones de diseño (Strategy, Factory, Observer)
- Convenciones de código
- Performance optimization
- Testing strategy
- Logging patterns

**Para quién**: Developers que quieren entender la arquitectura

## Estructura del Proyecto Principal

```
scraper_ong/
├── src/
│   ├── config/          # Configuración (env, logger)
│   ├── scrapers/        # Lógica de web scraping
│   ├── services/        # Servicios (Google Sheets, orquestación)
│   ├── types/           # TypeScript types
│   ├── __tests__/       # Tests unitarios
│   ├── app.ts           # Aplicación Hono
│   └── index.ts         # Entry point
├── docs/                # Documentación (este directorio)
├── package.json         # Dependencias
├── tsconfig.json        # Config TypeScript
├── .env.example         # Variables de entorno de ejemplo
└── README.md            # README principal

```

## Flujo de Trabajo Recomendado

### Para Desarrollo Local

1. **Setup inicial**
   ```bash
   npm install
   cp .env.example .env
   # Editar .env con tus credenciales
   ```

2. **Desarrollo**
   ```bash
   npm run dev
   ```

3. **Testing**
   ```bash
   npm run test
   npm run type-check
   npm run lint
   ```

4. **Deploy local**
   ```bash
   npm run build
   npm start
   ```

### Para Agregar Nuevo Scraper

1. Ver estructura en [BEST_PRACTICES.md](./BEST_PRACTICES.md#factory-pattern)
2. Crear clase que extienda `BaseScraper`
3. Implementar métodos `initBrowser()` y `scrape()`
4. Agregar tests en `src/__tests__/`
5. Usar en `ScraperService`

### Para Cambiar Storage (de Google Sheets a BD)

1. Crear `DatabaseService implements IDataStore`
2. Inyectar en `ScraperService`
3. No necesita cambios en lógica de scraping

## Preguntas Frecuentes

### ¿Cómo agrego un nuevo scraper?
Ver [BEST_PRACTICES.md - Factory Pattern](./BEST_PRACTICES.md#factory-pattern)

### ¿Cómo configuro Google Sheets?
Ver [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md)

### ¿Cómo hago deploy a producción?
Ver [DEPLOYMENT.md](./DEPLOYMENT.md)

### ¿Cómo configuro scraping automático?
Ver [DEPLOYMENT.md - Scheduling](./DEPLOYMENT.md#-scheduling-ejecutar-automáticamente)

### ¿Cuál es la arquitectura del proyecto?
Ver [BEST_PRACTICES.md - Arquitectura](./BEST_PRACTICES.md#arquitectura)

## Links Útiles

- 📘 [Documentación de Hono](https://hono.dev)
- 🎭 [Documentación de Playwright](https://playwright.dev)
- 🔧 [Google Apps Script API](https://developers.google.com/apps-script)
- 📚 [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- 🧪 [Vitest Documentation](https://vitest.dev)

## Estado del Proyecto

- ✅ Versión: 1.0.0 - MVP Completo
- ✅ Estructura escalable y mantenible
- ✅ TypeScript con type safety completo
- ✅ Documentación completa
- 🔄 Roadmap de mejoras en [DEPLOYMENT.md](./DEPLOYMENT.md#-escalabilidad-próximos-pasos)

---

**Última actualización**: Abril 2026  
**Mantenedor**: Tu equipo de desarrollo
