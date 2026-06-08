// ============================================================
// SHOP SYSTEM — ร้านค้า ซื้อ/ขาย
// ============================================================

// ---------- helpers ----------

function canEquipItem(item) {
  if (!item.requiredClass) return true;
  return item.requiredClass === G.classId;
}

function getEquippedStatBonus() {
  let bonus = { atk:0, def:0, hp:0, crit:0, speed:0, attackSpeed:0, expMult:1, healPerTurn:0 };
  if (!G.equippedSlots) return bonus;
  SLOT_SLOTS.forEach(slot => {
    const uid = G.equippedSlots[slot];
    if (!uid) return;
    const item = G.inventory.find(i => i.uid === uid);
    if (!item) return;
    // skip items that don't belong to current class (heal save-game corruption)
    if (!canEquipItem(item)) {
      G.equippedSlots[slot] = null;
      if (slot === 'weapon') G.equippedWeaponId = null;
      return;
    }
    if (item.atk)         bonus.atk         += item.atk;
    if (item.def)         bonus.def         += item.def;
    if (item.hp)          bonus.hp          += item.hp;
    if (item.crit)        bonus.crit        += item.crit;
    if (item.speed)       bonus.speed       += item.speed;
    if (item.attackSpeed) bonus.attackSpeed += item.attackSpeed;
    if (item.effect) {
      const expM = item.effect.match(/EXP\+(\d+)%/);
      if (expM) bonus.expMult += parseInt(expM[1]) / 100;
      const healM = item.effect.match(/ฟื้น HP\+(\d+)/);
      if (healM) bonus.healPerTurn += parseInt(healM[1]);
    }
  });
  return bonus;
}

function isItemEquipped(uid) {
  if (!uid) return false;
  if (uid === G.equippedWeaponId) return true;
  if (!G.equippedSlots) return false;
  return Object.values(G.equippedSlots).includes(uid);
}

function equipItemToSlot(item) {
  if (!item || !item.slot) return;
  // hard-block: ห้ามใส่ของคลาสอื่น
  if (!canEquipItem(item)) {
    const reqName = CLASSES.find(c => c.id === item.requiredClass)?.name || item.requiredClass;
    logBattle(`<span class="log-sys">🔒 "${item.name}" ต้องการคลาส ${reqName}!</span>`);
    return;
  }
  if (!G.equippedSlots) G.equippedSlots = {};

  // unequip old item in same slot first
  const oldUid = G.equippedSlots[item.slot];
  if (oldUid && oldUid !== item.uid) {
    G.equippedSlots[item.slot] = null;
    if (item.slot === 'weapon') G.equippedWeaponId = null;
  }

  if (item.slot === 'weapon') G.equippedWeaponId = item.uid;
  G.equippedSlots[item.slot] = item.uid;

  updateTopBar();
  updateCharPanel();
  renderInventory();
  renderEquipSlots();
  saveGame();
  if (item.attackSpeed && typeof restartAutoWithNewSpeed === 'function') restartAutoWithNewSpeed();
  logBattle(`<span class="log-sys">✅ สวมใส่ ${item.icon||''} ${item.name}${item.attackSpeed ? ` ⚡-${Math.round(item.attackSpeed*100)}%` : ''}!</span>`);
}

function unequipSlot(slot) {
  if (!G.equippedSlots) return;
  const uid = G.equippedSlots[slot];
  if (!uid) return;
  const item = G.inventory.find(i => i.uid === uid);
  G.equippedSlots[slot] = null;
  if (slot === 'weapon') G.equippedWeaponId = null;
  updateTopBar();
  updateCharPanel();
  renderInventory();
  renderEquipSlots();
  saveGame();
  if (item && item.attackSpeed && typeof restartAutoWithNewSpeed === 'function') restartAutoWithNewSpeed();
}

// ---------- generate shop stock ----------

