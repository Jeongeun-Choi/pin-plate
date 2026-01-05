# Data Model / Project Structure

## Directory Structure

```text
pin-plate/
├── package.json          # Root scripts (e.g., "dev:web", "dev:mobile")
├── pnpm-workspace.yaml   # Workspace definition
├── apps/
│   ├── web/              # Next.js Application
│   │   ├── src/
│   │   │   ├── app/      # Pages & Layouts
│   │   │   ├── features/ # Domain features (e.g., auth, map)
│   │   │   └── shared/   # Shared utils, hooks, styles
│   │   │       └── styles/
│   │   │           ├── theme.css.ts
│   │   │           └── reset.css.ts
│   │   ├── next.config.mjs
│   │   └── package.json
│   └── mobile/           # React Native (Expo) Application
│       ├── app/          # Expo Router (if used) or App.tsx
│       ├── app.json      # Expo config
│       └── package.json
└── packages/
    └── ui/               # Shared UI Components
        ├── src/
        ├── package.json
        └── tsconfig.json
```

## Core State (Jotai Atoms)

*Initial atoms to be created for demonstration/setup:*

-   `userAtom`: Placeholder for user state (Shared concept, likely separate implementation initially).