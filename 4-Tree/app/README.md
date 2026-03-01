# Tree - Assets Deployment

A SharePoint Framework (SPFx) v1.22.2 web part that manages IT assets and their deployment assignments. Built with **React**, **TypeScript**, **PnP/JS v4**, and **Dexie.js** for IndexedDB caching.

> **Learning path:** This is step **4** in the series. It builds on [3-Plant](../../3-Plant/app/README.md) by switching from Microsoft Graph to SharePoint lists via PnP/JS, adding full CRUD operations, lookup columns, server-side OData filtering, and multi-tab UI with Fluent UI Pivot.

## What's New Since Plant

| Concept | Plant (step 3) | Tree (step 4) |
| --- | --- | --- |
| Data source | MS Graph API (`MSGraphClientV3`) | SharePoint lists via PnP/JS v4 (`SPFI`) |
| Typing | Official `@microsoft/microsoft-graph-types` | Custom types against SharePoint list columns |
| Operations | Read-only | Full CRUD (Create, Read, Update, Delete) |
| Lists | N/A (Graph endpoint) | Two lists linked by lookup column |
| Caching | Dexie.js single table (read-only) | Dexie.js multi-table (read + write-through) |
| Architecture | Service + Cache + Hook | Same pattern, extended with CRUD |
| Components | Single component | Pivot tabs, list views, form panels, badges |
| Security | All users see all data | Department-based server-side OData filtering |
| User context | None | User Profile Service for department detection |
| Context handover | WebPart passes Graph client | WebPart passes PnP/JS `SPFI` instance + user department |
| Property pane | Toggle fields for column visibility | TextField for list names |
| New folders | `src/services/`, `src/cache/` | -- (same folders, extended) |
| New dependencies | `@microsoft/microsoft-graph-types`, `dexie` | `@pnp/sp`, `@pnp/core` |

## Technology Stack

| Technology | Version | Purpose |
| --- | --- | --- |
| SPFx | 1.22.2 | SharePoint Framework |
| React | 17.0.1 | UI rendering |
| TypeScript | 5.8 | Type-safe development |
| Fluent UI | 8.x | Microsoft design system |
| PnP/JS | 4.x | SharePoint list CRUD |
| Dexie.js | 4.x | IndexedDB caching |
| Heft | 1.1.2 | Build toolchain |
| Node.js | 22.x | Runtime |

## Project Structure

```text
app/
├── config/
│   ├── config.json                  # Bundle entry point + manifest path
│   ├── package-solution.json        # Solution packaging metadata
│   ├── serve.json
│   └── ...
├── src/
│   ├── webparts/
│   │   └── assetDeployment/
│   │       ├── AssetDeploymentWebPart.ts              # Web part entry point + PnP init + user profile
│   │       └── AssetDeploymentWebPart.manifest.json
│   ├── components/
│   │   ├── AssetDeployment.tsx      # Root component (Pivot tabs wiring)
│   │   ├── AssetList.tsx            # Assets tab (DetailsList + CommandBar + search)
│   │   ├── DeploymentList.tsx       # Deployments tab (same pattern)
│   │   ├── AssetForm.tsx            # Slide-out Panel for asset CRUD
│   │   ├── DeploymentForm.tsx       # Slide-out Panel with lookup dropdown
│   │   ├── StatusBadge.tsx          # Color-coded status badge
│   │   └── index.ts
│   ├── hooks/                       # Custom React hooks
│   │   ├── useAssets.ts               # Cache-first CRUD for Assets list
│   │   ├── useDeployments.ts          # Cache-first CRUD with department filter
│   │   ├── useCurrentUser.ts          # User Profile Service integration
│   │   ├── useDebounce.ts             # Generic debounce (carried from Plant)
│   │   └── index.ts
│   ├── services/                    # NEW - API service layer
│   │   ├── assetService.ts            # PnP/JS CRUD factory for Assets
│   │   ├── deploymentService.ts       # PnP/JS CRUD with lookup expand + OData filter
│   │   └── index.ts
│   ├── cache/                       # NEW - IndexedDB cache layer
│   │   ├── appCache.ts                # Single Dexie DB with two tables
│   │   └── index.ts
│   ├── models/
│   │   ├── Asset.ts                 # Asset list item type
│   │   ├── Deployment.ts            # Deployment type (AssetId + AssetTitle split)
│   │   ├── UserInfo.ts              # User profile type
│   │   ├── AssetDeploymentProps.ts  # Component props (wraps BaseWebPartProps)
│   │   ├── BaseWebPartProps.ts      # Web part property pane properties
│   │   └── index.ts
│   ├── styles/
│   │   └── App.module.scss          # Status badge colors, layout
│   ├── loc/
│   │   ├── en-us.js                 # English strings
│   │   ├── cs-cz.js                 # Czech strings
│   │   └── mystrings.d.ts          # Localization type definitions
│   └── index.ts
├── package.json
└── tsconfig.json
```

