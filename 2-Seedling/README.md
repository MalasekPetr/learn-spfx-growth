# 2-Seedling

Step 2 of the SPFx Learning Ladder -- **OneDrive Explorer**.

A web part that lets users browse their OneDrive files and folders using Microsoft Graph API, custom React hooks, and Fluent UI components.

## What's New (compared to 1-Seed)

| Concept | Seed | Seedling (new) |
| ------- | ---- | -------------- |
| Data source | None (static props) | Microsoft Graph API (`MSGraphClientV3`) |
| Context handover | WebPart pushes data as props | WebPart passes capability (Graph client), hooks pull data |
| React patterns | Stateless component | Hook composition (`useOneDrive` + `useBreadcrumb`) |
| UI components | Plain HTML | Fluent UI DetailsList, Breadcrumb, CommandBar, Spinner |
| Models | 2 types (props only) | 5 types (props + API response + navigation models) |
| New folders | -- | `src/hooks/`, `src/utils/` |
| Permissions | None | `Files.Read` (Graph API) |

## Key Files to Study

| File | Purpose |
| ---- | ------- |
| `src/hooks/useOneDrive.ts` | Custom hook composing `useBreadcrumb` + Graph API calls |
| `src/hooks/useBreadcrumb.ts` | Generic breadcrumb navigation state |
| `src/components/OneDriveExplorer.tsx` | React component with Fluent UI layout |
| `src/webparts/oneDriveExplorer/OneDriveExplorerWebPart.ts` | Graph client initialization in `onInit()` |
| `src/models/DriveItem.ts` | Type definition matching Graph API response shape |
| `src/utils/formatUtils.ts` | File size formatting utility |

See [app/README.md](app/README.md) for detailed architecture explanations and code walkthroughs.

## Tutorial: From Seed to Seedling

This step-by-step guide shows how to evolve the Seed project into Seedling. Each step introduces a new concept that builds on the patterns established in 1-Seed.

### Step 1: Add the breadcrumb hook

Create `src/hooks/useBreadcrumb.ts` -- a **generic** navigation state manager with no knowledge of OneDrive:

```typescript
import { useState, useCallback } from 'react';
import type { BreadcrumbItem } from '../models';

export type UseBreadcrumbReturn = {
  breadcrumb: BreadcrumbItem[];
  currentFolderId: string;
  navigateToFolder: (folderId: string, folderName: string) => void;
  navigateToBreadcrumb: (index: number) => void;
};

export const useBreadcrumb = (rootItem: BreadcrumbItem): UseBreadcrumbReturn => {
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([rootItem]);
  const currentFolderId: string = breadcrumb[breadcrumb.length - 1].id;

  const navigateToFolder = useCallback((folderId: string, folderName: string): void => {
    setBreadcrumb(prev => [...prev, { id: folderId, name: folderName }]);
  }, []);

  const navigateToBreadcrumb = useCallback((index: number): void => {
    setBreadcrumb(prev => prev.slice(0, index + 1));
  }, []);

  return { breadcrumb, currentFolderId, navigateToFolder, navigateToBreadcrumb };
};
```

**Why a separate hook:** `useBreadcrumb` knows nothing about Graph API or OneDrive -- it only manages an array of `{ id, name }` items. This makes it reusable in any folder-tree UI. The `useCallback` wrappers prevent unnecessary re-renders in child components.

### Step 2: Add the OneDrive hook

Create `src/hooks/useOneDrive.ts` -- this **composes** `useBreadcrumb` and adds Graph API data fetching:

