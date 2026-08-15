# Stop フック: セッションの状態を context/session_state.md へ機械的に書き出す。
# 要約・判断はしない（転記のみ）。LLM や外部 API は呼ばないためコストは発生しない。
$projectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$logDir = Join-Path $projectRoot 'logs'

try {
    $json = [Console]::In.ReadToEnd()
    if ([string]::IsNullOrWhiteSpace($json)) { exit 0 }
    $data = $json | ConvertFrom-Json

    $transcript = $data.transcript_path
    if (-not $transcript -or -not (Test-Path $transcript)) { exit 0 }

    # 毎ターン走るので直近ぶんだけ読む
    $lines = Get-Content $transcript -Encoding UTF8 -Tail 2000
    $objs = foreach ($l in $lines) { try { $l | ConvertFrom-Json } catch {} }

    $prompts = @()
    $files = @()
    foreach ($o in $objs) {
        if ($o.type -eq 'user') {
            $c = $o.message.content
            $t = if ($c -is [string]) { $c }
                 else { ($c | Where-Object { $_.type -eq 'text' } | ForEach-Object { $_.text }) -join ' ' }
            # tool_result や system-reminder 等の埋め込みは除外し、人の発話だけ残す
            if ($t -and $t.Trim() -and $t.Trim() -notlike '<*') {
                $prompts += [pscustomobject]@{ time = $o.timestamp; text = $t.Trim() }
            }
        }
        elseif ($o.type -eq 'assistant') {
            foreach ($b in $o.message.content) {
                if ($b.type -eq 'tool_use' -and $b.name -in @('Edit', 'Write', 'NotebookEdit') -and $b.input.file_path) {
                    $files += $b.input.file_path
                }
            }
        }
    }

    $sb = New-Object System.Text.StringBuilder
    [void]$sb.AppendLine('# セッション状態スナップショット')
    [void]$sb.AppendLine()
    [void]$sb.AppendLine('自動生成（Stop フック）。手で書いても次のターンで上書きされる。')
    [void]$sb.AppendLine('これは発話の転記であって要約ではない。判断を含む内容は tasks.md 側に書くこと。')
    [void]$sb.AppendLine()
    [void]$sb.AppendLine("- 更新: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
    [void]$sb.AppendLine("- プロジェクト: $projectRoot")
    [void]$sb.AppendLine("- transcript: $transcript")
    [void]$sb.AppendLine()
    [void]$sb.AppendLine('## 直近のユーザー発話（古い順・最大8件）')
    [void]$sb.AppendLine()
    foreach ($p in ($prompts | Select-Object -Last 8)) {
        $tx = $p.text -replace '\s+', ' '
        if ($tx.Length -gt 120) { $tx = $tx.Substring(0, 120) + '…' }
        $ts = try { ([datetime]$p.time).ToLocalTime().ToString('MM-dd HH:mm') } catch { '??' }
        [void]$sb.AppendLine("- [$ts] $tx")
    }
    [void]$sb.AppendLine()
    [void]$sb.AppendLine('## このセッションで編集したファイル（最大20件）')
    [void]$sb.AppendLine()
    $uniqueFiles = $files | Select-Object -Unique | Select-Object -Last 20
    if ($uniqueFiles) {
        foreach ($x in $uniqueFiles) { [void]$sb.AppendLine("- $x") }
    } else {
        [void]$sb.AppendLine('- （なし）')
    }

    $outDir = Join-Path $projectRoot 'context'
    if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
    $utf8 = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText((Join-Path $outDir 'session_state.md'), $sb.ToString(), $utf8)
}
catch {
    if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }
    "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') save_state.ps1: $($_.Exception.Message)" |
        Out-File (Join-Path $logDir 'hook_error.log') -Append -Encoding utf8
}

exit 0
