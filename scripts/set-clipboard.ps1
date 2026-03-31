# set-clipboard.ps1 — CF_HTML clipboard bridge
# Accepts HTML on stdin, sets both "HTML Format" (CF_HTML) and "UnicodeText" on the clipboard.
# Usage: echo "<b>hello</b>" | powershell -NoProfile -File set-clipboard.ps1 [-PlainText "fallback text"]

param(
    [string]$PlainText = "",
    [string]$PlainTextBase64 = ""
)

Add-Type -AssemblyName System.Windows.Forms

# Read HTML from stdin
$html = [Console]::In.ReadToEnd()

if (-not $html) {
    Write-Error "No HTML content received on stdin"
    exit 1
}

# Decode Base64 plainText if provided (preferred — avoids shell injection)
if ($PlainTextBase64) {
    $PlainText = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($PlainTextBase64))
}

# If no plain text fallback provided, strip HTML tags
if (-not $PlainText) {
    $PlainText = $html -replace '<[^>]+>', '' -replace '&amp;', '&' -replace '&lt;', '<' -replace '&gt;', '>' -replace '&quot;', '"' -replace '&#39;', "'"
}

# Build CF_HTML envelope
$startFragment = "<!--StartFragment-->"
$endFragment = "<!--EndFragment-->"
$fullHtml = "<html>`r`n<body>`r`n$startFragment`r`n$html`r`n$endFragment`r`n</body>`r`n</html>"

$headerTemplate = "Version:0.9`r`nStartHTML:SSSSSSSSSS`r`nEndHTML:EEEEEEEEEE`r`nStartFragment:FFFFFFFFFF`r`nEndFragment:GGGGGGGGGG`r`n"

$enc = [System.Text.Encoding]::UTF8
$headerBytes = $enc.GetByteCount($headerTemplate)
$htmlBytes = $enc.GetByteCount($fullHtml)

$startHtml = $headerBytes
$endHtml = $headerBytes + $htmlBytes

$beforeFragment = "<html>`r`n<body>`r`n$startFragment`r`n"
$startFragmentOffset = $headerBytes + $enc.GetByteCount($beforeFragment)

$afterFragment = "`r`n$endFragment`r`n</body>`r`n</html>"
$endFragmentOffset = $endHtml - $enc.GetByteCount($afterFragment) + $enc.GetByteCount("`r`n$endFragment")

$pad = { param($n) $n.ToString().PadLeft(10, '0') }

$header = "Version:0.9`r`n"
$header += "StartHTML:$(& $pad $startHtml)`r`n"
$header += "EndHTML:$(& $pad $endHtml)`r`n"
$header += "StartFragment:$(& $pad $startFragmentOffset)`r`n"
$header += "EndFragment:$(& $pad $endFragmentOffset)`r`n"

$clipData = $header + $fullHtml

# Set clipboard with both HTML Format (as UTF-8 bytes) and plain text
# CF_HTML MUST be set as a UTF-8 byte stream, NOT a .NET string.
# Passing a string causes Windows to interpret it as the system codepage (Windows-1252),
# which garbles multi-byte UTF-8 characters (emoji, em dashes, etc.).
$dataObj = New-Object System.Windows.Forms.DataObject

$utf8Bytes = $enc.GetBytes($clipData)
$stream = New-Object System.IO.MemoryStream(,$utf8Bytes)
$dataObj.SetData("HTML Format", $stream)

$dataObj.SetData([System.Windows.Forms.DataFormats]::UnicodeText, $PlainText)
[System.Windows.Forms.Clipboard]::SetDataObject($dataObj, $true)

Write-Host "Copied to clipboard (CF_HTML + plain text)" -ForegroundColor Green
