# SPFx Learning Ladder

A progressive 4-step learning path for SharePoint Framework (SPFx) developers. Each stage builds on the previous one, introducing new concepts while maintaining a consistent project structure.

![SPFx Learning Ladder](growth.png)

## Stages

| Stage | Folder | Web Part | Key Concepts |
| ----- | ------ | -------- | ------------ |
| 1 | [1-Seed](1-Seed/) | Hello World | Project structure, barrel exports, React basics, localization, theming |
| 2 | [2-Seedling](2-Seedling/) | OneDrive Explorer | Graph API, custom React hooks, Fluent UI components |
| 3 | [3-Plant](3-Plant/) | Phone List | Graph pagination, service layer, Dexie caching, alphabet filter, department filter |
| 4 | [4-Tree](4-Tree/) | Assets Deployment | PnP/JS CRUD, lookup columns, OData filtering, multi-table caching |

## How to Learn

The recommended approach is **diff-based comparison**. After studying a stage, compare it with the previous one to see exactly what changed and why:

1. **1-Seed** -- Study the project structure and foundational patterns
2. **2-Seedling** -- Compare with Seed to see how Graph API and hooks are added
3. **3-Plant** -- Compare with Seedling to see how services, caching, and filtering are introduced
4. **4-Tree** -- Compare with Plant to see how CRUD, PnP/JS, and lookup columns work

Each stage has two READMEs:

- **Stage README** (e.g. `1-Seed/README.md`) -- practical guide: prerequisites, build, deploy, test
- **App README** (e.g. `1-Seed/app/README.md`) -- deep educational content: architecture, code walkthroughs, key concepts

## Concepts Progression

```text
Seed          Seedling         Plant              Tree
────          ────────         ─────              ────
Structure     + Graph API      + Pagination        + PnP/JS (SP lists)
Components    + React Hooks    + Service layer     + CRUD operations
Models        + Utils          + Cache layer       + Lookup columns
Styles        + Fluent UI      + Dexie.js          + OData server-side filter
Localization                   + Alphabet filter   + Multi-table cache
                               + Dept. dropdown    + Pivot, Panels, Dialogs
```

## Folder Convention

Every stage follows the same `src/` layout, gaining new folders as complexity grows:

```text
src/
  webparts/     -- SPFx web part entry point
  components/   -- React components
  models/       -- TypeScript types
  styles/       -- SCSS modules
  loc/          -- Localization strings
  hooks/        -- Custom React hooks        (from 2-Seedling)
  utils/        -- Utility functions          (from 2-Seedling)
  services/     -- API service layer          (from 3-Plant)
  cache/        -- IndexedDB cache            (from 3-Plant)
```

## Quick Start

Each stage is a standalone SPFx project:

```bash
cd <Stage>/app
npm install
npm start
```

See each stage's README for detailed setup, build, deploy, and testing instructions.

## Tech Stack

- SharePoint Framework 1.22.2
- React 17 + TypeScript 5.8
- Fluent UI React 8
- Heft build system
- Node.js 22.x
