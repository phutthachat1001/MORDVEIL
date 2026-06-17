// ============================================================
// COSMETIC SYSTEM — 6-tier visual upgrade for player sprites
// ============================================================

// Tier definitions
const COSMETIC_TIERS = [
  { tier: 1, name: 'ธรรมดา',    icon: '⚪', color: '#aaaaaa', cssClass: 'cosm-t1', unlockDesc: 'ฟรี' },
  { tier: 2, name: 'ดีขึ้น',    icon: '🟢', color: '#44ff88', cssClass: 'cosm-t2', unlockDesc: '💰 500 ทอง' },
  { tier: 3, name: 'หายาก',    icon: '🔵', color: '#4488ff', cssClass: 'cosm-t3', unlockDesc: '💰 2,000 ทอง หรือ 10 ภารกิจ Hub' },
  { tier: 4, name: 'วีรบุรุษ',  icon: '🟣', color: '#cc44ff', cssClass: 'cosm-t4', unlockDesc: '💰 5,000 ทอง + ฆ่าบอส 5 ตัว' },
  { tier: 5, name: 'มหากาพย์', icon: '🟠', color: '#ff8800', cssClass: 'cosm-t5', unlockDesc: '💰 15,000 ทอง + Prestige 1 ครั้ง' },
  { tier: 6, name: 'ตำนาน',    icon: '🌟', color: '#ffdd00', cssClass: 'cosm-t6', unlockDesc: 'หีบบอส (2%) เท่านั้น' },
];

// Class accent colors for glow effects
const COSM_CLASS_COLOR = {
  warrior: '#6699cc',
  mage:    '#aa44ff',
  rogue:   '#00ff88',
  archer:  '#aadd00',
  paladin: '#ffdd44',
};

// ── Tier-2 palette-swap variants (enhanced highlights, richer colors) ──
// These replace the base sprite with a more saturated version via CSS filter
// No new SVG needed for T2 — CSS handles it.


// ── Tier-4: Glowing Eyes, Cloak, and enhanced armor (same SVG base as T3 + CSS glow) ──
// T4 uses T3 sprites + drop-shadow CSS — no new SVG needed.


// ── Tier-6: LEGENDARY — same as T5 sprites, CSS does the full legendary effect ──
// T6 adds a rotating SVG halo overlay + CSS hue-rotate animation

// ── Main function: returns sprite HTML with cosmetic wrapper ──
function getPlayerSpriteWithCosmetic(classId, classTier, cosmeticTier) {
  cosmeticTier = cosmeticTier || G.cosmeticTier || 1;
  const ct = COSMETIC_TIERS.find(t => t.tier === cosmeticTier) || COSMETIC_TIERS[0];

  // PNG tiers t1–t4 cover cosmetic tiers 1–4; t5/t6 use t4 PNG + CSS effects
  const svgHtml = getPlayerSprite(classId, classTier, cosmeticTier);

  const classColor = COSM_CLASS_COLOR[classId] || '#ffffff';
  let wrapperClass = `cosm-sprite ${ct.cssClass}`;
  let extraHtml = '';

  if (cosmeticTier === 6) {
    extraHtml = `<div class="cosm-halo cosm-halo-${classId}"></div>`;
  }
  if (cosmeticTier >= 5) {
    extraHtml += `<div class="cosm-particle-burst cosm-pb-${classId}">` +
      Array.from({length:6}, (_,i) => `<div class="cosm-pb-dot" style="--i:${i}"></div>`).join('') +
      `</div>`;
  }

  return `<div class="${wrapperClass}" style="--class-color:${classColor};position:relative;display:inline-block;">
    ${svgHtml}${extraHtml}
  </div>`;
}

// ── Unlock checks ──
function canUnlockCosmeticTier(tier) {
  if (!G.unlockedCosmeticTiers) G.unlockedCosmeticTiers = [1];
  if (G.unlockedCosmeticTiers.includes(tier)) return { unlocked: true };
  switch (tier) {
    case 2: return G.gold >= 500 ? { canBuy: true } : { reason: 'ต้องการ 💰500' };
    case 3: return (G.gold >= 2000 || (G.completedHubQuests||[]).length >= 10)
      ? { canBuy: true }
      : { reason: 'ต้องการ 💰2,000 หรือ ภารกิจ Hub 10 ข้อ' };
    case 4: return (G.gold >= 5000 && G.bossKills >= 5)
      ? { canBuy: true }
      : { reason: `ต้องการ 💰5,000 + บอส 5 ตัว (ปัจจุบัน ${G.bossKills})` };
    case 5: return (G.gold >= 15000 && G.prestigeCount >= 1)
      ? { canBuy: true }
      : { reason: `ต้องการ 💰15,000 + Prestige 1 ครั้ง (ปัจจุบัน ${G.prestigeCount})` };
    case 6: return { reason: 'ได้จากหีบบอสเท่านั้น (โอกาส 2%)' };
    default: return { canBuy: true };
  }
}

