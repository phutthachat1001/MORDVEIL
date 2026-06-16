// ============================================================
// ENDLESS DUNGEON — หลุมลึกนิรันดร์ (เข้าซ้ำได้)
// ฟาร์มหินตีบวก / แก่น / วัตถุดิบคราฟหายาก · ความลึกไต่ไม่สิ้นสุด
// ตายแล้วของที่เก็บยังอยู่ · ทุก 5 ชั้น = ชั้นบอส (ดรอปเป็นชุด)
// ============================================================

let _dgActive  = false;
let _dgFloor   = 0;
let _dgMobs    = [];
let _dgLoop    = null;
let _dgHp      = 0;
let _dgMaxHp   = 0;
let _dgSkillCd = {};
let _dgRevived = false;
let _dgRunDrops = {}; // วัตถุดิบที่เก็บได้ในรันนี้ (สรุปตอนจบ)

function canEnterDungeon() {
  const need = (typeof ENDLESS_DUNGEON !== 'undefined') ? ENDLESS_DUNGEON.unlockZoneCleared : 2;
  const cleared = (G.zoneProgress && G.zoneProgress[need]) || 0;
  const zoneMon = (ZONES.find(z => z.id === need) || {}).monsters || [];
  return cleared >= zoneMon.length;
}

function dungeonUnlockHint() {
  const need = (typeof ENDLESS_DUNGEON !== 'undefined') ? ENDLESS_DUNGEON.unlockZoneCleared : 2;
  const z = ZONES.find(zz => zz.id === need);
  return `ผ่านด่าน ${z ? z.emoji + ' ' + z.name : need} ให้ครบก่อน`;
}

function _dgTodayStr() { return new Date().toISOString().slice(0, 10); }

function dungeonFreeRunsLeft() {
  const max = (typeof ENDLESS_DUNGEON !== 'undefined') ? (ENDLESS_DUNGEON.freeRunsPerDay || 1) : 1;
  if (G.dungeonFreeDate !== _dgTodayStr()) return max; // วันใหม่ = รีเซ็ต
  return Math.max(0, max - (G.dungeonFreeUsed || 0));
}

function dungeonKeys() { return (G.materials && G.materials.dungeon_key) || 0; }

// เข้าได้ไหม (ฟรีวันนี้เหลือ หรือมีกุญแจ)
function dungeonCanRun() {
  return dungeonFreeRunsLeft() > 0 || dungeonKeys() > 0;
}

// หักสิทธิ์เข้า: ใช้ฟรีก่อน ถ้าหมดค่อยใช้กุญแจ · คืน true ถ้าเข้าได้
function _dgConsumeEntry() {
  if (dungeonFreeRunsLeft() > 0) {
    if (G.dungeonFreeDate !== _dgTodayStr()) { G.dungeonFreeDate = _dgTodayStr(); G.dungeonFreeUsed = 0; }
    G.dungeonFreeUsed = (G.dungeonFreeUsed || 0) + 1;
    return true;
  }
  if (dungeonKeys() > 0) {
    G.materials.dungeon_key = dungeonKeys() - 1;
    return true;
  }
  return false;
}

// ดรอปกุญแจจากการสังหารมอน (เรียกจาก battle.js / idle.js)
function dungeonRollKeyDrop(zone, isBoss) {
  if (typeof ENDLESS_DUNGEON === 'undefined' || !canEnterDungeon()) return; // ยังไม่ปลดล็อก = ไม่ดรอป
  const k = ENDLESS_DUNGEON.keyDrop || {};
  let chance = Math.min(k.cap || 0.025, (k.baseByZone1 || 0.0025) + ((Math.min(6, Math.max(1, zone || 1)) - 1) * (k.perZone || 0.0045)));
  if (isBoss) chance *= (k.bossMult || 2);
  if (Math.random() < chance) {
    if (!G.materials) G.materials = {};
    G.materials.dungeon_key = (G.materials.dungeon_key || 0) + 1;
    if (typeof logBattle === 'function')
      logBattle(`<span class="log-exp" style="color:#cc88ff">🗝️ ดรอปกุญแจหลุมลึก! (มี ${G.materials.dungeon_key} ดอก)</span>`);
    if (typeof updateTopBar === 'function') updateTopBar();
    return true;
  }
  return false;
}

