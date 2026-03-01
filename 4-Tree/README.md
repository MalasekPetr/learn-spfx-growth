# 4-Tree

Step 4 of the SPFx Learning Ladder -- **Assets Deployment**.

A web part that manages IT assets and their deployments using two SharePoint lists linked by a lookup column, with full CRUD operations, IndexedDB caching, and department-based server-side security trimming.

## What's New (compared to 3-Plant)

| Concept | Plant | Tree (new) |
| ------- | ----- | ---------- |
| Data source | MS Graph API (`MSGraphClientV3`) | SharePoint lists via PnP/JS v4 (`SPFI`) |
| Typing | Official `@microsoft/microsoft-graph-types` | Custom `BaseListItem` intersection types |
| Operations | Read-only | Full CRUD (Create, Read, Update, Delete) |
| Lists | N/A (Graph endpoint) | Two lists linked by lookup column |
| Caching | Dexie.js single table (read-only) | Dexie.js multi-table (read + write-through) |
| Components | Single component | 6 components: Pivot tabs, list views, form panels, status badge |
| Security | All users see all data | Department-based server-side OData filtering |
| Property pane | Toggle fields for columns and filters | TextField for list names (configurable) |
| User context | None | User profile via `sp.profiles.myProperties()` |
| Hosts | SharePoint, Full Page, Teams Tab | SharePoint, Full Page, Teams Tab |

## Key Files to Study

| File | Purpose |
| ---- | ------- |
| `src/services/deploymentService.ts` | Lookup expand, OData filter, flat mapping of expanded objects |
| `src/services/assetService.ts` | Standard PnP/JS CRUD factory pattern |
| `src/cache/appCache.ts` | Single Dexie DB with two tables, filtered cache reads |
| `src/hooks/useDeployments.ts` | Cache-first-then-refresh with department parameter |
| `src/hooks/useAssets.ts` | Cache-first-then-refresh with CRUD methods |
| `src/hooks/useCurrentUser.ts` | User profile + department extraction |
| `src/components/DeploymentForm.tsx` | Lookup dropdown (display Title, submit Id) |
| `src/components/AssetDeployment.tsx` | Pivot tabs wiring two list components |
| `src/components/StatusBadge.tsx` | Color-coded status indicator |
| `src/models/BaseListItem.ts` | Shared base type for SharePoint list items |
| `scripts/pnp.ps1` | List provisioning with lookup column |

See [app/README.md](app/README.md) for detailed architecture explanations and code walkthroughs.

## SharePoint Lists

Tree requires two custom SharePoint lists on the target site:

**Assets** (master catalog):

| Column | Type | Values |
| ------ | ---- | ------ |
| Title | Text (built-in) | -- |
| Description | Note | -- |
| Category | Choice | Laptop, Monitor, Phone, Printer, Accessory, Other |
| SerialNumber | Text | -- |
| Status | Choice | Available, Deployed, Maintenance, Retired |

**Deployments** (assignments):

| Column | Type | Values |
| ------ | ---- | ------ |
| Title | Text (built-in) | -- |
| Asset | **Lookup -> Assets** | Displays Title |
| DeployedTo | Text | -- |
| Department | Text | -- |
| DeployedDate | DateTime | -- |
| ReturnDate | DateTime | -- |
| Notes | Note | -- |

The **Asset** lookup column is the key relationship -- it links each deployment to an asset by displaying the asset's Title while storing its Id internally.

## Tutorial: From Plant to Tree

This step-by-step guide shows how to evolve the Plant project into Tree. Tree replaces Microsoft Graph with PnP/JS for SharePoint list data and introduces full CRUD operations across two related lists.

### Step 1: Add PnP/JS dependencies

Install the PnP/JS v4 packages:

```bash
npm install @pnp/sp @pnp/core @pnp/queryable @pnp/logging
```

**Why PnP/JS:** While Plant used `MSGraphClientV3` for Graph API, Tree works with SharePoint lists directly. PnP/JS v4 provides a fluent, type-safe API for SharePoint REST operations that is much cleaner than raw `fetch` calls. The four packages are:

