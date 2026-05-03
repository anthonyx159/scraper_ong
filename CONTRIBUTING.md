# Guía de Contribución

¡Gracias por querer contribuir a este proyecto! Estas guías te ayudarán a hacer contributions efectivas.

## 📝 Código de Conducta

- Sé respetuoso
- Crea un espacio inclusivo
- Enfoca el feedback en el código, no en la persona
- Acepta críticas constructivas

## 🚀 Cómo Contribuir

### Reportar Bugs

Crea un issue con:

```markdown
## Descripción
Qué sucedió y qué esperabas que sucediera

## Pasos para Reproducir
1. Ejecuta...
2. Haz...
3. Observa...

## Información Relevante
- OS: [Windows/Mac/Linux]
- Node version: 
- Logs:
```

### Sugerir Mejoras

Abre una issue con:

```markdown
## Descripción de la Mejora
Qué quieres agregar y por qué

## Beneficios
Cómo beneficia al proyecto

## Implementación Propuesta
Cómo podrías implementarlo
```

### Enviar Pull Requests

1. Fork el proyecto
2. Crea una rama para tu feature: `git checkout -b feature/amazing-feature`
3. Commit cambios: `git commit -m 'Add amazing feature'`
4. Push a la rama: `git push origin feature/amazing-feature`
5. Abre un Pull Request

#### Checklist para PRs

- [ ] Mi código sigue el estilo del proyecto
- [ ] Ejecuté `npm run lint` y `npm run format`
- [ ] Ejecuté `npm run type-check` sin errores
- [ ] Agregué tests para nuevas funcionalidades
- [ ] Todos los tests pasan (`npm run test`)
- [ ] Actualicé la documentación si es necesario
- [ ] Mi PR tiene descripción clara

## 📚 Estructura de Código

Al agregar nueva funcionalidad:

### Agregar Nuevo Scraper

1. Crear archivo en `src/scrapers/`:
```typescript
import { BaseScraper } from './base.js';

export class NewSiteScraper extends BaseScraper {
  async initBrowser(): Promise<void> {
    // Implementación
  }

  async scrape() {
    // Implementación
  }
}
```

2. Agregar tests en `src/__tests__/`
3. Actualizar docs si es necesario

### Agregar Nuevo Servicio

1. Crear archivo en `src/services/`
2. Implementar interfaz consistente
3. Agregar tests
4. Documentar en README si es un servicio crítico

### Agregar Nuevos Tipos

Actualizar `src/types/index.ts` con tipos TypeScript bien documentados

## 🧪 Testing

Todos los PRs deben incluir tests:

```bash
# Correr tests
npm run test

# Coverage
npm run test -- --coverage

# Modo watch para desarrollo
npm run test -- --watch
```

### Ejemplo de Test

```typescript
describe('MiServicio', () => {
  it('debería hacer algo específico', async () => {
    const resultado = await miServicio.hacer();
    expect(resultado).toBe(esperado);
  });
});
```

## 📖 Documentación

Actualizar docs cuando:

- ✍️ Agregas nueva funcionalidad
- 🔄 Cambias comportamiento existente
- 🔧 Añades nueva configuración
- 📚 Descubres un patrón útil

### Documentar con JSDoc

```typescript
/**
 * Descripción corta y clara
 * 
 * Descripción más larga si es necesario
 * @param param1 - Descripción del parámetro
 * @returns Lo que retorna
 * @throws Errores que puede lanzar
 * @example
 * const resultado = await miFuncion(param);
 */
async function miFuncion(param1: string): Promise<void> {}
```

## 🏗️ Estándares de Código

### TypeScript

- Siempre tipado
- Usar interfaces cuando sea apropiado
- Evitar `any`

### Naming

- `camelCase` para variables y funciones
- `PascalCase` para clases e interfaces
- `UPPER_SNAKE_CASE` para constantes

### Formato

```bash
# Automático
npm run format

# Validar
npm run lint
```

## 📦 Proceso de Release

1. Update version en `package.json`
2. Actualizar `CHANGELOG.md` (si existe)
3. Crear git tag: `git tag vX.Y.Z`
4. Push tags: `git push origin --tags`

## ❓ Preguntas?

- Abre una issue con label `question`
- Revisa [README.md](./README.md)
- Chequea los docs en `docs/`

---

¡Gracias por contribuir! 🎉