// ---------- entry / overlay ----------
function openDungeon() {
  let ov = document.getElementById('dg-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'dg-overlay';
    ov.style.cssText = 'display:none;position:fixed;inset:0;z-index:810;'
      + 'background:radial-gradient(circle at 50% 30%,#0a1424,#02040a 70%);'
      + 'align-items:center;justify-content:center;flex-direction:column';
    ov.innerHTML = `<div id="dg-stage" class="infinity-stage"></div>`;
    document.body.appendChild(ov);
  }
  ov.style.display = 'flex';
  ov.classList.add('active');
  _renderDgIntro();
}

function closeDungeon() {
  _stopDgLoop();
  const ov = document.getElementById('dg-overlay');
  if (ov) { ov.classList.remove('active'); ov.style.display = 'none'; }
}

function _renderDgIntro() {
  const stage = document.getElementById('dg-stage');
  if (!stage) return;
  if (!canEnterDungeon()) {
    stage.innerHTML = `
      <div class="trial-intro">
        <div class="trial-title">🕳️ หลุมลึกนิรันดร์</div>
        <div class="trial-sub">🔒 ยังเข้าไม่ได้ — ${dungeonUnlockHint()}</div>
        <button class="btn-trial-cancel" onclick="closeDungeon()">ออก</button>
      </div>`;
    return;
  }
  const best = G.dungeonBestFloor || 0;
  const free = dungeonFreeRunsLeft();
  const keys = dungeonKeys();
  const canRun = dungeonCanRun();
  const entryLine = free > 0
    ? `<span style="color:#66ff99">🆓 เข้าฟรีวันนี้ได้อีก ${free} รอบ</span>`
    : (keys > 0
        ? `<span style="color:#cc88ff">🗝️ ใช้กุญแจ 1 ดอก (มี ${keys})</span>`
        : `<span style="color:#ff7766">หมดสิทธิ์ฟรีวันนี้ — ต้องมีกุญแจ (ดรอปจากมอน)</span>`);
  stage.innerHTML = `
    <div class="trial-intro">
      <div class="trial-title">🕳️ หลุมลึกนิรันดร์</div>
      <div class="trial-sub">ดิ่งลงสู่ห้วงลึก เก็บวัตถุดิบตีบวก & คราฟของหายาก</div>
      <ul class="trial-rules">
        <li>🔨 ดรอป <b>หินตีบวก / แก่นเสริมพลัง</b> ไว้ตีบวกอุปกรณ์</li>
        <li>🌌 ยิ่งลึก ยิ่งมีโอกาสได้ <b>เศษมิติ / แก่นห้วงลึก</b> (คราฟชุดเทพ)</li>
        <li>👹 ทุก <b>5 ชั้น</b> = ชั้นบอส ดรอปเป็นชุด ×3</li>
        <li>🗝️ เข้า <b>ฟรีวันละ 1 รอบ</b> · รอบถัดไปใช้กุญแจ (ดรอปจากมอนทุกด่าน)</li>
        <li>❤️ HP ไม่ฟื้นระหว่างดิ่ง — ตายแล้วของที่เก็บยังอยู่ทั้งหมด</li>
      </ul>
      <div class="t4d-progress">ความลึกที่ดีที่สุด: <b>ชั้น ${best}</b> · กุญแจ: <b>${keys}</b> 🗝️</div>
      <div style="margin:.4rem 0;font-size:.82rem">${entryLine}</div>
      <button class="btn-trial-start" onclick="startDungeon()" ${canRun?'':'disabled style="opacity:.4;cursor:not-allowed"'}>${free>0?'🆓 ดิ่งลงหลุม (ฟรี)':keys>0?'🗝️ ใช้กุญแจดิ่งลงหลุม':'🔒 ไม่มีสิทธิ์เข้า'}</button>
      <button class="btn-trial-cancel" onclick="closeDungeon()">ออก</button>
    </div>`;
}

