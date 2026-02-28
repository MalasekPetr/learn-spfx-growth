# 4-Tree

Step 4 of the SPFx Learning Ladder -- **Assets Deployment**.

A web part that manages IT assets and their deployments using two SharePoint lists linked by a lookup column, with department-based server-side security trimming.

## What's New (compared to 3-Plant)

| Concept | Plant | Tree (new) |
| ------- | ----- | ---------- |
| Data source | MS Graph API (`MSGraphClientV3`) | SharePoint List via PnP/JS v4 (`SPFI`) |
| Typing | Official `@microsoft/microsoft-graph-types` | Custom types against SharePoint lists |
| Operations | Read-only | Full CRUD (Create, Read, Update, Delete) |
| Lists | N/A (Graph endpoint) | Two lists linked by lookup column |
| Caching | None | Dexie.js (IndexedDB) cache-first pattern |
| Architecture | Hook calls API directly | Service layer + Cache layer + Hook |
| Components | Single (`PhoneList.tsx`) | Pivot tabs, list views, form panels, badges |
| Security | All users see all data | Department-based server-side OData filtering |
| Property pane | Toggle fields for columns | TextField for list names |
| New folders | -- | `services/`, `cache/` |

### New Patterns

- **PnP/JS v4** -- `spfi().using(SPFx(this.context))` for SharePoint list CRUD via `@pnp/sp`
- **Lookup columns** -- `$select` + `$expand` for reading (`Asset/Title`), ID-only (`AssetId`) for writing
- **Server-side OData filtering** -- `$filter=Department eq 'IT'` for department-based security trimming
- **User Profile Service** -- `sp.profiles.myProperties()` to fetch the current user's department
- **Dexie.js** -- IndexedDB wrapper with a single database and two tables (`assets`, `deployments`)
- **Service layer** -- `src/services/` separates API operations from hooks
- **Cache layer** -- `src/cache/` provides IndexedDB storage via Dexie
- **CRUD operations** -- create, update, delete with write-through caching
- **Fluent UI Pivot** -- tab-based navigation within a single web part
- **Fluent UI Dialog** -- confirmation dialog for delete operations
- **Fluent UI Panel** -- slide-out forms for creating/editing records

## Key Files to Study

- `src/services/deploymentService.ts` -- lookup expand, OData filter, flat mapping of expanded objects
- `src/services/assetService.ts` -- standard PnP/JS CRUD factory pattern
- `src/cache/appCache.ts` -- single Dexie DB with two tables, filtered cache reads
- `src/hooks/useDeployments.ts` -- cache-first-then-refresh with department parameter
- `src/hooks/useAssets.ts` -- cache-first-then-refresh pattern
- `src/components/DeploymentForm.tsx` -- lookup dropdown (display Title, submit Id)
- `src/components/AssetDeployment.tsx` -- Pivot tabs wiring two list components
- `src/webparts/assetDeployment/AssetDeploymentWebPart.ts` -- user department fetched in `onInit()`

## SharePoint Lists

**Assets** (master catalog): Title, Description, Category (Choice), SerialNumber, Status (Choice)

**Deployments** (assignments): Title, Asset (Lookup -> Assets), DeployedTo, Department, DeployedDate, ReturnDate, Notes

## Getting Started

```bash
cd 4-Tree/app
npm install
npm start
```

## List Provisioning

Run the PnP PowerShell script to create the required SharePoint lists:

```powershell
.\scripts\pnp.ps1 -SiteUrl https://yourtenant.sharepoint.com/sites/your-site
```

This creates the "Assets" and "Deployments" lists with all columns, including the lookup column linking Deployments to Assets.

## Prerequisites

- Complete the [3-Plant](../3-Plant/) stage first
- A SharePoint site where you can create lists (see provisioning above)
