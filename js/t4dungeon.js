// ============================================================
// T4 DUNGEON — ดันเจี้ยนหาของเฉพาะอาชีพ (gate ก่อนวิวัฒนาการ Tier 4)
// ------------------------------------------------------------
//  • เข้าได้เฉพาะตอน Tier 3 ของอาชีพตัวเอง
//  • สู้กับ "ตัวละคร T4 ของอาชีพตัวเอง" (ภาพสะท้อนแห่งอนาคต)
//  • ดรอป 2.5% ต่อชิ้น ต่อการสังหาร — มี 6 ชิ้น (หมวก/เกราะ/มือ/เท้า/อาวุธหลัก/อาวุธรอง)
//  • เก็บครบ 6 + ทำเควสประจำอาชีพเสร็จ → ปลดล็อกวิวัฒนาการ Tier 4
// ============================================================

let _t4Active = false;
let _t4Mobs   = [];
let _t4Wave   = 0;
let _t4Loop   = null;
let _t4Hp     = 0;
let _t4MaxHp  = 0;
let _t4SkillCd = {};
let _t4Revived = false;

// ---------- gate / helpers ----------

// เข้าดันได้เฉพาะตอน Tier 3 (มี branch แล้ว) ของอาชีพตัวเอง
function canEnterT4Dungeon() {
  return G.classId && (G.classTier || 1) === 3 && !!G.classBranch;
}

// index ของชิ้นที่เก็บได้ของอาชีพปัจจุบัน (array boolean ยาว 6)
function _t4Collected() {
  if (!G.t4GearCollected) G.t4GearCollected = {};
  if (!G.t4GearCollected[G.classId]) {
    G.t4GearCollected[G.classId] = new Array(T4_DUNGEON.pieceCount).fill(false);
  }
  return G.t4GearCollected[G.classId];
}

function t4GearCount() {
  return _t4Collected().filter(Boolean).length;
}

function hasAllT4Gear() {
  return t4GearCount() >= T4_DUNGEON.pieceCount;
}

// เควสประจำอาชีพของ Tier 4 (evoQuest บนร่าง T4 ที่ตรง branch) ทำเสร็จหรือยัง
function t4QuestDone() {
  const path = CLASS_EVOLUTIONS[G.classId] || [];
  const t4 = path.find(e => e.tier === 4 && (e.branch || e.parentBranch) === G.classBranch);
  const qid = t4 && t4.conditions && t4.conditions.evoQuest;
  if (!qid) return true; // ไม่มีเควสกำหนด = ผ่าน
  return !!(G.evoQuestDone && G.evoQuestDone[qid]);
}

// เงื่อนไขรวมที่ปลดล็อกวิวัฒนาการ Tier 4
function canForgeT4() {
  return hasAllT4Gear() && t4QuestDone();
}

// ---------- entry ----------
function openT4Dungeon() {
  if (!canEnterT4Dungeon()) return;
  let overlay = document.getElementById('t4d-overlay');
  if (!overlay) { overlay = _buildT4Overlay(); }
  overlay.style.display = 'flex';
  overlay.classList.add('active');
  _renderT4Intro();
}

function closeT4Dungeon() {
  _stopT4Loop();
  const overlay = document.getElementById('t4d-overlay');
  if (overlay) { overlay.classList.remove('active'); overlay.style.display = 'none'; }
  if (typeof renderEvolutionButton === 'function') renderEvolutionButton();
}

// สร้าง overlay element แบบเดียวกับ #infinity-overlay (inline style + id CSS)
function _buildT4Overlay() {
  const ov = document.createElement('div');
  ov.id = 't4d-overlay';
  ov.style.cssText = 'display:none;position:fixed;inset:0;z-index:810;'
    + 'background:radial-gradient(circle at 50% 30%,#240a10,#05000a 70%);'
    + 'align-items:center;justify-content:center;flex-direction:column';
  ov.innerHTML = `<div id="t4d-stage" class="infinity-stage"></div>`;
  document.body.appendChild(ov);
  return ov;
}

