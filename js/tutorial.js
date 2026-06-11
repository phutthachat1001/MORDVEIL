// ============================================================
// TUTORIAL / ONBOARDING — แนะนำผู้เล่นใหม่ทีละขั้น
// ------------------------------------------------------------
// เกมมีระบบเยอะ (IDLE, งาน, วิวัฒนาการ, skill tree, hub...) — ผู้เล่นใหม่
// อาจหลงทาง การ์ดแนะนำชุดนี้โผล่ครั้งเดียวตอนเริ่มเกมใหม่ อธิบายหัวใจหลัก
// ของเกมแบบสั้นๆ ข้ามได้ และจะไม่โผล่อีกหลังดูจบ (จำผ่าน G.tutorialDone)
// ============================================================

const TUTORIAL_STEPS = [
  { icon:'⚔️', title:'ยินดีต้อนรับสู่การผจญภัย!',
    body:'นี่คือเกม RPG ที่ "ความขยันในชีวิตจริง" = พลังของตัวละคร ทำงานเสร็จ → ได้ EXP → ตัวละครแกร่งขึ้น ไปลุยมอนสเตอร์ได้ไกลขึ้น' },
  { icon:'🌙', title:'IDLE — ฟาร์มอัตโนมัติ',
    body:'แผงตรงกลางคือโหมด IDLE ตัวละครจะตีมอนเองตลอดเวลา ได้ EXP/ทอง/ของแม้คุณไม่ได้แตะ — และระวัง! บางครั้งมี <b>👑 บอสลับ</b> หรือ <b>🗡️ ผู้บุกรุก</b> โผล่มาให้ลุ้นรางวัลใหญ่' },
  { icon:'📝', title:'ทำงานจริง = พลังจริง',
    body:'เพิ่มงานของคุณในแผง "งาน" ทางซ้าย ทำเสร็จแล้วกดเครื่องหมายถูก → ได้ EXP ก้อนใหญ่ ยิ่งงานยาก ยิ่งได้เยอะ ทำต่อเนื่องทุกวันได้ <b>streak</b> โบนัสด้วย' },
  { icon:'🧬', title:'วิวัฒนาการคลาส',
    body:'พอ level ถึงเกณฑ์ คลาสจะวิวัฒนาการได้ ตอน <b>Tier 2</b> คุณจะเข้า <b>♾️ การทดสอบนิรันดร์</b> — ตีมอนไม่จบสิ้น ยิ่งตีเยอะ ยิ่งได้คลาส Tier 3 ที่โหดกว่า และมีโอกาสปลดล็อก <span style="color:#ff00cc">Tier ลับ</span>!' },
  { icon:'🌳', title:'Skill Tree & ของสวมใส่',
    body:'ใช้แต้มสกิลอัพ Skill Tree เพื่อปลดสกิลโจมตี (ใช้ได้ทั้งในศึกและ IDLE) เก็บอาวุธ/เกราะที่ดรอป แล้วสวมใส่ในกระเป๋าเพื่อเพิ่มพลัง' },
  { icon:'🎯', title:'พร้อมแล้ว ลุยเลย!',
    body:'เริ่มจากเพิ่มงานชิ้นแรก หรือปล่อยให้ IDLE ฟาร์มไปก่อนก็ได้ ดูสายวิวัฒนาการทั้งหมดได้ที่แท็บ <b>📖 Codex</b> ขอให้สนุก!' },
];

let _tutStep = 0;

function maybeStartTutorial() {
  if (G.tutorialDone) return;
  // small delay so it appears after the lore popup is dismissed
  _tutStep = 0;
  _renderTutorial();
}

function _renderTutorial() {
  let ov = document.getElementById('tutorial-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'tutorial-overlay';
    document.body.appendChild(ov);
  }
  const s = TUTORIAL_STEPS[_tutStep];
  const last = _tutStep === TUTORIAL_STEPS.length - 1;
  const dots = TUTORIAL_STEPS.map((_, i) =>
    `<span class="tut-dot${i === _tutStep ? ' on' : ''}"></span>`).join('');

  ov.innerHTML = `
    <div class="tut-box">
      <button class="tut-skip" onclick="skipTutorial()">ข้าม ✕</button>
      <div class="tut-icon">${s.icon}</div>
      <div class="tut-title">${s.title}</div>
      <div class="tut-body">${s.body}</div>
      <div class="tut-dots">${dots}</div>
      <div class="tut-actions">
        ${_tutStep > 0 ? `<button class="tut-back" onclick="tutorialPrev()">← ย้อน</button>` : '<span></span>'}
        <button class="tut-next" onclick="tutorialNext()">${last ? '🚀 เริ่มเล่น!' : 'ถัดไป →'}</button>
      </div>
    </div>`;
  ov.classList.add('active');
}

function tutorialNext() {
  if (_tutStep >= TUTORIAL_STEPS.length - 1) { _finishTutorial(); return; }
  _tutStep++;
  _renderTutorial();
}

function tutorialPrev() {
  if (_tutStep > 0) { _tutStep--; _renderTutorial(); }
}

function skipTutorial() { _finishTutorial(); }

function _finishTutorial() {
  G.tutorialDone = true;
  if (typeof saveGame === 'function') saveGame();
  const ov = document.getElementById('tutorial-overlay');
  if (ov) ov.classList.remove('active');
}

// let players replay it from a help button
function replayTutorial() {
  _tutStep = 0;
  _renderTutorial();
}
