// ============================================================
// WORLD BOSS — เรดสะสมดาเมจประจำสัปดาห์
// ตีได้ไม่จำกัดครั้ง · ดาเมจสะสมต่อสัปดาห์ · รับรางวัลตามขั้น
// ============================================================

let _wbActive = false;
let _wbLoop   = null;
let _wbHp     = 0;          // hero HP this attempt
let _wbMaxHp  = 0;
let _wbBossHp = 0;          // boss HP THIS attempt (visual; resets per attempt)
let _wbBossMax= 0;
let _wbRunDmg = 0;          // damage dealt this attempt
let _wbSkillCd= {};
let _wbBuffs  = {};

function _wbWeekKey() {
  const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return `wbk_${week}`;
}
function _wbCurrentBoss() {
  const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return WORLD_BOSSES[week % WORLD_BOSSES.length];
}
function _wbTotalDamage() {
  const k = _wbWeekKey();
  return (G.worldBossDamage && G.worldBossDamage[k]) || 0;
}
function _wbAddDamage(d) {
  if (!G.worldBossDamage) G.worldBossDamage = {};
  const k = _wbWeekKey();
  // keep only the current week (drop stale weeks → auto weekly reset)
  G.worldBossDamage = { [k]: (G.worldBossDamage[k] || 0) + d };
}
function _wbClaimedTiers() {
  if (!G.worldBossClaimed) G.worldBossClaimed = {};
  const k = _wbWeekKey();
  if (!G.worldBossClaimed[k]) G.worldBossClaimed = { [k]: [] }; // reset weekly
  return G.worldBossClaimed[k];
}

// time until weekly reset
function _wbResetIn() {
  const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const next = (week + 1) * 7 * 24 * 60 * 60 * 1000;
  const diff = next - Date.now();
  const d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000);
  return `${d}ว ${h}ชม`;
}

// ---------- entry / overlay ----------
function openWorldBoss() {
  let ov = document.getElementById('wb-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'wb-overlay';
    ov.style.cssText = 'display:none;position:fixed;inset:0;z-index:810;'
      + 'background:radial-gradient(circle at 50% 30%,#241018,#05000a 70%);'
      + 'align-items:center;justify-content:center;flex-direction:column';
    ov.innerHTML = `<div id="wb-stage" class="infinity-stage"></div>`;
    document.body.appendChild(ov);
  }
  ov.style.display = 'flex';
  ov.classList.add('active');
  _renderWbIntro();
}
function closeWorldBoss() {
  _wbStopLoop();
  const ov = document.getElementById('wb-overlay');
  if (ov) { ov.classList.remove('active'); ov.style.display = 'none'; }
}

function _renderWbIntro() {
  const stage = document.getElementById('wb-stage');
  if (!stage) return;
  const boss = _wbCurrentBoss();
  const total = _wbTotalDamage();
  const claimed = _wbClaimedTiers();

  const tiers = WORLD_BOSS_TIERS.map((t, i) => {
    const reached = total >= t.dmg;
    const isClaimed = claimed.includes(i);
    const canClaim = reached && !isClaimed;
    const rw = [];
    if (t.reward.gold)   rw.push(`💰${t.reward.gold.toLocaleString()}`);
    if (t.reward.stones) rw.push(`🔨${t.reward.stones}`);
    if (t.reward.cores)  rw.push(`💠${t.reward.cores}`);
    if (t.reward.keys)   rw.push(`🗝️${t.reward.keys}`);
    if (t.reward.card)   rw.push(`🃏การ์ด`);
    return `<div style="display:flex;align-items:center;gap:.5rem;padding:.35rem .5rem;border-radius:8px;margin-bottom:.3rem;
      border:1px solid ${canClaim?'#ffd34d':reached?'#3a6a3a':'#2a2a3a'};background:${isClaimed?'rgba(40,80,40,.25)':'rgba(255,255,255,.03)'}">
      <div style="flex:1;min-width:0">
        <div style="font-size:.76rem;color:${reached?'#cce':'#778'};font-weight:700">${t.label} · ${t.dmg.toLocaleString()} dmg</div>
        <div style="font-size:.68rem;color:#9aa">${rw.join(' · ')}</div>
      </div>
      ${isClaimed ? '<span style="color:#6c6;font-size:.7rem">✓ รับแล้ว</span>'
        : canClaim ? `<button onclick="wbClaimTier(${i})" style="background:linear-gradient(90deg,#7a5a10,#cca030);border:none;color:#fff;font-weight:700;padding:.25rem .6rem;border-radius:7px;cursor:pointer;font-size:.72rem">รับ</button>`
        : '<span style="color:#667;font-size:.7rem">🔒</span>'}
    </div>`;
  }).join('');

  stage.innerHTML = `
    <div class="trial-intro">
      <div class="trial-title" style="color:${boss.color}">${boss.icon} ${boss.name}</div>
      <div class="trial-sub">${boss.desc}</div>
      <ul class="trial-rules">
        <li>⚔️ ตีบอสโลกได้ <b>ไม่จำกัดครั้ง</b> — ดาเมจสะสมตลอดสัปดาห์</li>
        <li>🏆 รับรางวัลตามขั้นดาเมจสะสม (ยิ่งตีเยอะ ยิ่งได้เยอะ)</li>
        <li>🔄 รีเซ็ตใน <b>${_wbResetIn()}</b> · บอสหมุนเวียนทุกสัปดาห์</li>
      </ul>
      <div style="margin:.5rem 0;font-size:.85rem;color:#ffd">ดาเมจสะสมของคุณ: <b>${total.toLocaleString()}</b></div>
      <div style="text-align:left;margin:.3rem 0 .6rem">${tiers}</div>
      <button class="btn-trial-start" onclick="startWorldBoss()">⚔️ บุกตีบอสโลก</button>
      <button class="btn-trial-cancel" onclick="closeWorldBoss()">ออก</button>
    </div>`;
}

