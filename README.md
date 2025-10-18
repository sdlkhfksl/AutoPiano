# AutoPiano · Modern Web Edition

A risk-driven refresh of the AutoPiano experience with a Nuxt 3 + Vue 3 front-end, modular audio engine, and pnpm/Turborepo based workspace. The project is now deploy-ready for Vercel while keeping the classic features such as keyboard play, automatic numbered-score playback, and curated wallpapers.

## Monorepo layout

```
apps/
  web/               → Nuxt 3 application (SSR friendly, Vercel ready)
packages/
  audio-engine/      → Tone.js based playback utilities & numbered-score scheduler
  config/            → Shared datasets (notes, wallpapers, numbered scores, etc.)
```

## Getting started

```bash
pnpm install
pnpm dev      # launches the Nuxt dev server
```

### Useful scripts

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `pnpm dev`             | Start the web app locally                 |
| `pnpm build`           | Build all workspaces via Turborepo        |
| `pnpm lint`            | Run ESLint across workspaces              |
| `pnpm test`            | Execute Vitest test placeholders          |
| `pnpm preview`         | Preview the production build              |

## Deployment

The project is preconfigured for Vercel. Deploy the `apps/web` project with the default Nuxt preset – static assets (piano samples/wallpapers) are served from `apps/web/public` and the Nitro preset is already set to `vercel` in `nuxt.config.ts`.

## Key decisions

- Vue 3 + Nuxt 3 for hybrid rendering and island-friendly UX.
- Tone.js + `@tonejs/piano` wrapped in `@autopiano/audio-engine` for reusable playback logic.
- Auto-play scheduler rewritten with typed callbacks to coordinate highlighting and audio safely.
- Pinia store for wallpapers, composables for audio, and responsive piano UI adapted for touch + keyboard.
- pnpm workspaces + Turborepo orchestrate builds, linting, and testing.

## License

This project inherits the original AutoPiano open-source license (MIT).
