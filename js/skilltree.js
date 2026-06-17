// ============================================================
// SKILL TREE SYSTEM
// ============================================================

// ── skill points — TWO separate pools, each earns +1 every 5 levels ──
//   • main pool  → nodes in row 0-4 (class skill tree)
//   • IDLE pool  → nodes in row 5+ (IDLE system)
// ดังนั้น level 5 = ได้ทั้ง main +1 และ IDLE +1 (รวมตลอดเกม level/5 ต่อกอง)
function getSkillPointsEarned(level) {
  return Math.floor(level / 5);
}

// is this node part of the IDLE section? (row >= 5)
function _isIdleNode(node) {
  return !!node && node.row >= 5;
}

// Recompute the DERIVED skill-tree bonuses (speed/crit/exp/gold/regen/streak/
// drop) from the currently-unlocked nodes + current data values. This makes
// data-side rebalances (e.g. new speed %) apply to existing saves instead of
// being stuck at the value that was added when the node was first unlocked.
// NOTE: hp/atk/def are applied to base stats directly and are NOT recomputed
// here (that would double-count with level-ups).
function recalcTreeBonuses() {
  const tree = SKILL_TREES[G.classId] || [];
  let speed=0, crit=0, exp=0, gold=0, regen=0, streak=0, drop=0;
  let idleExp=0, idleGold=0, offCap=0, offEff=0;
  Object.keys(G.skillTreeSpent || {}).forEach(id => {
    const node = tree.find(n => n.id === id);
    if (!node || node.type !== 'stat' || !node.stat) return;
    const s = node.stat;
    if (s.speedBonus)  speed  += s.speedBonus;
    if (s.crit)        crit   += s.crit;
    if (s.expBonus)    exp    += s.expBonus;
    if (s.goldBonus)   gold   += s.goldBonus;
    if (s.regenBonus)  regen  += s.regenBonus;
    if (s.streakBonus) streak += s.streakBonus;
    if (s.dropBonus)   drop   += s.dropBonus;
    if (s.idleExpBonus)   idleExp  += s.idleExpBonus;
    if (s.idleGoldBonus)  idleGold += s.idleGoldBonus;
    if (s.offlineCapBonus)offCap   += s.offlineCapBonus;
    if (s.offlineEffBonus)offEff   += s.offlineEffBonus;
  });
  // fold in TALENT contributions (kept here so this one function owns all the
  // derived globals — combat/idle read these directly)
  const tal = (typeof getTalentDerived === 'function') ? getTalentDerived() : null;
  if (tal) {
    speed += tal.speed || 0;
    crit  += tal.crit || 0;
    exp   += tal.expBonus || 0;
    gold  += tal.goldBonus || 0;
    drop  += tal.dropBonus || 0;
  }
  G.attackSpeedBonus    = Math.min(0.9, speed);
  G.critBonusFromTree   = crit;
  G.expBonusFromTree    = exp;
  G.goldBonusFromTree   = gold;
  G.regenBonusFromTree  = regen;
  G.streakBonusFromTree = streak;
  G.dropBonusFromTree   = drop;
  // lifesteal / damage-reduction from talents (combine with secret-trait values)
  G.talentLifesteal  = tal ? (tal.lifesteal || 0) : 0;
  G.talentDmgReduce  = tal ? (tal.damageReduction || 0) : 0;
  // IDLE-tree farm/offline bonuses
  G.idleExpBonus     = idleExp;
  G.idleGoldBonus    = idleGold;
  G.offlineCapBonus  = offCap;   // extra hours
  G.offlineEffBonus  = offEff;   // extra efficiency fraction
}

