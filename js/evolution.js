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
  const wantTier = G.classTier + 1;
  const candidates = path.filter(e => e.tier === wantTier);
  if (!candidates.length) return null;
  // once a branch is chosen, follow it (matches branch OR parentBranch)
  if (G.classBranch) {
    const onBranch = candidates.find(e => (e.branch || e.parentBranch) === G.classBranch);
    if (onBranch) return onBranch;
  }
  // no branch yet (tier 1→2) — return the first non-branched candidate
  return candidates.find(e => !e.branch) || candidates[0];
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
  // Tier 4 ต้องเก็บของในดันเจี้ยนครบ 6 ชิ้น + ทำเควสประจำอาชีพเสร็จก่อน
  if (evo.tier === 4 && typeof canForgeT4 === 'function' && !canForgeT4()) return false;
  return true;
}

// NOTE: evolveClass / getNextEvolution are overridden by js/skilltree.js
// (loaded after this file) which is the authoritative version — it handles
// branch following, weapon rewards, secret-tier traits, and the Infinity Trial
// gateway. The definitions below are legacy fallbacks kept for safety.
function evolveClass(forced) {
  const next = forced || getNextEvolution();
  if (!next) return;
  if (!forced && !canEvolve()) return;
  G.classTier = next.tier;
  if (next.branch) G.classBranch = next.branch;
  G.classEvolutionHistory.push({ tier:next.tier, name:next.name, level:G.level });
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

  // Tier 2, no branch chosen yet — the path to Tier 3 is the INFINITY TRIAL,
  // not a free pick. kills in the trial decide which branch (incl. secret).
  if ((G.classTier||1) === 2 && !G.classBranch && typeof canEnterTrial === 'function') {
    const minLv = (typeof TRIAL_MIN_LEVEL !== 'undefined') ? TRIAL_MIN_LEVEL : 35;
    const lvOk = (G.level || 1) >= minLv;
    area.innerHTML = `
      <div style="color:#ff88dd;font-size:.85rem;margin-bottom:.3rem">♾️ เส้นทาง Tier 3 ถูกตัดสินด้วยการทดสอบนิรันดร์</div>
      <div style="color:var(--text2);font-size:.75rem;margin-bottom:.4rem">ตีมอนไม่จบสิ้น — ยิ่งตีเยอะ ยิ่งได้คลาสโหด · มีโอกาสปลดล็อก Tier ลับ</div>
      ${lvOk
        ? `<button class="btn-evolve" onclick="openInfinityTrial()">⚔️ เข้าสู่การทดสอบนิรันดร์</button>`
        : `<div class="evo-cond fail" style="margin-bottom:.3rem">⭐ LV: ${G.level||1}/${minLv}</div>
           <div style="color:var(--text2);font-size:.8rem">🔒 ต้องถึงเลเวล ${minLv} ก่อน</div>`}`;
    return;
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

  // ── Tier 4: ต้องผ่านดันเจี้ยนหาของ 6 ชิ้น + เควสประจำอาชีพ ──
  if (next.tier === 4 && typeof canEnterT4Dungeon === 'function') {
    const lvOk    = !c.level || G.level >= c.level;
    const gearN   = (typeof t4GearCount === 'function') ? t4GearCount() : 0;
    const gearOk  = (typeof hasAllT4Gear === 'function') ? hasAllT4Gear() : false;
    const questOk = (typeof t4QuestDone === 'function') ? t4QuestDone() : true;
    area.innerHTML = `
      <div class="evo-next-name" style="color:${next.color||'var(--gold)'}">${next.icon} ${next.name} (Tier ${next.tier})</div>
      <div class="evo-conds">
        ${condHtml}
        <div class="evo-cond${gearOk?'':' fail'}">🧩 ของในดันเจี้ยน: ${gearN}/6</div>
        <div class="evo-cond${questOk?'':' fail'}">📜 เควสประจำอาชีพ: ${questOk?'เสร็จ':'ยังไม่เสร็จ'}</div>
      </div>
      ${ready
        ? `<button class="btn-evolve" onclick="evolveClass()">✨ วิวัฒนาการ!</button>`
        : !lvOk
          ? `<div style="color:var(--text2);font-size:.8rem">ต้องถึง LV ${c.level} ก่อน</div>`
          : `<button class="btn-evolve" onclick="openT4Dungeon()">⚔️ เข้าดันเจี้ยนหาของ T4</button>`}`;
    return;
  }

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
