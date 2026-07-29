[CmdletBinding()]
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$Path
)

$ErrorActionPreference = "Stop"
$target = Resolve-Path -LiteralPath $Path
$files = @(if ((Get-Item -LiteralPath $target).PSIsContainer) {
    Get-ChildItem -LiteralPath $target -Recurse -File |
        Where-Object { $_.Extension -in ".yml", ".yaml" }
} else {
    Get-Item -LiteralPath $target
})

$issueCount = 0
foreach ($file in $files) {
    $lines = Get-Content -LiteralPath $file.FullName -Encoding UTF8
    $previousMeaningful = ""

    for ($index = 0; $index -lt $lines.Count; $index++) {
        $line = $lines[$index]
        $trimmed = $line.Trim()

        if ($trimmed -match "^//") {
            Write-Output "$($file.FullName):$($index + 1): YAML does not support // comments; use # with Chinese text."
            $issueCount++
        }

        if ($trimmed -match "^[^#\-][^:]*:\s*[^#]*$" -and $trimmed -notmatch "[\u4e00-\u9fff]") {
            $hasChineseComment = $previousMeaningful -match "^#.*[\u4e00-\u9fff]" -or
                $trimmed -match "#.*[\u4e00-\u9fff]"
            if (-not $hasChineseComment) {
                Write-Output "$($file.FullName):$($index + 1): English key has no nearby Chinese # comment; review it."
                $issueCount++
            }
        }

        if ($trimmed) {
            $previousMeaningful = $trimmed
        }
    }
}

if ($issueCount -gt 0) {
    Write-Error "Found $issueCount YAML comment issue(s)."
}

Write-Output "YAML Chinese-comment check passed for $($files.Count) file(s)."
