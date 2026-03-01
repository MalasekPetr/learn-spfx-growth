# Seedling - OneDrive File Explorer

A SharePoint Framework (SPFx) v1.22.2 web part that lets users browse their OneDrive files and folders. Built with **React**, **TypeScript**, and the **Microsoft Graph API**.

> **Learning path:** This is step **2** in the series. It builds on [1-Seed](../../1-Seed/app/README.md) by introducing Microsoft Graph integration, custom React hooks, and rich Fluent UI components. The most important shift is **how context flows between layers** — from pure prop-passing to hook-based state management.

## What's New Since Seed

| Concept | Seed (step 1) | Seedling (step 2) |
| --- | --- | --- |
| Data source | None (static props) | Microsoft Graph API |
| Context handover | WebPart pushes all data as props | WebPart passes capability (Graph client), hooks pull data |
| React patterns | Stateless component | Hook composition (`useOneDrive` + `useBreadcrumb`) |
| UI components | Plain HTML | Fluent UI DetailsList, Breadcrumb, CommandBar |
| API client | None | `MSGraphClientV3` |
| Models | 2 types (props only) | 5 types (props + API response + navigation models) |
| New folder | - | `src/hooks/` |
| New dependency | - | `@microsoft/sp-http` |
| Hosts | SharePoint only | SharePoint + Teams |
| Permissions | None | `Files.Read` (Graph API) |

## Technology Stack

| Technology | Version | Purpose |
| --- | --- | --- |
| SPFx | 1.22.2 | SharePoint Framework |
| React | 17.0.1 | UI rendering |
| TypeScript | 5.8 | Type-safe development |
| Fluent UI | 8.x | Microsoft design system |
| Microsoft Graph | v3 | OneDrive file access |
| Heft | 1.1.2 | Build toolchain |
| Node.js | 22.x | Runtime |

## Project Structure

```text
app/
├── config/
│   ├── config.json
│   ├── package-solution.json        # Includes Graph API permission requests
│   ├── serve.json
│   └── ...
├── src/
│   ├── webparts/
│   │   └── oneDriveExplorer/
│   │       ├── OneDriveExplorerWebPart.ts         # Web part entry point + Graph client init
│   │       └── OneDriveExplorerWebPart.manifest.json
│   ├── components/
│   │   ├── OneDriveExplorer.tsx     # Main component (DetailsList, Breadcrumb, CommandBar)
│   │   └── index.ts
│   ├── hooks/                       # NEW - Custom React hooks
│   │   ├── useBreadcrumb.ts           # Generic breadcrumb navigation state
│   │   ├── useOneDrive.ts             # OneDrive data fetching (composes useBreadcrumb)
│   │   └── index.ts
│   ├── models/
│   │   ├── OneDriveExplorerProps.ts # Component props (includes Graph client)
│   │   ├── BaseWebPartProps.ts      # Web part properties (shared name with Seed)
│   │   ├── BreadcrumbItem.ts        # NEW - Navigation item model
│   │   ├── DriveItem.ts             # NEW - OneDrive file/folder model
│   │   ├── DriveItemResponse.ts     # NEW - Graph API response model
│   │   └── index.ts
│   ├── styles/
│   │   └── App.module.scss          # Extended with folder link styles
│   ├── loc/
│   │   ├── en-us.js                 # Extended with UI strings
│   │   ├── cs-cz.js
│   │   └── mystrings.d.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

## Architecture Overview

Seedling adds two new layers compared to Seed — a **Graph API client** initialized in the web part, and **composed custom hooks** that separate data fetching from navigation state:

```text
OneDriveExplorerWebPart.ts  (SPFx lifecycle, Graph client init, theme)
      │
      │  passes MSGraphClientV3 + webPartProps
      ▼
OneDriveExplorer.tsx  (React component, Fluent UI layout)
      │
      │  delegates data logic to
      ▼
useOneDrive           (Composition hook: fetch + loading/error state)
      │
      ├── useBreadcrumb  (Generic navigation: push/slice on folder stack)
      │
      └── Graph API      (/me/drive/...)
```

## Key Additions Explained

### 1. Context Handover: Props vs. Hooks

This is the **most important architectural difference** between Seed and Seedling. Understanding how context flows between layers is key to understanding React in SPFx.

**Seed — the WebPart pushes all data down as props:**

In Seed, the web part computes everything the component needs and passes it as flat props. The component is purely presentational — it receives data and renders it, nothing more:

```typescript
// Seed: AppWebPart.ts — the web part does ALL the work
public render(): void {
  const element: React.ReactElement<AppProps> = React.createElement(
    App,
    {
      webPartProps: this.properties,
      isDarkTheme: this._isDarkTheme,
      userDisplayName: this.context.pageContext.user.displayName,  // computed here
      environmentMessage: this._environmentMessage,                // computed here
    }
  );
  ReactDom.render(element, this.domElement);
}