// ---------- intro screen ----------
function _renderT4Intro() {
  const stage = document.getElementById('t4d-stage');
  if (!stage) return;
  const T = T4_DUNGEON;
  const collected = _t4Collected();
  const cls = (typeof CLASSES !== 'undefined') ? CLASSES.find(c => c.id === G.classId) : null;
  const clsName = cls ? cls.name : G.classId;

  const piecesHtml = T.gear[G.classId].map((p, i) => {
    const got = collected[i];
    return `<div class="t4d-piece${got ? ' got' : ''}" title="${p.name}">
      <div class="t4d-piece-icon">${got ? p.icon : '❔'}</div>
      <div class="t4d-piece-label">${T.pieceLabels[i]}</div>
      <div class="t4d-piece-name">${got ? p.name : '???'}</div>
    </div>`;
  }).join('');

  const questOk = t4QuestDone();

  stage.innerHTML = `
    <div class="trial-intro">
      <div class="trial-title">⚔️ ดันเจี้ยนแห่งอนาคต — ${clsName}</div>
      <div class="trial-sub">เผชิญหน้ากับร่าง Tier 4 ของตัวคุณเอง เพื่อช่วงชิงพลังของมัน</div>
      <ul class="trial-rules">
        <li>👤 สู้กับ <b>ตัวละคร Tier 4 ของอาชีพคุณ</b> เท่านั้น (เข้าได้เฉพาะอาชีพตัวเอง)</li>
        <li>🎁 แต่ละชิ้นมีโอกาสดรอป <b>${(T.dropChance*100).toFixed(1)}%</b> ต่อการสังหาร — หายากมาก!</li>
        <li>🧩 เก็บให้ครบ <b>6 ชิ้น</b> + ทำ <b>เควสประจำอาชีพ</b> ให้เสร็จ จึงจะวิวัฒนาการ Tier 4 ได้</li>
        <li>❤️ HP ไม่ฟื้นระหว่างดัน — ตายแล้วของที่ได้ยังอยู่ เริ่มใหม่ได้</li>
      </ul>
      <div class="t4d-pieces">${piecesHtml}</div>
      <div class="t4d-progress">เก็บได้ <b>${t4GearCount()}/6</b> ชิ้น
        · เควสอาชีพ: ${questOk ? '<span style="color:#66ff99">✓ เสร็จแล้ว</span>' : '<span style="color:#ff8888">✗ ยังไม่เสร็จ</span>'}</div>
      <button class="btn-trial-start" onclick="startT4Dungeon()">⚔️ เข้าสู่ดันเจี้ยน</button>
      <button class="btn-trial-cancel" onclick="closeT4Dungeon()">ออก</button>
    </div>`;
}

// ---------- run lifecycle ----------
function startT4Dungeon() {
  if (!canEnterT4Dungeon()) { closeT4Dungeon(); return; }
  _t4Active = true;
  _t4Wave = 0;
  _t4SkillCd = {};
  _t4Revived = false;
  _t4MaxHp = _t4Hp = _t4PlayerMaxHp();
  _spawnT4Wave();

  let lastAttack = 0;
  _t4Loop = setInterval(() => {
    const now = performance.now();
    if (now - lastAttack >= _t4Interval()) {
      lastAttack = now;
      _t4Tick();
    }
    _updateT4Hud();
  }, 90);
}

function _stopT4Loop() {
  if (_t4Loop) { clearInterval(_t4Loop); _t4Loop = null; }
  _t4Active = false;
}

function _t4PlayerMaxHp() {
  const eq = (typeof getEquippedStatBonus === 'function') ? getEquippedStatBonus() : { hp:0 };
  return (G.maxHp || 100) + (eq.hp || 0);
}

function _t4Interval() {
  const base = (typeof getAttackInterval === 'function') ? getAttackInterval() : 3000;
  return Math.max(420, Math.floor(base * 0.45));
}

// ---------- spawning — สร้าง "ตัวละคร T4 อาชีพตัวเอง" ----------
function _spawnT4Wave() {
  _t4Wave++;
  const T = T4_DUNGEON;
  const path  = CLASS_EVOLUTIONS[G.classId] || [];
  const t4evo = path.find(e => e.tier === 4 && (e.branch || e.parentBranch) === G.classBranch)
             || path.find(e => e.tier === 4);
  // ใช้สถิติมอนระดับโซนสูงสุดเป็นฐาน แล้วคูณให้แกร่งแบบบอส
  const baseZone = Math.min(6, (G.currentZone || 1));
  const base = (typeof getMonsterStats === 'function') ? getMonsterStats(baseZone, 5, true) : { maxHp: 400, atk: 40 };
  const waveScale = 1 + (_t4Wave - 1) * 0.06;
  const hp  = Math.max(1, Math.floor(base.maxHp * T.mobHpMult  * waveScale));
  const atk = Math.max(1, Math.floor(base.atk   * T.mobAtkMult * waveScale));

  const branch = G.classBranch;
  const suffix = branch ? `-${branch}` : '';
  _t4Mobs = [{
    name: t4evo ? t4evo.name : 'ร่าง Tier 4',
    icon: t4evo ? t4evo.icon : '👤',
    color: t4evo ? t4evo.color : '#fff',
    pngClass: G.classId, pngTier: 4, pngBranch: branch, pngSuffix: suffix,
    hp, maxHp: hp, atk, dead: false,
  }];
  _renderT4Stage();
}

