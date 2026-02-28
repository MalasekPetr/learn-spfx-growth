# 4-Tree

Step 4 of the SPFx Learning Ladder -- **Assets Deployment**.

A web part that manages IT assets and their deployments using two SharePoint lists linked by a lookup column, with full CRUD operations and department-based server-side security trimming.

## What's New (compared to 3-Plant)

| Concept | Plant | Tree (new) |
| ------- | ----- | ---------- |
| Data source | MS Graph API (`MSGraphClientV3`) | SharePoint lists via PnP/JS v4 (`SPFI`) |
| Typing | Official `@microsoft/microsoft-graph-types` | Custom types against SharePoint list columns |
| Operations | Read-only | Full CRUD (Create, Read, Update, Delete) |
| Lists | N/A (Graph endpoint) | Two lists linked by lookup column |
| Caching | Dexie.js single table (read-only) | Dexie.js multi-table (read + write-through) |
| Architecture | Service + Cache + Hook | Same pattern, extended with CRUD |
| Components | Single component | Pivot tabs, list views, form panels, badges |
| Security | All users see all data | Department-based server-side OData filtering |
| Property pane | Toggle fields for columns and filters | TextField for list names |
| New folders | `services/`, `cache/` | -- (same folders, extended) |

## Key Files to Study

| File | Purpose |
| ---- | ------- |
| `src/services/deploymentService.ts` | Lookup expand, OData filter, flat mapping of expanded objects |
| `src/services/assetService.ts` | Standard PnP/JS CRUD factory pattern |
| `src/cache/appCache.ts` | Single Dexie DB with two tables, filtered cache reads |
| `src/hooks/useDeployments.ts` | Cache-first-then-refresh with department parameter |
| `src/hooks/useAssets.ts` | Cache-first-then-refresh pattern |
| `src/components/DeploymentForm.tsx` | Lookup dropdown (display Title, submit Id) |
| `src/components/AssetDeployment.tsx` | Pivot tabs wiring two list components |
| `src/webparts/assetDeployment/AssetDeploymentWebPart.ts` | PnP/JS init + user department fetched in `onInit()` |

See [app/README.md](app/README.md) for detailed architecture explanations and code walkthroughs.

## SharePoint Lists

**Assets** (master catalog): Title, Description, Category (Choice), SerialNumber, Status (Choice)

**Deployments** (assignments): Title, Asset (Lookup -> Assets), DeployedTo, Department, DeployedDate, ReturnDate, Notes

## Getting Started

### Prerequisites

- Complete the [3-Plant](../3-Plant/) stage first
- Node.js **22.x** (required by SPFx 1.22.2)
- A SharePoint Online site where you can create lists
- PnP PowerShell module (for list provisioning)

### Provision SharePoint Lists

Run the PnP PowerShell script to create the required SharePoint lists:

```powershell
.\scripts\pnp.ps1 -SiteUrl https://yourtenant.sharepoint.com/sites/your-site
```

This creates the "Assets" and "Deployments" lists with all columns, including the lookup column linking Deployments to Assets.

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

### Build & Package

```bash
npm run build
```

This compiles TypeScript, bundles the web part, and produces `sharepoint/solution/tree.sppkg`.

### Deploy

1. Upload `tree.sppkg` to your **SharePoint App Catalog** (tenant or site-level)
2. Trust the solution when prompted
3. Add the web part to a SharePoint page on the site where you provisioned the lists
4. Edit the web part properties to confirm the list names match ("Assets" and "Deployments")

### Test

- Add the web part to a SharePoint page
- Switch between Assets and Deployments tabs
- Create a new asset, then create a deployment linked to that asset via the lookup dropdown
- Edit an existing record and verify changes persist
- Delete a record and confirm the dialog prompt
- Reload the page -- data should appear instantly from IndexedDB cache before the SharePoint refresh
- Verify department-based filtering shows only deployments matching your department
