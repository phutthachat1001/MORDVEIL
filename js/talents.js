// ============================================================
// TALENTS — ระบบติดตัวละคร (ปั้น build เอง)
// G.talents = { talentId: rank } · G.talentPoints = แต้มที่ใช้ไปแล้ว (derived)
// ได้ 1 แต้มทุก TALENT_POINTS_PER_LEVELS เลเวล
// ============================================================

function talentPointsEarned() {
  return Math.floor((G.level || 1) / (typeof TALENT_POINTS_PER_LEVELS !== 'undefined' ? TALENT_POINTS_PER_LEVELS : 3));
}
function talentPointsSpent() {
  if (!G.talents) return 0;
  return Object.values(G.talents).reduce((s, r) => s + (r || 0), 0);
}
function talentPointsFree() {
  return Math.max(0, talentPointsEarned() - talentPointsSpent());
}
function _talentRank(id) { return (G.talents && G.talents[id]) || 0; }
function _talentDef(id) {
  return (typeof TALENTS !== 'undefined') ? TALENTS.find(t => t.id === id) : null;
}

// Sum every talent's contribution × its rank → one bonus object.
function getTalentDerived() {
  const b = { atk:0, def:0, hp:0, crit:0, lifesteal:0, speed:0, expBonus:0, goldBonus:0, dropBonus:0, damageReduction:0 };
  if (!G.talents || typeof TALENTS === 'undefined') return b;
  TALENTS.forEach(t => {
    const r = _talentRank(t.id);
    if (!r) return;
    Object.keys(t.per).forEach(k => { b[k] = (b[k] || 0) + t.per[k] * r; });
  });
  return b;
}

// flat stats that fold into getEquippedStatBonus (called from shop.js)
function getTalentStatBonus() {
  const d = getTalentDerived();
  return { atk:d.atk, def:d.def, hp:d.hp, crit:d.crit }; // crit is a fraction (0-1)
}

// ---------- spend / reset ----------
function canRankTalent(id) {
  const t = _talentDef(id);
  if (!t) return false;
  return _talentRank(id) < t.maxRank && talentPointsFree() > 0;
}

function rankUpTalent(id) {
  if (!canRankTalent(id)) return;
  if (!G.talents) G.talents = {};
  G.talents[id] = _talentRank(id) + 1;
  if (typeof recalcTreeBonuses === 'function') recalcTreeBonuses(); // re-derive globals (incl. talents)
  if (typeof updateTopBar === 'function') updateTopBar();
  if (typeof updateCharPanel === 'function') updateCharPanel();
  if (typeof saveGame === 'function') saveGame();
  _renderTalentPanel();
}

function resetTalents() {
  if (!talentPointsSpent()) return;
  if ((G.gold || 0) < TALENT_RESET_COST) {
    if (typeof logBattle === 'function') logBattle(`<span class="log-sys">⚠ ต้องมี ${TALENT_RESET_COST} ทองเพื่อรีเซ็ต Talent</span>`);
    return;
  }
  if (!confirm(`รีเซ็ต Talent ทั้งหมด? (ใช้ ${TALENT_RESET_COST} ทอง — แต้มจะคืนทั้งหมด)`)) return;
  G.gold -= TALENT_RESET_COST;
  G.talents = {};
  if (typeof recalcTreeBonuses === 'function') recalcTreeBonuses();
  if (typeof updateTopBar === 'function') updateTopBar();
  if (typeof updateCharPanel === 'function') updateCharPanel();
  if (typeof saveGame === 'function') saveGame();
  _renderTalentPanel();
}

// ---------- UI ----------
function openTalentPanel() {
  let ov = document.getElementById('talent-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'talent-overlay';
    ov.className = 'overlay';
    ov.onclick = (e) => { if (e.target === ov) ov.classList.remove('active'); };
    document.body.appendChild(ov);
  }
  _renderTalentPanel();
  ov.classList.add('active');
}

const _TALENT_COL = { off:{ label:'⚔️ สายโจมตี', color:'#ff6644' }, def:{ label:'🛡 สายป้องกัน', color:'#44aaff' }, util:{ label:'✨ สายเก็บเกี่ยว', color:'#ffcc44' } };

function _renderTalentPanel() {
  const ov = document.getElementById('talent-overlay');
  if (!ov) return;
  const free = talentPointsFree();
  const cols = ['off','def','util'];
  let body = '';
  cols.forEach(c => {
    const meta = _TALENT_COL[c];
    const list = (typeof TALENTS !== 'undefined' ? TALENTS : []).filter(t => t.col === c);
    body += `<div style="margin:.5rem 0 .3rem;color:${meta.color};font-weight:700;font-size:.82rem">${meta.label}</div>`;
    list.forEach(t => {
      const r = _talentRank(t.id);
      const maxed = r >= t.maxRank;
      const canUp = !maxed && free > 0;
      const pips = Array.from({length:t.maxRank}, (_, i) =>
        `<span style="display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:2px;background:${i<r?meta.color:'#333'}"></span>`).join('');
      body += `
        <div style="display:flex;align-items:center;gap:.5rem;padding:.4rem .5rem;border:1px solid ${r>0?meta.color:'#2a2a3a'};border-radius:9px;background:rgba(255,255,255,.03);margin-bottom:.35rem">
          <div style="font-size:1.4rem">${t.icon}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:.8rem;color:#dde;font-weight:700">${t.name} <span style="color:#889;font-weight:400">${r}/${t.maxRank}</span></div>
            <div style="font-size:.68rem;color:#9aa">${t.desc}</div>
            <div style="margin-top:.2rem">${pips}</div>
          </div>
          <button onclick="rankUpTalent('${t.id}')" ${canUp?'':'disabled'}
            style="flex-shrink:0;width:34px;height:34px;border-radius:8px;border:none;font-size:1.1rem;font-weight:800;cursor:${canUp?'pointer':'not-allowed'};
            background:${canUp?meta.color:'#333'};color:${canUp?'#111':'#666'}">${maxed?'✓':'+'}</button>
        </div>`;
    });
  });

  ov.innerHTML = `
    <div class="modal" onclick="event.stopPropagation()" style="max-width:430px;width:95%;text-align:left;max-height:86vh;overflow-y:auto">
      <div style="text-align:center;margin-bottom:.3rem">
        <div style="font-size:1.15rem;font-weight:800;color:var(--gold)">🎯 ติดตัวละคร (Talent)</div>
        <div style="font-size:.8rem;color:#bbb">แต้มว่าง: <b style="color:#7dff7d">${free}</b> · ได้ +1 ทุก ${TALENT_POINTS_PER_LEVELS} เลเวล</div>
      </div>
      ${body}
      <button onclick="resetTalents()" style="width:100%;margin-top:.4rem;padding:.5rem;border-radius:8px;border:1px solid #a55;background:#2a1015;color:#f99;font-weight:700;cursor:pointer">♻ รีเซ็ต (${TALENT_RESET_COST} ทอง)</button>
      <button class="btn-close-modal" onclick="document.getElementById('talent-overlay').classList.remove('active')">ปิด</button>
    </div>`;
}
