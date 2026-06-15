// ============================================================
// IDLE ENCOUNTERS — ทำให้การฟาร์ม IDLE มีชีวิตชีวา
// ------------------------------------------------------------
// แทรกเหตุการณ์พิเศษเข้าไปในวงจร IDLE ที่มีอยู่ (reuse การ render/ตี/ดรอป
// ทั้งหมดของ idle.js) โดยเพิ่ม "มอนพิเศษ" เข้า _idleMobs:
//   • 👑 บอสลับ (Mini-Boss) — โผล่กลางการฟาร์ม HP เยอะ มี timer
//       ฆ่าทันเวลา → รางวัลใหญ่ (หีบบอส + ทองก้อน)
//   • 🗡️ ผู้บุกรุก (Raider) — "ผู้เล่น" อีกคน (สุ่มชื่อ/คลาส) เข้ามาท้าดวล
//       ชนะ → ปล้นทอง/EXP; ฆ่าไม่ทันมันหนีไป
//   • 🔥 Kill-streak combo — ฆ่าต่อเนื่องเร็วๆ สะสม combo → โบนัส EXP/ทอง
// ============================================================

// ---------- config ----------
const IDLE_ENC = {
  bossChancePerWave:   0.06,   // 6% ต่อการ spawn wave ใหม่
  raiderChancePerWave: 0.05,   // 5%
  minKillsBeforeEvent: 8,      // ต้องฟาร์มอุ่นเครื่องก่อน
  eventCooldownMs:     45000,  // เว้นอย่างน้อย 45 วิระหว่าง event พิเศษ
  bossHpMult:          7,      // เทียบ idle mob ปกติ
  bossTimerMs:         22000,  // เวลาฆ่าบอส
  raiderHpMult:        4,
  raiderTimerMs:       16000,
  comboWindowMs:       4500,   // ฆ่าตัวถัดไปภายในเวลานี้ = combo ต่อ
};

// ชื่อ "ผู้เล่น" สุ่มสำหรับ raider (ให้รู้สึกเหมือนเจอคนจริง)
const RAIDER_NAMES = [
  'DarkSlayer99','เงาพิฆาต','xX_โหด_Xx','MercyKill','ราชานักล่า',
  'NoobMaster69','สายฟ้าฟาด','ShadowReaper','มังกรเดียวดาย','VoidWalker',
  'เด็กเก็บเลเวล','ProGamerTH','นักบุญดำ','OneShotKO','ผีดิบเดินดิน',
];
const RAIDER_CLASSES = ['warrior','mage','rogue','archer','paladin'];

let _idleLastEventAt = 0;
let _idleComboCount  = 0;
let _idleComboExpire = 0;
let _idleActiveSpecial = null;   // {type, timerId, mob}

// ---------- hook: maybe turn a fresh wave into a special encounter ----------
// called by idle.js _spawnIdleWave() right after it builds _idleMobs
function idleMaybeSpawnSpecial() {
  if (!_idleMobs || !_idleMobs.length) return;
  if (_idleActiveSpecial) return;                       // one at a time
  if ((_idleSessionKills || 0) < IDLE_ENC.minKillsBeforeEvent) return;
  const now = performance.now();
  if (now - _idleLastEventAt < IDLE_ENC.eventCooldownMs) return;

  const roll = Math.random();
  if (roll < IDLE_ENC.bossChancePerWave) {
    _spawnIdleBoss();
  } else if (roll < IDLE_ENC.bossChancePerWave + IDLE_ENC.raiderChancePerWave) {
    _spawnIdleRaider();
  }
}

