// ============================================================
// IDLE FARMING PANEL — runs continuously, view-only.
// Separate from the manual zone-monster fight. Auto-attacks a small
// group of WEAKER random monsters drawn from the current + cleared zones,
// on the speed-stat timer. Items drop floating above the monster's head.
// ============================================================

// IDLE monsters are weaker than the real zone monsters.
const IDLE_STAT_MULT   = 0.4;   // HP/ATK scale vs real monster
const IDLE_REWARD_MULT = 0.35;  // EXP/gold vs a boss-baseline kill (same as normal)

let _idleMobs       = [];       // [{name, sprite, img, tier, zone, hp, maxHp, atk, dead}]
let _idleLoopTimer  = null;     // setInterval handle for the attack tick
let _idleTargetIdx  = 0;

// ---------- pool of monsters the IDLE panel may spawn ----------
// current zone + every already-cleared zone (zoneProgress > 0)
function _idleMonsterPool() {
  const pool = [];
  const curZone = G.currentZone || 1;
  (ZONES || []).forEach(z => {
    const cleared = (G.zoneProgress && G.zoneProgress[z.id]) || 0;
    // include a zone if it's the current one, or we've cleared at least 1 monster there
    if (z.id > curZone) return;
    const isCurrent = z.id === curZone;
    z.monsters.forEach((m, idx) => {
      // skip bosses (tier 6) — IDLE farms only the weaker non-boss mobs
      if (m.isBoss) return;
      // for current zone, only spawn mobs up to current progress+1; past zones: all
      if (isCurrent && idx > cleared) return;
      pool.push({ ...m, zone: z.id });
    });
  });
  // fallback: at least the first monster of zone 1
  if (!pool.length && ZONES[0]) pool.push({ ...ZONES[0].monsters[0], zone: 1 });
  return pool;
}

function _spawnIdleWave() {
  const pool = _idleMonsterPool();
  const count = 1 + Math.floor(Math.random() * 3); // 1-3 mobs
  _idleMobs = [];
  for (let i = 0; i < count; i++) {
    const base = pool[Math.floor(Math.random() * pool.length)];
    const full = getMonsterStats(base.zone, base.tier, false);
    const hp  = Math.max(1, Math.floor(full.maxHp * IDLE_STAT_MULT));
    const atk = Math.max(1, Math.floor(full.atk   * IDLE_STAT_MULT));
    _idleMobs.push({
      name: base.name, sprite: base.sprite, img: base.img,
      tier: base.tier, zone: base.zone,
      hp, maxHp: hp, atk, dead: false,
    });
  }
  _idleTargetIdx = 0;
  _renderIdleStage();
}

// ---------- rendering ----------
function _renderIdleStage() {
  const stage = document.getElementById('idle-stage');
  if (!stage) return;
  stage.innerHTML = '';
  _idleMobs.forEach((m, idx) => {
    const wrap = document.createElement('div');
    wrap.className = 'idle-mob' + (m.dead ? ' dead' : '');
    wrap.dataset.idx = idx;
    const pct = Math.max(0, (m.hp / m.maxHp) * 100);
    const sprite = m.img
      ? `<img src="assets/sprites/${m.img}.png" onerror="this.outerHTML='${(m.sprite||'👾').replace(/'/g,'')}'">`
      : (m.sprite || '👾');
    wrap.innerHTML = `
      <div class="idle-mob-sprite">${sprite}</div>
      <div class="idle-mob-name">${m.name}</div>
      <div class="idle-mob-hp"><div class="idle-mob-hp-fill" style="width:${pct}%"></div></div>`;
    stage.appendChild(wrap);
  });

  const spdEl = document.getElementById('idle-panel-spd');
  if (spdEl) spdEl.textContent = `⚡ ${(getAttackInterval()/1000).toFixed(1)} วิ/ตี`;
}

