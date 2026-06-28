# CLAUDE.md

このファイルは Claude Code（claude.ai/code）がこのリポジトリで作業する際のガイドです。
**スマホ＋PC remote-control での運用を前提に、いつ再接続しても文脈をすぐ把握できるよう記録しています。**

<!-- MEMANTO-MANAGED-SECTION -->
## MEMANTO - Your Active Memory Companion

**MEMANTO is not a passive store. It is an active companion agent that works alongside you.**
Don't treat MEMANTO like a static blob you query once and forget. It's a teammate you keep
talking to, every preference, decision, and correction flows through it. MEMANTO remembers,
recalls, and answers so you hold context across sessions, honor prior decisions, and avoid
repeating mistakes the user already corrected.

Every memory operation in this session goes through MEMANTO. There is no exception.

> **CRITICAL**: All `memanto` commands are **shell commands**. Always run them using the Bash tool.
> Never simulate, describe, or "pretend to call" them. If you cannot run the shell, say so explicitly instead of inventing memory state.

### NON-NEGOTIABLE RULES

These are not suggestions. Follow each one on every turn.

1. **Read `MEMORY.md` before doing anything.** It is auto-synced at session start and holds
   the user's preferences, facts, goals, instructions, decisions, and commitments from every
   prior session. You MUST honor what is written there. If you act against it, you are
   breaking continuity the user is paying for.
2. **Search memory before saying you don't know.** If the user asks about past context, an
   earlier decision, a preference, or anything you are unsure about, you MUST run `recall`
   or `answer` first. Saying "I don't have context" without searching is a failure.
3. **Store proactively. Do not wait to be asked.** The moment a memory-worthy event happens
   — a preference stated, a decision made, a fact learned, an instruction given, a goal set,
   a mistake corrected — run `memanto remember` immediately, in the same turn.
4. **Always pass full metadata to `remember`.** Every `memanto remember` call MUST include
   `--type`, `--confidence`, `--provenance`, and `--source <your_agent_name>`. Never let
   these default. Untyped, unsourced memories pollute the agent's recall quality.
5. **One memory operation goes through MEMANTO. All of them do.** Do not keep mental notes,
   in-context scratch pads, or "I'll remember this for next time" promises. If it matters
   beyond this turn, it goes into MEMANTO. If it doesn't, drop it.

### Memory Operations — Use the Right One

MEMANTO gives you three primitives. They are equal-priority. Pick by intent, not by habit.

| You want to... | Use | Why |
|---|---|---|
| Read raw memory chunks and apply them as context | `memanto recall "query"` | Best for context-building, multi-step work, comparing options |
| Get one synthesized, grounded answer to a direct question | `memanto answer "question"` | Best for "what did we decide / prefer / commit to?" — saves you reading and merging |
| Persist something memory-worthy | `memanto remember "content" --type ... --confidence ... --provenance ... --source ...` | Every preference, decision, fact, instruction, goal, lesson |
| See what changed since last time | `memanto recall --changed-since "last 7 days"` | Catching up after a break |
| See the most recent memories | `memanto recall --recent` | Fast context refresh |

Do NOT always default to `recall`. If the user asked a direct question, `answer` is usually
the right tool — it returns a grounded synthesis so you don't burn tokens re-reading raw
chunks.

### When to Call `remember` (Examples — Run Immediately)

- User says *"I prefer tabs over spaces"*:
  `memanto remember "User prefers tabs over spaces for indentation" --type preference --confidence 1.0 --provenance explicit_statement --source <your_agent_name>`
- You decide to use Library X for reason Y:
  `memanto remember "Chose Library X for reason Y; commit abc123" --type decision --confidence 0.95 --provenance inferred --source <your_agent_name>`
- User corrects an approach:
  `memanto remember "User corrected: use pytest, not unittest" --type learning --confidence 1.0 --provenance corrected --source <your_agent_name>`
- A failed approach taught you something:
  `memanto remember "Batch size > 100 fails with TimeoutError" --type error --confidence 0.95 --provenance observed --source <your_agent_name>`

### Command Reference

```bash
# Store — ALWAYS pass full metadata
memanto remember "content" --type <type> --confidence <0.0-1.0> --provenance <provenance> --source <agent_name>

# Recall raw context
memanto recall "query"                              # semantic search
memanto recall "query" --type <type> --limit 10     # filtered search
memanto recall --recent --limit 10                  # newest first, no query
memanto recall --as-of "2026-01-15"                 # state at a point in time
memanto recall --changed-since "last 7 days"        # what changed since

# Synthesized answer (grounded RAG over memories)
memanto answer "question"

# Re-sync MEMORY.md (project-local cache)
memanto memory sync --project-dir .
```

**Memory types** (use the closest fit, do not invent new ones):
`fact`, `preference`, `instruction`, `decision`, `event`, `goal`, `commitment`,
`observation`, `learning`, `relationship`, `context`, `artifact`, `error`.

**Provenance values**: `explicit_statement`, `inferred`, `observed`, `corrected`,
`validated`, `imported`.

**Confidence**: `1.0` for explicit user statements; `0.9-0.95` for strong consensus;
`0.8-0.85` for observed patterns (3+ times); `0.6-0.75` for emerging patterns.

> **Note**: The `memanto-memory` skill contains reference guidelines only (best practices, confidence levels, tagging). It is NOT executable — always use Bash for memanto commands.
<!-- /MEMANTO-MANAGED-SECTION -->

## プロジェクト概要

初心者向け「株式投資スタイル診断」ツール。10問の質問に答えると、投資スタイルを8タイプのいずれかに診断し、
そのタイプに合った行動（証券口座比較ページ or テーマ解説記事）へ誘導する。

