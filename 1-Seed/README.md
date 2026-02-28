# 1-Seed

Step 1 of the SPFx Learning Ladder -- **Hello World**.

A minimal web part that introduces the foundational project structure, design patterns, and tooling used in all subsequent stages.

## What You'll Learn

| Concept | What it teaches |
| ------- | --------------- |
| **Project structure** | `webparts/`, `components/`, `models/`, `styles/`, `loc/` folder layout |
| **Barrel exports** | `index.ts` re-exports for clean import paths |
| **React component** | Functional component with typed props |
| **Theming** | `onThemeChanged()` hook, dark/light mode via CSS classes |
| **Localization** | String resources with `mystrings.d.ts` and per-locale JS files |
| **Environment detection** | SharePoint, Teams, Office, Outlook host detection |

## Key Files to Study

- `src/webparts/app/AppWebPart.ts` -- web part lifecycle, theme handling, environment detection
- `src/components/App.tsx` -- functional React component with typed props
- `src/models/AppProps.ts` -- component props type definition
- `src/models/BaseWebPartProps.ts` -- property pane type (reused in all stages)
- `src/styles/App.module.scss` -- scoped SCSS module with dark theme support

## Getting Started

```bash
cd 1-Seed/app
npm install
npm start
```

## Next Step

Continue to [2-Seedling](../2-Seedling/) to add Graph API integration and custom React hooks.
