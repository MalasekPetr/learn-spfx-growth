param(
    [Parameter(Mandatory=$true)]
    [string]$SiteUrl
)

# Connect to SharePoint
Connect-PnPOnline `
    -Url $SiteUrl `
    -Interactive

# Create the Helpdesk Tickets list
New-PnPList -Title "Helpdesk Tickets" -Template GenericList

# Add custom columns
Add-PnPField -List "Helpdesk Tickets" -DisplayName "Description" -InternalName "Description" -Type Note -AddToDefaultView
Add-PnPField -List "Helpdesk Tickets" -DisplayName "Status" -InternalName "Status" -Type Choice -Choices "New","In Progress","Resolved","Closed" -DefaultValue "New" -AddToDefaultView
Add-PnPField -List "Helpdesk Tickets" -DisplayName "Priority" -InternalName "Priority" -Type Choice -Choices "Low","Medium","High","Critical" -DefaultValue "Medium" -AddToDefaultView
Add-PnPField -List "Helpdesk Tickets" -DisplayName "Category" -InternalName "Category" -Type Choice -Choices "Hardware","Software","Network","Other" -DefaultValue "Other" -AddToDefaultView
Add-PnPField -List "Helpdesk Tickets" -DisplayName "AssignedTo" -InternalName "AssignedTo" -Type Text -AddToDefaultView

# Disconnect
Disconnect-PnPOnline
