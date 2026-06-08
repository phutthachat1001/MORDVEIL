// ============================================================
// SKILL TREE SYSTEM
// ============================================================

// ── skill point ──
// ให้ 1 point ทุก 5 level
function getSkillPointsEarned(level) {
  return Math.floor(level / 5);
}

function refreshSkillPoints() {
  const earned = getSkillPointsEarned(G.level);
  const spent  = Object.keys(G.skillTreeSpent || {}).length;
  G.skillTreePoints = Math.max(0, earned - spent);
}

// ── node helpers ──
function getSkillTree() {
  if (!G.classId) return [];
  return (SKILL_TREES[G.classId] || []).filter(n => {
    if (!n.branch) return true;
    if (!G.classBranch) return n.row < 3; // แสดง row 0-2 ก่อนเลือก branch
    return n.branch === G.classBranch;   // branch ตรงกันแสดงทุก row
  });
}

function isNodeUnlocked(nodeId) {
  return !!(G.skillTreeSpent && G.skillTreeSpent[nodeId]);
}

function canUnlockNode(node) {
  if (isNodeUnlocked(node.id)) return false;
  if ((G.skillTreePoints || 0) < 1) return false;
  if (node.requires && !isNodeUnlocked(node.requires)) return false;
  if (node.branch && G.classBranch && node.branch !== G.classBranch) return false;
  return true;
}