function generateShopStock() {
  const today = new Date().toDateString();
  if (G.shopStockDate === today && G.shopStock && G.shopStock.length > 0) return;

  const rarityPool = ['common','uncommon','rare','epic','legend'];
  const weights    = [30, 35, 25, 8, 2];
  const allPools   = Object.values(ALL_ITEMS_BY_SLOT).flat();
  const stock = [];

  function rollRarity() {
    const total = weights.reduce((a,b)=>a+b,0);
    let r = Math.random() * total;
    for (let i=0; i<rarityPool.length; i++) { r -= weights[i]; if (r <= 0) return rarityPool[i]; }
    return 'common';
  }

  while (stock.length < 6) {
    const rar  = rollRarity();
    const pool = allPools.filter(i => i.rarity === rar);
    if (!pool.length) continue;
    const base = pool[Math.floor(Math.random() * pool.length)];
    const entry = { ...base, shopUid: `shop_${Date.now()}_${Math.random()}`, price: SHOP_BUY_PRICE[rar] || 50 };
    if (!stock.find(s => s.id === entry.id)) stock.push(entry);
  }

  G.shopStock = stock;
  const isNewDay = G.shopStockDate !== today;
  G.shopStockDate = today;
  if (isNewDay) G.shopFreeRefreshUsed = false;
  saveGame();
}

function refreshShopStock() {
  const today = new Date().toDateString();
  G.shopStock = null;
  G.shopStockDate = today; // เก็บวันที่ไว้กัน refresh ซ้ำในวันเดียวกัน
  G.shopFreeRefreshUsed = true;
  generateShopStock();
  renderShopBuy();
  logBattle('<span class="log-sys">🔄 รีเฟรชร้านค้าแล้ว!</span>');
}

// ---------- open/close shop ----------

function openShop() {
  generateShopStock();
  document.getElementById('shop-overlay').classList.add('active');
  const goldEl = document.getElementById('shop-gold-display');
  if (goldEl) goldEl.textContent = G.gold;
  switchShopTab('sell');
}

function closeShop() {
  document.getElementById('shop-overlay').classList.remove('active');
}

