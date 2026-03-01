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

## Tutorial: From Yeoman Scaffold to Seed

This step-by-step guide shows how to transform a default Yeoman-generated SPFx React web part into the Seed project structure. Follow along to understand **why** each change is made.

### Step 1: Scaffold a new project with Yeoman

```bash
yo @microsoft/sharepoint
```

Choose **React** as the framework. Yeoman generates this structure inside `src/`:

```text
src/
  webparts/
    helloWorld/
      HelloWorldWebPart.ts
      HelloWorldWebPart.manifest.json
      components/
        HelloWorld.tsx
        HelloWorld.module.scss
        IHelloWorldProps.ts
      loc/
        mystrings.d.ts
        en-us.js
```

Everything lives inside `webparts/helloWorld/` -- components, styles, types, and localization are all nested under the web part folder. This works for a single web part but doesn't scale.

### Step 2: Create the top-level folder structure

Create dedicated top-level folders for each concern:

```bash
mkdir src/components
mkdir src/models
mkdir src/styles
```

Also move localization to the top level:

```bash
mv src/webparts/helloWorld/loc src/loc
```

**Why:** Separating components, models, styles, and localization from the web part folder makes them reusable across multiple web parts. This folder convention is used consistently in all 4 stages of the Learning Ladder.

### Step 3: Create the models layer

Yeoman generates a single `IHelloWorldProps.ts` that mixes web part configuration with component props. Split it into two files:

**`src/models/BaseWebPartProps.ts`** -- only the properties configurable via the property pane:

```typescript
export type BaseWebPartProps = {
  description: string;
}
```

**`src/models/AppProps.ts`** -- everything the React component needs, wrapping `BaseWebPartProps`:

```typescript
import type { BaseWebPartProps } from "./BaseWebPartProps";

export type AppProps = {
  webPartProps: BaseWebPartProps;
  isDarkTheme: boolean;
  userDisplayName: string;
  environmentMessage: string;
}
```

**`src/models/index.ts`** -- barrel export for clean import paths:

```typescript
export type { AppProps } from './AppProps';
export type { BaseWebPartProps } from './BaseWebPartProps';
```

**Why this split matters:** `BaseWebPartProps` defines what site owners configure in the property pane. `AppProps` defines what the React component receives at runtime. The `webPartProps` wrapper pattern keeps them clearly separated and is reused in every stage: `OneDriveExplorerProps`, `PhoneListProps`, `AssetDeploymentProps` -- all wrap `BaseWebPartProps` the same way.

### Step 4: Move and rename the component

Move `HelloWorld.tsx` from the web part folder to the top-level components folder and rename it:

```bash
mv src/webparts/helloWorld/components/HelloWorld.tsx src/components/App.tsx
```

Rewrite it as a typed functional component that uses the new models:

```typescript
import * as React from 'react';
import type { AppProps } from '../models';
import styles from '../styles/App.module.scss';

export function App(props: AppProps): JSX.Element {
  const { webPartProps, isDarkTheme, userDisplayName, environmentMessage } = props;

  return (
    <section className={`${styles.app} ${isDarkTheme ? styles.dark : ''}`}>
      <h2>Welcome, {userDisplayName}!</h2>
      <p>{webPartProps.description}</p>
      <p>{environmentMessage}</p>
    </section>
  );
}
```

Create the barrel export **`src/components/index.ts`**:

```typescript
export { App } from './App';
```

**Why:** The component imports its props from `../models` (not a local file) and its styles from `../styles`. This decoupling means the component is portable -- it doesn't depend on the web part folder structure.

### Step 5: Move and update styles

Move the SCSS module out of the web part folder:

```bash
mv src/webparts/helloWorld/components/HelloWorld.module.scss src/styles/App.module.scss
```

Replace the content with theme-aware styles:

```scss
@import '~@fluentui/react/dist/sass/References.scss';

.app {
  overflow: hidden;
  padding: 1em;
  color: "[theme:bodyText, default: #323130]";
  color: var(--bodyText);
  &.teams {
    font-family: $ms-font-family-fallbacks;
  }
  &.dark {
    color: "[theme:bodyText, default: #ffffff]";
    color: var(--bodyText);
  }
}
```