- **ターゲット**: 株式投資に興味を持ち始めた初心者
- **技術スタック**: 純粋な HTML / CSS / JavaScript（フレームワーク・サーバー・DBなし）
- **ホスティング想定**: GitHub Pages（静的配信・無料）
- **コスト**: 月額固定費ゼロ。外部有料API不使用。

## 設計の経緯

このプロジェクトは threads-affiliate フォルダでの会話から設計され、専用フォルダとして独立させたもの。
設計プランの原本: `C:\Users\user\.claude\plans\vivid-nibbling-key.md`

## 診断ロジック

### 2軸構成
- **軸A（投資目的）**: 長期（long） / 短期（short）
- **軸B（興味テーマ）**: テクノロジー・AI（tech） / 生活インフラ・高配当（infra） / グローバル・米国（global） / ESG・社会貢献（esg）

### スコアリング
- 各設問の選択肢が `long/short/tech/infra/global/esg` のいずれかにスコアを加算
- 軸A: long合計 vs short合計 の多い方
- 軸B: tech/infra/global/esg の合計が最大のもの

### タイブレーク（同点時の優先順位）
- 軸A 同点 → **long（長期）**（初心者に短期投機を勧めない誠実設計）
- 軸B 同点 → **tech > global > infra > esg**（初心者の認知度順）

### 結果タイプ（8タイプ = 軸A 2 × 軸B 4）
| タイプID | 名称（仮） |
|---------|-----------|
| long-tech | 未来を育てる成長投資家 |
| long-infra | 安定収入を積み上げる配当投資家 |
| long-global | 世界経済に乗る分散投資家 |
| long-esg | 価値観で選ぶ社会貢献投資家 |
| short-tech | スピード重視のテックトレーダー |
| short-infra | 値動きを狙うインフラトレーダー |
| short-global | 為替・指数を読む国際トレーダー |
| short-esg | トレンドを先読みするESGトレーダー |

### CTA（証券口座の有無で分岐）
最後にスクリーニング設問「証券口座はお持ちですか？」を置く（診断スコアには影響しない）。
- **持っている** → そのタイプに合ったテーマ解説記事へ
- **持っていない** → 口座開設アフィリエイトページへ

## ファイル構成

```
index.html   # マークアップ・レイアウト
style.css    # スタイル・アニメーション
data.js      # QUESTIONS / RESULTS / CONFIG ★差し替えポイント
quiz.js      # スコアリング・画面遷移ロジック（dataに依存）
```

**重要: 後から実データに差し替える箇所はすべて `data.js` に集約している。**
RESULTS の説明文・おすすめ銘柄・CTAリンクは現在すべて仮テキスト（【仮】表記）。

## トーン・文言ルール

- 不安を煽る表現・誇大表現は使わない
- 誠実で納得感のある言い回しにする
- 「必ず儲かる」等の断定的な投資推奨表現は禁止

## 開発フロー

1. `data.js` でデータ定義 → `quiz.js` でロジック → `index.html`/`style.css` でUI
2. ローカルでブラウザ確認（全8タイプ到達・タイブレーク・CTA分岐）
3. GitHub Pages で公開

## 進捗確認

現在のタスク状況は `work_session.json` を読めば把握できる。

---

## 他プロジェクトとの連携

このプロジェクトは以下の2プロジェクトと連携している。**他プロジェクトのファイルは読み取り専用（編集しない）。**

### note-fukugyou（`C:\Users\user\note-fukugyou`）
- X（@picopicomoto）×note（note.com/moto0716）のコンテンツ販売プロジェクト
- PPC（ピコ式ポストClaudeライティング）ブランド確立中
- **investment-quizからの導線**: 結果画面の「noteで投資の基礎を読む」ボタン
- **引き渡し用ドラフト**: `drafts/note_article_quiz.md`・`drafts/x_post_quiz_announce.md`
- noteのURLを記事公開後に差し替える場所: `data.js` の `CONFIG.links.note`

### threads-affiliate（`C:\Users\user\threads-affiliate`）
- 楽天アフィリエイト×Threads 自動投稿システム（毎日2回稼働中）
- 直接の連携はないが、投資テーマの投稿とターゲット層が重なる

### キャラクター統一
- `cat.png`（白黒猫）はXアイコン・note・全プロジェクト共通のキャラクター
- note-fukugyouの `work_session.json` にも「猫キャラに変更（未着手）」のタスクがある
- 画像ファイルのパス: `C:\Users\user\investment-quiz\cat.png`

### 他プロジェクトへの情報共有方法
- このプロジェクトの最新状態は `work_session.json` に記録
- note-fukugyouセッションで「investment-quizの状況は？」と聞かれたら
  `C:\Users\user\investment-quiz\work_session.json` を読んで答える
- 引き渡し用ドラフトは `drafts/` フォルダに格納

---

## 情報インプット（GoogleDrive連携）

- スクショ・資料はGoogleDrive「X運用」フォルダ（ID: `133kjRbbcZaMYwFWwpZglj6b1RRLIabnO`）に入れる
- 「フォルダ確認して」と言われたら `/drive` スキルを実行する
- 処理済みログ：`context/gdrive_processed.md`（照合用）
- 処理済みの情報はすべて `context/resources.md` に蓄積される
- 処理後はDriveのファイルを手動削除する運用（処理済みログで二重処理は防げる）

---

## 新しいチャットを開いたときの最初の指示文

このフォルダで新しいClaudeセッションを起動したら、以下をそのまま貼り付けて送信する：

```
work_session.json と CLAUDE.md を読んで現状を把握して。
前のセッションの続きから始めたい。
```

これだけで設計経緯・実装状況・ペンディングタスクをすべて把握した状態でスタートできる。
