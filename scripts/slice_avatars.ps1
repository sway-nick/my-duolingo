Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\user\.gemini\antigravity\brain\764ddde7-2f60-40c2-b5e4-c4157d283383\.user_uploaded\media_1786950570791.png"
$outDir = "c:\projects\my-duolingo\frontend\assets\avatars"

if (!(Test-Path $outDir)) {
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null
}

$img = [System.Drawing.Bitmap]::FromFile($srcPath)
$totalW = $img.Width
$totalH = $img.Height
Write-Host "Total Size: $totalW x $totalH"

$cols = 4
$rows = 4
$cellW = $totalW / $cols
$cellH = $totalH / $rows

$count = 1
for ($r = 0; $r -lt $rows; $r++) {
    for ($c = 0; $c -lt $cols; $c++) {
        $x = [int]($c * $cellW)
        $y = [int]($r * $cellH)
        $w = [int]$cellW
        $h = [int]$cellH

        $rect = New-Object System.Drawing.Rectangle($x, $y, $w, $h)
        $cropped = $img.Clone($rect, $img.PixelFormat)

        # Scale to standard 180x180
        $targetBmp = New-Object System.Drawing.Bitmap(180, 180)
        $g = [System.Drawing.Graphics]::FromImage($targetBmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.DrawImage($cropped, 0, 0, 180, 180)
        $g.Dispose()

        $outFilePath = Join-Path $outDir ("avatar_" + $count + ".png")
        $targetBmp.Save($outFilePath, [System.Drawing.Imaging.ImageFormat]::Png)
        $targetBmp.Dispose()
        $cropped.Dispose()

        Write-Host "Saved: avatar_$count.png"
        $count++
    }
}

$img.Dispose()
Write-Host "All 16 avatars successfully generated in $outDir"
