[CmdletBinding(DefaultParameterSetName = "Search")]
param(
    [Parameter(Mandatory = $true, ParameterSetName = "Search")]
    [string]$Query,

    [Parameter(ParameterSetName = "Search")]
    [string]$Target,

    [Parameter(Mandatory = $true, ParameterSetName = "List")]
    [switch]$ListTargets
)

$ErrorActionPreference = "Stop"
$cacheRoot = Join-Path (Split-Path -Parent $PSScriptRoot) "assets\api-cache"

if (-not (Test-Path -LiteralPath $cacheRoot)) {
    throw "API cache is missing. Run update-api-cache.ps1 explicitly to create it."
}

$targets = @(Get-ChildItem -LiteralPath $cacheRoot -Directory)
if ($ListTargets) {
    foreach ($item in $targets) {
        $manifest = Join-Path $item.FullName "snapshot.json"
        if (Test-Path -LiteralPath $manifest) {
            $data = Get-Content -Raw -LiteralPath $manifest | ConvertFrom-Json
            "{0}: {1}:{2}:{3}" -f $item.Name, $data.group, $data.artifact, $data.resolvedVersion
        } else {
            $item.Name
        }
    }
    exit 0
}

$roots = if ($Target) {
    $selected = Join-Path $cacheRoot $Target
    if (-not (Test-Path -LiteralPath $selected)) {
        throw "Unknown target '$Target'. Use -ListTargets."
    }
    @($selected)
} else {
    @($targets.FullName)
}

$files = foreach ($root in $roots) {
    Get-ChildItem -LiteralPath (Join-Path $root "sources") -Recurse -File -Filter "*.java"
}

$matches = @($files | Select-String -SimpleMatch -Pattern $Query)
if ($matches.Count -eq 0) {
    Write-Output "No local API matches for '$Query'."
    exit 1
}

$matches | Select-Object -First 200 | ForEach-Object {
    $relative = $_.Path.Substring($cacheRoot.Length).TrimStart("\")
    "{0}:{1}: {2}" -f $relative, $_.LineNumber, $_.Line.Trim()
}

if ($matches.Count -gt 200) {
    Write-Output "Results truncated: showing 200 of $($matches.Count). Refine -Query or -Target."
}
