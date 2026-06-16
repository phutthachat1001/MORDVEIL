// ============================================================
// IDLE FARMING PANEL — runs continuously, view-only.
// Separate from the manual zone-monster fight. Your hero stands and
// auto-attacks a small group of WEAKER random monsters drawn from the
// current + cleared zones, on the speed-stat timer. Items drop floating
// above the monster's head. The hero takes damage; on death it waits 3s
// to respawn. EXP/gold-per-minute is tracked and shown in the header.
// ============================================================

// IDLE monsters are much weaker than the real zone monsters so kills are
// fast and the numbers visibly tick (proper IDLE-game feel).
const IDLE_HP_MULT     = 0.18;  // HP scale vs real monster (low → quick kills)
const IDLE_ATK_MULT    = 0.25;  // ATK scale vs real monster (gentle on the hero)
const IDLE_REWARD_MULT = 0.35;  // EXP/gold vs a boss-baseline kill
const IDLE_RESPAWN_MS  = 3000;  // hero respawn delay on death

let _idleMobs       = [];       // [{name, sprite, img, tier, zone, hp, maxHp, atk, dead}]
let _idleLoopTimer  = null;     // setInterval handle for the tick
let _idleTargetIdx  = 0;
let _idlePlayerHp   = 0;        // hero HP inside the IDLE panel (separate from G.hp)
let _idlePlayerMax  = 0;
let _idleSkillReady = {};       // skillId -> timestamp(ms) when it can cast again

// Damage skills usable in IDLE: extra hits / damage multiplier vs a normal hit.
// (Buff/utility skills are skipped in IDLE — only offensive ones auto-cast.)
const _IDLE_SKILL_DMG = {
  quick_stab:    { mult: 1.2, hits: 2, label: '🗡 แทงเร็ว' },
  slam:          { mult: 2.5, hits: 1, label: '💥 กระทืบ' },
  dragon_breath: { mult: 2.0, hits: 1, label: '🐉 ลมหายใจ' },
  magic_bolt:    { mult: 1.8, hits: 1, label: '🔥 ลูกไฟ' },
  precise_shot:  { mult: 2.0, hits: 1, label: '🎯 ยิงแม่น' },
  holy_strike_t1:{ mult: 1.8, hits: 1, label: '✨ ฟันศักดิ์สิทธิ์' },
  backstab:      { mult: 2.2, hits: 1, label: '🗡 ลอบแทง' },
  power_shot:    { mult: 2.4, hits: 1, label: '🏹 ธนูทรง' },
  fireball:      { mult: 2.6, hits: 1, label: '🔥 ไฟบรรลัย' },
  shadow_strike: { mult: 2.8, hits: 1, label: '🌑 เงาสังหาร' },
};
// merge in the C/D/S branch skills defined in data.js (Infinity Trial branches)
if (typeof INFINITY_IDLE_SKILLS !== 'undefined') Object.assign(_IDLE_SKILL_DMG, INFINITY_IDLE_SKILLS);
let _idleDead       = false;    // hero is dead, waiting to respawn
let _idleRespawnAt  = 0;        // timestamp when hero respawns

// per-minute reward tracking (rolling window)
let _idleRewardLog  = [];       // [{t, exp, gold}]
let _idleSessionKills = 0;      // mobs killed in this IDLE session

// ---------- pool of monsters the IDLE panel may spawn ----------
function _idleMonsterPool() {
  const pool = [];
  const curZone = G.currentZone || 1;
  (ZONES || []).forEach(z => {
    const cleared = (G.zoneProgress && G.zoneProgress[z.id]) || 0;
    if (z.id > curZone) return;
    const isCurrent = z.id === curZone;
    z.monsters.forEach((m, idx) => {
      if (m.isBoss) return;                       // IDLE farms non-boss mobs only
      if (isCurrent && idx > cleared) return;      // current zone: up to progress
      pool.push({ ...m, zone: z.id });
    });
  });
  if (!pool.length && ZONES[0]) pool.push({ ...ZONES[0].monsters[0], zone: 1 });
  return pool;
}

