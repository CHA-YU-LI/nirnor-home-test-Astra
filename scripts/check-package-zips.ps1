$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$packageRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../packages'))
$zipShell = New-Object -ComObject Shell.Application
$packages = @(Get-ChildItem -LiteralPath $packageRoot -Directory | Where-Object { (Test-Path -LiteralPath (Join-Path $_.FullName 'main.js')) -or (Test-Path -LiteralPath (Join-Path $_.FullName 'src/EffectDemo.vue')) })
if ($packages.Count -eq 0) { throw 'No generated packages found.' }
foreach ($package in $packages) {
    $zipPath = Join-Path $packageRoot ($package.Name + '.zip')
    $shellFolder = $zipShell.NameSpace($zipPath)
    if ($null -eq $shellFolder -or $shellFolder.Items().Count -ne 1) {
        throw "Windows Explorer cannot display the package root: $zipPath"
    }
    $shellRoot = $shellFolder.Items().Item(0)
    if (-not $shellRoot.IsFolder -or $shellRoot.Name -ne $package.Name -or $shellRoot.GetFolder.Items().Count -eq 0) {
        throw "Windows Explorer displays an empty or incorrect folder: $zipPath"
    }
    $archive = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
    try {
        $entries = @($archive.Entries | Where-Object { $_.Name -ne '' })
        $expected = @(Get-ChildItem -LiteralPath $package.FullName -File -Recurse)
        if ($entries.Count -ne $expected.Count) { throw "Missing archive files: $zipPath" }
        foreach ($entry in $entries) {
            if ($entry.FullName.StartsWith('./') -or -not $entry.FullName.StartsWith($package.Name + '/')) {
                throw "Incompatible archive path: $($entry.FullName)"
            }
            $source = [System.IO.Path]::GetFullPath((Join-Path $packageRoot $entry.FullName))
            if (-not $source.StartsWith($package.FullName + [System.IO.Path]::DirectorySeparatorChar)) { throw 'Archive path escapes package.' }
            $bytes = [System.IO.File]::ReadAllBytes($source)
            if ($entry.Length -eq 0 -or $bytes.Length -ne $entry.Length) { throw "Empty or truncated entry: $($entry.FullName)" }
            $stream = $entry.Open()
            $memory = New-Object System.IO.MemoryStream
            $sha = [System.Security.Cryptography.SHA256]::Create()
            try {
                $stream.CopyTo($memory)
                $actualHash = [Convert]::ToBase64String($sha.ComputeHash($memory.ToArray()))
                $expectedHash = [Convert]::ToBase64String($sha.ComputeHash($bytes))
                if ($actualHash -ne $expectedHash) { throw "Content mismatch: $($entry.FullName)" }
            } finally { $sha.Dispose(); $memory.Dispose(); $stream.Dispose() }
        }
        Write-Output "PASS $($package.Name): Windows Explorer visible; $($entries.Count) nonempty files match source."
    } finally { $archive.Dispose() }
}
Write-Output "PASS $($packages.Count) ZIP packages."
