Add-Type -AssemblyName System.Drawing

$srcPath = "C:/Users/7muha/.gemini/antigravity/brain/f4c504bb-22f1-49f6-b64b-b21686411779/.user_uploaded/media_1790583314945.png"
$destDir = "D:/Web_dev/mansalvic/client/public"
if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir | Out-Null }

$src = [System.Drawing.Bitmap]::FromFile($srcPath)
Write-Host "Source Width: $($src.Width), Height: $($src.Height)"

# Let's crop the paper area where the logo is located:
# In the 1024x576 or similar image:
# The logo is roughly x=280..740, y=140..420
# Let's find the bounding box by scanning for non-white/non-cream pixels around the center
$centerX = [int]($src.Width / 2)
$centerY = [int]($src.Height / 2)

# Save full image first as reference
$src.Save("$destDir/mansalvic-mockup.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Let's crop the logo bounding area:
# Let's measure where the logo is:
$cropX = [int]($src.Width * 0.25)
$cropY = [int]($src.Height * 0.15)
$cropW = [int]($src.Width * 0.50)
$cropH = [int]($src.Height * 0.65)

$rect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$cropped = $src.Clone($rect, $src.PixelFormat)

# Make near-white background transparent:
# Paper color is roughly RGB(245..255, 245..255, 245..255)
$transparentLogo = New-Object System.Drawing.Bitmap($cropped.Width, $cropped.Height)
$g = [System.Drawing.Graphics]::FromImage($transparentLogo)

for ($x = 0; $x -lt $cropped.Width; $x++) {
  for ($y = 0; $y -lt $cropped.Height; $y++) {
    $c = $cropped.GetPixel($x, $y)
    # Check if pixel is background paper/white/cream
    if ($c.R -gt 230 -and $c.G -gt 230 -and $c.B -gt 230) {
      $transparentLogo.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 255, 255, 255))
    } elseif ($c.R -gt 215 -and $c.G -gt 215 -and $c.B -gt 215) {
      # Feather transition edge
      $alpha = [int](255 * (1.0 - (($c.R - 215) / 15.0)))
      if ($alpha -lt 0) { $alpha = 0 }
      if ($alpha -gt 255) { $alpha = 255 }
      $transparentLogo.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B))
    } else {
      $transparentLogo.SetPixel($x, $y, $c)
    }
  }
}

# Auto-crop the transparent logo to exact content bounding box:
$minX = $transparentLogo.Width
$minY = $transparentLogo.Height
$maxX = 0
$maxY = 0

for ($x = 0; $x -lt $transparentLogo.Width; $x++) {
  for ($y = 0; $y -lt $transparentLogo.Height; $y++) {
    $pixel = $transparentLogo.GetPixel($x, $y)
    if ($pixel.A -gt 30) {
      if ($x -lt $minX) { $minX = $x }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($y -gt $maxY) { $maxY = $y }
    }
  }
}

Write-Host "Detected Content Bounds: X=$minX..$maxX, Y=$minY..$maxY"

if ($maxX -gt $minX -and $maxY -gt $minY) {
  $pad = 10
  $finalX = [Math]::Max(0, $minX - $pad)
  $finalY = [Math]::Max(0, $minY - $pad)
  $finalW = [Math]::Min($transparentLogo.Width - $finalX, ($maxX - $minX) + ($pad * 2))
  $finalH = [Math]::Min($transparentLogo.Height - $finalY, ($maxY - $minY) + ($pad * 2))
  
  $finalRect = New-Object System.Drawing.Rectangle($finalX, $finalY, $finalW, $finalH)
  $finalLogo = $transparentLogo.Clone($finalRect, $transparentLogo.PixelFormat)
  
  $finalLogo.Save("$destDir/mansalvic-logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
  Write-Host "Successfully saved: $destDir/mansalvic-logo.png ($($finalLogo.Width)x$($finalLogo.Height))"
  $finalLogo.Dispose()
}

$src.Dispose()
$cropped.Dispose()
$transparentLogo.Dispose()
$g.Dispose()
