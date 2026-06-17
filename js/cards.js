// ============================================================
// MONSTER CARDS — ระบบการ์ดสะสม
// ดรอปจากมอนตัวที่ตรงกับการ์ด · เก็บแล้วได้โบนัส stat ถาวร
// rarity: common→mythic + Limited (ฟ้า) + Secret (ดำ)
// ============================================================

function _cardOwned(id) { return (G.cards && G.cards[id]) || 0; }

// โบนัส stat รวมจากการ์ดที่เก็บได้ (นับ "มีอย่างน้อย 1 ใบ" = ได้โบนัสเต็ม;
// ใบซ้ำสะสมไว้โชว์จำนวน แต่ไม่ทบ stat — กันบาลานซ์พัง)
function getCardStatBonus() {
  const b = { atk:0, def:0, hp:0, crit:0 };
  if (!G.cards) return b;
  const byId = {};
  (typeof ALL_CARDS !== 'undefined' ? ALL_CARDS : []).forEach(c => { byId[c.id] = c; });
  for (const id in G.cards) {
    if (G.cards[id] <= 0) continue;
    const c = byId[id];
    if (!c || !c.stat) continue;
    b.atk  += c.stat.atk  || 0;
    b.def  += c.stat.def  || 0;
    b.hp   += c.stat.hp   || 0;
    b.crit += c.stat.crit || 0;
  }
  return b;
}

// จำนวนการ์ดที่เก็บได้ (ชนิดที่ไม่ซ้ำ) / ทั้งหมด
function cardCollectionCount() {
  const total = (typeof CARDS !== 'undefined' ? CARDS.length : 0); // นับเฉพาะการ์ดมอน+ลับ (ไม่รวม limited)
  let owned = 0;
  (typeof CARDS !== 'undefined' ? CARDS : []).forEach(c => { if (_cardOwned(c.id) > 0) owned++; });
  return { owned, total };
}

// ให้การ์ด 1 ใบ (เพิ่ม count + แจ้งเตือนถ้าได้ใบใหม่)
function _grantCard(card) {
  if (!card) return false;
  if (!G.cards) G.cards = {};
  const isNew = !(G.cards[card.id] > 0);
  G.cards[card.id] = (G.cards[card.id] || 0) + 1;
  const R = (typeof RARITIES !== 'undefined' && RARITIES[card.rarity]) || { label:card.rarity, color:'#aaa' };
  if (typeof logBattle === 'function') {
    const tag = isNew ? '🎴 การ์ดใหม่!' : '🎴 การ์ด (ซ้ำ)';
    logBattle(`<span class="log-exp" style="color:${R.color}">${tag} ${card.icon||'🃏'} ${card.name} [${R.label}]</span>`);
  }
  if (isNew) {
    // new card changes stat totals → refresh HUD
    if (typeof updateTopBar === 'function') updateTopBar();
    if (typeof updateCharPanel === 'function') updateCharPanel();
  }
  return isNew;
}

// ดรอปการ์ดจากการสังหารมอน — เรียกจาก battle.js / idle.js
//   zone, tier = ของมอนที่ตาย · isBoss = เป็นบอสไหม
function cardRollDrop(zone, tier, isBoss) {
  if (typeof ALL_CARDS === 'undefined' || typeof CARD_CONFIG === 'undefined') return;
  zone = Math.min(6, Math.max(1, zone || 1));

  // 1) การ์ดมอนตัวนี้ (ตรง zone+tier) — โอกาสไล่ตามความยากด่าน/มอน
  const monCard = CARDS.find(c => c.source === 'monster' && c.zone === zone && c.tier === tier);
  if (monCard) {
    const chance = (typeof cardDropChance === 'function')
      ? cardDropChance(zone, tier, isBoss) : 0.04;
    if (Math.random() < chance) _grantCard(monCard);
  }

  // 2) การ์ด Secret ลับประจำด่าน — เฉพาะตอนฆ่าบอสด่านนั้น
  if (isBoss) {
    const secretCard = CARDS.find(c => c.source === 'secret' && c.zone === zone);
    if (secretCard && Math.random() < (CARD_CONFIG.secretDropChance || 0.0015)) {
      _grantCard(secretCard);
      if (typeof showCardDropToast === 'function') showCardDropToast(secretCard);
    }
  }

  // 3) การ์ด Limited (อีเวนต์) — ดรอปจากมอนทุกด่านในช่วงที่เปิด
  (typeof LIMITED_CARDS !== 'undefined' ? LIMITED_CARDS : []).forEach(lc => {
    if (!isCardAvailable(lc)) return;
    if (lc.dropZone && lc.dropZone !== 'any' && lc.dropZone !== zone) return;
    if (Math.random() < (lc.dropChance || 0.004)) {
      _grantCard(lc);
      if (typeof showCardDropToast === 'function') showCardDropToast(lc);
    }
  });
}

