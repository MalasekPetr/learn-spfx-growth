# Plant - Phone List

A SharePoint Framework (SPFx) v1.22.2 web part that displays your organization's user directory with search, alphabet filter, department filter, configurable columns, and IndexedDB caching. Built with **React**, **TypeScript**, and the **Microsoft Graph API**.

> **Learning path:** This is step **3** in the series. It builds on [2-Seedling](../../2-Seedling/app/README.md) by introducing a **service layer**, **IndexedDB caching** via Dexie.js, **Graph API pagination**, and rich **filtering UI**. The most important shift is the new **three-layer architecture** -- Service + Cache + Hook -- that separates API calls from state management.

## What's New Since Seedling

| Concept | Seedling (step 2) | Plant (step 3) |
| --- | --- | --- |
| Graph API | Single endpoint, simple response | Pagination with `@odata.nextLink`, `$select`, `$top` |
| Typing | Custom types (`DriveItem`) | Official `@microsoft/microsoft-graph-types` (`User`) |
| Architecture | Hook calls API directly | Service layer + Cache layer + Hook |
| Caching | None | Dexie.js (IndexedDB) cache-first-then-refresh |
| Hooks | 2 custom hooks | 2 custom hooks (`useUsers`, `useDebounce`) |
| Fluent UI | DetailsList, Breadcrumb, CommandBar | DetailsList, SearchBox, Dropdown, CommandBar |
| Filtering | None | Alphabet filter (Czech CH digraph), department dropdown |
| Utilities | `formatFileSize` | `normalizeText`, `getFirstLetter`, `generateCzechAlphabet` |
| Property pane | TextField only | Toggle fields for columns and filters |
| Data | Files (read only) | Users (read, search, filter, cache) |
| New folders | -- | `src/services/`, `src/cache/` |
| New dependencies | `@microsoft/sp-http` | `@microsoft/microsoft-graph-types`, `dexie` |

## Technology Stack

| Technology | Version | Purpose |
| --- | --- | --- |
| SPFx | 1.22.2 | SharePoint Framework |
| React | 17.0.1 | UI rendering |
| TypeScript | 5.8 | Type-safe development |
| Fluent UI | 8.x | Microsoft design system |
| Microsoft Graph | v3 | User directory access |
| Dexie.js | 4.x | IndexedDB caching |
| Heft | 1.1.2 | Build toolchain |
| Node.js | 22.x | Runtime |

## Project Structure

```text
app/
├── config/
│   ├── config.json
│   ├── package-solution.json        # Includes Graph API permission request
│   ├── serve.json
│   └── ...
├── src/
│   ├── webparts/
│   │   └── phonelist/
│   │       ├── PhoneListWebPart.ts              # Web part entry point + Graph client init
│   │       └── PhoneListWebPart.manifest.json
│   ├── components/
│   │   ├── PhoneList.tsx             # Main component (filters, list, search)
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useUsers.ts                # Cache-first-then-refresh + search filtering
│   │   ├── useDebounce.ts             # Generic debounce hook
│   │   └── index.ts
│   ├── services/                      # NEW - API service layer
│   │   ├── userService.ts              # Graph API pagination factory
│   │   └── index.ts
│   ├── cache/                         # NEW - IndexedDB cache layer
│   │   ├── userCache.ts                # Dexie single-table cache
│   │   └── index.ts
│   ├── models/
│   │   ├── PhoneListProps.ts          # Component props (includes Graph client)
│   │   ├── BaseWebPartProps.ts        # Web part properties (columns + filter toggles)
│   │   └── index.ts                   # Re-exports User from @microsoft/microsoft-graph-types
│   ├── utils/
│   │   ├── textUtils.ts               # normalizeText, getFirstLetter, generateCzechAlphabet
│   │   └── index.ts
│   ├── styles/
│   │   └── App.module.scss            # Letter bar, filter bar, search box styles
│   ├── loc/
│   │   ├── en-us.js                   # English strings
│   │   ├── cs-cz.js                   # Czech strings
│   │   └── mystrings.d.ts            # Localization type definitions
│   └── index.ts
├── package.json
└── tsconfig.json
```

## Architecture Overview

Plant introduces two new layers compared to Seedling -- a **service layer** that encapsulates Graph API calls with pagination, and a **cache layer** that provides instant data loading via IndexedDB:

