[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression.FileSystem

$skillRoot = Split-Path -Parent $PSScriptRoot
$cacheRoot = Join-Path $skillRoot "assets\api-cache"
$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("mc-api-cache-" + [Guid]::NewGuid())
New-Item -ItemType Directory -Force -Path $cacheRoot, $tempRoot | Out-Null

$targets = @(
    @{ Name = "paper-26.2"; Repo = "https://repo.papermc.io/repository/maven-public"; GroupPath = "io/papermc/paper"; Group = "io.papermc.paper"; Artifact = "paper-api"; Version = "26.2.build.87-stable"; Snapshot = $false },
    @{ Name = "paper-1.21.1"; Repo = "https://repo.papermc.io/repository/maven-public"; GroupPath = "io/papermc/paper"; Group = "io.papermc.paper"; Artifact = "paper-api"; Version = "1.21.1-R0.1-SNAPSHOT"; Snapshot = $true },
    @{ Name = "paper-1.21.6"; Repo = "https://repo.papermc.io/repository/maven-public"; GroupPath = "io/papermc/paper"; Group = "io.papermc.paper"; Artifact = "paper-api"; Version = "1.21.6-R0.1-SNAPSHOT"; Snapshot = $true },
    @{ Name = "spigot-1.12.2"; Repo = "https://hub.spigotmc.org/nexus/content/repositories/snapshots"; GroupPath = "org/spigotmc"; Group = "org.spigotmc"; Artifact = "spigot-api"; Version = "1.12.2-R0.1-SNAPSHOT"; Snapshot = $true }
)

try {
    foreach ($target in $targets) {
        $baseUrl = "$($target.Repo)/$($target.GroupPath)/$($target.Artifact)/$($target.Version)"
        $resolved = $target.Version

        if ($target.Snapshot) {
            [xml]$metadata = (Invoke-WebRequest -Uri "$baseUrl/maven-metadata.xml" -UseBasicParsing).Content
            $source = @($metadata.metadata.versioning.snapshotVersions.snapshotVersion) |
                Where-Object { $_.classifier -eq "sources" -and $_.extension -eq "jar" } |
                Select-Object -First 1
            if (-not $source) {
                throw "No sources snapshot found for $($target.Name)."
            }
            $resolved = [string]$source.value
        }

        $jarName = "$($target.Artifact)-$resolved-sources.jar"
        $jarPath = Join-Path $tempRoot $jarName
        $downloadUrl = "$baseUrl/$jarName"
        Write-Output "Downloading $($target.Name) from $downloadUrl"
        Invoke-WebRequest -Uri $downloadUrl -OutFile $jarPath -UseBasicParsing

        $destination = Join-Path $cacheRoot $target.Name
        if (Test-Path -LiteralPath $destination) {
            $resolvedDestination = (Resolve-Path -LiteralPath $destination).Path
            if (-not $resolvedDestination.StartsWith((Resolve-Path -LiteralPath $cacheRoot).Path, [System.StringComparison]::OrdinalIgnoreCase)) {
                throw "Refusing to replace cache outside the skill directory: $resolvedDestination"
            }
            Remove-Item -LiteralPath $destination -Recurse -Force
        }

        $sources = Join-Path $destination "sources"
        New-Item -ItemType Directory -Force -Path $sources | Out-Null
        [System.IO.Compression.ZipFile]::ExtractToDirectory($jarPath, $sources)

        [ordered]@{
            target = $target.Name
            group = $target.Group
            artifact = $target.Artifact
            requestedVersion = $target.Version
            resolvedVersion = $resolved
            sourceUrl = $downloadUrl
            fetchedAtUtc = [DateTime]::UtcNow.ToString("o")
        } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $destination "snapshot.json") -Encoding UTF8
    }
} finally {
    if (Test-Path -LiteralPath $tempRoot) {
        Remove-Item -LiteralPath $tempRoot -Recurse -Force
    }
}

Write-Output "API cache updated at $cacheRoot"
