[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$MinecraftAssets = "D:\pclce\.minecraft\versions\26.2-Fabric_0.19.3\26.2-Fabric_0.19.3\assets\minecraft"
)

$ErrorActionPreference = "Stop"
$skillRoot = Split-Path -Parent $PSScriptRoot
$editorRoot = Join-Path $skillRoot "assets\gui-editor"
$targetTextures = Join-Path $editorRoot "textures"
$itemDefinitions = Join-Path $MinecraftAssets "items"
$modelsRoot = Join-Path $MinecraftAssets "models"
$sourceTextures = Join-Path $MinecraftAssets "textures"
$itemKeysSource = Join-Path $skillRoot "assets\api-cache\paper-26.2\sources\io\papermc\paper\registry\keys\ItemTypeKeys.java"

foreach ($required in @($itemDefinitions, $modelsRoot, (Join-Path $sourceTextures "item"), (Join-Path $sourceTextures "block"), $itemKeysSource)) {
    if (-not (Test-Path -LiteralPath $required)) {
        throw "Required Minecraft 26.2 asset path is missing: $required"
    }
}

New-Item -ItemType Directory -Force -Path $targetTextures | Out-Null
foreach ($kind in @("item", "block")) {
    $destination = Join-Path $targetTextures $kind
    if (Test-Path -LiteralPath $destination) {
        $resolvedDestination = (Resolve-Path -LiteralPath $destination).Path
        $resolvedEditor = (Resolve-Path -LiteralPath $editorRoot).Path
        if (-not $resolvedDestination.StartsWith($resolvedEditor, [System.StringComparison]::OrdinalIgnoreCase)) {
            throw "Refusing to replace textures outside the GUI editor: $resolvedDestination"
        }
        Remove-Item -LiteralPath $destination -Recurse -Force
    }
    Copy-Item -LiteralPath (Join-Path $sourceTextures $kind) -Destination $destination -Recurse -Force
}

$jsonCache = @{}
$textureCache = @{}

function Read-JsonCached([string]$Path) {
    if ($jsonCache.ContainsKey($Path)) { return $jsonCache[$Path] }
    if (-not (Test-Path -LiteralPath $Path)) { $jsonCache[$Path] = $null; return $null }
    try { $value = Get-Content -Raw -LiteralPath $Path | ConvertFrom-Json } catch { $value = $null }
    $jsonCache[$Path] = $value
    return $value
}

function Get-FirstModelReference($Node) {
    if ($null -eq $Node) { return $null }
    $type = [string]$Node.type
    if ($type -eq "minecraft:model") { return [string]$Node.model }
    if ($type -eq "minecraft:special" -and $Node.base) { return [string]$Node.base }

    foreach ($property in @("fallback", "on_false", "on_true")) {
        if ($Node.$property) {
            $found = Get-FirstModelReference $Node.$property
            if ($found) { return $found }
        }
    }

    foreach ($collection in @("models", "cases", "entries")) {
        foreach ($entry in @($Node.$collection)) {
            $candidate = if ($entry.model -and -not $entry.type) { $entry.model } else { $entry }
            $found = Get-FirstModelReference $candidate
            if ($found) { return $found }
        }
    }
    return $null
}

function Resolve-ModelTexture([string]$Reference, [hashtable]$Visited) {
    if (-not $Reference) { return $null }
    $clean = $Reference -replace '^minecraft:', ''
    if ($Visited.ContainsKey($clean)) { return $null }
    $Visited[$clean] = $true

    $modelPath = Join-Path $modelsRoot (($clean -replace '/', '\') + ".json")
    $model = Read-JsonCached $modelPath
    if (-not $model) { return $null }

    $preferred = @("layer0", "texture", "all", "particle", "side", "top", "end")
    if ($model.textures) {
        foreach ($key in $preferred) {
            $property = $model.textures.PSObject.Properties[$key]
            if ($property -and [string]$property.Value -notmatch '^#') {
                return ([string]$property.Value -replace '^minecraft:', '')
            }
        }
        foreach ($property in $model.textures.PSObject.Properties) {
            if ([string]$property.Value -notmatch '^#') {
                return ([string]$property.Value -replace '^minecraft:', '')
            }
        }
    }

    if ($model.parent) { return Resolve-ModelTexture ([string]$model.parent) $Visited }
    return $null
}

$itemKeys = @(Get-Content -LiteralPath $itemKeysSource | ForEach-Object {
    if ($_ -match 'create\(key\("([a-z0-9_]+)"\)\)') { $Matches[1] }
}) | Sort-Object -Unique

$map = [ordered]@{}
$unresolved = New-Object System.Collections.Generic.List[string]
foreach ($id in $itemKeys) {
    $directItem = Join-Path $targetTextures "item\$id.png"
    $directBlock = Join-Path $targetTextures "block\$id.png"
    $sideBlock = Join-Path $targetTextures "block\${id}_side.png"
    $relative = $null

    if (Test-Path -LiteralPath $directItem) { $relative = "textures/item/$id.png" }
    elseif (Test-Path -LiteralPath $directBlock) { $relative = "textures/block/$id.png" }
    elseif (Test-Path -LiteralPath $sideBlock) { $relative = "textures/block/${id}_side.png" }
    else {
        $definition = Read-JsonCached (Join-Path $itemDefinitions "$id.json")
        $modelReference = Get-FirstModelReference $definition.model
        $textureReference = Resolve-ModelTexture $modelReference @{}
        if ($textureReference) {
            $candidate = Join-Path $targetTextures (($textureReference -replace '/', '\') + ".png")
            if (Test-Path -LiteralPath $candidate) {
                $relative = (($candidate.Substring($editorRoot.Length).TrimStart('\')) -replace '\\', '/')
            }
        }
    }

    if (-not $relative) {
        $prefix = @(Get-ChildItem (Join-Path $targetTextures "item"),(Join-Path $targetTextures "block") -File -Filter "$id*.png" | Select-Object -First 1)
        if ($prefix.Count) { $relative = (($prefix[0].FullName.Substring($editorRoot.Length).TrimStart('\')) -replace '\\', '/') }
    }

    if ($relative) { $map[$id] = $relative } else { $unresolved.Add($id) }
}

$mapJson = ConvertTo-Json -InputObject $map -Compress
[System.IO.File]::WriteAllText((Join-Path $editorRoot "icon-map.js"), "window.MC_ICON_MAP = $mapJson;", [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllLines((Join-Path $editorRoot "unresolved-icons.txt"), $unresolved, [System.Text.UTF8Encoding]::new($false))

$copied = @(Get-ChildItem -LiteralPath $targetTextures -Recurse -File)
Write-Output "Imported $($copied.Count) texture files from Minecraft 26.2."
Write-Output "Resolved $($map.Count) of $($itemKeys.Count) item icons; unresolved: $($unresolved.Count)."
