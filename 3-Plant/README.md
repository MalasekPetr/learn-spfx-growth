# 3-Plant

Step 3 of the SPFx Learning Ladder -- **Phone List**.

A web part that displays your organization's user directory with search, alphabet filter, department filter, configurable columns, and IndexedDB caching.

## What's New (compared to 2-Seedling)

| Concept | Seedling | Plant (new) |
| ------- | -------- | ----------- |
| Graph API | Single endpoint, simple response | Pagination with `@odata.nextLink`, `$select` |
| Typing | Custom types (`DriveItem`) | Official `@microsoft/microsoft-graph-types` (`User`) |
| Architecture | Hook calls API directly | Service layer + Cache layer + Hook |
| Caching | None | Dexie.js (IndexedDB) cache-first-then-refresh |
| Hooks | 2 custom hooks | 2 custom hooks (`useUsers`, `useDebounce`) |
| Fluent UI | DetailsList, Breadcrumb, CommandBar | DetailsList, SearchBox, Dropdown, CommandBar |
| Filtering | None | Alphabet filter (Czech CH digraph), department dropdown |
| Utilities | `formatFileSize` | `normalizeText`, `getFirstLetter`, `generateCzechAlphabet` |
| Property pane | TextField only | Toggle fields for columns and filters |
| New folders | -- | `services/`, `cache/` |
| Hosts | SharePoint, Full Page | SharePoint, Full Page, **Teams Tab** |

## Key Files to Study

| File | Purpose |
| ---- | ------- |
| `src/services/userService.ts` | Graph API pagination in a factory function |
| `src/cache/userCache.ts` | Dexie single-table cache with `getAll()`, `putAll()`, `clear()` |
| `src/hooks/useUsers.ts` | Cache-first-then-refresh, exposes `allUsers` for filter population |
| `src/hooks/useDebounce.ts` | Generic debounce hook |
| `src/components/PhoneList.tsx` | Alphabet bar, department dropdown, single-pass filtering |
| `src/utils/textUtils.ts` | `normalizeText`, `getFirstLetter`, `generateCzechAlphabet` |
| `src/models/index.ts` | Re-exports `User` from `@microsoft/microsoft-graph-types` |

See [app/README.md](app/README.md) for detailed architecture explanations and code walkthroughs.

## Tutorial: From Seedling to Plant

This step-by-step guide shows how to evolve the Seedling project into Plant. Plant introduces three new architectural layers (service, cache, utils) and a rich configurable property pane.

### Step 1: Add the service layer

Create `src/services/userService.ts` -- a **factory function** that encapsulates all Graph API calls:

```typescript
import type { MSGraphClientV3 } from '@microsoft/sp-http';
import type { User } from '../models';

type GraphResponse<T> = {
  value: T[];
  '@odata.nextLink'?: string;
};

const SELECT_FIELDS = 'displayName,givenName,surname,department,jobTitle,companyName,mail,mobilePhone,businessPhones,userPrincipalName';

export const createUserService = (graphClient: MSGraphClientV3) => ({
  async getAll(): Promise<User[]> {
    const collected: User[] = [];

    const response: GraphResponse<User> = await graphClient
      .api('/users')
      .select(SELECT_FIELDS)
      .top(100)
      .get();

    collected.push(...response.value);
    let nextLink = response['@odata.nextLink'];

    while (nextLink) {
      const nextResponse: GraphResponse<User> = await graphClient
        .api(nextLink)
        .get();
      collected.push(...nextResponse.value);
      nextLink = nextResponse['@odata.nextLink'];
    }

    return collected;
  }
});
```

Create the barrel export `src/services/index.ts`:

```typescript
export { createUserService } from './userService';
```

**Why a service layer:** In Seedling, the hook called Graph API directly. This works for simple cases but becomes hard to maintain with pagination, `$select` optimization, and multiple endpoints. The factory function pattern (`createUserService(graphClient)`) keeps the Graph client injection clean and the service testable.

**Why `@odata.nextLink` pagination:** Graph API returns max 100 items per request. The `while (nextLink)` loop follows each `@odata.nextLink` URL until all pages are collected. This is how you fetch an entire dataset from Microsoft Graph.

### Step 2: Add the cache layer

