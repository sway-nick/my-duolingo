Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\user\.gemini\antigravity\brain\764ddde7-2f60-40c2-b5e4-c4157d283383\.user_uploaded\media_1786950570791.png"
$outDir = "c:\projects\my-duolingo\frontend\assets\avatars"

if (!(Test-Path $outDir)) {
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null
}

$img = [System.Drawing.Bitmap]::FromFile($srcPath)
$totalW = $img.Width
$totalH = $img.Height

$cols = 4
$rows = 4
$cellW = $totalW / $cols
$cellH = $totalH / $rows

$count = 1
for ($r = 0; $r -lt $rows; $r++) {
    for ($c = 0; $c -lt $cols; $c++) {
        $cellStartX = [int]($c * $cellW)
        $cellStartY = [int]($r * $cellH)

        $minX = [int]$cellW
        $minY = [int]$cellH
        $maxX = 0
        $maxY = 0

        # Margin to avoid bleeding from neighboring cells (e.g. mohawk tip from below)
        $topMargin = if ($r -gt 0) { 10 } else { 0 }
        $bottomMargin = if ($r -eq 2 -and $c -eq 1) { 45 } elseif ($r -lt 3) { 16 } else { 0 }
        $leftMargin = if ($c -gt 0) { 8 } else { 0 }
        $rightMargin = if ($c -lt 3) { 8 } else { 0 }

        # Find bounds of character
        for ($y = $topMargin; $y -lt ($cellH - $bottomMargin); $y++) {
            for ($x = $leftMargin; $x -lt ($cellW - $rightMargin); $x++) {
                $srcX = $cellStartX + $x
                $srcY = $cellStartY + $y
                if ($srcX -lt $totalW -and $srcY -lt $totalH) {
                    $pixel = $img.GetPixel($srcX, $srcY)
                    if ($pixel.A -gt 20) {
                        if ($x -lt $minX) { $minX = $x }
                        if ($x -gt $maxX) { $maxX = $x }
                        if ($y -lt $minY) { $minY = $y }
                        if ($y -gt $maxY) { $maxY = $y }
                    }
                }
            }
        }

        if ($maxX -gt $minX -and $maxY -gt $minY) {
            $charW = $maxX - $minX + 1
            $charH = $maxY - $minY + 1

            # Crop the exact character
            $cropRect = New-Object System.Drawing.Rectangle(($cellStartX + $minX), ($cellStartY + $minY), $charW, $charH)
            $charCropped = $img.Clone($cropRect, $img.PixelFormat)

            # Target high-res 200x200 canvas
            $targetSize = 200
            $targetBmp = New-Object System.Drawing.Bitmap($targetSize, $targetSize)
            $g = [System.Drawing.Graphics]::FromImage($targetBmp)
            $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

            # Scale so character fills ~92% of the circle, centered
            $maxDim = [Math]::Max($charW, $charH)
            $fillRatio = 0.92
            $scale = ($targetSize * $fillRatio) / $maxDim
            $destW = [int]($charW * $scale)
            $destH = [int]($charH * $scale)
            $destX = [int](($targetSize - $destW) / 2)
            $destY = [int](($targetSize - $destH) / 2)

            $destRect = New-Object System.Drawing.Rectangle($destX, $destY, $destW, $destH)
            $g.DrawImage($charCropped, $destRect)
            $g.Dispose()
            $charCropped.Dispose()

            $outFilePath = Join-Path $outDir ("avatar_" + $count + ".png")
            $targetBmp.Save($outFilePath, [System.Drawing.Imaging.ImageFormat]::Png)
            $targetBmp.Dispose()
            Write-Host "Avatar ${count}: cropped (${charW} x ${charH}) -> scaled (${destW} x ${destH}) centered at (${destX}, ${destY})"
        }

        $count++
    }
}

$img.Dispose()
Write-Host "All 16 avatars enlarged, centered, cleaned, and saved successfully!"
