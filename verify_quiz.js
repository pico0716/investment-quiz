// verify_quiz.js — 診断フロー確認スクリプト
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const filePath = 'file:///' + path.resolve(__dirname, 'index.html').replace(/\\/g, '/');
  await page.goto(filePath);

  // トップ画面
  await page.screenshot({ path: 'ss_01_intro.png' });
  console.log('✅ 01: トップ画面');

  // 診断開始
  await page.click('#startBtn');
  await page.screenshot({ path: 'ss_02_q1.png' });
  console.log('✅ 02: Q1表示');

  // Q1〜Q9: 全部1番目の選択肢を選ぶ（long-tech ルートを想定）
  for (let i = 1; i <= 9; i++) {
    await page.click('.btn-choice:first-child');
    await page.waitForTimeout(300);
    console.log(`✅ Q${i} 回答`);
  }
  await page.screenshot({ path: 'ss_03_q10.png' });
  console.log('✅ 03: Q10（口座有無）表示');

  // Q10: 口座あり
  await page.click('.btn-choice:first-child');
  await page.waitForTimeout(300);

  // 結果画面
  await page.screenshot({ path: 'ss_04_result.png', fullPage: true });
  const resultName = await page.textContent('.result-name');
  const description = await page.textContent('.card:first-of-type p');
  const recommend = await page.textContent('.card:nth-of-type(2) p');
  const ctaText = await page.textContent('.btn-cta');

  console.log('✅ 04: 結果画面');
  console.log('  タイプ名:', resultName);
  console.log('  description:', description.slice(0, 40) + '...');
  console.log('  recommend:', recommend);
  console.log('  CTA:', ctaText);

  // 仮テキストチェック
  if (recommend.includes('【仮】')) {
    console.log('❌ recommend に【仮】が残っています');
  } else {
    console.log('✅ recommend に【仮】なし');
  }

  await browser.close();
})();