// ---------- run ----------
function startDungeon() {
  if (!canEnterDungeon()) { closeDungeon(); return; }
  // ต้องมีสิทธิ์เข้า (ฟรีวันนี้ หรือกุญแจ) — หักเมื่อเริ่มจริง
  if (!_dgConsumeEntry()) { _renderDgIntro(); return; }
  if (typeof saveGame === 'function') saveGame();
  _dgActive = true;
  _dgFloor = 0;
  _dgSkillCd = {};
  _dgRevived = false;
  _dgRunDrops = {};
  _dgMaxHp = _dgHp = _dgPlayerMaxHp();
  _spawnDgFloor();

  let lastAttack = 0;
  _dgLoop = setInterval(() => {
    const now = performance.now();
    if (now - lastAttack >= _dgInterval()) { lastAttack = now; _dgTick(); }
    _updateDgHud();
  }, 90);
}

function _stopDgLoop() {
  if (_dgLoop) { clearInterval(_dgLoop); _dgLoop = null; }
  _dgActive = false;
}

function _dgPlayerMaxHp() {
  const eq = (typeof getEquippedStatBonus === 'function') ? getEquippedStatBonus() : { hp:0 };
  return (G.maxHp || 100) + (eq.hp || 0);
}

function _dgInterval() {
  const base = (typeof getAttackInterval === 'function') ? getAttackInterval() : 3000;
  return Math.max(420, Math.floor(base * 0.45));
}

function _dgIsBossFloor() {
  const every = (typeof ENDLESS_DUNGEON !== 'undefined') ? ENDLESS_DUNGEON.bossEveryFloors : 5;
  return _dgFloor > 0 && _dgFloor % every === 0;
}

function _spawnDgFloor() {
  _dgFloor++;
  const boss = _dgIsBossFloor();
  // ใช้สถิติมอนโซน 6 tier สูงเป็นฐาน แล้วไต่ตามความลึก
  const base = (typeof getMonsterStats === 'function') ? getMonsterStats(6, boss ? 6 : 4, boss) : { maxHp: 600, atk: 60 };
  const scale = 1 + (_dgFloor - 1) * 0.10;            // +10% ต่อชั้น
  const hp  = Math.max(1, Math.floor(base.maxHp * scale * (boss ? 1.8 : 0.9)));
  const atk = Math.max(1, Math.floor(base.atk  * scale * (boss ? 1.3 : 0.85)));
  const names = ['เงาห้วงลึก','ผีมิติ','อสูรเหว','ปีศาจความว่าง','สัตว์ร้ายนิรันดร์'];
  _dgMobs = [{
    name: boss ? `จอมเฝ้าหลุม ชั้น ${_dgFloor}` : names[Math.floor(Math.random()*names.length)],
    sprite: boss ? '👹' : ['👻','🕷️','🦇','💀','🌑'][Math.floor(Math.random()*5)],
    hp, maxHp: hp, atk, dead: false, isBoss: boss,
  }];
  _renderDgStage();
}

