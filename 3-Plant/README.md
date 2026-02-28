# 3-Plant

Step 3 of the SPFx Learning Ladder -- **Phone List**.

A web part that displays your organization's user directory with search and configurable columns.

## What's New (compared to 2-Seedling)

| Concept | Seedling | Plant (new) |
| ------- | -------- | ----------- |
| Graph API | Single endpoint, simple response | Pagination with `@odata.nextLink`, `$select` |
| Typing | Custom types (`DriveItem`) | Official `@microsoft/microsoft-graph-types` (`User`) |
| Hooks | 2 custom hooks | 2 custom hooks (`useUsers`, `useDebounce`) |
| Fluent UI | DetailsList, Breadcrumb, CommandBar | DetailsList, SearchBox, PropertyPaneToggle |
| Utilities | `formatFileSize` | `normalizeText` for diacritics-aware search |
| Property pane | TextField only | Toggle fields for column visibility |
| Data | Files (read only) | Users (read, search, filter) |

### New Patterns

- **Official Graph typings** -- `@microsoft/microsoft-graph-types` provides the `User` interface, re-exported from `models/index.ts`
- **Graph API pagination** -- fetches all users using `@odata.nextLink` continuation tokens
- **Debounced search** -- `useDebounce` hook prevents excessive filtering during fast typing
- **Diacritics normalization** -- `normalizeText()` utility strips accents for Czech/Slovak search (e.g. "Malasek" matches "Malášek")
- **Configurable columns** -- property pane toggles control which columns appear in the list

## Key Files to Study

- `src/hooks/useUsers.ts` -- Graph pagination, search filtering with diacritics normalization
- `src/hooks/useDebounce.ts` -- generic debounce hook
- `src/components/PhoneList.tsx` -- configurable column rendering with Fluent UI DetailsList
- `src/utils/textUtils.ts` -- `normalizeText` utility for accent-insensitive search
- `src/models/index.ts` -- re-exports `User` from `@microsoft/microsoft-graph-types`

## Getting Started

```bash
cd 3-Plant/app
npm install
npm start
```

## Graph API Permissions

After deploying the `.sppkg` package, a SharePoint admin must approve the `User.Read.All` permission:

1. Go to **SharePoint Admin Center** > **API access**
2. Approve the pending `User.Read.All` request for Microsoft Graph

## Prerequisites

- Complete the [2-Seedling](../2-Seedling/) stage first
- A Microsoft 365 tenant with users in Azure AD

## Next Step

Continue to [4-Tree](../4-Tree/) to add CRUD operations, lookup columns, department-based security trimming, and IndexedDB caching.
