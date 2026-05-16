# Modern Portfolio — Frontend

Portfolio personal de **Juan Albarracín**. React + TypeScript + Vite. Admin mode, i18n, stats, chatbot.

## Stack

- **Framework**: React 19 (compiler)
- **Build**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Routing**: React Router
- **State**: Zustand 5
- **i18n**: react-i18next (ES/EN)
- **Charts**: recharts + shadcn/ui ChartContainer
- **UI**: Radix + shadcn/ui, Lucide icons
- **Package**: pnpm (también Bun)

## Features

- **Admin mode** — inline edit, stats dashboard, logs, project CRUD
- **Stats dashboard** — charts (language, timeline, GitHub, traffic), admin logs with dominance filter
- **Chatbot** — AI-powered assistant via Gemini
- **i18n** — full ES/EN, per-page, rich text in translations
- **Dynamic backgrounds** — particles, animated clouds
- **Floating contact** — quick access to chat, GitHub, contact form

## Quick Start

```bash
pnpm install
pnpm run dev       # http://localhost:5173
pnpm run build     # producción
pnpm tsc --noEmit  # type check
```

## Architecture

```
src/
├── app/           # layouts, routing, providers
├── assets/        # static files
├── components/    # shared UI (shadcn, custom)
├── features/      # domain modules (admin, i18n, theme)
├── i18n/          # locale files (en.json, es.json)
├── pages/         # page components
├── shared/        # API clients, types, utils
└── styles/        # global CSS
```

---

Built by [Juan Albarracín](https://github.com/Albarracin-sg)
