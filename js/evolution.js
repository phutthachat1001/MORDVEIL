// ============================================================
// EVOLUTION & CLASS SET SYSTEM
// ============================================================

// ---------- helpers ----------

function getSetKey(tier) {
  return `${G.classId}_${tier}`;
}

function getCollectedPieces(setKey) {
  return G.collectedSetPieces[setKey] || [];
}

function hasCompleteSet(setKey) {
  const pieces = getCollectedPieces(setKey);
  const set    = CLASS_SETS[setKey];
  return set && pieces.length >= set.pieces.length;
}

// ---------- evolution ----------

function getNextEvolution() {
  if (!G.classId) return null;
  const path = CLASS_EVOLUTIONS[G.classId];
  if (!path) return null;
  return path.find(e => e.tier === G.classTier + 1) || null;
}

function canEvolve() {
  const next = getNextEvolution();
  if (!next) return false;
  return checkEvolutionConditions(next);
}

function checkEvolutionConditions(evo) {
  const c = evo.conditions;
  if (!c) return true;
  if (c.level && G.level < c.level) return false;
  return true;
}

function evolveClass() {
  const next = getNextEvolution();
  if (!next || !canEvolve()) return;

  const oldTier = G.classTier;
  G.classTier   = next.tier;
  G.classEvolutionHistory.push({ tier:next.tier, name:next.name, level:G.level });

  // apply stat bonuses
  const b = next.bonuses || {};
  if (b.hpMult)  { G.maxHp  = Math.floor(G.maxHp  * b.hpMult);  G.hp = G.maxHp; }
  if (b.atkMult) G.baseAtk = Math.floor(G.baseAtk * b.atkMult);
  if (b.defMult) G.baseDef = Math.floor(G.baseDef * b.defMult);

  logBattle(`<span class="log-exp">✨ วิวัฒนาการ! ${next.icon} คุณกลายเป็น "${next.name}" (Tier ${next.tier})!</span>`);
  if (typeof rpgOnEvolution === 'function') rpgOnEvolution(next.tier);
  showEvolutionModal(next);
  checkAchievements();
  saveGame();
  renderAll();
  renderEvolutionButton();
}

// ---------- set pieces ----------

function tryDropSetPiece(zone, isBoss) {
  if (!G.classId) return;
  // tier3 drops from zone3, tier4 from zone6
  const tierMap = { 3:3, 6:4 };
  const tier = tierMap[zone];
  if (!tier) return;
  const setKey = getSetKey(tier);
  const set    = CLASS_SETS[setKey];
  if (!set) return;

  const collected = getCollectedPieces(setKey);
  if (collected.length >= set.pieces.length) return; // full set already

  // pick a missing piece
  const missing = set.pieces.map((_, i) => i).filter(i => !collected.includes(i));
  if (missing.length === 0) return;
  const pieceIdx = missing[Math.floor(Math.random() * missing.length)];
  const piece    = set.pieces[pieceIdx];

  if (!G.collectedSetPieces[setKey]) G.collectedSetPieces[setKey] = [];
  G.collectedSetPieces[setKey].push(pieceIdx);

  // auto-apply stats
  G.baseAtk += piece.atk || 0;
  G.baseDef += (piece.def || 0);

  logBattle(`<span class="log-exp">🎴 ชิ้นส่วนเซ็ต! ${piece.icon} ${piece.name} (${set.name} ${collected.length+1}/${set.pieces.length})</span>`);

  if (hasCompleteSet(setKey)) {
    logBattle(`<span class="log-exp">🔮 เซ็ตสมบูรณ์! ${set.name} — โบนัส ATK×1.2, HP×1.15!</span>`);
    G.baseAtk = Math.floor(G.baseAtk * 1.2);
    G.maxHp   = Math.floor(G.maxHp   * 1.15);
    G.hp      = Math.min(G.hp, G.maxHp);
  }
  renderSetProgress();
  saveGame();
  updateTopBar();
  updateCharPanel();
}

// ---------- UI helpers ----------

function getSetStats() {
  let bonus = { atk:0, def:0, sets:[] };
  if (!G.classId) return bonus;
  [3, 4].forEach(tier => {
    const setKey = getSetKey(tier);
    const set    = CLASS_SETS[setKey];
    if (!set) return;
    const pieces = getCollectedPieces(setKey);
    pieces.forEach(i => {
      const p = set.pieces[i];
      bonus.atk += p.atk || 0;
      bonus.def += p.def || 0;
    });
    if (hasCompleteSet(setKey)) bonus.sets.push(setKey);
  });
  return bonus;
}