```typescript
import { useState, useEffect, useCallback } from 'react';
import type { MSGraphClientV3 } from '@microsoft/sp-http';
import type { BreadcrumbItem, DriveItem, DriveItemResponse } from '../models';
import { useBreadcrumb } from './useBreadcrumb';

export const useOneDrive = (graphClient: MSGraphClientV3) => {
  const { breadcrumb, currentFolderId, navigateToFolder, navigateToBreadcrumb } =
    useBreadcrumb({ id: 'root', name: 'OneDrive' });

  const [items, setItems] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const fetchItems = useCallback(async (folderId: string): Promise<void> => {
    setLoading(true);
    setError(undefined);
    try {
      const endpoint: string = folderId === 'root'
        ? '/me/drive/root/children'
        : `/me/drive/items/${folderId}/children`;

      const response: DriveItemResponse = await graphClient
        .api(endpoint)
        .select('id,name,size,lastModifiedDateTime,webUrl,folder,file')
        .orderby('name')
        .get();

      setItems(response.value);
    } catch (err: unknown) {
      const message: string = err instanceof Error ? err.message : String(err);
      setError(message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [graphClient]);

  useEffect(() => {
    fetchItems(currentFolderId).catch((): undefined => undefined);
  }, [currentFolderId, fetchItems]);

  const refresh = useCallback((): void => {
    fetchItems(currentFolderId).catch((): undefined => undefined);
  }, [currentFolderId, fetchItems]);

  return { items, loading, error, breadcrumb, navigateToFolder, navigateToBreadcrumb, refresh };
};
```

Create the barrel export `src/hooks/index.ts`:

```typescript
export { useBreadcrumb } from './useBreadcrumb';
export { useOneDrive } from './useOneDrive';
```

**Why hook composition:** `useOneDrive` doesn't re-implement breadcrumb logic -- it delegates to `useBreadcrumb`. The `useEffect` dependency on `currentFolderId` means navigating to a folder **automatically triggers a data fetch** without any imperative code.

**Why `.catch((): undefined => undefined)`:** The `useEffect` callback can't return a Promise. The `.catch()` prevents unhandled promise rejection warnings while `setError()` inside `fetchItems` already handles the error state for the UI.

### Step 3: Add the new models

Seedling needs 3 new model files beyond Seed's `BaseWebPartProps`:

**`src/models/BreadcrumbItem.ts`** -- navigation item used by `useBreadcrumb`:

```typescript
export type BreadcrumbItem = {
  id: string;
  name: string;
};
```

**`src/models/DriveItem.ts`** -- matches the shape of a Microsoft Graph DriveItem response:

```typescript
export type DriveItem = {
  id: string;
  name: string;
  size: number;
  lastModifiedDateTime: string;
  webUrl: string;
  folder?: { childCount: number };
  file?: { mimeType: string };
}
```

**`src/models/DriveItemResponse.ts`** -- wraps the Graph API collection response:

```typescript
import type { DriveItem } from './DriveItem';

export type DriveItemResponse = {
  value: DriveItem[];
}
```

**`src/models/OneDriveExplorerProps.ts`** -- the component props, following the `webPartProps` wrapper pattern from Seed:

```typescript
import type { MSGraphClientV3 } from '@microsoft/sp-http';
import type { BaseWebPartProps } from './BaseWebPartProps';

export type OneDriveExplorerProps = {
  webPartProps: BaseWebPartProps;
  graphClient: MSGraphClientV3;
  isDarkTheme: boolean;
}
```

Update the barrel export `src/models/index.ts`:

```typescript
export type { OneDriveExplorerProps } from './OneDriveExplorerProps';
export type { BreadcrumbItem } from './BreadcrumbItem';
export type { DriveItem } from './DriveItem';
export type { DriveItemResponse } from './DriveItemResponse';
export type { BaseWebPartProps } from './BaseWebPartProps';
```

**Why `graphClient` in props:** In Seed, the WebPart pushed plain data as props. In Seedling, it passes a **capability** -- the pre-authenticated Graph client. The React component (via hooks) decides when and how to call the API. This is a key architectural shift.

### Step 4: Add the utility layer

Create `src/utils/formatUtils.ts`:

```typescript
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units: string[] = ['B', 'KB', 'MB', 'GB'];
  const i: number = Math.floor(Math.log(bytes) / Math.log(1024));
  const size: number = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
```

Create the barrel export `src/utils/index.ts`:

```typescript
export { formatFileSize } from './formatUtils';
```

**Why a `utils/` folder:** Seedling introduces the first pure function that isn't a hook or a model. Placing it in `utils/` keeps the `hooks/` folder focused on stateful React logic.

### Step 5: Build the component with Fluent UI

Replace Seed's simple `App.tsx` with `src/components/OneDriveExplorer.tsx`. This is the biggest change -- the component uses Fluent UI's `DetailsList`, `Breadcrumb`, `CommandBar`, `Spinner`, and `MessageBar`:

```typescript
import * as React from 'react';
import {
  DetailsList, DetailsListLayoutMode, SelectionMode,
  Breadcrumb, CommandBar, Spinner, SpinnerSize,
  Stack, MessageBar, MessageBarType, Icon,
  type IColumn, type IBreadcrumbItem, type ICommandBarItemProps,
} from '@fluentui/react';
import * as strings from 'Localization';
import type { OneDriveExplorerProps, DriveItem } from '../models';
import { useOneDrive } from '../hooks';
import { formatFileSize } from '../utils';
import styles from '../styles/App.module.scss';

export function OneDriveExplorer(props: OneDriveExplorerProps): JSX.Element {
  const { graphClient, isDarkTheme } = props;
  const { items, loading, error, breadcrumb, navigateToFolder, navigateToBreadcrumb, refresh } =
    useOneDrive(graphClient);

  // ... Fluent UI rendering (see full source in app/src/components/OneDriveExplorer.tsx)
}
```

**Why Fluent UI:** SharePoint itself uses Fluent UI, so the web part inherits consistent styling, theming, and accessibility. `DetailsList` handles keyboard navigation, column resizing, and sorting infrastructure out of the box.

### Step 6: Update localization

Add new string keys to `src/loc/mystrings.d.ts` for the Fluent UI column headers and messages:

```typescript
declare interface ILocalization {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
  RefreshButton: string;
  ColumnName: string;
  ColumnModified: string;
  ColumnSize: string;
  LoadingMessage: string;
  ErrorPrefix: string;
  EmptyFolderMessage: string;
}

declare module 'Localization' {
  const strings: ILocalization;
  export = strings;
}
```

Add the corresponding values to `en-us.js` and `cs-cz.js` (e.g., `"RefreshButton": "Refresh"` / `"Obnovit"`).

### Step 7: Update the web part for Graph API

The web part class changes from Seed in two key ways:

1. **`onInit()` acquires the Graph client** before `render()` is called:

```typescript
protected onInit(): Promise<void> {
  return this.context.msGraphClientFactory
    .getClient('3')
    .then((client: MSGraphClientV3) => {
      this._graphClient = client;
    });
}
```

1. **`render()` passes the Graph client** instead of display name / environment:

```typescript
public render(): void {
  const element = React.createElement(OneDriveExplorer, {
    graphClient: this._graphClient,
    isDarkTheme: this._isDarkTheme,
    webPartProps: this.properties,
  });
  ReactDom.render(element, this.domElement);
}
```

**Why `onInit()`:** SPFx calls `onInit()` once before the first render. It returns a `Promise`, so asynchronous setup (like acquiring a Graph client) completes before the component needs it. This is where all one-time initialization belongs.

### Step 8: Declare Graph API permissions

Add the permission request to `config/package-solution.json`:

```json
{
  "solution": {
    "webApiPermissionRequests": [
      {
        "resource": "Microsoft Graph",
        "scope": "Files.Read"
      }
    ]
  }
}
```

**Why declarative permissions:** When the `.sppkg` is uploaded, SharePoint reads this section and creates a pending permission request in the Admin Center. A tenant admin must approve `Files.Read` before the Graph API calls will succeed. This is the SPFx consent model -- developers declare what they need, admins approve it.

### Step 9: Update config.json

Update `config/config.json` with the new bundle name and entry point:

```json
{
  "bundles": {
    "my-web-part": {
      "components": [{
        "entrypoint": "./lib/webparts/oneDriveExplorer/OneDriveExplorerWebPart.js",
        "manifest": "./src/webparts/oneDriveExplorer/OneDriveExplorerWebPart.manifest.json"
      }]
    }
  },
  "localizedResources": {
    "Localization": "lib/loc/{locale}.js"
  }
}
```

### Final: Verify your structure