// ---------- combat ----------
function _dgTick() {
  if (!_dgActive) return;
  const idx = _dgMobs.findIndex(m => !m.dead);
  if (idx === -1) { _spawnDgFloor(); return; }
  const mob = _dgMobs[idx];

  const eqBonus = (typeof getEquippedStatBonus === 'function') ? getEquippedStatBonus() : { atk:0, crit:0 };
  const cls = (typeof CLASSES !== 'undefined') ? CLASSES.find(c => c.id === G.classId) : null;
  let atk = (G.baseAtk || 10) + (eqBonus.atk || 0) + Math.floor(Math.random() * (G.level || 1)) + 1;
  const critChance = .05 + (cls && cls.bonuses && cls.bonuses.critBonus ? cls.bonuses.critBonus : 0)
                   + (eqBonus.crit || 0) / 100 + (G.critBonusFromTree || 0);
  let isCrit = Math.random() < critChance;

  let hits = 1, label = '';
  if (typeof _dgReadySkill === 'function' && typeof _IDLE_SKILL_DMG !== 'undefined') {
    const skill = _dgReadySkill();
    if (skill && _IDLE_SKILL_DMG[skill.id]) {
      const def = _IDLE_SKILL_DMG[skill.id];
      atk = Math.floor(atk * def.mult);
      hits = def.hits; label = def.label;
      _dgSkillCd[skill.id] = performance.now() + (skill.cd || 3) * _dgInterval();
    }
  }
  if ((G.doubleStrikeChance || 0) > 0 && Math.random() < G.doubleStrikeChance) hits += 1;
  if (isCrit) atk = Math.floor(atk * 2);

  const total = atk * hits;
  mob.hp -= total;
  _flashDgMob(idx);
  _floatDg(idx, `${isCrit ? '💥' : ''}${label ? label + ' ' : ''}${hits > 1 ? atk + '×' + hits : total}`, isCrit ? 'crit' : '');

  if ((G.lifestealBonus || 0) > 0) {
    const heal = Math.floor(total * G.lifestealBonus);
    if (heal > 0) _dgHp = Math.min(_dgMaxHp, _dgHp + heal);
  }

  if (mob.hp <= 0) {
    mob.dead = true;
    _markDgMobDead(idx);
    _rollDgDrops(mob);
    if (_dgFloor > (G.dungeonBestFloor || 0)) G.dungeonBestFloor = _dgFloor;
    if (_dgMobs.every(m => m.dead)) setTimeout(() => { if (_dgActive) _spawnDgFloor(); }, 650);
    return;
  }
  _dgMobAttack();
}

function _dgReadySkill() {
  const equipped = G.equippedSkills || G.unlockedSkills || [];
  if (!equipped.length) return null;
  const now = performance.now();
  const allSkills = (typeof _getSkills === 'function') ? _getSkills() : [];
  for (const sid of equipped) {
    if (!_IDLE_SKILL_DMG || !_IDLE_SKILL_DMG[sid]) continue;
    if ((_dgSkillCd[sid] || 0) > now) continue;
    const def = allSkills.find(s => s.id === sid);
    return { id: sid, cd: def ? def.cd : 3 };
  }
  return null;
}

function _dgMobAttack() {
  const eq = (typeof getEquippedStatBonus === 'function') ? getEquippedStatBonus() : { def:0 };
  const defStat = (G.baseDef || 0) + (eq.def || 0);
  let dmg = 0;
  _dgMobs.forEach(m => { if (!m.dead) dmg += Math.max(1, m.atk - Math.floor(defStat * 0.5)); });
  if (G.damageReduction) dmg = Math.floor(dmg * (1 - G.damageReduction));
  if (dmg <= 0) return;
  _dgHp -= dmg;
  if (_dgHp <= 0) {
    if (G.hasRevive && !_dgRevived) {
      _dgRevived = true;
      _dgHp = Math.floor(_dgMaxHp * 0.5);
      _floatDg(0, '🕊️ ฟื้นคืนชีพ!', 'crit');
      _updateDgHud();
      return;
    }
    _dgHp = 0;
    _endDungeon(false);
  }
}