function renderSetProgress() {
  const area = document.getElementById('set-progress-area');
  if (!area || !G.classId) return;
  let html = '';
  [3, 4].forEach(tier => {
    const setKey = getSetKey(tier);
    const set    = CLASS_SETS[setKey];
    if (!set) return;
    const pieces    = getCollectedPieces(setKey);
    const complete  = hasCompleteSet(setKey);
    const rarityCol = tier === 4 ? 'var(--legend)' : 'var(--epic)';
    html += `<div class="set-row${complete ? ' set-complete' : ''}">
      <span style="color:${rarityCol}">${set.name}</span>
      <span class="set-count">${pieces.length}/${set.pieces.length}</span>
      <div class="set-pieces">`;
    set.pieces.forEach((p, i) => {
      const have = pieces.includes(i);
      html += `<span class="set-piece${have ? ' have' : ''}" title="${p.name}">${have ? p.icon : '❓'}</span>`;
    });
    html += `</div></div>`;
  });
  area.innerHTML = html || '<div style="color:var(--text2);font-size:.8rem">ยังไม่มีชิ้นส่วนเซ็ต</div>';
}

function renderEvolutionButton() {
  const area = document.getElementById('evolution-btn-area');
  if (!area) return;

  // tier 3 and no branch chosen yet — show branch picker button
  if ((G.classTier||1) === 2 && typeof CLASS_EVOLUTIONS !== 'undefined') {
    const path = CLASS_EVOLUTIONS[G.classId] || [];
    const tier3 = path.filter(e => e.tier === 3);
    if (tier3.length >= 2 && !G.classBranch) {
      // check level condition (min of both branches)
      const minLevel = Math.min(...tier3.map(e => e.conditions?.level || 0));
      const levelOk  = G.level >= minLevel;
      area.innerHTML = `
        <div style="color:var(--gold);font-size:.85rem;margin-bottom:.3rem">⭐ LV ต้องการ ${minLevel} (ตอนนี้ ${G.level})</div>
        ${levelOk
          ? `<button class="btn-evolve" onclick="openBranchPicker()">🔱 เลือกเส้นทาง Tier 3</button>`
          : `<div style="color:var(--text2);font-size:.8rem">ต้องการ LV ${minLevel}</div>`}`;
      return;
    }
  }

  const next = getNextEvolution();
  if (!next) {
    const path = CLASS_EVOLUTIONS[G.classId] || [];
    const maxTier = Math.max(...path.map(e => e.tier));
    area.innerHTML = (G.classTier||1) >= maxTier
      ? '<div style="color:var(--gold);font-size:.8rem">🏆 วิวัฒนาการสูงสุดแล้ว</div>'
      : '<div style="color:var(--text2);font-size:.8rem">เลือกเส้นทางก่อน</div>';
    return;
  }

  const ready = canEvolve();
  const c = next.conditions || {};
  const condHtml = c.level ? condLine('⭐ LV', c.level, G.level) : '';

  area.innerHTML = `
    <div class="evo-next-name" style="color:${next.color||'var(--gold)'}">${next.icon} ${next.name} (Tier ${next.tier})</div>
    <div class="evo-conds">${condHtml}</div>
    ${ready ? `<button class="btn-evolve" onclick="evolveClass()">✨ วิวัฒนาการ!</button>` : `<div style="color:var(--text2);font-size:.8rem">ต้องการ LV ${c.level||'?'}</div>`}`;
}

function condLine(label, need, have) {
  const ok = have >= need;
  return `<div class="evo-cond${ok?'':' fail'}">${label}: ${have}/${need}</div>`;
}

function showEvolutionModal(evo) {
  const m = document.getElementById('evo-overlay');
  if (!m) return;
  document.getElementById('evo-modal-icon').textContent  = evo.icon;
  document.getElementById('evo-modal-name').textContent  = evo.name;
  document.getElementById('evo-modal-tier').textContent  = `Tier ${evo.tier}`;
  document.getElementById('evo-modal-name').style.color  = evo.color || 'var(--gold)';
  const b = evo.bonuses || {};
  let bonusText = '';
  if (b.hpMult)    bonusText += `❤ HP ×${b.hpMult} `;
  if (b.atkMult)   bonusText += `⚔ ATK ×${b.atkMult} `;
  if (b.defMult)   bonusText += `🛡 DEF ×${b.defMult} `;
  if (b.critBonus) bonusText += `💥 CRIT +${Math.floor(b.critBonus*100)}% `;
  document.getElementById('evo-modal-bonuses').textContent = bonusText;
  m.classList.add('active');
}
