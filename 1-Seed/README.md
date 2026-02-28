# 1-Seed

Step 1 of the SPFx Learning Ladder -- **Hello World**.

A minimal web part that introduces the foundational project structure, design patterns, and tooling used in all subsequent stages.

## What You'll Learn

| Concept | What it teaches |
| ------- | --------------- |
| **Project structure** | `webparts/`, `components/`, `models/`, `styles/`, `loc/` folder layout |
| **Barrel exports** | `index.ts` re-exports for clean import paths |
| **React component** | Functional component with typed props |
| **BaseWebPartProps** | `webPartProps` wrapper pattern reused in every stage |
| **Theming** | `onThemeChanged()` hook, dark/light mode via CSS variables |
| **Localization** | String resources with `mystrings.d.ts` and per-locale JS files |
| **Environment detection** | SharePoint, Teams, Office, Outlook host detection |

## Key Files to Study

| File | Purpose |
| ---- | ------- |
| `src/webparts/app/AppWebPart.ts` | Web part lifecycle, theme handling, environment detection |
| `src/components/App.tsx` | Functional React component with typed props |
| `src/models/AppProps.ts` | Component props type definition |
| `src/models/BaseWebPartProps.ts` | Property pane type (reused in all stages) |
| `src/styles/App.module.scss` | Scoped SCSS module with dark theme support |
| `src/loc/mystrings.d.ts` | Type-safe localization declarations |

See [app/README.md](app/README.md) for detailed architecture explanations and code walkthroughs.

## Getting Started

### Prerequisites

- Node.js **22.x** (required by SPFx 1.22.2)
- A Microsoft 365 developer tenant or SharePoint Online site

### Install

```bash
cd 1-Seed/app
npm install
```

### Local Development

```bash
npm start
```

This starts the local dev server at `https://localhost:4321`. Open your SharePoint workbench:

```text
https://<tenant>.sharepoint.com/_layouts/15/workbench.aspx
```

### Build & Package

```bash
npm run build
```

This compiles TypeScript, bundles the web part, and produces `sharepoint/solution/seed.sppkg`.

### Deploy

1. Upload `seed.sppkg` to your **SharePoint App Catalog** (tenant or site-level)
2. Trust the solution when prompted
3. Add the web part to any SharePoint page

### Test

- Add the web part to a workbench or SharePoint page
- Verify the welcome message shows your display name
- Edit the web part properties -- change the description field
- Switch to dark mode in SharePoint settings and verify the theme responds

## Next Step

Continue to [2-Seedling](../2-Seedling/) to add Graph API integration and custom React hooks.
