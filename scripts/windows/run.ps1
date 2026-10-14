<#
.SYNOPSIS
  Starts the realX control room and opens it in your browser.

.PARAMETER VenvPath   The environment made by install.ps1. Default: realx-venv next to the repository.
.PARAMETER Port       Local port (1024-65535). Default 8765. The server only listens on 127.0.0.1.
.PARAMETER Source     camera, or demo:dance | demo:jump | demo:sprint | demo:spin | demo:static.
                      Default demo:static, because Full body mode uses the browser's camera and Windows lets
                      only one program use a camera at a time. Use camera for the Cartoon and Tracking modes.
.PARAMETER NoBrowser  Do not open a browser window.
.PARAMETER DryRun     Print the command and change nothing.

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File scripts\windows\run.ps1 -Port 8765
#>
[CmdletBinding()]
param(
    [string]$VenvPath,
    [int]$Port = 8765,
    [string]$Source = 'demo:static',
    [switch]$NoBrowser,
    [switch]$DryRun
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
if (-not $VenvPath) { $VenvPath = Join-Path (Split-Path $repo -Parent) 'realx-venv' }
$realx = Join-Path $VenvPath 'Scripts\realx.exe'

if ($Port -lt 1024 -or $Port -gt 65535) { throw "Port must be a number from 1024 to 65535 (got $Port)." }
if ($Source -notmatch '^(camera|demo:(dance|jump|sprint|spin|static))$') {
    throw "Source must be camera, demo:dance, demo:jump, demo:sprint, demo:spin or demo:static (got '$Source')."
}

$arguments = @('serve', '--port', "$Port", '--source', $Source)
if ($NoBrowser) { $arguments += '--no-browser' }

if ($DryRun) {
    Write-Host "[dry run] would run: $realx $($arguments -join ' ')"
    if (-not (Test-Path $realx)) { Write-Warning "No environment at $VenvPath yet. Run scripts\windows\install.ps1 first." }
    exit 0
}
if (-not (Test-Path $realx)) { throw "No environment at $VenvPath. Run scripts\windows\install.ps1 first." }

Write-Host "The link with the access token is printed below. For an OBS Browser Source use http://127.0.0.1:$Port/avatar?token=<that token>"
Write-Host "(set `$env:REALX_TOKEN to a fixed 16-128 character token first to keep the same URL between runs)"
Write-Host 'Press Ctrl+C to stop. In Full body mode keep the control room tab open while you stream.'
& $realx @arguments
exit $LASTEXITCODE