**Why the dual `color` declarations:** The first `color` line uses SharePoint's theme string syntax (for server-side rendering). The second uses a CSS custom property set by `onThemeChanged()` at runtime. This provides both a static fallback and dynamic theme support.

### Step 6: Update localization

In `src/loc/mystrings.d.ts`, change the module name from the Yeoman default to a project-wide name:

```typescript
// Before (Yeoman): declare module 'HelloWorldWebPartStrings'
// After (Seed):
declare module 'Localization' {
  const strings: ILocalization;
  export = strings;
}
```

Add a Czech localization file **`src/loc/cs-cz.js`**:

```javascript
define([], function() {
  return {
    "PropertyPaneDescription": "Popis nastavení",
    "BasicGroupName": "Název skupiny",
    "DescriptionFieldLabel": "Popis pole",
    "AppLocalEnvironmentSharePoint": "Aplikace běží ve vašem místním prostředí jako webová část SharePoint",
    "AppLocalEnvironmentTeams": "Aplikace běží ve vašem místním prostředí jako aplikace Microsoft Teams",
    "AppLocalEnvironmentOffice": "Aplikace běží ve vašem místním prostředí v office.com",
    "AppLocalEnvironmentOutlook": "Aplikace běží ve vašem místním prostředí v Outlooku",
    "AppSharePointEnvironment": "Aplikace běží na stránce SharePoint",
    "AppTeamsTabEnvironment": "Aplikace běží v Microsoft Teams",
    "AppOfficeEnvironment": "Aplikace běží v office.com",
    "AppOutlookEnvironment": "Aplikace běží v Outlooku",
    "UnknownEnvironment": "Aplikace běží v neznámém prostředí"
  }
});
```

**Why:** Renaming from `HelloWorldWebPartStrings` to `Localization` gives a project-wide module name. Moving `loc/` to `src/loc/` means all web parts share the same string resources. Adding a second locale demonstrates the multi-language capability.

### Step 7: Create the root entry point

Create **`src/index.ts`**:

```typescript
// A file is required to be in the root of the /src directory by the TypeScript compiler
```

**Why:** The TypeScript compiler requires at least one file at the `src/` root. It can also serve as a root barrel export in later stages.

### Step 8: Rename the web part

Rename the web part folder and files:

```bash
mv src/webparts/helloWorld src/webparts/app
mv src/webparts/app/HelloWorldWebPart.ts src/webparts/app/AppWebPart.ts
mv src/webparts/app/HelloWorldWebPart.manifest.json src/webparts/app/AppWebPart.manifest.json
```

Delete the now-empty `components/` subfolder from the web part directory (components now live at `src/components/`):

```bash
rm -rf src/webparts/app/components
```

**Why:** The web part folder should only contain the SPFx entry point (`.ts` and `.manifest.json`). All UI code lives in the top-level shared folders.

### Step 9: Update `config/config.json`

Update the bundle name, paths, and localized resource key:

**Before (Yeoman):**

```json
{
  "bundles": {
    "hello-world-web-part": {
      "components": [{
        "entrypoint": "./lib/webparts/helloWorld/HelloWorldWebPart.js",
        "manifest": "./src/webparts/helloWorld/HelloWorldWebPart.manifest.json"
      }]
    }
  },
  "localizedResources": {
    "HelloWorldWebPartStrings": "lib/webparts/helloWorld/loc/{locale}.js"
  }
}
```

**After (Seed):**

```json
{
  "bundles": {
    "app-web-part": {
      "components": [{
        "entrypoint": "./lib/webparts/app/AppWebPart.js",
        "manifest": "./src/webparts/app/AppWebPart.manifest.json"
      }]
    }
  },
  "localizedResources": {
    "Localization": "lib/loc/{locale}.js"
  }
}
```

**Why:** The `localizedResources` key must exactly match the `declare module 'Localization'` in `mystrings.d.ts`. The path changes from `lib/webparts/helloWorld/loc/` to `lib/loc/` because we moved the `loc/` folder to the top level.

### Step 10: Update the web part code

Change the imports from local paths to barrel imports and use the `webPartProps` wrapper pattern:

**Before (Yeoman):**

```typescript
import HelloWorld from './components/HelloWorld';
import { IHelloWorldProps } from './components/IHelloWorldProps';
import * as strings from 'HelloWorldWebPartStrings';
```

