param(
    [Parameter(Mandatory=$true)]
    [string]$SiteUrl
)

# Connect to SharePoint
Connect-PnPOnline `
    -Url $SiteUrl `
    -Interactive

# --- Assets list (master catalog) ---
New-PnPList -Title "Assets" -Template GenericList

Add-PnPField -List "Assets" -DisplayName "Description" -InternalName "Description" -Type Note -AddToDefaultView
Add-PnPField -List "Assets" -DisplayName "Category" -InternalName "Category" -Type Choice `
    -Choices "Laptop","Monitor","Phone","Printer","Accessory","Other" `
    -DefaultValue "Other" -AddToDefaultView
Add-PnPField -List "Assets" -DisplayName "SerialNumber" -InternalName "SerialNumber" -Type Text -AddToDefaultView
Add-PnPField -List "Assets" -DisplayName "Status" -InternalName "Status" -Type Choice `
    -Choices "Available","Deployed","Maintenance","Retired" `
    -DefaultValue "Available" -AddToDefaultView

# --- Deployments list (assignments) ---
New-PnPList -Title "Deployments" -Template GenericList

Add-PnPField -List "Deployments" -DisplayName "DeployedTo" -InternalName "DeployedTo" -Type Text -AddToDefaultView
Add-PnPField -List "Deployments" -DisplayName "Department" -InternalName "Department" -Type Text -AddToDefaultView
Add-PnPField -List "Deployments" -DisplayName "DeployedDate" -InternalName "DeployedDate" -Type DateTime -AddToDefaultView
Add-PnPField -List "Deployments" -DisplayName "ReturnDate" -InternalName "ReturnDate" -Type DateTime -AddToDefaultView
Add-PnPField -List "Deployments" -DisplayName "Notes" -InternalName "Notes" -Type Note -AddToDefaultView

# Lookup column: Asset -> Assets list
$assetsList = Get-PnPList -Identity "Assets"
Add-PnPField -List "Deployments" -DisplayName "Asset" -InternalName "Asset" `
    -Type Lookup -AddToDefaultView `
    -AdditionalAttributes @{
        List = $assetsList.Id.ToString()
        ShowField = "Title"
    }

# Disconnect
Disconnect-PnPOnline