```text
src/
  webparts/
    oneDriveExplorer/
      OneDriveExplorerWebPart.ts          # SPFx entry point + Graph client init
      OneDriveExplorerWebPart.manifest.json
  components/
    OneDriveExplorer.tsx                  # Fluent UI component
    index.ts
  hooks/                                  # NEW in Seedling
    useOneDrive.ts                        # Composes useBreadcrumb + Graph API
    useBreadcrumb.ts                      # Generic folder navigation state
    index.ts
  models/
    OneDriveExplorerProps.ts              # Component props (wraps BaseWebPartProps)
    BaseWebPartProps.ts                   # Property pane config type (same as Seed)
    DriveItem.ts                          # Graph API item shape
    DriveItemResponse.ts                  # Graph API collection response
    BreadcrumbItem.ts                     # Navigation model
    index.ts
  utils/                                  # NEW in Seedling
    formatUtils.ts                        # File size formatter
    index.ts
  styles/
    App.module.scss
  loc/
    mystrings.d.ts
    en-us.js
    cs-cz.js
  index.ts
```

Run `npm start` to verify everything compiles. Note: the workbench won't have Graph API access -- deploy to a real SharePoint site to test data fetching.

## Getting Started

### Prerequisites

- Complete the [1-Seed](../1-Seed/) stage first
- Node.js **22.x** (required by SPFx 1.22.2)
- A Microsoft 365 developer tenant or SharePoint Online site
- A tenant admin to approve the `Files.Read` Graph API permission

### Install

```bash
cd 2-Seedling/app
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

> **Note:** The workbench can render the web part UI, but Graph API calls will fail without a deployed permission grant. For full testing, deploy to a real SharePoint site.

### Build & Package

```bash
npm run build
```

This compiles TypeScript, bundles the web part, and produces `sharepoint/solution/seedling.sppkg`.

### Deploy

Since `skipFeatureDeployment` is `false` in `config/package-solution.json`, the app must be explicitly added to each site before use.

1. **Upload** `sharepoint/solution/seedling.sppkg` to your **App Catalog**
   - **Site-level catalog:** Site Contents > Apps for SharePoint > Upload
   - **Tenant catalog:** SharePoint Admin Center > More features > Apps > App Catalog > Upload
2. **Trust** the solution when prompted (click "Deploy")
3. **Approve Graph API permissions:**
   - Go to **SharePoint Admin Center** > **API access** (under Advanced)
   - Approve the pending `Files.Read` request for Microsoft Graph
   - This is a one-time step per tenant -- once approved, all sites can use the permission
4. **Install on the site:**
   - Go to the target site > Site Contents > + New > App > find "Seedling" > Add
   - Or via PowerShell:

     ```powershell
     Connect-PnPOnline -Url https://<tenant>.sharepoint.com/sites/<site> -Interactive
     Install-PnPApp -Identity "b73a341e-d9a9-4d0f-acf3-8447293df478" -Scope Site
     ```

> **Tip:** If you see "This app could not be added" in the UI, use the PowerShell command -- it returns the actual error message. A common cause is a previous version still installed on the site (uninstall it first, clear the recycle bin, then re-install).

### Use as a web part on a page

1. Navigate to any SharePoint page on the site where the app is installed
2. Click **Edit** (pencil icon top-right)
3. Click **+** to add a new section or web part
4. Search for **"My Files Explorer"** in the web part picker
5. Click to insert it into the page, then **Republish**

### Use as a full-page app

The manifest declares `SharePointFullPage` as a supported host, so you can also use Seedling as a standalone single-page application:

1. Go to **Site Contents** on the target site
2. Click **+ New** > **Page** (or use **Site Pages** library > + New > **Page**)
3. In the page template picker, choose **"My Files Explorer"** from the Apps section (full-page apps appear there automatically)
4. The page renders only the OneDrive Explorer web part, full-width, with no other content

> **When to use which:** Use the **web part** approach when the file browser is one piece of a larger page. Use the **full-page app** when the OneDrive Explorer should be the entire page experience.

### Test

- Add the web part to a SharePoint page (workbench won't work without Graph permissions)
- Verify your OneDrive root folder contents appear
- Click a folder to navigate into it -- verify the breadcrumb updates
- Click a breadcrumb segment to navigate back up
- Click the **Refresh** button in the CommandBar
- Click a file to open it in a new tab (via `webUrl`)
- Create a full-page app page and confirm it renders without surrounding page content

Continue to [3-Plant](../3-Plant/) to add Graph pagination, service layer, Dexie caching, and rich filtering.

---

[<< 1-Seed](../1-Seed/README.md) | [Home](../README.md) | [App Deep-Dive](app/README.md) | [Next: 3-Plant >>](../3-Plant/README.md)
