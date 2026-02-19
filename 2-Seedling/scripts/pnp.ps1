Connect-PnPOnline `
    -Url https://cloudedueu-admin.sharepoint.com/ `
    -ClientId [pick App registration ID from Entra Id] 

Add-PnPSiteCollectionAppCatalog `
    -Site https://cloudedueu.sharepoint.com/sites/app-dev-01

Disconnect-PnPOnline