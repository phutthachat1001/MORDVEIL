// ============================================================
// ENHANCEMENT — ตีบวกอุปกรณ์ (+0 → +15)
// ใช้หินตีบวก/แก่น + ทอง · อัตราสำเร็จลดลงตามระดับ
// ล้มเหลว = เสียวัตถุดิบ แต่ "ไม่ลดระดับ" (ลดความเจ็บใจ ให้เกมสนุก)
// ============================================================

function _enhTierFor(level) {
  // level = ระดับปัจจุบันที่กำลังจะดันขึ้น (+1)
  const tiers = (typeof ENHANCE !== 'undefined' && ENHANCE.tiers) || [];
  for (const t of tiers) { if (level < t.upTo) return t; }
  return null; // เกิน maxLevel แล้ว
}

function enhanceMaxed(item) {
  const max = (typeof ENHANCE !== 'undefined' ? ENHANCE.maxLevel : 15);
  return (item.enhance || 0) >= max;
}

function _matCount(id) { return (G.materials && G.materials[id]) || 0; }

// บรรทัดเตือนความเสี่ยงตามระดับปัจจุบัน (lvl = ระดับที่กำลังดันขึ้น)
function _enhRiskLine(lvl) {
  const safe  = (typeof ENHANCE !== 'undefined' ? ENHANCE.safeUpTo : 4);
  const brk   = (typeof ENHANCE !== 'undefined' ? ENHANCE.breakFromLevel : 7);
  if (lvl < safe) return `<div style="font-size:.72rem;color:#66ff99;margin-top:.2rem">🛡️ ปลอดภัย — ไม่มีโอกาสพลาด</div>`;
  if (lvl < brk)  return `<div style="font-size:.72rem;color:#ffcc66;margin-top:.2rem">⚠ ล้มเหลว = เสียของ แต่ระดับคงเดิม</div>`;
  return `<div style="font-size:.72rem;color:#ff5544;margin-top:.2rem">💥 เสี่ยงแตก! ล้มเหลว = ลดระดับลง 1</div>`;
}

// ข้อความบรรทัดสรุปในกล่องไอเทม
function enhanceTooltipLine(item) {
  if (!item || !item.uid) return '';
  const lvl = item.enhance || 0;
  if (enhanceMaxed(item)) return `<span style="color:#ffcc44">🔨 ตีบวกสูงสุดแล้ว (+${lvl})</span>`;
  const t = _enhTierFor(lvl);
  if (!t) return '';
  const okStones = _matCount('enhance_stone') >= t.stones;
  const okCores  = t.cores ? _matCount('enhance_core') >= t.cores : true;
  const okGold   = (G.gold || 0) >= t.gold;
  const col = (okStones && okCores && okGold) ? '#88ddff' : '#aa8888';
  const brk = (typeof ENHANCE !== 'undefined' ? ENHANCE.breakFromLevel : 7);
  const risk = lvl >= brk ? ' <span style="color:#ff5544">💥เสี่ยงแตก</span>' : '';
  return `<span style="color:${col}">🔨 ตีบวก +${lvl}→+${lvl+1} · สำเร็จ ${Math.round(t.rate*100)}%</span>${risk}`;
}

// ---------- panel ----------
function openEnhancePanel(item) {
  if (!item || !item.uid) return;
  // resolve a live reference (currentTooltipItem may be a stale copy)
  const live = (G.inventory || []).find(i => i.uid === item.uid) || item;
  let ov = document.getElementById('enhance-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'enhance-overlay';
    ov.className = 'overlay';
    ov.onclick = (e) => { if (e.target === ov) ov.classList.remove('active'); };
    document.body.appendChild(ov);
  }
  _renderEnhancePanel(live);
  ov.classList.add('active');
}