## Architecture Overview

Tree introduces two new layers between the hook and the API: a **service layer** that encapsulates PnP/JS queries and a **cache layer** that provides instant offline-first data loading via IndexedDB.

```text
AssetDeploymentWebPart.ts  (SPFx lifecycle, PnP init, user profile)
      │
      │  passes SPFI + webPartProps + userDepartment
      ▼
AssetDeployment.tsx  (Pivot tabs, hook wiring)
      │
      ├── useAssets           ├── useDeployments (+ department param)
      │       │               │       │
      │   assetService        │   deploymentService (lookup expand + OData filter)
      │       │               │       │
      │   assetCache          │   deploymentCache (filtered reads)
      │       │               │       │
      └───────┴───────────────┴───────┘
                    │
              Dexie (IndexedDB)
              AppDatabase: assets + deployments tables
```

### Layer Responsibilities

**`webparts/assetDeployment/AssetDeploymentWebPart.ts`** - The SPFx entry point. Handles:

- Initializing PnP/JS with `spfi().using(SPFx(this.context))`
- Fetching the current user's department via `sp.profiles.myProperties()`
- Passing `webPartProps`, `SPFI`, and `userDepartment` to the React component
- Theme change handling (light/dark mode)

**`services/`** - Factory functions that encapsulate PnP/JS queries. Each service returns an object with `getAll()`, `add()`, `update()`, `remove()` methods. This separates API logic from React hooks.

**`cache/`** - A single Dexie database with two tables. Hooks check the cache first, then fetch fresh data from the service. This provides instant loading on subsequent visits.

**`hooks/`** - React hooks that orchestrate services and cache with a cache-first-then-refresh pattern. Each hook manages `loading`, `error`, and data state, and exposes CRUD operations to components.

**`components/`** - React components that receive data and callbacks from hooks. The root `AssetDeployment` wires two tab views. Each tab view has a `DetailsList`, `CommandBar`, `SearchBox`, and a slide-out `Panel` form.

## Key Concepts Explained

### 1. SharePoint Lookup Columns (Read vs. Write Split)

This is the **most important new concept** in Tree. SharePoint lookup columns create a reference from one list to another. The challenge is that reading and writing lookups use **different field names**.

**The Deployment type reflects this split:**

```typescript
// models/Deployment.ts
export type Deployment = {
  Id: number;
  Title: string;
  AssetId: number;       // Lookup ID — used for WRITING
  AssetTitle?: string;    // Expanded value — used for READING (display only)
  DeployedTo: string;
  Department: string;
  // ...
};
```

**Reading — `$select` + `$expand`:**

When reading deployments, we need to expand the lookup to get the asset's Title:

```typescript
// services/deploymentService.ts
const SELECT_FIELDS = [
  'Id', 'Title', 'AssetId', 'Asset/Title',  // Note: Asset/Title for the expanded field
  'DeployedTo', 'Department', 'DeployedDate', 'ReturnDate', 'Notes', 'Created', 'Modified'
];
const EXPAND_FIELDS = ['Asset'];  // Expand the lookup relationship

let query = sp.web.lists
  .getByTitle(listName)
  .items
  .select(...SELECT_FIELDS)
  .expand(...EXPAND_FIELDS);
```

The expanded data arrives as a nested object that must be flattened:

```typescript
return items.map((item: Record<string, unknown>) => ({
  AssetId: item.AssetId as number,
  AssetTitle: (item.Asset as { Title: string } | null)?.Title || '',
  // ...
}));
```

**Writing — ID only:**

When creating or updating a deployment, we only send the lookup ID, never the expanded title:

```typescript
// services/deploymentService.ts — add()
await sp.web.lists.getByTitle(listName).items.add({
  Title: deployment.Title,
  AssetId: deployment.AssetId,  // Only the ID, SharePoint resolves the lookup
  // ...
});
```

**Form UI — display Title, submit Id:**

The DeploymentForm maps assets into a dropdown that shows titles but submits IDs:

```typescript
// components/DeploymentForm.tsx
const assetOptions: IDropdownOption[] = assets.map((a) => ({
  key: a.Id,      // The lookup ID (submitted on save)
  text: a.Title   // The display text (shown in dropdown)
}));

<Dropdown
  label={strings.FieldAsset}
  selectedKey={assetId}
  options={assetOptions}
  onChange={(_, o) => setAssetId(o?.key as number)}
/>
```

### 2. Server-Side OData Filtering

