# linear-kanban-board

High-performance task board and sprint tracking UI built with React 19, TypeScript, Tailwind CSS, Zustand, and @dnd-kit. Visual language faithfully follows Linear.app engineering design tokens (`#08090a` canvas, `#0f1011` charcoal panels, and signature `#5e6ad2` lavender-blue focus accents).

## Highlights & Engineering Focus

- **Accessible Drag and Drop**: Configured via `@dnd-kit/core` with pointer sensors and activation constraints preventing accidental drags during clicks.
- **Micro-Interactions**: Hover elevation, subtle hairline borders (`border-linear-border`), priority icons (urgent, high, medium, low), and quick task creation modal per column.
- **Fast Local State**: Powered by Zustand with selectors isolating column updates and live search filtering by identifier or title.
- **Semantic Hierarchy**: Structured with `<header>`, `<main>`, `<section>`, and `<article>` tags for clear accessibility trees and keyboard focus rings.

## Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **State Management**: Zustand
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build production bundle
npm run build
```

## License

MIT © [Arkadiy Gazizov](https://arkadiygazizov.ru)
