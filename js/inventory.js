// ============================================================
// INVENTORY & CHEST — เปิดหีบ, กระเป๋า, สวมอาวุธ
// ============================================================

let invFilterSlot   = 'all';
let invFilterRarity = 'all';

// ---------- roll chest ----------

function rollChest(type) {
  const table = CHEST_TABLES[type] || CHEST_TABLES.common;
  const total = table.reduce((s, e) => s + e.w, 0);
  let roll    = Math.random() * total;
  let rarity  = 'common';
  for (const entry of table) { roll -= entry.w; if (roll <= 0) { rarity = entry.r; break; } }

  const slot = SLOT_SLOTS[Math.floor(Math.random() * SLOT_SLOTS.length)];
  const pool = (ALL_ITEMS_BY_SLOT[slot] || WEAPONS).filter(w => w.rarity === rarity);
  const base = pool.length ? pool[Math.floor(Math.random() * pool.length)] : WEAPONS[0];
  return { ...base };
}

// Returns a random item from the full pool (any slot/rarity) — used to fill gacha reel
function _randomReelItem() {
  const slot = SLOT_SLOTS[Math.floor(Math.random() * SLOT_SLOTS.length)];
  const arr  = ALL_ITEMS_BY_SLOT[slot] || WEAPONS;
  return arr[Math.floor(Math.random() * arr.length)];
}

let _gachaSpinning = false;

function openChest(type) {
  if (!(G.chests[type] > 0)) return;
  if (_gachaSpinning) return;
  if (G.inventory.length >= 50) {
    logBattle(`<span class="log-sys">⚠ กระเป๋าเต็ม! ขายของก่อนหรือทิ้งของออก</span>`);
    _showInvFullWarning();
    return;
  }
  G.chests[type]--;
  if (typeof rpgOnChestOpen === 'function') rpgOnChestOpen(type);
  const item     = rollChest(type);
  const instance = { ...item, uid: Date.now() + Math.random() };
  G.inventory.push(instance);

  if (['rare','epic','legend','ancient'].includes(item.rarity)) G.gotRareWeapon   = true;
  if (['legend','ancient'].includes(item.rarity))              G.gotLegendWeapon = true;

  currentChestItem = instance;
  playSound('chest');
  checkAchievements();
  saveGame();
  renderInventory();

  _startGachaSpin(item, type);
}

// ── Gacha reel spin ──────────────────────────────────────────
const CARD_W = 88; // card width + gap in px

function _makeCard(item) {
  const div = document.createElement('div');
  div.className = `gacha-card ${item.rarity}`;
  div.innerHTML = `<span>${item.icon || '⚔'}</span><span class="gacha-card-label">${item.name}</span>`;
  return div;
}

function _startGachaSpin(wonItem, chestType) {
  _gachaSpinning = true;

  const labels = { common:'หีบธรรมดา', uncommon:'หีบพิเศษ', rare:'หีบหายาก', boss:'หีบบอส' };
  const overlay = document.getElementById('chest-overlay');
  const reel    = document.getElementById('gacha-reel');
  const result  = document.getElementById('gacha-result');

  document.getElementById('gacha-title').textContent = `เปิด${labels[chestType] || 'หีบสมบัติ'}`;
  result.style.display = 'none';
  reel.innerHTML = '';
  reel.style.transform = 'translateX(0)';

  // Build reel: 40 random filler cards + winning card near end
  const TOTAL   = 44;
  const WIN_IDX = TOTAL - 5; // card that stops in the window center
  const cards   = [];
  for (let i = 0; i < TOTAL; i++) {
    const item = (i === WIN_IDX) ? wonItem : _randomReelItem();
    const card = _makeCard(item);
    reel.appendChild(card);
    cards.push(card);
  }

  // window is 100% wide; center pointer is at 50%
  // we want WIN_IDX card to land at center
  const windowEl   = reel.parentElement;
  const windowW    = windowEl.offsetWidth || 400;
  const centerX    = windowW / 2 - CARD_W / 2;
  const finalTX    = -(WIN_IDX * CARD_W - centerX);

  overlay.classList.add('active');

  // Phase 1: shoot fast, then ease to stop (CSS transition + JS)
  const SPIN_MS = 3200;

  // Start far left, then animate to final
  const startTX = 0;
  reel.style.transition = 'none';
  reel.style.transform  = `translateX(${startTX}px)`;

  // tick: use two-phase ease-out via Web Animations API
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      reel.style.transition = `transform ${SPIN_MS}ms cubic-bezier(0.25, 0.1, 0.1, 1)`;
      reel.style.transform  = `translateX(${finalTX}px)`;
    });
  });

  setTimeout(() => {
    // bounce land effect on winning card
    cards[WIN_IDX].classList.add('landing');
    setTimeout(() => _showGachaResult(wonItem), 420);
  }, SPIN_MS);
}