function wbClaimTier(i) {
  const t = WORLD_BOSS_TIERS[i];
  if (!t || _wbTotalDamage() < t.dmg) return;
  const claimed = _wbClaimedTiers();
  if (claimed.includes(i)) return;
  claimed.push(i);
  const r = t.reward;
  if (r.gold) G.gold = (G.gold || 0) + r.gold;
  if (!G.materials) G.materials = {};
  if (r.stones) G.materials.enhance_stone = (G.materials.enhance_stone || 0) + r.stones;
  if (r.cores)  G.materials.enhance_core  = (G.materials.enhance_core  || 0) + r.cores;
  if (r.keys)   G.materials.dungeon_key   = (G.materials.dungeon_key   || 0) + r.keys;
  if (r.card && typeof CARDS !== 'undefined' && typeof _grantCard === 'function') {
    // grant a random secret card as the legendary-tier bonus
    const secrets = CARDS.filter(c => c.source === 'secret');
    if (secrets.length) _grantCard(secrets[Math.floor(Math.random() * secrets.length)]);
  }
  if (typeof logBattle === 'function')
    logBattle(`<span class="log-exp" style="color:#ffd34d">🏆 รับรางวัลบอสโลกขั้น "${t.label}"!</span>`);
  if (typeof updateTopBar === 'function') updateTopBar();
  if (typeof saveGame === 'function') saveGame();
  _renderWbIntro();
}

// ---------- run ----------
function startWorldBoss() {
  _wbActive = true;
  _wbSkillCd = {}; _wbBuffs = {}; _wbRunDmg = 0;
  _wbMaxHp = _wbHp = _wbPlayerMaxHp();
  const boss = _wbCurrentBoss();
  // per-attempt visual HP bar (boss is effectively a damage sponge)
  _wbBossMax = _wbBossHp = Math.max(50000, Math.floor(boss.maxHp / 20));
  _wbSpawn();
  let last = 0;
  _wbLoop = setInterval(() => {
    const now = performance.now();
    if (now - last >= _wbInterval()) { last = now; _wbTick(); }
    _wbUpdateHud();
  }, 90);
}
function _wbStopLoop() {
  if (_wbLoop) { clearInterval(_wbLoop); _wbLoop = null; }
  _wbActive = false;
}
function _wbPlayerMaxHp() {
  const eq = (typeof getEquippedStatBonus === 'function') ? getEquippedStatBonus() : { hp:0 };
  return (G.maxHp || 100) + (eq.hp || 0);
}
function _wbInterval() {
  const base = (typeof getAttackInterval === 'function') ? getAttackInterval() : 3000;
  return Math.max(420, Math.floor(base * 0.45));
}