- `@pnp/sp` -- SharePoint-specific operations (lists, items, profiles)
- `@pnp/core` -- shared utilities
- `@pnp/queryable` -- OData query building
- `@pnp/logging` -- optional logging infrastructure

### Step 2: Create the BaseListItem type

Create `src/models/BaseListItem.ts` -- a shared base for all SharePoint list item types:

```typescript
export type BaseListItem = {
  Id: number;
  Title: string;
  Created?: string;
  Modified?: string;
};
```

Then define domain types using TypeScript intersection (`&`):

**`src/models/Asset.ts`:**

```typescript
import type { BaseListItem } from './BaseListItem';

export type Asset = BaseListItem & {
  Description: string;
  Category: string;
  SerialNumber: string;
  Status: string;
};
```

**`src/models/Deployment.ts`:**

```typescript
import type { BaseListItem } from './BaseListItem';

export type Deployment = BaseListItem & {
  AssetId: number;
  AssetTitle?: string;
  DeployedTo: string;
  Department: string;
  DeployedDate: string;
  ReturnDate: string | null;
  Notes: string;
};
```

**Why intersection types:** `Asset = BaseListItem & { ... }` is transparent -- you can use `Omit<Asset, 'Id' | 'Created' | 'Modified'>` to strip read-only fields before updates, and Dexie's `Table<Asset, number>` just works. No class inheritance needed.

**Why `AssetId` + `AssetTitle`:** SharePoint lookup columns have dual identities. When **reading**, you expand to get `Asset/Title`. When **writing**, you submit only `AssetId` (the lookup value). The Deployment type captures both.

### Step 3: Add more models

**`src/models/UserInfo.ts`** -- for user profile data:

```typescript
export type UserInfo = {
  displayName: string;
  department: string;
  email: string;
};
```

**`src/models/AssetDeploymentProps.ts`** -- the component props with PnP/JS client:

```typescript
import type { SPFI } from '@pnp/sp';
import type { BaseWebPartProps } from './BaseWebPartProps';

export type AssetDeploymentProps = {
  webPartProps: BaseWebPartProps;
  sp: SPFI;
  userDepartment: string;
  isDarkTheme: boolean;
  hasTeamsContext: boolean;
};
```

**`src/models/BaseWebPartProps.ts`** -- now includes configurable list names:

```typescript
export type BaseWebPartProps = {
  description: string;
  assetsListName: string;
  deploymentsListName: string;
};
```

**`src/models/index.ts`** -- barrel export for all types:

```typescript
export type { Asset } from './Asset';
export type { Deployment } from './Deployment';
export type { BaseListItem } from './BaseListItem';
export type { BaseWebPartProps } from './BaseWebPartProps';
export type { AssetDeploymentProps } from './AssetDeploymentProps';
export type { UserInfo } from './UserInfo';
```

**Why configurable list names:** Site owners can rename lists or use different names per locale. Exposing them in the property pane makes the web part reusable without code changes.

### Step 4: Build the asset service

Create `src/services/assetService.ts` -- the CRUD factory for the Assets list:

```typescript
import type { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import type { Asset } from '../models';

export const createAssetService = (sp: SPFI, listName: string) => ({
  async getAll(): Promise<Asset[]> {
    return sp.web.lists.getByTitle(listName).items
      .select('Id', 'Title', 'Description', 'Category', 'SerialNumber', 'Status', 'Created', 'Modified')
      .orderBy('Title')
      .top(500)();
  },

  async add(asset: Omit<Asset, 'Id' | 'Created' | 'Modified'>): Promise<Asset> {
    const result = await sp.web.lists.getByTitle(listName).items.add(asset);
    return result as unknown as Asset;
  },

  async update(id: number, asset: Partial<Asset>): Promise<void> {
    const { Id: _id, Created: _c, Modified: _m, ...fields } = asset as Asset;
    await sp.web.lists.getByTitle(listName).items.getById(id).update(fields);
  },

  async remove(id: number): Promise<void> {
    await sp.web.lists.getByTitle(listName).items.getById(id).recycle();
  }
});
```