function _showGachaResult(item) {
  const r      = RARITIES[item.rarity] || RARITIES.common;
  const result = document.getElementById('gacha-result');
  const flash  = document.getElementById('gacha-result-flash');

  flash.style.background = r.color;
  document.getElementById('chest-item-icon').textContent  = item.icon || '⚔';
  document.getElementById('chest-item-icon').style.filter = `drop-shadow(0 0 18px ${r.color})`;
  document.getElementById('chest-item-name').textContent  = item.name;
  document.getElementById('chest-item-name').className    = `chest-result-name rarity-glow-${item.rarity}`;
  document.getElementById('chest-item-rarity').innerHTML  = `<span class="rarity-glow-${item.rarity}">${r.label}</span>`;
  document.getElementById('chest-item-stats').textContent = buildStatLine(item);
  document.getElementById('chest-item-effect').textContent= item.effect ? `✨ ${item.effect}` : '';

  result.style.display = '';
  _gachaSpinning = false;

  const equipBtn = document.querySelector('.btn-equip-modal');
  if (equipBtn) {
    if (!canEquipItem(item)) {
      const cls = CLASSES.find(c => c.id === item.requiredClass);
      equipBtn.disabled = true;
      equipBtn.style.opacity = '0.4';
      equipBtn.style.cursor = 'not-allowed';
      equipBtn.title = `ต้องการคลาส: ${cls?.name || item.requiredClass}`;
    } else {
      equipBtn.disabled = false;
      equipBtn.style.opacity = '1';
      equipBtn.style.cursor = 'pointer';
      equipBtn.title = '';
    }
  }
}

function equipFromChest() {
  if (!currentChestItem) return;
  if (!canEquipItem(currentChestItem)) {
    const cls = CLASSES.find(c => c.id === currentChestItem.requiredClass);
    logBattle(`<span class="log-sys">🔒 ไอเทมนี้ต้องการคลาส: ${cls?.name || currentChestItem.requiredClass}</span>`);
    return;
  }
  equipItemToSlot(currentChestItem);
  closeChestModal();
}

function closeChestModal() {
  if (_gachaSpinning) return; // don't close mid-spin
  document.getElementById('chest-overlay').classList.remove('active');
  currentChestItem = null;
}

// ── Drop-rate tooltip ────────────────────────────────────────

let _dtHideTimer = null;

function showDropTooltip(el, lines, note) {
  clearTimeout(_dtHideTimer);
  const tt = document.getElementById('drop-tooltip');
  let html = `<div class="drop-tooltip-title">อัตราดรอป</div>`;
  lines.forEach(l => {
    html += `<div class="drop-tooltip-row">
      <span class="drop-tooltip-rarity" style="color:${l.color}">${l.label}</span>
      <span class="drop-tooltip-pct">${l.pct}</span>
    </div>`;
  });
  if (note) html += `<div class="drop-tooltip-note">${note}</div>`;
  tt.innerHTML = html;
  tt.style.display = 'block';
  _positionDropTooltip(el, tt);
}

