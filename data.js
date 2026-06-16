/* ============================================================
 * data.js — 診断データ定義（★実データ差し替えはこのファイルで完結）
 *
 *  CONFIG    : 判定ルール・タイブレーク設定
 *  QUESTIONS : 設問と選択肢（スコア付き）
 *  RESULTS   : 結果タイプの本文・おすすめ・CTA
 *
 *  ※ RESULTS の description / recommend / cta.url は現在すべて仮テキスト。
 *    根拠データが揃ったら【仮】表記の箇所を差し替える。
 * ============================================================ */

const CONFIG = {
  // 軸A: 同点時はどちらを採用するか
  axisA: {
    keys: ['long', 'short'],
    tieBreaker: 'long', // 初心者に短期投機を勧めない誠実設計
    labels: { long: '長期', short: '短期' },
  },
  // 軸B: 同点時の優先順位（先頭ほど優先）
  axisB: {
    keys: ['tech', 'infra', 'global', 'esg'],
    tieBreaker: ['tech', 'global', 'infra', 'esg'], // 初心者の認知度順
    labels: {
      tech: 'テクノロジー・AI',
      infra: '生活インフラ・高配当',
      global: 'グローバル・米国',
      esg: 'ESG・社会貢献',
    },
  },
};

const QUESTIONS = [
  // ---- 軸A 判定用（Q1〜Q4） ----
  {
    id: 1,
    axis: 'A',
    text: '投資を始めようと思ったきっかけは？',
    choices: [
      { text: '老後や将来の不安を減らしたい', scores: { long: 1 } },
      { text: '副収入を増やして生活を豊かにしたい', scores: { long: 1 } },
      { text: '短い期間で資産を増やしたい', scores: { short: 1 } },
      { text: '売買そのものに興味がある', scores: { short: 1 } },
    ],
  },
  {
    id: 2,
    axis: 'A',
    text: '株を持つとしたら、どのくらいの期間を想定していますか？',
    choices: [
      { text: '数日〜数週間', scores: { short: 2 } },
      { text: '数ヶ月くらい', scores: { short: 1 } },
      { text: '1〜3年くらい', scores: { long: 1 } },
      { text: '5年以上じっくり', scores: { long: 2 } },
    ],
  },
  {
    id: 3,
    axis: 'A',
    text: '持っている株が一時的に20%下がったら、どうしたいですか？',
    choices: [
      { text: 'いったん売って様子を見たい', scores: { short: 1 } },
      { text: '何もせず保有を続ける', scores: { long: 1 } },
      { text: '長期目線なので気にせず持ち続ける', scores: { long: 2 } },
      { text: '割安と考えて買い増したい', scores: { long: 2 } },
    ],
  },
  {
    id: 4,
    axis: 'A',
    text: '株価をチェックする頻度はどのくらいになりそうですか？',
    choices: [
      { text: '1日に何度も見たい', scores: { short: 2 } },
      { text: '1日1回くらい', scores: { short: 1 } },
      { text: '週に1回くらい', scores: { long: 1 } },
      { text: '月に1回くらいで十分', scores: { long: 2 } },
    ],
  },

  // ---- 軸B 判定用（Q5〜Q9） ----
  {
    id: 5,
    axis: 'B',
    text: 'どんなニュースがいちばん気になりますか？',
    choices: [
      { text: 'AI・テクノロジーの最新動向', scores: { tech: 1 } },
      { text: '国内の景気や金利の動き', scores: { infra: 1 } },
      { text: '米国市場や為替の動き', scores: { global: 1 } },
      { text: '環境問題や社会課題', scores: { esg: 1 } },
    ],
  },
  {
    id: 6,
    axis: 'B',
    text: '投資先を選ぶとき、いちばん重視したいのは？',
    choices: [
      { text: 'これからの成長性', scores: { tech: 1, long: 1 } },
      { text: '安定した配当', scores: { infra: 1, long: 1 } },
      { text: '世界全体への分散', scores: { global: 1, long: 1 } },
      { text: '社会への良い影響', scores: { esg: 1 } },
    ],
  },
  {
    id: 7,
    axis: 'B',
    text: '休日に読むなら、どの記事を選びますか？',
    choices: [
      { text: '次世代テクノロジーの最前線', scores: { tech: 1 } },
      { text: '優良な高配当株の見つけ方', scores: { infra: 1 } },
      { text: 'S&P500・全世界株の長期リターン', scores: { global: 1 } },
      { text: 'SDGs・脱炭素に取り組む企業', scores: { esg: 1 } },
    ],
  },
  {
    id: 8,
    axis: 'B',
    text: '応援したい企業や産業は、どれに近いですか？',
    choices: [
      { text: '日本発のIT・スタートアップ', scores: { tech: 1 } },
      { text: '生活を支えるインフラ企業', scores: { infra: 1 } },
      { text: '世界で活躍する多国籍企業', scores: { global: 1 } },
      { text: '社会課題の解決に挑む企業', scores: { esg: 1 } },
    ],
  },
  {
    id: 9,
    axis: 'B',
    text: '理想のリターンの形に近いのは？',
    choices: [
      { text: '毎年コツコツ配当を受け取る', scores: { infra: 1, long: 1 } },
      { text: '時間をかけて資産を大きく育てる', scores: { tech: 1, long: 1 } },
      { text: '世界の成長に幅広く乗る', scores: { global: 1, long: 1 } },
      { text: '社会に貢献しながら適度に増やす', scores: { esg: 1, long: 1 } },
    ],
  },

  // ---- スクリーニング（Q10・スコアに影響しない） ----
  {
    id: 10,
    axis: 'screening',
    text: '証券口座はお持ちですか？',
    choices: [
      { text: 'はい、持っています', screening: 'hasAccount' },
      { text: 'いいえ、まだ持っていません', screening: 'noAccount' },
    ],
  },
];