function _updateIdleMobHp(idx) {
  const stage = document.getElementById('idle-stage');
  if (!stage) return;
  const wrap = stage.querySelector(`.idle-mob[data-idx="${idx}"]`);
  if (!wrap) return;
  const m = _idleMobs[idx];
  const fill = wrap.querySelector('.idle-mob-hp-fill');
  if (fill) fill.style.width = `${Math.max(0, (m.hp / m.maxHp) * 100)}%`;
  wrap.querySelector('.idle-mob-sprite')?.classList.remove('hit');
  // force reflow to retrigger the hit flash
  void wrap.offsetWidth;
  wrap.querySelector('.idle-mob-sprite')?.classList.add('hit');
  setTimeout(() => wrap.querySelector('.idle-mob-sprite')?.classList.remove('hit'), 160);
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

// ---------- player's IDLE attack (auto, view-only) ----------
function _idleAttackTick() {
  // pause while the panel isn't on screen (Hub, hidden arena, no game)
  const panel = document.getElementById('idle-panel');
  if (!panel || panel.offsetParent === null) return;
  if (!_idleMobs.length) { _spawnIdleWave(); return; }
  // find first alive target
  let idx = _idleMobs.findIndex(m => !m.dead);
  if (idx === -1) { _spawnIdleWave(); return; }
  _idleTargetIdx = idx;
  const mob = _idleMobs[idx];

  // damage = player's effective attack (same formula as manual, simplified)
  const eqBonus = (typeof getEquippedStatBonus === 'function') ? getEquippedStatBonus() : { atk:0, crit:0 };
  const cls = (typeof CLASSES !== 'undefined') ? CLASSES.find(c => c.id === G.classId) : null;
  let atk = (G.baseAtk || 10) + (eqBonus.atk || 0) + Math.floor(Math.random() * (G.level || 1)) + 1;
  const critChance = .05 + (cls && cls.bonuses && cls.bonuses.critBonus ? cls.bonuses.critBonus : 0)
                   + (eqBonus.crit || 0) / 100 + (G.critBonusFromTree || 0);
  const isCrit = Math.random() < critChance;
  if (isCrit) atk = Math.floor(atk * 2);

  mob.hp -= atk;
  _updateIdleMobHp(idx);

  if (mob.hp <= 0) {
    mob.dead = true;
    _idleMobDie(idx, mob);
  }
}

function _idleMobDie(idx, mob) {
  // reward — boss baseline × IDLE_REWARD_MULT (lower than zone monsters/boss)
  const full = getMonsterStats(mob.zone, mob.tier, false);
  const killExpBase = G.gameMode === 'fullrpg' ? 0.5 : 0.03;
  let expGain = Math.floor(full.maxHp * killExpBase * 3 * IDLE_REWARD_MULT);
  const expBoostMult = (typeof getExpBoostMult === 'function') ? getExpBoostMult() : 1;
  expGain = Math.max(1, Math.floor(expGain * expBoostMult * (1 + (G.expBonusFromTree || 0))));

  let goldGain = Math.max(1, Math.floor(full.atk * 3 * IDLE_REWARD_MULT));
  const clsB = (typeof CLASSES !== 'undefined') ? CLASSES.find(c => c.id === G.classId) : null;
  if (clsB && clsB.bonuses && clsB.bonuses.goldMult) goldGain = Math.floor(goldGain * clsB.bonuses.goldMult);
  if ((G.goldBonusFromTree || 0) > 0) goldGain = Math.floor(goldGain * (1 + G.goldBonusFromTree));

  G.gold += goldGain;
  G.totalKills = (G.totalKills || 0) + 1;
  if (typeof giveExp === 'function') giveExp(expGain);

  // floating EXP/gold above head
  _floatAboveIdleMob(idx, `+${expGain} EXP · 💰${goldGain}`, 'idle-xp-float');

  // item drop (lower rate than zone monster) — floats above head
  const dropBonus = clsB && clsB.bonuses && clsB.bonuses.dropBonus ? clsB.bonuses.dropBonus : 0;
  const baseRate = 0.06 + ((mob.zone || 1) - 1) * 0.015; // slightly below zone-monster rate
  const dropRate = baseRate + dropBonus + (G.dropBonusFromTree || 0);
  if (Math.random() < dropRate) {
    const dropped = _idleDropItem(mob.zone, mob.tier);
    if (dropped) {
      const col = (RARITIES[dropped.rarity] && RARITIES[dropped.rarity].color) || '#aaa';
      _floatAboveIdleMob(idx, `<span style="color:${col}">${dropped.icon||'⚔'} ${dropped.name}</span>`, 'idle-drop-float');
    }
  }

  _renderIdleStage();
  if (typeof updateTopBar === 'function') updateTopBar();

  // respawn the wave shortly after all mobs are dead
  if (_idleMobs.every(m => m.dead)) {
    setTimeout(() => { if (_idleLoopTimer) _spawnIdleWave(); }, 700);
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
  if (_idleLoopTimer) return;
  if (!G.classId) return; // not in a game yet
  _spawnIdleWave();
  // poll on a short tick; attack fires every getAttackInterval()
  let lastAttack = 0;
  _idleLoopTimer = setInterval(() => {
    const now = performance.now();
    if (now - lastAttack >= getAttackInterval()) {
      lastAttack = now;
      _idleAttackTick();
    }
  }, 150);
}

function stopIdleFarm() {
  if (_idleLoopTimer) { clearInterval(_idleLoopTimer); _idleLoopTimer = null; }
}

// refresh the spawn pool when the player changes zone or clears a monster
function refreshIdleFarm() {
  if (!_idleLoopTimer) return;
  _spawnIdleWave();
}