function _positionDropTooltip(anchor, tt) {
  const rect = anchor.getBoundingClientRect();
  const ttW  = 230, ttH = tt.offsetHeight || 160;
  let top  = rect.top - ttH - 8;
  let left = rect.left + rect.width / 2 - ttW / 2;
  if (top < 4) top = rect.bottom + 8;
  left = Math.max(4, Math.min(left, window.innerWidth - ttW - 4));
  tt.style.top  = top + 'px';
  tt.style.left = left + 'px';
}

function hideDropTooltip() {
  _dtHideTimer = setTimeout(() => {
    const tt = document.getElementById('drop-tooltip');
    if (tt) tt.style.display = 'none';
  }, 120);
}

function _chestDropLines(type) {
  const table = CHEST_TABLES[type] || CHEST_TABLES.common;
  const total = table.reduce((s, e) => s + e.w, 0);
  return table.map(e => {
    const r = RARITIES[e.r] || { label: e.r, color: '#aaa' };
    return { label: r.label, color: r.color, pct: `${Math.round(e.w / total * 100)}%` };
  });
}

// ---------- inventory full warning ----------

function _showInvFullWarning() {
  let box = document.getElementById('inv-full-warning');
  if (!box) {
    box = document.createElement('div');
    box.id = 'inv-full-warning';
    box.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;background:#1a0a00;border:2px solid #ff8800;border-radius:12px;padding:1.5rem 2rem;text-align:center;box-shadow:0 0 40px #ff880066;font-family:Sarabun,sans-serif;max-width:320px;width:90%';
    box.innerHTML = `<div style="font-size:1.8rem;margin-bottom:.4rem">⚠️</div>
      <div style="color:#ff8800;font-size:1rem;font-weight:700;margin-bottom:.5rem">กระเป๋าเต็มแล้ว! (50/50)</div>
      <div style="color:#aaa;font-size:.85rem;margin-bottom:1rem">ขายหรือทิ้งของก่อนเปิดหีบได้</div>
      <div style="display:flex;gap:.6rem;justify-content:center">
        <button onclick="sellLowestRarity();document.getElementById('inv-full-warning').remove()" style="background:#3a1a00;border:1px solid #ff8800;color:#ff8800;padding:.4rem .9rem;border-radius:6px;cursor:pointer;font-size:.85rem">⚡ ขาย Common อัตโนมัติ</button>
        <button onclick="document.getElementById('inv-full-warning').remove()" style="background:#1a1a2a;border:1px solid #445;color:#888;padding:.4rem .9rem;border-radius:6px;cursor:pointer;font-size:.85rem">ปิด</button>
      </div>`;
    document.body.appendChild(box);
    setTimeout(() => { if (box.parentNode) box.remove(); }, 5000);
  }
}

function sellLowestRarity() {
  const order = ['common','uncommon','rare','epic','legend','ancient'];
  const toSell = G.inventory.filter(i => !isItemEquipped(i.uid) && i.rarity === 'common');
  if (!toSell.length) {
    logBattle(`<span class="log-sys">ไม่มีของ common ที่จะขาย</span>`);
    return;
  }
  let gold = 0;
  toSell.forEach(i => { gold += 5; G.inventory = G.inventory.filter(x => x.uid !== i.uid); });
  G.gold += gold;
  logBattle(`<span class="log-exp">💰 ขาย Common ${toSell.length} ชิ้น +${gold} ทอง</span>`);
  updateTopBar(); saveGame(); renderInventory();
}

// ---------- inventory render ----------

