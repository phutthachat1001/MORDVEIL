// ============================================================
// INFINITY TRIAL — การทดสอบนิรันดร์ (ปลดล็อกตอน Tier 2)
// ------------------------------------------------------------
// เมื่อถึง Tier 2 ผู้เล่นเข้าสู่ "การทดสอบ" แทนการเลือกเส้นทางเอง:
//   • ตีมอนเป็นคลื่นไม่จบสิ้น มอนแรงขึ้นเรื่อยๆ ทุกคลื่น
//   • HP ไม่ฟื้นระหว่าง run — ตายเมื่อไหร่ = จบ
//   • จำนวนมอนที่ตี (kills) ตัดสินว่าได้ branch ไหนของ Tier 3:
//       kills น้อย  → branch B (เส้นทางพื้นฐาน)
//       kills เยอะ  → branch A (เส้นทางโหด)
//       kills สูงมาก + คลื่นลึก + โชค → SECRET Tier (branch S)
//   • Tier 3 → 4 หลังจากนั้นเดินเส้นตรงตาม branch ที่ถูกล็อก
// ============================================================

let _trialActive   = false;
let _trialMobs     = [];
let _trialWave     = 0;
let _trialKills    = 0;
let _trialLoop     = null;
let _trialHp       = 0;
let _trialMaxHp    = 0;
let _trialSkillCd  = {};   // skillId -> ready timestamp(ms)
let _trialDeepestWave = 0;

// ---------- entry / gate ----------
const TRIAL_MIN_LEVEL = 50;   // ต้องถึง Lv50 ก่อนเข้าการทดสอบ (T2→T3) — ยืดเกมให้ช้าลง

function canEnterTrial() {
  return G.classId && (G.classTier || 1) === 2 && !G.classBranch
    && (G.level || 1) >= TRIAL_MIN_LEVEL;
}