**Why `Omit<Asset, 'Id' | 'Created' | 'Modified'>`:** The `add` method accepts only writable fields -- SharePoint assigns Id, Created, and Modified automatically.

**Why destructuring in `update`:** The pattern `const { Id: _id, Created: _c, Modified: _m, ...fields } = asset as Asset;` strips read-only fields. The underscore-prefixed variables (`_id`, `_c`, `_m`) signal "intentionally unused". The rest operator collects only the writable fields into `fields`.

**Why `recycle()` instead of `delete()`:** Items go to the recycle bin instead of permanent deletion, matching SharePoint's default behavior and giving users a safety net.

### Step 5: Build the deployment service with lookup handling

Create `src/services/deploymentService.ts` -- the most complex service with lookup expand and OData filtering:

```typescript
import type { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import type { Deployment } from '../models';

export const createDeploymentService = (sp: SPFI, listName: string) => ({
  async getAll(departmentFilter?: string): Promise<Deployment[]> {
    let query = sp.web.lists.getByTitle(listName).items
      .select('Id', 'Title', 'AssetId', 'Asset/Title', 'DeployedTo', 'Department',
              'DeployedDate', 'ReturnDate', 'Notes', 'Created', 'Modified')
      .expand('Asset')
      .orderBy('Title')
      .top(500);

    if (departmentFilter) {
      query = query.filter(`Department eq '${departmentFilter}'`);
    }

    const raw = await query();

    return raw.map((item: Record<string, unknown>) => ({
      Id: item.Id as number,
      Title: item.Title as string,
      AssetId: item.AssetId as number,
      AssetTitle: (item.Asset as Record<string, unknown>)?.Title as string | undefined,
      DeployedTo: item.DeployedTo as string,
      Department: item.Department as string,
      DeployedDate: item.DeployedDate as string,
      ReturnDate: item.ReturnDate as string | null,
      Notes: item.Notes as string,
      Created: item.Created as string,
      Modified: item.Modified as string,
    }));
  },

  async add(deployment: Omit<Deployment, 'Id' | 'Created' | 'Modified' | 'AssetTitle'>): Promise<Deployment> {
    const result = await sp.web.lists.getByTitle(listName).items.add(deployment);
    return result as unknown as Deployment;
  },

  async update(id: number, deployment: Partial<Deployment>): Promise<void> {
    const { Id: _id, Created: _c, Modified: _m, AssetTitle: _at, ...fields } = deployment as Deployment;
    await sp.web.lists.getByTitle(listName).items.getById(id).update(fields);
  },

  async remove(id: number): Promise<void> {
    await sp.web.lists.getByTitle(listName).items.getById(id).recycle();
  }
});
```

Create the barrel export `src/services/index.ts`:

```typescript
export { createAssetService } from './assetService';
export { createDeploymentService } from './deploymentService';
```

**Why `.select('Asset/Title').expand('Asset')`:** SharePoint lookup columns return nested objects. The `expand` tells the REST API to include the related item. The `select` with slash notation (`Asset/Title`) requests only the Title field from the expanded lookup.

**Why flat mapping:** The raw SharePoint response contains `{ Asset: { Title: "..." } }` as a nested object. The `.map()` flattens it to `{ AssetTitle: "..." }` so the component doesn't need to know about SharePoint's nested structure.

**Why `AssetTitle` is stripped in `update`:** `AssetTitle` is a read-only computed field (comes from the expand). Only `AssetId` is writable -- it's the actual lookup value stored in SharePoint.

**Why OData `filter`:** The `Department eq '${departmentFilter}'` clause runs **server-side** in SharePoint, so only matching items are returned. This is more efficient than fetching all items and filtering in the browser, and it enforces data access boundaries.

### Step 6: Build the multi-table cache

Create `src/cache/appCache.ts` -- a single Dexie database with two tables:

```typescript
import Dexie, { type Table } from 'dexie';
import type { Asset, Deployment } from '../models';

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

const db = new AppDatabase();

export const assetCache = {
  async getAll(): Promise<Asset[]> { return db.assets.toArray(); },
  async putAll(assets: Asset[]): Promise<void> {
    await db.assets.clear();
    await db.assets.bulkPut(assets);
  },
  async put(asset: Asset): Promise<void> { await db.assets.put(asset); },
  async remove(id: number): Promise<void> { await db.assets.delete(id); },
  async clear(): Promise<void> { await db.assets.clear(); }
};

export const deploymentCache = {
  async getAll(department?: string): Promise<Deployment[]> {
    if (department) {
      return db.deployments.where('Department').equals(department).toArray();
    }
    return db.deployments.toArray();
  },
  async putAll(deployments: Deployment[]): Promise<void> {
    await db.deployments.clear();
    await db.deployments.bulkPut(deployments);
  },
  async put(deployment: Deployment): Promise<void> { await db.deployments.put(deployment); },
  async remove(id: number): Promise<void> { await db.deployments.delete(id); },
  async clear(): Promise<void> { await db.deployments.clear(); }
};
```

Create the barrel export `src/cache/index.ts`:

```typescript
export { assetCache, deploymentCache } from './appCache';
```

**Why `put` and `remove` alongside `putAll`:** Plant only had read-only caching (`putAll` replaced everything). Tree needs **write-through caching** -- when a user creates, updates, or deletes an item, the cache is updated immediately so the UI reflects the change without a full refresh.

**Why `deploymentCache.getAll(department?)`:** The department filter applies at both the service level (OData) and the cache level (Dexie `where().equals()`). This ensures cached data also respects the department boundary.

### Step 7: Build the hooks with CRUD

**`src/hooks/useAssets.ts`** -- extends the cache-first pattern with CRUD methods:

```typescript
export const useAssets = (sp: SPFI, listName: string) => {
  // ... cache-first-then-refresh fetch (same pattern as Plant)

  const addAsset = useCallback(async (asset: Omit<Asset, 'Id' | 'Created' | 'Modified'>) => {
    const created = await service.add(asset);
    await assetCache.put(created);
    setAssets(prev => [...prev, created]);
  }, [service]);

  const updateAsset = useCallback(async (id: number, asset: Partial<Asset>) => {
    await service.update(id, asset);
    // ... update local state + cache
  }, [service]);

  const deleteAsset = useCallback(async (id: number) => {
    await service.remove(id);
    await assetCache.remove(id);
    setAssets(prev => prev.filter(a => a.Id !== id));
  }, [service]);

  return { assets, loading, error, refresh, addAsset, updateAsset, deleteAsset };
};
```

**`src/hooks/useDeployments.ts`** -- same pattern but accepts `department` parameter:

```typescript
export const useDeployments = (sp: SPFI, listName: string, department: string) => {
  // Passes department to both service.getAll(department) and deploymentCache.getAll(department)
  // ... same CRUD pattern as useAssets

  return { deployments, loading, error, refresh, addDeployment, updateDeployment, deleteDeployment };
};
```

**`src/hooks/useCurrentUser.ts`** -- extracts user profile for department-based filtering:

```typescript
import { useState, useEffect } from 'react';
import type { SPFI } from '@pnp/sp';
import '@pnp/sp/profiles';
import type { UserInfo } from '../models';

export const useCurrentUser = (sp: SPFI) => {
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined);

  useEffect(() => {
    sp.profiles.myProperties()
      .then((profile: Record<string, unknown>) => {
        const props = profile.UserProfileProperties as Array<{ Key: string; Value: string }>;
        const department = props?.find(p => p.Key === 'Department')?.Value || '';
        setUserInfo({
          displayName: profile.DisplayName as string,
          department,
          email: profile.Email as string,
        });
      })
      .catch(() => { /* fallback: empty department */ })
      .finally(() => setLoading(false));
  }, [sp]);

  return { userInfo, loading, error };
};
```

Create the barrel export `src/hooks/index.ts`:

```typescript
export { useAssets } from './useAssets';
export { useDeployments } from './useDeployments';
export { useCurrentUser } from './useCurrentUser';
export { useDebounce } from './useDebounce';
```

**Why `sp.profiles.myProperties()`:** The User Profile Service returns `UserProfileProperties` as a key-value array (not a flat object). The hook extracts the `Department` property and exposes it for server-side OData filtering in the deployment service.

**Why `refreshKey` pattern:** Incrementing `refreshKey` triggers `useCallback` to create a new fetch reference, which triggers `useEffect` to re-fetch. This is a clean pattern for imperative "refresh" actions within the declarative hooks model.

### Step 8: Build the components

Tree has 6 components (vs Plant's 1). Here's the architecture:

```text
AssetDeployment (root)
  ├── Pivot tab: Assets
  │   ├── AssetList (DetailsList + CommandBar + Search)
  │   └── AssetForm (Panel slide-out)
  ├── Pivot tab: Deployments
  │   ├── DeploymentList (DetailsList + CommandBar + Search)
  │   └── DeploymentForm (Panel slide-out with lookup dropdown)
  └── StatusBadge (shared utility component)
```

**`src/components/AssetDeployment.tsx`** -- the root component with Pivot tabs:

```typescript
export function AssetDeployment(props: AssetDeploymentProps): JSX.Element {
  const { sp, webPartProps, userDepartment, isDarkTheme, hasTeamsContext } = props;
  const { assetsListName, deploymentsListName } = webPartProps;

  const { assets, loading: assetsLoading, error: assetsError, refresh: refreshAssets,
          addAsset, updateAsset, deleteAsset } = useAssets(sp, assetsListName);

  const { deployments, loading: deploymentsLoading, refresh: refreshDeployments,
          addDeployment, updateDeployment, deleteDeployment } = useDeployments(sp, deploymentsListName, userDepartment);

  return (
    <section className={`${styles.app} ${hasTeamsContext ? styles.teams : ''} ${isDarkTheme ? styles.dark : ''}`}>
      <Pivot>
        <PivotItem headerText={strings.AssetsTab}>
          <AssetList assets={assets} loading={assetsLoading} ... />
        </PivotItem>
        <PivotItem headerText={strings.DeploymentsTab}>
          <DeploymentList deployments={deployments} assets={assets} ... />
        </PivotItem>
      </Pivot>
    </section>
  );
}
```

**`src/components/DeploymentForm.tsx`** -- the lookup dropdown pattern:

```typescript
<Dropdown
  label={strings.AssetFieldLabel}
  required
  selectedKey={form.AssetId || undefined}
  options={assets.map(a => ({ key: a.Id, text: a.Title }))}
  onChange={(_, option) => setForm(prev => ({
    ...prev,
    AssetId: option?.key as number
  }))}
/>
```

**Why assets are passed to DeploymentList:** The deployment form needs the asset list to populate the lookup dropdown. Rather than fetching assets again inside the form, the parent component passes the already-loaded `assets` array down.

**`src/components/StatusBadge.tsx`** -- a simple color-coded status indicator:

```typescript
export function StatusBadge({ status }: { status: string }): JSX.Element {
  const className = styles[`status${status}`] || styles.badge;
  return <span className={`${styles.badge} ${className}`}>{status}</span>;
}
```

The badge maps status values to CSS classes: `statusAvailable` (green), `statusDeployed` (blue), `statusMaintenance` (yellow), `statusRetired` (gray).

### Step 9: Initialize PnP/JS in the web part

The web part replaces Graph client initialization with PnP/JS setup:

```typescript
import { spfi, type SPFI, SPFx } from '@pnp/sp';

export default class AssetDeploymentWebPart extends BaseClientSideWebPart<BaseWebPartProps> {
  private _sp!: SPFI;
  private _userDepartment: string = '';

  protected async onInit(): Promise<void> {
    this._sp = spfi().using(SPFx(this.context));

    try {
      const profile = await this._sp.profiles.myProperties();
      const props = profile.UserProfileProperties as Array<{ Key: string; Value: string }>;
      this._userDepartment = props?.find(p => p.Key === 'Department')?.Value || '';
    } catch {
      this._userDepartment = '';
    }
  }

  public render(): void {
    const element = React.createElement(AssetDeployment, {
      sp: this._sp,
      webPartProps: this.properties,
      userDepartment: this._userDepartment,
      isDarkTheme: this._isDarkTheme,
      hasTeamsContext: !!this.context.sdks.microsoftTeams,
    });
    ReactDom.render(element, this.domElement);
  }
}
```

**Why `SPFx(this.context)`:** This PnP/JS behavior binds the SPFI instance to the current SPFx context, inheriting the user's authentication and site URL. No manual token management needed.

**Why resolve department in `onInit()`:** The department is used for server-side filtering. Resolving it once in `onInit()` (before the first render) means the component receives it immediately as a prop, avoiding a loading flash.

### Step 10: Configure the property pane with list names

```typescript
protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
  return {
    pages: [{
      header: { description: strings.PropertyPaneDescription },
      groups: [{
        groupName: strings.BasicGroupName,
        groupFields: [
          PropertyPaneTextField('description', { label: strings.DescriptionFieldLabel }),
          PropertyPaneTextField('assetsListName', { label: strings.AssetsListNameLabel }),
          PropertyPaneTextField('deploymentsListName', { label: strings.DeploymentsListNameLabel }),
        ]
      }]
    }]
  };
}
```

The default values ("Assets" and "Deployments") are set in the manifest's `properties` object, so the web part works out of the box on sites that use the provisioning script.

### Step 11: Add styles for status badges

Extend `src/styles/App.module.scss`:

```scss
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.statusAvailable   { background: #dff6dd; color: #107c10; }
.statusDeployed    { background: #deecf9; color: #004578; }
.statusMaintenance { background: #fff4ce; color: #835c00; }
.statusRetired     { background: #edebe9; color: #605e5c; }
```

**Why CSS-based status mapping:** The StatusBadge component dynamically selects a class based on the status string (e.g., `styles['statusAvailable']`). Adding a new status only requires a new CSS class -- no component changes.

### Step 12: Create the provisioning script

Create `scripts/pnp.ps1` -- a PowerShell script that creates both SharePoint lists:

```powershell
param(
    [Parameter(Mandatory=$true)]
    [string]$SiteUrl
)

Connect-PnPOnline -Url $SiteUrl -Interactive

# --- Assets list (master catalog) ---
New-PnPList -Title "Assets" -Template GenericList
Add-PnPField -List "Assets" -DisplayName "Description" -InternalName "Description" -Type Note -AddToDefaultView
Add-PnPField -List "Assets" -DisplayName "Category" -InternalName "Category" -Type Choice `
    -Choices "Laptop","Monitor","Phone","Printer","Accessory","Other" `
    -DefaultValue "Other" -AddToDefaultView
Add-PnPField -List "Assets" -DisplayName "SerialNumber" -InternalName "SerialNumber" -Type Text -AddToDefaultView
Add-PnPField -List "Assets" -DisplayName "Status" -InternalName "Status" -Type Choice `
    -Choices "Available","Deployed","Maintenance","Retired" `
    -DefaultValue "Available" -AddToDefaultView

# --- Deployments list (assignments) ---
New-PnPList -Title "Deployments" -Template GenericList
Add-PnPField -List "Deployments" -DisplayName "DeployedTo" -InternalName "DeployedTo" -Type Text -AddToDefaultView
Add-PnPField -List "Deployments" -DisplayName "Department" -InternalName "Department" -Type Text -AddToDefaultView
Add-PnPField -List "Deployments" -DisplayName "DeployedDate" -InternalName "DeployedDate" -Type DateTime -AddToDefaultView
Add-PnPField -List "Deployments" -DisplayName "ReturnDate" -InternalName "ReturnDate" -Type DateTime -AddToDefaultView
Add-PnPField -List "Deployments" -DisplayName "Notes" -InternalName "Notes" -Type Note -AddToDefaultView

# Lookup column: Asset -> Assets list
$assetsList = Get-PnPList -Identity "Assets"
Add-PnPField -List "Deployments" -DisplayName "Asset" -InternalName "Asset" `
    -Type Lookup -AddToDefaultView `
    -AdditionalAttributes @{
        List = $assetsList.Id.ToString()
        ShowField = "Title"
    }

Disconnect-PnPOnline
```

**Why a provisioning script:** Unlike Graph endpoints (which exist automatically), SharePoint lists must be created manually. The script ensures consistent column definitions across environments and is the recommended approach for SPFx solutions that depend on specific list schemas.

**Why lookup column is created last:** The Asset lookup references the Assets list, so that list must exist first. `Get-PnPList` retrieves its GUID, which is passed as the `List` attribute of the lookup field.

### Final: Verify your structure

```text
src/
  webparts/
    assetDeployment/
      AssetDeploymentWebPart.ts          # SPFx entry point + PnP init + user profile
      AssetDeploymentWebPart.manifest.json
  components/
    AssetDeployment.tsx                  # Root: Pivot tabs + hooks
    AssetList.tsx                        # Assets DetailsList + CommandBar + Search
    AssetForm.tsx                        # Panel form for create/edit asset
    DeploymentList.tsx                   # Deployments DetailsList
    DeploymentForm.tsx                   # Panel form with lookup dropdown
    StatusBadge.tsx                      # Color-coded badge
    index.ts
  hooks/
    useAssets.ts                         # Cache-first CRUD for assets
    useDeployments.ts                    # Cache-first CRUD with department filter
    useCurrentUser.ts                    # User profile extraction
    useDebounce.ts                       # Generic debounce
    index.ts
  services/
    assetService.ts                      # PnP/JS CRUD factory for Assets
    deploymentService.ts                 # PnP/JS with expand + OData filter
    index.ts
  cache/
    appCache.ts                          # Single Dexie DB with two tables
    index.ts
  models/
    BaseListItem.ts                      # Shared base type (Id, Title, Created, Modified)
    Asset.ts                             # BaseListItem & asset-specific fields
    Deployment.ts                        # BaseListItem & deployment fields + lookup
    BaseWebPartProps.ts                  # Property pane config (list names)
    AssetDeploymentProps.ts              # Component props (wraps BaseWebPartProps + SPFI)
    UserInfo.ts                          # User profile type
    index.ts
  utils/
    textUtils.ts                         # normalizeText (diacritics-aware search)
    index.ts
  styles/
    App.module.scss                      # Status badges + dark theme
  loc/
    mystrings.d.ts                       # 54 localization keys
    en-us.js
    cs-cz.js
  index.ts
scripts/
  pnp.ps1                               # List provisioning script
```

## Getting Started

### Prerequisites

- Complete the [3-Plant](../3-Plant/) stage first
- Node.js **22.x** (required by SPFx 1.22.2)
- A SharePoint Online site where you can create lists
- PnP PowerShell module (`Install-Module PnP.PowerShell`) for list provisioning

### Provision SharePoint Lists

Run the PnP PowerShell script to create the required lists:

```powershell
cd 4-Tree
.\scripts\pnp.ps1 -SiteUrl https://<tenant>.sharepoint.com/sites/<site>
```

This creates the "Assets" and "Deployments" lists with all columns, including the lookup column linking Deployments to Assets. Verify the lists appear in Site Contents before proceeding.

> **Tip:** If you re-run the script on a site that already has the lists, it will fail. Delete the existing lists first, or modify the script to check for existence with `Get-PnPList`.

### Install

```bash
cd 4-Tree/app
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

> **Note:** The workbench can render the UI shell, but PnP/JS calls require a real SharePoint context. For full testing with list data, deploy to the site where you provisioned the lists.

### Build & Package

```bash
npm run build
```

This compiles TypeScript, bundles the web part, and produces `sharepoint/solution/tree.sppkg`.

### Deploy

Since `skipFeatureDeployment` is `true` in `config/package-solution.json`, the solution is deployed **tenant-wide** when you check "Make this solution available to all sites" during upload.

1. **Upload** `sharepoint/solution/tree.sppkg` to your **App Catalog**
   - **Site-level catalog:** Site Contents > Apps for SharePoint > Upload
   - **Tenant catalog:** SharePoint Admin Center > More features > Apps > App Catalog > Upload
2. **Trust** the solution when prompted (click "Deploy")
   - If using the tenant catalog, check **"Make this solution available to all sites"** to enable tenant-wide deployment
   - With `skipFeatureDeployment: true`, the web part becomes available on all sites without per-site installation
3. **Add the web part** to a page on the site where you provisioned the lists
4. **Configure list names** in the property pane:
   - Open the web part property pane (edit > click pencil icon on the web part)
   - Verify **Assets list name** is "Assets" and **Deployments list name** is "Deployments"
   - If you used different list names in the provisioning script, update them here

> **Important:** The SharePoint lists must exist on the site where you add the web part. The web part reads from the **current site's** lists, so if you deploy tenant-wide, each site that uses the web part needs its own "Assets" and "Deployments" lists (or configure different names via the property pane).
>
> **Tip:** If you see "This app could not be added" when using a site-level catalog, use PowerShell:
>
> ```powershell
> Connect-PnPOnline -Url https://<tenant>.sharepoint.com/sites/<site> -Interactive
> Install-PnPApp -Identity "704467b7-a0d4-488c-aa87-72da8ad2bdf3" -Scope Site
> ```

### Use as a web part on a page

1. Navigate to any SharePoint page on a site with the provisioned lists
2. Click **Edit** (pencil icon top-right)
3. Click **+** to add a new section or web part
4. Search for **"Assets Deployment"** in the web part picker
5. Click to insert it into the page, then **Republish**

### Use as a full-page app

The manifest declares `SharePointFullPage` as a supported host:

1. Go to **Site Contents** on the target site
2. Click **+ New** > **Page** (or use **Site Pages** library > + New > **Page**)
3. In the page template picker, choose **"Assets Deployment"** from the Apps section
4. The page renders the full CRUD interface with Pivot tabs, full-width

### Use as a Teams tab

The manifest also declares `TeamsTab` as a supported host:

1. Open **Microsoft Teams** > go to the target team channel
2. Click **+** (Add a tab) at the top of the channel
3. Search for **"Assets Deployment"** and select it
4. The web part renders inside a Teams tab with full theme support

> **When to use which:** Use the **web part** when the asset manager is part of a larger page. Use the **full-page app** for a dedicated asset management experience (recommended). Use the **Teams tab** to manage assets directly from a team channel.

### Test

- **Assets CRUD:**
  - Switch to the Assets tab and click **New Asset**
  - Fill in Title, Description, Category (dropdown), SerialNumber, and Status
  - Save and verify the new asset appears in the list with a colored **StatusBadge**
  - Click the Edit icon to modify an asset, then save
  - Click the Delete icon and confirm the deletion dialog

- **Deployments CRUD:**
  - Switch to the Deployments tab and click **New Deployment**
  - Select an asset from the **lookup dropdown** -- verify it shows asset Titles
  - Fill in DeployedTo, Department, dates, and notes
  - Save and verify the deployment appears with the linked asset name
  - Edit and delete a deployment

- **Caching:**
  - Reload the page -- data should appear **instantly** from IndexedDB before the SharePoint refresh
  - Open F12 > Application > IndexedDB > AssetDeploymentDB to inspect both cached tables

- **Department filtering:**
  - Verify the Deployments tab only shows deployments matching your department
  - Create a deployment with a different department value and confirm it doesn't appear after refresh

- **Property pane:**
  - Edit the web part and change the list names in the property pane
  - Verify the web part reads from the renamed lists

- **Full-page & Teams:**
  - Create a full-page app page and confirm the Pivot tabs render full-width
  - If Teams is available, add the web part as a tab and verify theme integration

---

[<< 3-Plant](../3-Plant/README.md) | [Home](../README.md) | [App Deep-Dive](app/README.md)