// ---------- combat tick ----------
function _t4Tick() {
  if (!_t4Active) return;
  const idx = _t4Mobs.findIndex(m => !m.dead);
  if (idx === -1) { _spawnT4Wave(); return; }
  const mob = _t4Mobs[idx];

  const eqBonus = (typeof getEquippedStatBonus === 'function') ? getEquippedStatBonus() : { atk:0, crit:0 };
  const cls = (typeof CLASSES !== 'undefined') ? CLASSES.find(c => c.id === G.classId) : null;
  let atk = (G.baseAtk || 10) + (eqBonus.atk || 0) + Math.floor(Math.random() * (G.level || 1)) + 1;
  const critChance = .05 + (cls && cls.bonuses && cls.bonuses.critBonus ? cls.bonuses.critBonus : 0)
                   + (eqBonus.crit || 0) / 100 + (G.critBonusFromTree || 0);
  let isCrit = Math.random() < critChance;

  let hits = 1, label = '';
  if (typeof _t4ReadySkill === 'function' && typeof _IDLE_SKILL_DMG !== 'undefined') {
    const skill = _t4ReadySkill();
    if (skill && _IDLE_SKILL_DMG[skill.id]) {
      const def = _IDLE_SKILL_DMG[skill.id];
      atk = Math.floor(atk * def.mult);
      hits = def.hits; label = def.label;
      _t4SkillCd[skill.id] = performance.now() + (skill.cd || 3) * _t4Interval();
    }
  }
  if ((G.doubleStrikeChance || 0) > 0 && Math.random() < G.doubleStrikeChance) hits += 1;
  if (isCrit) atk = Math.floor(atk * 2);

  const total = atk * hits;
  mob.hp -= total;
  _flashT4Mob(idx);
  _floatT4(idx, `${isCrit ? '💥' : ''}${label ? label + ' ' : ''}${hits > 1 ? atk + '×' + hits : total}`, isCrit ? 'crit' : '');

  if ((G.lifestealBonus || 0) > 0) {
    const heal = Math.floor(total * G.lifestealBonus);
    if (heal > 0) _t4Hp = Math.min(_t4MaxHp, _t4Hp + heal);
  }

  if (mob.hp <= 0) {
    mob.dead = true;
    _markT4MobDead(idx);
    _rollT4Drops();
    if (_t4Mobs.every(m => m.dead)) setTimeout(() => { if (_t4Active) _spawnT4Wave(); }, 700);
    return;
  }
  _t4MobAttack();
}

function _t4ReadySkill() {
  const equipped = G.equippedSkills || G.unlockedSkills || [];
  if (!equipped.length) return null;
  const now = performance.now();
  const allSkills = (typeof _getSkills === 'function') ? _getSkills() : [];
  for (const sid of equipped) {
    if (!_IDLE_SKILL_DMG || !_IDLE_SKILL_DMG[sid]) continue;
    if ((_t4SkillCd[sid] || 0) > now) continue;
    const def = allSkills.find(s => s.id === sid);
    return { id: sid, cd: def ? def.cd : 3 };
  }
  return null;
}

function _t4MobAttack() {
  const eq = (typeof getEquippedStatBonus === 'function') ? getEquippedStatBonus() : { def:0 };
  const defStat = (G.baseDef || 0) + (eq.def || 0);
  let dmg = 0;
  _t4Mobs.forEach(m => { if (!m.dead) dmg += Math.max(1, m.atk - Math.floor(defStat * 0.5)); });
  if (G.damageReduction) dmg = Math.floor(dmg * (1 - G.damageReduction));
  if (dmg <= 0) return;
  _t4Hp -= dmg;
  if (_t4Hp <= 0) {
    if (G.hasRevive && !_t4Revived) {
      _t4Revived = true;
      _t4Hp = Math.floor(_t4MaxHp * 0.5);
      _floatT4(0, '🕊️ ฟื้นคืนชีพ!', 'crit');
      _updateT4Hud();
      return;
    }
    _t4Hp = 0;
    _endT4Dungeon(false);
  }
}

