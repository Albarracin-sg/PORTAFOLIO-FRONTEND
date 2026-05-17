# PORTAFOLIO-FRONTEND — Repo Manifest

> Cualquier modelo (Claude, GPT, Copilot) o dev que caiga acá: leé esto primero.
> Contiene stack, convenciones, decisiones, y estado del proyecto.

---

## Stack

| Capa       | Tecnología                                                                 |
| ---------- | -------------------------------------------------------------------------- |
| Framework  | React 19 (con React Compiler)                                               |
| Build      | Vite 8 + SWC (`@vitejs/plugin-react-swc`)                                  |
| Language   | TypeScript strict — `noUnusedLocals`, `noUnusedParameters`                  |
| Styling    | Tailwind CSS 4 + `@tailwindcss/typography` + `@tailwindcss/vite`            |
| Routing    | React Router DOM v7.13                                                     |
| State      | — (sin gestor de estado global — React state local + Server State)          |
| i18n       | react-i18next + i18next (ES / EN)                                          |
| UI Library | Radix UI (suite completa, ~30 primitives) + shadcn/ui-style components      |
| Charts     | Recharts v2                                                                |
| Icons      | lucide-react + react-icons                                                 |
| Forms      | react-hook-form + input-otp                                                |
| Carousel   | embla-carousel-react                                                       |
| Auth Admin | Custom provider (`AdminAuthProvider`) + JWT                                |

---

## Package Manager — Bun

**Único gestor oficial:** Bun.

| Situación | Comando             |
| --------- | ------------------- |
| Install   | `bun install`       |
| Dev       | `bun run dev`       |
| Build     | `bun run build`     |
| Preview   | `bunx vite preview` |

Lockfile: `bun.lock`.

> **⚠️ Historial:** El repo tuvo pnpm (local) y npm (Vercel). Ya no.
> Si ves `pnpm-lock.yaml` o `package-lock.json` — borralos.

---

## Comandos Útiles

```bash
bun run dev        # Vite dev server (port 5173)
bun run build      # Build producción → build/
bunx vite preview  # Servir build local
bun run typecheck  # TypeScript check (tsc --noEmit)
biome check --write src/  # Auto-fix
```

No hay test runner configurado (aún).

---

## Configuración del Tooling

### Biome (linter + formatter)

- `indentStyle: space`, `indentWidth: 2`
- `quoteStyle: single`
- Reglas: `recommended` + `noUnusedVariables: error`, `noUnusedImports: error`
- CI: corre `biome check src/` en GitHub Actions

### TypeScript

- `strict: true`, `noUnusedLocals`, `noUnusedParameters`
- Path alias: `@/` → `./src/`
- `jsx: "react-jsx"` (React 19 JSX transform)
- `target: ESNext`, `module: ESNext`

### Vite

- `outDir: "build"` (no `dist`)
- Plugins: `react()` (SWC) + `tailwindcss()`
- Alias para versionado de libs (versión-pinned en todos los Radix)

---

## Estructura de Carpetas

```
src/
├── app/            # Layouts (RootLayout, AdminLayout)
│   ├── layout/
│   └── routes/
├── components/     # Componentes compartidos
│   └── ui/         # shadcn/ui-style (Radix wrappers)
├── features/       # Módulos por feature
│   ├── admin/      # Admin auth, API, edit mode
│   ├── theme/      # Dark/light mode (next-themes)
│   ├── language/   # i18n provider
│   └── projects/   # Data de proyectos
├── pages/          # Page components
│   ├── HomePage/
│   ├── AllProjectsPage/
│   ├── ProjectDetailPage/
│   ├── StatsPage/
│   ├── BotChatPage/
│   ├── NotFoundPage/
│   └── Admin/      # CRUD admin dashboard
├── i18n/           # Traducciones ES/EN
├── styles/         # CSS global + Tailwind theme
├── shared/         # Tipos y utilidades compartidas
└── assets/         # Imágenes, SVGs, assets estáticos
```

---

## Convenciones de Código

### Componentes

- **Named exports** — siempre `export function ComponentName()`, no `export default`
- **Excepción:** `App.tsx` usa `export default` (requisito de React Router lazy)
- **Composición** sobre configuración — componentes chicos que se combinan
- **shadcn/ui-style** — los wrappers de Radix están en `components/ui/` y siguen el patrón de shadcn (variants con `cva`, `cn()` para merge de clases)
- **Radix directo** — features usan Radix primitives directamente cuando el wrapper de shadcn no existe o no alcanza

### Estado

- Sin gestor de estado global. El estado se maneja localmente en cada componente.
- Si se necesita estado compartido en el futuro, la recomendación es **Zustand 5**.

### i18n

- `react-i18next` con namespaces por página
- Archivos: `src/i18n/locales/{es,en}.json`
- Traducciones planas, sin anidamiento profundo
- Hook: `useTranslation('namespace')`

### Routing

- React Router DOM v7 con layouts anidados
- `RootLayout` para páginas públicas
- `AdminLayout` protegido con `RequireAdmin`
- Lazy loading con `React.lazy()` + `Suspense`
- ScrollToTop en cada ruta

### Theme

- Dark/light mode con `next-themes`
- Clase `.dark` en `<html>` para Tailwind
- Custom CSS variables en `src/styles/index.css`
- Tema personalizado (violeta primario `#7c3aed`, dark `#a78bfa`)

---

## Decisiones Arquitectónicas

| Decisión                            | Por qué                                                                   |
| ----------------------------------- | ------------------------------------------------------------------------- |
| React 19 + React Compiler           | Rendimiento sin `useMemo`/`useCallback` manuales                           |
| Vite 8 + SWC                        | Build rápido, HMR instantáneo                                             |
| Tailwind CSS 4                      | Utilidades first, sin archivos CSS separados                              |
| Radix UI + shadcn/ui                | Accesibilidad out-of-the-box + componentes headless                        |
| Bun como gestor único               | Rápido, lockfile estable, compatible con CI y Vercel                       |
| Sin test runner (aún)               | No se agregó. Recomendación futura: `vitest` + `@testing-library/react`    |
| `outDir: "build"`                   | Porque Vercel espera `build/` por defecto                                  |

---

## CI/CD

- **GitHub Actions:** Push → `biome check` → `tsc --noEmit` → `bun run build`
- **Vercel:** Deploy automático desde main → `build/`
- **Husky + lint-staged:** Pre-commit corre `biome lint --write` + `biome format --write` en staged files

---

## Estado del Proyecto

- **SDD:** Inicializado. Artefactos en engram (`sdd-init/portafolio-frontend`).
- **Testing:** ❌ No hay. Strict TDD deshabilitado.
- **Modelo AI (OpenCode):** `opencode/big-pickle` — usado por todos los sub-agents SDD.
- **Skills registry:** `.atl/skill-registry.md` — 14 skills instaladas.

## Lighthouse Baseline (mayo 2026)

| Categoría      | Puntaje |
| -------------- | ------- |
| Performance    | **59**  |
| Accesibilidad  | **81**  |
| Best Practices | **100** |
| SEO            | **100** |

**Métricas:** FCP 5.9s · LCP 7.7s · TBT 0.2s · CLS 0.006 · Peso total 2.7MB
**Cuellos de botella:** JS no usado (~1.4s ahorrable), CSS no usado (~0.8s), imágenes sin lazy loading.

> Reporte: `./lighthouse-prod.json`. Correr de nuevo: `bun run build && python3 -m http.server 4174 -d build/ && bunx lighthouse http://localhost:4174/`
