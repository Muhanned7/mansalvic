# Mansalvic QA watcher
# Watches ..\communications.txt and fires when the developer agent has FINISHED
# writing a "READY FOR QA ROUND n" line under DEV RESPONSES.
#  - Only lines AFTER the "DEV RESPONSES (append below)" marker count
#    (the protocol section above it contains the same text as an example).
#  - "Finished" = the new READY line exists AND the file has not changed
#    for $QuietSeconds (so we don't fire while the agent is still appending).
# On trigger: Windows balloon notification + beep, and writes
#   qa\QA_TRIGGER.json  (the QA agent checks for this file)
# Run via start-qa-watcher.bat. Stop with Ctrl+C or by closing the window.

param(
  [int]$QuietSeconds = 20,
  [int]$PollSeconds  = 2
)

$ErrorActionPreference = 'Continue'
$root      = Split-Path -Parent $PSScriptRoot
$commFile  = Join-Path $root 'communications.txt'
$trigger   = Join-Path $PSScriptRoot 'QA_TRIGGER.json'
$stateFile = Join-Path $PSScriptRoot '.watch-state'
$marker    = 'DEV RESPONSES (append below)'
$pattern   = '^READY FOR QA ROUND\s+(\d+)'   # must start the line

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$tray = New-Object System.Windows.Forms.NotifyIcon
$tray.Icon = [System.Drawing.SystemIcons]::Information
$tray.Text = 'Mansalvic QA watcher'
$tray.Visible = $true

function Get-HandledRound {
  if (Test-Path $stateFile) { [int](Get-Content $stateFile -Raw).Trim() } else { 1 }
}

function Get-LatestReady {
  # returns @{ Round = n; Line = '...' } for the highest READY round after the marker, or $null
  $lines = Get-Content -LiteralPath $commFile -Encoding UTF8 -ErrorAction Stop
  $idx = -1
  for ($i = 0; $i -lt $lines.Count; $i++) { if ($lines[$i] -like "*$marker*") { $idx = $i } }
  if ($idx -lt 0) { return $null }
  $best = $null
  for ($i = $idx + 1; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match $pattern) {
      $n = [int]$Matches[1]
      if (-not $best -or $n -gt $best.Round) { $best = @{ Round = $n; Line = $lines[$i].Trim() } }
    }
  }
  return $best
}

function Send-Alert($round, $line) {
  $payload = [ordered]@{
    round       = $round
    line        = $line
    detected_at = (Get-Date).ToString('o')
    file_size   = (Get-Item -LiteralPath $commFile).Length
  } | ConvertTo-Json
  Set-Content -LiteralPath $trigger -Value $payload -Encoding UTF8
  Set-Content -LiteralPath $stateFile -Value $round
  $tray.BalloonTipTitle = "Mansalvic: ready for QA round $round"
  $tray.BalloonTipText  = $line
  $tray.ShowBalloonTip(15000)
  [System.Media.SystemSounds]::Exclamation.Play()
  Write-Host ("[{0}] TRIGGERED round {1}: {2}" -f (Get-Date -f 'HH:mm:ss'), $round, $line) -ForegroundColor Green
}

Write-Host "Watching $commFile  (quiet period ${QuietSeconds}s, handled rounds <= $(Get-HandledRound))" -ForegroundColor Cyan

$lastWrite  = $null
$pendingFor = $null   # round number waiting for the quiet period

try {
  while ($true) {
    try {
      $item = Get-Item -LiteralPath $commFile -ErrorAction Stop
      if ($item.LastWriteTimeUtc -ne $lastWrite) {
        $lastWrite = $item.LastWriteTimeUtc
        Write-Host ("[{0}] communications.txt changed ({1} bytes)" -f (Get-Date -f 'HH:mm:ss'), $item.Length)
      }
      $ready = Get-LatestReady
      if ($ready -and $ready.Round -gt (Get-HandledRound)) {
        $quiet = ((Get-Date).ToUniversalTime() - $item.LastWriteTimeUtc).TotalSeconds
        if ($quiet -ge $QuietSeconds) {
          Send-Alert $ready.Round $ready.Line
          $pendingFor = $null
        } elseif ($pendingFor -ne $ready.Round) {
          $pendingFor = $ready.Round
          Write-Host "READY line for round $($ready.Round) seen - waiting until the file stops changing..." -ForegroundColor Yellow
        }
      }
    } catch {
      # file briefly locked while the other agent writes it; try again next tick
    }
    Start-Sleep -Seconds $PollSeconds
  }
} finally {
  $tray.Visible = $false
  $tray.Dispose()
}
