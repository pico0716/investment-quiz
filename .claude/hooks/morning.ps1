$json = [Console]::In.ReadToEnd()
if ([string]::IsNullOrWhiteSpace($json)) { exit 0 }

try {
    $data = $json | ConvertFrom-Json
} catch { exit 0 }

if ($data.prompt -match 'おはよう') {
    $projectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

    $candidates = @(
        (Join-Path $projectRoot 'context\tasks.md'),
        (Join-Path $projectRoot 'work_session.json'),
        (Join-Path $projectRoot 'MEMORY.md')
    )

    foreach ($file in $candidates) {
        if (Test-Path $file) {
            $name = Split-Path $file -Leaf
            Write-Output "=== $name（自動読み込み）==="
            Get-Content $file | Write-Output
            break
        }
    }
}