// ---------- loot — ดรอป 2.5% ต่อชิ้น ----------
function _rollT4Drops() {
  const T = T4_DUNGEON;
  const collected = _t4Collected();
  const gear = T.gear[G.classId] || [];
  let gotSomething = false;
  for (let i = 0; i < T.pieceCount; i++) {
    if (collected[i]) continue;               // มีแล้วไม่ดรอปซ้ำ
    if (Math.random() < T.dropChance) {
      collected[i] = true;
      gotSomething = true;
      _grantT4Piece(gear[i]);
      _floatT4(0, `🎁 ${gear[i].icon} ${gear[i].name}!`, 'crit');
      if (typeof logBattle === 'function')
        logBattle(`<span class="log-exp">🎁 ดรอปของหายาก: ${gear[i].icon} ${gear[i].name} (${t4GearCount()}/6)</span>`);
    }
  }
  if (gotSomething) {
    if (typeof saveGame === 'function') saveGame();
    if (hasAllT4Gear()) {
      if (typeof logBattle === 'function')
        logBattle(`<span class="log-exp">✨ เก็บของครบ 6 ชิ้นแล้ว! ${t4QuestDone() ? 'พร้อมวิวัฒนาการ Tier 4!' : 'เหลือทำเควสประจำอาชีพ'}</span>`);
      // จบดันอัตโนมัติเมื่อครบ — กลับไปวิวัฒนาการได้
      setTimeout(() => { if (_t4Active) _endT4Dungeon(true); }, 1200);
    }
  }
}

// เพิ่มของจริงเข้า inventory
function _grantT4Piece(piece) {
  if (!piece) return;
  if (!G.inventory) G.inventory = [];
  G.inventory.push({
    ...piece,
    uid: Date.now() + Math.random(),
    rarity: 'mythic',
    requiredClass: G.classId,
    level: G.level,
  });
}

// ---------- end ----------
function _endT4Dungeon(complete) {
  _stopT4Loop();
  _t4Revived = false;
  _renderT4Result(complete);
}

function _renderT4Result(complete) {
  const stage = document.getElementById('t4d-stage');
  if (!stage) return;
  const count = t4GearCount();
  const questOk = t4QuestDone();
  const ready = complete && hasAllT4Gear() && questOk;
  stage.innerHTML = `
    <div class="trial-result${ready ? ' secret' : ''}">
      <div class="trial-result-dead">${complete ? '🏆 ครบ 6 ชิ้นแล้ว!' : '💀 พ่ายแพ้ในดันเจี้ยน'}</div>
      <div class="trial-result-stats">เก็บของได้ <b>${count}/6</b> ชิ้น</div>
      <div class="trial-result-verdict">เควสประจำอาชีพ: ${questOk ? '<span style="color:#66ff99">✓ เสร็จแล้ว</span>' : '<span style="color:#ff8888">✗ ยังไม่เสร็จ</span>'}</div>
      ${ready
        ? `<div class="trial-result-hint" style="color:#66ff99">✨ พร้อมวิวัฒนาการ Tier 4 แล้ว! กดปุ่มวิวัฒนาการที่หน้าหลัก</div>`
        : `<div class="trial-result-hint">เก็บของให้ครบ 6 ชิ้น และทำเควสประจำอาชีพให้เสร็จ เพื่อปลดล็อก Tier 4</div>`}
      <button class="btn-trial-start" onclick="${count < 6 ? 'startT4Dungeon()' : 'closeT4Dungeon()'}">${count < 6 ? '⚔️ สู้ต่อ' : 'เสร็จสิ้น'}</button>
      <button class="btn-trial-cancel" onclick="closeT4Dungeon()">ออก</button>
    </div>`;
}