function switchShopTab(tab) {
  document.querySelectorAll('.shop-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.getElementById('shop-sell-panel').style.display = tab === 'sell' ? 'block' : 'none';
  document.getElementById('shop-buy-panel').style.display  = tab === 'buy'  ? 'block' : 'none';
  if (tab === 'sell') renderShopSell();
  else                renderShopBuy();
}

// ---------- render sell tab ----------

function renderShopSell() {
  const panel = document.getElementById('shop-sell-list');
  const sellable = G.inventory.filter(i => !isItemEquipped(i.uid));

  if (!sellable.length) {
    panel.innerHTML = '<div style="color:var(--text2);text-align:center;padding:1rem">ไม่มีของที่จะขาย</div>';
    return;
  }

  panel.innerHTML = sellable.map(item => {
    const r    = RARITIES[item.rarity] || RARITIES.common;
    const price = SHOP_SELL_PRICE[item.rarity] || 10;
    const statLine = buildStatLine(item);
    const classLock = (item.requiredClass && item.requiredClass !== G.classId)
      ? `<span style="color:var(--red);font-size:.7rem">🔒 ${CLASSES.find(c=>c.id===item.requiredClass)?.name||item.requiredClass}</span>` : '';
    return `<div class="shop-sell-row">
      <span style="color:${r.color};font-size:1.1rem">${item.icon||'⚔'}</span>
      <div class="shop-item-info">
        <div class="shop-item-name rarity-glow-${item.rarity}">${item.name}</div>
        <div style="font-size:.72rem;color:var(--text2)">${statLine} ${classLock}</div>
      </div>
      <span style="color:var(--gold);font-size:.82rem">💰${price}</span>
      <button class="btn-shop-sell" onclick="sellItemByUid('${String(item.uid)}')">ขาย</button>
    </div>`;
  }).join('');
}

function buildStatLine(item) {
  const parts = [];
  if (item.atk)         parts.push(`ATK+${item.atk}`);
  if (item.def)         parts.push(`DEF+${item.def}`);
  if (item.hp)          parts.push(`HP+${item.hp}`);
  if (item.crit)        parts.push(`CRIT+${item.crit}%`);
  if (item.attackSpeed) parts.push(`⚡ Speed-${Math.round(item.attackSpeed*100)}%`);
  if (item.speed)       parts.push(`SPD+${item.speed}`);
  if (item.effect)      parts.push(item.effect);
  return parts.join(' | ') || '-';
}

// ---------- sell actions ----------

function sellItemByUid(uid) {
  sellItem(G.inventory.find(i => String(i.uid) === String(uid)));
}

function sellItem(item) {
  if (!item) return;
  const uid = item.uid;
  if (isItemEquipped(uid)) { logBattle('<span class="log-sys">⚠ ถอดอุปกรณ์ก่อนขาย!</span>'); return; }
  const price = SHOP_SELL_PRICE[item.rarity] || 10;
  if (!confirm(`ขาย "${item.name}" ในราคา ${price} ทอง?`)) return;
  G.inventory = G.inventory.filter(i => i.uid !== uid);
  G.gold += price;
  updateTopBar();
  renderInventory();
  renderShopSell();
  saveGame();
  logBattle(`<span class="log-exp">💰 ขาย ${item.name} +${price} ทอง</span>`);
}

function sellNonClassItems() {
  const items = G.inventory.filter(i => !isItemEquipped(i.uid) && i.requiredClass && i.requiredClass !== G.classId);
  if (!items.length) { alert('ไม่มีไอเทมคลาสอื่น'); return; }
  const total = items.reduce((s,i) => s + (SHOP_SELL_PRICE[i.rarity]||10), 0);
  if (!confirm(`ขาย ${items.length} ชิ้น (ไอเทมคลาสอื่น) รวม ${total} ทอง?`)) return;
  items.forEach(i => { G.inventory = G.inventory.filter(x => x.uid !== i.uid); });
  G.gold += total;
  updateTopBar();
  renderInventory();
  renderShopSell();
  saveGame();
  logBattle(`<span class="log-exp">💰 ขายของคลาสอื่น ${items.length} ชิ้น +${total} ทอง</span>`);
}

function sellAllExceptEquipped() {
  const items = G.inventory.filter(i => !isItemEquipped(i.uid));
  if (!items.length) { alert('ไม่มีของที่จะขาย'); return; }
  const total = items.reduce((s,i) => s + (SHOP_SELL_PRICE[i.rarity]||10), 0);
  if (!confirm(`ขายทั้งหมด ${items.length} ชิ้น (ยกเว้นที่สวมอยู่) รวม ${total} ทอง?`)) return;
  items.forEach(i => { G.inventory = G.inventory.filter(x => x.uid !== i.uid); });
  G.gold += total;
  updateTopBar();
  renderInventory();
  renderShopSell();
  saveGame();
  logBattle(`<span class="log-exp">💰 ขายทั้งหมด ${items.length} ชิ้น +${total} ทอง</span>`);
}

// ---------- render buy tab ----------

function renderShopBuy() {
  const panel = document.getElementById('shop-buy-list');
  if (!G.shopStock) { panel.innerHTML = ''; return; }

  const today = new Date().toDateString();
  const canRefresh = !G.shopFreeRefreshUsed || G.shopStockDate !== today;

  panel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.6rem">
      <span style="font-size:.8rem;color:var(--text2)">ร้านรีเฟรชทุกวัน</span>
      <button class="btn-shop-refresh${canRefresh?'':' disabled'}" onclick="handleShopRefresh()">
        🔄 รีเฟรชร้าน ${canRefresh ? '(ฟรี)' : '(ใช้แล้ว)'}
      </button>
    </div>
    <div class="shop-buy-grid">
      ${G.shopStock.map(item => {
        const r    = RARITIES[item.rarity] || RARITIES.common;
        const canAfford = G.gold >= item.price;
        const statLine  = buildStatLine(item);
        const needsClass = item.requiredClass ? `<div style="font-size:.7rem;color:var(--purple)">ต้องการ: ${CLASSES.find(c=>c.id===item.requiredClass)?.name||item.requiredClass}</div>` : '';
        const shortage  = !canAfford ? `<div style="font-size:.7rem;color:var(--red)">ขาด ${item.price - G.gold} ทอง</div>` : '';
        return `<div class="shop-buy-card rarity-border-${item.rarity}">
          <div style="font-size:1.8rem;text-align:center">${item.icon||'⚔'}</div>
          <div class="shop-item-name rarity-glow-${item.rarity}" style="text-align:center;font-size:.82rem">${item.name}</div>
          <div style="font-size:.7rem;color:${r.color};text-align:center">${r.label}</div>
          <div style="font-size:.72rem;color:var(--text2);margin:.3rem 0">${statLine}</div>
          ${needsClass}
          ${shortage}
          <div style="color:var(--gold);text-align:center;font-size:.85rem;margin:.3rem 0">💰 ${item.price}</div>
          <button class="btn-shop-buy${canAfford?'':' disabled'}" onclick='buyShopItem(${JSON.stringify(item.shopUid)})'>${canAfford?'ซื้อ':'ทองไม่พอ'}</button>
        </div>`;
      }).join('')}
    </div>`;
}

function handleShopRefresh() {
  const today = new Date().toDateString();
  if (G.shopFreeRefreshUsed && G.shopStockDate === today) {
    logBattle('<span class="log-sys">⚠ ใช้ฟรีรีเฟรชแล้ววันนี้ (รอรีเฟรชอัตโนมัติพรุ่งนี้)</span>');
    return;
  }
  refreshShopStock();
}

function buyShopItem(shopUid) {
  if (!G.shopStock) return;
  const idx  = G.shopStock.findIndex(i => i.shopUid === shopUid);
  if (idx < 0) return;
  const item = G.shopStock[idx];
  if (G.gold < item.price) { logBattle('<span class="log-sys">⚠ ทองไม่พอ!</span>'); return; }
  if (G.inventory.length >= 50) { logBattle('<span class="log-sys">⚠ กระเป๋าเต็ม!</span>'); return; }

  G.gold -= item.price;
  const instance = { ...item, uid: Date.now() + Math.random(), shopUid: undefined };
  delete instance.shopUid;
  delete instance.price;
  G.inventory.push(instance);

  G.shopStock.splice(idx, 1);
  updateTopBar();
  renderInventory();
  renderShopBuy();
  saveGame();
  logBattle(`<span class="log-exp">🛒 ซื้อ ${item.name} -${item.price} ทอง</span>`);
}

// ---------- equipment slots UI ----------

function renderEquipSlots() {
  const area = document.getElementById('equip-slots-grid');
  if (!area) return;
  if (!G.equippedSlots) G.equippedSlots = {};

  area.innerHTML = SLOT_SLOTS.map(slot => {
    const meta = SLOT_META[slot];
    const uid  = G.equippedSlots[slot];
    const item = uid ? G.inventory.find(i => i.uid === uid) : null;

    if (item) {
      const r = RARITIES[item.rarity] || RARITIES.common;
      const safeUid = String(item.uid);
      return `<div class="equip-slot filled rarity-border-${item.rarity}" title="${item.name}" onclick="showTooltipByUid('${safeUid}')">
        <div class="equip-slot-icon">${item.icon || meta.icon}</div>
        <div class="equip-slot-name">${item.name.slice(0,8)}</div>
        <div style="font-size:.6rem;color:${r.color}">${r.label}</div>
      </div>`;
    } else {
      return `<div class="equip-slot empty">
        <div class="equip-slot-icon" style="opacity:.3">${meta.icon}</div>
        <div class="equip-slot-label">${meta.label}</div>
      </div>`;
    }
  }).join('');
}
