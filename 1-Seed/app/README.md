# Seed - SPFx Starter Web Part

A minimal SharePoint Framework (SPFx) v1.22.2 web part built with **React** and **TypeScript**. This project serves as an educational reference for understanding SPFx project structure, conventions, and best practices.

> **Learning path:** This is step **1** in the series. It establishes the foundational patterns -- project structure, barrel exports, typed props, theming, and localization -- that are reused and extended in every subsequent stage.

## Technology Stack

| Technology | Version | Purpose |
| --- | --- | --- |
| SPFx | 1.22.2 | SharePoint Framework |
| React | 17.0.1 | UI rendering |
| TypeScript | 5.8 | Type-safe development |
| Fluent UI | 8.x | Microsoft design system |
| Heft | 1.1.2 | Build toolchain |
| Node.js | 22.x | Runtime |

## Project Structure

```text
app/
├── config/                        # SPFx build & deploy configuration
│   ├── config.json                  # Bundle and localization settings
│   ├── package-solution.json        # Solution packaging metadata
│   ├── rig.json                     # Build rig reference
│   ├── serve.json                   # Local dev server (port 4321)
│   └── ...
├── src/
│   ├── webparts/
│   │   └── app/
│   │       ├── AppWebPart.ts              # Web part entry point
│   │       └── AppWebPart.manifest.json   # Web part metadata & hosts
│   ├── components/
│   │   ├── App.tsx                  # Main React component
│   │   └── index.ts                 # Barrel export
│   ├── models/
│   │   ├── AppProps.ts              # Component props type
│   │   ├── BaseWebPartProps.ts      # Web part properties type
│   │   └── index.ts                 # Barrel export
│   ├── styles/
│   │   └── App.module.scss          # Scoped SCSS styles
│   ├── loc/
│   │   ├── en-us.js                 # English strings
│   │   ├── cs-cz.js                 # Czech strings
│   │   └── mystrings.d.ts          # Localization type definitions
│   └── index.ts                     # Root entry point
├── package.json
└── tsconfig.json
```

## Architecture Overview

The data flow follows a clear top-down pattern:

```text
AppWebPart.ts  (SPFx lifecycle, theme, context)
      │
      ▼
   App.tsx     (React component, renders UI)
      │
      ▼
 App.module.scss  (Scoped styles with theme variables)
```

### Layer Responsibilities

**`webparts/app/AppWebPart.ts`** - The SPFx entry point. Extends `BaseClientSideWebPart` and handles:

- Creating and rendering the React element tree
- Environment detection (SharePoint, Teams, Outlook, Office)
- Theme change handling (light/dark mode)
- Injecting CSS custom properties (`--bodyText`, `--link`, `--linkHovered`) from the current theme
- Cleanup on dispose

**`components/App.tsx`** - A stateless React functional component that receives props from the web part and renders:

- A welcome greeting with the current user's display name
- The configurable description property
- An environment message showing where the app is running

**`models/`** - TypeScript type definitions that form the contract between layers:

- `BaseWebPartProps` - Properties configurable via the web part property pane
- `AppProps` - Full props passed to the React component (includes web part props + theme + user context)

**`loc/`** - Localization layer with type-safe string resources for English and Czech.

**`styles/`** - SCSS modules with Fluent UI references and theme variable bindings for dark/light mode support.

## Key Concepts Demonstrated

### 1. Environment Detection

The web part detects its hosting environment at runtime and displays a corresponding message. This is essential because SPFx web parts can run in multiple Microsoft 365 contexts:

```typescript
// AppWebPart.ts - simplified
private _getEnvironmentMessage(): Promise<string> {
  if (!!this.context.sdks.microsoftTeams) {
    // Running in Teams, Outlook, or Office
    return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
      .then(context => {
        switch (context.app.host.name) {
          case 'Teams':    return strings.AppTeamsTabEnvironment;
          case 'Outlook':  return strings.AppOutlookEnvironment;
          case 'Office':   return strings.AppOfficeEnvironment;
          default:         return strings.UnknownEnvironment;
        }
      });
  }
  return Promise.resolve(strings.AppSharePointEnvironment);
}
```

### 2. Theme Integration

The web part responds to SharePoint theme changes by mapping semantic colors to CSS custom properties:

```typescript
// AppWebPart.ts
protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
  this._isDarkTheme = !!currentTheme.isInverted;
  const { semanticColors } = currentTheme;
  if (semanticColors) {
    this.domElement.style.setProperty('--bodyText', semanticColors.bodyText);
    this.domElement.style.setProperty('--link', semanticColors.link);
  }
}
```

These are then consumed in SCSS:

```scss
.app {
  color: var(--bodyText);
  &.dark {
    color: var(--bodyText); // different default fallback
  }
}
```

### 3. Type-Safe Localization

Localization strings are defined with a TypeScript declaration file, ensuring compile-time safety:

```typescript
// loc/mystrings.d.ts
declare interface ILocalization {
  AppSharePointEnvironment: string;
  AppTeamsTabEnvironment: string;
  // ...
}
declare module 'Localization' {
  const strings: ILocalization;
  export = strings;
}
```

String resources are loaded via AMD modules (`loc/en-us.js`, `loc/cs-cz.js`) and SPFx resolves the correct locale at runtime.

### 4. Clean Type Contracts

Props are separated into layers — `BaseWebPartProps` for configurable web part properties and `AppProps` for the full component interface:

```typescript
// models/BaseWebPartProps.ts
export type BaseWebPartProps = {
  description: string;
}

// models/AppProps.ts
export type AppProps = {
  webPartProps: BaseWebPartProps;
  isDarkTheme: boolean;
  userDisplayName: string;
  environmentMessage: string;
}
```

This separation makes it easy to extend web part properties without changing the component contract, and vice versa.

## Supported Hosts

Configured in `AppWebPart.manifest.json`:

| Host | Description |
| --- | --- |
| `SharePointWebPart` | Embedded on a SharePoint page |
| `SharePointFullPage` | Full-page app in SharePoint |

Additional hosts like `TeamsTab`, `TeamsPersonalApp`, `OutlookMailCompose`, and `OutlookModule` can be added to the `supportedHosts` array in the manifest.

## Getting Started

### Prerequisites

- Node.js **22.x** (required by SPFx 1.22.2)
- A Microsoft 365 developer tenant or SharePoint Online site

### Install & Run

```bash
# Install dependencies
npm install

# Start the local development server (https://localhost:4321)
npm start
```

Then navigate to your SharePoint workbench:
`https://<tenant>.sharepoint.com/_layouts/15/workbench.aspx`

### Build & Package

```bash
# Production build + test + package
npm run build
```

This produces `sharepoint/solution/seed.sppkg` which can be uploaded to your SharePoint App Catalog.

### Other Commands

```bash
# Clean build artifacts
npm run clean

# Eject webpack config for advanced customization
npm run eject-webpack
```

## Extending This Project

To use this as a starting point for a real web part:

1. **Add web part properties** - Define new fields in `BaseWebPartProps` and add corresponding property pane controls in `AppWebPart.ts`
2. **Add components** - Create new React components in `src/components/` and compose them in `App.tsx`
3. **Add hooks** - Create a `src/hooks/` folder for custom React hooks, e.g., for SharePoint API calls, Graph API integration, etc.
4. **Add localization strings** - Update both `loc/en-us.js` and `loc/cs-cz.js` along with the type declaration in `mystrings.d.ts`

## License

MIT