Instead of loading all deployments and filtering client-side, Tree uses OData `$filter` to request only the current user's department data from SharePoint. This is a security pattern — users never receive data they shouldn't see:

```typescript
// services/deploymentService.ts — getAll()
if (departmentFilter) {
  query = query.filter(`Department eq '${departmentFilter}'`);
}
```

The filter is also applied at the cache layer for consistency:

```typescript
// cache/appCache.ts
async getAll(department?: string): Promise<Deployment[]> {
  if (department) {
    return db.deployments.where('Department').equals(department).toArray();
  }
  return db.deployments.toArray();
}
```

**Where does the department come from?**

The web part fetches it in `onInit()` via the User Profile Service:

```typescript
// AssetDeploymentWebPart.ts
protected async onInit(): Promise<void> {
  this._sp = spfi().using(SPFx(this.context));

  try {
    const profile = await this._sp.profiles.myProperties();
    const props = profile.UserProfileProperties as Array<{ Key: string; Value: string }>;
    this._userDepartment = props.find((p) => p.Key === 'Department')?.Value || '';
  } catch {
    this._userDepartment = '';
  }
}
```

### 3. Service Layer Pattern

Services are factory functions that return an object with CRUD methods. This separates PnP/JS query logic from React hooks:

```typescript
// services/assetService.ts
export const createAssetService = (sp: SPFI, listName: string) => ({
  async getAll(): Promise<Asset[]> {
    const items = await sp.web.lists
      .getByTitle(listName)
      .items
      .select(...SELECT_FIELDS)
      .orderBy('Title', true)
      .top(500)();
    return items as Asset[];
  },

  async add(asset: Omit<Asset, 'Id' | 'Created' | 'Modified'>): Promise<Asset> {
    const result = await sp.web.lists
      .getByTitle(listName)
      .items
      .add(asset);
    return result as Asset;
  },

  async update(id: number, asset: Partial<Asset>): Promise<void> {
    const { Id: _id, Created: _c, Modified: _m, ...fields } = asset as Asset;
    await sp.web.lists.getByTitle(listName).items.getById(id).update(fields);
  },

  async remove(id: number): Promise<void> {
    await sp.web.lists.getByTitle(listName).items.getById(id).delete();
  }
});
```

**Why a factory function instead of a class?**

- No `this` binding issues in callbacks
- The `sp` and `listName` are captured by closure — no need to store them as properties
- Hooks create the service with `useMemo`, and the factory pattern makes this straightforward

### 4. Cache-First-Then-Refresh (Dexie.js)

The caching strategy provides instant loading from IndexedDB, then silently updates with fresh data from SharePoint:

```typescript
// hooks/useAssets.ts — fetchAssets()
try {
  // Step 1: Load from cache instantly
  const cached = await assetCache.getAll();
  if (cached.length > 0) {
    setAssets(cached);        // Show cached data immediately
    setLoading(false);        // Remove spinner
  }

  // Step 2: Fetch fresh data from SharePoint
  const fresh = await service.getAll();
  await assetCache.putAll(fresh);  // Update cache for next time
  setAssets(fresh);                // Replace with fresh data
} catch (err) {
  setError(err instanceof Error ? err.message : String(err));
} finally {
  setLoading(false);
}
```

**Dexie database with two tables:**

A single IndexedDB database contains both tables. Dexie's schema DSL defines indexed columns:

```typescript
// cache/appCache.ts
class AppDatabase extends Dexie {
  assets!: Table<Asset, number>;
  deployments!: Table<Deployment, number>;

  constructor() {
    super('AssetDeploymentDB');
    this.version(1).stores({
      assets: 'Id, Title, Category, Status, SerialNumber',
      deployments: 'Id, Title, AssetId, DeployedTo, Department, DeployedDate'
    });
  }
}
```

The first field in each store definition (`Id`) is the primary key. Additional fields are secondary indexes used for queries like `db.deployments.where('Department').equals(department)`.

### 5. PnP/JS v4 Initialization

PnP/JS v4 uses a fluent factory pattern. The SPFx context is injected once, and the resulting `SPFI` instance is reused throughout the application:

```typescript
// AssetDeploymentWebPart.ts — onInit()
this._sp = spfi().using(SPFx(this.context));
```

PnP/JS uses **side-effect imports** to add capabilities. Without them, methods like `.items` or `.profiles` would not exist:

```typescript
import '@pnp/sp/webs';     // adds sp.web
import '@pnp/sp/lists';    // adds sp.web.lists
import '@pnp/sp/items';    // adds sp.web.lists.getByTitle(...).items
import '@pnp/sp/profiles'; // adds sp.profiles
```

### 6. Multi-Tab UI with Fluent UI Pivot

The root component uses `Pivot` and `PivotItem` to organize the Assets and Deployments views into tabs:

