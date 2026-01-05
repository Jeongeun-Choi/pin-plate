# Implementation Plan: Next.js + React Native Setup

**Branch**: `001-setup-nextjs-project` | **Date**: 2026-01-05 | **Spec**: [specs/001-setup-nextjs-project/spec.md](specs/001-setup-nextjs-project/spec.md)
**Input**: Feature specification from `/specs/001-setup-nextjs-project/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Initialize a pnpm monorepo containing a Next.js web application, a React Native mobile application, and a shared UI package. Apps will consume the UI package via pnpm workspaces, adhering to the Pin-Plate constitution.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (Strict Mode)
**Primary Dependencies**:
-   **Web**: Next.js (App Router), Vanilla Extract, Jotai, react-naver-maps
-   **Mobile**: React Native (Expo), react-native-webview
-   **Shared**: Vanilla Extract (Styling), Radix UI (Primitives - Optional)
**Storage**: N/A
**Testing**: Jest + React Testing Library (Web), Jest + RNTL (Mobile)
**Target Platform**: Mobile Web / WebView / iOS / Android
**Project Type**: Monorepo (Web + Mobile + Shared UI)
**Performance Goals**: N/A for setup
**Constraints**: Strict adherence to Constitution (Vanilla Extract, Jotai)
**Scale/Scope**: Initial Project Setup

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

-   **Project Identity**: Matches (Pin-Plate).
-   **Tech Stack**: Matches (Next.js, Vanilla Extract, Jotai, React Native).
-   **Coding Guidelines**: Will be established in initial config.

**Result**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/001-setup-nextjs-project/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
.
├── apps/
│   ├── web/             # Next.js App Router
│   │   ├── src/
│   │   │   ├── app/     # App Router (page, layout)
│   │   │   ├── features/# Feature-based modules
│   │   │   └── shared/  # Shared utilities & styles
│   │   │       └── styles/ # Global theme & reset
│   │   ├── next.config.mjs # Config with Vanilla Extract
│   │   └── package.json
│   └── mobile/          # React Native (Expo)
├── packages/
│   └── ui/              # Shared UI Components (Vanilla Extract)
├── pnpm-workspace.yaml  # Workspace config
└── package.json         # Root dependencies
```

**Structure Decision**: Monorepo with pnpm workspaces and shared packages.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Monorepo | Multiple apps (Web, Mobile) | Managing two separate repos is harder for shared types/logic. |