function unlockNode(nodeId) {
  const tree = SKILL_TREES[G.classId] || [];
  const node = tree.find(n => n.id === nodeId);
  if (!node || !canUnlockNode(node)) return;

  G.skillTreeSpent[nodeId] = true;
  G.skillTreePoints = Math.max(0, (G.skillTreePoints || 0) - 1);

  // apply stat bonus
  if (node.type === 'stat' && node.stat) {
    const s = node.stat;
    if (s.hp)           { G.maxHp += s.hp; G.hp = Math.min(G.hp + s.hp, G.maxHp); }
    if (s.atk)          G.baseAtk += s.atk;
    if (s.def)          G.baseDef += s.def;
    if (s.crit)         G.critBonusFromTree  = (G.critBonusFromTree  || 0) + s.crit;
    if (s.expBonus)     G.expBonusFromTree   = (G.expBonusFromTree   || 0) + s.expBonus;
    if (s.goldBonus)    G.goldBonusFromTree  = (G.goldBonusFromTree  || 0) + s.goldBonus;
    if (s.regenBonus)   G.regenBonusFromTree = (G.regenBonusFromTree || 0) + s.regenBonus;
    if (s.streakBonus)  G.streakBonusFromTree= (G.streakBonusFromTree|| 0) + s.streakBonus;
    if (s.speedBonus)   { G.attackSpeedBonus = Math.min(0.9, (G.attackSpeedBonus || 0) + s.speedBonus); if (typeof restartAutoWithNewSpeed === 'function') restartAutoWithNewSpeed(); }
    if (s.dropBonus)    G.dropBonusFromTree  = (G.dropBonusFromTree  || 0) + s.dropBonus;
    logBattle(`<span class="log-exp">🌳 Skill Tree: ได้รับ ${node.name}!</span>`);
  }

  if (node.type === 'skill') {
    if (!G.unlockedSkills) G.unlockedSkills = [];
    if (!G.unlockedSkills.includes(node.skill.id)) {
      G.unlockedSkills.push(node.skill.id);
      // auto-equip ถ้ายังมีที่ว่าง
      if (!G.equippedSkills) G.equippedSkills = [];
      if (G.equippedSkills.length < 4) G.equippedSkills.push(node.skill.id);
      logBattle(`<span class="log-exp">✨ สกิลใหม่: ${node.icon||'⚡'} ${node.skill.name} — ${node.skill.desc}</span>`);
    }
  }

  const nodeTier = (node.skill?.tier) || (node.row >= 3 ? 4 : node.row + 1);
  if (typeof rpgOnSkillUnlock === 'function') rpgOnSkillUnlock(node.type, nodeTier);
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

// ── branch selection ──
function selectBranch(branch) {
  if (G.classBranch) return; // already chosen
  if (G.classTier < 2) return;
  G.classBranch = branch;
  logBattle(`<span class="log-exp">🔱 เลือกเส้นทาง ${branch === 'A' ? 'สายซ้าย' : 'สายขวา'}!</span>`);
  saveGame();
  renderSkillTree();
  renderEvolutionButton();
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
function evolveClass() {
  const next = getNextEvolution();
  if (!next) {
    // tier 3 และยังไม่เลือก branch → เปิด branch picker
    if ((G.classTier || 1) === 2) { openBranchPicker(); return; }
    return;
  }
  if (!canEvolve()) return;

  const oldTier = G.classTier;
  G.classTier   = next.tier;
  G.classEvolutionHistory.push({ tier:next.tier, name:next.name, level:G.level, branch: next.branch||null });

  const b = next.bonuses || {};
  if (b.hpMult)  { G.maxHp  = Math.floor(G.maxHp  * b.hpMult);  G.hp = G.maxHp; }
  if (b.atkMult) G.baseAtk = Math.floor(G.baseAtk * b.atkMult);
  if (b.defMult) G.baseDef = Math.floor(G.baseDef * b.defMult);

  // weapon reward
  if (next.rewardWeapon) {
    const w = {...next.rewardWeapon, uid: Date.now() + Math.random(), level: G.level };
    if (!G.inventory) G.inventory = [];
    G.inventory.push(w);
    logBattle(`<span class="log-exp">🎁 รับอาวุธพิเศษ: ${w.icon} ${w.name}!</span>`);
  }

  logBattle(`<span class="log-exp">✨ วิวัฒนาการ! ${next.icon} คุณกลายเป็น "${next.name}" (Tier ${next.tier})!</span>`);
  showEvolutionModal(next);
  checkAchievements();
  saveGame();
  renderAll();
  renderEvolutionButton();
  renderSkillTree();
}

// ── branch picker UI ──
function openBranchPicker() {
  const path = CLASS_EVOLUTIONS[G.classId] || [];
  const tier3 = path.filter(e => e.tier === 3);
  if (tier3.length < 2) return;
  const [A, B] = tier3;
  const overlay = document.getElementById('branch-picker-overlay');
  if (!overlay) return;
  overlay.innerHTML = `
    <div class="branch-picker-box">
      <div class="branch-picker-title">🔱 เลือกเส้นทางวิวัฒนาการ</div>
      <div class="branch-picker-row">
        <div class="branch-card" onclick="chooseBranchAndEvolve('A')">
          <div class="branch-icon">${A.icon}</div>
          <div class="branch-name" style="color:${A.color}">${A.name}</div>
          <div class="branch-lore">${A.lore}</div>
          <div class="branch-bonus">${formatBonuses(A.bonuses)}</div>
          <div class="branch-weapon">🎁 ${A.rewardWeapon?.name || ''}</div>
        </div>
        <div class="branch-vs">VS</div>
        <div class="branch-card" onclick="chooseBranchAndEvolve('B')">
          <div class="branch-icon">${B.icon}</div>
          <div class="branch-name" style="color:${B.color}">${B.name}</div>
          <div class="branch-lore">${B.lore}</div>
          <div class="branch-bonus">${formatBonuses(B.bonuses)}</div>
          <div class="branch-weapon">🎁 ${B.rewardWeapon?.name || ''}</div>
        </div>
      </div>
      <button onclick="closeBranchPicker()" style="margin-top:1rem;background:var(--bg3);border:1px solid var(--border2);color:var(--text2);padding:.4rem 1.2rem;border-radius:6px;cursor:pointer">ยกเลิก</button>
    </div>`;
  overlay.classList.add('active');
}

function chooseBranchAndEvolve(branch) {
  G.classBranch = branch;
  closeBranchPicker();
  evolveClass();
}

function closeBranchPicker() {
  const overlay = document.getElementById('branch-picker-overlay');
  if (overlay) overlay.classList.remove('active');
}

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
  return s.join(' &nbsp;');
}

// ── Skill Tree UI (full-page) ──
function renderSkillTree() {
  const area = document.getElementById('skill-tree-area');
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
  const spent  = Object.keys(G.skillTreeSpent || {}).length;
  const avail  = Math.max(0, earned - spent);

  const ROW_LABELS = {
    0: 'Tier 1 — เริ่มต้น',
    1: 'Tier 2 — พัฒนา',
    2: 'Tier 3 — ชำนาญ',
    3: 'Tier 3 — สาขา',
    4: 'Tier 4 — ขั้นสูงสุด',
    5: 'IDLE — ความเร็ว & ดรอป',
    6: 'IDLE — พลังขั้นสุด',
  };

  const equipBonus  = typeof getEquippedStatBonus === 'function' ? (getEquippedStatBonus().attackSpeed || 0) : 0;
  const totalSpeed  = Math.min(0.9, (G.attackSpeedBonus || 0) + equipBonus);
  const speedPct    = Math.round(totalSpeed * 100);
  const curInterval = typeof getAttackInterval === 'function' ? (getAttackInterval()/1000).toFixed(1) : '6.0';
  const equipSpeedPct = Math.round(equipBonus * 100);

  let html = `
  <div style="background:rgba(0,0,0,.35);border:1px solid #333;border-radius:10px;padding:.7rem .9rem;margin-bottom:.7rem;display:flex;flex-wrap:wrap;gap:.8rem;align-items:center">
    <div style="color:var(--gold);font-size:.9rem;font-weight:700">🌳 Skill Points: <span style="font-size:1.1rem">${avail}</span></div>
    <div style="color:#aaa;font-size:.75rem">ใช้ไป ${spent}/${earned} &nbsp;|&nbsp; ทุก 5 LV = +1 point</div>
    <div style="color:#88ccff;font-size:.75rem">⚡ ความเร็ว: ${curInterval}วิ/ตี (-${speedPct}%${equipSpeedPct ? ` +${equipSpeedPct}% จากของ` : ''})</div>
    <div style="color:#ffcc44;font-size:.75rem">💎 Drop: +${Math.round((G.dropBonusFromTree||0)*100)}%</div>
    ${G.classBranch ? `<div style="color:#ffaa44;font-size:.75rem">🔱 สาย: ${G.classBranch==='A'?'ซ้าย':'ขวา'}</div>` : ''}
  </div>`;

  for (let row = 0; row <= maxRow; row++) {
    const rowNodes = tree.filter(n => n.row === row && !(n.branch && G.classBranch && n.branch !== G.classBranch));
    if (!rowNodes.length) continue;

    const label = ROW_LABELS[row] || `Row ${row}`;
    const isSeparator = row === 5;
    html += `
    ${isSeparator ? `<div style="border-top:1px solid #335;margin:.6rem 0;padding-top:.4rem"><span style="color:#88aaff;font-size:.72rem;font-weight:700">── IDLE SYSTEM ──</span></div>` : ''}
    <div style="color:#666;font-size:.68rem;margin:.2rem 0 .3rem .2rem">${label}</div>
    <div style="display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:.3rem">`;

    rowNodes.forEach(node => {
      const unlocked = isNodeUnlocked(node.id);
      const canGet   = canUnlockNode(node);
      const isSkill  = node.type === 'skill';
      const bgColor  = unlocked ? 'rgba(30,80,30,.7)' : canGet ? 'rgba(20,40,80,.8)' : 'rgba(20,20,20,.6)';
      const border   = unlocked ? '#44aa44' : canGet ? '#4466cc' : '#333';
      const textCol  = unlocked ? '#88ff88' : canGet ? '#aaccff' : '#555';
      const cursor   = canGet ? 'pointer' : 'default';
      const branchTag = node.branch ? `<span style="position:absolute;top:2px;right:4px;font-size:.55rem;color:#ffaa44">${node.branch}</span>` : '';
      const subText  = isSkill
        ? `<div style="font-size:.58rem;color:#ffcc88;margin-top:1px">${node.skill?.name}</div>`
        : `<div style="font-size:.58rem;color:${textCol};margin-top:1px">${_formatStatShort(node.stat)}</div>`;
      const lockIcon = !unlocked && !canGet ? '<span style="position:absolute;top:2px;left:4px;font-size:.6rem">🔒</span>' : '';
      html += `<div onclick="${canGet?`unlockNode('${node.id}')`:''}" title="${isSkill ? (node.skill?.name+': '+node.skill?.desc) : _formatStatShort(node.stat)}"
        style="position:relative;min-width:64px;max-width:80px;padding:.4rem .3rem;background:${bgColor};border:1px solid ${border};border-radius:8px;text-align:center;cursor:${cursor};transition:all .2s;flex:0 0 auto">
        ${branchTag}${lockIcon}
        <div style="font-size:1.2rem">${node.icon}</div>
        <div style="font-size:.65rem;color:${textCol};font-weight:${canGet||unlocked?700:400};line-height:1.2">${node.name}</div>
        ${subText}
      </div>`;
    });
    html += `</div>`;
  }

  area.innerHTML = html;
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
  return parts.join(' ');
}

// ── evo quest UI in renderEvolutionButton ──
function renderEvoQuestProgress(next) {
  if (!next || !next.conditions || !next.conditions.evoQuest) return '';
  const qid = next.conditions.evoQuest;
  const quest = EVO_QUESTS[qid];
  if (!quest) return '';
  const done = G.evoQuestDone && G.evoQuestDone[qid];
  if (done) return `<div class="evo-cond">📜 ${quest.name}: <span style="color:#44ff88">✓ สำเร็จ</span></div>`;

  const c = quest.conditions;
  let lines = `<div class="evo-cond fail">📜 เควส: ${quest.name}</div>`;
  if (c.bossKills)    lines += condLine('👑 Boss',   c.bossKills,  G.bossKills);
  if (c.kills)        lines += condLine('💀 Kill',   c.kills,      G.totalKills);
  if (c.tasks)        lines += condLine('✅ งาน',    c.tasks,      G.totalTasks);
  if (c.epicTasks)    lines += condLine('🔥 Epic',   c.epicTasks,  G.epicTasksDone||0);
  if (c.critCount)    lines += condLine('💥 Crit',   c.critCount,  G.critCount||0);
  if (c.streak)       lines += condLine('🔥 Streak', c.streak,     G.streak);
  if (c.gold)         lines += condLine('💰 ทอง',    c.gold,       G.gold);
  if (c.hpHealed)     lines += condLine('💚 HP ฟื้น',c.hpHealed,   G.totalHpHealed||0);
  if (c.hardTasks)    lines += condLine('💪 งานยาก', c.hardTasks,  G.hardTasksDone||0);
  if (c.totalDmgTaken)lines += condLine('🩸 รับดาเมจ',c.totalDmgTaken,G.totalDmgTaken||0);
  return lines;
}