function renderInventory() {
  const COLS = 4, ROWS = 8, TOTAL = COLS * ROWS; // 32 slots

  // build chest entries
  const chestLabels = { common:'ธรรมดา', uncommon:'พิเศษ', rare:'หายาก', boss:'บอส' };
  const chestIcons  = { common:'📦', uncommon:'🎁', rare:'💎', boss:'👑' };
  const chestColors = { common:'var(--common)', uncommon:'var(--uncommon)', rare:'var(--rare)', boss:'var(--legend)' };
  let chestSlots = [];
  ['common','uncommon','rare','boss'].forEach(t => {
    const count = G.chests[t] || 0;
    for (let i = 0; i < count; i++) chestSlots.push({ _chest: t });
  });

  // build item entries (apply filters)
  let items = [...G.inventory];
  if (invFilterSlot !== 'all') {
    if (invFilterSlot === 'weapon')    items = items.filter(i => i.slot === 'weapon' || !i.slot);
    else if (invFilterSlot === 'armor-all') items = items.filter(i => i.slot && i.slot !== 'weapon');
    else if (invFilterSlot === 'myclass')   items = items.filter(i => canEquipItem(i));
    else if (invFilterSlot === 'sellable')  items = items.filter(i => !isItemEquipped(i.uid));
    else items = items.filter(i => i.slot === invFilterSlot);
  }
  if (invFilterRarity !== 'all') {
    if (invFilterRarity === 'epic+') items = items.filter(i => ['epic','legend','ancient'].includes(i.rarity));
    else items = items.filter(i => i.rarity === invFilterRarity);
  }

  // when filtering items, hide chests to keep grid clean; show chests only on 'all'
  const showChests = invFilterSlot === 'all' && invFilterRarity === 'all';
  const slots = showChests ? [...chestSlots, ...items] : [...items];

  // render filter bar
  renderFilterBar();

  // render grid
  const grid = document.getElementById('inv-grid');
  grid.innerHTML = '';

  for (let i = 0; i < TOTAL; i++) {
    const cell = document.createElement('div');
    const entry = slots[i];

    if (!entry) {
      cell.className = 'inv-cell inv-cell-empty';
      grid.appendChild(cell);
      continue;
    }

    if (entry._chest) {
      const t = entry._chest;
      cell.className = `inv-cell inv-cell-chest chest-${t}`;
      cell.style.borderColor = chestColors[t];
      cell.innerHTML = `<span class="inv-cell-icon">${chestIcons[t]}</span><span class="inv-cell-name">${chestLabels[t]}</span>`;
      cell.onclick = () => openChest(t);
      cell.onmouseenter = () => showDropTooltip(cell, _chestDropLines(t), 'สุ่ม 1 ใน 6 ช่องอุปกรณ์');
      cell.onmouseleave = () => hideDropTooltip();
    } else {
      const item    = entry;
      const equipped = isItemEquipped(item.uid);
      const canEquip = canEquipItem(item);
      if (!item.slot) item.slot = 'weapon';

      let cls = `inv-cell inv-cell-item rarity-${item.rarity}`;
      if (equipped)  cls += ' equipped';
      if (!canEquip) cls += ' cannot-equip';
      cell.className = cls;

      const lockIcon = !canEquip ? '<span class="inv-cell-lock">🔒</span>' : '';
      const eqBadge  = equipped  ? '<span class="eq-badge">E</span>' : '';
      cell.innerHTML = `<span class="inv-cell-icon">${item.icon||'⚔'}</span><span class="inv-cell-name">${item.name.slice(0,7)}${item.name.length>7?'…':''}</span>${lockIcon}${eqBadge}`;
      cell.onclick   = () => showTooltip(item);
      if (!equipped && canEquip) {
        cell.onmouseenter = (e) => _showCompareTooltip(e, item);
        cell.onmouseleave = () => _hideCompareTooltip();
      }
    }
    grid.appendChild(cell);
  }

  // update counts in header
  const totalChests = ['common','uncommon','rare','boss'].reduce((s,t) => s + (G.chests[t]||0), 0);
  const chestDisp = document.getElementById('chest-count-display');
  if (chestDisp) chestDisp.textContent = totalChests;

  const invLen = G.inventory.length;
  const invCountEl = document.getElementById('inv-count');
  if (invCountEl) {
    invCountEl.textContent = invLen;
    invCountEl.style.color = invLen >= 45 ? 'var(--red)' : invLen >= 40 ? 'var(--orange)' : '';
  }
  const badge = document.getElementById('inv-full-badge');
  if (badge) badge.style.display = invLen >= 40 ? 'inline' : 'none';
}

// ---------- item compare tooltip ----------