// ---------- loot ----------
function _rollDgDrops(mob) {
  const cfg = (typeof ENDLESS_DUNGEON !== 'undefined') ? ENDLESS_DUNGEON.drops : {};
  const bundle = mob.isBoss ? (ENDLESS_DUNGEON.bossBundleMult || 3) : 1;
  if (!G.materials) G.materials = {};
  let gained = [];
  Object.entries(cfg).forEach(([matId, d]) => {
    if (d.minFloor && _dgFloor < d.minFloor) return;
    const chance = Math.min(d.cap, d.base + (_dgFloor - 1) * d.perFloor);
    for (let i = 0; i < bundle; i++) {
      if (Math.random() < chance) {
        G.materials[matId] = (G.materials[matId] || 0) + 1;
        _dgRunDrops[matId] = (_dgRunDrops[matId] || 0) + 1;
        gained.push(matId);
      }
    }
  });
  if (gained.length) {
    // float a compact popup of unique mats gained
    const uniq = [...new Set(gained)];
    const txt = uniq.map(id => {
      const m = (typeof MATERIALS !== 'undefined') ? MATERIALS[id] : null;
      const n = gained.filter(g => g === id).length;
      return m ? `${m.icon}×${n}` : '';
    }).join(' ');
    if (txt) _floatDg(0, `🎁 ${txt}`, mob.isBoss ? 'crit' : '');
  }
  if (gained.length) { if (typeof updateTopBar === 'function') updateTopBar(); }
}

// ---------- end ----------
function _endDungeon(cleared) {
  _stopDgLoop();
  _dgRevived = false;
  if (typeof saveGame === 'function') saveGame();
  _renderDgResult();
}

function _renderDgResult() {
  const stage = document.getElementById('dg-stage');
  if (!stage) return;
  const dropLines = Object.entries(_dgRunDrops).map(([id, n]) => {
    const m = (typeof MATERIALS !== 'undefined') ? MATERIALS[id] : null;
    return m ? `<div style="font-size:.82rem;color:#cce">${m.icon} ${m.name} ×${n}</div>` : '';
  }).join('') || '<div style="font-size:.8rem;color:#889">ไม่ได้วัตถุดิบในรันนี้</div>';
  stage.innerHTML = `
    <div class="trial-result">
      <div class="trial-result-dead">🕳️ ออกจากหลุมที่ชั้น ${_dgFloor}</div>
      <div class="trial-result-stats">ความลึกดีที่สุด: <b>ชั้น ${G.dungeonBestFloor || _dgFloor}</b></div>
      <div style="margin:.6rem 0;background:rgba(0,0,0,.25);border-radius:8px;padding:.5rem .7rem">
        <div style="font-size:.76rem;color:#9ad;font-weight:700;margin-bottom:.25rem">วัตถุดิบที่เก็บได้:</div>
        ${dropLines}
      </div>
      <div class="trial-result-hint">นำวัตถุดิบไปตีบวกอุปกรณ์ (กดที่ไอเทมในกระเป๋า) หรือคราฟชุดที่ช่างตีเหล็ก</div>
      ${dungeonCanRun()
        ? `<button class="btn-trial-start" onclick="startDungeon()">${dungeonFreeRunsLeft()>0?'🆓 ดิ่งอีกครั้ง (ฟรี)':'🗝️ ใช้กุญแจดิ่งอีกครั้ง ('+dungeonKeys()+')'}</button>`
        : `<div style="color:#ff7766;font-size:.82rem;margin:.4rem 0">หมดสิทธิ์เข้าแล้ว — ฆ่ามอนเพื่อหากุญแจ หรือกลับมาพรุ่งนี้</div>`}
      <button class="btn-trial-cancel" onclick="closeDungeon()">ออก</button>
    </div>`;
}