function _idlePlayerMaxHp() {
  const eq = (typeof getEquippedStatBonus === 'function') ? getEquippedStatBonus() : { hp:0 };
  return (G.maxHp || 100) + (eq.hp || 0);
}

function _spawnIdleWave() {
  const pool = _idleMonsterPool();
  const count = 1 + Math.floor(Math.random() * 3); // 1-3 mobs
  _idleMobs = [];
  for (let i = 0; i < count; i++) {
    const base = pool[Math.floor(Math.random() * pool.length)];
    const full = getMonsterStats(base.zone, base.tier, false);
    const hp  = Math.max(1, Math.floor(full.maxHp * IDLE_HP_MULT));
    const atk = Math.max(1, Math.floor(full.atk   * IDLE_ATK_MULT));
    _idleMobs.push({
      name: base.name, sprite: base.sprite, img: base.img,
      tier: base.tier, zone: base.zone,
      hp, maxHp: hp, atk, dead: false,
    });
  }
  _idleTargetIdx = 0;
  _renderIdleStage();
  // maybe upgrade this wave into a special encounter (boss / raider)
  if (typeof idleMaybeSpawnSpecial === 'function') idleMaybeSpawnSpecial();
}

// ---------- rendering ----------
function _renderIdleStage() {
  const stage = document.getElementById('idle-stage');
  if (!stage) return;

  // zone background class on the panel
  const panel = document.getElementById('idle-panel');
  if (panel) panel.dataset.zone = G.currentZone || 1;

  const hpPct = _idlePlayerMax > 0 ? Math.max(0, (_idlePlayerHp / _idlePlayerMax) * 100) : 100;
  const playerSprite = (typeof getPlayerSpriteWithCosmetic !== 'undefined')
    ? getPlayerSpriteWithCosmetic(G.classId || 'warrior', G.classTier || 1, G.cosmeticTier || 1)
    : (typeof getPlayerSprite !== 'undefined' ? getPlayerSprite(G.classId || 'warrior', G.classTier || 1) : '🧍');

  let mobsHtml = '';
  _idleMobs.forEach((m, idx) => {
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

  // Layout: mobs on the LEFT, hero on the RIGHT (they face each other).
  stage.innerHTML = `
    <div class="idle-mobs-wrap">${mobsHtml}</div>
    <div class="idle-vs">⚔</div>
    <div class="idle-hero${_idleDead ? ' dead' : ''}">
      <div class="idle-hero-sprite" id="idle-hero-sprite">${playerSprite}</div>
      <div class="idle-mob-name">คุณ</div>
      <div class="idle-mob-hp"><div class="idle-mob-hp-fill idle-hero-hp" style="width:${hpPct}%"></div></div>
      ${_idleDead ? '<div class="idle-respawn">💀 รอเกิด...</div>' : ''}
    </div>`;

  _renderIdleSkillBar();
  _updateIdleHeader();
  // re-apply special-encounter styling/banner after any re-render
  if (typeof idleRedecorateSpecial === 'function') idleRedecorateSpecial();
}

// ---------- skill bar (shows active IDLE skills + cooldown gauges) ----------
function _renderIdleSkillBar() {
  const bar = document.getElementById('idle-skillbar');
  if (!bar) return;
  const equipped = (G.equippedSkills || []).filter(sid => _IDLE_SKILL_DMG[sid]);
  if (!equipped.length) {
    bar.innerHTML = '<span class="idle-skillbar-empty">ยังไม่มีสกิลโจมตี — อัพ Skill Tree เพื่อปลดล็อค</span>';
    return;
  }
  const allSkills = (typeof _getSkills === 'function') ? _getSkills() : [];
  const now = performance.now();
  bar.innerHTML = equipped.map(sid => {
    const def  = _IDLE_SKILL_DMG[sid];
    const meta = allSkills.find(s => s.id === sid) || { cd: 3, name: sid };
    const cdMs = (meta.cd || 3) * getAttackInterval();
    const readyAt = _idleSkillReady[sid] || 0;
    const remain  = Math.max(0, readyAt - now);
    const pct = cdMs > 0 ? Math.max(0, Math.min(100, (remain / cdMs) * 100)) : 0;
    const ready = remain <= 0;
    return `
      <div class="idle-skill${ready ? ' ready' : ''}" data-sid="${sid}" title="${meta.name}">
        <span class="idle-skill-icon">${(def.label || '⚡').split(' ')[0]}</span>
        <span class="idle-skill-name">${meta.name}</span>
        <div class="idle-skill-cd"><div class="idle-skill-cd-fill" style="width:${100 - pct}%"></div></div>
        <span class="idle-skill-cd-text">${ready ? 'พร้อม!' : (remain/1000).toFixed(1) + 'วิ'}</span>
      </div>`;
  }).join('');
}

function _updateIdleHeader() {
  const spdEl = document.getElementById('idle-panel-spd');
  if (spdEl) spdEl.textContent = `⚡ ${(getAttackInterval()/1000).toFixed(1)} วิ/ตี`;
  const rateEl = document.getElementById('idle-panel-rate');
  if (rateEl) {
    const { exp, gold } = _idleRatePerMin();
    rateEl.innerHTML = `📈 ${_fmtNum(exp)} EXP/นาที · 💰 ${_fmtNum(gold)}/นาที`;
  }
  const killEl = document.getElementById('idle-panel-kills');
  if (killEl) killEl.textContent = `💀 ${_idleSessionKills}`;
  _updateIdleSkillCooldowns();
  if (typeof idleSpecialTick === 'function') idleSpecialTick();
}

// update only the cooldown gauges (cheap, runs every tick)
function _updateIdleSkillCooldowns() {
  const bar = document.getElementById('idle-skillbar');
  if (!bar) return;
  const allSkills = (typeof _getSkills === 'function') ? _getSkills() : [];
  const now = performance.now();
  bar.querySelectorAll('.idle-skill').forEach(el => {
    const sid = el.dataset.sid;
    const meta = allSkills.find(s => s.id === sid) || { cd: 3 };
    const cdMs = (meta.cd || 3) * getAttackInterval();
    const remain = Math.max(0, (_idleSkillReady[sid] || 0) - now);
    const pct = cdMs > 0 ? Math.max(0, Math.min(100, (remain / cdMs) * 100)) : 0;
    const fill = el.querySelector('.idle-skill-cd-fill');
    const txt  = el.querySelector('.idle-skill-cd-text');
    if (fill) fill.style.width = `${100 - pct}%`;
    if (txt)  txt.textContent = remain <= 0 ? 'พร้อม!' : (remain/1000).toFixed(1) + 'วิ';
    el.classList.toggle('ready', remain <= 0);
  });
}

function _fmtNum(n) {
  if (n >= 1e6) return (n/1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n/1e3).toFixed(1) + 'k';
  return Math.round(n).toString();
}

// rolling window → per-minute. Uses elapsed-since-start (capped at 60s) as the
// denominator so a single early kill doesn't spike the rate to absurd numbers.
let _idleStartTime = 0;
function _idleRatePerMin() {
  const now = performance.now();
  _idleRewardLog = _idleRewardLog.filter(r => now - r.t <= 60000);
  if (!_idleRewardLog.length) return { exp: 0, gold: 0 };
  const elapsed = Math.min(60000, Math.max(5000, now - _idleStartTime)); // ≥5s floor
  const sumExp  = _idleRewardLog.reduce((s, r) => s + r.exp, 0);
  const sumGold = _idleRewardLog.reduce((s, r) => s + r.gold, 0);
  const scale = 60000 / elapsed;
  return { exp: sumExp * scale, gold: sumGold * scale };
}

function _updateIdleMobHp(idx) {
  const stage = document.getElementById('idle-stage');
  if (!stage) return;
  const wrap = stage.querySelector(`.idle-mob[data-idx="${idx}"]`);
  if (!wrap) return;
  const m = _idleMobs[idx];
  const fill = wrap.querySelector('.idle-mob-hp-fill');
  if (fill) fill.style.width = `${Math.max(0, (m.hp / m.maxHp) * 100)}%`;
  const spr = wrap.querySelector('.idle-mob-sprite');
  if (spr) {
    spr.classList.remove('hit');
    void wrap.offsetWidth;
    spr.classList.add('hit');
    setTimeout(() => spr.classList.remove('hit'), 160);
  }
}

function _updateIdleHeroHp() {
  const fill = document.querySelector('.idle-hero-hp');
  if (fill) fill.style.width = `${_idlePlayerMax > 0 ? Math.max(0, (_idlePlayerHp/_idlePlayerMax)*100) : 100}%`;
}

// ---------- floating popups above a mob's head ----------
function _floatAboveIdleMob(idx, html, cls) {
  const stage = document.getElementById('idle-stage');
  if (!stage) return;
  const wrap = stage.querySelector(`.idle-mob[data-idx="${idx}"]`);
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = cls;
  el.innerHTML = html;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 1700);
}

// Resolve the attack-effect image URL for the current class/tier/branch.
// Rogue has per-tier/per-branch art (rogue_T1, rogue_T3-A ... rogue_T4-S).
// Other classes fall back to rogue's tier art until their own art exists.
function getAttackFxUrl() {
  const tier = Math.min(4, Math.max(1, G.classTier || 1));
  const branch = G.classBranch;
  const fxClass = (G.classId === 'rogue') ? 'rogue' : 'rogue'; // TODO: per-class art
  // T1/T2 have no branch; T3/T4 use the chosen branch (A/B/C/D/S)
  const suffix = (tier >= 3 && branch) ? `-${branch}` : '';
  return `./assets/effects/${fxClass}_T${tier}${suffix}.png`;
}

function _showIdleFx(idx) {
  const stage = document.getElementById('idle-stage');
  if (!stage) return;
  const wrap = stage.querySelector(`.idle-mob[data-idx="${idx}"] .idle-mob-sprite`);
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = 'idle-fx';
  el.style.backgroundImage = `url('${getAttackFxUrl()}')`;
  wrap.parentElement.appendChild(el);
  setTimeout(() => el.remove(), 400);
}

// find an equipped offensive skill that's off cooldown (returns {id, cd} or null)
function _idleReadySkill() {
  const equipped = G.equippedSkills || G.unlockedSkills || [];
  if (!equipped.length) return null;
  const now = performance.now();
  // gather skill defs (for cooldown) from the equipped list
  const allSkills = (typeof _getSkills === 'function') ? _getSkills() : [];
  for (const sid of equipped) {
    if (!_IDLE_SKILL_DMG[sid]) continue;        // only offensive skills
    if ((_idleSkillReady[sid] || 0) > now) continue; // still on cooldown
    const def = allSkills.find(s => s.id === sid);
    return { id: sid, cd: def ? def.cd : 3 };
  }
  return null;
}

// is the IDLE panel actually visible right now? (works for both normal-flow
// and position:fixed — the mobile IDLE tab pins the panel as a fixed overlay,
// where offsetParent is always null, so we test rendered size instead)
function _idlePanelVisible() {
  const panel = document.getElementById('idle-panel');
  if (!panel) return false;
  return panel.offsetWidth > 0 && panel.offsetHeight > 0;
}

// ---------- combat tick ----------
function _idleAttackTick() {
  // pause while the panel isn't on screen (Hub, hidden arena, no game)
  if (!_idlePanelVisible()) return;

  // hero dead → wait for respawn
  if (_idleDead) {
    if (performance.now() >= _idleRespawnAt) {
      _idleDead = false;
      _idlePlayerHp = _idlePlayerMax = _idlePlayerMaxHp();
      _renderIdleStage();
    }
    return;
  }

  if (!_idleMobs.length) { _spawnIdleWave(); return; }
  let idx = _idleMobs.findIndex(m => !m.dead);
  if (idx === -1) { _spawnIdleWave(); return; }
  _idleTargetIdx = idx;
  const mob = _idleMobs[idx];

  // hero base attack
  const eqBonus = (typeof getEquippedStatBonus === 'function') ? getEquippedStatBonus() : { atk:0, crit:0 };
  const cls = (typeof CLASSES !== 'undefined') ? CLASSES.find(c => c.id === G.classId) : null;
  let atk = (G.baseAtk || 10) + (eqBonus.atk || 0) + Math.floor(Math.random() * (G.level || 1)) + 1;
  const critChance = .05 + (cls && cls.bonuses && cls.bonuses.critBonus ? cls.bonuses.critBonus : 0)
                   + (eqBonus.crit || 0) / 100 + (G.critBonusFromTree || 0);
  let isCrit = Math.random() < critChance;

  // skill auto-cast: if an equipped damage skill is off cooldown, use it
  const skill = _idleReadySkill();
  let hits = 1, label = '';
  if (skill) {
    const def = _IDLE_SKILL_DMG[skill.id];
    atk = Math.floor(atk * def.mult);
    hits = def.hits;
    label = def.label;
    // skill crit bonus (e.g. quick_stab +20%)
    if (skill.id === 'quick_stab' && Math.random() < 0.2) isCrit = true;
    // cooldown in seconds = skill.cd turns × current attack interval
    const cdMs = (skill.cd || 3) * getAttackInterval();
    _idleSkillReady[skill.id] = performance.now() + cdMs;
  }
  if (isCrit) atk = Math.floor(atk * 2);

  // hero attack animation
  const heroSpr = document.getElementById('idle-hero-sprite');
  if (heroSpr) { heroSpr.classList.add('atk'); setTimeout(() => heroSpr.classList.remove('atk'), 200); }

  const totalDmg = atk * hits;
  mob.hp -= totalDmg;
  _updateIdleMobHp(idx);
  _showIdleFx(idx);
  const dmgText = (label ? label + ' ' : '') + (hits > 1 ? `${atk}×${hits}` : `${totalDmg}`);
  _floatAboveIdleMob(idx, `${isCrit ? '💥' : ''}${dmgText}`, 'idle-dmg-float' + (isCrit ? ' crit' : ''));

  if (mob.hp <= 0) {
    mob.dead = true;
    _idleMobDie(idx, mob);
    return;
  }

  // surviving mobs strike back at the hero
  _idleMobsAttackHero();
}

function _idleMobsAttackHero() {
  const eq = (typeof getEquippedStatBonus === 'function') ? getEquippedStatBonus() : { def:0 };
  const def = (G.baseDef || 0) + (eq.def || 0);
  let dmg = 0;
  _idleMobs.forEach(m => { if (!m.dead) dmg += Math.max(1, m.atk - Math.floor(def * 0.5)); });
  if (dmg <= 0) return;
  _idlePlayerHp -= dmg;
  if (_idlePlayerHp <= 0) {
    _idlePlayerHp = 0;
    _idleHeroDie();
  } else {
    _updateIdleHeroHp();
  }
}

function _idleHeroDie() {
  _idleDead = true;
  _idleRespawnAt = performance.now() + IDLE_RESPAWN_MS;
  _renderIdleStage();
}

function _idleMobDie(idx, mob) {
  // special encounters (boss/raider) grant their own big bounty + combo tick
  const handledSpecial = (typeof idleOnMobKilled === 'function') ? idleOnMobKilled(mob) : false;

  const full = getMonsterStats(mob.zone, mob.tier, false);
  const killExpBase = G.gameMode === 'fullrpg' ? 0.5 : 0.03;
  let expGain = Math.floor(full.maxHp * killExpBase * 3 * IDLE_REWARD_MULT);
  const expBoostMult = (typeof getExpBoostMult === 'function') ? getExpBoostMult() : 1;
  const comboMult = (typeof idleComboExpMult === 'function') ? idleComboExpMult() : 1;
  // IDLE-tree adds idleExpBonus on top of the general tree EXP bonus
  expGain = Math.max(1, Math.floor(expGain * expBoostMult * comboMult * (1 + (G.expBonusFromTree || 0) + (G.idleExpBonus || 0))));
  if (mob.special) expGain = Math.floor(expGain * 3);  // bonus EXP for special kills

  let goldGain = Math.max(1, Math.floor(full.atk * 1.2 * IDLE_REWARD_MULT)); // IDLE = ฟรี/อัตโนมัติ ทองต้องน้อยกว่าสู้เอง
  const clsB = (typeof CLASSES !== 'undefined') ? CLASSES.find(c => c.id === G.classId) : null;
  if (clsB && clsB.bonuses && clsB.bonuses.goldMult) goldGain = Math.floor(goldGain * clsB.bonuses.goldMult);
  const idleGoldMult = 1 + (G.goldBonusFromTree || 0) + (G.idleGoldBonus || 0);
  goldGain = Math.floor(goldGain * idleGoldMult);

  G.gold += goldGain;
  // IDLE kills are tracked separately — they do NOT count toward
  // achievements / evolution quests (those are for manual zone fights only).
  G.idleKills = (G.idleKills || 0) + 1;
  _idleSessionKills++;

  // ── Zone Progress: IDLE farming can ALSO advance/unlock zones ──
  // The minimap unlocks the next zone once the current one is fully cleared.
  // Previously only manual fights advanced zoneProgress, so a player who
  // farms via IDLE would stay stuck at 0/6 and never unlock the map.
  // Advance only when the killed mob's tier matches the next-needed tier
  // in the CURRENT zone (same rule as manual combat).
  if (!mob.special && mob.zone === (G.currentZone || 1)) {
    if (!G.zoneProgress) G.zoneProgress = {};
    const zoneMonsters = (ZONES.find(z => z.id === mob.zone) || {}).monsters || [];
    const cur = G.zoneProgress[mob.zone] || 0;
    if (mob.tier === cur + 1 && cur < zoneMonsters.length) {
      G.zoneProgress[mob.zone] = cur + 1;
      const np = G.zoneProgress[mob.zone];
      if (np >= zoneMonsters.length) {
        const nz = ZONES.find(z => z.id === mob.zone + 1);
        if (typeof logBattle === 'function')
          logBattle(`<span class="log-exp" style="color:#44ff88">🗺️ ฟาร์มผ่านด่าน ${(ZONES.find(z=>z.id===mob.zone)||{}).name}!${nz ? ` ปลดล็อค ${nz.emoji} ${nz.name}` : ' 🏆 ครบทุกด่าน!'}</span>`);
      }
      if (typeof renderZoneTabs === 'function') renderZoneTabs();
      saveGame();
    }
  }
  if (typeof giveExp === 'function') giveExp(expGain);
  if (typeof checkAchievements === 'function') checkAchievements('idle');
  if (typeof checkIdleMilestone === 'function') checkIdleMilestone();

  // track for per-minute rate
  _idleRewardLog.push({ t: performance.now(), exp: expGain, gold: goldGain });

  _floatAboveIdleMob(idx, `+${expGain} EXP · 💰${goldGain}`, 'idle-xp-float');

  // item drop (lower rate than zone monster) — floats above head
  const dropBonus = clsB && clsB.bonuses && clsB.bonuses.dropBonus ? clsB.bonuses.dropBonus : 0;
  // IDLE ดรอปน้อยกว่าสู้เอง — ฟาร์มฟรีต้องไม่ล้นกระเป๋า (cap 18%)
  const baseRate = 0.04 + ((mob.zone || 1) - 1) * 0.01;
  let dropRate = Math.min(0.18, baseRate + dropBonus + (G.dropBonusFromTree || 0));
  if (mob.special) dropRate = 1;   // special kills always drop loot
  if (Math.random() < dropRate) {
    const dropped = _idleDropItem(mob.zone, mob.special === 'boss' ? 6 : mob.tier);
    if (dropped) {
      const col = (RARITIES[dropped.rarity] && RARITIES[dropped.rarity].color) || '#aaa';
      _floatAboveIdleMob(idx, `<span style="color:${col}">${dropped.icon||'⚔'} ${dropped.name}</span>`, 'idle-drop-float');
    }
  }
  // crafting materials from IDLE farming (lower rate than manual)
  if (typeof ZONE_MATERIALS !== 'undefined' && (mob.special || Math.random() < 0.20)) {
    const pool = ZONE_MATERIALS[Math.min(6, Math.max(1, mob.zone || 1))] || [];
    if (pool.length) {
      const matId = pool[Math.floor(Math.random() * pool.length)];
      if (!G.materials) G.materials = {};
      G.materials[matId] = (G.materials[matId] || 0) + 1;
      const m = MATERIALS[matId];
      if (m) _floatAboveIdleMob(idx, `${m.icon} ${m.name}`, 'idle-drop-float');
    }
  }

  // play the death animation on the existing sprite, then re-render so the
  // floating popups stay visible during the fade-out.
  const stage = document.getElementById('idle-stage');
  const wrap = stage && stage.querySelector(`.idle-mob[data-idx="${idx}"]`);
  if (wrap) wrap.classList.add('dead');
  if (typeof updateTopBar === 'function') updateTopBar();

  if (_idleMobs.every(m => m.dead)) {
    setTimeout(() => { if (_idleLoopTimer) _spawnIdleWave(); }, 900);
  }
}

// drop an item into inventory (no log spam); returns the item or null
function _idleDropItem(zone, tier) {
  if (G.inventory && G.inventory.length >= 50) return null;
  const rarity = (typeof _dropRarityForZone === 'function')
    ? _dropRarityForZone(zone, false, tier)
    : 'common';
  const slots = ['weapon','helmet','armor','gloves','pants','boots'];
  const slot  = slots[Math.floor(Math.random() * slots.length)];
  let effRarity = rarity;
  let pool = (ALL_ITEMS_BY_SLOT[slot] || []).filter(i => i.rarity === effRarity);
  let ri = (typeof _RARITY_ORDER !== 'undefined') ? _RARITY_ORDER.indexOf(rarity) : 0;
  // respect the zone rarity floor (no trash drops in late zones), then below it only if forced
  const floorIdx = (typeof _ZONE_RARITY_FLOOR !== 'undefined' && typeof _RARITY_ORDER !== 'undefined')
    ? _RARITY_ORDER.indexOf(_ZONE_RARITY_FLOOR[Math.min(6, Math.max(1, zone))] || 'common') : 0;
  while (!pool.length && ri > floorIdx) {
    ri--;
    effRarity = _RARITY_ORDER[ri];
    pool = (ALL_ITEMS_BY_SLOT[slot] || []).filter(i => i.rarity === effRarity);
  }
  while (!pool.length && ri > 0) {
    ri--;
    effRarity = _RARITY_ORDER[ri];
    pool = (ALL_ITEMS_BY_SLOT[slot] || []).filter(i => i.rarity === effRarity);
  }
  if (!pool.length) return null;
  const base = pool[Math.floor(Math.random() * pool.length)];
  const item = { ...base, uid: Date.now() + Math.random() };
  if (!G.inventory) G.inventory = [];
  G.inventory.push(item);
  if (['rare','epic','legend','ancient'].includes(effRarity)) G.gotRareWeapon = true;
  if (effRarity === 'legend' || effRarity === 'ancient') G.gotLegendWeapon = true;
  if (typeof renderInventory === 'function') renderInventory();
  return item;
}

// ---------- lifecycle ----------
function startIdleFarm() {
  if (_idleLoopTimer) { _renderIdleSkillBar(); _updateIdleHeader(); return; }
  if (!G.classId) return; // not in a game yet
  _idlePlayerHp = _idlePlayerMax = _idlePlayerMaxHp();
  _idleDead = false;
  _idleRewardLog = [];
  _idleStartTime = performance.now();
  _spawnIdleWave();
  let lastAttack = 0;
  _idleLoopTimer = setInterval(() => {
    const now = performance.now();
    if (now - lastAttack >= getAttackInterval()) {
      lastAttack = now;
      _idleAttackTick();
    }
    _updateIdleHeader(); // refresh per-minute rate continuously
  }, 150);
}

function stopIdleFarm() {
  if (_idleLoopTimer) { clearInterval(_idleLoopTimer); _idleLoopTimer = null; }
}

// refresh the spawn pool + hero max HP on zone change / clearing a monster
function refreshIdleFarm() {
  if (!_idleLoopTimer) return;
  _idlePlayerMax = _idlePlayerMaxHp();
  if (!_idleDead) _idlePlayerHp = Math.min(_idlePlayerHp || _idlePlayerMax, _idlePlayerMax);
  _spawnIdleWave();
}
