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
    if (s.hp)         { G.maxHp += s.hp; G.hp = Math.min(G.hp + s.hp, G.maxHp); }
    if (s.atk)        G.baseAtk += s.atk;
    if (s.def)        G.baseDef += s.def;
    if (s.crit)       G.critBonusFromTree = (G.critBonusFromTree || 0) + s.crit;
    if (s.expBonus)   G.expBonusFromTree  = (G.expBonusFromTree  || 0) + s.expBonus;
    if (s.goldBonus)  G.goldBonusFromTree = (G.goldBonusFromTree || 0) + s.goldBonus;
    if (s.regenBonus) G.regenBonusFromTree= (G.regenBonusFromTree|| 0) + s.regenBonus;
    if (s.streakBonus)G.streakBonusFromTree=(G.streakBonusFromTree||0)+ s.streakBonus;
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

// ── Skill Tree UI ──
function renderSkillTree() {
  const area = document.getElementById('skill-tree-area');
  if (!area || !G.classId) return;

  refreshSkillPoints();
  const tree = getSkillTree();
  const maxRow = tree.length ? Math.max(...tree.map(n => n.row)) : 0;
  const earned = getSkillPointsEarned(G.level);
  const spent  = Object.keys(G.skillTreeSpent || {}).length;
  const avail  = Math.max(0, earned - spent);

  let html = `<div style="font-size:.8rem;color:var(--gold);margin-bottom:.4rem">
    🌳 Skill Points: <b>${avail}</b> &nbsp;<span style="color:var(--text2);font-size:.72rem">(ใช้ไป ${spent}/${earned})</span>
  </div>`;

  // branch status
  if (G.classTier >= 2 && !G.classBranch) {
    html += `<div style="font-size:.78rem;color:#ffaa44;margin-bottom:.4rem;background:rgba(255,170,0,.1);border:1px solid #ffaa44;border-radius:4px;padding:.3rem .6rem">
      🔱 row 3 ต้องเลือกเส้นทางก่อนวิวัฒนาการ tier 3
    </div>`;
  }
  if (G.classBranch) {
    const branchName = G.classBranch === 'A' ? 'สายซ้าย' : 'สายขวา';
    html += `<div style="font-size:.75rem;color:var(--text2);margin-bottom:.4rem">เส้นทาง: <b style="color:var(--gold)">${branchName}</b></div>`;
  }

  // grid
  html += `<div class="skill-tree-grid">`;
  for (let row = 0; row <= maxRow; row++) {
    html += `<div class="skill-tree-row">`;
    const rowNodes = tree.filter(n => n.row === row);
    // แสดงเฉพาะ node ที่ไม่ใช่ branch ของฝั่งตรงข้าม
    rowNodes.forEach(node => {
      if (node.branch && G.classBranch && node.branch !== G.classBranch) return;
      const unlocked = isNodeUnlocked(node.id);
      const canGet   = canUnlockNode(node);
      const cls = unlocked ? 'skill-node unlocked' : canGet ? 'skill-node available' : 'skill-node locked';
      const branchTag = node.branch ? `<span class="node-branch-tag">${node.branch}</span>` : '';
      const tooltip = node.type === 'skill'
        ? `${node.skill?.name}: ${node.skill?.desc} (CD ${node.skill?.cooldown}ตา)`
        : formatBonuses(node.stat);
      const subLine = node.type === 'skill'
        ? `<div class="node-skill-badge">✨ ${node.skill?.name}</div>`
        : `<div class="node-stat-text">${formatBonuses(node.stat)}</div>`;
      html += `<div class="${cls}" onclick="unlockNode('${node.id}')" title="${tooltip}">
        ${branchTag}
        <div class="node-icon">${node.icon}</div>
        <div class="node-name">${node.name}</div>
        ${subLine}
      </div>`;
    });
    html += `</div>`;
  }
  html += `</div>`;

  area.innerHTML = html;
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
