# 2-Seedling

Step 2 of the SPFx Learning Ladder -- **OneDrive Explorer**.

A web part that lets users browse their OneDrive files and folders using Microsoft Graph API, custom React hooks, and Fluent UI components.

## What's New (compared to 1-Seed)

| Concept | Seed | Seedling (new) |
| ------- | ---- | -------------- |
| Data source | None (static props) | Microsoft Graph API (`MSGraphClientV3`) |
| Context handover | WebPart pushes data as props | WebPart passes capability (Graph client), hooks pull data |
| React patterns | Stateless component | Hook composition (`useOneDrive` + `useBreadcrumb`) |
| UI components | Plain HTML | Fluent UI DetailsList, Breadcrumb, CommandBar, Spinner |
| Models | 2 types (props only) | 5 types (props + API response + navigation models) |
| New folders | -- | `src/hooks/`, `src/utils/` |
| Permissions | None | `Files.Read` (Graph API) |

## Key Files to Study

| File | Purpose |
| ---- | ------- |
| `src/hooks/useOneDrive.ts` | Custom hook composing `useBreadcrumb` + Graph API calls |
| `src/hooks/useBreadcrumb.ts` | Generic breadcrumb navigation state |
| `src/components/OneDriveExplorer.tsx` | React component with Fluent UI layout |
| `src/webparts/oneDriveExplorer/OneDriveExplorerWebPart.ts` | Graph client initialization in `onInit()` |
| `src/models/DriveItem.ts` | Type definition matching Graph API response shape |
| `src/utils/formatUtils.ts` | File size formatting utility |

See [app/README.md](app/README.md) for detailed architecture explanations and code walkthroughs.

## Getting Started

### Prerequisites

- Complete the [1-Seed](../1-Seed/) stage first
- Node.js **22.x** (required by SPFx 1.22.2)
- A Microsoft 365 developer tenant or SharePoint Online site
- A tenant admin to approve the `Files.Read` Graph API permission

### Install

```bash
cd 2-Seedling/app
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

This compiles TypeScript, bundles the web part, and produces `sharepoint/solution/seedling.sppkg`.

### Deploy

1. Upload `seedling.sppkg` to your **SharePoint App Catalog** (tenant or site-level)
2. Trust the solution when prompted
3. A tenant admin must approve the `Files.Read` permission in **SharePoint admin center > API access**
4. Add the web part to any SharePoint page

### Test

- Add the web part to a SharePoint page (workbench won't work without Graph permissions)
- Verify your OneDrive root folder contents appear
- Click a folder to navigate into it
- Verify the breadcrumb updates and allows navigating back
- Click the Refresh button in the CommandBar

## Next Step

Continue to [3-Plant](../3-Plant/) to add Graph pagination, service layer, Dexie caching, and rich filtering.