let _compareEl = null;

function _showCompareTooltip(e, item) {
  _hideCompareTooltip();
  const equippedId = G.equippedSlots[item.slot || 'weapon'];
  const equippedItem = equippedId ? G.inventory.find(i => i.uid === equippedId) : null;
  if (!equippedItem) return;

  const statKeys = ['atk','def','hp','crit','speed'];
  let rows = '';
  statKeys.forEach(k => {
    const a = item[k] || 0, b = equippedItem[k] || 0;
    const diff = a - b;
    if (diff === 0 && a === 0) return;
    const col = diff > 0 ? '#44ff88' : diff < 0 ? '#ff4444' : '#aaa';
    const sign = diff > 0 ? '+' : '';
    rows += `<div style="display:flex;justify-content:space-between;gap:8px;font-size:.75rem;padding:1px 0">
      <span style="color:#aaa">${k.toUpperCase()}</span>
      <span style="color:${col}">${sign}${diff}</span>
    </div>`;
  });
  if (!rows) return;

  const box = document.createElement('div');
  box.id = 'item-compare-tt';
  box.style.cssText = 'position:fixed;z-index:9999;background:#12121a;border:1px solid #3a3a60;border-radius:8px;padding:.6rem .8rem;pointer-events:none;box-shadow:0 4px 20px rgba(0,0,0,.7);min-width:130px;font-family:Sarabun,sans-serif';
  box.innerHTML = `<div style="font-size:.72rem;color:#ffd700;margin-bottom:.3rem;font-family:'Chakra Petch',sans-serif">เทียบกับที่สวมอยู่</div>${rows}`;
  document.body.appendChild(box);
  _compareEl = box;
  _positionCompareTooltip(e.currentTarget, box);
}

function _positionCompareTooltip(anchor, box) {
  const rect = anchor.getBoundingClientRect();
  const bH = box.offsetHeight || 120;
  let top  = rect.top - bH - 6;
  let left = rect.left;
  if (top < 4) top = rect.bottom + 6;
  left = Math.max(4, Math.min(left, window.innerWidth - 145));
  box.style.top  = top + 'px';
  box.style.left = left + 'px';
}

function _hideCompareTooltip() {
  if (_compareEl) { _compareEl.remove(); _compareEl = null; }
}

function renderFilterBar() {
  const bar = document.getElementById('inv-filter-bar');
  if (!bar) return;

  const slotFilters = [
    {key:'all',    label:'ทั้งหมด'},
    {key:'weapon', label:'🗡 อาวุธ'},
    {key:'helmet', label:'🪖 หมวก'},
    {key:'armor',  label:'⚔ เกราะ'},
    {key:'gloves', label:'🧤 ถุงมือ'},
    {key:'pants',  label:'👖 กางเกง'},
    {key:'boots',  label:'👢 รองเท้า'},
    {key:'myclass',label:'⭐ คลาสฉัน'},
    {key:'sellable',label:'💰 ขายได้'},
  ];
  const rarFilters = [
    {key:'all',    label:'ทุก Rarity'},
    {key:'common', label:'ธรรมดา'},
    {key:'uncommon',label:'พิเศษ'},
    {key:'rare',   label:'หายาก'},
    {key:'epic+',  label:'มหากาพย์+'},
  ];

  bar.innerHTML = `
    <div class="inv-filter-row">
      ${slotFilters.map(f=>`<button class="inv-filter-btn${invFilterSlot===f.key?' active':''}" onclick="setInvFilter('slot','${f.key}')">${f.label}</button>`).join('')}
    </div>
    <div class="inv-filter-row">
      ${rarFilters.map(f=>`<button class="inv-filter-btn${invFilterRarity===f.key?' active':''}" onclick="setInvFilter('rarity','${f.key}')">${f.label}</button>`).join('')}
    </div>`;
}

function setInvFilter(type, val) {
  if (type === 'slot')   invFilterSlot   = val;
  if (type === 'rarity') invFilterRarity = val;
  renderInventory();
}

// ---------- tooltip ----------