```text
PhoneListWebPart.ts  (SPFx lifecycle, Graph client init, theme)
      │
      │  passes MSGraphClientV3 + webPartProps
      ▼
PhoneList.tsx  (React component, filters + search + list)
      │
      │  delegates data logic to
      ▼
useUsers              (Hook: cache-first, search filter, exposes allUsers)
      │
      ├── userService   (Service: Graph API /users with pagination)
      │
      └── userCache     (Cache: Dexie IndexedDB single table)
```

### Layer Responsibilities

**`webparts/phonelist/PhoneListWebPart.ts`** - The SPFx entry point. Handles:

- Creating the `MSGraphClientV3` via `msGraphClientFactory`
- Passing the Graph client, `webPartProps`, and `isDarkTheme` to the React component
- Theme change handling (light/dark mode)
- Property pane configuration with three groups: General, Visible Columns, Filters

**`services/userService.ts`** - A factory function that encapsulates Graph API pagination. Accepts a Graph client, returns an object with `getAll()`. This separates API logic from React hooks.

**`cache/userCache.ts`** - A single Dexie database with a `users` table. Provides `getAll()`, `putAll()`, and `clear()`. The hook checks cache first, then fetches fresh data from the service.

**`hooks/useUsers.ts`** - Orchestrates the service and cache with cache-first-then-refresh. Applies search text filtering client-side. Exposes both `users` (filtered) and `allUsers` (unfiltered) for filter population.

**`components/PhoneList.tsx`** - The UI layer. Receives data from the hook and renders the alphabet bar, department dropdown, search box, and data table. All filtering is done in a single pass via `useMemo`.

## Key Concepts Explained

### 1. Three-Layer Architecture: Service + Cache + Hook

This is the **most important architectural change** from Seedling to Plant. In Seedling, the hook calls the API directly. In Plant, the data flow is separated into three focused layers:

**Seedling approach -- hook does everything:**

```typescript
// Seedling: useOneDrive.ts — hook calls Graph API directly
const fetchItems = useCallback(async (folderId: string): Promise<void> => {
  const response = await graphClient.api(endpoint).select('...').get();
  setItems(response.value);
}, [graphClient]);
```

**Plant approach -- three layers with clear responsibilities:**

```typescript
// 1. Service: just API calls, no React state
export const createUserService = (graphClient: MSGraphClientV3) => ({
  async getAll(): Promise<User[]> {
    // Graph pagination logic here
  }
});

// 2. Cache: just storage, no API calls
export const userCache = {
  async getAll(): Promise<User[]> { return db.users.toArray(); },
  async putAll(users: User[]): Promise<void> { /* ... */ }
};

// 3. Hook: orchestrates service + cache, manages React state
export const useUsers = (graphClient, searchText) => {
  const service = useMemo(() => createUserService(graphClient), [graphClient]);
  // Load cache → show instantly → fetch fresh → update cache + state
};
```

**Why three layers?**

| Layer | Concern | Testable independently? |
| --- | --- | --- |
| Service | API calls + response shaping | Yes -- mock the Graph client |
| Cache | IndexedDB read/write | Yes -- Dexie can use in-memory storage |
| Hook | State management + orchestration | Yes -- mock service + cache |

This architecture is reused in [4-Tree](../../4-Tree/app/README.md) with two services and two cache tables, demonstrating how the pattern scales to CRUD operations.

### 2. Graph API Pagination

Unlike Seedling's single Graph call, Plant must fetch **all users** from an organization that may have thousands. The Graph API returns results in pages of up to 100, with a `@odata.nextLink` URL for the next page:

```typescript
// services/userService.ts
async getAll(): Promise<User[]> {
  const collected: User[] = [];

  // First page: specify $select and $top
  const response: GraphResponse<User> = await graphClient
    .api('/users')
    .select(SELECT_FIELDS)
    .top(100)
    .get();

  collected.push(...response.value);
  let nextLink = response['@odata.nextLink'];

  // Follow continuation tokens until all pages are fetched
  while (nextLink) {
    const nextResponse: GraphResponse<User> = await graphClient
      .api(nextLink)
      .get();
    collected.push(...nextResponse.value);
    nextLink = nextResponse['@odata.nextLink'];
  }

  return collected;
}
```

**Key points:**

- `$select` limits the fields returned (reduces payload size)
- `$top(100)` sets the page size (100 is the maximum for `/users`)
- The `nextLink` URL contains all query parameters -- just call `.api(nextLink).get()`
- The `GraphResponse<T>` type models both the `value` array and the optional `@odata.nextLink`