let _wbMob = null;
function _wbSpawn() {
  const boss = _wbCurrentBoss();
  // boss attack scales with player power so it stays a threat
  const eq = (typeof getEquippedStatBonus === 'function') ? getEquippedStatBonus() : { atk:0 };
  const pAtk = (G.baseAtk || 10) + (eq.atk || 0);
  _wbMob = { name: boss.name, icon: boss.icon, color: boss.color, atk: Math.max(20, Math.floor(pAtk * 0.9)) };
  _wbRender();
}

function _wbTick() {
  if (!_wbActive) return;
  const eqBonus = (typeof getEquippedStatBonus === 'function') ? getEquippedStatBonus() : { atk:0, crit:0 };
  const cls = (typeof CLASSES !== 'undefined') ? CLASSES.find(c => c.id === G.classId) : null;
  let atk = (G.baseAtk || 10) + (eqBonus.atk || 0) + Math.floor(Math.random() * (G.level || 1)) + 1;
  const critChance = .05 + (cls && cls.bonuses && cls.bonuses.critBonus ? cls.bonuses.critBonus : 0)
                   + (eqBonus.crit || 0) / 100 + (G.critBonusFromTree || 0);
  let isCrit = Math.random() < critChance;

  let hits = 1, label = '';
  if (typeof _IDLE_SKILL_DMG !== 'undefined') {
    const skill = _wbReadySkill();
    if (skill && _IDLE_SKILL_DMG[skill.id] && !_IDLE_SKILL_DMG[skill.id].buff) {
      const def = _IDLE_SKILL_DMG[skill.id];
      atk = Math.floor(atk * def.mult); hits = def.hits; label = def.label;
      _wbSkillCd[skill.id] = performance.now() + (skill.cd || 3) * _wbInterval();
    }
  }
  if ((G.doubleStrikeChance || 0) > 0 && Math.random() < G.doubleStrikeChance) hits += 1;
  if (isCrit) atk = Math.floor(atk * 2);

  const total = atk * hits;
  _wbBossHp -= total;
  _wbRunDmg += total;
  _wbAddDamage(total);
  _wbFloat(`${isCrit ? '💥' : ''}${label ? label + ' ' : ''}${total.toLocaleString()}`, isCrit ? 'crit' : '');
  _wbFlash();

  if ((G.lifestealBonus || 0) + (G.talentLifesteal || 0) > 0) {
    const heal = Math.floor(total * ((G.lifestealBonus || 0) + (G.talentLifesteal || 0)));
    if (heal > 0) _wbHp = Math.min(_wbMaxHp, _wbHp + heal);
  }

  // boss "dies" for this attempt → instantly respawn a fresh bar (endless)
  if (_wbBossHp <= 0) { _wbBossHp = _wbBossMax; _wbFloat('💢 บอสโกรธ!', 'crit'); }

  // boss hits back
  let dmg = _wbMob.atk;
  const permDR = Math.min(0.8, (G.damageReduction || 0) + (G.talentDmgReduce || 0));
  if (permDR > 0) dmg = Math.floor(dmg * (1 - permDR));
  _wbHp -= dmg;
  if (_wbHp <= 0) {
    if (G.hasRevive && !_wbBuffs._revived) { _wbBuffs._revived = true; _wbHp = Math.floor(_wbMaxHp * 0.5); _wbFloat('🕊️ ฟื้นคืนชีพ!', 'crit'); return; }
    _wbHp = 0; _wbEnd();
  }
}

function _wbReadySkill() {
  const equipped = G.equippedSkills || [];
  if (!equipped.length) return null;
  const now = performance.now();
  const allSkills = (typeof _getSkills === 'function') ? _getSkills() : [];
  for (const sid of equipped) {
    if (!_IDLE_SKILL_DMG[sid] || _IDLE_SKILL_DMG[sid].buff) continue;
    if ((_wbSkillCd[sid] || 0) > now) continue;
    const def = allSkills.find(s => s.id === sid);
    return { id: sid, cd: def ? def.cd : 3 };
  }
  return null;
}

