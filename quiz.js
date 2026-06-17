/* ============================================================
 * quiz.js — 画面遷移・スコアリング・結果判定ロジック
 *   data.js（CONFIG / QUESTIONS / RESULTS）に依存する。
 * ============================================================ */

(function () {
  'use strict';

  // ---- 状態 ----
  const state = {
    step: 0, // 0 = トップ画面、1〜QUESTIONS.length = 各設問
    scores: { long: 0, short: 0, tech: 0, infra: 0, global: 0, esg: 0 },
    screening: null, // 'hasAccount' | 'noAccount'
  };

  // ---- DOM参照 ----
  const $app = document.getElementById('app');

  // ============================================================
  // スコアリング・判定
  // ============================================================

  function applyChoice(choice) {
    if (choice.scores) {
      for (const key in choice.scores) {
        state.scores[key] = (state.scores[key] || 0) + choice.scores[key];
      }
    }
    if (choice.screening) {
      state.screening = choice.screening;
    }
  }

  // 同点を考慮して最大キーを選ぶ（tieBreakerは優先順位配列）
  function pickByTieBreaker(scores, keys, tieBreaker) {
    let max = -Infinity;
    keys.forEach((k) => {
      if ((scores[k] || 0) > max) max = scores[k] || 0;
    });
    const top = keys.filter((k) => (scores[k] || 0) === max);
    if (top.length === 1) return top[0];
    // 同点 → tieBreaker の並び順で最初に来るものを採用
    for (const k of tieBreaker) {
      if (top.includes(k)) return k;
    }
    return top[0];
  }

  function determineResult() {
    const a = CONFIG.axisA;
    const b = CONFIG.axisB;

    // 軸A: long vs short（同点は単一文字列のtieBreaker）
    const aTie = Array.isArray(a.tieBreaker) ? a.tieBreaker : [a.tieBreaker];
    const axisA = pickByTieBreaker(state.scores, a.keys, aTie);

    // 軸B: 4テーマの最大
    const axisB = pickByTieBreaker(state.scores, b.keys, b.tieBreaker);

    const typeId = `${axisA}-${axisB}`;
    return { typeId, axisA, axisB, result: RESULTS[typeId] };
  }

  // ============================================================
  // レンダリング
  // ============================================================

  function render() {
    if (state.step === 0) {
      renderIntro();
    } else if (state.step <= QUESTIONS.length) {
      renderQuestion(QUESTIONS[state.step - 1]);
    } else {
      renderResult();
    }
    // 画面切り替え時に上部へスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderIntro() {
    $app.innerHTML = `
      <section class="screen intro fade-in">
        <p class="eyebrow">かんたん10問・約1分</p>
        <h1 class="title">株式投資スタイル診断</h1>
        <p class="lead">
          「長期か短期か」「どんなテーマに興味があるか」から、
          あなたに合った投資スタイルを8タイプで診断します。
          投資を始めたばかりの方が、最初の一歩を選ぶヒントに。
        </p>
        <button class="btn btn-primary" id="startBtn">診断をはじめる</button>
        <p class="disclaimer">
          ※本診断は投資スタイルの傾向を知るための簡易ツールです。
          特定の銘柄の購入を推奨・保証するものではありません。
        </p>
      </section>`;
    document.getElementById('startBtn').addEventListener('click', next);
  }

  function renderQuestion(q) {
    const total = QUESTIONS.length;
    const current = state.step;
    const pct = Math.round((current / total) * 100);

    const choicesHtml = q.choices
      .map(
        (c, i) =>
          `<button class="btn btn-choice" data-idx="${i}">${escapeHtml(c.text)}</button>`
      )
      .join('');

    $app.innerHTML = `
      <section class="screen question fade-in">
        <div class="progress">
          <div class="progress-bar" style="width:${pct}%"></div>
        </div>
        <p class="q-counter">Q${current} <span>/ ${total}</span></p>
        <h2 class="q-text">${escapeHtml(q.text)}</h2>
        <div class="choices">${choicesHtml}</div>
        ${current > 1 ? '<button class="btn-back" id="backBtn">← 前の質問にもどる</button>' : ''}
      </section>`;

    $app.querySelectorAll('.btn-choice').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.idx);
        onAnswer(q, idx);
      });
    });
    const backBtn = document.getElementById('backBtn');
    if (backBtn) backBtn.addEventListener('click', back);
  }

  function renderResult() {
    const { typeId, result } = determineResult();
    if (!result) {
      $app.innerHTML = `<section class="screen"><p>診断結果を取得できませんでした（${escapeHtml(
        typeId
      )}）。お手数ですが再度お試しください。</p><button class="btn btn-primary" id="retryBtn">もう一度診断する</button></section>`;
      document.getElementById('retryBtn').addEventListener('click', reset);
      return;
    }

    // CTAは口座有無で出し分け
    const ctaKey = state.screening || 'noAccount';
    const cta = result.cta[ctaKey];

    $app.innerHTML = `
      <section class="screen result fade-in">
        <p class="eyebrow">あなたの投資スタイルは</p>
        <h1 class="result-name">${escapeHtml(result.name)}</h1>
        <p class="result-catch">${escapeHtml(result.catch)}</p>

        <div class="card">
          <h3>こんなスタイルです</h3>
          <p>${escapeHtml(result.description)}</p>
        </div>

        <div class="card">
          <h3>たとえばこんな投資先</h3>
          <p>${escapeHtml(result.recommend)}</p>
        </div>

        <a class="btn btn-primary btn-cta" href="${encodeURI(cta.url)}">${escapeHtml(
      cta.label
    )}</a>

        <button class="btn btn-ghost" id="retryBtn">もう一度診断する</button>

        <div class="sns-block">
          <div class="sns-mascot">
            <img src="./cat.png" alt="キャラクター" class="mascot-img" />
            <div class="speech-bubble">気になることがあれば<br>気軽に相談してね！</div>
          </div>
          <a class="btn btn-sns btn-note" href="${encodeURI(CONFIG.links.note)}" target="_blank" rel="noopener">
            📝 noteで投資の基礎を読む
          </a>
          <a class="btn btn-sns btn-x" href="${encodeURI(CONFIG.links.x)}" target="_blank" rel="noopener">
            X（旧Twitter）でフォロー・相談する
          </a>
          ${CONFIG.links.line ? `<a class="btn btn-sns btn-line" href="${encodeURI(CONFIG.links.line)}" target="_blank" rel="noopener">LINEで相談する</a>` : ''}
        </div>

        <p class="disclaimer">
          ※本診断は投資判断を保証するものではありません。
          実際の投資はご自身の判断と責任で行ってください。
        </p>
      </section>`;
    document.getElementById('retryBtn').addEventListener('click', reset);
  }

  // ============================================================
  // 遷移
  // ============================================================

  function onAnswer(q, idx) {
    applyChoice(q.choices[idx]);
    // 戻る対応のため、回答を履歴に積む
    history.push({ step: state.step, choice: idx, q });
    next();
  }

  // 「戻る」用の履歴（スコアの巻き戻しに使う）
  const history = [];

  function next() {
    state.step += 1;
    render();
  }

  function back() {
    const last = history.pop();
    if (!last) return;
    // スコアを巻き戻す
    const choice = last.q.choices[last.choice];
    if (choice.scores) {
      for (const key in choice.scores) {
        state.scores[key] -= choice.scores[key];
      }
    }
    if (choice.screening) state.screening = null;
    state.step = last.step;
    render();
  }

  function reset() {
    state.step = 0;
    state.scores = { long: 0, short: 0, tech: 0, infra: 0, global: 0, esg: 0 };
    state.screening = null;
    history.length = 0;
    render();
  }

  // ============================================================
  // ユーティリティ
  // ============================================================

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ============================================================
  // 起動
  // ============================================================
  document.addEventListener('DOMContentLoaded', render);

  // デバッグ用：コンソールから現在スコアを確認できるよう公開
  window.__quizState = state;
})();
