Connect-PnPOnline `
    -Url https://ms365proj102-admin.sharepoint.com/ `
    -ClientId 9f000187-3054-47bf-a5aa-9e6effcfa4d8 

Add-PnPSiteCollectionAppCatalog `
    -Site https://ms365proj102.sharepoint.com/sites/Seed

Disconnect-PnPOnline