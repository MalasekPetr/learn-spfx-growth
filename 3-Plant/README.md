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

### Build & Package

```bash
npm run build
```

This compiles TypeScript, bundles the web part, and produces `sharepoint/solution/plant.sppkg`.

### Deploy

1. Upload `plant.sppkg` to your **SharePoint App Catalog** (tenant or site-level)
2. Trust the solution when prompted
3. A tenant admin must approve the `User.Read.All` permission in **SharePoint admin center > API access**
4. Add the web part to any SharePoint page

### Test

- Add the web part to a SharePoint page
- Verify the user list loads and the alphabet bar appears
- Click a letter to filter users by surname initial
- Select a department from the dropdown filter
- Type in the search box and verify debounced filtering
- Reload the page -- users should appear instantly from IndexedDB cache before the Graph refresh
- Edit the web part properties -- toggle columns and filters on/off

## Next Step

Continue to [4-Tree](../4-Tree/) to add CRUD operations, PnP/JS, lookup columns, and department-based server-side security trimming.