function openInfinityTrial() {
  // ยังไม่ถึงเลเวลขั้นต่ำ — บอกผู้เล่นแทนที่จะเปิดเงียบๆ
  if (G.classId && (G.classTier || 1) === 2 && !G.classBranch
      && (G.level || 1) < TRIAL_MIN_LEVEL) {
    if (typeof logBattle === 'function')
      logBattle(`<span class="log-sys">🔒 ต้องถึงเลเวล ${TRIAL_MIN_LEVEL} ก่อนจึงจะเข้าการทดสอบนิรันดร์ได้ (ตอนนี้ Lv ${G.level||1})</span>`);
    return;
  }
  if (!canEnterTrial()) return;
  const overlay = document.getElementById('infinity-overlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  overlay.classList.add('active');
  _renderTrialIntro();
}

function closeInfinityTrial() {
  _stopTrialLoop();
  const overlay = document.getElementById('infinity-overlay');
  if (overlay) { overlay.classList.remove('active'); overlay.style.display = 'none'; }
}

// intro screen — explains the rules + start button
function _renderTrialIntro() {
  const stage = document.getElementById('infinity-stage');
  if (!stage) return;
  const T = INFINITY_TRIAL;
  stage.innerHTML = `
    <div class="trial-intro">
      <div class="trial-title">♾️ การทดสอบนิรันดร์</div>
      <div class="trial-sub">เส้นทางวิวัฒนาการของคุณจะถูกตัดสินด้วยฝีมือ ไม่ใช่การเลือก</div>
      <ul class="trial-rules">
        <li>⚔️ ตีมอนเป็นคลื่นไม่จบสิ้น — แต่ละคลื่นแรงขึ้นเรื่อยๆ</li>
        <li>❤️ HP ไม่ฟื้นระหว่างการทดสอบ — ตายเมื่อไหร่ จบทันที</li>
        <li>🎲 คลาสที่ได้เป็นการ <b>สุ่ม</b> — ทุกคลาสมีดีของตัวเอง!</li>
        <li>💀 ยิ่งตีได้เยอะ ยิ่งเพิ่ม <b>%</b> คลาสสายโหด (พิฆาต/จอมทัพ)</li>
        <li>★ ทะลุคลื่นที่ ${T.secret.minWave}+ และตี ${T.secret.minKillsToRoll}+ → เริ่มมีลุ้น <span style="color:#ff00cc">Tier ลับ (S)</span> — ยิ่งตีเยอะ % ยิ่งสูง</li>
      </ul>
      <div class="trial-thresholds">
        <span>เริ่มต้น: B/A สูง — สาย C/D/S ต่ำ</span>
        <span style="color:#ffcc44">ตีเยอะ: C/D/S พุ่งขึ้น</span>
      </div>
      <button class="btn-trial-start" onclick="startInfinityTrial()">⚔️ เริ่มการทดสอบ</button>
      <button class="btn-trial-cancel" onclick="closeInfinityTrial()">ยังไม่พร้อม</button>
    </div>`;
}

// ---------- run lifecycle ----------
function startInfinityTrial() {
  if (!canEnterTrial()) { closeInfinityTrial(); return; }
  _trialActive = true;
  _trialWave = 0;
  _trialKills = 0;
  _trialDeepestWave = 0;
  _trialSkillCd = {};
  _trialMaxHp = _trialHp = _trialPlayerMaxHp();
  _spawnTrialWave();

  let lastAttack = 0;
  _trialLoop = setInterval(() => {
    const now = performance.now();
    if (now - lastAttack >= _trialInterval()) {
      lastAttack = now;
      _trialTick();
    }
    _updateTrialHud();
  }, 90);
}

function _stopTrialLoop() {
  if (_trialLoop) { clearInterval(_trialLoop); _trialLoop = null; }
  _trialActive = false;
}

function _trialPlayerMaxHp() {
  const eq = (typeof getEquippedStatBonus === 'function') ? getEquippedStatBonus() : { hp:0 };
  return (G.maxHp || 100) + (eq.hp || 0);
}

// trial swings faster than normal combat so the gauntlet feels snappy
function _trialInterval() {
  const base = (typeof getAttackInterval === 'function') ? getAttackInterval() : 3000;
  return Math.max(420, Math.floor(base * (INFINITY_TRIAL.attackSpeedMult || 0.42)));
}

// ---------- wave spawning (scales each wave) ----------
function _spawnTrialWave() {
  _trialWave++;
  if (_trialWave > _trialDeepestWave) _trialDeepestWave = _trialWave;
  const T = INFINITY_TRIAL;
  const pool = _trialMonsterPool();
  const hpScale  = Math.pow(1 + T.hpGrowthPerWave,  _trialWave - 1);
  const atkScale = Math.pow(1 + T.atkGrowthPerWave, _trialWave - 1);

  _trialMobs = [];
  for (let i = 0; i < T.mobsPerWave; i++) {
    const base = pool[Math.floor(Math.random() * pool.length)];
    const full = getMonsterStats(base.zone, base.tier, false);
    const hp  = Math.max(1, Math.floor(full.maxHp * T.baseHpMult  * hpScale));
    const atk = Math.max(1, Math.floor(full.atk   * T.baseAtkMult * atkScale));
    _trialMobs.push({
      name: base.name, sprite: base.sprite, img: base.img,
      tier: base.tier, zone: base.zone,
      hp, maxHp: hp, atk, dead: false,
    });
  }
  _renderTrialStage();
}

// reuse the IDLE pool logic if available; else build from cleared zones
function _trialMonsterPool() {
  if (typeof _idleMonsterPool === 'function') {
    const p = _idleMonsterPool();
    if (p && p.length) return p;
  }
  const pool = [];
  (ZONES || []).forEach(z => {
    if (z.id > (G.currentZone || 1)) return;
    z.monsters.forEach(m => { if (!m.isBoss) pool.push({ ...m, zone: z.id }); });
  });
  if (!pool.length && ZONES[0]) pool.push({ ...ZONES[0].monsters[0], zone: 1 });
  return pool;
}

// ---------- combat tick ----------
function _trialTick() {
  if (!_trialActive) return;
  let idx = _trialMobs.findIndex(m => !m.dead);
  if (idx === -1) { _spawnTrialWave(); return; }
  const mob = _trialMobs[idx];

  // hero attack (mirrors idle combat math)
  const eqBonus = (typeof getEquippedStatBonus === 'function') ? getEquippedStatBonus() : { atk:0, crit:0 };
  const cls = (typeof CLASSES !== 'undefined') ? CLASSES.find(c => c.id === G.classId) : null;
  let atk = (G.baseAtk || 10) + (eqBonus.atk || 0) + Math.floor(Math.random() * (G.level || 1)) + 1;
  const critChance = .05 + (cls && cls.bonuses && cls.bonuses.critBonus ? cls.bonuses.critBonus : 0)
                   + (eqBonus.crit || 0) / 100 + (G.critBonusFromTree || 0);
  let isCrit = Math.random() < critChance;

  // skill auto-cast (reuse idle skill table)
  let hits = 1, label = '', castDot = null;
  if (typeof _idleReadySkill === 'function' && typeof _IDLE_SKILL_DMG !== 'undefined') {
    const skill = _trialReadySkill();
    if (skill) {
      const def = _IDLE_SKILL_DMG[skill.id];
      atk = Math.floor(atk * def.mult);
      hits = def.hits; label = def.label; castDot = def.dot || null;
      _trialSkillCd[skill.id] = performance.now() + (skill.cd || 3) * _trialInterval();
    }
  }
  // secret-trait: rogue double strike
  if ((G.doubleStrikeChance || 0) > 0 && Math.random() < G.doubleStrikeChance) hits += 1;
  if (isCrit) atk = Math.floor(atk * 2);

  const total = atk * hits;
  mob.hp -= total;
  if (castDot && typeof _applyDot === 'function') _applyDot(mob, castDot, total);
  _flashTrialMob(idx);
  _floatTrial(idx, `${isCrit ? '💥' : ''}${label ? label + ' ' : ''}${hits > 1 ? atk + '×' + hits : total}`, isCrit ? 'crit' : '');

  // lifesteal from secret traits
  if ((G.lifestealBonus || 0) > 0) {
    const heal = Math.floor(total * G.lifestealBonus);
    if (heal > 0) { _trialHp = Math.min(_trialMaxHp, _trialHp + heal); }
  }

  if (mob.hp <= 0) {
    mob.dead = true;
    _trialKills++;
    _markTrialMobDead(idx);
    if (_trialMobs.every(m => m.dead)) setTimeout(() => { if (_trialActive) _spawnTrialWave(); }, 500);
    return;
  }

  // tick poison/burn on all mobs
  if (typeof _tickIdleDots === 'function') {
    const dotKilled = _tickIdleDots(_trialMobs, _floatTrial);
    if (dotKilled) {
      _trialMobs.forEach(m => { if (m._diedToDot) { m._diedToDot = false; _trialKills++; } });
      _trialMobs.forEach((m, i) => { if (m.dead) _markTrialMobDead(i); });
      if (_trialMobs.every(m => m.dead)) { setTimeout(() => { if (_trialActive) _spawnTrialWave(); }, 500); return; }
    }
  }

  // surviving mobs hit back
  _trialMobsAttack();
}

function _trialReadySkill() {
  const equipped = G.equippedSkills || G.unlockedSkills || [];
  if (!equipped.length) return null;
  const now = performance.now();
  const allSkills = (typeof _getSkills === 'function') ? _getSkills() : [];
  for (const sid of equipped) {
    if (!_IDLE_SKILL_DMG[sid]) continue;
    if ((_trialSkillCd[sid] || 0) > now) continue;
    const def = allSkills.find(s => s.id === sid);
    return { id: sid, cd: def ? def.cd : 3 };
  }
  return null;
}

function _trialMobsAttack() {
  const eq = (typeof getEquippedStatBonus === 'function') ? getEquippedStatBonus() : { def:0 };
  const defStat = (G.baseDef || 0) + (eq.def || 0);
  let dmg = 0;
  _trialMobs.forEach(m => { if (!m.dead) dmg += Math.max(1, m.atk - Math.floor(defStat * 0.5)); });
  if (G.damageReduction) dmg = Math.floor(dmg * (1 - G.damageReduction));
  if (dmg <= 0) return;
  _trialHp -= dmg;
  if (_trialHp <= 0) {
    // secret paladin: revive once per run
    if (G.hasRevive && !_trialRevivedThisRun) {
      _trialRevivedThisRun = true;
      _trialHp = Math.floor(_trialMaxHp * 0.5);
      _floatTrial(0, '🕊️ ฟื้นคืนชีพ!', 'crit');
      _updateTrialHud();
      return;
    }
    _trialHp = 0;
    _endTrial();
  }
}
let _trialRevivedThisRun = false;

// ---------- end → roll Tier 3 branch from kills ----------
function _endTrial() {
  _stopTrialLoop();
  _trialRevivedThisRun = false;
  const result = _rollTrialBranch(_trialKills, _trialDeepestWave);
  _renderTrialResult(result);
}

// compute the weighted chance of each branch given a run's kills/wave.
// returns { weights:{branch:pct}, order:[branch...] } — pct sums to 100.
function _trialBranchChances(kills, deepestWave) {
  const T = INFINITY_TRIAL;
  const floor = T.minWeight || 1;
  const w = {};
  Object.keys(T.branchInfo).forEach(b => {
    const info = T.branchInfo[b];
    w[b] = Math.max(floor, info.base + info.perKill * kills);
  });
  // SECRET only enters the pool if you went deep enough AND killed enough
  const s = T.secret;
  if (deepestWave >= s.minWave && kills >= s.minKillsToRoll) {
    w.S = Math.max(floor, s.base + s.perKill * kills);
  }
  const total = Object.values(w).reduce((a, b) => a + b, 0) || 1;
  const pct = {};
  Object.keys(w).forEach(b => { pct[b] = Math.round((w[b] / total) * 100); });
  return { weights: w, pct, total };
}

// roll a Tier-3 branch using the weighted chances (every class can appear)
function _rollTrialBranch(kills, deepestWave) {
  const T = INFINITY_TRIAL;
  const { weights } = _trialBranchChances(kills, deepestWave);
  // weighted random pick
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  let branch = 'B';
  for (const b of Object.keys(weights)) { r -= weights[b]; if (r <= 0) { branch = b; break; } }

  const info = (branch === 'S') ? T.secret : T.branchInfo[branch];
  const path = CLASS_EVOLUTIONS[G.classId] || [];
  const evo  = path.find(e => e.tier === 3 && e.branch === branch);
  return { branch, rank: info.rank, label: info.label, evo, kills, deepestWave,
           chances: _trialBranchChances(kills, deepestWave).pct };
}

function _renderTrialResult(result) {
  const stage = document.getElementById('infinity-stage');
  if (!stage || !result.evo) return;
  const evo = result.evo;
  const secret = result.branch === 'S';
  const tierLabel = secret
    ? '<span style="color:#ff00cc">★ TIER ลับ ★</span>'
    : `<span class="trial-rank trial-rank-${result.rank}">${result.rank}</span> ${result.label}`;

  // show the odds this run had (so the % system feels transparent)
  // เรียงจาก % มาก→น้อย เพื่อให้อ่านเข้าใจง่าย (ไม่งงว่าทำไม B มาก่อน A)
  const ch = result.chances || {};
  const chRow = Object.keys(ch)
    .sort((a, b) => ch[b] - ch[a])
    .map(b => {
      const info = (b === 'S') ? INFINITY_TRIAL.secret : INFINITY_TRIAL.branchInfo[b];
      const hit = b === result.branch;
      return `<span style="opacity:${hit?1:.5};font-weight:${hit?800:400}">${info.rank} ${ch[b]}%</span>`;
    }).join(' · ');

  // preview the kills-based rewards the player will receive
  const R = INFINITY_TRIAL.killRewards || {};
  const k = Math.min(result.kills, R.maxKillsForStats || result.kills);
  const rwParts = [];
  if (R.atkPerKill && Math.floor(k*R.atkPerKill)) rwParts.push(`+${Math.floor(k*R.atkPerKill)} ATK`);
  if (R.hpPerKill  && Math.floor(k*R.hpPerKill))  rwParts.push(`+${Math.floor(k*R.hpPerKill)} HP`);
  if (R.defPerKill && Math.floor(k*R.defPerKill)) rwParts.push(`+${Math.floor(k*R.defPerKill)} DEF`);
  const pts = Math.min(R.maxSkillPoints||0, Math.floor(result.kills/(R.killsPerSkillPoint||999)));
  if (pts) rwParts.push(`+${pts} แต้มสกิล`);
  const rwRow = rwParts.length
    ? `<div class="trial-result-hint" style="color:#7dff7d;font-size:.74rem">🏅 โบนัสจาก ${result.kills} kills: ${rwParts.join(' · ')}</div>` : '';

  stage.innerHTML = `
    <div class="trial-result${secret ? ' secret' : ''}">
      <div class="trial-result-dead">💀 การทดสอบสิ้นสุด</div>
      <div class="trial-result-stats">
        ตีได้ <b>${result.kills}</b> ตัว · ทะลุถึงคลื่นที่ <b>${result.deepestWave}</b>
      </div>
      <div class="trial-result-verdict">${tierLabel}</div>
      <div class="trial-result-icon" style="color:${evo.color}">${evo.icon}</div>
      <div class="trial-result-name" style="color:${evo.color}">${evo.name}</div>
      <div class="trial-result-lore">${evo.lore || ''}</div>
      <div class="trial-result-bonus">${typeof formatBonuses === 'function' ? formatBonuses(evo.bonuses) : ''}</div>
      ${rwRow}
      <div class="trial-result-hint" style="font-size:.7rem">🎲 โอกาส run นี้: ${chRow}</div>
      <button class="btn-trial-start" onclick="confirmTrialEvolution('${result.branch}')">✨ รับวิวัฒนาการ</button>
    </div>`;
}

// commit the rolled branch → force the Tier-3 evolution
function confirmTrialEvolution(branch) {
  const path = CLASS_EVOLUTIONS[G.classId] || [];
  const evo  = path.find(e => e.tier === 3 && e.branch === branch);
  const kills = _trialKills;   // capture before closing resets state
  closeInfinityTrial();
  if (!evo) return;
  G.classBranch = branch;
  evolveClass(evo);   // forced — skips condition gate
  _grantTrialKillRewards(kills);
}

// Grant kills-based rewards on top of the class % — more kills = more reward.
function _grantTrialKillRewards(kills) {
  const R = INFINITY_TRIAL.killRewards;
  if (!R || !kills) return;

  // permanent stats (capped so huge runs don't inflate)
  const k = Math.min(kills, R.maxKillsForStats);
  const atk = Math.floor(k * R.atkPerKill);
  const hp  = Math.floor(k * R.hpPerKill);
  const def = Math.floor(k * R.defPerKill);
  if (atk) G.baseAtk += atk;
  if (hp)  { G.maxHp += hp; G.hp = G.maxHp; }
  if (def) G.baseDef += def;

  // bonus skill points (into the main pool, capped per run)
  const pts = Math.min(R.maxSkillPoints, Math.floor(kills / R.killsPerSkillPoint));
  if (pts > 0) {
    // award by crediting earned-points: store as a persistent bonus the
    // skill-tree refresh adds on top of level-based points
    G.trialSkillPoints = (G.trialSkillPoints || 0) + pts;
    if (typeof refreshSkillPoints === 'function') refreshSkillPoints();
  }

  if (typeof logBattle === 'function') {
    const parts = [];
    if (atk) parts.push(`+${atk} ATK`);
    if (hp)  parts.push(`+${hp} HP`);
    if (def) parts.push(`+${def} DEF`);
    if (pts) parts.push(`+${pts} แต้มสกิล`);
    if (parts.length)
      logBattle(`<span class="log-exp">🏅 โบนัสจากการทดสอบ (ตี ${kills} ตัว): ${parts.join(' · ')}</span>`);
  }
  if (typeof updateTopBar === 'function') updateTopBar();
  if (typeof renderAll === 'function') renderAll();
  if (typeof saveGame === 'function') saveGame();
}

// ---------- rendering ----------
function _renderTrialStage() {
  const stage = document.getElementById('infinity-stage');
  if (!stage) return;
  const hpPct = _trialMaxHp > 0 ? Math.max(0, (_trialHp / _trialMaxHp) * 100) : 100;
  const playerSprite = (typeof getPlayerSpriteWithCosmetic !== 'undefined')
    ? getPlayerSpriteWithCosmetic(G.classId || 'warrior', G.classTier || 1, G.cosmeticTier || 1)
    : (typeof getPlayerSprite !== 'undefined' ? getPlayerSprite(G.classId || 'warrior', G.classTier || 1) : '🧍');

  let mobsHtml = '';
  _trialMobs.forEach((m, idx) => {
    const pct = Math.max(0, (m.hp / m.maxHp) * 100);
    const sprite = m.img
      ? `<img src="assets/sprites/${m.img}.png" onerror="this.outerHTML='${(m.sprite||'👾').replace(/'/g,'')}'">`
      : (m.sprite || '👾');
    mobsHtml += `
      <div class="idle-mob${m.dead ? ' dead' : ''}" data-idx="${idx}">
        <div class="idle-mob-sprite">${sprite}</div>
        <div class="idle-mob-name">${m.name}</div>
        <div class="idle-mob-hp"><div class="idle-mob-hp-fill" style="width:${pct}%"></div></div>
      </div>`;
  });

  stage.innerHTML = `
    <div class="trial-hud" id="trial-hud"></div>
    <div class="trial-arena">
      <div class="idle-mobs-wrap">${mobsHtml}</div>
      <div class="idle-vs">⚔</div>
      <div class="idle-hero">
        <div class="idle-hero-sprite" id="trial-hero-sprite">${playerSprite}</div>
        <div class="idle-mob-name">คุณ</div>
        <div class="idle-mob-hp"><div class="idle-mob-hp-fill idle-hero-hp" id="trial-hero-hp" style="width:${hpPct}%"></div></div>
      </div>
    </div>`;
  _updateTrialHud();
}

function _updateTrialHud() {
  const hud = document.getElementById('trial-hud');
  if (hud) {
    // live odds for each class branch (the % system, transparent to player)
    const { pct } = _trialBranchChances(_trialKills, _trialDeepestWave);
    const order = ['B','A','C','D','S'];
    const odds = order.filter(b => pct[b] != null).map(b => {
      const info = (b === 'S') ? INFINITY_TRIAL.secret : INFINITY_TRIAL.branchInfo[b];
      const col = b === 'S' ? '#ff00cc' : (b === 'D' ? '#ffcc44' : '#aaccff');
      return `<span style="color:${col}">${info.rank} ${pct[b]}%</span>`;
    }).join(' ');
    const secretHint = (_trialDeepestWave < INFINITY_TRIAL.secret.minWave)
      ? `<span class="trial-hud-next">★ ทะลุคลื่น ${INFINITY_TRIAL.secret.minWave}+ เพื่อปลดล็อก Tier ลับ</span>` : '';
    hud.innerHTML = `
      <span>🌊 คลื่น ${_trialWave}</span>
      <span>💀 ${_trialKills} ตัว</span>
      <span class="trial-hud-odds">${odds}</span>
      ${secretHint}`;
  }
  const hpFill = document.getElementById('trial-hero-hp');
  if (hpFill) hpFill.style.width = `${_trialMaxHp > 0 ? Math.max(0, (_trialHp/_trialMaxHp)*100) : 100}%`;
}

function _flashTrialMob(idx) {
  const stage = document.getElementById('infinity-stage');
  const spr = stage && stage.querySelector(`.idle-mob[data-idx="${idx}"] .idle-mob-sprite`);
  if (spr) { spr.classList.remove('hit'); void spr.offsetWidth; spr.classList.add('hit'); }
  const fill = stage && stage.querySelector(`.idle-mob[data-idx="${idx}"] .idle-mob-hp-fill`);
  if (fill) { const m = _trialMobs[idx]; fill.style.width = `${Math.max(0, (m.hp/m.maxHp)*100)}%`; }
  const hero = document.getElementById('trial-hero-sprite');
  if (hero) { hero.classList.add('atk'); setTimeout(() => hero.classList.remove('atk'), 180); }
}

function _markTrialMobDead(idx) {
  const stage = document.getElementById('infinity-stage');
  const wrap = stage && stage.querySelector(`.idle-mob[data-idx="${idx}"]`);
  if (wrap) wrap.classList.add('dead');
}

function _floatTrial(idx, html, cls) {
  const stage = document.getElementById('infinity-stage');
  const wrap = stage && stage.querySelector(`.idle-mob[data-idx="${idx}"]`);
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = 'idle-dmg-float' + (cls ? ' ' + cls : '');
  el.innerHTML = html;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 1400);
}