// ---------- 👑 mini-boss ----------
function _spawnIdleBoss() {
  const pool = (typeof _idleMonsterPool === 'function') ? _idleMonsterPool() : [];
  const base = pool[Math.floor(Math.random() * pool.length)] || { name:'มอน', tier:1, zone:1 };
  const full = getMonsterStats(base.zone, Math.min(6, (base.tier||1)+2), true);
  const hp = Math.max(50, Math.floor(full.maxHp * IDLE_HP_MULT * IDLE_ENC.bossHpMult));
  const bountyGold = Math.floor(full.atk * 6) + 100; // ลดครึ่งกันเงินเฟ้อ

  const boss = {
    name: '👑 ' + (base.name || 'จอมมอน') + ' (บอสลับ)',
    sprite: '👑', img: base.img,
    tier: base.tier, zone: base.zone,
    hp, maxHp: hp,
    atk: Math.max(1, Math.floor(full.atk * IDLE_ATK_MULT * 1.3)),
    dead: false,
    special: 'boss', bounty: bountyGold,
    expiresAt: performance.now() + IDLE_ENC.bossTimerMs,
  };
  _idleMobs = [boss];      // boss fights solo
  _idleTargetIdx = 0;
  _beginSpecial('boss', boss, IDLE_ENC.bossTimerMs);
  if (typeof _renderIdleStage === 'function') _renderIdleStage();
  _decorateSpecial('boss', boss);
  logBattle(`<span class="log-sys">👑 บอสลับปรากฏ! ฆ่าให้ทันใน ${IDLE_ENC.bossTimerMs/1000} วิ รับรางวัลใหญ่!</span>`);
  if (typeof playSound === 'function') playSound('event_danger');
  if (typeof evShakeScreen === 'function') evShakeScreen();
}

// ---------- 🗡️ raider (mock player) ----------
function _spawnIdleRaider() {
  const name = RAIDER_NAMES[Math.floor(Math.random() * RAIDER_NAMES.length)];
  const cls  = RAIDER_CLASSES[Math.floor(Math.random() * RAIDER_CLASSES.length)];
  const tier = 1 + Math.floor(Math.random() * 4);
  const curZone = G.currentZone || 1;
  const full = getMonsterStats(curZone, 4, false);
  const hp = Math.max(40, Math.floor(full.maxHp * IDLE_HP_MULT * IDLE_ENC.raiderHpMult));
  const lootGold = Math.floor(full.atk * 4) + 60; // ลดครึ่งกันเงินเฟ้อ

  const raider = {
    name: `🗡️ ${name} (Lv.${G.level + (tier-2)})`,
    sprite: '🧑', classId: cls, classTier: tier,
    tier: 4, zone: curZone,
    hp, maxHp: hp,
    atk: Math.max(1, Math.floor(full.atk * IDLE_ATK_MULT * 1.1)),
    dead: false,
    special: 'raider', bounty: lootGold,
    expiresAt: performance.now() + IDLE_ENC.raiderTimerMs,
  };
  _idleMobs = [raider];
  _idleTargetIdx = 0;
  _beginSpecial('raider', raider, IDLE_ENC.raiderTimerMs);
  if (typeof _renderIdleStage === 'function') _renderIdleStage();
  _decorateSpecial('raider', raider);
  logBattle(`<span class="log-sys">🗡️ ${name} (${cls}) บุกเข้ามาท้าดวล! ฆ่าให้ทันเพื่อปล้นทอง!</span>`);
  if (typeof playSound === 'function') playSound('event_alert');
}

// ---------- timer / banner ----------
function _beginSpecial(type, mob, durationMs) {
  _idleLastEventAt = performance.now();
  if (_idleActiveSpecial && _idleActiveSpecial.timerId) clearTimeout(_idleActiveSpecial.timerId);
  _idleActiveSpecial = { type, mob, timerId: null };
  // failsafe: if not killed in time, the encounter flees/escapes
  _idleActiveSpecial.timerId = setTimeout(() => _specialEscaped(type, mob), durationMs + 200);
}

function _specialEscaped(type, mob) {
  if (!_idleActiveSpecial || _idleActiveSpecial.mob !== mob) return;
  if (mob.dead) return;
  _clearSpecial();
  if (type === 'boss') {
    logBattle('<span class="log-sys">👑 บอสลับหนีไปแล้ว... โอกาสรางวัลใหญ่หลุดมือ!</span>');
  } else {
    logBattle(`<span class="log-sys">🗡️ ผู้บุกรุกหนีไปพร้อมหัวเราะเยาะ!</span>`);
  }
  // clear the encounter wave so normal farming resumes
  _idleMobs.forEach(m => m.dead = true);
  if (typeof _renderIdleStage === 'function') _renderIdleStage();
}

function _clearSpecial() {
  if (_idleActiveSpecial && _idleActiveSpecial.timerId) clearTimeout(_idleActiveSpecial.timerId);
  _idleActiveSpecial = null;
  const banner = document.getElementById('idle-special-banner');
  if (banner) banner.remove();
}