function _wbEnd() {
  _wbStopLoop();
  if (typeof saveGame === 'function') saveGame();
  const stage = document.getElementById('wb-stage');
  if (!stage) return;
  stage.innerHTML = `
    <div class="trial-result">
      <div class="trial-result-dead">💀 จบการบุก</div>
      <div class="trial-result-stats">ดาเมจรอบนี้: <b>${_wbRunDmg.toLocaleString()}</b></div>
      <div class="trial-result-stats">ดาเมจสะสมสัปดาห์นี้: <b style="color:#ffd">${_wbTotalDamage().toLocaleString()}</b></div>
      <div class="trial-result-hint">รับรางวัลตามขั้นที่ถึงได้เลย แล้วบุกต่อเพื่อสะสมเพิ่ม!</div>
      <button class="btn-trial-start" onclick="_renderWbIntro()">🏆 ดูรางวัล / บุกต่อ</button>
      <button class="btn-trial-cancel" onclick="closeWorldBoss()">ออก</button>
    </div>`;
}

// ---------- render ----------
function _wbRender() {
  const stage = document.getElementById('wb-stage');
  if (!stage) return;
  const hpPct = _wbMaxHp > 0 ? Math.max(0, (_wbHp / _wbMaxHp) * 100) : 100;
  const bossPct = _wbBossMax > 0 ? Math.max(0, (_wbBossHp / _wbBossMax) * 100) : 100;
  const playerSprite = (typeof getPlayerSpriteWithCosmetic !== 'undefined')
    ? getPlayerSpriteWithCosmetic(G.classId || 'warrior', G.classTier || 1, G.cosmeticTier || 1)
    : '🧍';
  stage.innerHTML = `
    <div class="trial-hud" id="wb-hud"></div>
    <div class="trial-arena">
      <div class="idle-mobs-wrap">
        <div class="idle-mob wb-boss" id="wb-boss">
          <div class="idle-mob-sprite" style="font-size:4rem">${_wbMob.icon}</div>
          <div class="idle-mob-name" style="color:${_wbMob.color}">${_wbMob.name}</div>
          <div class="idle-mob-hp"><div class="idle-mob-hp-fill" id="wb-boss-hp" style="width:${bossPct}%"></div></div>
        </div>
      </div>
      <div class="idle-vs">⚔</div>
      <div class="idle-hero">
        <div class="idle-hero-sprite" id="wb-hero">${playerSprite}</div>
        <div class="idle-mob-name">คุณ</div>
        <div class="idle-mob-hp"><div class="idle-mob-hp-fill idle-hero-hp" id="wb-hero-hp" style="width:${hpPct}%"></div></div>
      </div>
    </div>
    <button class="btn-trial-cancel" style="margin-top:.6rem" onclick="_wbEnd()">🚪 จบการบุก (เก็บดาเมจ)</button>`;
  _wbUpdateHud();
}
function _wbUpdateHud() {
  const hud = document.getElementById('wb-hud');
  if (hud) hud.innerHTML = `<span>💥 รอบนี้ ${_wbRunDmg.toLocaleString()}</span><span>📊 รวม ${_wbTotalDamage().toLocaleString()}</span><span>❤️ ${Math.max(0,Math.ceil(_wbHp))}/${_wbMaxHp}</span>`;
  const bh = document.getElementById('wb-boss-hp'); if (bh) bh.style.width = `${_wbBossMax>0?Math.max(0,(_wbBossHp/_wbBossMax)*100):100}%`;
  const hh = document.getElementById('wb-hero-hp'); if (hh) hh.style.width = `${_wbMaxHp>0?Math.max(0,(_wbHp/_wbMaxHp)*100):100}%`;
}
function _wbFlash() {
  const spr = document.querySelector('#wb-boss .idle-mob-sprite');
  if (spr) { spr.classList.remove('hit'); void spr.offsetWidth; spr.classList.add('hit'); }
  const hero = document.getElementById('wb-hero');
  if (hero) { hero.classList.add('atk'); setTimeout(() => hero.classList.remove('atk'), 160); }
}
function _wbFloat(html, cls) {
  const wrap = document.getElementById('wb-boss');
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = 'idle-dmg-float' + (cls ? ' ' + cls : '');
  el.innerHTML = html;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 1300);
}

// battle-screen entry button refresh
function refreshWorldBossButton() {
  const btn = document.getElementById('btn-open-worldboss');
  if (!btn) return;
  if (!G.classId) { btn.style.display = 'none'; return; }
  const boss = _wbCurrentBoss();
  btn.innerHTML = `${boss.icon} บอสโลก`;
  btn.style.display = 'inline-block';
}
