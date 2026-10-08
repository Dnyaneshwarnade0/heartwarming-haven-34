Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$sourceDir = "C:\Users\Dell\.gemini\antigravity\scratch\gurukulam-student-management"
$targetZip = "C:\Users\Dell\Downloads\gurukulam-student-management.zip"
$desktopZip = "C:\Users\Dell\Desktop\gurukulam-student-management.zip"

if (Test-Path $targetZip) { Remove-Item $targetZip -Force }

$zip = [System.IO.Compression.ZipFile]::Open($targetZip, [System.IO.Compression.ZipArchiveMode]::Create)

$files = Get-ChildItem -Path $sourceDir -Recurse -File | Where-Object {
    $rel = $_.FullName.Substring($sourceDir.Length + 1)
    $rel -notmatch '^node_modules' -and $rel -notmatch '\\node_modules\\' -and $rel -notmatch '^\.git' -and $rel -notmatch '\\\.git\\'
}

Write-Host "Total files to compress: $($files.Count)"

foreach ($file in $files) {
    $relativePath = $file.FullName.Substring($sourceDir.Length + 1).Replace('\', '/')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $relativePath, [System.IO.Compression.CompressionLevel]::Optimal)
}

$zip.Dispose()

$info = Get-Item $targetZip
$sizeMB = [math]::Round($info.Length / 1MB, 2)
Write-Host "ZIP created at: $($info.FullName) ($sizeMB MB)"

Copy-Item $targetZip $desktopZip -Force
Write-Host "ZIP also copied to Desktop: $desktopZip"
