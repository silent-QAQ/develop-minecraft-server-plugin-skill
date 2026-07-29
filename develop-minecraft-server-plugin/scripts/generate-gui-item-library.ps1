[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$skillRoot = Split-Path -Parent $PSScriptRoot
$source = Join-Path $skillRoot "assets\api-cache\paper-26.2\sources\io\papermc\paper\registry\keys\ItemTypeKeys.java"
$outputDir = Join-Path $skillRoot "assets\gui-editor"
$output = Join-Path $outputDir "items.js"

if (-not (Test-Path -LiteralPath $source)) {
    throw "Paper 26.2 ItemTypeKeys.java is missing. Refresh the API cache first."
}

$items = @(Get-Content -LiteralPath $source | ForEach-Object {
    if ($_ -match 'create\(key\("([a-z0-9_]+)"\)\)') {
        $Matches[1]
    }
}) | Sort-Object -Unique

if ($items.Count -lt 100) {
    throw "Only $($items.Count) item keys were parsed; refusing to generate an incomplete library."
}

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
$json = ConvertTo-Json -InputObject $items -Compress
[System.IO.File]::WriteAllText($output, "window.MC_ITEMS = $json;", [System.Text.UTF8Encoding]::new($false))
Write-Output "Generated $($items.Count) Minecraft 26.2 item keys at $output"