// ---------- rendering (mirrors t4dungeon) ----------
function _renderDgStage() {
  const stage = document.getElementById('dg-stage');
  if (!stage) return;
  const hpPct = _dgMaxHp > 0 ? Math.max(0, (_dgHp / _dgMaxHp) * 100) : 100;
  const playerSprite = (typeof getPlayerSpriteWithCosmetic !== 'undefined')
    ? getPlayerSpriteWithCosmetic(G.classId || 'warrior', G.classTier || 1, G.cosmeticTier || 1)
    : (typeof getPlayerSprite !== 'undefined' ? getPlayerSprite(G.classId || 'warrior', G.classTier || 1) : '🧍');

  let mobsHtml = '';
  _dgMobs.forEach((m, idx) => {
    const pct = Math.max(0, (m.hp / m.maxHp) * 100);
    mobsHtml += `
      <div class="idle-mob dg-foe${m.dead ? ' dead' : ''}${m.isBoss ? ' dg-boss' : ''}" data-idx="${idx}">
        <div class="idle-mob-sprite" style="font-size:${m.isBoss ? '3.4rem' : '2.6rem'}">${m.sprite}</div>
        <div class="idle-mob-name" style="color:${m.isBoss ? '#ff8866' : '#bcd'}">${m.name}</div>
        <div class="idle-mob-hp"><div class="idle-mob-hp-fill" style="width:${pct}%"></div></div>
      </div>`;
  });

  stage.innerHTML = `
    <div class="trial-hud" id="dg-hud"></div>
    <div class="trial-arena">
      <div class="idle-mobs-wrap">${mobsHtml}</div>
      <div class="idle-vs">⚔</div>
      <div class="idle-hero">
        <div class="idle-hero-sprite" id="dg-hero-sprite">${playerSprite}</div>
        <div class="idle-mob-name">คุณ</div>
        <div class="idle-mob-hp"><div class="idle-mob-hp-fill idle-hero-hp" id="dg-hero-hp" style="width:${hpPct}%"></div></div>
      </div>
    </div>
    <button class="btn-trial-cancel" style="margin-top:.6rem" onclick="_endDungeon(false)">🚪 ออกจากหลุม (เก็บของไว้)</button>`;
  _updateDgHud();
}

function _updateDgHud() {
  const hud = document.getElementById('dg-hud');
  if (hud) {
    hud.innerHTML = `
      <span>🕳️ ชั้น ${_dgFloor}${_dgIsBossFloor() ? ' 👹' : ''}</span>
      <span>❤️ ${Math.max(0, Math.ceil(_dgHp))}/${_dgMaxHp}</span>
      <span class="trial-hud-next">เก็บแล้ว ${Object.values(_dgRunDrops).reduce((a,b)=>a+b,0)} ชิ้น</span>`;
  }
  const hpFill = document.getElementById('dg-hero-hp');
  if (hpFill) hpFill.style.width = `${_dgMaxHp > 0 ? Math.max(0, (_dgHp/_dgMaxHp)*100) : 100}%`;
}

function _flashDgMob(idx) {
  const stage = document.getElementById('dg-stage');
  const spr = stage && stage.querySelector(`.idle-mob[data-idx="${idx}"] .idle-mob-sprite`);
  if (spr) { spr.classList.remove('hit'); void spr.offsetWidth; spr.classList.add('hit'); }
  const fill = stage && stage.querySelector(`.idle-mob[data-idx="${idx}"] .idle-mob-hp-fill`);
  if (fill) { const m = _dgMobs[idx]; fill.style.width = `${Math.max(0, (m.hp/m.maxHp)*100)}%`; }
  const hero = document.getElementById('dg-hero-sprite');
  if (hero) { hero.classList.add('atk'); setTimeout(() => hero.classList.remove('atk'), 180); }
}

function _markDgMobDead(idx) {
  const stage = document.getElementById('dg-stage');
  const wrap = stage && stage.querySelector(`.idle-mob[data-idx="${idx}"]`);
  if (wrap) wrap.classList.add('dead');
}

function _floatDg(idx, html, cls) {
  const stage = document.getElementById('dg-stage');
  const wrap = stage && stage.querySelector(`.idle-mob[data-idx="${idx}"]`);
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = 'idle-dmg-float' + (cls ? ' ' + cls : '');
  el.innerHTML = html;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 1400);
}