// add a glowing banner + countdown over the idle stage
function _decorateSpecial(type, mob) {
  const stage = document.getElementById('idle-stage');
  if (!stage) return;
  // mark the mob sprite for special styling + swap raider sprite to a class png
  const wrap = stage.querySelector('.idle-mob[data-idx="0"]');
  if (wrap) {
    wrap.classList.add('idle-special', type === 'boss' ? 'idle-special-boss' : 'idle-special-raider');
    if (type === 'raider' && mob.classId) {
      const spr = wrap.querySelector('.idle-mob-sprite');
      if (spr) spr.innerHTML =
        `<img src="assets/sprites/${mob.classId}_T${Math.min(4,mob.classTier||1)}.png" onerror="this.outerHTML='🧑'">`;
    }
  }
  let banner = document.getElementById('idle-special-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'idle-special-banner';
    stage.appendChild(banner);
  }
  banner.className = 'idle-special-banner ' + (type === 'boss' ? 'sb-boss' : 'sb-raider');
  _updateSpecialBanner();
}

function _updateSpecialBanner() {
  const banner = document.getElementById('idle-special-banner');
  if (!banner || !_idleActiveSpecial) return;
  const mob = _idleActiveSpecial.mob;
  const left = Math.max(0, (mob.expiresAt - performance.now()) / 1000);
  const label = _idleActiveSpecial.type === 'boss' ? '👑 บอสลับ' : '🗡️ ผู้บุกรุก';
  banner.innerHTML = `<span>${label}</span><span class="sb-timer">⏱ ${left.toFixed(1)}วิ</span><span class="sb-bounty">💰 ${mob.bounty}</span>`;
}

// ---------- hook: called by idle.js when ANY idle mob dies ----------
// returns true if it handled a special reward (so idle.js can skip normal reward)
function idleOnMobKilled(mob) {
  // kill-streak combo (applies to every kill)
  _tickCombo();

  if (!mob || !mob.special) return false;
  // special kill → grant bounty
  _clearSpecial();
  const gold = mob.bounty || 0;
  G.gold += gold;
  if (mob.special === 'boss') {
    if (typeof grantChestReward === 'function') grantChestReward('boss', 1);
    logBattle(`<span class="log-exp">👑 ล้มบอสลับสำเร็จ! +${gold} ทอง + ไอเทมหายาก! 🎉</span>`);
    if (typeof evLog === 'function') evLog('👑','ล้มบอสลับ!',`+${gold} ทอง + ไอเทม`);
    if (typeof playSound === 'function') playSound('chest');
    _idleBigLootBeam('👑 +หีบบอส!');
  } else if (mob.special === 'raider') {
    const expSteal = Math.floor((G.level || 1) * 15);
    if (typeof giveExp === 'function') giveExp(expSteal);
    logBattle(`<span class="log-exp">🗡️ เอาชนะผู้บุกรุก! ปล้น +${gold} ทอง + ${expSteal} EXP! 😎</span>`);
    if (typeof evLog === 'function') evLog('🗡️','ชนะผู้บุกรุก!',`ปล้น ${gold} ทอง`);
    if (typeof playSound === 'function') playSound('chest');
    _idleBigLootBeam(`💰 +${gold}`);
  }
  if (typeof renderInventory === 'function') renderInventory();
  if (typeof updateTopBar === 'function') updateTopBar();
  return true;
}

// ---------- kill-streak combo ----------
function _tickCombo() {
  const now = performance.now();
  if (now <= _idleComboExpire) {
    _idleComboCount++;
  } else {
    _idleComboCount = 1;
  }
  _idleComboExpire = now + IDLE_ENC.comboWindowMs;

  // milestones → reward + flashy popup
  if (_idleComboCount > 0 && _idleComboCount % 10 === 0) {
    const bonusGold = _idleComboCount * 2; // ลดจาก ×5
    G.gold += bonusGold;
    const mult = 1 + Math.floor(_idleComboCount / 10) * 0.1;
    logBattle(`<span class="log-exp">🔥 COMBO ×${_idleComboCount}! +${bonusGold} ทองโบนัส (EXP×${mult.toFixed(1)})</span>`);
    if (typeof updateTopBar === 'function') updateTopBar();
  }
  _renderComboMeter();
}

