# Modern Portfolio - Full Stack Engineer

A high-performance, responsive personal portfolio built with **React**, **TypeScript**, and **Vite**. This project focuses on clean architecture, internationalization, and a seamless developer experience through integrated CI/CD workflows.

## 🚀 Key Features

- **Responsive Design**: Mobile-first approach using Tailwind CSS.
- **Internationalization (i18n)**: Multi-language support (English/Spanish) using `react-i18next`.
- **Dynamic Backgrounds**: Interactive particle systems and animated clouds for a modern aesthetic.
- **Admin Mode & Live Editing**: Inline editing capabilities for section content and images.
- **Custom UI Components**: Built on top of Radix UI and Tailwind CSS for accessibility and style.
- **Floating Actions**: Quick access to contact, GitHub, and an AI-driven chatbot dialog.
- **Performance Optimized**: Fast builds and hot reloading with Vite and Bun.

## 🛠️ Tech Stack

- **Framework**: [React 18](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Package Manager**: [Bun](https://bun.sh/)
- **Code Quality**: [Biome](https://biomejs.dev/) (Linting & Formatting)
- **Forms**: [React Hook Form](https://react-hook-form.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📂 Architecture

The project follows a **Feature-based Modular Architecture** for better maintainability and scalability:

```text
src/
├── app/            # Application providers, layouts, and routing
├── assets/         # Static assets (images, logos, CV)
├── components/     # Reusable UI components (Hero, About, etc.)
├── features/       # Domain-specific modules (Admin, Language, Theme)
├── i18n/           # Translation files and configuration
├── pages/          # Top-level page components
├── shared/         # Shared utilities, API clients, and types
└── styles/         # Global CSS and themes
```

## ⚙️ Development Setup

### Prerequisites
- [Bun](https://bun.sh/) (Recommended) or Node.js

### Installation
```bash
bun install
```

### Running Locally
```bash
bun run dev
```

### Build
```bash
bun run build
```

### Quality Checks
```bash
bunx @biomejs/biome check .    # Lint & Format
bun run tsc --noEmit           # Type check
```

## 🤖 CI/CD Workflow

This project uses **GitHub Actions** to ensure code quality and security:

- **CI**: Runs on every PR to `main`. Executes Biome check, Type-check, and Build.
- **CodeQL**: Automated security scanning for vulnerabilities.
- **Dependabot**: Weekly dependency updates to keep the stack modern and secure.
- **Stale**: Automated maintenance of inactive issues and pull requests.

## 📝 Contribution

Please use the provided **Issue Templates** for bug reports and feature requests. All Pull Requests should follow the **PR Template** and pass the CI checks before merging.

---
Built with ❤️ by [Juan Albarracín](https://github.com/Albarracin-sg)