// Seed: App.tsx — the component just displays what it receives
export function App(props: AppProps): JSX.Element {
  const { webPartProps, isDarkTheme, userDisplayName, environmentMessage } = props;
  return (
    <section>
      <h2>Welcome, {userDisplayName}!</h2>    {/* just render */}
      <p>{webPartProps.description}</p>        {/* just render */}
      <p>{environmentMessage}</p>              {/* just render */}
    </section>
  );
}
```

The props type reflects this — it carries **data**:

```typescript
// Seed: AppProps — all values, no capabilities
export type AppProps = {
  webPartProps: BaseWebPartProps;
  isDarkTheme: boolean;
  userDisplayName: string;      // a resolved value
  environmentMessage: string;   // a resolved value
}
```

**Seedling — the WebPart passes capabilities, hooks pull data:**

In Seedling, the web part passes the Graph client (a **capability**) rather than fetched results. The component and its hooks decide what to fetch, when to fetch, and how to manage the resulting state:

```typescript
// Seedling: OneDriveExplorerWebPart.ts — passes the client, not the data
public render(): void {
  const element: React.ReactElement<OneDriveExplorerProps> = React.createElement(
    OneDriveExplorer,
    {
      webPartProps: this.properties,
      graphClient: this._graphClient,   // a capability, not data
      isDarkTheme: this._isDarkTheme,
    }
  );
  ReactDom.render(element, this.domElement);
}

// Seedling: OneDriveExplorer.tsx — the component uses hooks to pull data
export function OneDriveExplorer(props: OneDriveExplorerProps): JSX.Element {
  const { graphClient, isDarkTheme } = props;

  // Hook manages its own state — fetching, navigation, errors
  const { items, loading, error, breadcrumb,
          navigateToFolder, navigateToBreadcrumb, refresh } = useOneDrive(graphClient);

  // Component focuses purely on layout
  return (
    <section>
      <CommandBar items={commandBarItems} />
      <Breadcrumb items={breadcrumbItems} />
      {loading ? <Spinner /> : <DetailsList items={items} ... />}
    </section>
  );
}
```

The props type reflects this — it carries a **capability** instead of resolved values:

```typescript
// Seedling: OneDriveExplorerProps — passes capability, not data
export type OneDriveExplorerProps = {
  webPartProps: BaseWebPartProps;
  graphClient: MSGraphClientV3;   // a capability to fetch data
  isDarkTheme: boolean;
}
```

**Why this matters:**

| Aspect | Seed (push data) | Seedling (pass capability) |
| --- | --- | --- |
| Who fetches data? | WebPart (in `onInit`) | Hook (in `useEffect`) |
| Can react to user actions? | No — data is static after init | Yes — hooks re-fetch on navigation |
| State management | None (stateless component) | Hooks own loading, error, items state |
| Component complexity | Minimal (just render) | Moderate (calls hooks, maps UI state) |
| When to use | Static or simple display | Interactive features with dynamic data |

### 2. Microsoft Graph API Integration

The web part acquires a pre-authenticated Graph client through SPFx's built-in `msGraphClientFactory`. No manual token handling — SPFx manages the OAuth flow:

```typescript
// OneDriveExplorerWebPart.ts
protected onInit(): Promise<void> {
  return this.context.msGraphClientFactory
    .getClient('3')
    .then((client: MSGraphClientV3) => {
      this._graphClient = client;
    });
}
```

**Required permission** — declared in `config/package-solution.json`:

```json
"webApiPermissionRequests": [
  {
    "resource": "Microsoft Graph",
    "scope": "Files.Read"
  }
]
```

A tenant admin must approve this permission in the **SharePoint admin center > API access** page after deploying the `.sppkg` package.

### 3. Hook Composition (`useOneDrive` + `useBreadcrumb`)

Instead of one large hook, the logic is split into two focused hooks that compose together. This demonstrates a core React pattern — **hook composition**:

**`useBreadcrumb`** — generic navigation state, no API dependency:

```typescript
// hooks/useBreadcrumb.ts
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

**`useOneDrive`** — composes `useBreadcrumb` and adds data fetching:

```typescript
// hooks/useOneDrive.ts
export const useOneDrive = (graphClient: MSGraphClientV3): UseOneDriveReturn => {
  // Compose the breadcrumb hook for navigation state
  const { breadcrumb, currentFolderId, navigateToFolder, navigateToBreadcrumb } =
    useBreadcrumb({ id: 'root', name: 'OneDrive' });

  // Own state: data fetching concerns only
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

  // React to navigation changes — fetch new items when folder changes
  useEffect(() => {
    void fetchItems(currentFolderId);
  }, [currentFolderId, fetchItems]);

  const refresh = useCallback((): void => {
    void fetchItems(currentFolderId);
  }, [currentFolderId, fetchItems]);

  // Surface both navigation + data state to the component
  return { items, loading, error, breadcrumb, navigateToFolder, navigateToBreadcrumb, refresh };
};
```

**Why split instead of one hook?**

- **Single responsibility** — navigation state vs. API calls are separate concerns
- **Reusability** — `useBreadcrumb` works for any hierarchical navigation (SharePoint lists, folder trees, etc.)
- **Testability** — each hook can be tested in isolation
- **Readability** — each file is small and focused on one job

### 4. Reactive Navigation Pattern

