// ============================================================
// PRESTIGE — permanent upgrades bought with Prestige Points
// G.prestigeUpgrades = { id: rank } · G.prestigePoints = spendable
// ============================================================

function _presRank(id) { return (G.prestigeUpgrades && G.prestigeUpgrades[id]) || 0; }
function _presDef(id) {
  return (typeof PRESTIGE_UPGRADES !== 'undefined') ? PRESTIGE_UPGRADES.find(u => u.id === id) : null;
}

// Sum every prestige upgrade's contribution × rank.
function getPrestigeBonus() {
  const b = { atkPct:0, hpPct:0, expBonus:0, goldBonus:0, dropBonus:0, crit:0, startLevel:0 };
  if (!G.prestigeUpgrades || typeof PRESTIGE_UPGRADES === 'undefined') return b;
  PRESTIGE_UPGRADES.forEach(u => {
    const r = _presRank(u.id);
    if (!r) return;
    Object.keys(u.per).forEach(k => { b[k] = (b[k] || 0) + u.per[k] * r; });
  });
  return b;
}

// ---------- buy ----------
function canBuyPrestigeUpgrade(id) {
  const u = _presDef(id);
  if (!u) return false;
  return _presRank(id) < u.maxRank && (G.prestigePoints || 0) >= u.cost;
}

function buyPrestigeUpgrade(id) {
  if (!canBuyPrestigeUpgrade(id)) return;
  const u = _presDef(id);
  if (!G.prestigeUpgrades) G.prestigeUpgrades = {};
  G.prestigePoints -= u.cost;
  G.prestigeUpgrades[id] = _presRank(id) + 1;
  // re-derive everything (exp/gold/drop/crit fold via recalcTreeBonuses; atk/hp via base)
  if (typeof applyPrestigeBaseStats === 'function') applyPrestigeBaseStats();
  if (typeof recalcTreeBonuses === 'function') recalcTreeBonuses();
  if (typeof updateTopBar === 'function') updateTopBar();
  if (typeof updateCharPanel === 'function') updateCharPanel();
  if (typeof saveGame === 'function') saveGame();
  _renderPrestigePanel();
}

// atkPct/hpPct scale the clean per-level base. Recompute base atk/maxHp from
// the current level so the % never compounds, regardless of how many ranks the
// player buys. (Per-level growth mirrors giveExp: +2 ATK, +10 HP per level.)
function applyPrestigeBaseStats() {
  const b = getPrestigeBonus();
  const lvl = G.level || 1;
  const baseAtk0 = 10 + (lvl - 1) * 2;
  const baseHp0  = 100 + (lvl - 1) * 10;
  G.baseAtk = Math.floor(baseAtk0 * (1 + (b.atkPct || 0)));
  const newMaxHp = Math.floor(baseHp0 * (1 + (b.hpPct || 0)));
  // keep current HP ratio when max changes
  const ratio = G.maxHp > 0 ? (G.hp / G.maxHp) : 1;
  G.maxHp = newMaxHp;
  G.hp = Math.min(G.maxHp, Math.max(1, Math.round(G.maxHp * ratio)));
}

// ---------- the prestige reset (reworked) ----------
function doPrestige() {
  if ((G.level || 1) < PRESTIGE_MIN_LEVEL) return;
  const gain = prestigePointsForReset();
  if (!confirm(`✨ PRESTIGE!\n\nรีเซ็ตเลเวล/ของ/สกิลพอยต์ แต่เก็บคลาส, การ์ด, Talent, อัปเกรด Prestige ไว้\nจะได้รับ ${gain} Prestige Point เอาไปซื้อโบนัสถาวร\n\nยืนยัน?`)) return;

  const cls = (typeof CLASSES !== 'undefined') ? CLASSES.find(c => c.id === G.classId) : null;
  G.prestigeCount = (G.prestigeCount || 0) + 1;
  G.prestigePoints = (G.prestigePoints || 0) + gain;
  G.prestigeBadges.push({ count:G.prestigeCount, class:G.classId, icon:cls ? cls.icon : '⭐' });

  // permanent prestige bonuses
  const pb = getPrestigeBonus();
  const startLv = Math.max(1, 1 + (pb.startLevel || 0));

  // reset to fresh run (keep class tier/branch, cards, talents, prestige, achievements)
  G.level = startLv; G.exp = 0;
  // base stats grow with level then get scaled by prestige % multipliers
  const baseAtk0 = 10 + (startLv - 1) * 2;
  const baseDef0 = 5  + (startLv - 1) * 1;
  const baseHp0  = 100 + (startLv - 1) * 10;
  G.baseAtk = Math.floor(baseAtk0 * (1 + (pb.atkPct || 0)));
  G.baseDef = baseDef0;
  G.maxHp   = Math.floor(baseHp0  * (1 + (pb.hpPct  || 0)));
  G.hp = G.maxHp;
  G._presBaseAtk = baseAtk0; G._presBaseHp = baseHp0;
  G.skillPoints = 0;
  G.inventory = []; G.equippedWeaponId = null;
  G.equippedSlots = { weapon:null, helmet:null, armor:null, gloves:null, pants:null, boots:null };
  if (G.chests) G.chests = { common:0, uncommon:0, rare:0, boss:0 };
  G.defeatedMonsters = {}; G.zoneProgress = {}; G.currentZone = 1;
  G.battleInProgress = false; G.currentMonster = null;
  // reset skill tree spend so points can be re-earned this run (keeps talents/cards/prestige)
  G.skillTreeSpent = {}; G.unlockedSkills = []; G.equippedSkills = [];

  if (typeof recalcTreeBonuses === 'function') recalcTreeBonuses();
  logBattle(`<span class="log-exp">✨ PRESTIGE ${G.prestigeCount}! +${gain} Prestige Point — รอบใหม่แกร่งขึ้นด้วยโบนัสถาวร!</span>`);
  if (typeof checkAchievements === 'function') checkAchievements();
  saveGame();
  if (typeof renderAll === 'function') renderAll();
  openPrestigePanel();
}

