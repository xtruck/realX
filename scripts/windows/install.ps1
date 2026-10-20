<#
.SYNOPSIS
  Installs realX for development on Windows. No administrator rights, no global Python changes.

.DESCRIPTION
  1. creates a Python virtual environment (beside the repository by default),
  2. installs this project and its extras into that environment only,
  3. builds the browser bundle if Node.js is present (the built bundle is committed, so this is optional),
  4. fetches the models, each checked against a pinned SHA-256.
  Safe to run again: existing parts are reused.

.PARAMETER VenvPath  Where the virtual environment lives. Default: a folder named realx-venv next to the repository.
.PARAMETER Python    The Python 3.10+ to build the environment from. Default: python.
.PARAMETER SkipModels  Do not download models.
.PARAMETER DryRun    Print what would be done and change nothing.

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File scripts\windows\install.ps1
#>
[CmdletBinding()]
param(
    [string]$VenvPath,
    [string]$Python = 'python',
    [switch]$SkipModels,
    [switch]$DryRun
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
if (-not $VenvPath) { $VenvPath = Join-Path (Split-Path $repo -Parent) 'realx-venv' }
$venvPython = Join-Path $VenvPath 'Scripts\python.exe'
$realx = Join-Path $VenvPath 'Scripts\realx.exe'

function Step([string]$Text, [scriptblock]$Action) {
    if ($DryRun) { Write-Host "[dry run] would: $Text"; return }
    Write-Host "==> $Text"
    & $Action
}
function Invoke-Native([string]$Exe, [string[]]$Arguments) {
    & $Exe @Arguments
    if ($LASTEXITCODE -ne 0) { throw "'$Exe $($Arguments -join ' ')' failed with exit code $LASTEXITCODE" }
}

if ($DryRun) { Write-Host "[dry run] nothing will be created or changed. Repository: $repo" }

# --- Python ----------------------------------------------------------------------------------------------
$py = Get-Command $Python -ErrorAction SilentlyContinue
if (-not $py) {
    $message = "Python was not found ('$Python'). Install Python 3.10 or newer from https://www.python.org/downloads/ (tick 'Add python.exe to PATH'), or pass -Python with its full path."
    if ($DryRun) { Write-Warning $message } else { throw $message }
}
elseif (-not $DryRun) {
    # Windows puts a python.exe in ...\WindowsApps that only offers the Microsoft Store: it is found on PATH but does not run Python.
    $version = & $py.Source -c "import sys; print('%d.%d' % sys.version_info[:2])" 2>$null
    if ($LASTEXITCODE -ne 0 -or -not ($version -match '^\d+\.\d+$')) {
        throw ("'$($py.Source)' did not run Python. If that path is under WindowsApps it is only the Microsoft Store shortcut. " +
               "Install Python 3.10 or newer from https://www.python.org/downloads/ (tick 'Add python.exe to PATH'), " +
               "or pass -Python with the full path to an installed python.exe (for example -Python 'D:\Python312\python.exe'). " +
               "To stop the shortcut, turn off python.exe under Settings > Apps > Advanced app settings > App execution aliases.")
    }
    $ok = & $py.Source -c "import sys; print(sys.version_info >= (3, 10))"
    if ($ok -ne 'True') { throw "Python 3.10 or newer is needed; $($py.Source) is Python $version." }
}

# --- environment -----------------------------------------------------------------------------------------
# pip is only ever run as "python -m pip" from the environment's own interpreter, never a global pip.
if (Test-Path $venvPython) {
    Write-Host "Reusing the environment at $VenvPath"
} else {
    Step "create the virtual environment at $VenvPath" { Invoke-Native $py.Source @('-m', 'venv', $VenvPath) }
}
Step "pip install --upgrade pip (inside the environment)" { Invoke-Native $venvPython @('-m', 'pip', 'install', '--quiet', '--upgrade', 'pip') }
Step "pip install -e '.[dev,onnx,video]' (inside the environment)" {
    Push-Location $repo
    try { Invoke-Native $venvPython @('-m', 'pip', 'install', '--quiet', '-e', '.[dev,onnx,video]') } finally { Pop-Location }
}

# --- browser bundle (optional) -----------------------------------------------------------------------------
if (Get-Command node -ErrorAction SilentlyContinue) {
    Step "npm ci and npm run build in webapp (rebuilds the browser bundle)" {
        Push-Location (Join-Path $repo 'webapp')
        try { Invoke-Native 'npm' @('ci', '--no-audit', '--no-fund'); Invoke-Native 'npm' @('run', 'build') } finally { Pop-Location }
    }
} else {
    Write-Warning "Node.js was not found, so 'npm ci' and the bundle build are skipped. That is fine: the built bundle is committed. Install Node.js 22 or newer only if you change files in webapp\src, or want the JavaScript tests."
}

# --- models ----------------------------------------------------------------------------------------------
if ($SkipModels) {
    Write-Host "Skipping models (-SkipModels). Run '$realx models fetch' later."
} else {
    Step "realx models fetch (about 23 MB from github.com, huggingface.co and storage.googleapis.com; every file is checked against a pinned SHA-256)" {
        Invoke-Native $realx @('models', 'fetch')
    }
}

Write-Host ''
Write-Host 'Next steps:'
Write-Host '  Test: powershell -NoProfile -ExecutionPolicy Bypass -File scripts\windows\test.ps1'
Write-Host '  Run:  powershell -NoProfile -ExecutionPolicy Bypass -File scripts\windows\run.ps1'
Write-Host '  Then follow docs\OBS.md and docs\REAL-WEBCAM-VALIDATION.md.'
