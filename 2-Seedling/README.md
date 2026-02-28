# 2-Seedling

Step 2 of the SPFx Learning Ladder -- **My Files Explorer**.

A web part that lets users browse their OneDrive files and folders using Microsoft Graph API.

## What's New (compared to 1-Seed)

| Concept | What you'll learn |
| ------- | ----------------- |
| **Graph API** | Initialize `MSGraphClientV3` in the web part, call `/me/drive/root/children` and `/me/drive/items/{id}/children` |
| **OneDrive** | Browse folders, navigate into subfolders, open files in a new tab |
| **React Hooks** | `useState`, `useEffect`, `useCallback`, and custom hooks (`useOneDrive`, `useBreadcrumb`) |
| **Fluent UI** | `DetailsList`, `Breadcrumb`, `CommandBar`, `Spinner`, `Stack`, `MessageBar`, `Icon` |
| **Utils** | Extracted utility functions in `src/utils/` with barrel export |

### New Folders

- `src/hooks/` -- custom React hooks for data fetching and navigation state
- `src/utils/` -- reusable utility functions (`formatFileSize`)

## Key Files to Study

- `src/hooks/useOneDrive.ts` -- custom hook encapsulating all Graph calls and navigation state
- `src/hooks/useBreadcrumb.ts` -- breadcrumb navigation state management
- `src/components/OneDriveExplorer.tsx` -- React component composing Fluent UI components
- `src/webparts/oneDriveExplorer/OneDriveExplorerWebPart.ts` -- Graph client initialization in `onInit()`
- `src/models/DriveItem.ts` -- type definition matching Graph API response shape
- `src/utils/formatUtils.ts` -- file size formatting utility

## Getting Started

```bash
cd 2-Seedling/app
npm install
npm start
```

## Graph API Permissions

After deploying the `.sppkg` package, a SharePoint admin must approve the `Files.Read` permission:

1. Go to **SharePoint Admin Center** > **API access**
2. Approve the pending `Files.Read` request for Microsoft Graph

Without this approval, the web part will show a permission error.

## Prerequisites

- Complete the [1-Seed](../1-Seed/) stage first
- A Microsoft 365 tenant with OneDrive enabled

## Next Step

Continue to [3-Plant](../3-Plant/) to add Graph pagination, debounced search, and property pane configuration.
