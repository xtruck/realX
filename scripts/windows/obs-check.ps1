<#
.SYNOPSIS
  Read-only check of the OBS Virtual Camera route for realX. It changes nothing on this computer.

.DESCRIPTION
  Checks, in order: OBS Studio is installed, OBS Virtual Camera is registered, which cameras Windows sees,
  and whether the realX control room answers with your access token. Then it prints the exact Browser Source
  settings to use in OBS. The apps themselves (Zoom, Meet, WhatsApp, TikTok Live Studio) still have to be tried
  by you: see docs/OBS.md for the checklist.

.PARAMETER Port
  The realX control room port (default 8765).

.PARAMETER Token
  Your access token. Default: the REALX_TOKEN environment variable. Keep it private, it is a password for your studio.

.EXAMPLE
  $env:REALX_TOKEN = "choose-a-long-private-token-1234"; realx serve --no-browser
  .\scripts\windows\obs-check.ps1
#>
param(
    [int]$Port = 8765,
    [string]$Token = $env:REALX_TOKEN
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$script:problems = 0
function Show([string]$state, [string]$what, [string]$detail = "") {
    $tag = switch ($state) { "ok" { "[ OK ]" } "bad" { "[FAIL]" } default { "[ -- ]" } }
    if ($state -eq "bad") { $script:problems++ }
    if ($detail) { Write-Host "$tag $what - $detail" } else { Write-Host "$tag $what" }
}

Write-Host "realX: OBS Virtual Camera check (read-only)"
Write-Host ""

# 1. OBS Studio installed?
$candidates = @(
    (Join-Path $env:ProgramFiles "obs-studio\bin\64bit\obs64.exe"),
    (Join-Path ${env:ProgramFiles(x86)} "obs-studio\bin\64bit\obs64.exe"),
    (Join-Path $env:LOCALAPPDATA "Programs\obs-studio\bin\64bit\obs64.exe")
)
$obs = $candidates | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if ($obs) {
    Show "ok" "OBS Studio is installed" ("version " + (Get-Item $obs).VersionInfo.ProductVersion)
} else {
    Show "bad" "OBS Studio was not found" "install it from https://obsproject.com/, then run this check again"
}

# 2. Is it running? (Virtual Camera can only be started from a running OBS)
$running = Get-Process -Name obs64 -ErrorAction SilentlyContinue
if ($running) { Show "ok" "OBS is running" } else { Show "info" "OBS is not running" "start it before adding the Browser Source" }

# 3. OBS Virtual Camera registered with Windows?
$registered = $false
try {
    # most CLSID keys have no default value, and under strict mode reading a missing property is an error:
    # ask whether the property exists first, or every key without one would make the whole check say "not registered"
    $hits = Get-ChildItem "HKLM:\SOFTWARE\Classes\CLSID" -ErrorAction SilentlyContinue | Where-Object {
        $p = Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue
        $p -and $p.PSObject.Properties["(default)"] -and ([string]$p.PSObject.Properties["(default)"].Value) -like "*OBS*Virtual*"
    }
    $registered = [bool]$hits
} catch { $registered = $false }
if ($registered) {
    Show "ok" "OBS Virtual Camera is registered with Windows"
} else {
    Show "bad" "OBS Virtual Camera is not registered" "in OBS, press Start Virtual Camera once; it installs itself the first time"
}

# 4. Cameras Windows sees (a physical webcam is not needed for the realX character, but good to know)
$cams = @(Get-PnpDevice -Class Camera -ErrorAction SilentlyContinue | Where-Object { $_.Status -eq "OK" } | ForEach-Object { $_.FriendlyName })
if ($cams.Count -gt 0) { Show "ok" "Cameras Windows can see" ($cams -join ", ") } else { Show "info" "No camera is listed by Windows" "the realX character does not need one, the tracking page does" }

# 5. Does the realX control room answer?
$base = "http://127.0.0.1:$Port"
$headers = @{}
if ($Token) { $headers["Authorization"] = "Bearer $Token" }
try {
    $stats = Invoke-RestMethod -Uri "$base/api/stats" -Headers $headers -TimeoutSec 5
    $mode = if ($stats.config) { $stats.config.mode } else { "unknown" }
    Show "ok" "realX answers on port $Port" "mode: $mode"
} catch {
    $code = $null
    if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
    if ($code -eq 401) {
        Show "bad" "realX answered 401: the access token is missing or wrong" "set REALX_TOKEN to the token realX printed, or pass -Token"
    } else {
        Show "bad" "realX does not answer on port $Port" "start it with: realx serve --no-browser   (set REALX_TOKEN first to keep the same link)"
    }
}

# 6. What to put in OBS
Write-Host ""
Write-Host "In OBS: Sources > + > Browser, then:"
if ($Token) {
    Write-Host "  URL     : $base/avatar?token=$Token"
} else {
    Write-Host "  URL     : $base/avatar?token=<your token>   (set REALX_TOKEN to a long private value, then run this again)"
}
Write-Host "  Width   : 1280    Height : 720    FPS : 30"
Write-Host "  The background is transparent, so the character sits over whatever is below it."
Write-Host "  Then Controls > Start Virtual Camera, and choose 'OBS Virtual Camera' in the other app."
Write-Host "  The token is a password for your studio: do not share the address or a screenshot of it."

Write-Host ""
if ($script:problems -eq 0) {
    Write-Host "Result: everything this script can check is in place. Now try the apps (docs/OBS.md)."
    exit 0
}
Write-Host "Result: $($script:problems) problem(s) above. Fix them, then run this again."
exit 1
