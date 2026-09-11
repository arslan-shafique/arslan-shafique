# Renders thumbnail.html to PNG at exact pixel sizes using headless Chrome.
# Source is authored at 1440x726 CSS px; the scale factor multiplies that.
#
#   powershell -File assets\social\render.ps1
#
param(
  [string]$Chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
)

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$src  = Join-Path $here 'thumbnail.html'

if (-not (Test-Path $Chrome)) { throw "Chrome not found at $Chrome" }
if (-not (Test-Path $src))    { throw "Missing $src" }

# name, cssWidth, cssHeight, scaleFactor  ->  output pixels = css * scale
# The window size must always match the authored canvas (1440x726) or Chrome
# crops instead of scaling. Change output size with `scale`, never with w/h.
$jobs = @(
  @{ out = 'linkedin-thumbnail.png'; w = 1440; h = 726; scale = 3 }   # 4320 x 2178
  @{ out = 'og-image.png';           w = 1440; h = 726; scale = 1 }   # 1440 x  726
)

foreach ($j in $jobs) {
  $dest = Join-Path $here $j.out
  if (Test-Path $dest) { Remove-Item $dest -Force }

  $args = @(
    '--headless=new'
    '--disable-gpu'
    '--hide-scrollbars'
    '--default-background-color=00000000'
    '--force-device-scale-factor=' + $j.scale
    '--window-size=' + $j.w + ',' + $j.h
    '--virtual-time-budget=12000'
    '--screenshot=' + $dest
    ('file:///' + ($src -replace '\\', '/'))
  )

  # Chrome writes its progress line to stderr; do not redirect it in PS 5.1
  # or every line comes back as a NativeCommandError.
  & $Chrome @args | Out-Null

  if (Test-Path $dest) {
    Add-Type -AssemblyName System.Drawing
    $img = [System.Drawing.Image]::FromFile($dest)
    $dim = "$($img.Width)x$($img.Height)"
    $img.Dispose()
    $kb = [math]::Round((Get-Item $dest).Length / 1KB, 1)
    Write-Output "$($j.out)  $dim  ${kb} KB"
  } else {
    Write-Output "FAILED: $($j.out)"
  }
}