Create `src/cache/userCache.ts` -- uses **Dexie.js** to wrap IndexedDB:

```typescript
import Dexie, { type Table } from 'dexie';
import type { User } from '../models';

class UserDatabase extends Dexie {
  users!: Table<User, string>;

  constructor() {
    super('PhoneListDB');
    this.version(1).stores({
      users: 'userPrincipalName, displayName, surname, department'
    });
  }
}

const db = new UserDatabase();

export const userCache = {
  async getAll(): Promise<User[]> {
    return db.users.toArray();
  },
  async putAll(users: User[]): Promise<void> {
    await db.users.clear();
    await db.users.bulkPut(users);
  },
  async clear(): Promise<void> {
    await db.users.clear();
  }
};
```

Create the barrel export `src/cache/index.ts`:

```typescript
export { userCache } from './userCache';
```

**Why Dexie.js:** IndexedDB has a notoriously verbose API. Dexie wraps it in a clean Promise-based interface. The `stores` declaration (`'userPrincipalName, displayName, surname, department'`) defines the primary key and indexed columns -- enabling fast lookups without SQL.

**Why cache-first-then-refresh:** The `useUsers` hook (Step 4) loads cached data first for instant UI, then fetches fresh data from Graph API in the background. This pattern gives users an immediate response while keeping data current.

### Step 3: Add the text utilities

Create `src/utils/textUtils.ts` -- Czech-aware text processing:

```typescript
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function getFirstLetter(surname: string): string {
  if (!surname) return '';
  const upper = normalizeText(surname).toUpperCase();
  if (upper.startsWith('CH')) return 'CH';
  return upper.substring(0, 1);
}

export function generateCzechAlphabet(): string[] {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  letters.push('CH');
  return letters.sort((a, b) => {
    if (a === 'CH' && b === 'I') return -1;
    if (a === 'I' && b === 'CH') return 1;
    if (a === 'CH' && b > 'H' && b < 'I') return 1;
    if (b === 'CH' && a > 'H' && a < 'I') return -1;
    return a.localeCompare(b, 'cs');
  });
}
```

Create the barrel export `src/utils/index.ts`:

```typescript
export { normalizeText, getFirstLetter, generateCzechAlphabet } from './textUtils';
```

**Why `normalizeText`:** Czech names contain diacritics (e.g., "Malášek"). `normalize('NFD')` decomposes accented characters into base + combining marks, then the regex strips the marks. This lets users type "malasek" to find "Malášek".

**Why CH as a single letter:** In the Czech alphabet, CH is a distinct letter between H and I. `getFirstLetter` checks for the CH prefix before falling back to the first character. `generateCzechAlphabet` sorts CH into its correct position using locale-aware comparison.

### Step 4: Add the hooks

**`src/hooks/useDebounce.ts`** -- a generic delay hook:

```typescript
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

**`src/hooks/useUsers.ts`** -- the core data hook composing service + cache:

```typescript
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { MSGraphClientV3 } from '@microsoft/sp-http';
import type { User } from '../models';
import { createUserService } from '../services';
import { userCache } from '../cache';
import { normalizeText } from '../utils';

