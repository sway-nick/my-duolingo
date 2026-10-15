Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path "EnglishBreakfast.aab"))
$entry = $zip.GetEntry("base/manifest/AndroidManifest.xml")
$stream = $entry.Open()
$ms = New-Object System.IO.MemoryStream
$stream.CopyTo($ms)
$bytes = $ms.ToArray()
$str = [System.Text.Encoding]::UTF8.GetString($bytes)
Write-Output "AD_ID in AAB: $( $str.Contains('com.google.android.gms.permission.AD_ID') )"
Write-Output "ACCESS_ADSERVICES_AD_ID in AAB: $( $str.Contains('android.permission.ACCESS_ADSERVICES_AD_ID') )"
$zip.Dispose()