**After (Seed):**

```typescript
import * as strings from 'Localization';
import { App } from '../../components';
import type { AppProps, BaseWebPartProps } from '../../models';
```

The `render()` method passes props using the `webPartProps` wrapper:

```typescript
public render(): void {
  const element: React.ReactElement<AppProps> = React.createElement(
    App,
    {
      webPartProps: this.properties,              // property pane config
      isDarkTheme: this._isDarkTheme,             // theme state
      userDisplayName: this.context.pageContext.user.displayName,  // runtime context
      environmentMessage: this._environmentMessage,                // runtime context
    }
  );
  ReactDom.render(element, this.domElement);
}
```

**Why barrel imports:** `../../components` instead of `../../components/App` creates stable import paths. If the component file is renamed or split, only the barrel `index.ts` needs updating -- all consumers remain unchanged.

### Final: Verify your structure

After completing all steps, your `src/` folder should look like this:

```text
src/
  webparts/
    app/
      AppWebPart.ts                 # SPFx entry point only
      AppWebPart.manifest.json
  components/
    App.tsx                         # React component
    index.ts                        # Barrel export
  models/
    AppProps.ts                     # Component props (wraps BaseWebPartProps)
    BaseWebPartProps.ts             # Property pane config type
    index.ts                        # Barrel export
  styles/
    App.module.scss                 # Scoped SCSS with theme support
  loc/
    mystrings.d.ts                  # Type-safe string declarations
    en-us.js                        # English strings
    cs-cz.js                        # Czech strings
  index.ts                          # Root entry point
```

Run `npm start` to verify everything compiles and the web part renders correctly in the workbench.

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

Since `skipFeatureDeployment` is `false` in `config/package-solution.json`, the app must be explicitly added to each site before use.

1. **Upload** `sharepoint/solution/seed.sppkg` to your **App Catalog**
   - **Site-level catalog:** Site Contents > Apps for SharePoint > Upload
   - **Tenant catalog:** SharePoint Admin Center > More features > Apps > App Catalog > Upload
2. **Trust** the solution when prompted (click "Deploy")
3. **Install on the site:**
   - Go to the target site > Site Contents > + New > App > find "Seed" > Add
   - Or via PowerShell:

     ```powershell
     Connect-PnPOnline -Url https://<tenant>.sharepoint.com/sites/<site> -Interactive
     Install-PnPApp -Identity "5f75395d-5839-439d-b589-62a2ba65e679" -Scope Site
     ```

> **Tip:** If you see "This app could not be added" in the UI, use the PowerShell command -- it returns the actual error message. A common cause is a previous version still installed on the site (uninstall it first, clear the recycle bin, then re-install).

### Use as a web part on a page

1. Navigate to any SharePoint page on the site where the app is installed
2. Click **Edit** (pencil icon top-right)
3. Click **+** to add a new section or web part
4. Search for **"Seed"** in the web part picker
5. Click to insert it into the page, then **Republish**

### Use as a full-page app

The manifest declares `SharePointFullPage` as a supported host, so you can also use Seed as a standalone single-page application:

1. Go to **Site Contents** on the target site
2. Click **+ New** > **Page**  (or use **Site Pages** library > + New > **Page**)
3. In the page template picker, choose **"Seed web part"** from the Apps section (full-page apps appear there automatically)
4. The page renders only the Seed web part, full-width, with no other content

Alternatively, create a full-page link manually:

```text
https://<tenant>.sharepoint.com/sites/<site>/SitePages/<page-name>.aspx
```

> **When to use which:** Use the **web part** approach when Seed is one piece of a larger page with other content. Use the **full-page app** when Seed should be the entire page -- this is the pattern used in later stages (3-Plant, 4-Tree) where the app takes over the full viewport.

### Test

- Add the web part to a page and verify the welcome message shows your display name
- Edit the web part properties -- change the description field
- Switch to dark mode in SharePoint settings and verify the theme responds
- Create a full-page app page and confirm it renders without surrounding page content

Continue to [2-Seedling](../2-Seedling/) to add Graph API integration and custom React hooks.

---

[Home](../README.md) | [App Deep-Dive](app/README.md) | [Next: 2-Seedling >>](../2-Seedling/README.md)