export const useUsers = (graphClient: MSGraphClientV3, searchText: string) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const service = useMemo(() => createUserService(graphClient), [graphClient]);

  const fetchAllUsers = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(undefined);
    try {
      // 1) Cache-first: show cached data immediately
      const cached = await userCache.getAll();
      if (cached.length > 0) {
        setAllUsers(cached);
        setLoading(false);
      }
      // 2) Then refresh from Graph API
      const fresh = await service.getAll();
      await userCache.putAll(fresh);
      setAllUsers(fresh);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [service, refreshKey]);

  useEffect(() => {
    fetchAllUsers().catch((): undefined => undefined);
  }, [fetchAllUsers]);

  // Client-side search filtering
  const filteredUsers = searchText
    ? allUsers.filter((user) => {
        const normalized = normalizeText(searchText);
        return (
          normalizeText(user.displayName || '').includes(normalized) ||
          normalizeText(user.department || '').includes(normalized) ||
          normalizeText(user.jobTitle || '').includes(normalized) ||
          normalizeText(user.mail || '').includes(normalized)
        );
      })
    : allUsers;

  const refresh = useCallback((): void => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return { users: filteredUsers, allUsers, loading, error, refresh };
};
```

Create the barrel export `src/hooks/index.ts`:

```typescript
export { useUsers } from './useUsers';
export { useDebounce } from './useDebounce';
```

**Why `allUsers` is exposed separately:** The component needs the unfiltered list to populate the department dropdown and determine which alphabet letters are available. `users` is the search-filtered subset; `allUsers` is the complete dataset.

**Why `refreshKey`:** Incrementing `refreshKey` triggers `useCallback` to create a new `fetchAllUsers` reference, which triggers `useEffect` to re-fetch. This is a clean pattern for imperative "refresh" actions within the declarative hooks model.

### Step 5: Add the models

**`src/models/BaseWebPartProps.ts`** -- now includes toggle fields for columns and filters:

```typescript
export type BaseWebPartProps = {
  description: string;
  showDepartment: boolean;
  showJobTitle: boolean;
  showEmail: boolean;
  showMobilePhone: boolean;
  showBusinessPhone: boolean;
  allowFirstLetterFilter: boolean;
  allowDepartmentFilter: boolean;
};
```

**`src/models/PhoneListProps.ts`** -- follows the same `webPartProps` wrapper pattern:

```typescript
import type { MSGraphClientV3 } from '@microsoft/sp-http';
import type { BaseWebPartProps } from './BaseWebPartProps';