function showTooltip(item) {
  currentTooltipItem = item;
  const r = RARITIES[item.rarity] || RARITIES.common;
  const slotMeta = SLOT_META[item.slot] || {label:'อาวุธ',icon:'🗡'};
  const canEquip = canEquipItem(item);
  const equipped = isItemEquipped(item.uid);
  // backward compat: อาวุธเก่าไม่มี slot
  if (!item.slot) item.slot = 'weapon';

  document.getElementById('tt-name').textContent    = `${item.icon||'⚔'} ${item.name}`;
  document.getElementById('tt-name').className      = `tooltip-name rarity-glow-${item.rarity}`;
  document.getElementById('tt-rarity').innerHTML    = `<span class="rarity-glow-${item.rarity}">${r.label}</span> · <span style="color:var(--text2)">${slotMeta.label}</span>`;
  document.getElementById('tt-stats').innerHTML     = buildStatLine(item) || '-';
  document.getElementById('tt-effect').textContent  = item.effect ? `✨ ${item.effect}` : 'ไม่มีเอฟเฟกต์พิเศษ';

  const classReq = document.getElementById('tt-class-req');
  if (classReq) {
    if (!canEquip && item.requiredClass) {
      classReq.textContent = `🔒 ต้องการคลาส: ${CLASSES.find(c=>c.id===item.requiredClass)?.name||item.requiredClass}`;
      classReq.style.color = 'var(--red)';
    } else if (item.requiredClass) {
      classReq.textContent = `✅ คลาส: ${CLASSES.find(c=>c.id===item.requiredClass)?.name||item.requiredClass}`;
      classReq.style.color = 'var(--green)';
    } else {
      classReq.textContent = '👥 ใส่ได้ทุกคลาส';
      classReq.style.color = 'var(--text2)';
    }
  }

  const equipBtn = document.querySelector('.btn-tooltip-equip');
  if (equipBtn) {
    if (!canEquip) {
      equipBtn.disabled = true;
      equipBtn.style.opacity = '0.4';
      equipBtn.title = `ต้องการคลาส: ${CLASSES.find(c=>c.id===item.requiredClass)?.name||item.requiredClass}`;
    } else if (equipped) {
      equipBtn.disabled = false;
      equipBtn.style.opacity = '1';
      equipBtn.textContent = '🔄 ถอด';
      equipBtn.onclick = () => { unequipSlot(item.slot); closeTooltip(); };
    } else {
      equipBtn.disabled = false;
      equipBtn.style.opacity = '1';
      equipBtn.textContent = '⚔ สวมใส่';
      equipBtn.onclick = () => equipItem(currentTooltipItem);
    }
  }

  document.getElementById('tooltip-overlay').classList.add('active');
}

function equipItem(item) {
  if (!item) return;
  if (!canEquipItem(item)) {
    logBattle(`<span class="log-sys">🔒 ต้องการคลาส: ${CLASSES.find(c=>c.id===item.requiredClass)?.name||item.requiredClass}</span>`);
    return;
  }
  equipItemToSlot(item);
  // backward compat
  if (item.slot === 'weapon' || !item.slot) G.equippedWeaponId = item.uid;
  closeTooltip();
}

function discardItem(item) {
  if (!item) return;
  if (isItemEquipped(item.uid)) {
    unequipSlot(item.slot || 'weapon');
  }
  G.inventory = G.inventory.filter(i => i.uid !== item.uid);
  closeTooltip();
  renderInventory(); updateTopBar(); updateCharPanel(); renderEquipSlots(); saveGame();
}

function showTooltipByUid(uid) {
  const item = G.inventory.find(i => String(i.uid) === String(uid));
  if (item) showTooltip(item);
}

function closeTooltip() {
  document.getElementById('tooltip-overlay').classList.remove('active');
  currentTooltipItem = null;
  // reset equip button
  const btn = document.querySelector('.btn-tooltip-equip');
  if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.textContent = '⚔ สวมใส่'; btn.onclick = () => equipItem(currentTooltipItem); }
}
