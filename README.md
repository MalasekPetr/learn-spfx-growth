# SPFx Learning Ladder

A 4-step progressive learning path for SharePoint Framework (SPFx) developers. Each stage builds on the previous one, introducing new concepts while maintaining a consistent, durable project structure.

![SPFx Learning Ladder](growth.png)

## Stages

| Stage | Folder | Web Part | Key Concepts |
| ----- | ------ | -------- | ------------ |
| 1 | [1-Seed](1-Seed/) | Hello World | Project structure, barrel exports, React component basics, localization, theming |
| 2 | [2-Seedling](2-Seedling/) | My Files Explorer | Graph API, OneDrive browsing, custom React hooks, Fluent UI components |
| 3 | [3-Plant](3-Plant/) | Phone List | Graph pagination, debounced search, diacritics normalization, property pane toggles |
| 4 | [4-Tree](4-Tree/) | Assets Deployment | PnP/JS CRUD, lookup columns, OData filtering, IndexedDB caching (Dexie), service/cache layers |

## How to Use

1. Start with **1-Seed** -- understand the project structure and design patterns
2. Move to **2-Seedling** -- compare it with 1-Seed to see what changed and why
3. Continue through **3-Plant** and **4-Tree**, each time diffing against the previous stage

## Getting Started

Each stage is a standalone SPFx project. To run any stage:

```bash
cd <Stage>/app
npm install
npm start
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
  services/     -- API service layer          (from 4-Tree)
  cache/        -- IndexedDB cache            (from 4-Tree)
```

## Tech Stack

- SharePoint Framework 1.22.2
- React 17
- TypeScript 5.8
- Fluent UI React 8
- Heft build system
