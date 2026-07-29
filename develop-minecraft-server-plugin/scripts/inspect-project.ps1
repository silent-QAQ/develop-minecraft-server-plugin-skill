[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$Path = "."
)

$ErrorActionPreference = "Stop"
$root = (Resolve-Path -LiteralPath $Path).Path

Write-Output "Project: $root"
Write-Output ""

if (Test-Path -LiteralPath (Join-Path $root ".git")) {
    Write-Output "[Git status]"
    git -C $root status --short --branch
    Write-Output ""
}

Write-Output "[Build and plugin files]"
$names = @(
    "build.gradle", "build.gradle.kts", "settings.gradle", "settings.gradle.kts",
    "pom.xml", "gradle.properties", "gradlew", "gradlew.bat",
    "plugin.yml", "paper-plugin.yml", "folia-supported.yml"
)

Get-ChildItem -LiteralPath $root -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { $names -contains $_.Name } |
    ForEach-Object { $_.FullName.Substring($root.Length).TrimStart("\") }

Write-Output ""
Write-Output "[Likely platform and integration references]"
$patterns = "paper-api|spigot-api|folia|luckperms|placeholderapi|mockbukkit|api-version|folia-supported"
$searchable = Get-ChildItem -LiteralPath $root -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Extension -in ".gradle", ".kts", ".xml", ".yml", ".yaml", ".java", ".kt" }

if ($searchable) {
    $searchable | Select-String -Pattern $patterns -CaseSensitive:$false |
        ForEach-Object {
            $relative = $_.Path.Substring($root.Length).TrimStart("\")
            "{0}:{1}: {2}" -f $relative, $_.LineNumber, $_.Line.Trim()
        }
}