### 3. Cache-First-Then-Refresh (Dexie.js)

Dexie.js wraps the browser's IndexedDB in a promise-based API. The caching strategy provides **instant loading** from stored data, then silently refreshes with fresh data from the Graph API:

```typescript
// hooks/useUsers.ts — fetchAllUsers()
try {
  // Step 1: Load from cache instantly
  const cached = await userCache.getAll();
  if (cached.length > 0) {
    setAllUsers(cached);       // Show cached data immediately
    setLoading(false);         // Remove spinner
  }

  // Step 2: Fetch fresh data from Graph API
  const fresh = await service.getAll();
  await userCache.putAll(fresh);  // Update cache for next visit
  setAllUsers(fresh);             // Replace with fresh data
} catch (err) {
  setError(err instanceof Error ? err.message : String(err));
} finally {
  setLoading(false);
}
```

**The Dexie database definition:**

```typescript
// cache/userCache.ts
class UserDatabase extends Dexie {
  users!: Table<User, string>;  // Table<RowType, PrimaryKeyType>

  constructor() {
    super('PhoneListDB');       // IndexedDB database name
    this.version(1).stores({
      users: 'userPrincipalName, displayName, surname, department'
      //      ↑ primary key        ↑ secondary indexes (for queries)
    });
  }
}
```

**Compared to Tree's cache:** Plant has one table with a string primary key (`userPrincipalName`). Tree has two tables with numeric primary keys (`Id`) and adds write-through operations. Understanding Plant's simpler read-only cache makes Tree's CRUD cache easier to grasp.

### 4. Czech Alphabet Filter

The alphabet bar displays clickable letter buttons that filter users by surname initial. It handles the Czech **CH digraph** -- a single letter in the Czech alphabet that sorts between H and I:

```typescript
// utils/textUtils.ts

// Extract the first "letter" from a surname (CH counts as one letter)
export function getFirstLetter(surname: string): string {
  if (!surname) return '';
  const upper = normalizeText(surname).toUpperCase();
  if (upper.startsWith('CH')) return 'CH';  // Czech digraph
  return upper.substring(0, 1);
}

// Generate the full Czech alphabet: A, B, C, ... H, CH, I, ... Z
export function generateCzechAlphabet(): string[] {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  letters.push('CH');
  return letters.sort((a, b) => {
    // CH sorts between H and I in Czech
    if (a === 'CH' && b === 'I') return -1;
    if (a === 'I' && b === 'CH') return 1;
    return a.localeCompare(b, 'cs');
  });
}
```

**The letter bar UI has three visual states:**

```typescript
// components/PhoneList.tsx
{alphabet.map((letter) => {
  const isActive = firstLetterFilter === letter;     // currently selected
  const isAvailable = availableLetters.has(letter);   // has matching users
  const className = isActive
    ? styles.letterButtonActive      // blue background
    : isAvailable
      ? styles.letterButton          // normal, clickable
      : styles.letterButtonDisabled; // greyed out, no matching users
  return (
    <button type="button" key={letter} className={className}
      onClick={() => isAvailable || isActive ? onLetterClick(letter) : undefined}>
      {letter}
    </button>
  );
})}
```

The `availableLetters` set is computed from `allUsers` (not filtered users), so the alphabet bar always reflects the full dataset regardless of other active filters.

### 5. Diacritics-Aware Search

Czech and Slovak names contain diacritical marks (Malášek, Dvořák, Říha). The search must match regardless of accents:

```typescript
// utils/textUtils.ts
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')                    // Decompose: á → a + combining accent
    .replace(/[\u0300-\u036f]/g, '')     // Strip combining accents
    .toLowerCase();
}
```

This means searching "malasek" finds "Malášek", and "dvorak" finds "Dvořák". The normalization is applied to both the search text and each user field:

```typescript
// hooks/useUsers.ts
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
```

### 6. Debounced Search

Fast typing triggers a filter recalculation on every keystroke. The `useDebounce` hook delays the actual filtering until the user pauses:

```typescript
// hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);  // Cancel on new keystroke
  }, [value, delay]);

  return debouncedValue;
}
```

Usage in the component:

```typescript
// components/PhoneList.tsx
const [searchText, setSearchText] = useState<string>('');
const debouncedSearch = useDebounce(searchText, 300);      // 300ms delay
const { users, allUsers, loading, error, refresh } = useUsers(graphClient, debouncedSearch);
```

The `SearchBox` updates `searchText` immediately (responsive typing), but `useUsers` only receives the debounced value (efficient filtering).

### 7. Single-Pass Filtering

All filters (department, first letter, search text) are applied in a single pass through the data array. The hook handles search filtering, while the component handles alphabet and department filtering via `useMemo`:

```typescript
// components/PhoneList.tsx
const filteredUsers = React.useMemo(() => {
  return users.filter((u) => {
    // Filter 1: Department match
    if (departmentFilter && u.department !== departmentFilter) return false;
    // Filter 2: First letter match
    if (firstLetterFilter && getFirstLetter(u.surname || '') !== firstLetterFilter) return false;
    // Filter 3: Search text (already applied by useUsers hook)
    return true;
  });
}, [users, departmentFilter, firstLetterFilter]);
```

The department dropdown options are computed from `allUsers` (unfiltered) so all departments always appear:

```typescript
const departmentOptions = React.useMemo((): IDropdownOption[] => {
  const departments = [...new Set(
    allUsers.map((u) => u.department).filter((d): d is string => !!d)
  )].sort((a, b) => a.localeCompare(b, 'cs'));

  return [
    { key: '', text: strings.AllDepartments },
    ...departments.map((d) => ({ key: d, text: d }))
  ];
}, [allUsers]);
```

### 8. Official Graph Typings

Instead of defining custom types like Seedling's `DriveItem`, Plant uses the official `@microsoft/microsoft-graph-types` package and re-exports its `User` interface:

```typescript
// models/index.ts
export type { BaseWebPartProps } from './BaseWebPartProps';
export type { PhoneListProps } from './PhoneListProps';
export type { User } from '@microsoft/microsoft-graph-types';
```

This means `User` provides full IntelliSense for all Microsoft Graph user properties (`displayName`, `department`, `businessPhones`, etc.) without maintaining custom type definitions.

### 9. Configurable Property Pane

The web part property pane uses three groups to let site owners customize the display:

```typescript
// PhoneListWebPart.ts — getPropertyPaneConfiguration()
groups: [
  { groupName: 'General',         groupFields: [PropertyPaneTextField('description', ...)] },
  { groupName: 'Visible Columns', groupFields: [
    PropertyPaneToggle('showDepartment', ...),
    PropertyPaneToggle('showJobTitle', ...),
    PropertyPaneToggle('showEmail', ...),
    PropertyPaneToggle('showMobilePhone', ...),
    PropertyPaneToggle('showBusinessPhone', ...)
  ]},
  { groupName: 'Filters', groupFields: [
    PropertyPaneToggle('allowFirstLetterFilter', ...),
    PropertyPaneToggle('allowDepartmentFilter', ...)
  ]}
]
```

The column toggles dynamically control which `IColumn[]` entries appear in the DetailsList. The filter toggles show/hide the alphabet bar and department dropdown.

## Consistent Patterns Across All Stages

| Pattern | Seed | Seedling | Plant | Tree |
| --- | --- | --- | --- | --- |
| Web part props | `BaseWebPartProps` | `BaseWebPartProps` | `BaseWebPartProps` | `BaseWebPartProps` |
| Component props | `AppProps { webPartProps }` | `OneDriveExplorerProps { webPartProps }` | `PhoneListProps { webPartProps }` | `AssetDeploymentProps { webPartProps }` |
| Theme handling | `onThemeChanged` + CSS vars | Same | Same | Same |
| Barrel exports | `index.ts` per folder | Same | Same | Same |
| Localization | `loc/` with `.d.ts` + locale `.js` | Same | Same | Same |

## Getting Started

### Prerequisites

- Node.js **22.x** (required by SPFx 1.22.2)
- A Microsoft 365 developer tenant or SharePoint Online site
- **Tenant admin approval** for the `User.Read.All` Graph API permission

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

This produces `sharepoint/solution/plant.sppkg` which can be uploaded to your SharePoint App Catalog.

After uploading, a tenant admin must approve the `User.Read.All` permission request in the **SharePoint admin center > API access** page.

### Other Commands

```bash
# Clean build artifacts
npm run clean

# Eject webpack config for advanced customization
npm run eject-webpack
```

## License

MIT
