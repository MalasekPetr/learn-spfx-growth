# 3-Plant

Step 3 of the SPFx Learning Ladder. A **Phone List** web part that displays your organization's user directory with search and configurable columns.

## What's New (compared to 2-Seedling)

| Concept | Seedling | Plant (new) |
| ------- | -------- | ----------- |
| Graph API | Single endpoint, simple response | Pagination with `@odata.nextLink`, `$select` |
| Hooks | 1 custom hook | 2 custom hooks (`useUsers`, `useDebounce`) |
| Fluent UI | DetailsList, Breadcrumb, CommandBar | DetailsList, SearchBox, PropertyPaneToggle |
| Utilities | -- | `utils/` folder with `normalizeText` |
| Property pane | TextField only | Toggle fields for column visibility |
| Data | Files (read only) | Users (read, search, filter) |

### New Patterns

- **Graph API pagination** -- fetches all users using `@odata.nextLink` continuation tokens
- **Debounced search** -- `useDebounce` hook prevents excessive filtering during fast typing
- **Diacritics normalization** -- `normalizeText()` utility strips accents for Czech/Slovak search (e.g. "Malášek" matches "malasek")
- **Configurable columns** -- property pane toggles control which columns appear in the list
- **Utility functions** -- new `src/utils/` barrel-exported folder for reusable helpers

## Prerequisites

- Complete the [2-Seedling](../2-Seedling/) stage first
- API permission: **User.Read.All** (Microsoft Graph)

## Getting Started

```bash
cd 3-Plant/app
npm install
npm start
```

After deploying the `.sppkg` package, approve the `User.Read.All` permission in SharePoint Admin Center > API Access.