// toast พิเศษตอนได้การ์ดหายาก (secret/limited)
function showCardDropToast(card) {
  const R = (typeof RARITIES !== 'undefined' && RARITIES[card.rarity]) || { label:card.rarity, color:'#fff' };
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;top:18%;left:50%;transform:translateX(-50%);z-index:9500;
    background:${R.bg||'#111'};border:2px solid ${R.color};border-radius:14px;padding:1rem 1.4rem;
    text-align:center;box-shadow:0 0 40px ${R.color}88;animation:cardToastIn .4s ease`;
  t.innerHTML = `<div style="font-size:2.6rem">${card.icon||'🃏'}</div>
    <div style="color:${R.color};font-weight:800;font-size:1.05rem;margin:.2rem 0">การ์ด${R.label}!</div>
    <div style="color:#ddd;font-size:.85rem">${card.name}</div>`;
  document.body.appendChild(t);
  setTimeout(() => { t.style.transition = 'opacity .5s'; t.style.opacity = '0'; }, 2600);
  setTimeout(() => t.remove(), 3200);
  if (typeof playSound === 'function') playSound('chest');
}

// ---------- Collection UI ----------
function openCardCollection() {
  let ov = document.getElementById('card-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'card-overlay';
    ov.className = 'overlay';
    ov.onclick = (e) => { if (e.target === ov) ov.classList.remove('active'); };
    document.body.appendChild(ov);
  }
  _renderCardCollection();
  ov.classList.add('active');
}

let _cardTab = 'cards';   // 'cards' | 'gear'
function setCardTab(t) { _cardTab = t; _renderCardCollection(); }

function _renderCardCollection() {
  const ov = document.getElementById('card-overlay');
  if (!ov) return;
  const { owned, total } = cardCollectionCount();
  const cb = getCardStatBonus();

  let sections = '';
  if (_cardTab === 'gear') {
    sections = _gearByZoneHtml();
  } else {
    // group by zone (monster + secret cards), then a Limited section
    (typeof ZONES !== 'undefined' ? ZONES : []).forEach(z => {
      const zoneCards = CARDS.filter(c => c.zone === z.id);
      sections += `<div style="margin:.6rem 0 .3rem;color:#9ad;font-size:.8rem;font-weight:700">${z.emoji} ${z.name}</div>
        <div style="display:flex;flex-wrap:wrap;gap:.4rem">${zoneCards.map(_cardCellHtml).join('')}</div>`;
    });
    const limitedOwned = (typeof LIMITED_CARDS !== 'undefined') ? LIMITED_CARDS.filter(c => _cardOwned(c.id) > 0) : [];
    if (limitedOwned.length) {
      sections += `<div style="margin:.7rem 0 .3rem;color:#22ccff;font-size:.8rem;font-weight:700">🎴 Limited</div>
        <div style="display:flex;flex-wrap:wrap;gap:.4rem">${limitedOwned.map(_cardCellHtml).join('')}</div>`;
    }
  }

  const tabBtn = (id, label) => `<button onclick="setCardTab('${id}')" style="flex:1;padding:.35rem;border-radius:8px;cursor:pointer;font-weight:700;font-size:.78rem;
    border:1px solid ${_cardTab===id?'var(--gold)':'#334'};background:${_cardTab===id?'rgba(255,215,0,.12)':'rgba(255,255,255,.03)'};color:${_cardTab===id?'var(--gold)':'#9aa'}">${label}</button>`;

  ov.innerHTML = `
    <div class="modal" onclick="event.stopPropagation()" style="max-width:460px;width:95%;text-align:left;max-height:86vh;overflow-y:auto">
      <div style="text-align:center;margin-bottom:.4rem">
        <div style="font-size:1.15rem;font-weight:800;color:var(--gold)">🃏 สมุดสะสม</div>
        <div style="font-size:.8rem;color:#bbb">การ์ด <b style="color:#9fe">${owned}/${total}</b> ใบ</div>
      </div>
      <div style="display:flex;gap:.4rem;margin:.4rem 0">${tabBtn('cards','🃏 การ์ด')}${tabBtn('gear','📦 ของดรอปตามด่าน')}</div>
      ${_cardTab==='cards' ? `<div style="background:rgba(0,0,0,.3);border-radius:8px;padding:.5rem .7rem;margin:.4rem 0;font-size:.78rem;color:#cce">
        โบนัสรวมจากการ์ด: <b style="color:#ff8">ATK +${cb.atk}</b> · <b style="color:#8cf">DEF +${cb.def}</b> · <b style="color:#8f8">HP +${cb.hp}</b>${cb.crit?` · <b style="color:#fc8">CRIT +${Math.round(cb.crit*100)}%</b>`:''}
      </div>` : `<div style="font-size:.72rem;color:#889;margin:.3rem 0">ของด่านลึกแรงกว่าด่านตื้น (rarity เดียวกัน) — ตัวเลขคือพลังโดยประมาณหลังคูณด่าน</div>`}
      ${sections}
      <button class="btn-close-modal" onclick="document.getElementById('card-overlay').classList.remove('active')">ปิด</button>
    </div>`;
}

