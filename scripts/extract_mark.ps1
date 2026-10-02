Add-Type -AssemblyName System.Drawing

$logoPath = "D:/Web_dev/mansalvic/client/public/mansalvic-logo.png"
$destDir = "D:/Web_dev/mansalvic/client/public"

$logo = [System.Drawing.Bitmap]::FromFile($logoPath)
Write-Host "Cropped Logo: $($logo.Width)x$($logo.Height)"

# The mountain icon is roughly the top 75% before the text "MANSALVIC"
# Let's crop just the mark
$markH = [int]($logo.Height * 0.72)
$markRect = New-Object System.Drawing.Rectangle(0, 0, $logo.Width, $markH)
$mark = $logo.Clone($markRect, $logo.PixelFormat)

# Trim transparent edges of mark
$minX = $mark.Width; $minY = $mark.Height; $maxX = 0; $maxY = 0
for ($x = 0; $x -lt $mark.Width; $x++) {
  for ($y = 0; $y -lt $mark.Height; $y++) {
    if ($mark.GetPixel($x, $y).A -gt 30) {
      if ($x -lt $minX) { $minX = $x }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($y -gt $maxY) { $maxY = $y }
    }
  }
}

if ($maxX -gt $minX -and $maxY -gt $minY) {
  $pad = 6
  $finalX = [Math]::Max(0, $minX - $pad)
  $finalY = [Math]::Max(0, $minY - $pad)
  $finalW = [Math]::Min($mark.Width - $finalX, ($maxX - $minX) + ($pad * 2))
  $finalH = [Math]::Min($mark.Height - $finalY, ($maxY - $minY) + ($pad * 2))
  
  $fRect = New-Object System.Drawing.Rectangle($finalX, $finalY, $finalW, $finalH)
  $finalMark = $mark.Clone($fRect, $mark.PixelFormat)
  $finalMark.Save("$destDir/mansalvic-mark.png", [System.Drawing.Imaging.ImageFormat]::Png)
  Write-Host "Saved mark: $destDir/mansalvic-mark.png ($($finalMark.Width)x$($finalMark.Height))"
  $finalMark.Dispose()
}

$logo.Dispose()
$mark.Dispose()