// EXP multiplier from current combo (idle.js applies this on kill reward)
function idleComboExpMult() {
  if (performance.now() > _idleComboExpire) { _idleComboCount = 0; return 1; }
  return 1 + Math.floor(_idleComboCount / 10) * 0.1;  // +10% per 10-combo tier
}

function _renderComboMeter() {
  const header = document.getElementById('idle-panel-header');
  if (!header) return;
  let meter = document.getElementById('idle-combo-meter');
  const active = performance.now() <= _idleComboExpire && _idleComboCount >= 3;
  if (!active) { if (meter) meter.remove(); return; }
  if (!meter) {
    meter = document.createElement('span');
    meter.id = 'idle-combo-meter';
    header.appendChild(meter);
  }
  const tier = Math.floor(_idleComboCount / 10);
  meter.className = 'idle-combo-meter' + (tier > 0 ? ' combo-hot' : '');
  meter.textContent = `🔥 COMBO ×${_idleComboCount}`;
}

// big floating loot text above the hero
function _idleBigLootBeam(text) {
  const stage = document.getElementById('idle-stage');
  if (!stage) return;
  const el = document.createElement('div');
  el.className = 'idle-loot-beam';
  el.textContent = text;
  stage.appendChild(el);
  setTimeout(() => el.remove(), 1800);
}

// re-apply special styling + banner after idle.js re-renders the stage
function idleRedecorateSpecial() {
  if (!_idleActiveSpecial) return;
  const mob = _idleActiveSpecial.mob;
  if (!mob || mob.dead) return;
  // only if the special mob is still the live one on stage
  if (_idleMobs[0] === mob) _decorateSpecial(_idleActiveSpecial.type, mob);
}

// ---------- per-tick updater (called from idle loop) ----------
function idleSpecialTick() {
  if (_idleActiveSpecial) _updateSpecialBanner();
  if (_idleComboCount >= 3 && performance.now() > _idleComboExpire) {
    _idleComboCount = 0;
    _renderComboMeter();
  }
}

// ============================================================
// IDLE MILESTONES — เป้าหมายระยะสั้นจากการฟาร์ม (ทำให้ติดพัน)
// สะสม idleKills ถึงเป้า → รับรางวัลก้อน (หีบ/ทอง) ช่วยตอนติดด่าน
// ============================================================
const IDLE_MILESTONES = [
  { kills:50,   reward:()=>{ grantChestReward('uncommon',1); return '🎁 ไอเทมพิเศษ ×1'; } },
  { kills:150,  reward:()=>{ grantChestReward('rare',1); return '🎁 ไอเทมหายาก ×1'; } },
  { kills:350,  reward:()=>{ grantChestReward('rare',2); return '🎁 ไอเทมหายาก ×2'; } },
  { kills:700,  reward:()=>{ grantChestReward('boss',1); return '🏆 ไอเทมมหากาพย์ ×1'; } },
  { kills:1500, reward:()=>{ grantChestReward('boss',2); return '🏆 ไอเทมมหากาพย์ ×2'; } },
];

function checkIdleMilestone() {
  if (!G.claimedIdleMilestones) G.claimedIdleMilestones = [];
  const k = G.idleKills || 0;
  for (const m of IDLE_MILESTONES) {
    if (k >= m.kills && !G.claimedIdleMilestones.includes(m.kills)) {
      G.claimedIdleMilestones.push(m.kills);
      const what = m.reward();
      if (typeof renderInventory === 'function') renderInventory();
      if (typeof updateTopBar === 'function') updateTopBar();
      if (typeof logBattle === 'function')
        logBattle(`<span class="log-exp">🌙 IDLE Milestone! ฟาร์มครบ ${m.kills} ตัว → ${what}</span>`);
      if (typeof evLog === 'function') evLog('🌙','IDLE Milestone',`${m.kills} ตัว → ${what}`);
      if (typeof _idleBigLootBeam === 'function') _idleBigLootBeam(what);
      if (typeof playSound === 'function') playSound('chest');
      if (typeof saveGame === 'function') saveGame();
      break; // one milestone per kill
    }
  }
}