function _cardCellHtml(c) {
  const owned = _cardOwned(c.id);
  const have = owned > 0;
  const R = (typeof RARITIES !== 'undefined' && RARITIES[c.rarity]) || { label:c.rarity, color:'#aaa', bg:'#111' };
  const face = have ? (c.icon || '🃏') : '❔';
  const st = c.stat || {};
  const statStr = have ? `+${st.atk||0}A +${st.def||0}D +${st.hp||0}H${st.crit?` +${Math.round(st.crit*100)}%C`:''}` : '???';
  return `<div title="${have?c.name:'ยังไม่เก็บได้'}" style="width:72px;text-align:center;border:1.5px solid ${have?R.color:'#333'};
    border-radius:10px;padding:.35rem .2rem;background:${have?(R.bg||'#111'):'#0c0c12'};opacity:${have?1:.5}">
    <div style="font-size:1.6rem;filter:${have?'none':'grayscale(1) brightness(.5)'}">${face}</div>
    <div style="font-size:.56rem;color:${have?R.color:'#666'};font-weight:700;line-height:1.1;height:1.7em;overflow:hidden">${have?c.name:'? ? ?'}</div>
    <div style="font-size:.52rem;color:#9a9">${statStr}</div>
    ${owned>1?`<div style="font-size:.55rem;color:#fc8">×${owned}</div>`:''}
  </div>`;
}

// ---------- Gear-by-zone tab ----------
// Shows, per zone: the rarity window (with roll %) and the zone power multiplier
// so the player can see that deeper zones drop stronger gear.
function _gearByZoneHtml() {
  let html = '';
  (typeof ZONES !== 'undefined' ? ZONES : []).forEach(z => {
    const table = (typeof _ZONE_DROP_TABLES !== 'undefined' && _ZONE_DROP_TABLES[z.id]) || [];
    const total = table.reduce((s, [, w]) => s + w, 0) || 1;
    const mult  = (typeof _ZONE_GEAR_MULT !== 'undefined' && _ZONE_GEAR_MULT[z.id]) || 1;
    const chips = table.map(([r, w]) => {
      const R = (typeof RARITIES !== 'undefined' && RARITIES[r]) || { label:r, color:'#aaa' };
      const pct = Math.round((w / total) * 100);
      return `<span style="display:inline-flex;gap:.2rem;align-items:center;padding:.12rem .4rem;border-radius:6px;
        background:rgba(255,255,255,.04);border:1px solid ${R.color};color:${R.color};font-size:.64rem;font-weight:700">
        ${R.label} <span style="color:#999;font-weight:400">${pct}%</span></span>`;
    }).join('');
    html += `<div style="margin:.55rem 0 .25rem;display:flex;justify-content:space-between;align-items:center">
        <span style="color:#9ad;font-size:.8rem;font-weight:700">${z.emoji} ${z.name}</span>
        <span style="font-size:.66rem;color:#fc8">พลัง ×${mult.toFixed(2)}</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:.3rem">${chips || '<span style="color:#666;font-size:.7rem">—</span>'}</div>`;
  });
  html += `<div style="font-size:.66rem;color:#778;margin-top:.6rem;line-height:1.5">
    👑 บอสด่าน: ดรอปแน่นอน + ความหายากสูงกว่ามอนปกติ · 🃏 ยิ่งด่านลึก การ์ดยิ่งหายาก</div>`;
  return html;
}