/* ------------------------------------------------------------
 * RESULTS — 結果タイプ（8種）
 *   キーは `${axisA}-${axisB}` 形式（例: 'long-tech'）
 *   description / recommend / cta.url は【仮】。実データで差し替え。
 * ------------------------------------------------------------ */
const RESULTS = {
  'long-tech': {
    name: '未来を育てる成長投資家',
    catch: '技術の進歩を、時間をかけて味方にするタイプ',
    description:
      '【仮テキスト】AI やテクノロジーの長期的な成長に期待し、数年〜10年という長いスパンで保有していくスタイルです。日々の値動きより、企業がこれから生み出す価値に目を向けます。',
    recommend: '【仮】半導体・クラウド・AI関連の成長株、テクノロジーセクターのインデックスなど',
    cta: {
      hasAccount: { label: '成長株の選び方を読む', url: '#article-tech' },
      noAccount: { label: 'まずは証券口座を比較する', url: '#account-compare' },
    },
  },
  'long-infra': {
    name: '安定収入を積み上げる配当投資家',
    catch: '受け取る配当を、じっくり積み上げるタイプ',
    description:
      '【仮テキスト】電力・通信・食品など、生活に欠かせない企業の安定した配当を重視するスタイルです。大きな値上がりより、長く持ち続けて受け取る収入に魅力を感じます。',
    recommend: '【仮】高配当の生活インフラ株、連続増配株、高配当ETFなど',
    cta: {
      hasAccount: { label: '高配当株の選び方を読む', url: '#article-infra' },
      noAccount: { label: 'まずは証券口座を比較する', url: '#account-compare' },
    },
  },
  'long-global': {
    name: '世界経済に乗る分散投資家',
    catch: '世界全体の成長に、幅広く乗るタイプ',
    description:
      '【仮テキスト】特定の国や企業に絞らず、米国や全世界に幅広く分散して長期で持つスタイルです。世界経済全体の成長をリターンの源泉と考えます。',
    recommend: '【仮】S&P500・全世界株（オルカン）などのインデックスファンドなど',
    cta: {
      hasAccount: { label: 'インデックス投資を読む', url: '#article-global' },
      noAccount: { label: 'まずは証券口座を比較する', url: '#account-compare' },
    },
  },
  'long-esg': {
    name: '価値観で選ぶ社会貢献投資家',
    catch: '応援したい未来に、お金を託すタイプ',
    description:
      '【仮テキスト】環境や社会課題の解決に取り組む企業を、長期で応援するスタイルです。リターンと同じくらい「どんな未来に投資するか」を大切にします。',
    recommend: '【仮】ESG・脱炭素関連の企業やテーマファンドなど',
    cta: {
      hasAccount: { label: 'ESG投資を読む', url: '#article-esg' },
      noAccount: { label: 'まずは証券口座を比較する', url: '#account-compare' },
    },
  },
  'short-tech': {
    name: 'スピード重視のテックトレーダー',
    catch: '話題の技術の波を、機動的に狙うタイプ',
    description:
      '【仮テキスト】AI やテクノロジーの話題で動く株を、比較的短い期間で売買していくスタイルです。値動きの大きさを機会と捉えます。短期売買はリスクも伴う点に注意しましょう。',
    recommend: '【仮】値動きの大きいテック・グロース株など（※リスク管理が前提）',
    cta: {
      hasAccount: { label: 'テック株の動向を読む', url: '#article-tech' },
      noAccount: { label: 'まずは証券口座を比較する', url: '#account-compare' },
    },
  },
  'short-infra': {
    name: '値動きを狙うインフラトレーダー',
    catch: '身近な産業の値動きを、こまめに捉えるタイプ',
    description:
      '【仮テキスト】生活インフラ系の銘柄を、比較的短い期間で売買していくスタイルです。馴染みのある産業の値動きを機会と捉えます。短期売買はリスクも伴う点に注意しましょう。',
    recommend: '【仮】出来高のある国内インフラ・素材関連株など（※リスク管理が前提）',
    cta: {
      hasAccount: { label: '国内株の動向を読む', url: '#article-infra' },
      noAccount: { label: 'まずは証券口座を比較する', url: '#account-compare' },
    },
  },
  'short-global': {
    name: '為替・指数を読む国際トレーダー',
    catch: '世界の指数や為替の動きを、読み解くタイプ',
    description:
      '【仮テキスト】米国指数や為替の動きをもとに、比較的短い期間で売買していくスタイルです。グローバルな市場の流れを機会と捉えます。短期売買はリスクも伴う点に注意しましょう。',
    recommend: '【仮】米国株・指数連動商品、為替の影響を受ける銘柄など（※リスク管理が前提）',
    cta: {
      hasAccount: { label: '米国市場の動向を読む', url: '#article-global' },
      noAccount: { label: 'まずは証券口座を比較する', url: '#account-compare' },
    },
  },
  'short-esg': {
    name: 'トレンドを先読みするESGトレーダー',
    catch: '社会のトレンドの芽を、いち早く捉えるタイプ',
    description:
      '【仮テキスト】環境・社会のトレンドで動くテーマ株を、比較的短い期間で売買していくスタイルです。話題性のある変化を機会と捉えます。短期売買はリスクも伴う点に注意しましょう。',
    recommend: '【仮】脱炭素・再生エネルギーなどテーマ性のある銘柄など（※リスク管理が前提）',
    cta: {
      hasAccount: { label: 'ESGテーマの動向を読む', url: '#article-esg' },
      noAccount: { label: 'まずは証券口座を比較する', url: '#account-compare' },
    },
  },
};
