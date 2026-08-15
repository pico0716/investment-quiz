$json = [Console]::In.ReadToEnd()
if ([string]::IsNullOrWhiteSpace($json)) { exit 0 }

try {
    $data = $json | ConvertFrom-Json
} catch { exit 0 }

# 「おはよう」または短い「続き」系の呼びかけで、続行用ファイルを自動で読み込む
if ($data.prompt -match 'おはよう' -or ($data.prompt -match '続き' -and $data.prompt.Length -le 20)) {
    $projectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

    # 前回セッションの自動スナップショット（あれば先に出す）
    $state = Join-Path $projectRoot 'context\session_state.md'
    if (Test-Path $state) {
        Write-Output "=== session_state.md（自動読み込み）==="
        Get-Content $state -Encoding UTF8 | Write-Output
        Write-Output ""
    }

    $candidates = @(
        (Join-Path $projectRoot 'context\tasks.md'),
        (Join-Path $projectRoot 'work_session.json'),
        (Join-Path $projectRoot 'MEMORY.md')
    )

    foreach ($file in $candidates) {
        if (Test-Path $file) {
            $name = Split-Path $file -Leaf
            Write-Output "=== $name（自動読み込み）==="
            Get-Content $file -Encoding UTF8 | Write-Output
            break
        }
    }
}
