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
  const safe = (typeof ENHANCE !== 'undefined' ? ENHANCE.safeUpTo : 4);
  const del  = (typeof ENHANCE !== 'undefined' ? ENHANCE.delevelFromLevel : 5);
  const des  = (typeof ENHANCE !== 'undefined' ? ENHANCE.destroyFromLevel : 10);
  if (lvl < safe || lvl < del) return `<div style="font-size:.72rem;color:#66ff99;margin-top:.2rem">🛡️ ปลอดภัย — ไม่มีโอกาสพลาด</div>`;
  if (lvl < des)               return `<div style="font-size:.72rem;color:#ffaa44;margin-top:.2rem">⚠ ล้มเหลว = ลดระดับลง 1</div>`;
  return `<div style="font-size:.72rem;color:#ff3322;margin-top:.2rem;font-weight:700">💥 อันตราย! ล้มเหลว = ของหายทั้งชิ้น!</div>`;
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
  const del = (typeof ENHANCE !== 'undefined' ? ENHANCE.delevelFromLevel : 5);
  const des = (typeof ENHANCE !== 'undefined' ? ENHANCE.destroyFromLevel : 10);
  let risk = '';
  if (lvl >= des)      risk = ' <span style="color:#ff3322;font-weight:700">💥ของหาย</span>';
  else if (lvl >= del) risk = ' <span style="color:#ffaa44">⚠ลดระดับ</span>';
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

  // เตือนก่อนถ้าระดับนี้ "ล้มเหลว = ของหาย"
  const destroyFromLvl = (typeof ENHANCE !== 'undefined' ? ENHANCE.destroyFromLevel : 10);
  if (lvl >= destroyFromLvl) {
    const ok = confirm(`⚠ อันตราย!\n\nตีบวก +${lvl}→+${lvl+1} ถ้าล้มเหลว "${item.name}" จะหายไปถาวร!\nโอกาสสำเร็จ ${Math.round(t.rate*100)}%\n\nยืนยันที่จะเสี่ยง?`);
    if (!ok) return;
  }

  // consume
  if (!G.materials) G.materials = {};
  G.materials.enhance_stone = stones - t.stones;
  if (t.cores) G.materials.enhance_core = cores - t.cores;
  G.gold -= t.gold;

  const fb = document.getElementById('enhance-feedback');
  const success = Math.random() < t.rate;
  const delevelFrom = (typeof ENHANCE !== 'undefined' ? ENHANCE.delevelFromLevel : 5);
  const destroyFrom = (typeof ENHANCE !== 'undefined' ? ENHANCE.destroyFromLevel : 10);
  let destroyed = false;

  if (success) {
    item.enhance = lvl + 1;
    if (fb) { fb.style.color = '#66ff99'; fb.textContent = `✨ สำเร็จ! → +${item.enhance}`; }
    if (typeof logBattle === 'function')
      logBattle(`<span class="log-exp">🔨 ตีบวกสำเร็จ: ${item.icon||'⚔'} ${item.name} → +${item.enhance}</span>`);
  } else if (lvl >= destroyFrom) {
    // แตกหาย! — ของหายทั้งชิ้น
    destroyed = true;
    if (isItemEquipped && isItemEquipped(item.uid) && typeof unequipSlot === 'function') unequipSlot(item.slot);
    G.inventory = (G.inventory || []).filter(i => i.uid !== item.uid);
    if (typeof logBattle === 'function')
      logBattle(`<span class="log-sys" style="color:#ff3322">💥💥 ตีบวกแตก! ${item.icon||'⚔'} ${item.name} +${lvl} หายไปแล้ว!</span>`);
  } else if (lvl >= delevelFrom) {
    // ล้มเหลว — ลดระดับลง 1
    item.enhance = Math.max(0, lvl - 1);
    if (fb) { fb.style.color = '#ff7744'; fb.textContent = `💢 ล้มเหลว! ลดระดับ → +${item.enhance}`; }
    if (typeof logBattle === 'function')
      logBattle(`<span class="log-sys" style="color:#ff8844">💢 ตีบวกล้มเหลว: ${item.name} ลดเหลือ +${item.enhance}</span>`);
  } else {
    if (fb) { fb.style.color = '#ff7766'; fb.textContent = `💢 ล้มเหลว! (ระดับคงเดิม +${lvl})`; }
    if (typeof logBattle === 'function')
      logBattle(`<span class="log-sys">🔨 ตีบวกล้มเหลว: ${item.name} (ระดับคงเดิม)</span>`);
  }

  if (typeof saveGame === 'function') saveGame();
  if (typeof updateTopBar === 'function') updateTopBar();
  if (typeof updateCharPanel === 'function') updateCharPanel();
  if (typeof renderInventory === 'function') renderInventory();

  if (destroyed) {
    // ของหายแล้ว — ปิดหน้าตีบวก แสดงข้อความ
    const ov = document.getElementById('enhance-overlay');
    if (ov) {
      ov.innerHTML = `<div class="modal" onclick="event.stopPropagation()" style="max-width:340px;width:92%;text-align:center">
        <div style="font-size:2.4rem">💥</div>
        <div style="color:#ff4433;font-weight:800;margin:.4rem 0">อุปกรณ์แตกหาย!</div>
        <div style="font-size:.8rem;color:#caa">${item.icon||'⚔'} ${item.name} +${lvl} หายไปจากการตีบวกที่ล้มเหลว</div>
        <button class="btn-close-modal" onclick="document.getElementById('enhance-overlay').classList.remove('active')">ปิด</button>
      </div>`;
    }
    return;
  }

  // re-render panel to refresh costs/stats, keep feedback briefly
  const keep = fb ? fb.textContent : '';
  const keepCol = fb ? fb.style.color : '';
  _renderEnhancePanel(item);
  const fb2 = document.getElementById('enhance-feedback');
  if (fb2) { fb2.textContent = keep; fb2.style.color = keepCol; }
}