// ---------- rendering ----------
function _renderT4Stage() {
  const stage = document.getElementById('t4d-stage');
  if (!stage) return;
  const hpPct = _t4MaxHp > 0 ? Math.max(0, (_t4Hp / _t4MaxHp) * 100) : 100;
  const playerSprite = (typeof getPlayerSpriteWithCosmetic !== 'undefined')
    ? getPlayerSpriteWithCosmetic(G.classId || 'warrior', G.classTier || 1, G.cosmeticTier || 1)
    : (typeof getPlayerSprite !== 'undefined' ? getPlayerSprite(G.classId || 'warrior', G.classTier || 1) : '🧍');

  let mobsHtml = '';
  _t4Mobs.forEach((m, idx) => {
    const pct = Math.max(0, (m.hp / m.maxHp) * 100);
    // รูปตัวละคร T4 อาชีพตัวเอง (fallback: ฐาน tier 4 → emoji)
    const img = `assets/sprites/${m.pngClass}_T4${m.pngSuffix||''}.png`;
    const baseImg = `assets/sprites/${m.pngClass}_T4.png`;
    const onErr = (img !== baseImg)
      ? `this.onerror=function(){this.outerHTML='${(m.icon||'👤').replace(/'/g,'')}'};this.src='${baseImg}'`
      : `this.outerHTML='${(m.icon||'👤').replace(/'/g,'')}'`;
    const sprite = `<img src="${img}" style="image-rendering:pixelated" onerror="${onErr}">`;
    mobsHtml += `
      <div class="idle-mob t4d-foe${m.dead ? ' dead' : ''}" data-idx="${idx}">
        <div class="idle-mob-sprite">${sprite}</div>
        <div class="idle-mob-name" style="color:${m.color||'#fff'}">${m.name}</div>
        <div class="idle-mob-hp"><div class="idle-mob-hp-fill" style="width:${pct}%"></div></div>
      </div>`;
  });

  stage.innerHTML = `
    <div class="trial-hud" id="t4d-hud"></div>
    <div class="trial-arena">
      <div class="idle-mobs-wrap">${mobsHtml}</div>
      <div class="idle-vs">⚔</div>
      <div class="idle-hero">
        <div class="idle-hero-sprite" id="t4d-hero-sprite">${playerSprite}</div>
        <div class="idle-mob-name">คุณ</div>
        <div class="idle-mob-hp"><div class="idle-mob-hp-fill idle-hero-hp" id="t4d-hero-hp" style="width:${hpPct}%"></div></div>
      </div>
    </div>`;
  _updateT4Hud();
}

function _updateT4Hud() {
  const hud = document.getElementById('t4d-hud');
  if (hud) {
    hud.innerHTML = `
      <span>🌊 เวฟ ${_t4Wave}</span>
      <span>🧩 ${t4GearCount()}/6 ชิ้น</span>
      <span class="trial-hud-next">ดรอป ${(T4_DUNGEON.dropChance*100).toFixed(1)}%/ชิ้น</span>`;
  }
  const hpFill = document.getElementById('t4d-hero-hp');
  if (hpFill) hpFill.style.width = `${_t4MaxHp > 0 ? Math.max(0, (_t4Hp/_t4MaxHp)*100) : 100}%`;
}

function _flashT4Mob(idx) {
  const stage = document.getElementById('t4d-stage');
  const spr = stage && stage.querySelector(`.idle-mob[data-idx="${idx}"] .idle-mob-sprite`);
  if (spr) { spr.classList.remove('hit'); void spr.offsetWidth; spr.classList.add('hit'); }
  const fill = stage && stage.querySelector(`.idle-mob[data-idx="${idx}"] .idle-mob-hp-fill`);
  if (fill) { const m = _t4Mobs[idx]; fill.style.width = `${Math.max(0, (m.hp/m.maxHp)*100)}%`; }
  const hero = document.getElementById('t4d-hero-sprite');
  if (hero) { hero.classList.add('atk'); setTimeout(() => hero.classList.remove('atk'), 180); }
}

function _markT4MobDead(idx) {
  const stage = document.getElementById('t4d-stage');
  const wrap = stage && stage.querySelector(`.idle-mob[data-idx="${idx}"]`);
  if (wrap) wrap.classList.add('dead');
}

function _floatT4(idx, html, cls) {
  const stage = document.getElementById('t4d-stage');
  const wrap = stage && stage.querySelector(`.idle-mob[data-idx="${idx}"]`);
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = 'idle-dmg-float' + (cls ? ' ' + cls : '');
  el.innerHTML = html;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 1400);
}