```typescript
// components/AssetDeployment.tsx
<Pivot>
  <PivotItem headerText={strings.AssetsTab}>
    <AssetList
      assets={assetsHook.assets}
      loading={assetsHook.loading}
      onRefresh={assetsHook.refresh}
      onAdd={assetsHook.addAsset}
      onUpdate={assetsHook.updateAsset}
      onDelete={assetsHook.deleteAsset}
    />
  </PivotItem>
  <PivotItem headerText={strings.DeploymentsTab}>
    <DeploymentList
      deployments={deploymentsHook.deployments}
      assets={assetsHook.assets}     {/* passed for lookup dropdown */}
      department={department}
      onRefresh={deploymentsHook.refresh}
      onAdd={deploymentsHook.addDeployment}
      onUpdate={deploymentsHook.updateDeployment}
      onDelete={deploymentsHook.deleteDeployment}
    />
  </PivotItem>
</Pivot>
```

Both hooks run simultaneously when the component mounts. The Deployments tab receives `assets` from the Assets hook so its form can populate the lookup dropdown.

### 7. Context Handover: WebPart to Component

Continuing the pattern from earlier stages, the WebPart passes capabilities and pre-resolved context to the component via the `webPartProps` wrapper pattern:

```typescript
// AssetDeploymentWebPart.ts — render()
const element: React.ReactElement<AssetDeploymentProps> = React.createElement(
  AssetDeployment,
  {
    webPartProps: this.properties,        // Property pane config (list names)
    sp: this._sp,                         // PnP/JS capability
    userDepartment: this._userDepartment, // Pre-resolved in onInit()
    isDarkTheme: this._isDarkTheme,
    hasTeamsContext: !!this.context.sdks.microsoftTeams
  }
);
```

The component destructures `webPartProps` to access list names:

```typescript
// components/AssetDeployment.tsx
const { webPartProps, sp, userDepartment, isDarkTheme, hasTeamsContext } = props;
const { assetsListName, deploymentsListName } = webPartProps;
```

## Consistent Patterns Across All Stages

| Pattern | Seed | Seedling | Plant | Tree |
| --- | --- | --- | --- | --- |
| Web part props | `BaseWebPartProps` | `BaseWebPartProps` | `BaseWebPartProps` | `BaseWebPartProps` |
| Component props | `AppProps { webPartProps }` | `OneDriveExplorerProps { webPartProps }` | `PhoneListProps { webPartProps }` | `AssetDeploymentProps { webPartProps }` |
| Theme handling | `onThemeChanged` + CSS vars | Same | Same | Same |
| Barrel exports | `index.ts` per folder | Same | Same | Same |
| Localization | `loc/` with `.d.ts` + locale `.js` | Same | Same | Same |

## SharePoint Lists

### Assets (master catalog)

| Column | Type | Purpose |
| --- | --- | --- |
| Title | Text (built-in) | Asset name |
| Description | Note | Detailed description |
| Category | Choice | Laptop, Monitor, Phone, Printer, Accessory, Other |
| SerialNumber | Text | Unique identifier |
| Status | Choice | Available, Deployed, Maintenance, Retired |

### Deployments (assignments)

| Column | Type | Purpose |
| --- | --- | --- |
| Title | Text (built-in) | Deployment label |
| Asset | Lookup -> Assets | Links to the Assets list |
| DeployedTo | Text | Person or location |
| Department | Text | Used for server-side filtering |
| DeployedDate | DateTime | When deployed |
| ReturnDate | DateTime | When returned (nullable) |
| Notes | Note | Additional details |

## Supported Hosts

Configured in `AssetDeploymentWebPart.manifest.json`:

| Host | Description |
| --- | --- |
| `SharePointWebPart` | Embedded on a SharePoint page |
| `SharePointFullPage` | Full-page app in SharePoint |
| `TeamsTab` | Microsoft Teams tab |

## Getting Started

### Prerequisites

- Node.js **22.x** (required by SPFx 1.22.2)
- A SharePoint Online site where you can create lists
- PnP PowerShell module (for list provisioning)

### Provision SharePoint Lists

```powershell
.\scripts\pnp.ps1 -SiteUrl https://yourtenant.sharepoint.com/sites/your-site
```

This creates both the "Assets" and "Deployments" lists with all columns, including the lookup column linking Deployments to Assets.

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

This produces `sharepoint/solution/tree.sppkg` which can be uploaded to your SharePoint App Catalog.

### Other Commands

```bash
# Clean build artifacts
npm run clean

# Eject webpack config for advanced customization
npm run eject-webpack
```

## License

MIT

---

[<< Plant App](../../3-Plant/app/README.md) | [Home](../../README.md) | [Stage Guide](../README.md)
