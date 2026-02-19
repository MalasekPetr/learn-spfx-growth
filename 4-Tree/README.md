# 4-Tree

Step 4 of the SPFx Learning Ladder. A **Helpdesk Tickets** web part with full CRUD operations, IndexedDB caching, and a Kendo React Grid.

## What's New (compared to 3-Plant)

| Concept | Plant | Tree (new) |
| ------- | ----- | ---------- |
| Data source | MS Graph API (`MSGraphClientV3`) | SharePoint List via PnP/JS v4 (`SPFI`) |
| Operations | Read-only | Full CRUD (Create, Read, Update, Delete) |
| Data grid | Fluent UI `DetailsList` | Kendo React `Grid` with sorting |
| Caching | None | Dexie.js (IndexedDB) cache-first pattern |
| Architecture | Hook calls API directly | Service layer + Cache layer + Hook |
| Components | Single (`My.tsx`) | Multiple (grid + form panel + custom cells) |
| Property pane | Toggle fields for columns | TextField for list name |
| Custom rendering | Basic fieldName binding | Status/priority color badges, command column |
| New folders | `utils/` | `services/`, `cache/` |

### New Patterns

- **PnP/JS v4** -- `spfi().using(SPFx(this.context))` for SharePoint list CRUD via `@pnp/sp`
- **Dexie.js** -- IndexedDB wrapper for cache-first-then-refresh data loading
- **Kendo React Grid** -- third-party data grid with sorting and custom cell renderers
- **Service layer** -- `src/services/` separates API operations from hooks
- **Cache layer** -- `src/cache/` provides IndexedDB storage via Dexie
- **CRUD operations** -- create, update, delete tickets with write-through caching
- **Multiple components** -- `TicketForm` panel, `StatusCell`, `PriorityCell` renderers
- **Fluent UI Dialog** -- confirmation dialog for delete operations

## Prerequisites

- Complete the [3-Plant](../3-Plant/) stage first
- A SharePoint site with the "Helpdesk Tickets" list (see provisioning below)

## Getting Started

```bash
cd 4-Tree/app
npm install
npm start
```

## List Provisioning

Run the PnP PowerShell script to create the required SharePoint list:

```powershell
.\scripts\pnp.ps1 -SiteUrl https://yourtenant.sharepoint.com/sites/your-site
```

This creates a "Helpdesk Tickets" list with columns: Title, Description, Status, Priority, Category, AssignedTo.