function _renderEnhancePanel(item) {
  const ov = document.getElementById('enhance-overlay');
  if (!ov) return;
  const lvl = item.enhance || 0;
  const r = (typeof RARITIES !== 'undefined' && RARITIES[item.rarity]) || { color:'#aaa', label:item.rarity };
  const maxed = enhanceMaxed(item);
  const t = _enhTierFor(lvl);
  const statM = 1 + lvl * ((typeof ENHANCE !== 'undefined' ? ENHANCE.statPerLevel : 0.08));
  const nextM = 1 + (lvl + 1) * ((typeof ENHANCE !== 'undefined' ? ENHANCE.statPerLevel : 0.08));

  // current vs next stat preview
  const statRow = (label, base) => {
    if (!base) return '';
    const cur = Math.round(base * statM);
    const nxt = Math.round(base * nextM);
    return `<div style="display:flex;justify-content:space-between;font-size:.74rem;padding:.12rem 0">
      <span style="color:#99a">${label}</span>
      <span><b style="color:#cce">${cur}</b>${!maxed ? ` <span style="color:#66ff99">→ ${nxt}</span>` : ''}</span></div>`;
  };

  const stones = _matCount('enhance_stone');
  const cores  = _matCount('enhance_core');

  let costHtml = '';
  let canTry = false;
  if (maxed) {
    costHtml = `<div style="text-align:center;color:#ffcc44;font-weight:700;padding:.6rem">🏆 ตีบวกถึงระดับสูงสุดแล้ว (+${lvl})</div>`;
  } else if (t) {
    const okStones = stones >= t.stones;
    const okCores  = t.cores ? cores >= t.cores : true;
    const okGold   = (G.gold || 0) >= t.gold;
    canTry = okStones && okCores && okGold;
    const line = (icon, name, need, have) => `<span style="color:${have>=need?'#bbd':'#e88'}">${icon} ${name} ${have}/${need}</span>`;
    costHtml = `
      <div style="background:rgba(255,255,255,.04);border:1px solid #334;border-radius:8px;padding:.6rem;margin:.5rem 0">
        <div style="font-size:.76rem;color:#ccd;margin-bottom:.35rem;font-weight:700">ต้องใช้ (พยายาม 1 ครั้ง):</div>
        <div style="display:flex;flex-wrap:wrap;gap:.5rem;font-size:.76rem">
          ${line('🔨','หินตีบวก',t.stones,stones)}
          ${t.cores ? line('💠','แก่นเสริมพลัง',t.cores,cores) : ''}
          <span style="color:${okGold?'#ffd966':'#e88'}">💰 ${t.gold.toLocaleString()} ทอง</span>
        </div>
        <div style="font-size:.74rem;margin-top:.4rem;color:#88ddff">โอกาสสำเร็จ: <b>${Math.round(t.rate*100)}%</b></div>
        ${_enhRiskLine(lvl)}
      </div>`;
  }

  ov.innerHTML = `
    <div class="modal" onclick="event.stopPropagation()" style="max-width:380px;width:94%;text-align:left">
      <div style="text-align:center;margin-bottom:.4rem">
        <div style="font-size:2rem">${item.icon||'⚔'}</div>
        <div style="font-weight:800;color:${r.color}">${item.name} <span style="color:#ffcc44">+${lvl}</span></div>
        <div style="font-size:.7rem;color:#889">${r.label}</div>
      </div>
      <div style="background:rgba(0,0,0,.25);border-radius:8px;padding:.45rem .7rem;margin:.4rem 0">
        ${statRow('ATK', item.atk)}${statRow('DEF', item.def)}${statRow('HP', item.hp)}${statRow('CRIT %', item.crit)}
      </div>
      ${costHtml}
      <div id="enhance-feedback" style="min-height:1.1rem;text-align:center;font-size:.8rem;font-weight:700;margin:.2rem 0"></div>
      ${!maxed ? `<button id="btn-do-enhance" onclick="attemptEnhance('${item.uid}')" ${canTry?'':'disabled'}
        style="width:100%;padding:.6rem;border-radius:8px;border:none;font-weight:800;cursor:${canTry?'pointer':'not-allowed'};
        background:${canTry?'linear-gradient(90deg,#7a4a10,#caa030)':'#333'};color:${canTry?'#fff':'#777'}">🔨 ตีบวก</button>` : ''}
      <button class="btn-close-modal" onclick="document.getElementById('enhance-overlay').classList.remove('active')">ปิด</button>
    </div>`;
}

// ---------- attempt ----------
function attemptEnhance(uid) {
  const item = (G.inventory || []).find(i => String(i.uid) === String(uid));
  if (!item || enhanceMaxed(item)) return;
  const lvl = item.enhance || 0;
  const t = _enhTierFor(lvl);
  if (!t) return;

  const stones = _matCount('enhance_stone');
  const cores  = _matCount('enhance_core');
  if (stones < t.stones || (t.cores && cores < t.cores) || (G.gold || 0) < t.gold) return;

  // consume
  if (!G.materials) G.materials = {};
  G.materials.enhance_stone = stones - t.stones;
  if (t.cores) G.materials.enhance_core = cores - t.cores;
  G.gold -= t.gold;

  const fb = document.getElementById('enhance-feedback');
  const success = Math.random() < t.rate;
  const breakFrom = (typeof ENHANCE !== 'undefined' ? ENHANCE.breakFromLevel : 7);
  if (success) {
    item.enhance = lvl + 1;
    if (fb) { fb.style.color = '#66ff99'; fb.textContent = `✨ สำเร็จ! → +${item.enhance}`; }
    if (typeof logBattle === 'function')
      logBattle(`<span class="log-exp">🔨 ตีบวกสำเร็จ: ${item.icon||'⚔'} ${item.name} → +${item.enhance}</span>`);
  } else if (lvl >= breakFrom) {
    // แตก! — ลดระดับลง 1
    item.enhance = Math.max(0, lvl - 1);
    if (fb) { fb.style.color = '#ff4444'; fb.textContent = `💥 แตก! ลดระดับ → +${item.enhance}`; }
    if (typeof logBattle === 'function')
      logBattle(`<span class="log-sys" style="color:#ff5544">💥 ตีบวกแตก! ${item.name} ลดเหลือ +${item.enhance}</span>`);
  } else {
    if (fb) { fb.style.color = '#ff7766'; fb.textContent = `💢 ล้มเหลว! (ระดับคงเดิม +${lvl})`; }
    if (typeof logBattle === 'function')
      logBattle(`<span class="log-sys">🔨 ตีบวกล้มเหลว: ${item.name} (ระดับคงเดิม)</span>`);
  }

  if (typeof saveGame === 'function') saveGame();
  if (typeof updateTopBar === 'function') updateTopBar();
  if (typeof updateCharPanel === 'function') updateCharPanel();
  if (typeof renderInventory === 'function') renderInventory();
  // re-render panel to refresh costs/stats, keep feedback briefly
  const keep = fb ? fb.textContent : '';
  const keepCol = fb ? fb.style.color : '';
  _renderEnhancePanel(item);
  const fb2 = document.getElementById('enhance-feedback');
  if (fb2) { fb2.textContent = keep; fb2.style.color = keepCol; }
}