function refreshSkillPoints() {
  // keep derived bonuses in sync with current data values (applies rebalances
  // to existing saves the moment the tree is touched/rendered)
  recalcTreeBonuses();
  const earned = getSkillPointsEarned(G.level);
  const tree = SKILL_TREES[G.classId] || [];
  let spentMain = 0, spentIdle = 0;
  Object.keys(G.skillTreeSpent || {}).forEach(id => {
    const node = tree.find(n => n.id === id);
    if (!node) return;                       // node from another class — ignore
    const c = Math.max(1, node.cost || 1);   // cost-aware spend
    if (_isIdleNode(node)) spentIdle += c; else spentMain += c;
  });
  // main pool also includes bonus skill points earned from Infinity Trials
  const trialBonus = G.trialSkillPoints || 0;
  G.skillTreePoints = Math.max(0, earned + trialBonus - spentMain); // main pool
  G.idleTreePoints  = Math.max(0, earned - spentIdle);              // IDLE pool
}

// ── node helpers ──

function isNodeUnlocked(nodeId) {
  return !!(G.skillTreeSpent && G.skillTreeSpent[nodeId]);
}

// how many points are available for THIS node (main vs idle pool)
function _poolForNode(node) {
  return _isIdleNode(node) ? (G.idleTreePoints || 0) : (G.skillTreePoints || 0);
}

// point cost of a node (default 1; strong nodes cost more — see data.js cost)
function nodeCost(node) {
  return Math.max(1, node && node.cost ? node.cost : 1);
}

function canUnlockNode(node) {
  if (isNodeUnlocked(node.id)) return false;
  if (_poolForNode(node) < nodeCost(node)) return false;   // need enough points
  if (node.requires && !isNodeUnlocked(node.requires)) return false;
  if (node.branch && G.classBranch && node.branch !== G.classBranch) return false;
  return true;
}

// apply a node's effects to G (no rendering, no save)
function _applyNodeUnlock(nodeId) {
  const tree = SKILL_TREES[G.classId] || [];
  const node = tree.find(n => n.id === nodeId);
  if (!node || !canUnlockNode(node)) return false;

  G.skillTreeSpent[nodeId] = true;
  // deduct the node's cost from the matching pool
  const cost = nodeCost(node);
  if (_isIdleNode(node)) G.idleTreePoints  = Math.max(0, (G.idleTreePoints  || 0) - cost);
  else                   G.skillTreePoints = Math.max(0, (G.skillTreePoints || 0) - cost);

  if (node.type === 'stat' && node.stat) {
    const s = node.stat;
    // hp/atk/def go straight into base stats (one-time)
    if (s.hp)  { G.maxHp += s.hp; G.hp = Math.min(G.hp + s.hp, G.maxHp); }
    if (s.atk) G.baseAtk += s.atk;
    if (s.def) G.baseDef += s.def;
    // derived bonuses are recomputed from all unlocked nodes (data-driven)
    recalcTreeBonuses();
    if (s.speedBonus && typeof restartAutoWithNewSpeed === 'function') restartAutoWithNewSpeed();
    logBattle(`<span class="log-exp">🌳 Skill Tree: ได้รับ ${node.name}!</span>`);
  }

  if (node.type === 'skill') {
    if (!G.unlockedSkills) G.unlockedSkills = [];
    if (!G.unlockedSkills.includes(node.skill.id)) {
      G.unlockedSkills.push(node.skill.id);
      if (!G.equippedSkills) G.equippedSkills = [];
      if (G.equippedSkills.length < 3) G.equippedSkills.push(node.skill.id);
      logBattle(`<span class="log-exp">✨ สกิลใหม่: ${node.icon||'⚡'} ${node.skill.name} — ${node.skill.desc}</span>`);
    }
  }

  const nodeTier = (node.skill?.tier) || (node.row >= 3 ? 4 : node.row + 1);
  if (typeof rpgOnSkillUnlock === 'function') rpgOnSkillUnlock(node.type, nodeTier);
  return true;
}

function unlockNode(nodeId) {
  if (!_applyNodeUnlock(nodeId)) return;
  saveGame();
  renderAll();
  renderSkillTree();
}

