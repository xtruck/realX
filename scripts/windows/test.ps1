<#
.SYNOPSIS
  Runs the browser-side unit tests (node) and the Python test suite, which includes the real-browser tests.

.PARAMETER VenvPath  The environment made by install.ps1. Default: realx-venv next to the repository.
.PARAMETER DryRun    Print the commands and change nothing.
.PARAMETER Quick     Skip the slow real-browser tests (the ones that start Chrome).

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File scripts\windows\test.ps1
#>
[CmdletBinding()]
param(
    [string]$VenvPath,
    [switch]$Quick,
    [switch]$DryRun
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
if (-not $VenvPath) { $VenvPath = Join-Path (Split-Path $repo -Parent) 'realx-venv' }
$venvPython = Join-Path $VenvPath 'Scripts\python.exe'

# The real-browser tests need a Chromium-based browser. Use one that is already installed.
if (-not $env:REALX_CHROMIUM) {
    $candidates = @(
        "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
        "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
        "$env:LocalAppData\Google\Chrome\Application\chrome.exe",
        "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
        "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
    )
    $found = $candidates | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
    if ($found) { $env:REALX_CHROMIUM = $found; Write-Host "Using $found for the browser tests (REALX_CHROMIUM)." }
    else { Write-Warning 'No Chrome or Edge found: the real-browser tests will be skipped. Set REALX_CHROMIUM to a browser executable to run them.' }
}

$failed = $false
function Run([string]$Label, [string]$Exe, [string[]]$Arguments, [string]$Dir) {
    if ($DryRun) { Write-Host "[dry run] would run in ${Dir}: $Label"; return }
    Write-Host "==> $Label"
    Push-Location $Dir
    try { & $Exe @Arguments; if ($LASTEXITCODE -ne 0) { $script:failed = $true; Write-Warning "$Label failed (exit code $LASTEXITCODE)" } }
    finally { Pop-Location }
}

if ($DryRun) { Write-Host '[dry run] nothing will be run.' }
elseif (-not (Test-Path $venvPython)) { throw "No environment at $VenvPath. Run scripts\windows\install.ps1 first." }

if (Get-Command node -ErrorAction SilentlyContinue) {
    $files = @(Get-ChildItem (Join-Path $repo 'webapp\test') -Filter '*.test.mjs' -ErrorAction SilentlyContinue | ForEach-Object { "test/$($_.Name)" })
    Run "node --test $($files -join ' ')" 'node' (@('--test') + $files) (Join-Path $repo 'webapp')
} else {
    Write-Warning 'Node.js not found: the JavaScript tests are skipped.'
}

$pytestArgs = @('-m', 'pytest', '-q', '-rs')
if ($Quick) { $pytestArgs += @('-k', 'not browser and not character and not control_room') }
Run "pytest $($pytestArgs[2..($pytestArgs.Count - 1)] -join ' ')" $venvPython $pytestArgs $repo

if ($failed) { Write-Error 'Some tests failed. See the output above.'; exit 1 }
Write-Host 'All requested tests ran.'