export type PhoneListProps = {
  webPartProps: BaseWebPartProps;
  isDarkTheme: boolean;
  graphClient: MSGraphClientV3;
}
```

**`src/models/index.ts`** -- re-exports the official Microsoft Graph `User` type:

```typescript
export type { BaseWebPartProps } from './BaseWebPartProps';
export type { PhoneListProps } from './PhoneListProps';
export type { User } from '@microsoft/microsoft-graph-types';
```

**Why re-export `User`:** Instead of defining a custom type (like Seedling's `DriveItem`), Plant uses the official `@microsoft/microsoft-graph-types` package. Re-exporting through the barrel means consumers import `User` from `../models` -- same pattern as custom types, but backed by Microsoft's official definitions.

### Step 6: Build the component

Create `src/components/PhoneList.tsx`. The component destructures `webPartProps` to control which columns and filters render:

```typescript
const {
  graphClient, isDarkTheme,
  webPartProps: {
    showDepartment, showJobTitle, showEmail, showMobilePhone, showBusinessPhone,
    allowFirstLetterFilter, allowDepartmentFilter
  }
} = props;
```

Three filtering layers work together in a **single-pass pipeline**:

1. **Search filter** -- applied in `useUsers` hook via `normalizeText` (diacritics-aware)
2. **Alphabet filter** -- the button bar filters by `getFirstLetter(surname)`
3. **Department filter** -- the Dropdown filters by exact department match

```typescript
const filteredUsers = React.useMemo(() => {
  return users.filter((u) => {
    if (departmentFilter && u.department !== departmentFilter) return false;
    if (firstLetterFilter && getFirstLetter(u.surname || '') !== firstLetterFilter) return false;
    return true;
  });
}, [users, departmentFilter, firstLetterFilter]);
```

The alphabet bar dynamically disables letters that have no matching users:

```typescript
const availableLetters = React.useMemo(() => {
  const letters = new Set<string>();
  allUsers.forEach((u) => {
    const letter = getFirstLetter(u.surname || '');
    if (letter) letters.add(letter);
  });
  return letters;
}, [allUsers]);
```

See the full component source in `app/src/components/PhoneList.tsx`.

### Step 7: Configure the property pane

The web part class now implements `getPropertyPaneConfiguration()` with three groups:

```typescript
protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
  return {
    pages: [{
      header: { description: strings.PropertyPaneDescription },
      groups: [
        {
          groupName: strings.BasicGroupName,
          groupFields: [
            PropertyPaneTextField('description', { label: strings.DescriptionFieldLabel })
          ]
        },
        {
          groupName: strings.ColumnsGroupName,
          groupFields: [
            PropertyPaneToggle('showDepartment', { label: strings.ShowDepartment }),
            PropertyPaneToggle('showJobTitle', { label: strings.ShowJobTitle }),
            PropertyPaneToggle('showEmail', { label: strings.ShowEmail }),
            PropertyPaneToggle('showMobilePhone', { label: strings.ShowMobilePhone }),
            PropertyPaneToggle('showBusinessPhone', { label: strings.ShowBusinessPhone }),
          ]
        },
        {
          groupName: strings.FiltersGroupName,
          groupFields: [
            PropertyPaneToggle('allowFirstLetterFilter', { label: strings.AllowFirstLetterFilter }),
            PropertyPaneToggle('allowDepartmentFilter', { label: strings.AllowDepartmentFilter }),
          ]
        }
      ]
    }]
  };
}
```

**Why `PropertyPaneToggle`:** Boolean properties map naturally to toggle switches. Site owners can show/hide columns and enable/disable filters without editing code. The default values are set in the manifest's `properties` object.

### Step 8: Update localization

The localization file grows significantly -- add string keys for all column headers, filter labels, and property pane groups:

```typescript
declare interface ILocalization {
  // ... existing from Seedling
  SearchPlaceholder: string;
  ColumnDisplayName: string;
  ColumnDepartment: string;
  ColumnJobTitle: string;
  ColumnEmail: string;
  ColumnMobilePhone: string;
  ColumnBusinessPhone: string;
  // Property pane
  ColumnsGroupName: string;
  FiltersGroupName: string;
  ShowDepartment: string;
  ShowJobTitle: string;
  ShowEmail: string;
  ShowMobilePhone: string;
  ShowBusinessPhone: string;
  AllowFirstLetterFilter: string;
  AllowDepartmentFilter: string;
  // Filters
  AllDepartments: string;
  ClearFilters: string;
  NoResultsMessage: string;
}
```

### Step 9: Declare Graph API permissions

Update `config/package-solution.json` -- Plant requires `User.Read.All` instead of Seedling's `Files.Read`:

```json
{
  "solution": {
    "webApiPermissionRequests": [
      {
        "resource": "Microsoft Graph",
        "scope": "User.Read.All"
      }
    ]
  }
}
```

**Why `User.Read.All`:** The `/users` endpoint with `$select` requires application-level read access to all user profiles. Unlike `Files.Read` (delegated, per-user), this is an organization-wide permission that must be approved by a tenant admin.

### Step 10: Add styles for filters

Extend `src/styles/App.module.scss` with styles for the alphabet bar and filter controls:

```scss
.letterBar {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.letterButton,
.letterButtonActive,
.letterButtonDisabled {
  min-width: 28px;
  height: 28px;
  border: 1px solid $ms-color-neutralTertiaryAlt;
  border-radius: 4px;
  margin: 2px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}

.letterButtonActive {
  background-color: $ms-color-themePrimary;
  color: $ms-color-white;
}

.letterButtonDisabled {
  opacity: 0.3;
  cursor: default;
}
```

**Why CSS modules for state:** Three classes (`.letterButton`, `.letterButtonActive`, `.letterButtonDisabled`) model the three states of each alphabet letter. The component selects the class based on whether the letter is selected, available, or has no matching users.

### Final: Verify your structure

```text
src/
  webparts/
    phonelist/
      PhoneListWebPart.ts               # SPFx entry point + property pane
      PhoneListWebPart.manifest.json
  components/
    PhoneList.tsx                        # Fluent UI component with filters
    index.ts
  hooks/
    useUsers.ts                          # Cache-first-then-refresh + search
    useDebounce.ts                       # Generic delay hook
    index.ts
  services/                              # NEW in Plant
    userService.ts                       # Graph API pagination
    index.ts
  cache/                                 # NEW in Plant
    userCache.ts                         # Dexie.js IndexedDB wrapper
    index.ts
  models/
    BaseWebPartProps.ts                  # 8 configurable properties
    PhoneListProps.ts                    # Component props (wraps BaseWebPartProps)
    index.ts                             # Re-exports official Graph User type
  utils/
    textUtils.ts                         # normalizeText, getFirstLetter, generateCzechAlphabet
    index.ts
  styles/
    App.module.scss                      # Alphabet bar + filter bar styles
  loc/
    mystrings.d.ts
    en-us.js
    cs-cz.js
  index.ts
```

## Getting Started

### Prerequisites

- Complete the [2-Seedling](../2-Seedling/) stage first
- Node.js **22.x** (required by SPFx 1.22.2)
- A Microsoft 365 developer tenant or SharePoint Online site
- A tenant admin to approve the `User.Read.All` Graph API permission

### Install

```bash
cd 3-Plant/app
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

> **Note:** The workbench can render the property pane and filter UI, but Graph API calls will fail without a deployed permission grant. For full testing, deploy to a real SharePoint site.

### Build & Package

```bash
npm run build
```

This compiles TypeScript, bundles the web part, and produces `sharepoint/solution/plant.sppkg`.

### Deploy

Since `skipFeatureDeployment` is `false` in `config/package-solution.json`, the app must be explicitly added to each site before use.

1. **Upload** `sharepoint/solution/plant.sppkg` to your **App Catalog**
   - **Site-level catalog:** Site Contents > Apps for SharePoint > Upload
   - **Tenant catalog:** SharePoint Admin Center > More features > Apps > App Catalog > Upload
2. **Trust** the solution when prompted (click "Deploy")
3. **Approve Graph API permissions:**
   - Go to **SharePoint Admin Center** > **API access** (under Advanced)
   - Approve the pending `User.Read.All` request for Microsoft Graph
   - This is a one-time step per tenant -- once approved, all sites can use the permission
4. **Install on the site:**
   - Go to the target site > Site Contents > + New > App > find "Plant" > Add
   - Or via PowerShell:

     ```powershell
     Connect-PnPOnline -Url https://<tenant>.sharepoint.com/sites/<site> -Interactive
     Install-PnPApp -Identity "385e5978-8ce7-4f9a-a4d3-01aee1bb1731" -Scope Site
     ```

> **Tip:** If you see "This app could not be added" in the UI, use the PowerShell command -- it returns the actual error message. A common cause is a previous version still installed on the site (uninstall it first, clear the recycle bin, then re-install).

### Use as a web part on a page

1. Navigate to any SharePoint page on the site where the app is installed
2. Click **Edit** (pencil icon top-right)
3. Click **+** to add a new section or web part
4. Search for **"Phone List"** in the web part picker
5. Click to insert it into the page, then **Republish**

### Use as a full-page app

The manifest declares `SharePointFullPage` as a supported host, so you can also use Plant as a standalone single-page application:

1. Go to **Site Contents** on the target site
2. Click **+ New** > **Page** (or use **Site Pages** library > + New > **Page**)
3. In the page template picker, choose **"Phone List"** from the Apps section (full-page apps appear there automatically)
4. The page renders only the Phone List web part, full-width, with no other content

### Use as a Teams tab

The manifest also declares `TeamsTab` as a supported host:

1. Open **Microsoft Teams** > go to the target team channel
2. Click **+** (Add a tab) at the top of the channel
3. Search for **"Phone List"** and select it
4. The web part renders inside a Teams tab with full theme support

> **When to use which:** Use the **web part** for embedding the phone list alongside other page content. Use the **full-page app** when the phone list should be the entire page. Use the **Teams tab** to bring the directory directly into a Teams channel.

### Test

- Add the web part to a SharePoint page
- Verify the user list loads and the alphabet bar appears
- Click a letter to filter users by surname initial (test CH if you have Czech users)
- Select a department from the dropdown filter
- Type in the search box and verify debounced filtering (diacritics-insensitive)
- Click **Clear filters** in the CommandBar to reset all filters
- Reload the page -- users should appear **instantly** from IndexedDB cache before the Graph refresh
- Open F12 > Application > IndexedDB > PhoneListDB to inspect the cached data
- Edit the web part properties -- toggle columns and filters on/off
- Create a full-page app page and confirm it renders without surrounding page content

Continue to [4-Tree](../4-Tree/) to add CRUD operations, PnP/JS, lookup columns, and department-based server-side security trimming.

---

[<< 2-Seedling](../2-Seedling/README.md) | [Home](../README.md) | [App Deep-Dive](app/README.md) | [Next: 4-Tree >>](../4-Tree/README.md)
