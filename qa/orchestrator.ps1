# Mansalvic QA <-> DEV orchestrator  (zero token cost while idle)
# Watches ..\communications.txt. When a line STARTING with
#     READY FOR QA ROUND n    -> runs the QA agent command once
#     READY FOR DEV ROUND n   -> runs the DEV agent command once
# appears after the "DEV RESPONSES (append below)" marker and the file has
# been quiet for QuietSeconds, it launches that agent as a fresh headless run.
# Only one agent runs at a time; each round number fires once; MaxRounds caps
# runaway loops. Commands live in orchestrator.config.json.

$ErrorActionPreference = 'Continue'
$qaDir     = $PSScriptRoot
$root      = Split-Path -Parent $qaDir
$cfg       = Get-Content (Join-Path $qaDir 'orchestrator.config.json') -Raw | ConvertFrom-Json
$commFile  = Join-Path $root 'communications.txt'
$stateFile = Join-Path $qaDir '.orchestrator-state.json'
$logDir    = Join-Path $qaDir 'logs'
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$marker    = 'DEV RESPONSES (append below)'
$pattern   = '^READY FOR (QA|DEV) ROUND\s+(\d+)'

function Load-State {
  if (Test-Path $stateFile) { Get-Content $stateFile -Raw | ConvertFrom-Json }
  else { [pscustomobject]@{ QA = $cfg.StartHandledQA; DEV = $cfg.StartHandledDEV; Runs = 0 } }
}
function Save-State($s) { $s | ConvertTo-Json | Set-Content $stateFile -Encoding UTF8 }

function Get-LastReady {
  # the LAST ready line (QA or DEV) after the marker = whose turn it is
  $lines = Get-Content -LiteralPath $commFile -Encoding UTF8 -ErrorAction Stop
  $idx = -1
  for ($i = 0; $i -lt $lines.Count; $i++) { if ($lines[$i] -like "*$marker*") { $idx = $i } }
  if ($idx -lt 0) { return $null }
  $last = $null
  for ($i = $idx + 1; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match $pattern) { $last = @{ Kind = $Matches[1]; Round = [int]$Matches[2]; Line = $lines[$i].Trim() } }
  }
  $last
}

function Notify($title, $text) {
  try {
    Add-Type -AssemblyName System.Windows.Forms, System.Drawing
    $n = New-Object System.Windows.Forms.NotifyIcon
    $n.Icon = [System.Drawing.SystemIcons]::Information; $n.Visible = $true
    $n.ShowBalloonTip(10000, $title, $text, 'Info'); Start-Sleep 1
  } catch {}
}

function Run-Agent($kind, $round, $line) {
  $cmd = if ($kind -eq 'QA') { $cfg.QaCommand } else { $cfg.DevCommand }
  if (-not $cmd) { Write-Host "No command configured for $kind - alert only." -ForegroundColor Yellow; Notify "Mansalvic: $kind round $round ready" $line; return }
  $log = Join-Path $logDir ("{0}-round{1}-{2}.log" -f $kind.ToLower(), $round, (Get-Date -f 'yyyyMMdd-HHmmss'))
  Write-Host ("[{0}] Launching {1} agent for round {2}  (log: {3})" -f (Get-Date -f 'HH:mm:ss'), $kind, $round, $log) -ForegroundColor Green
  Notify "Mansalvic: starting $kind round $round" $line
  $env:MANSALVIC_ROUND = "$round"
  Push-Location $root
  try { & cmd.exe /c "$cmd > `"$log`" 2>&1" } finally { Pop-Location }
  Write-Host ("[{0}] {1} agent finished (exit {2})" -f (Get-Date -f 'HH:mm:ss'), $kind, $LASTEXITCODE) -ForegroundColor Cyan
}

$state = Load-State
Write-Host "Orchestrator watching $commFile (handled: QA<=$($state.QA), DEV<=$($state.DEV), runs=$($state.Runs)/$($cfg.MaxRounds))" -ForegroundColor Cyan

while ($true) {
  try {
    $item  = Get-Item -LiteralPath $commFile -ErrorAction Stop
    $ready = Get-LastReady
    if ($ready -and $ready.Round -gt $state.($ready.Kind)) {
      $quiet = ((Get-Date).ToUniversalTime() - $item.LastWriteTimeUtc).TotalSeconds
      if ($quiet -ge $cfg.QuietSeconds) {
        if ($state.Runs -ge $cfg.MaxRounds) {
          Notify 'Mansalvic orchestrator paused' "MaxRounds ($($cfg.MaxRounds)) reached - review and raise it in the config."
          Write-Host 'MaxRounds reached - stopping.' -ForegroundColor Red; break
        }
        $state.($ready.Kind) = $ready.Round; $state.Runs++; Save-State $state   # mark BEFORE running: never double-fires
        Run-Agent $ready.Kind $ready.Round $ready.Line
      }
    }
  } catch { }   # file locked mid-write - retry next tick
  Start-Sleep -Seconds $cfg.PollSeconds
}