function buyCosmeticTier(tier) {
  if (!G.unlockedCosmeticTiers) G.unlockedCosmeticTiers = [1];
  if (G.unlockedCosmeticTiers.includes(tier)) return;
  const costs = { 2: 500, 3: 2000, 4: 5000, 5: 15000 };
  const cost = costs[tier] || 0;
  if (cost > 0 && G.gold < cost) return;
  G.gold -= cost;
  G.unlockedCosmeticTiers.push(tier);
  G.cosmeticTier = tier;
  saveGame();
  renderCosmeticPanel();
  updateTopBar();
  if (typeof updateCharPanel !== 'undefined') updateCharPanel();
}

function setCosmeticTier(tier) {
  if (!G.unlockedCosmeticTiers) G.unlockedCosmeticTiers = [1];
  if (!G.unlockedCosmeticTiers.includes(tier)) return;
  G.cosmeticTier = tier;
  saveGame();
  renderCosmeticPanel();
  if (typeof updateCharPanel !== 'undefined') updateCharPanel();
}

// ── Try to drop T6 from boss chest ──
function tryDropLegendaryCosmetic() {
  if (!G.unlockedCosmeticTiers) G.unlockedCosmeticTiers = [1];
  if (G.unlockedCosmeticTiers.includes(6)) return false;
  if (Math.random() < 0.02) {
    G.unlockedCosmeticTiers.push(6);
    saveGame();
    return true;
  }
  return false;
}

// ── Hub panel renderer ──
function renderCosmeticPanel() {
  const panel = document.getElementById('hub-cosmetic-panel');
  if (!panel) return;
  if (!G.unlockedCosmeticTiers) G.unlockedCosmeticTiers = [1];
  const current = G.cosmeticTier || 1;
  const classId = G.classId || 'warrior';

  const previewHtml = getPlayerSpriteWithCosmetic(classId, G.classTier || 1, current);
  const tilesHtml = COSMETIC_TIERS.map(ct => {
    const check = canUnlockCosmeticTier(ct.tier);
    const isUnlocked = G.unlockedCosmeticTiers.includes(ct.tier);
    const isActive = current === ct.tier;
    let btnLabel, btnStyle, btnDisabled = '';
    if (isActive) {
      btnLabel = '✓ ใช้อยู่';
      btnStyle = 'background:#1a2a1a;border-color:#44ff88;color:#44ff88;';
      btnDisabled = 'disabled';
    } else if (isUnlocked) {
      btnLabel = '▶ เลือก';
      btnStyle = `border-color:${ct.color};color:${ct.color};`;
    } else if (check.canBuy) {
      btnLabel = '💰 ซื้อ';
      btnStyle = `border-color:${ct.color};color:${ct.color};`;
    } else {
      btnLabel = '🔒 ล็อก';
      btnStyle = 'border-color:#555;color:#666;';
      btnDisabled = 'disabled';
    }
    return `<div class="cosm-tile ${isActive ? 'active' : ''}" style="border-color:${isActive ? ct.color : '#333'}">
      <div class="cosm-tile-icon">${ct.icon}</div>
      <div class="cosm-tile-name" style="color:${ct.color}">${ct.name}</div>
      <div class="cosm-tile-cond">${ct.unlockDesc}</div>
      <button class="cosm-tile-btn" style="${btnStyle}" ${btnDisabled}
        onclick="${isUnlocked ? `setCosmeticTier(${ct.tier})` : `buyCosmeticTier(${ct.tier})`}">
        ${btnLabel}
      </button>
    </div>`;
  }).join('');

  panel.innerHTML = `
    <div class="cosm-preview-area">
      <div class="cosm-preview-label" style="color:#aaa;font-size:.8rem;margin-bottom:.4rem">ตัวอย่าง: Tier ${current} — ${COSMETIC_TIERS.find(t=>t.tier===current)?.name}</div>
      <div class="cosm-preview-sprite">${previewHtml}</div>
    </div>
    <div class="cosm-tiles">${tilesHtml}</div>
  `;
}

function openCosmeticPanel() {
  document.getElementById('hub-panel-title').textContent = '✨ รูปลักษณ์ตัวละคร';
  document.getElementById('hub-panel-body').innerHTML = '<div id="hub-cosmetic-panel"></div>';
  document.getElementById('hub-panel').style.display = 'flex';
  renderCosmeticPanel();
  if (typeof closeHubDialogue === 'function') closeHubDialogue();
}

function openCosmeticFromChar() {
  // standalone modal overlay — accessible from character panel without going to hub
  let ov = document.getElementById('cosm-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'cosm-overlay';
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:500;display:flex;align-items:center;justify-content:center;';
    ov.onclick = (e) => { if (e.target === ov) ov.remove(); };
    document.body.appendChild(ov);
  }
  ov.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border2);border-radius:12px;width:min(420px,94vw);max-height:85vh;overflow:hidden;display:flex;flex-direction:column;">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:.8rem 1rem;border-bottom:1px solid var(--border);font-family:'Chakra Petch','Sarabun',sans-serif;color:var(--gold);">
        ✨ รูปลักษณ์ตัวละคร
        <button onclick="document.getElementById('cosm-overlay').remove()" style="background:none;border:none;color:#aaa;font-size:1.2rem;cursor:pointer">✕</button>
      </div>
      <div style="overflow-y:auto;flex:1;">
        <div id="hub-cosmetic-panel"></div>
      </div>
    </div>
  `;
  renderCosmeticPanel();
}
