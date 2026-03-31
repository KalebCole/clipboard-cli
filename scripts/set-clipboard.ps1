# set-clipboard.ps1 — CF_HTML clipboard bridge
# Receives pre-built CF_HTML and plain text as Base64-encoded parameters.
# All encoding-sensitive work is done in Node.js — this script just decodes and sets.

param(
    [Parameter(Mandatory=$true)]
    [string]$CfHtmlBase64,
    [Parameter(Mandatory=$true)]
    [string]$PlainTextBase64
)

Add-Type -AssemblyName System.Windows.Forms

# Decode Base64 → raw UTF-8 bytes (for CF_HTML) and string (for plain text)
$cfHtmlBytes = [Convert]::FromBase64String($CfHtmlBase64)
$plainText = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($PlainTextBase64))

# Set clipboard: CF_HTML as raw byte stream, plain text as Unicode string
$dataObj = New-Object System.Windows.Forms.DataObject

$stream = New-Object System.IO.MemoryStream(,$cfHtmlBytes)
$dataObj.SetData("HTML Format", $stream)
$dataObj.SetData([System.Windows.Forms.DataFormats]::UnicodeText, $plainText)

[System.Windows.Forms.Clipboard]::SetDataObject($dataObj, $true)

Write-Host "Copied to clipboard (CF_HTML + plain text)" -ForegroundColor Green