Navigation and data fetching are connected through React's dependency system. When `useBreadcrumb` updates the folder stack, the derived `currentFolderId` changes, which triggers `useOneDrive`'s `useEffect` to fetch new items automatically:

```text
User clicks folder
      │
      ▼
navigateToFolder()          # useBreadcrumb pushes to stack
      │
      ▼
currentFolderId changes     # derived from stack top
      │
      ▼
useEffect fires             # useOneDrive reacts to the change
      │
      ▼
fetchItems(currentFolderId) # Graph API call
      │
      ▼
items state updates         # component re-renders with new data
```

No imperative "fetch then navigate" coordination is needed — the hooks react to state changes declaratively.

### 5. Fluent UI Data Components

The component uses several Fluent UI building blocks to create a professional file explorer UI:

```typescript
// OneDriveExplorer.tsx — simplified structure
<section>
  <CommandBar items={commandBarItems} />
  <Breadcrumb items={breadcrumbItems} />
  <Stack tokens={{ childrenGap: 8 }}>
    {error && <MessageBar messageBarType={MessageBarType.error}>...</MessageBar>}
    {loading ? (
      <Spinner size={SpinnerSize.large} label={strings.LoadingMessage} />
    ) : (
      <DetailsList
        items={items}
        columns={columns}
        selectionMode={SelectionMode.none}
        layoutMode={DetailsListLayoutMode.justified}
        onItemInvoked={onItemInvoked}
      />
    )}
  </Stack>
</section>
```

| Component | Purpose |
| --- | --- |
| `CommandBar` | Toolbar with action buttons (refresh) |
| `Breadcrumb` | Shows folder path, click to navigate up |
| `DetailsList` | Table with sortable, resizable columns |
| `Spinner` | Loading indicator |
| `MessageBar` | Error and empty-state messages |
| `Icon` | File/folder icons (`FabricFolder`, `Page`) |
| `Stack` | Vertical layout with consistent spacing |

### 6. API Response Models

Graph API responses are modeled with TypeScript types for full type safety through the data pipeline:

```typescript
// models/DriveItem.ts
export type DriveItem = {
  id: string;
  name: string;
  size: number;
  lastModifiedDateTime: string;
  webUrl: string;
  folder?: { childCount: number };   // present only for folders
  file?: { mimeType: string };       // present only for files
}

// models/DriveItemResponse.ts
export type DriveItemResponse = {
  value: DriveItem[];
}
```

The `folder` and `file` properties are optional — their presence determines whether the item is a folder or a file. This is how the Graph API represents the distinction, and the component uses it for rendering decisions:

```typescript
onRender: (item: DriveItem) => (
  <Icon iconName={item.folder ? 'FabricFolder' : 'Page'} />
)
```

## Consistent Patterns With Seed

While Seedling introduces many new concepts, it preserves the structural patterns established in Seed:

| Pattern | Seed | Seedling |
| --- | --- | --- |
| Web part props type | `BaseWebPartProps` | `BaseWebPartProps` (same name) |
| Component props type | `AppProps { webPartProps: BaseWebPartProps; ... }` | `OneDriveExplorerProps { webPartProps: BaseWebPartProps; ... }` |
| Props passed via | `this.properties` | `this.properties` |
| Component style | `function App(props): JSX.Element` | `function OneDriveExplorer(props): JSX.Element` |
| Theme handling | `onThemeChanged` + CSS variables | `onThemeChanged` + CSS variables (identical) |
| Barrel exports | `index.ts` in each folder | `index.ts` in each folder |
| Localization | `loc/` with `.d.ts` + locale `.js` | Same structure, more strings |

## Supported Hosts

Configured in `OneDriveExplorerWebPart.manifest.json`:

| Host | Description |
| --- | --- |
| `SharePointWebPart` | Embedded on a SharePoint page |
| `SharePointFullPage` | Full-page app in SharePoint |

## Getting Started

### Prerequisites

- Node.js **22.x** (required by SPFx 1.22.2)
- A Microsoft 365 developer tenant or SharePoint Online site
- **Tenant admin approval** for the `Files.Read` Graph API permission

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

This produces `sharepoint/solution/seedling.sppkg` which can be uploaded to your SharePoint App Catalog.

After uploading, a tenant admin must approve the `Files.Read` permission request in the **SharePoint admin center > API access** page.

### Other Commands

```bash
# Clean build artifacts
npm run clean

# Eject webpack config for advanced customization
npm run eject-webpack
```

## Extending This Project

Ideas for the next step in the learning path:

1. **Add paging** - The Graph API supports `$top` and `@odata.nextLink` for large folders
2. **Add search** - Use the Graph search endpoint to find files across OneDrive
3. **Add file upload** - Use the Graph `PUT /me/drive/items/{id}/content` endpoint
4. **Add property pane** - Let site owners configure defaults (root folder, page size) via web part properties
5. **Add context menu** - Right-click actions (download, share, delete) on files

## License

MIT

---

[<< Seed App](../../1-Seed/app/README.md) | [Home](../../README.md) | [Stage Guide](../README.md) | [Next: Plant App >>](../../3-Plant/app/README.md)