// ── evolution quest progress ──
function updateEvoQuestProgress() {
  if (!G.classId) return;
  const path = CLASS_EVOLUTIONS[G.classId] || [];
  path.forEach(evo => {
    if (!evo.conditions || !evo.conditions.evoQuest) return;
    const qid = evo.conditions.evoQuest;
    const quest = EVO_QUESTS[qid];
    if (!quest || G.evoQuestDone[qid]) return;
    const c = quest.conditions;
    let done = true;
    if (c.bossKills    && G.bossKills   < c.bossKills)   done = false;
    if (c.kills        && G.totalKills  < c.kills)        done = false;
    if (c.tasks        && G.totalTasks  < c.tasks)        done = false;
    if (c.epicTasks    && (G.epicTasksDone||0) < c.epicTasks) done = false;
    if (c.critCount    && (G.critCount||0) < c.critCount) done = false;
    if (c.streak       && G.streak < c.streak)            done = false;
    if (c.gold         && G.gold   < c.gold)              done = false;
    if (c.hpHealed     && (G.totalHpHealed||0) < c.hpHealed) done = false;
    if (c.hardTasks    && (G.hardTasksDone||0) < c.hardTasks) done = false;
    if (c.totalDmgTaken&& (G.totalDmgTaken||0) < c.totalDmgTaken) done = false;
    if (done) {
      G.evoQuestDone[qid] = true;
      logBattle(`<span class="log-exp">📜 เควสเปลี่ยนอาชีพสำเร็จ: ${quest.name}!</span>`);
      saveGame();
    }
  });
}

// ── override getNextEvolution to support branching ──
function getNextEvolution() {
  if (!G.classId) return null;
  const path = CLASS_EVOLUTIONS[G.classId];
  if (!path) return null;
  const nextTier = (G.classTier || 1) + 1;
  const candidates = path.filter(e => e.tier === nextTier);
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];
  // tier 3: ยังไม่ได้เลือก branch
  if (!G.classBranch) return null;
  return candidates.find(e => e.branch === G.classBranch) || null;
}

// ── override evolveClass to give weapon reward ──
// `forced` lets the Infinity Trial push a specific Tier-3 evolution (incl. the
// secret branch) without going through the level/quest condition gate.
function evolveClass(forced) {
  const next = forced || getNextEvolution();
  if (!next) {
    // Tier 2 → Tier 3 is decided by the Infinity Trial, not a free pick.
    if ((G.classTier || 1) === 2 && typeof openInfinityTrial === 'function') { openInfinityTrial(); return; }
    return;
  }
  if (!forced && !canEvolve()) return;

  G.classTier   = next.tier;
  if (next.branch) G.classBranch = next.branch;
  G.classEvolutionHistory.push({ tier:next.tier, name:next.name, level:G.level, branch: next.branch||null, secret:!!next.secret });

  const b = next.bonuses || {};
  if (b.hpMult)  { G.maxHp  = Math.floor(G.maxHp  * b.hpMult);  G.hp = G.maxHp; }
  if (b.atkMult) G.baseAtk = Math.floor(G.baseAtk * b.atkMult);
  if (b.defMult) G.baseDef = Math.floor(G.baseDef * b.defMult);
  // persistent combat traits granted by evolutions (esp. secret tiers)
  if (b.critBonus)       G.critBonusFromTree  = (G.critBonusFromTree || 0) + b.critBonus;
  if (b.lifesteal)       G.lifestealBonus     = (G.lifestealBonus    || 0) + b.lifesteal;
  if (b.doubleStrike)    G.doubleStrikeChance = Math.max(G.doubleStrikeChance || 0, b.doubleStrike);
  if (b.damageReduction) G.damageReduction    = Math.max(G.damageReduction || 0, b.damageReduction);
  if (b.reviveOnce)      G.hasRevive = true;

  // remember secret-tier discovery for the Codex (persists across classes)
  if (next.secret) {
    if (!G.secretClassesFound) G.secretClassesFound = [];
    const key = `${G.classId}_S`;
    if (!G.secretClassesFound.includes(key)) G.secretClassesFound.push(key);
  }

  // weapon reward
  if (next.rewardWeapon) {
    const w = {...next.rewardWeapon, uid: Date.now() + Math.random(), level: G.level };
    if (!G.inventory) G.inventory = [];
    G.inventory.push(w);
    logBattle(`<span class="log-exp">🎁 รับอาวุธพิเศษ: ${w.icon} ${w.name}!</span>`);
  }

  const tag = next.secret ? '<span style="color:#ff00cc">★ TIER ลับ ★</span> ' : '';
  logBattle(`<span class="log-exp">✨ วิวัฒนาการ! ${tag}${next.icon} คุณกลายเป็น "${next.name}" (Tier ${next.tier})!</span>`);
  if (typeof rpgOnEvolution === 'function') rpgOnEvolution(next.tier);
  showEvolutionModal(next);
  checkAchievements();
  saveGame();
  renderAll();
  renderEvolutionButton();
  renderSkillTree();
}