// ---------- panel UI ----------
function openPrestigePanel() {
  let ov = document.getElementById('prestige-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'prestige-overlay';
    ov.className = 'overlay';
    ov.onclick = (e) => { if (e.target === ov) ov.classList.remove('active'); };
    document.body.appendChild(ov);
  }
  _renderPrestigePanel();
  ov.classList.add('active');
}

function _renderPrestigePanel() {
  const ov = document.getElementById('prestige-overlay');
  if (!ov) return;
  const pts = G.prestigePoints || 0;
  const list = (typeof PRESTIGE_UPGRADES !== 'undefined' ? PRESTIGE_UPGRADES : []).map(u => {
    const r = _presRank(u.id);
    const maxed = r >= u.maxRank;
    const can = canBuyPrestigeUpgrade(u.id);
    return `<div style="display:flex;align-items:center;gap:.5rem;padding:.45rem .55rem;border:1px solid ${r>0?'#c0892a':'#3a3020'};border-radius:9px;background:rgba(60,44,10,.25);margin-bottom:.35rem">
      <div style="font-size:1.4rem">${u.icon}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:.8rem;color:#ffe9b8;font-weight:700">${u.name} <span style="color:#a89878;font-weight:400">${r}/${u.maxRank}</span></div>
        <div style="font-size:.68rem;color:#b8a888">${u.desc}</div>
      </div>
      <button onclick="buyPrestigeUpgrade('${u.id}')" ${can?'':'disabled'}
        style="flex-shrink:0;padding:.3rem .55rem;border-radius:8px;border:none;font-weight:800;font-size:.72rem;cursor:${can?'pointer':'not-allowed'};
        background:${can?'linear-gradient(135deg,#7a5a10,#caa030)':'#332b1a'};color:${can?'#fff':'#776'}">${maxed?'✓ MAX':`${u.cost}⭐`}</button>
    </div>`;
  }).join('');

  const lvl = G.level || 1;
  const canPrestige = lvl >= PRESTIGE_MIN_LEVEL;
  const gain = (typeof prestigePointsForReset === 'function') ? prestigePointsForReset() : 0;
  const prestigeBtn = canPrestige
    ? `<button onclick="doPrestige()" style="width:100%;margin-top:.5rem;padding:.6rem;border-radius:9px;border:2px solid var(--legend);background:linear-gradient(135deg,#402000,#601500);color:var(--legend);font-weight:800;cursor:pointer">✨ PRESTIGE เลย (+${gain} ⭐)</button>`
    : `<div style="text-align:center;color:#9a8a66;font-size:.78rem;margin-top:.5rem">ถึงเลเวล ${PRESTIGE_MIN_LEVEL} เพื่อ Prestige (ตอนนี้ LV ${lvl})</div>`;

  ov.innerHTML = `
    <div class="modal" onclick="event.stopPropagation()" style="max-width:430px;width:95%;text-align:left;max-height:86vh;overflow-y:auto">
      <div style="text-align:center;margin-bottom:.3rem">
        <div style="font-size:1.2rem;font-weight:800;color:var(--legend)">✨ Prestige</div>
        <div style="font-size:.82rem;color:#bbb">รอบที่ <b style="color:#ffd966">${G.prestigeCount||0}</b> · แต้ม: <b style="color:#ffd966">${pts} ⭐</b></div>
      </div>
      <div style="font-size:.7rem;color:#9a8a66;margin:.3rem 0 .5rem;line-height:1.5">รีเซ็ตเลเวล/ของ/สกิลทรี แต่เก็บคลาส・การ์ด・Talent・อัปเกรดนี้ไว้ถาวร — ยิ่ง prestige ยิ่งแกร่ง</div>
      ${list}
      ${prestigeBtn}
      <button class="btn-close-modal" onclick="document.getElementById('prestige-overlay').classList.remove('active')">ปิด</button>
    </div>`;
}