// formatBonuses — used by the Infinity Trial result + evolution UI
function formatBonuses(b) {
  if (!b) return '';
  let s = [];
  if (b.hpMult)    s.push(`❤ HP ×${b.hpMult}`);
  if (b.atkMult)   s.push(`⚔ ATK ×${b.atkMult}`);
  if (b.defMult)   s.push(`🛡 DEF ×${b.defMult}`);
  if (b.critBonus) s.push(`💥 CRIT +${Math.floor(b.critBonus*100)}%`);
  if (b.expMult)   s.push(`✨ EXP ×${b.expMult}`);
  if (b.goldMult)  s.push(`💰 Gold ×${b.goldMult}`);
  if (b.regenMult) s.push(`💚 Regen ×${b.regenMult}`);
  if (b.streakMult)s.push(`🔥 Streak ×${b.streakMult}`);
  if (b.damageReduction) s.push(`🛡 รับดาเมจ -${Math.floor(b.damageReduction*100)}%`);
  if (b.lifesteal)    s.push(`🩸 ดูดเลือด ${Math.floor(b.lifesteal*100)}%`);
  if (b.doubleStrike) s.push(`⚡ โจมตีซ้ำ ${Math.floor(b.doubleStrike*100)}%`);
  if (b.reviveOnce)   s.push(`🕊️ ฟื้นชีพ 1 ครั้ง/run`);
  if (b.spellEcho)    s.push(`🔮 เวทสะท้อน ${Math.floor(b.spellEcho*100)}%`);
  if (b.pierce)       s.push(`🎯 ทะลุเกราะ ${Math.floor(b.pierce*100)}%`);
  if (b.multiShot)    s.push(`🏹 ยิงพร้อม ${b.multiShot}`);
  return s.join(' &nbsp;');
}

// ── Skill Tree UI ──
// Sidebar shows a compact summary + button. Full grid opens in an overlay.
function renderSkillTree() {
  const area = document.getElementById('skill-tree-summary');
  if (!area || !G.classId) return;
  refreshSkillPoints();

  const availMain = G.skillTreePoints || 0;
  const availIdle = G.idleTreePoints  || 0;
  const avail = availMain + availIdle;

  const equipBonus  = typeof getEquippedStatBonus === 'function' ? (getEquippedStatBonus().attackSpeed || 0) : 0;
  const totalSpeed  = Math.min(0.9, (G.attackSpeedBonus || 0) + equipBonus);
  const speedPct    = Math.round(totalSpeed * 100);
  const curInterval = typeof getAttackInterval === 'function' ? (getAttackInterval()/1000).toFixed(1) : '3.0';

  const pulse = avail > 0 ? 'box-shadow:0 0 12px rgba(255,200,40,.5);animation:pulse 1.5s infinite' : '';
  const badge = (n,col) => n > 0 ? `<span style="background:${col};color:#221100;border-radius:10px;padding:0 .5rem;margin-left:.3rem">${n}</span>` : '';
  area.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;font-size:.74rem;color:#aaa;margin-bottom:.5rem">
      <span>⚡ ${curInterval}วิ/ตี (-${speedPct}%)</span>
      <span>💎 +${Math.round((G.dropBonusFromTree||0)*100)}% Drop</span>
    </div>
    <button onclick="openSkillTreeFull()" style="width:100%;padding:.55rem;border-radius:10px;cursor:pointer;font-weight:700;font-size:.85rem;
      background:linear-gradient(135deg,#2a2a4a,#3a3a6a);border:1px solid ${avail>0?'#ffcc44':'#445'};color:${avail>0?'#ffdd66':'#aabbdd'};${pulse}">
      🌳 เปิด Skill Tree${availMain ? ` 🌳${badge(availMain,'#ffcc44')}` : ''}${availIdle ? ` 🌙${badge(availIdle,'#66ccff')}` : ''}
    </button>
    <button onclick="openSkillLoadout()" style="width:100%;margin-top:.4rem;padding:.5rem;border-radius:10px;cursor:pointer;font-weight:700;font-size:.82rem;
      background:linear-gradient(135deg,#2a1a3a,#3a2a5a);border:1px solid #8866cc;color:#ccaaff">
      ⚔ จัดสกิล (${(G.equippedSkills||[]).length}/${MAX_ACTIVE_SKILLS})
    </button>`;

  // keep overlays in sync if open
  const ov = document.getElementById('skilltree-overlay');
  if (ov && ov.classList.contains('active')) _renderSkillTreeFull();
  const lo = document.getElementById('skill-loadout-overlay');
  if (lo && lo.classList.contains('active')) _renderSkillLoadout();
}

// ── Active-skill loadout: pick up to 3 unlocked skills to use in IDLE + battle ──
const MAX_ACTIVE_SKILLS = 3;

function openSkillLoadout() {
  let ov = document.getElementById('skill-loadout-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'skill-loadout-overlay';
    ov.className = 'overlay';
    ov.onclick = (e) => { if (e.target === ov) closeSkillLoadout(); };
    document.body.appendChild(ov);
  }
  _renderSkillLoadout();
  ov.classList.add('active');
}

function closeSkillLoadout() {
  const ov = document.getElementById('skill-loadout-overlay');
  if (ov) ov.classList.remove('active');
}

function _allUnlockedSkillDefs() {
  const tree = SKILL_TREES[G.classId] || [];
  const out = [];
  (G.unlockedSkills || []).forEach(sid => {
    const node = tree.find(n => n.type === 'skill' && n.skill && n.skill.id === sid);
    if (node) out.push({ id: sid, name: node.skill.name, desc: node.skill.desc, icon: node.icon || '⚡', tier: node.skill.tier || 1 });
    else out.push({ id: sid, name: sid, desc: '', icon: '⚡', tier: 1 });
  });
  return out;
}

// toggle a skill on/off in the active loadout (max 3)
function toggleActiveSkill(sid) {
  if (!G.equippedSkills) G.equippedSkills = [];
  const i = G.equippedSkills.indexOf(sid);
  if (i >= 0) {
    G.equippedSkills.splice(i, 1);
  } else {
    if (G.equippedSkills.length >= MAX_ACTIVE_SKILLS) {
      logBattle(`<span class="log-sys">⚠ ใช้สกิลได้สูงสุด ${MAX_ACTIVE_SKILLS} อัน — ปิดอันอื่นก่อน</span>`);
      return;
    }
    G.equippedSkills.push(sid);
  }
  saveGame();
  _renderSkillLoadout();
  renderSkillTree();
}

function _renderSkillLoadout() {
  const ov = document.getElementById('skill-loadout-overlay');
  if (!ov) return;
  const all = _allUnlockedSkillDefs();
  const equipped = G.equippedSkills || [];
  const tierName = { 1:'พื้นฐาน', 2:'พัฒนา', 3:'สาขา', 4:'ขั้นสูง' };

  const rows = all.length ? all.map(s => {
    const on = equipped.includes(s.id);
    const idleOk = (typeof _IDLE_SKILL_DMG !== 'undefined') && _IDLE_SKILL_DMG[s.id];
    return `
      <div class="sl-row${on ? ' on' : ''}" onclick="toggleActiveSkill('${s.id}')">
        <span class="sl-icon">${s.icon}</span>
        <div class="sl-info">
          <div class="sl-name">${s.name} <span class="sl-tier">T${s.tier}</span></div>
          <div class="sl-desc">${s.desc || ''}</div>
          <div class="sl-tags">${idleOk ? '🌙 ออโต้ใน IDLE' : '⚔ ใช้ในด่าน'}</div>
        </div>
        <span class="sl-toggle">${on ? '✅ ใช้อยู่' : '➕ เลือก'}</span>
      </div>`;
  }).join('') : '<div style="color:#888;text-align:center;padding:1rem;font-size:.85rem">ยังไม่มีสกิล — ปลดล็อกจาก Skill Tree ก่อน</div>';

  ov.innerHTML = `
    <div class="modal sl-modal" onclick="event.stopPropagation()">
      <div class="sl-title">⚔ จัดสกิลที่ใช้ <span style="color:#ccaaff">(${equipped.length}/${MAX_ACTIVE_SKILLS})</span></div>
      <div class="sl-hint">เลือกได้สูงสุด ${MAX_ACTIVE_SKILLS} สกิล — ใช้ทั้งโหมด IDLE และด่าน · แตะเพื่อเปิด/ปิด</div>
      <div class="sl-list">${rows}</div>
      <button class="btn-close-modal" onclick="closeSkillLoadout()">ปิด</button>
    </div>`;
}

function openSkillTreeFull() {
  const ov = document.getElementById('skilltree-overlay');
  if (!ov) return;
  _renderSkillTreeFull();
  ov.classList.add('active');
}

function closeSkillTreeFull() {
  const ov = document.getElementById('skilltree-overlay');
  if (ov) ov.classList.remove('active');
}

function _renderSkillTreeFull() {
  const area = document.getElementById('skill-tree-area-full');
  if (!area || !G.classId) return;
  refreshSkillPoints();

  const allNodes = SKILL_TREES[G.classId] || [];
  const tree = allNodes.filter(n => {
    if (!n.branch) return true;
    if (!G.classBranch) return n.row < 3;
    return n.branch === G.classBranch;
  });
  const maxRow = tree.length ? Math.max(...tree.map(n => n.row)) : 0;
  const earned = getSkillPointsEarned(G.level);
  const availMain = G.skillTreePoints || 0;
  const availIdle = G.idleTreePoints  || 0;

  const ROW_LABELS = {
    0: 'Tier 1 — เริ่มต้น',
    1: 'Tier 2 — พัฒนา',
    2: 'Tier 3 — ชำนาญ',
    3: 'Tier 3 — สาขา',
    4: 'Tier 4 — ขั้นสูงสุด',
    5: 'IDLE — ความเร็ว & ดรอป',
    6: 'IDLE — พลังขั้นสุด',
    7: 'IDLE — ฟาร์ม & ออฟไลน์',
  };

  const equipBonus  = typeof getEquippedStatBonus === 'function' ? (getEquippedStatBonus().attackSpeed || 0) : 0;
  const totalSpeed  = Math.min(0.9, (G.attackSpeedBonus || 0) + equipBonus);
  const speedPct    = Math.round(totalSpeed * 100);
  const curInterval = typeof getAttackInterval === 'function' ? (getAttackInterval()/1000).toFixed(1) : '3.0';
  const equipSpeedPct = Math.round(equipBonus * 100);

  let html = `
  <div style="background:rgba(0,0,0,.35);border:1px solid #333;border-radius:10px;padding:.7rem .9rem;margin-bottom:.7rem;display:flex;flex-wrap:wrap;gap:.8rem;align-items:center">
    <div style="color:var(--gold);font-size:.95rem;font-weight:700">🌳 Main: <span style="font-size:1.2rem">${availMain}</span></div>
    <div style="color:#66ccff;font-size:.95rem;font-weight:700">🌙 IDLE: <span style="font-size:1.2rem">${availIdle}</span></div>
    <div style="color:#aaa;font-size:.72rem">ทุก 5 LV = +1 ทั้ง 2 กอง (แยกกัน)</div>
    <div style="color:#88ccff;font-size:.75rem">⚡ ความเร็ว: ${curInterval}วิ/ตี (-${speedPct}%${equipSpeedPct ? ` +${equipSpeedPct}% จากของ` : ''})</div>
    <div style="color:#ffcc44;font-size:.75rem">💎 Drop: +${Math.round((G.dropBonusFromTree||0)*100)}%</div>
    ${G.classBranch ? `<div style="color:#ffaa44;font-size:.75rem">🔱 สาย: ${({A:'บุก',B:'ตั้งรับ',C:'พิฆาต',D:'จอมทัพ',S:'★ ลับ'})[G.classBranch]||G.classBranch}</div>` : ''}
  </div>`;

  for (let row = 0; row <= maxRow; row++) {
    const rowNodes = tree.filter(n => n.row === row && !(n.branch && G.classBranch && n.branch !== G.classBranch));
    if (!rowNodes.length) continue;

    const label = ROW_LABELS[row] || `Row ${row}`;
    const isSeparator = row === 5;
    html += `
    ${isSeparator ? `
      <div style="border-top:1px solid #335;margin:.9rem 0 .6rem;padding-top:.5rem">
        <span style="color:#88aaff;font-size:.85rem;font-weight:700">── ⚙ IDLE SYSTEM ──</span>
      </div>
      <div style="background:rgba(20,40,80,.3);border:1px solid #2a4a7a;border-radius:8px;padding:.6rem .8rem;margin-bottom:.7rem;font-size:.72rem;color:#aaccdd;line-height:1.6">
        🌙 <b style="color:#bdf">ระบบ IDLE</b> — ตัวละครจะฟาร์มมอนอัตโนมัติในกรอบด้านล่างจอ ตลอดเวลา<br>
        ⚡ <b>ลดเวลาตี</b> — ยิ่งลดมาก ยิ่งตีถี่ (ทั้ง IDLE และมอนด่าน), เริ่มต้น 3.0 วิ/ตี<br>
        ❤ <b>เพิ่ม HP / ⚔ ATK</b> — เพิ่มพลังให้ทั้งสองโหมด<br>
        💎 <b>เพิ่ม Drop</b> — โอกาสดรอปไอเทมจากการฟาร์มสูงขึ้น<br>
        ✨ <b>สกิลที่ปลดล็อค</b> จะออโต้แคสต์ใน IDLE เมื่อพ้นคูลดาวน์ (คูลดาวน์เป็นวินาที)
      </div>` : ''}
    <div style="color:#888;font-size:.72rem;margin:.3rem 0 .35rem .2rem;font-weight:600">${label}</div>
    <div style="display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:.4rem">`;

    rowNodes.forEach(node => {
      const unlocked = isNodeUnlocked(node.id);
      const canGet   = canUnlockNode(node);
      const isSkill  = node.type === 'skill';
      const bgColor  = unlocked ? 'rgba(30,80,30,.7)' : canGet ? 'rgba(20,40,80,.8)' : 'rgba(20,20,20,.6)';
      const border   = unlocked ? '#44aa44' : canGet ? '#4466cc' : '#333';
      const textCol  = unlocked ? '#88ff88' : canGet ? '#aaccff' : '#555';
      const cursor   = canGet ? 'pointer' : 'default';
      const branchTag = node.branch ? `<span style="position:absolute;top:2px;right:4px;font-size:.6rem;color:#ffaa44">${node.branch}</span>` : '';
      const subText  = isSkill
        ? `<div style="font-size:.62rem;color:#ffcc88;margin-top:2px">${node.skill?.name}</div>`
        : `<div style="font-size:.62rem;color:${textCol};margin-top:2px">${_formatStatShort(node.stat)}</div>`;
      const lockIcon = !unlocked && !canGet ? '<span style="position:absolute;top:2px;left:4px;font-size:.65rem">🔒</span>' : '';
      const checkIcon = unlocked ? '<span style="position:absolute;top:2px;left:4px;font-size:.65rem">✓</span>' : '';
      const cost = (typeof nodeCost === 'function') ? nodeCost(node) : (node.cost || 1);
      const costTag = (!unlocked && cost > 1)
        ? `<span style="position:absolute;bottom:2px;right:4px;font-size:.6rem;font-weight:800;color:#ffcc44">💠${cost}</span>` : '';
      const tip = isSkill ? _skillNodeTip(node).replace(/"/g, '&quot;') : _formatStatShort(node.stat);
      html += `<div onclick="${canGet?`unlockNodeFromFull('${node.id}')`:''}" title="${tip}"
        style="position:relative;min-width:78px;max-width:96px;padding:.5rem .4rem;background:${bgColor};border:1px solid ${border};border-radius:10px;text-align:center;cursor:${cursor};transition:all .2s;flex:0 0 auto">
        ${branchTag}${lockIcon}${checkIcon}${costTag}
        <div style="font-size:1.5rem">${node.icon}</div>
        <div style="font-size:.7rem;color:${textCol};font-weight:${canGet||unlocked?700:400};line-height:1.2">${node.name}</div>
        ${subText}
      </div>`;
    });
    html += `</div>`;
  }

  area.innerHTML = html;
}

// unlock from the full overlay. Apply the node + refresh the overlay
// immediately for instant feedback, then defer the heavier full re-render.
function unlockNodeFromFull(nodeId) {
  _applyNodeUnlock(nodeId);
  _renderSkillTreeFull();               // instant visual feedback in the overlay
  requestAnimationFrame(() => {         // heavy work next frame, off the click
    saveGame();
    if (typeof renderAll === 'function') renderAll();
    renderSkillTree();
  });
}

// tooltip for a skill node: explains what it does in the zone fight vs IDLE
function _skillNodeTip(node) {
  const sk = node.skill;
  if (!sk) return node.name;
  const cd = sk.cooldown || sk.cd || 3;
  let tip = `✨ ${sk.name}\n${sk.desc}\n\n`;
  tip += `⚔ มอนด่าน: กดใช้เอง — คูลดาวน์ ${cd} เทิร์น\n`;
  const idleDmg = (typeof _IDLE_SKILL_DMG !== 'undefined') ? _IDLE_SKILL_DMG[sk.id] : null;
  if (idleDmg) {
    tip += `🌙 IDLE: ออโต้แคสต์ — โจมตี ×${idleDmg.mult}${idleDmg.hits > 1 ? ` (${idleDmg.hits} ครั้ง)` : ''} คูลดาวน์ ${cd}×ความเร็ว วิ`;
  } else {
    tip += `🌙 IDLE: สกิลบัฟ/สนับสนุน — ไม่ออโต้แคสต์ใน IDLE`;
  }
  return tip;
}

function _formatStatShort(s) {
  if (!s) return '';
  const parts = [];
  if (s.hp)         parts.push(`+${s.hp}HP`);
  if (s.atk)        parts.push(`+${s.atk}ATK`);
  if (s.def)        parts.push(`+${s.def}DEF`);
  if (s.crit)       parts.push(`+${Math.round(s.crit*100)}%Crit`);
  if (s.expBonus)   parts.push(`+${Math.round(s.expBonus*100)}%EXP`);
  if (s.goldBonus)  parts.push(`+${Math.round(s.goldBonus*100)}%Gold`);
  if (s.regenBonus) parts.push(`+${Math.round(s.regenBonus*100)}%HP/t`);
  if (s.speedBonus) parts.push(`-${Math.round(s.speedBonus*100)}%ช้า`);
  if (s.dropBonus)  parts.push(`+${Math.round(s.dropBonus*100)}%Drop`);
  if (s.streakBonus)parts.push(`+${Math.round(s.streakBonus*100)}%Str`);
  if (s.idleExpBonus)   parts.push(`+${Math.round(s.idleExpBonus*100)}%IDLE EXP`);
  if (s.idleGoldBonus)  parts.push(`+${Math.round(s.idleGoldBonus*100)}%IDLE ทอง`);
  if (s.offlineCapBonus)parts.push(`+${s.offlineCapBonus}ชม.ออฟไลน์`);
  if (s.offlineEffBonus)parts.push(`+${Math.round(s.offlineEffBonus*100)}%ออฟไลน์`);
  return parts.join(' ');
}
