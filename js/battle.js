// ============================================================
// BATTLE SYSTEM — โซน, มอนสเตอร์, การต่อสู้, auto attack
// ============================================================

// ---------- Zone tabs ----------

function renderZoneTabs() {
  const tabs = document.getElementById('zone-tabs');
  tabs.innerHTML = '';
  ZONES.forEach(z => {
    const locked = G.level < z.reqLevel;
    const tab = document.createElement('div');
    tab.className = 'zone-tab' + (G.currentZone === z.id ? ' active' : '') + (locked ? ' locked' : '');
    tab.textContent = `${z.emoji} ${z.name}${locked ? ` (LV${z.reqLevel})` : ''}`;
    if (!locked) tab.onclick = () => {
      G.currentZone = z.id;
      G.currentMonster = null;
      stopAuto();
      G.battleInProgress = false;
      document.getElementById('battle-content').style.display    = 'none';
      document.getElementById('monster-list-area').style.display = 'block';
      const arena = document.getElementById('pixel-battle-arena');
      if (arena) { arena.innerHTML = ''; arena.style.display = 'none'; }
      renderZoneTabs();
      renderMonsterList();
      if (typeof rpgOnExplore === 'function') rpgOnExplore(z.id);
    };
    tabs.appendChild(tab);
  });
}

// ---------- Monster list ----------

function renderMonsterList() {
  const area = document.getElementById('monster-list-area');
  area.style.display = 'block';
  const zone = ZONES.find(z => z.id === G.currentZone);
  if (!zone) { area.innerHTML = ''; return; }
  const grid = document.createElement('div');
  grid.className = 'monster-select';
  zone.monsters.forEach(m => {
    const key      = `${G.currentZone}_${m.tier}`;
    const defeated = G.defeatedMonsters[key];
    const stats    = getMonsterStats(G.currentZone, m.tier, m.isBoss);
    const btn      = document.createElement('div');
    btn.className  = 'mon-btn' + (m.isBoss ? ' boss' : '') + (defeated ? ' defeated' : '');
    const monIcon = m.img
      ? `<img src="assets/sprites/${m.img}.png" style="width:48px;height:48px;object-fit:contain;display:block;margin:0 auto" onerror="this.outerHTML='${m.sprite}'">`
      : m.sprite;
    btn.innerHTML  = `${monIcon}<br>${m.name}${m.isBoss ? '<br>👑BOSS' : ''}`;
    btn.onclick    = () => startBattle(m);
    btn.onmouseenter = () => _showMonsterDropTooltip(btn, m);
    btn.onmouseleave = () => hideDropTooltip();
    grid.appendChild(btn);
  });
  area.innerHTML = '';
  area.appendChild(grid);
}

function _showMonsterDropTooltip(el, m) {
  const cls      = CLASSES.find(c => c.id === G.classId);
  const dropBonus= cls && cls.bonuses && cls.bonuses.dropBonus ? cls.bonuses.dropBonus : 0;

  if (m.isBoss) {
    // boss: 100% boss chest
    const lines = _chestDropLines('boss');
    showDropTooltip(el, lines, '👑 บอส: ดรอปหีบบอสทุกครั้ง');
  } else {
    const baseRate = 0.03 + dropBonus;
    const pctStr   = `${Math.round(baseRate * 100)}%`;
    const chestType= m.tier >= 4 ? 'rare' : m.tier >= 2 ? 'uncommon' : 'common';
    const lines    = _chestDropLines(chestType);
    const label    = { common:'หีบธรรมดา', uncommon:'หีบพิเศษ', rare:'หีบหายาก' }[chestType];
    showDropTooltip(el, lines,
      `โอกาสดรอป${label}: ${pctStr}${dropBonus ? ` (บอนัส +${Math.round(dropBonus*100)}%)` : ''}`
    );
  }
}

// ---------- Stats ----------

function getMonsterStats(zone, tier, isBoss) {
  // softer scaling: linear zone instead of zone² so zone6 isn't 36× harder than zone1
  let maxHp = Math.floor(60 * (1 + (zone - 1) * 0.9) * tier);
  let atk   = Math.floor(5 * (1 + (zone - 1) * 0.7) * tier);
  if (isBoss) { maxHp = Math.floor(maxHp * 4); atk = Math.floor(atk * 2.5); }
  return { maxHp, atk };
}

// ---------- Pixel art sprites ----------

// PNG sprite path helper — returns path if file is expected to exist
function _pngSpritePath(classId, cosmeticTier) {
  const tier = Math.min(cosmeticTier || 1, 4); // PNG tiers go up to t4
  return `assets/sprites/${classId}_t${tier}.png`;
}

// ผู้เล่น pixel art ตามคลาส — tries PNG first, falls back to SVG
function getPlayerSprite(classId, classTier, cosmeticTierOverride) {
  const cosm = cosmeticTierOverride || (typeof G !== 'undefined' ? G.cosmeticTier : 1) || 1;
  // use classTier for PNG selection if cosmetic is still at base (tier 1)
  const pngTier = cosm > 1 ? cosm : (classTier || 1);
  const pngPath = _pngSpritePath(classId, pngTier);
  const tierFilter = {
    2: 'brightness(1.15) saturate(1.4)',
    3: 'brightness(1.2) saturate(1.6) drop-shadow(0 0 3px #4488ff)',
    4: 'brightness(1.5) drop-shadow(0 0 8px gold) hue-rotate(40deg) saturate(1.4)',
  };
  const filt = tierFilter[Math.min(pngTier, 4)] ? `filter:${tierFilter[Math.min(pngTier,4)]};` : '';
  return `<div class="png-sprite-wrap" style="display:inline-block;background:transparent;${filt}" data-class="${classId}" data-tier="${pngTier}">` +
    `<img src="${pngPath}" width="80" height="80" ` +
    `style="image-rendering:pixelated;display:block;background:transparent;" ` +
    `onerror="this.parentElement.outerHTML=_getSVGSprite('${classId}',${classTier||1})">` +
    `</div>`;
}

// SVG fallback sprites (original pixel art)
function _getSVGSprite(classId, classTier) {
  const sprites = {

    // ══════════════════════════════════════════════════════════
    // WARRIOR — Heavy Steel Plate + Great Sword + Red Plume
    // ══════════════════════════════════════════════════════════
    warrior: `<svg width="80" height="96" viewBox="0 0 20 24" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <!-- GROUND SHADOW -->
      <ellipse cx="10" cy="23" rx="5" ry="1" fill="#000000" opacity=".3"/>

      <!-- GREAT SWORD (raised right, blade tip upper-right) -->
      <!-- blade highlight -->
      <rect x="16" y="0"  width="1" height="1"  fill="#ffffff"/>
      <rect x="15" y="1"  width="2" height="9"  fill="#ddeeff"/>
      <rect x="15" y="1"  width="1" height="9"  fill="#eef6ff"/>
      <rect x="16" y="2"  width="1" height="8"  fill="#aabbcc"/>
      <!-- fuller groove -->
      <rect x="15" y="3"  width="1" height="6"  fill="#c8dae8"/>
      <!-- crossguard -->
      <rect x="13" y="10" width="5" height="1"  fill="#aabbcc"/>
      <rect x="13" y="11" width="5" height="1"  fill="#778899"/>
      <rect x="13" y="10" width="1" height="1"  fill="#ccdde8"/>
      <!-- grip -->
      <rect x="15" y="11" width="1" height="3"  fill="#774422"/>
      <rect x="15" y="11" width="1" height="1"  fill="#996633"/>
      <!-- pommel gold -->
      <rect x="14" y="14" width="2" height="1"  fill="#ffdd44"/>
      <rect x="15" y="14" width="1" height="1"  fill="#ffffff"/>

      <!-- RED PLUME -->
      <rect x="8"  y="0"  width="4" height="1"  fill="#ff4422"/>
      <rect x="9"  y="0"  width="2" height="1"  fill="#ff7755"/>
      <rect x="8"  y="1"  width="4" height="1"  fill="#cc2200"/>
      <rect x="7"  y="1"  width="1" height="1"  fill="#ee3311"/>

      <!-- HELMET — full great helm -->
      <!-- top dome highlight -->
      <rect x="6"  y="1"  width="8" height="1"  fill="#ccdde8"/>
      <!-- main dome -->
      <rect x="5"  y="2"  width="10" height="4" fill="#8899aa"/>
      <rect x="5"  y="2"  width="1"  height="4" fill="#aabbcc"/>
      <rect x="5"  y="5"  width="10" height="1" fill="#667788"/>
      <!-- cheek guards -->
      <rect x="3"  y="3"  width="3"  height="4" fill="#778899"/>
      <rect x="3"  y="3"  width="1"  height="4" fill="#99aabb"/>
      <rect x="14" y="3"  width="3"  height="4" fill="#667788"/>
      <!-- visor slit -->
      <rect x="5"  y="4"  width="10" height="2" fill="#112233"/>
      <rect x="6"  y="4"  width="3"  height="2" fill="#1a3344"/>
      <rect x="11" y="4"  width="3"  height="2" fill="#1a3344"/>
      <!-- eye glow -->
      <rect x="6"  y="4"  width="2"  height="1" fill="#44aaff"/>
      <rect x="11" y="4"  width="2"  height="1" fill="#44aaff"/>
      <rect x="7"  y="4"  width="1"  height="1" fill="#88ddff"/>
      <rect x="12" y="4"  width="1"  height="1" fill="#88ddff"/>
      <!-- nose guard -->
      <rect x="9"  y="4"  width="2"  height="2" fill="#556677"/>
      <!-- gorget gold trim -->
      <rect x="6"  y="6"  width="8"  height="1" fill="#ddbb44"/>
      <rect x="7"  y="6"  width="6"  height="1" fill="#ffee66"/>
      <rect x="8"  y="7"  width="4"  height="1" fill="#ccaa33"/>

      <!-- LEFT PAULDRON — spiked -->
      <rect x="1"  y="7"  width="5"  height="4" fill="#8899aa"/>
      <rect x="1"  y="7"  width="5"  height="1" fill="#bbccdd"/>
      <rect x="1"  y="7"  width="1"  height="4" fill="#aabbcc"/>
      <rect x="1"  y="10" width="5"  height="1" fill="#556677"/>
      <!-- spike -->
      <rect x="2"  y="6"  width="1"  height="2" fill="#99aabb"/>
      <rect x="2"  y="6"  width="1"  height="1" fill="#ccdde8"/>

      <!-- RIGHT PAULDRON — spiked -->
      <rect x="14" y="7"  width="5"  height="4" fill="#8899aa"/>
      <rect x="14" y="7"  width="5"  height="1" fill="#bbccdd"/>
      <rect x="18" y="7"  width="1"  height="4" fill="#556677"/>
      <rect x="14" y="10" width="5"  height="1" fill="#445566"/>
      <!-- spike -->
      <rect x="17" y="6"  width="1"  height="2" fill="#99aabb"/>
      <rect x="17" y="6"  width="1"  height="1" fill="#ccdde8"/>

      <!-- CHEST PLATE — 3-tone steel blue-gray -->
      <rect x="5"  y="7"  width="10" height="8" fill="#7a8fa0"/>
      <!-- highlight top & left -->
      <rect x="6"  y="7"  width="8"  height="1" fill="#9db0c0"/>
      <rect x="5"  y="7"  width="1"  height="8" fill="#9db0c0"/>
      <!-- shadow right & bottom -->
      <rect x="14" y="7"  width="1"  height="8" fill="#4d6070"/>
      <rect x="5"  y="14" width="10" height="1" fill="#4d6070"/>
      <!-- center breastplate ridge -->
      <rect x="9"  y="7"  width="2"  height="8" fill="#6a7e90"/>
      <!-- pectoral shape lines -->
      <rect x="6"  y="9"  width="3"  height="1" fill="#8aa0b0"/>
      <rect x="11" y="9"  width="3"  height="1" fill="#5d7080"/>
      <!-- CHEST EMBLEM — gold cross -->
      <rect x="7"  y="10" width="6"  height="1" fill="#ddbb44"/>
      <rect x="9"  y="9"  width="2"  height="4" fill="#ddbb44"/>
      <rect x="9"  y="9"  width="2"  height="1" fill="#ffee66"/>
      <rect x="7"  y="10" width="1"  height="1" fill="#ffee66"/>
      <rect x="12" y="10" width="1"  height="1" fill="#ccaa33"/>

      <!-- BELT & FAULD -->
      <rect x="5"  y="15" width="10" height="1" fill="#886633"/>
      <rect x="8"  y="15" width="4"  height="1" fill="#ffdd44"/>
      <rect x="5"  y="16" width="10" height="2" fill="#7a8fa0"/>
      <rect x="5"  y="16" width="10" height="1" fill="#9db0c0"/>
      <rect x="5"  y="17" width="10" height="1" fill="#4d6070"/>

      <!-- LEFT ARM (slightly raised/extended) -->
      <rect x="2"  y="11" width="3"  height="4" fill="#7a8fa0"/>
      <rect x="2"  y="11" width="1"  height="4" fill="#9db0c0"/>
      <rect x="4"  y="11" width="1"  height="4" fill="#4d6070"/>
      <!-- left vambrace -->
      <rect x="2"  y="13" width="3"  height="2" fill="#6a7e90"/>
      <rect x="2"  y="13" width="1"  height="2" fill="#8aa0b0"/>
      <!-- left gauntlet -->
      <rect x="1"  y="15" width="3"  height="2" fill="#6a7e90"/>
      <rect x="1"  y="15" width="1"  height="2" fill="#99aabb"/>

      <!-- RIGHT ARM (weapon arm, raised) -->
      <rect x="15" y="9"  width="3"  height="4" fill="#7a8fa0"/>
      <rect x="17" y="9"  width="1"  height="4" fill="#4d6070"/>
      <rect x="15" y="9"  width="1"  height="4" fill="#9db0c0"/>
      <!-- right vambrace -->
      <rect x="15" y="11" width="3"  height="2" fill="#6a7e90"/>
      <!-- right gauntlet -->
      <rect x="15" y="13" width="3"  height="2" fill="#6a7e90"/>
      <rect x="15" y="13" width="1"  height="2" fill="#8aa0b0"/>

      <!-- LEFT LEG — plate greave -->
      <rect x="5"  y="18" width="4"  height="4" fill="#7a8fa0"/>
      <rect x="5"  y="18" width="1"  height="4" fill="#9db0c0"/>
      <rect x="8"  y="18" width="1"  height="4" fill="#4d6070"/>
      <!-- kneecap -->
      <rect x="5"  y="19" width="4"  height="1" fill="#bbccdd"/>
      <rect x="6"  y="18" width="2"  height="1" fill="#aabbcc"/>

      <!-- RIGHT LEG — plate greave -->
      <rect x="11" y="18" width="4"  height="4" fill="#7a8fa0"/>
      <rect x="11" y="18" width="1"  height="4" fill="#9db0c0"/>
      <rect x="14" y="18" width="1"  height="4" fill="#4d6070"/>
      <!-- kneecap -->
      <rect x="11" y="19" width="4"  height="1" fill="#bbccdd"/>
      <rect x="12" y="18" width="2"  height="1" fill="#aabbcc"/>

      <!-- LEFT SABATON (boot) -->
      <rect x="4"  y="22" width="5"  height="1" fill="#556677"/>
      <rect x="4"  y="21" width="5"  height="1" fill="#6a7e90"/>
      <rect x="3"  y="22" width="6"  height="1" fill="#445566"/>

      <!-- RIGHT SABATON -->
      <rect x="11" y="22" width="5"  height="1" fill="#556677"/>
      <rect x="11" y="21" width="5"  height="1" fill="#6a7e90"/>
      <rect x="11" y="22" width="6"  height="1" fill="#445566"/>
    </svg>`,

    // ══════════════════════════════════════════════════════════
    // MAGE — Long Purple Robes + Pointed Hat + Glowing Staff
    // ══════════════════════════════════════════════════════════
    mage: `<svg width="80" height="96" viewBox="0 0 20 24" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <!-- GROUND SHADOW -->
      <ellipse cx="10" cy="23" rx="5" ry="1" fill="#000000" opacity=".3"/>

      <!-- STAFF (right side, tall) -->
      <!-- orb glow halo -->
      <rect x="14" y="0"  width="3"  height="3" fill="#33ddcc" opacity=".5"/>
      <!-- orb body -->
      <rect x="14" y="0"  width="3"  height="3" fill="#00ffee"/>
      <rect x="15" y="0"  width="1"  height="1" fill="#ffffff"/>
      <rect x="14" y="0"  width="1"  height="2" fill="#44ffdd"/>
      <rect x="16" y="1"  width="1"  height="2" fill="#00bbaa"/>
      <rect x="14" y="2"  width="3"  height="1" fill="#009988"/>
      <!-- orb mount -->
      <rect x="15" y="3"  width="1"  height="1" fill="#887755"/>
      <rect x="14" y="3"  width="3"  height="1" fill="#665533"/>
      <!-- staff shaft -->
      <rect x="15" y="4"  width="1"  height="16" fill="#7a5530"/>
      <rect x="15" y="4"  width="1"  height="1"  fill="#aa7744"/>
      <rect x="15" y="8"  width="1"  height="1"  fill="#9a6a3a"/>
      <rect x="15" y="13" width="1"  height="1"  fill="#9a6a3a"/>
      <rect x="15" y="19" width="1"  height="1"  fill="#553311"/>
      <!-- staff tip ferrule -->
      <rect x="14" y="20" width="3"  height="1" fill="#886644"/>

      <!-- POINTED HAT -->
      <!-- tip -->
      <rect x="9"  y="0"  width="2"  height="1" fill="#aa55ee"/>
      <rect x="8"  y="1"  width="4"  height="1" fill="#9944dd"/>
      <rect x="7"  y="2"  width="6"  height="1" fill="#8833cc"/>
      <rect x="6"  y="3"  width="8"  height="1" fill="#7722bb"/>
      <!-- hat highlight strip -->
      <rect x="9"  y="1"  width="1"  height="3" fill="#cc88ff"/>
      <!-- star ornament -->
      <rect x="8"  y="2"  width="1"  height="1" fill="#ffee44"/>
      <!-- brim -->
      <rect x="3"  y="4"  width="14" height="1" fill="#5511aa"/>
      <rect x="4"  y="4"  width="12" height="1" fill="#7733bb"/>
      <rect x="3"  y="5"  width="14" height="1" fill="#440099"/>

      <!-- FACE — old wizard, white beard -->
      <rect x="6"  y="5"  width="8"  height="5" fill="#e8c090"/>
      <rect x="6"  y="5"  width="1"  height="5" fill="#f0cca0"/>
      <rect x="13" y="5"  width="1"  height="5" fill="#c89060"/>
      <rect x="6"  y="9"  width="8"  height="1" fill="#c89060"/>
      <!-- brow ridge shadow -->
      <rect x="7"  y="5"  width="6"  height="1" fill="#d4a870"/>
      <!-- LEFT EYE -->
      <rect x="7"  y="6"  width="2"  height="2" fill="#ffffff"/>
      <rect x="7"  y="7"  width="2"  height="1" fill="#8800cc"/>
      <rect x="8"  y="6"  width="1"  height="1" fill="#cc44ff"/>
      <!-- RIGHT EYE -->
      <rect x="11" y="6"  width="2"  height="2" fill="#ffffff"/>
      <rect x="11" y="7"  width="2"  height="1" fill="#8800cc"/>
      <rect x="12" y="6"  width="1"  height="1" fill="#cc44ff"/>
      <!-- nose hint -->
      <rect x="9"  y="8"  width="2"  height="1" fill="#c89060"/>
      <!-- subtle mouth -->
      <rect x="8"  y="9"  width="4"  height="1" fill="#b07840"/>
      <rect x="9"  y="9"  width="2"  height="1" fill="#c08858"/>
      <!-- BEARD — white arcane -->
      <rect x="7"  y="10" width="6"  height="1" fill="#eeeeff"/>
      <rect x="7"  y="11" width="6"  height="1" fill="#ddddf0"/>
      <rect x="8"  y="12" width="4"  height="1" fill="#ccccee"/>

      <!-- COLLAR / ROBE TOP -->
      <rect x="7"  y="10" width="6"  height="1" fill="#7733bb"/>
      <rect x="8"  y="10" width="4"  height="1" fill="#9955dd"/>

      <!-- ROBE BODY — 3-tone rich purple -->
      <rect x="4"  y="11" width="12" height="9" fill="#6622aa"/>
      <rect x="5"  y="11" width="10" height="1" fill="#8844cc"/>
      <rect x="4"  y="11" width="1"  height="9" fill="#8844cc"/>
      <rect x="15" y="11" width="1"  height="9" fill="#440088"/>
      <rect x="4"  y="19" width="12" height="1" fill="#440088"/>
      <!-- robe center fold -->
      <rect x="9"  y="11" width="2"  height="9" fill="#5522aa"/>
      <!-- robe secondary crease L -->
      <rect x="6"  y="13" width="1"  height="6" fill="#5522aa"/>
      <!-- robe secondary crease R -->
      <rect x="13" y="13" width="1"  height="6" fill="#4a1999"/>
      <!-- ARCANE RUNE emblem -->
      <rect x="7"  y="13" width="6"  height="1" fill="#dd99ff"/>
      <rect x="9"  y="12" width="2"  height="3" fill="#dd99ff"/>
      <rect x="9"  y="12" width="2"  height="1" fill="#ffffff"/>
      <rect x="7"  y="13" width="1"  height="1" fill="#eeccff"/>
      <!-- diagonal rune marks -->
      <rect x="7"  y="15" width="1"  height="1" fill="#aa66ee"/>
      <rect x="12" y="15" width="1"  height="1" fill="#aa66ee"/>
      <rect x="8"  y="16" width="1"  height="1" fill="#aa66ee"/>
      <rect x="11" y="16" width="1"  height="1" fill="#aa66ee"/>

      <!-- ROPE BELT -->
      <rect x="5"  y="19" width="10" height="1" fill="#886644"/>
      <rect x="8"  y="19" width="4"  height="1" fill="#ffcc55"/>

      <!-- ROBE HEM -->
      <rect x="4"  y="20" width="12" height="2" fill="#5522aa"/>
      <rect x="5"  y="20" width="10" height="1" fill="#7744cc"/>
      <rect x="4"  y="21" width="12" height="1" fill="#440088"/>
      <!-- hem ruffle points -->
      <rect x="5"  y="22" width="2"  height="1" fill="#5522aa"/>
      <rect x="8"  y="21" width="2"  height="2" fill="#440088"/>
      <rect x="11" y="21" width="2"  height="2" fill="#5522aa"/>
      <rect x="14" y="22" width="2"  height="1" fill="#440088"/>

      <!-- SLEEVES — billowing -->
      <rect x="1"  y="11" width="4"  height="6" fill="#5522aa"/>
      <rect x="1"  y="11" width="1"  height="6" fill="#7744cc"/>
      <rect x="4"  y="15" width="1"  height="2" fill="#331188"/>
      <!-- left cuff -->
      <rect x="1"  y="17" width="3"  height="1" fill="#331188"/>
      <!-- right sleeve -->
      <rect x="15" y="11" width="4"  height="6" fill="#5522aa"/>
      <rect x="18" y="11" width="1"  height="6" fill="#331188"/>
      <!-- right cuff -->
      <rect x="16" y="17" width="3"  height="1" fill="#331188"/>
    </svg>`,

    // ══════════════════════════════════════════════════════════
    // ROGUE — Dark Leather + Hood + Twin Daggers + Cloak
    // ══════════════════════════════════════════════════════════
    rogue: `<svg width="80" height="96" viewBox="0 0 20 24" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <!-- GROUND SHADOW -->
      <ellipse cx="10" cy="23" rx="5" ry="1" fill="#000000" opacity=".3"/>

      <!-- CLOAK trailing left -->
      <rect x="0"  y="9"  width="3"  height="12" fill="#1a1a2e"/>
      <rect x="0"  y="9"  width="1"  height="12" fill="#2a2a40"/>
      <rect x="2"  y="9"  width="1"  height="12" fill="#111122"/>
      <rect x="0"  y="20" width="3"  height="2"  fill="#111122"/>
      <rect x="1"  y="21" width="2"  height="2"  fill="#0d0d1a"/>

      <!-- LEFT DAGGER (at hip, held ready) -->
      <rect x="2"  y="6"  width="1"  height="8"  fill="#c8dae0"/>
      <rect x="2"  y="6"  width="1"  height="1"  fill="#eef8ff"/>
      <rect x="2"  y="12" width="1"  height="2"  fill="#8899bb"/>
      <rect x="1"  y="8"  width="2"  height="1"  fill="#99aacc"/>
      <rect x="2"  y="9"  width="1"  height="2"  fill="#553311"/>
      <rect x="2"  y="9"  width="1"  height="1"  fill="#775533"/>

      <!-- RIGHT DAGGER (raised, combat ready) -->
      <rect x="17" y="3"  width="1"  height="8"  fill="#c8dae0"/>
      <rect x="17" y="3"  width="1"  height="1"  fill="#eef8ff"/>
      <rect x="17" y="9"  width="1"  height="2"  fill="#8899bb"/>
      <rect x="16" y="5"  width="2"  height="1"  fill="#99aacc"/>
      <rect x="17" y="6"  width="1"  height="2"  fill="#553311"/>
      <rect x="17" y="6"  width="1"  height="1"  fill="#775533"/>

      <!-- HOOD — deep shadow -->
      <rect x="4"  y="0"  width="12" height="7" fill="#1a1a2e"/>
      <rect x="3"  y="1"  width="14" height="6" fill="#222233"/>
      <rect x="5"  y="0"  width="10" height="1" fill="#2e2e44"/>
      <rect x="4"  y="0"  width="1"  height="5" fill="#2e2e44"/>
      <!-- hood inner shadow -->
      <rect x="5"  y="1"  width="10" height="1" fill="#1a1a2e"/>

      <!-- FACE in hood shadow -->
      <rect x="6"  y="3"  width="8"  height="5" fill="#b07845"/>
      <rect x="6"  y="3"  width="1"  height="5" fill="#c08855"/>
      <rect x="13" y="3"  width="1"  height="5" fill="#886030"/>
      <!-- deep hood shadow on top of face -->
      <rect x="6"  y="3"  width="8"  height="2" fill="#8a5030"/>
      <!-- EYES — glowing green -->
      <rect x="7"  y="4"  width="2"  height="2" fill="#001a00"/>
      <rect x="11" y="4"  width="2"  height="2" fill="#001a00"/>
      <rect x="7"  y="5"  width="2"  height="1" fill="#00ff66"/>
      <rect x="11" y="5"  width="2"  height="1" fill="#00ff66"/>
      <rect x="8"  y="4"  width="1"  height="1" fill="#66ffaa"/>
      <rect x="12" y="4"  width="1"  height="1" fill="#66ffaa"/>
      <!-- nose -->
      <rect x="9"  y="6"  width="2"  height="1" fill="#996633"/>
      <!-- SCARF over lower face -->
      <rect x="6"  y="7"  width="8"  height="2" fill="#1a1a2e"/>
      <rect x="7"  y="7"  width="6"  height="1" fill="#222233"/>

      <!-- NECK -->
      <rect x="8"  y="9"  width="4"  height="1" fill="#1a1a2e"/>

      <!-- LEATHER VEST — 3-tone dark -->
      <rect x="5"  y="9"  width="10" height="7" fill="#2e2e40"/>
      <rect x="6"  y="9"  width="8"  height="1" fill="#404055"/>
      <rect x="5"  y="9"  width="1"  height="7" fill="#404055"/>
      <rect x="14" y="9"  width="1"  height="7" fill="#1a1a2a"/>
      <rect x="5"  y="15" width="10" height="1" fill="#1a1a2a"/>
      <!-- vest center seam -->
      <rect x="9"  y="9"  width="2"  height="6" fill="#252535"/>
      <!-- leather texture lines -->
      <rect x="6"  y="11" width="3"  height="1" fill="#383848"/>
      <rect x="11" y="11" width="3"  height="1" fill="#252535"/>
      <!-- BUCKLES -->
      <rect x="6"  y="13" width="1"  height="1" fill="#ddaa33"/>
      <rect x="13" y="13" width="1"  height="1" fill="#ddaa33"/>
      <!-- strap lines -->
      <rect x="7"  y="13" width="2"  height="1" fill="#1a1a2a"/>
      <rect x="11" y="13" width="2"  height="1" fill="#1a1a2a"/>

      <!-- BELT + POUCHES -->
      <rect x="5"  y="15" width="10" height="1" fill="#664422"/>
      <rect x="8"  y="15" width="4"  height="1" fill="#ffcc33"/>
      <!-- left pouch -->
      <rect x="5"  y="16" width="2"  height="3" fill="#553311"/>
      <rect x="5"  y="16" width="2"  height="1" fill="#775533"/>
      <rect x="5"  y="18" width="2"  height="1" fill="#442200"/>
      <!-- right pouch -->
      <rect x="13" y="16" width="2"  height="3" fill="#553311"/>
      <rect x="13" y="16" width="2"  height="1" fill="#775533"/>
      <rect x="13" y="18" width="2"  height="1" fill="#442200"/>

      <!-- LEFT ARM -->
      <rect x="3"  y="9"  width="3"  height="5" fill="#252535"/>
      <rect x="3"  y="9"  width="1"  height="5" fill="#383848"/>
      <rect x="5"  y="9"  width="1"  height="5" fill="#1a1a2a"/>
      <!-- left glove dark red -->
      <rect x="3"  y="14" width="2"  height="2" fill="#440011"/>
      <rect x="3"  y="14" width="1"  height="1" fill="#661122"/>

      <!-- RIGHT ARM (raised) -->
      <rect x="14" y="7"  width="3"  height="5" fill="#252535"/>
      <rect x="16" y="7"  width="1"  height="5" fill="#1a1a2a"/>
      <rect x="14" y="7"  width="1"  height="5" fill="#383848"/>
      <!-- right glove dark red -->
      <rect x="15" y="12" width="2"  height="2" fill="#440011"/>
      <rect x="15" y="12" width="1"  height="1" fill="#661122"/>

      <!-- LEGS — dark trousers -->
      <rect x="5"  y="19" width="4"  height="4" fill="#1e1e30"/>
      <rect x="5"  y="19" width="1"  height="4" fill="#2e2e44"/>
      <rect x="8"  y="19" width="1"  height="4" fill="#111122"/>
      <rect x="11" y="19" width="4"  height="4" fill="#1e1e30"/>
      <rect x="11" y="19" width="1"  height="4" fill="#2e2e44"/>
      <rect x="14" y="19" width="1"  height="4" fill="#111122"/>

      <!-- BOOTS — dark leather -->
      <rect x="4"  y="21" width="5"  height="2" fill="#2a1100"/>
      <rect x="4"  y="21" width="5"  height="1" fill="#3d1800"/>
      <rect x="3"  y="22" width="6"  height="1" fill="#1a0a00"/>
      <rect x="11" y="21" width="5"  height="2" fill="#2a1100"/>
      <rect x="11" y="21" width="5"  height="1" fill="#3d1800"/>
      <rect x="11" y="22" width="6"  height="1" fill="#1a0a00"/>
    </svg>`,

    // ══════════════════════════════════════════════════════════
    // ARCHER — Forest Green + Ranger Hat + Longbow + Quiver
    // ══════════════════════════════════════════════════════════
    archer: `<svg width="80" height="96" viewBox="0 0 20 24" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <!-- GROUND SHADOW -->
      <ellipse cx="10" cy="23" rx="5" ry="1" fill="#000000" opacity=".3"/>

      <!-- LONGBOW (right side, drawn back) -->
      <!-- upper limb curve -->
      <rect x="17" y="0"  width="1"  height="1"  fill="#7a5520"/>
      <rect x="16" y="1"  width="2"  height="1"  fill="#8a6230"/>
      <rect x="15" y="2"  width="2"  height="2"  fill="#9a7240"/>
      <rect x="15" y="2"  width="1"  height="2"  fill="#aa8844"/>
      <!-- main shaft -->
      <rect x="15" y="4"  width="1"  height="10" fill="#8a6230"/>
      <rect x="15" y="4"  width="1"  height="1"  fill="#aa8844"/>
      <rect x="15" y="9"  width="1"  height="1"  fill="#aa8844"/>
      <!-- lower limb curve -->
      <rect x="15" y="14" width="2"  height="2"  fill="#9a7240"/>
      <rect x="16" y="16" width="2"  height="1"  fill="#8a6230"/>
      <rect x="17" y="17" width="1"  height="1"  fill="#7a5520"/>
      <!-- bow string (taut) -->
      <rect x="18" y="1"  width="1"  height="1"  fill="#ddc866"/>
      <rect x="18" y="17" width="1"  height="1"  fill="#ddc866"/>
      <rect x="19" y="2"  width="1"  height="15" fill="#ccbb55"/>
      <!-- arrow nocked -->
      <rect x="18" y="8"  width="1"  height="3"  fill="#bb9944"/>
      <rect x="18" y="8"  width="1"  height="1"  fill="#ddbb44"/>
      <rect x="19" y="10" width="1"  height="1"  fill="#cc3300"/>

      <!-- QUIVER on back -->
      <rect x="2"  y="6"  width="3"  height="9"  fill="#662211"/>
      <rect x="2"  y="6"  width="3"  height="1"  fill="#884422"/>
      <rect x="2"  y="14" width="3"  height="1"  fill="#441100"/>
      <rect x="2"  y="6"  width="1"  height="9"  fill="#773322"/>
      <!-- arrow shafts sticking out -->
      <rect x="2"  y="2"  width="1"  height="5"  fill="#997744"/>
      <rect x="3"  y="1"  width="1"  height="6"  fill="#997744"/>
      <rect x="4"  y="3"  width="1"  height="4"  fill="#997744"/>
      <!-- arrow tips -->
      <rect x="2"  y="2"  width="1"  height="1"  fill="#ddaa44"/>
      <rect x="3"  y="1"  width="1"  height="1"  fill="#ddaa44"/>
      <rect x="4"  y="3"  width="1"  height="1"  fill="#ddaa44"/>

      <!-- RANGER HAT — wide brim with feather -->
      <!-- hat crown -->
      <rect x="5"  y="0"  width="9"  height="3"  fill="#3a5a10"/>
      <rect x="5"  y="0"  width="9"  height="1"  fill="#4a6a20"/>
      <rect x="5"  y="0"  width="1"  height="3"  fill="#5a7a30"/>
      <rect x="13" y="0"  width="1"  height="3"  fill="#2a4a00"/>
      <!-- hat band -->
      <rect x="5"  y="2"  width="9"  height="1"  fill="#664422"/>
      <!-- hat brim -->
      <rect x="2"  y="3"  width="16" height="1"  fill="#2a4a00"/>
      <rect x="3"  y="3"  width="14" height="1"  fill="#4a6a20"/>
      <rect x="2"  y="4"  width="16" height="1"  fill="#1e3800"/>
      <!-- feather -->
      <rect x="12" y="0"  width="1"  height="3"  fill="#66aa22"/>
      <rect x="13" y="0"  width="1"  height="2"  fill="#88cc33"/>
      <rect x="14" y="0"  width="1"  height="1"  fill="#aaee44"/>

      <!-- FACE — focused, determined -->
      <rect x="6"  y="4"  width="8"  height="5"  fill="#d49860"/>
      <rect x="6"  y="4"  width="1"  height="5"  fill="#e0aa70"/>
      <rect x="13" y="4"  width="1"  height="5"  fill="#b07840"/>
      <rect x="6"  y="8"  width="8"  height="1"  fill="#b07840"/>
      <!-- brow crease -->
      <rect x="7"  y="4"  width="6"  height="1"  fill="#c08848"/>
      <!-- LEFT EYE — green -->
      <rect x="7"  y="5"  width="2"  height="2"  fill="#ffffff"/>
      <rect x="7"  y="6"  width="2"  height="1"  fill="#226622"/>
      <rect x="8"  y="5"  width="1"  height="1"  fill="#44aa44"/>
      <!-- RIGHT EYE -->
      <rect x="11" y="5"  width="2"  height="2"  fill="#ffffff"/>
      <rect x="11" y="6"  width="2"  height="1"  fill="#226622"/>
      <rect x="12" y="5"  width="1"  height="1"  fill="#44aa44"/>
      <!-- nose -->
      <rect x="9"  y="7"  width="2"  height="1"  fill="#c08848"/>
      <!-- mouth determined -->
      <rect x="8"  y="8"  width="4"  height="1"  fill="#a06030"/>
      <rect x="9"  y="8"  width="2"  height="1"  fill="#b07040"/>

      <!-- NECK -->
      <rect x="8"  y="9"  width="4"  height="1"  fill="#c49058"/>

      <!-- FOREST TUNIC — 3-tone green -->
      <rect x="5"  y="10" width="10" height="7"  fill="#3d5f1e"/>
      <rect x="6"  y="10" width="8"  height="1"  fill="#5a7a35"/>
      <rect x="5"  y="10" width="1"  height="7"  fill="#5a7a35"/>
      <rect x="14" y="10" width="1"  height="7"  fill="#253d0a"/>
      <rect x="5"  y="16" width="10" height="1"  fill="#253d0a"/>
      <!-- V collar -->
      <rect x="9"  y="10" width="2"  height="4"  fill="#2e4e14"/>
      <!-- chest stitching -->
      <rect x="7"  y="12" width="2"  height="1"  fill="#4a6a28"/>
      <rect x="11" y="12" width="2"  height="1"  fill="#2e4e14"/>

      <!-- LEATHER SHOULDER PADS -->
      <rect x="3"  y="10" width="3"  height="3"  fill="#774422"/>
      <rect x="3"  y="10" width="3"  height="1"  fill="#996633"/>
      <rect x="3"  y="12" width="3"  height="1"  fill="#553311"/>
      <rect x="14" y="10" width="3"  height="3"  fill="#774422"/>
      <rect x="14" y="10" width="3"  height="1"  fill="#996633"/>
      <rect x="14" y="12" width="3"  height="1"  fill="#553311"/>

      <!-- BELT -->
      <rect x="5"  y="16" width="10" height="1"  fill="#664422"/>
      <rect x="8"  y="16" width="4"  height="1"  fill="#ffcc44"/>

      <!-- LEFT ARM + BRACER (draw arm) -->
      <rect x="3"  y="13" width="2"  height="4"  fill="#3d5f1e"/>
      <rect x="3"  y="13" width="1"  height="4"  fill="#5a7a35"/>
      <!-- bracer -->
      <rect x="3"  y="15" width="2"  height="2"  fill="#664422"/>
      <rect x="3"  y="15" width="1"  height="1"  fill="#886633"/>

      <!-- RIGHT ARM (holding bow) -->
      <rect x="15" y="11" width="2"  height="4"  fill="#3d5f1e"/>
      <rect x="16" y="11" width="1"  height="4"  fill="#253d0a"/>
      <!-- bracer -->
      <rect x="15" y="13" width="2"  height="2"  fill="#664422"/>
      <rect x="16" y="13" width="1"  height="1"  fill="#553311"/>

      <!-- LEGS -->
      <rect x="5"  y="17" width="4"  height="5"  fill="#2e4e14"/>
      <rect x="5"  y="17" width="1"  height="5"  fill="#4a6a28"/>
      <rect x="8"  y="17" width="1"  height="5"  fill="#1e3408"/>
      <rect x="11" y="17" width="4"  height="5"  fill="#2e4e14"/>
      <rect x="11" y="17" width="1"  height="5"  fill="#4a6a28"/>
      <rect x="14" y="17" width="1"  height="5"  fill="#1e3408"/>

      <!-- BOOTS — dark brown -->
      <rect x="4"  y="21" width="5"  height="2"  fill="#442211"/>
      <rect x="4"  y="21" width="5"  height="1"  fill="#663322"/>
      <rect x="3"  y="22" width="6"  height="1"  fill="#2a1100"/>
      <rect x="11" y="21" width="5"  height="2"  fill="#442211"/>
      <rect x="11" y="21" width="5"  height="1"  fill="#663322"/>
      <rect x="11" y="22" width="6"  height="1"  fill="#2a1100"/>
    </svg>`,

    // ══════════════════════════════════════════════════════════
    // PALADIN — Gold Plate + Holy Shield + Warhammer + Crown
    // ══════════════════════════════════════════════════════════
    paladin: `<svg width="80" height="96" viewBox="0 0 20 24" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <!-- GROUND SHADOW -->
      <ellipse cx="10" cy="23" rx="5" ry="1" fill="#000000" opacity=".3"/>

      <!-- HOLY SHIELD (left arm raised) -->
      <!-- shield body gold -->
      <rect x="0"  y="8"  width="4"  height="7"  fill="#ccaa22"/>
      <rect x="0"  y="8"  width="4"  height="1"  fill="#ffee88"/>
      <rect x="0"  y="8"  width="1"  height="7"  fill="#ffee88"/>
      <rect x="3"  y="8"  width="1"  height="7"  fill="#997700"/>
      <rect x="0"  y="14" width="4"  height="1"  fill="#997700"/>
      <!-- shield boss center -->
      <rect x="1"  y="10" width="2"  height="3"  fill="#ddbb33"/>
      <!-- WHITE CROSS on shield -->
      <rect x="1"  y="9"  width="2"  height="5"  fill="#ffffff"/>
      <rect x="0"  y="11" width="4"  height="1"  fill="#ffffff"/>
      <rect x="1"  y="9"  width="2"  height="1"  fill="#aaddff"/>
      <rect x="0"  y="11" width="1"  height="1"  fill="#aaddff"/>
      <!-- shield inner blue glow -->
      <rect x="1"  y="10" width="2"  height="1"  fill="#88bbff"/>
      <!-- shield rim trim -->
      <rect x="0"  y="7"  width="4"  height="1"  fill="#ffee66"/>
      <rect x="0"  y="15" width="4"  height="1"  fill="#886600"/>

      <!-- WARHAMMER (right arm raised) -->
      <!-- shaft -->
      <rect x="16" y="9"  width="1"  height="10" fill="#7a5530"/>
      <rect x="16" y="9"  width="1"  height="1"  fill="#aa7744"/>
      <rect x="16" y="14" width="1"  height="1"  fill="#9a6a3a"/>
      <!-- hammer wrap -->
      <rect x="16" y="11" width="1"  height="1"  fill="#886633"/>
      <rect x="16" y="13" width="1"  height="1"  fill="#886633"/>
      <!-- hammer head — heavy steel -->
      <rect x="14" y="3"  width="4"  height="7"  fill="#8899aa"/>
      <rect x="14" y="3"  width="4"  height="1"  fill="#aabbcc"/>
      <rect x="14" y="3"  width="1"  height="7"  fill="#bbccdd"/>
      <rect x="17" y="3"  width="1"  height="7"  fill="#556677"/>
      <rect x="14" y="9"  width="4"  height="1"  fill="#556677"/>
      <!-- hammer face detail -->
      <rect x="15" y="4"  width="2"  height="1"  fill="#ccdde8"/>
      <rect x="14" y="6"  width="4"  height="1"  fill="#778899"/>
      <!-- HOLY RUNE on hammer face -->
      <rect x="15" y="5"  width="2"  height="3"  fill="#66aaff"/>
      <rect x="15" y="5"  width="1"  height="1"  fill="#aaddff"/>
      <rect x="14" y="6"  width="1"  height="1"  fill="#aaddff"/>

      <!-- CROWN (holy) -->
      <rect x="5"  y="0"  width="10" height="3"  fill="#ddbb33"/>
      <!-- crown spires -->
      <rect x="5"  y="0"  width="1"  height="2"  fill="#ffee66"/>
      <rect x="7"  y="0"  width="2"  height="1"  fill="#ffee66"/>
      <rect x="10" y="0"  width="2"  height="1"  fill="#ffee66"/>
      <rect x="13" y="0"  width="2"  height="2"  fill="#ffee66"/>
      <!-- crown highlight top -->
      <rect x="5"  y="0"  width="10" height="1"  fill="#fff0aa"/>
      <!-- crown shadow base -->
      <rect x="5"  y="2"  width="10" height="1"  fill="#aa8800"/>
      <!-- GEMS in crown -->
      <rect x="6"  y="1"  width="2"  height="1"  fill="#66aaff"/>
      <rect x="7"  y="1"  width="1"  height="1"  fill="#aaddff"/>
      <rect x="9"  y="1"  width="2"  height="1"  fill="#ff4444"/>
      <rect x="10" y="1"  width="1"  height="1"  fill="#ff8888"/>
      <rect x="12" y="1"  width="2"  height="1"  fill="#66aaff"/>

      <!-- FACE — noble, strong jaw -->
      <rect x="6"  y="3"  width="8"  height="5"  fill="#f0c890"/>
      <rect x="6"  y="3"  width="1"  height="5"  fill="#f8d8a8"/>
      <rect x="13" y="3"  width="1"  height="5"  fill="#c89868"/>
      <rect x="6"  y="7"  width="8"  height="1"  fill="#c89868"/>
      <!-- strong brow -->
      <rect x="7"  y="3"  width="6"  height="1"  fill="#996633"/>
      <!-- LEFT EYE — resolute blue -->
      <rect x="7"  y="4"  width="2"  height="2"  fill="#ffffff"/>
      <rect x="7"  y="5"  width="2"  height="1"  fill="#2244bb"/>
      <rect x="8"  y="4"  width="1"  height="1"  fill="#4466ee"/>
      <!-- RIGHT EYE -->
      <rect x="11" y="4"  width="2"  height="2"  fill="#ffffff"/>
      <rect x="11" y="5"  width="2"  height="1"  fill="#2244bb"/>
      <rect x="12" y="4"  width="1"  height="1"  fill="#4466ee"/>
      <!-- nose -->
      <rect x="9"  y="6"  width="2"  height="1"  fill="#c89868"/>
      <!-- mouth firm -->
      <rect x="8"  y="7"  width="4"  height="1"  fill="#a07040"/>
      <rect x="9"  y="7"  width="2"  height="1"  fill="#b08050"/>

      <!-- GORGET gold collar -->
      <rect x="7"  y="8"  width="6"  height="1"  fill="#ddbb33"/>
      <rect x="8"  y="8"  width="4"  height="1"  fill="#ffee66"/>
      <rect x="7"  y="9"  width="6"  height="1"  fill="#aa8800"/>

      <!-- LEFT PAULDRON — ornate gold, spiked -->
      <rect x="2"  y="9"  width="5"  height="4"  fill="#ccaa22"/>
      <rect x="2"  y="9"  width="5"  height="1"  fill="#ffee88"/>
      <rect x="2"  y="9"  width="1"  height="4"  fill="#ffee88"/>
      <rect x="6"  y="9"  width="1"  height="4"  fill="#997700"/>
      <rect x="2"  y="12" width="5"  height="1"  fill="#997700"/>
      <!-- spike -->
      <rect x="3"  y="8"  width="2"  height="2"  fill="#ffee88"/>
      <rect x="4"  y="7"  width="1"  height="2"  fill="#ffdd66"/>

      <!-- RIGHT PAULDRON — ornate gold, spiked -->
      <rect x="13" y="9"  width="5"  height="4"  fill="#ccaa22"/>
      <rect x="13" y="9"  width="5"  height="1"  fill="#ffee88"/>
      <rect x="17" y="9"  width="1"  height="4"  fill="#997700"/>
      <rect x="13" y="12" width="5"  height="1"  fill="#997700"/>
      <!-- spike -->
      <rect x="15" y="8"  width="2"  height="2"  fill="#ffee88"/>
      <rect x="15" y="7"  width="1"  height="2"  fill="#ffdd66"/>

      <!-- CHEST PLATE — radiant gold 3-tone -->
      <rect x="5"  y="9"  width="10" height="8"  fill="#c8a020"/>
      <rect x="6"  y="9"  width="8"  height="1"  fill="#ffee88"/>
      <rect x="5"  y="9"  width="1"  height="8"  fill="#ffee88"/>
      <rect x="14" y="9"  width="1"  height="8"  fill="#886600"/>
      <rect x="5"  y="16" width="10" height="1"  fill="#886600"/>
      <!-- center breastplate ridge -->
      <rect x="9"  y="9"  width="2"  height="8"  fill="#b89018"/>
      <!-- pectoral shape -->
      <rect x="6"  y="11" width="3"  height="1"  fill="#ddcc44"/>
      <rect x="11" y="11" width="3"  height="1"  fill="#997700"/>
      <!-- HOLY CROSS EMBLEM — large glowing -->
      <rect x="6"  y="12" width="8"  height="1"  fill="#ffffff"/>
      <rect x="9"  y="10" width="2"  height="5"  fill="#ffffff"/>
      <rect x="9"  y="10" width="2"  height="1"  fill="#aaddff"/>
      <rect x="6"  y="12" width="1"  height="1"  fill="#aaddff"/>
      <!-- cross glow halo -->
      <rect x="7"  y="11" width="6"  height="3"  fill="#ddeeff" opacity=".6"/>
      <rect x="9"  y="10" width="2"  height="5"  fill="#ffffff"/>
      <!-- blue cross glow dots -->
      <rect x="8"  y="12" width="1"  height="1"  fill="#88ccff"/>
      <rect x="13" y="12" width="1"  height="1"  fill="#88ccff"/>

      <!-- BELT ORNATE -->
      <rect x="5"  y="17" width="10" height="1"  fill="#997700"/>
      <rect x="8"  y="17" width="4"  height="1"  fill="#ffee44"/>
      <!-- fauld plates -->
      <rect x="5"  y="18" width="10" height="1"  fill="#c8a020"/>
      <rect x="5"  y="18" width="10" height="1"  fill="#ddbb33"/>
      <rect x="5"  y="18" width="1"  height="1"  fill="#ffee88"/>

      <!-- LEFT ARM (shield arm) -->
      <rect x="3"  y="13" width="3"  height="4"  fill="#c8a020"/>
      <rect x="3"  y="13" width="1"  height="4"  fill="#ffee88"/>
      <rect x="5"  y="13" width="1"  height="4"  fill="#886600"/>
      <!-- left gauntlet -->
      <rect x="2"  y="17" width="3"  height="2"  fill="#b89018"/>
      <rect x="2"  y="17" width="1"  height="2"  fill="#ddcc44"/>

      <!-- RIGHT ARM (hammer arm, raised) -->
      <rect x="14" y="9"  width="3"  height="4"  fill="#c8a020"/>
      <rect x="16" y="9"  width="1"  height="4"  fill="#886600"/>
      <rect x="14" y="9"  width="1"  height="4"  fill="#ffee88"/>
      <!-- right gauntlet -->
      <rect x="15" y="13" width="2"  height="2"  fill="#b89018"/>
      <rect x="15" y="13" width="1"  height="1"  fill="#ddcc44"/>

      <!-- LEFT LEG — gold plate greave -->
      <rect x="5"  y="19" width="4"  height="4"  fill="#c8a020"/>
      <rect x="5"  y="19" width="1"  height="4"  fill="#ffee88"/>
      <rect x="8"  y="19" width="1"  height="4"  fill="#886600"/>
      <!-- kneecap -->
      <rect x="5"  y="20" width="4"  height="1"  fill="#ffee88"/>
      <rect x="6"  y="19" width="2"  height="1"  fill="#ddcc44"/>

      <!-- RIGHT LEG — gold plate greave -->
      <rect x="11" y="19" width="4"  height="4"  fill="#c8a020"/>
      <rect x="11" y="19" width="1"  height="4"  fill="#ffee88"/>
      <rect x="14" y="19" width="1"  height="4"  fill="#886600"/>
      <!-- kneecap -->
      <rect x="11" y="20" width="4"  height="1"  fill="#ffee88"/>
      <rect x="12" y="19" width="2"  height="1"  fill="#ddcc44"/>

      <!-- LEFT SABATON (boot) -->
      <rect x="4"  y="22" width="5"  height="1"  fill="#a88800"/>
      <rect x="4"  y="21" width="5"  height="1"  fill="#c8a020"/>
      <rect x="3"  y="22" width="6"  height="1"  fill="#886600"/>

      <!-- RIGHT SABATON -->
      <rect x="11" y="22" width="5"  height="1"  fill="#a88800"/>
      <rect x="11" y="21" width="5"  height="1"  fill="#c8a020"/>
      <rect x="11" y="22" width="6"  height="1"  fill="#886600"/>
    </svg>`,
  };

  const base = sprites[classId] || sprites.warrior;
  return `<div style="display:inline-block;image-rendering:pixelated;">${base}</div>`;
}

// มอนสเตอร์ pixel art ตามชื่อ
function getMonsterSprite(monsterName, isBoss, zone, imgFile) {
  if (imgFile) {
    const size = isBoss ? '96px' : '72px';
    return `<img src="assets/sprites/${imgFile}.png" style="width:${size};height:${size};object-fit:contain;display:block;image-rendering:auto" onerror="this.style.display='none'">`;
  }

  // ── ZONE 1 กอบลิน ──────────────────────────────────────────
  if (monsterName.includes('กอบลินน้อย'))
    return `<svg width="40" height="48" viewBox="0 0 10 12" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="1" y="2" width="1" height="2" fill="#44aa44"/><rect x="8" y="2" width="1" height="2" fill="#44aa44"/>
      <rect x="2" y="1" width="6" height="5" fill="#55bb55"/>
      <rect x="3" y="3" width="1" height="1" fill="#ff3300"/><rect x="6" y="3" width="1" height="1" fill="#ff3300"/>
      <rect x="3" y="5" width="4" height="1" fill="#336633"/>
      <rect x="2" y="6" width="6" height="3" fill="#44aa44"/>
      <rect x="2" y="9" width="2" height="3" fill="#338833"/><rect x="6" y="9" width="2" height="3" fill="#338833"/>
    </svg>`;

  if (monsterName.includes('กอบลินทหาร'))
    return `<svg width="48" height="56" viewBox="0 0 12 14" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="1" y="2" width="2" height="3" fill="#44aa44"/><rect x="9" y="2" width="2" height="3" fill="#44aa44"/>
      <rect x="3" y="1" width="6" height="5" fill="#55bb55"/>
      <rect x="2" y="0" width="8" height="2" fill="#778899"/><rect x="3" y="1" width="6" height="1" fill="#99aabb"/>
      <rect x="4" y="3" width="1" height="1" fill="#ff3300"/><rect x="7" y="3" width="1" height="1" fill="#ff3300"/>
      <rect x="2" y="6" width="8" height="4" fill="#556644"/><rect x="3" y="7" width="6" height="2" fill="#667755"/>
      <rect x="10" y="0" width="1" height="12" fill="#886644"/><rect x="10" y="0" width="1" height="2" fill="#cccccc"/>
      <rect x="3" y="10" width="2" height="3" fill="#445533"/><rect x="7" y="10" width="2" height="3" fill="#445533"/>
    </svg>`;

  if (monsterName.includes('กอบลินหัวหน้า'))
    return `<svg width="48" height="56" viewBox="0 0 12 14" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="0" y="1" width="3" height="4" fill="#338833"/><rect x="9" y="1" width="3" height="4" fill="#338833"/>
      <rect x="2" y="0" width="8" height="6" fill="#44bb44"/>
      <rect x="3" y="1" width="3" height="1" fill="#225522"/><rect x="6" y="1" width="3" height="1" fill="#225522"/>
      <rect x="3" y="2" width="2" height="2" fill="#ff2200"/><rect x="7" y="2" width="2" height="2" fill="#ff2200"/>
      <rect x="3" y="5" width="6" height="1" fill="#225522"/>
      <rect x="4" y="5" width="1" height="1" fill="#ffee88"/><rect x="7" y="5" width="1" height="1" fill="#ffee88"/>
      <rect x="2" y="6" width="8" height="4" fill="#33aa33"/><rect x="3" y="7" width="6" height="2" fill="#44bb44"/>
      <rect x="10" y="2" width="2" height="8" fill="#884422"/><rect x="9" y="2" width="3" height="2" fill="#aa6633"/>
      <rect x="2" y="9" width="8" height="1" fill="#664422"/>
      <rect x="2" y="10" width="3" height="4" fill="#338833"/><rect x="7" y="10" width="3" height="4" fill="#338833"/>
    </svg>`;

  if (monsterName.includes('กอบลินแม่มด'))
    return `<svg width="48" height="64" viewBox="0 0 12 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="5" y="0" width="2" height="1" fill="#221133"/><rect x="4" y="1" width="4" height="1" fill="#332244"/>
      <rect x="3" y="2" width="6" height="1" fill="#221133"/><rect x="2" y="3" width="8" height="1" fill="#332244"/>
      <rect x="1" y="3" width="2" height="3" fill="#227722"/><rect x="9" y="3" width="2" height="3" fill="#227722"/>
      <rect x="3" y="4" width="6" height="4" fill="#338833"/>
      <rect x="4" y="5" width="1" height="1" fill="#ffff00"/><rect x="7" y="5" width="1" height="1" fill="#ffff00"/>
      <rect x="4" y="7" width="4" height="1" fill="#225522"/>
      <rect x="3" y="8" width="6" height="5" fill="#441166"/><rect x="4" y="9" width="4" height="3" fill="#552277"/>
      <rect x="1" y="5" width="1" height="11" fill="#663300"/>
      <rect x="0" y="4" width="3" height="1" fill="#aaaa22"/><rect x="1" y="4" width="1" height="1" fill="#ffff44"/>
      <rect x="3" y="13" width="2" height="3" fill="#330055"/><rect x="7" y="13" width="2" height="3" fill="#330055"/>
    </svg>`;

  if (monsterName.includes('กอบลินยักษ์'))
    return `<svg width="56" height="56" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="0" y="2" width="3" height="5" fill="#338833"/><rect x="11" y="2" width="3" height="5" fill="#338833"/>
      <rect x="2" y="1" width="10" height="7" fill="#44cc44"/>
      <rect x="3" y="3" width="3" height="2" fill="#ff2200"/><rect x="8" y="3" width="3" height="2" fill="#ff2200"/>
      <rect x="5" y="5" width="4" height="2" fill="#33aa33"/>
      <rect x="3" y="7" width="8" height="1" fill="#225522"/>
      <rect x="4" y="7" width="2" height="1" fill="#ffee88"/><rect x="8" y="7" width="2" height="1" fill="#ffee88"/>
      <rect x="1" y="8" width="12" height="4" fill="#33aa33"/><rect x="2" y="9" width="10" height="2" fill="#44bb44"/>
      <rect x="2" y="11" width="4" height="3" fill="#228822"/><rect x="8" y="11" width="4" height="3" fill="#228822"/>
    </svg>`;

  if (monsterName.includes('ราชากอบลิน') || (isBoss && zone === 1))
    return `<svg width="64" height="72" viewBox="0 0 16 18" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="3" y="0" width="10" height="3" fill="#ddaa00"/>
      <rect x="4" y="0" width="1" height="1" fill="#ffdd44"/><rect x="7" y="0" width="2" height="1" fill="#ffdd44"/><rect x="11" y="0" width="1" height="1" fill="#ffdd44"/>
      <rect x="1" y="3" width="3" height="4" fill="#33aa33"/><rect x="12" y="3" width="3" height="4" fill="#33aa33"/>
      <rect x="3" y="2" width="10" height="7" fill="#44cc44"/>
      <rect x="5" y="5" width="2" height="2" fill="#ff0000"/><rect x="9" y="5" width="2" height="2" fill="#ff0000"/>
      <rect x="5" y="5" width="1" height="1" fill="#ff6600"/><rect x="9" y="5" width="1" height="1" fill="#ff6600"/>
      <rect x="5" y="8" width="6" height="1" fill="#225522"/>
      <rect x="6" y="8" width="1" height="1" fill="#ffdd88"/><rect x="8" y="8" width="1" height="1" fill="#ffdd88"/><rect x="10" y="8" width="1" height="1" fill="#ffdd88"/>
      <rect x="2" y="9" width="12" height="5" fill="#33aa33"/><rect x="4" y="10" width="8" height="3" fill="#44bb44"/>
      <rect x="4" y="9" width="8" height="1" fill="#ccaa00"/>
      <rect x="2" y="13" width="12" height="1" fill="#aa8800"/>
      <rect x="3" y="14" width="3" height="4" fill="#228822"/><rect x="10" y="14" width="3" height="4" fill="#228822"/>
      <rect x="0" y="8" width="2" height="9" fill="#cccccc"/><rect x="0" y="8" width="2" height="1" fill="#ffdd00"/>
    </svg>`;

  // ── ZONE 2 ซอมบี้ ──────────────────────────────────────────
  if (monsterName.includes('ซอมบี้เน่า'))
    return `<svg width="48" height="56" viewBox="0 0 12 14" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="3" y="0" width="6" height="5" fill="#99aa77"/>
      <rect x="4" y="1" width="1" height="2" fill="#778855"/><rect x="8" y="0" width="1" height="2" fill="#778855"/>
      <rect x="4" y="2" width="2" height="2" fill="#111100"/><rect x="7" y="2" width="2" height="2" fill="#111100"/>
      <rect x="4" y="2" width="1" height="1" fill="#336600"/>
      <rect x="4" y="4" width="5" height="1" fill="#556633"/>
      <rect x="3" y="5" width="6" height="5" fill="#778855"/>
      <rect x="2" y="6" width="1" height="3" fill="#556633"/><rect x="9" y="6" width="1" height="3" fill="#556633"/>
      <rect x="5" y="6" width="2" height="1" fill="#445522"/><rect x="4" y="8" width="1" height="1" fill="#445522"/>
      <rect x="3" y="10" width="2" height="4" fill="#667744"/><rect x="7" y="10" width="2" height="4" fill="#667744"/>
    </svg>`;

  if (monsterName.includes('ซอมบี้เดิน'))
    return `<svg width="56" height="56" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="4" y="0" width="6" height="5" fill="#aabb88"/>
      <rect x="5" y="2" width="2" height="1" fill="#ffffff"/><rect x="8" y="2" width="2" height="1" fill="#ffffff"/>
      <rect x="5" y="2" width="1" height="1" fill="#880000"/><rect x="8" y="2" width="1" height="1" fill="#880000"/>
      <rect x="5" y="4" width="4" height="1" fill="#885544"/>
      <rect x="4" y="5" width="6" height="5" fill="#99aa77"/>
      <rect x="0" y="5" width="4" height="2" fill="#aabb88"/><rect x="10" y="5" width="4" height="2" fill="#aabb88"/>
      <rect x="5" y="6" width="1" height="2" fill="#cc2200"/>
      <rect x="4" y="10" width="2" height="4" fill="#889966"/><rect x="8" y="10" width="2" height="4" fill="#889966"/>
    </svg>`;

  if (monsterName.includes('ซอมบี้นักรบ'))
    return `<svg width="48" height="56" viewBox="0 0 12 14" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="3" y="0" width="6" height="5" fill="#aabb88"/>
      <rect x="2" y="0" width="8" height="2" fill="#556677"/><rect x="5" y="0" width="2" height="2" fill="#334455"/>
      <rect x="4" y="2" width="2" height="2" fill="#110000"/><rect x="7" y="2" width="2" height="2" fill="#880000"/>
      <rect x="4" y="4" width="4" height="1" fill="#664433"/>
      <rect x="2" y="5" width="8" height="5" fill="#445566"/><rect x="3" y="6" width="6" height="3" fill="#556677"/>
      <rect x="4" y="5" width="1" height="2" fill="#334455"/><rect x="7" y="5" width="2" height="3" fill="#223344"/>
      <rect x="5" y="7" width="2" height="3" fill="#aa1100"/>
      <rect x="10" y="1" width="1" height="11" fill="#887766"/>
      <rect x="3" y="10" width="2" height="4" fill="#334455"/><rect x="7" y="10" width="2" height="4" fill="#334455"/>
    </svg>`;

  if (monsterName.includes('ซอมบี้แม่มด'))
    return `<svg width="48" height="64" viewBox="0 0 12 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="3" y="0" width="6" height="1" fill="#221122"/><rect x="4" y="1" width="4" height="1" fill="#332233"/>
      <rect x="5" y="2" width="2" height="1" fill="#221122"/>
      <rect x="3" y="3" width="6" height="4" fill="#aabb88"/>
      <rect x="4" y="4" width="2" height="2" fill="#00cc00"/><rect x="7" y="4" width="2" height="2" fill="#00cc00"/>
      <rect x="4" y="6" width="4" height="1" fill="#557733"/>
      <rect x="3" y="7" width="6" height="5" fill="#442255"/>
      <rect x="2" y="9" width="1" height="3" fill="#331144"/><rect x="9" y="8" width="1" height="4" fill="#331144"/>
      <rect x="1" y="4" width="1" height="11" fill="#554433"/>
      <rect x="0" y="3" width="3" height="1" fill="#44aa44"/><rect x="1" y="3" width="1" height="2" fill="#66cc66"/>
      <rect x="3" y="12" width="2" height="4" fill="#331144"/><rect x="7" y="12" width="2" height="4" fill="#331144"/>
    </svg>`;

  if (monsterName.includes('ซอมบี้ยักษ์'))
    return `<svg width="56" height="64" viewBox="0 0 14 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="2" y="0" width="10" height="7" fill="#99aa77"/>
      <rect x="3" y="3" width="3" height="2" fill="#000000"/><rect x="8" y="3" width="3" height="2" fill="#000000"/>
      <rect x="3" y="3" width="2" height="1" fill="#cc0000"/><rect x="8" y="3" width="2" height="1" fill="#cc0000"/>
      <rect x="3" y="6" width="8" height="1" fill="#664433"/>
      <rect x="4" y="6" width="1" height="1" fill="#ffccaa"/><rect x="9" y="6" width="1" height="1" fill="#ffccaa"/>
      <rect x="1" y="7" width="12" height="6" fill="#889966"/><rect x="2" y="8" width="10" height="4" fill="#99aa77"/>
      <rect x="6" y="7" width="2" height="4" fill="#bb1100"/>
      <rect x="2" y="13" width="4" height="3" fill="#778855"/><rect x="8" y="13" width="4" height="3" fill="#778855"/>
    </svg>`;

  if (monsterName.includes('จอมซอมบี้') || (isBoss && zone === 2))
    return `<svg width="64" height="72" viewBox="0 0 16 18" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="3" y="0" width="10" height="4" fill="#111122"/><rect x="5" y="0" width="6" height="2" fill="#222233"/>
      <rect x="3" y="3" width="10" height="7" fill="#ddddcc"/>
      <rect x="4" y="6" width="3" height="3" fill="#000000"/><rect x="9" y="6" width="3" height="3" fill="#000000"/>
      <rect x="4" y="6" width="2" height="2" fill="#0000ff"/><rect x="9" y="6" width="2" height="2" fill="#0000ff"/>
      <rect x="5" y="9" width="6" height="1" fill="#bbbbaa"/>
      <rect x="5" y="9" width="1" height="1" fill="#000000"/><rect x="7" y="9" width="1" height="1" fill="#000000"/><rect x="9" y="9" width="1" height="1" fill="#000000"/>
      <rect x="2" y="10" width="12" height="5" fill="#222244"/><rect x="4" y="11" width="8" height="3" fill="#333355"/>
      <rect x="13" y="5" width="3" height="3" fill="#4444cc"/><rect x="14" y="5" width="1" height="3" fill="#6666ff"/><rect x="14" y="5" width="2" height="1" fill="#8888ff"/>
      <rect x="0" y="3" width="2" height="14" fill="#554433"/><rect x="0" y="3" width="2" height="2" fill="#8888ff"/>
      <rect x="3" y="15" width="4" height="3" fill="#111122"/><rect x="9" y="15" width="4" height="3" fill="#111122"/>
    </svg>`;

  // ── ZONE 3 มังกร ──────────────────────────────────────────
  if (monsterName.includes('มังกรน้ำแข็ง'))
    return `<svg width="56" height="48" viewBox="0 0 14 12" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="2" y="1" width="5" height="4" fill="#88ccff"/>
      <rect x="7" y="3" width="4" height="2" fill="#aaddff"/><rect x="10" y="3" width="1" height="1" fill="#ffffff"/>
      <rect x="3" y="2" width="2" height="2" fill="#ffffff"/><rect x="3" y="2" width="1" height="1" fill="#00ccff"/>
      <rect x="2" y="0" width="1" height="2" fill="#aaddff"/><rect x="4" y="0" width="1" height="1" fill="#aaddff"/>
      <rect x="0" y="4" width="3" height="4" fill="#66aacc"/><rect x="0" y="4" width="2" height="2" fill="#88ccee"/>
      <rect x="2" y="5" width="8" height="4" fill="#77bbdd"/><rect x="4" y="6" width="5" height="2" fill="#88ccee"/>
      <rect x="10" y="6" width="4" height="2" fill="#66aacc"/><rect x="12" y="5" width="2" height="1" fill="#66aacc"/>
      <rect x="3" y="9" width="2" height="3" fill="#66aacc"/><rect x="7" y="9" width="2" height="3" fill="#66aacc"/>
      <rect x="11" y="2" width="1" height="2" fill="#ccffff"/>
    </svg>`;

  if (monsterName.includes('มังกรไฟ'))
    return `<svg width="56" height="48" viewBox="0 0 14 12" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="2" y="1" width="5" height="4" fill="#cc3300"/>
      <rect x="7" y="3" width="4" height="2" fill="#dd4400"/>
      <rect x="10" y="2" width="2" height="3" fill="#ff6600"/><rect x="11" y="1" width="1" height="2" fill="#ffaa00"/>
      <rect x="3" y="2" width="2" height="2" fill="#ff6600"/><rect x="3" y="2" width="1" height="1" fill="#ffcc00"/>
      <rect x="2" y="0" width="1" height="2" fill="#ff4400"/><rect x="5" y="0" width="1" height="2" fill="#ff4400"/>
      <rect x="0" y="3" width="3" height="5" fill="#aa2200"/><rect x="0" y="3" width="2" height="3" fill="#cc3300"/>
      <rect x="2" y="5" width="8" height="4" fill="#bb2200"/><rect x="4" y="6" width="5" height="2" fill="#cc3300"/>
      <rect x="10" y="6" width="4" height="2" fill="#aa2200"/><rect x="12" y="7" width="2" height="2" fill="#993300"/>
      <rect x="3" y="9" width="2" height="3" fill="#aa2200"/><rect x="7" y="9" width="2" height="3" fill="#aa2200"/>
    </svg>`;

  if (monsterName.includes('มังกรพิษ'))
    return `<svg width="56" height="48" viewBox="0 0 14 12" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="2" y="1" width="5" height="4" fill="#446600"/>
      <rect x="7" y="2" width="5" height="3" fill="#557700"/>
      <rect x="11" y="2" width="2" height="1" fill="#88cc00"/><rect x="11" y="3" width="2" height="1" fill="#aaee00"/>
      <rect x="11" y="4" width="1" height="1" fill="#aaee00"/><rect x="12" y="4" width="1" height="1" fill="#aaee00"/>
      <rect x="3" y="2" width="2" height="2" fill="#aaee00"/><rect x="3" y="2" width="1" height="1" fill="#ffff00"/>
      <rect x="3" y="0" width="1" height="2" fill="#557700"/><rect x="5" y="0" width="1" height="1" fill="#557700"/>
      <rect x="0" y="4" width="3" height="4" fill="#446600"/>
      <rect x="2" y="5" width="8" height="4" fill="#557700"/>
      <rect x="3" y="5" width="1" height="1" fill="#446600"/><rect x="5" y="6" width="1" height="1" fill="#446600"/><rect x="7" y="5" width="1" height="1" fill="#446600"/>
      <rect x="10" y="5" width="4" height="3" fill="#446600"/>
      <rect x="3" y="9" width="2" height="3" fill="#446600"/><rect x="7" y="9" width="2" height="3" fill="#446600"/>
    </svg>`;

  if (monsterName.includes('มังกรสายฟ้า'))
    return `<svg width="56" height="48" viewBox="0 0 14 12" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="2" y="1" width="5" height="4" fill="#886600"/>
      <rect x="7" y="2" width="4" height="2" fill="#aabb00"/>
      <rect x="10" y="1" width="1" height="1" fill="#ffff44"/><rect x="11" y="0" width="1" height="2" fill="#ffff00"/><rect x="12" y="1" width="1" height="1" fill="#ffff44"/>
      <rect x="3" y="2" width="2" height="2" fill="#ffff00"/><rect x="3" y="2" width="1" height="1" fill="#ffffff"/>
      <rect x="2" y="0" width="2" height="2" fill="#ccbb00"/><rect x="5" y="0" width="2" height="1" fill="#ccbb00"/>
      <rect x="0" y="3" width="3" height="5" fill="#5566aa"/>
      <rect x="2" y="5" width="8" height="4" fill="#887700"/><rect x="4" y="6" width="5" height="2" fill="#aabb00"/>
      <rect x="5" y="5" width="1" height="1" fill="#ffff44"/><rect x="8" y="7" width="1" height="1" fill="#ffff44"/>
      <rect x="10" y="5" width="4" height="3" fill="#887700"/>
      <rect x="3" y="9" width="2" height="3" fill="#665500"/><rect x="7" y="9" width="2" height="3" fill="#665500"/>
    </svg>`;

  if (monsterName.includes('มังกรมืด'))
    return `<svg width="56" height="48" viewBox="0 0 14 12" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="2" y="1" width="5" height="4" fill="#221122"/>
      <rect x="7" y="2" width="4" height="3" fill="#332233"/><rect x="10" y="3" width="1" height="1" fill="#aa00ff"/>
      <rect x="3" y="2" width="2" height="2" fill="#aa00ff"/><rect x="3" y="2" width="1" height="1" fill="#cc44ff"/>
      <rect x="2" y="0" width="1" height="2" fill="#440066"/><rect x="5" y="0" width="1" height="2" fill="#440066"/>
      <rect x="0" y="3" width="3" height="5" fill="#110011"/>
      <rect x="2" y="5" width="8" height="4" fill="#331133"/><rect x="4" y="6" width="5" height="2" fill="#442244"/>
      <rect x="5" y="5" width="1" height="1" fill="#aa00ff"/><rect x="8" y="7" width="1" height="1" fill="#aa00ff"/>
      <rect x="10" y="5" width="4" height="3" fill="#221122"/>
      <rect x="3" y="9" width="2" height="3" fill="#221122"/><rect x="7" y="9" width="2" height="3" fill="#221122"/>
    </svg>`;

  if (monsterName.includes('มังกรราชัน') || (isBoss && zone === 3))
    return `<svg width="72" height="56" viewBox="0 0 18 14" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="2" y="0" width="6" height="2" fill="#ffcc00"/>
      <rect x="2" y="0" width="1" height="1" fill="#ffee44"/><rect x="4" y="0" width="2" height="1" fill="#ffee44"/><rect x="7" y="0" width="1" height="1" fill="#ffee44"/>
      <rect x="1" y="1" width="8" height="5" fill="#cc4400"/>
      <rect x="9" y="4" width="6" height="3" fill="#dd5500"/>
      <rect x="14" y="3" width="2" height="2" fill="#ff6600"/><rect x="14" y="5" width="2" height="1" fill="#ffaa00"/>
      <rect x="2" y="2" width="3" height="3" fill="#ffcc00"/><rect x="2" y="2" width="2" height="2" fill="#ff8800"/>
      <rect x="6" y="2" width="2" height="2" fill="#ffcc00"/>
      <rect x="1" y="0" width="2" height="3" fill="#ff4400"/><rect x="6" y="0" width="2" height="2" fill="#ff4400"/>
      <rect x="0" y="5" width="4" height="6" fill="#aa2200"/><rect x="0" y="5" width="3" height="4" fill="#cc3300"/>
      <rect x="1" y="6" width="12" height="5" fill="#bb3300"/><rect x="3" y="7" width="9" height="3" fill="#cc4400"/>
      <rect x="4" y="6" width="1" height="1" fill="#ffaa00"/><rect x="7" y="7" width="1" height="1" fill="#ffaa00"/><rect x="10" y="6" width="1" height="1" fill="#ffaa00"/>
      <rect x="13" y="7" width="5" height="3" fill="#aa2200"/><rect x="15" y="6" width="3" height="2" fill="#882200"/>
      <rect x="2" y="11" width="3" height="3" fill="#aa2200"/><rect x="8" y="11" width="3" height="3" fill="#aa2200"/>
    </svg>`;

  // ── ZONE 4 อสูร ──────────────────────────────────────────
  if (monsterName.includes('อสูรหัวแตก'))
    return `<svg width="48" height="56" viewBox="0 0 12 14" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="3" y="1" width="6" height="5" fill="#aa2200"/>
      <rect x="6" y="1" width="1" height="4" fill="#771100"/><rect x="4" y="2" width="2" height="1" fill="#771100"/><rect x="7" y="3" width="2" height="1" fill="#771100"/>
      <rect x="4" y="3" width="1" height="1" fill="#ff4400"/><rect x="7" y="3" width="1" height="1" fill="#ff4400"/>
      <rect x="3" y="0" width="1" height="2" fill="#cc3300"/><rect x="8" y="0" width="1" height="2" fill="#cc3300"/>
      <rect x="4" y="5" width="4" height="1" fill="#771100"/>
      <rect x="2" y="6" width="8" height="4" fill="#991100"/><rect x="3" y="7" width="6" height="2" fill="#aa2200"/>
      <rect x="5" y="6" width="2" height="4" fill="#cc0000"/>
      <rect x="3" y="10" width="2" height="4" fill="#881100"/><rect x="7" y="10" width="2" height="4" fill="#881100"/>
    </svg>`;

  if (monsterName.includes('อสูรทหาร'))
    return `<svg width="48" height="56" viewBox="0 0 12 14" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="2" y="0" width="8" height="3" fill="#332233"/><rect x="3" y="1" width="6" height="2" fill="#443344"/>
      <rect x="2" y="0" width="2" height="3" fill="#880022"/><rect x="8" y="0" width="2" height="3" fill="#880022"/>
      <rect x="3" y="2" width="6" height="4" fill="#883322"/>
      <rect x="4" y="3" width="4" height="1" fill="#ff2200"/>
      <rect x="2" y="6" width="8" height="5" fill="#442244"/><rect x="3" y="7" width="6" height="3" fill="#553355"/>
      <rect x="5" y="7" width="2" height="3" fill="#331133"/><rect x="3" y="8" width="6" height="1" fill="#331133"/>
      <rect x="10" y="0" width="2" height="12" fill="#998877"/><rect x="9" y="3" width="4" height="1" fill="#776655"/>
      <rect x="3" y="11" width="2" height="3" fill="#331133"/><rect x="7" y="11" width="2" height="3" fill="#331133"/>
    </svg>`;

  if (monsterName.includes('อสูรแม่มด'))
    return `<svg width="48" height="64" viewBox="0 0 12 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="3" y="0" width="2" height="3" fill="#770022"/><rect x="7" y="0" width="2" height="3" fill="#770022"/>
      <rect x="3" y="2" width="6" height="5" fill="#882244"/>
      <rect x="4" y="4" width="2" height="2" fill="#ff00ff"/><rect x="7" y="4" width="2" height="2" fill="#ff00ff"/>
      <rect x="4" y="4" width="1" height="1" fill="#ffffff"/>
      <rect x="4" y="6" width="4" height="1" fill="#550022"/>
      <rect x="3" y="7" width="6" height="5" fill="#440055"/><rect x="2" y="9" width="8" height="3" fill="#550066"/>
      <rect x="1" y="3" width="1" height="12" fill="#443322"/>
      <rect x="0" y="2" width="3" height="2" fill="#ff00ff"/><rect x="1" y="2" width="1" height="1" fill="#ff88ff"/>
      <rect x="3" y="12" width="2" height="4" fill="#330044"/><rect x="7" y="12" width="2" height="4" fill="#330044"/>
    </svg>`;

  if (monsterName.includes('อสูรยักษ์'))
    return `<svg width="64" height="64" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="2" y="0" width="3" height="5" fill="#880011"/><rect x="11" y="0" width="3" height="5" fill="#880011"/>
      <rect x="3" y="2" width="10" height="7" fill="#aa2211"/>
      <rect x="4" y="4" width="3" height="3" fill="#ff2200"/><rect x="9" y="4" width="3" height="3" fill="#ff2200"/>
      <rect x="4" y="4" width="2" height="2" fill="#ff6600"/><rect x="9" y="4" width="2" height="2" fill="#ff6600"/>
      <rect x="4" y="8" width="8" height="1" fill="#660011"/>
      <rect x="5" y="8" width="2" height="1" fill="#ffccaa"/><rect x="9" y="8" width="2" height="1" fill="#ffccaa"/>
      <rect x="1" y="9" width="14" height="5" fill="#991111"/><rect x="3" y="10" width="10" height="3" fill="#aa2222"/>
      <rect x="2" y="14" width="4" height="2" fill="#881111"/><rect x="10" y="14" width="4" height="2" fill="#881111"/>
    </svg>`;

  if (monsterName.includes('อสูรจอม'))
    return `<svg width="56" height="64" viewBox="0 0 14 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="0" y="4" width="4" height="7" fill="#330011"/><rect x="0" y="4" width="3" height="5" fill="#440022"/>
      <rect x="10" y="4" width="4" height="7" fill="#330011"/><rect x="11" y="4" width="3" height="5" fill="#440022"/>
      <rect x="4" y="0" width="2" height="4" fill="#990033"/><rect x="8" y="0" width="2" height="4" fill="#990033"/>
      <rect x="3" y="2" width="8" height="6" fill="#bb2233"/>
      <rect x="4" y="4" width="2" height="2" fill="#ff0000"/><rect x="8" y="4" width="2" height="2" fill="#ff0000"/>
      <rect x="4" y="4" width="1" height="1" fill="#ff8800"/><rect x="8" y="4" width="1" height="1" fill="#ff8800"/>
      <rect x="5" y="7" width="4" height="1" fill="#770011"/>
      <rect x="3" y="8" width="8" height="5" fill="#aa1122"/><rect x="4" y="9" width="6" height="3" fill="#bb2233"/>
      <rect x="4" y="13" width="2" height="3" fill="#881122"/><rect x="8" y="13" width="2" height="3" fill="#881122"/>
    </svg>`;

  if (monsterName.includes('ราชาอสูร') || (isBoss && zone === 4))
    return `<svg width="72" height="72" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="4" y="0" width="10" height="3" fill="#cc0000"/>
      <rect x="4" y="0" width="2" height="1" fill="#ff4444"/><rect x="8" y="0" width="2" height="1" fill="#ff4444"/><rect x="12" y="0" width="2" height="1" fill="#ff4444"/>
      <rect x="0" y="5" width="4" height="8" fill="#440011"/><rect x="0" y="5" width="3" height="6" fill="#550022"/>
      <rect x="14" y="5" width="4" height="8" fill="#440011"/><rect x="15" y="5" width="3" height="6" fill="#550022"/>
      <rect x="3" y="0" width="3" height="6" fill="#cc1100"/><rect x="12" y="0" width="3" height="6" fill="#cc1100"/>
      <rect x="4" y="2" width="10" height="8" fill="#cc1111"/>
      <rect x="5" y="5" width="3" height="3" fill="#ff0000"/><rect x="10" y="5" width="3" height="3" fill="#ff0000"/>
      <rect x="5" y="5" width="2" height="2" fill="#ff6600"/><rect x="10" y="5" width="2" height="2" fill="#ff6600"/>
      <rect x="6" y="9" width="6" height="1" fill="#880000"/>
      <rect x="7" y="9" width="1" height="1" fill="#ffccaa"/><rect x="11" y="9" width="1" height="1" fill="#ffccaa"/>
      <rect x="3" y="10" width="12" height="5" fill="#bb0011"/><rect x="5" y="11" width="8" height="3" fill="#cc1122"/>
      <rect x="4" y="15" width="4" height="3" fill="#990011"/><rect x="10" y="15" width="4" height="3" fill="#990011"/>
    </svg>`;

  // ── ZONE 5 ปราสาทมืด ──────────────────────────────────────
  if (monsterName.includes('ผีปราสาท'))
    return `<svg width="48" height="56" viewBox="0 0 12 14" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="3" y="0" width="6" height="6" fill="#ccddff"/>
      <rect x="4" y="2" width="2" height="2" fill="#000066"/><rect x="7" y="2" width="2" height="2" fill="#000066"/>
      <rect x="4" y="2" width="1" height="1" fill="#0000cc"/><rect x="7" y="2" width="1" height="1" fill="#0000cc"/>
      <rect x="4" y="5" width="4" height="1" fill="#8899cc"/>
      <rect x="2" y="6" width="8" height="5" fill="#aabbee"/>
      <rect x="2" y="10" width="1" height="2" fill="#aabbee"/><rect x="4" y="10" width="1" height="3" fill="#aabbee"/>
      <rect x="6" y="10" width="1" height="2" fill="#aabbee"/><rect x="8" y="10" width="1" height="3" fill="#aabbee"/>
      <rect x="10" y="10" width="1" height="2" fill="#aabbee"/>
      <rect x="3" y="7" width="1" height="2" fill="#99aadd"/><rect x="6" y="7" width="2" height="2" fill="#99aadd"/><rect x="9" y="7" width="1" height="2" fill="#99aadd"/>
    </svg>`;

  if (monsterName.includes('อัศวินมืด'))
    return `<svg width="48" height="64" viewBox="0 0 12 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="2" y="0" width="8" height="4" fill="#222233"/><rect x="3" y="1" width="6" height="3" fill="#333344"/>
      <rect x="3" y="2" width="6" height="1" fill="#0033cc"/><rect x="4" y="2" width="4" height="1" fill="#0066ff"/>
      <rect x="4" y="4" width="4" height="1" fill="#222233"/>
      <rect x="2" y="5" width="8" height="6" fill="#1a1a2e"/><rect x="3" y="6" width="6" height="4" fill="#222240"/>
      <rect x="5" y="5" width="2" height="6" fill="#111122"/><rect x="2" y="7" width="8" height="2" fill="#111122"/>
      <rect x="0" y="5" width="2" height="5" fill="#1a1a2e"/><rect x="10" y="5" width="2" height="5" fill="#1a1a2e"/>
      <rect x="10" y="0" width="2" height="14" fill="#334455"/><rect x="9" y="3" width="4" height="1" fill="#223344"/>
      <rect x="2" y="11" width="3" height="5" fill="#1a1a2e"/><rect x="7" y="11" width="3" height="5" fill="#1a1a2e"/>
    </svg>`;

  if (monsterName.includes('แม่มดปราสาท'))
    return `<svg width="48" height="64" viewBox="0 0 12 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="5" y="0" width="2" height="1" fill="#111111"/><rect x="4" y="1" width="4" height="1" fill="#111111"/>
      <rect x="3" y="2" width="6" height="1" fill="#222222"/><rect x="2" y="3" width="8" height="1" fill="#333333"/>
      <rect x="3" y="4" width="6" height="5" fill="#ccbbaa"/>
      <rect x="4" y="6" width="2" height="2" fill="#00cc44"/><rect x="7" y="6" width="2" height="2" fill="#00cc44"/>
      <rect x="4" y="8" width="1" height="1" fill="#664433"/><rect x="5" y="9" width="2" height="1" fill="#664433"/><rect x="7" y="8" width="1" height="1" fill="#664433"/>
      <rect x="2" y="9" width="8" height="5" fill="#111133"/><rect x="1" y="11" width="10" height="3" fill="#222244"/>
      <rect x="10" y="2" width="1" height="13" fill="#554433"/>
      <rect x="9" y="2" width="3" height="2" fill="#cc44cc"/><rect x="10" y="2" width="1" height="1" fill="#ff88ff"/>
      <rect x="3" y="14" width="2" height="2" fill="#111122"/><rect x="7" y="14" width="2" height="2" fill="#111122"/>
    </svg>`;

  if (monsterName.includes('สัตว์ประหลาด'))
    return `<svg width="56" height="48" viewBox="0 0 14 12" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="0" y="2" width="5" height="6" fill="#332233"/><rect x="0" y="2" width="4" height="4" fill="#443344"/>
      <rect x="9" y="2" width="5" height="6" fill="#332233"/><rect x="10" y="2" width="4" height="4" fill="#443344"/>
      <rect x="4" y="0" width="6" height="5" fill="#554455"/>
      <rect x="4" y="0" width="2" height="3" fill="#443344"/><rect x="8" y="0" width="2" height="3" fill="#443344"/>
      <rect x="5" y="2" width="2" height="2" fill="#cc0000"/><rect x="8" y="2" width="2" height="2" fill="#cc0000"/>
      <rect x="5" y="4" width="4" height="1" fill="#331133"/>
      <rect x="6" y="4" width="1" height="1" fill="#ffffff"/><rect x="8" y="4" width="1" height="1" fill="#ffffff"/>
      <rect x="4" y="5" width="6" height="4" fill="#443355"/>
      <rect x="4" y="9" width="2" height="3" fill="#332233"/><rect x="8" y="9" width="2" height="3" fill="#332233"/>
    </svg>`;

  if (monsterName.includes('เจ้าชายมืด'))
    return `<svg width="48" height="64" viewBox="0 0 12 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="3" y="0" width="6" height="2" fill="#330066"/>
      <rect x="3" y="0" width="1" height="1" fill="#6600cc"/><rect x="5" y="0" width="2" height="1" fill="#6600cc"/><rect x="8" y="0" width="1" height="1" fill="#6600cc"/>
      <rect x="3" y="1" width="6" height="5" fill="#223344"/>
      <rect x="4" y="3" width="2" height="2" fill="#aa00ff"/><rect x="7" y="3" width="2" height="2" fill="#aa00ff"/>
      <rect x="5" y="5" width="3" height="1" fill="#112233"/>
      <rect x="2" y="6" width="8" height="6" fill="#1a0033"/><rect x="3" y="7" width="6" height="4" fill="#220044"/>
      <rect x="5" y="7" width="2" height="4" fill="#110022"/>
      <rect x="10" y="2" width="1" height="12" fill="#8866cc"/><rect x="9" y="5" width="3" height="1" fill="#6644aa"/>
      <rect x="3" y="12" width="2" height="4" fill="#1a0033"/><rect x="7" y="12" width="2" height="4" fill="#1a0033"/>
    </svg>`;

  if (monsterName.includes('เจ้าแห่งปราสาท') || (isBoss && zone === 5))
    return `<svg width="72" height="72" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="0" y="6" width="3" height="10" fill="#110022"/><rect x="15" y="6" width="3" height="10" fill="#110022"/>
      <rect x="3" y="0" width="12" height="4" fill="#440088"/>
      <rect x="3" y="0" width="2" height="2" fill="#8800ff"/><rect x="7" y="0" width="4" height="2" fill="#8800ff"/><rect x="13" y="0" width="2" height="2" fill="#8800ff"/>
      <rect x="8" y="0" width="2" height="1" fill="#ff00ff"/>
      <rect x="4" y="3" width="10" height="7" fill="#223355"/>
      <rect x="5" y="5" width="3" height="3" fill="#aa00ff"/><rect x="10" y="5" width="3" height="3" fill="#aa00ff"/>
      <rect x="5" y="5" width="2" height="2" fill="#ff44ff"/><rect x="10" y="5" width="2" height="2" fill="#ff44ff"/>
      <rect x="6" y="9" width="6" height="1" fill="#112244"/>
      <rect x="3" y="10" width="12" height="5" fill="#1a0033"/><rect x="5" y="11" width="8" height="3" fill="#220044"/>
      <rect x="3" y="14" width="12" height="1" fill="#440088"/><rect x="8" y="14" width="2" height="1" fill="#ff00ff"/>
      <rect x="4" y="15" width="4" height="3" fill="#110022"/><rect x="10" y="15" width="4" height="3" fill="#110022"/>
    </svg>`;

  // ── ZONE 6 อาณาจักรโกลาหล ──────────────────────────────────
  if (monsterName.includes('ปีศาจโกลาหล'))
    return `<svg width="48" height="56" viewBox="0 0 12 14" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="0" y="3" width="2" height="2" fill="#880055"/><rect x="10" y="3" width="2" height="2" fill="#880055"/>
      <rect x="1" y="1" width="2" height="2" fill="#660044"/><rect x="9" y="1" width="2" height="2" fill="#660044"/>
      <rect x="3" y="1" width="6" height="5" fill="#aa0066"/>
      <rect x="4" y="2" width="1" height="1" fill="#ff00ff"/><rect x="6" y="2" width="1" height="1" fill="#ff00ff"/><rect x="8" y="2" width="1" height="1" fill="#ff00ff"/>
      <rect x="4" y="4" width="4" height="1" fill="#ff44ff"/>
      <rect x="2" y="6" width="8" height="4" fill="#880055"/><rect x="1" y="7" width="10" height="2" fill="#aa0066"/>
      <rect x="2" y="5" width="1" height="2" fill="#bb0077"/><rect x="9" y="5" width="1" height="2" fill="#bb0077"/>
      <rect x="2" y="10" width="2" height="3" fill="#880055"/><rect x="5" y="10" width="2" height="4" fill="#770044"/><rect x="8" y="10" width="2" height="3" fill="#880055"/>
    </svg>`;

  if (monsterName.includes('อสูรจักรวาล'))
    return `<svg width="56" height="56" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="1" y="1" width="12" height="12" fill="#0a0a1e"/>
      <rect x="2" y="2" width="1" height="1" fill="#ffffff"/><rect x="6" y="1" width="1" height="1" fill="#ffffff"/>
      <rect x="11" y="3" width="1" height="1" fill="#ffffff"/><rect x="1" y="8" width="1" height="1" fill="#aaaaff"/>
      <rect x="12" y="9" width="1" height="1" fill="#aaaaff"/>
      <rect x="3" y="2" width="8" height="8" fill="#0000cc"/><rect x="4" y="3" width="6" height="6" fill="#0033ff"/>
      <rect x="5" y="4" width="4" height="4" fill="#0055ff"/><rect x="6" y="5" width="2" height="2" fill="#ffffff"/>
      <rect x="4" y="4" width="2" height="2" fill="#00ccff"/><rect x="8" y="4" width="2" height="2" fill="#00ccff"/>
      <rect x="1" y="4" width="3" height="1" fill="#0033ff"/><rect x="10" y="4" width="3" height="1" fill="#0033ff"/>
      <rect x="1" y="7" width="3" height="1" fill="#0033ff"/><rect x="10" y="7" width="3" height="1" fill="#0033ff"/>
      <rect x="3" y="10" width="2" height="3" fill="#0022bb"/><rect x="7" y="10" width="2" height="3" fill="#0022bb"/><rect x="5" y="11" width="4" height="2" fill="#0022bb"/>
    </svg>`;

  if (monsterName.includes('เทพมืด'))
    return `<svg width="56" height="64" viewBox="0 0 14 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="0" y="3" width="4" height="9" fill="#110022"/><rect x="0" y="3" width="3" height="7" fill="#220033"/>
      <rect x="10" y="3" width="4" height="9" fill="#110022"/><rect x="11" y="3" width="3" height="7" fill="#220033"/>
      <rect x="4" y="0" width="6" height="2" fill="#440066"/><rect x="5" y="0" width="4" height="1" fill="#6600aa"/>
      <rect x="4" y="1" width="6" height="6" fill="#331144"/>
      <rect x="5" y="3" width="2" height="2" fill="#ffcc00"/><rect x="7" y="3" width="2" height="2" fill="#ffcc00"/>
      <rect x="5" y="3" width="1" height="1" fill="#ffffff"/><rect x="7" y="3" width="1" height="1" fill="#ffffff"/>
      <rect x="5" y="6" width="4" height="1" fill="#220033"/>
      <rect x="3" y="7" width="8" height="6" fill="#221133"/><rect x="4" y="8" width="6" height="4" fill="#332244"/>
      <rect x="6" y="8" width="2" height="4" fill="#440066"/><rect x="4" y="10" width="6" height="1" fill="#440066"/>
      <rect x="4" y="13" width="2" height="3" fill="#221133"/><rect x="8" y="13" width="2" height="3" fill="#221133"/>
    </svg>`;

  if (monsterName.includes('อสูรนิรันดร์'))
    return `<svg width="56" height="64" viewBox="0 0 14 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="1" y="3" width="4" height="8" fill="#110011"/><rect x="9" y="3" width="4" height="8" fill="#110011"/>
      <rect x="3" y="1" width="8" height="6" fill="#330033"/>
      <rect x="4" y="2" width="2" height="2" fill="#ff00ff"/><rect x="8" y="2" width="2" height="2" fill="#ff00ff"/>
      <rect x="4" y="4" width="2" height="1" fill="#cc00cc"/><rect x="8" y="4" width="2" height="1" fill="#cc00cc"/>
      <rect x="4" y="6" width="6" height="1" fill="#220022"/>
      <rect x="2" y="7" width="10" height="6" fill="#440044"/><rect x="3" y="8" width="8" height="4" fill="#550055"/>
      <rect x="5" y="8" width="4" height="4" fill="#330033"/><rect x="6" y="9" width="2" height="2" fill="#ff00ff"/>
      <rect x="3" y="13" width="3" height="3" fill="#330033"/><rect x="8" y="13" width="3" height="3" fill="#330033"/>
    </svg>`;

  if (monsterName.includes('ผู้พิทักษ์โกลาหล'))
    return `<svg width="64" height="64" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="0" y="4" width="5" height="8" fill="#220033"/><rect x="0" y="4" width="4" height="6" fill="#330044"/>
      <rect x="11" y="4" width="5" height="8" fill="#220033"/><rect x="12" y="4" width="4" height="6" fill="#330044"/>
      <rect x="4" y="0" width="3" height="5" fill="#660088"/><rect x="9" y="0" width="3" height="5" fill="#660088"/>
      <rect x="3" y="2" width="10" height="7" fill="#550066"/>
      <rect x="4" y="4" width="3" height="3" fill="#ff00aa"/><rect x="9" y="4" width="3" height="3" fill="#ff00aa"/>
      <rect x="4" y="4" width="2" height="2" fill="#ff44cc"/><rect x="9" y="4" width="2" height="2" fill="#ff44cc"/>
      <rect x="5" y="8" width="6" height="1" fill="#330044"/>
      <rect x="2" y="9" width="12" height="5" fill="#440055"/><rect x="4" y="10" width="8" height="3" fill="#550066"/>
      <rect x="3" y="14" width="4" height="2" fill="#330044"/><rect x="9" y="14" width="4" height="2" fill="#330044"/>
    </svg>`;

  if (monsterName.includes('เทพแห่งโกลาหล') || (isBoss && zone === 6))
    return `<svg width="80" height="80" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="0" y="5" width="3" height="3" fill="#550044"/><rect x="17" y="5" width="3" height="3" fill="#550044"/>
      <rect x="0" y="12" width="3" height="3" fill="#330033"/><rect x="17" y="12" width="3" height="3" fill="#330033"/>
      <rect x="7" y="0" width="6" height="3" fill="#440055"/>
      <rect x="0" y="5" width="6" height="10" fill="#220033"/><rect x="0" y="5" width="5" height="8" fill="#330044"/><rect x="0" y="5" width="4" height="6" fill="#440055"/>
      <rect x="14" y="5" width="6" height="10" fill="#220033"/><rect x="15" y="5" width="5" height="8" fill="#330044"/><rect x="16" y="5" width="4" height="6" fill="#440055"/>
      <rect x="4" y="0" width="4" height="7" fill="#880099"/><rect x="12" y="0" width="4" height="7" fill="#880099"/>
      <rect x="5" y="2" width="10" height="9" fill="#550066"/>
      <rect x="6" y="4" width="3" height="3" fill="#ff00ff"/><rect x="11" y="4" width="3" height="3" fill="#ff00ff"/>
      <rect x="6" y="4" width="2" height="2" fill="#ff88ff"/><rect x="11" y="4" width="2" height="2" fill="#ff88ff"/>
      <rect x="6" y="4" width="1" height="1" fill="#ffffff"/><rect x="11" y="4" width="1" height="1" fill="#ffffff"/>
      <rect x="7" y="10" width="6" height="1" fill="#330033"/>
      <rect x="8" y="10" width="1" height="1" fill="#ff00ff"/><rect x="11" y="10" width="1" height="1" fill="#ff00ff"/>
      <rect x="4" y="11" width="12" height="6" fill="#440055"/><rect x="6" y="12" width="8" height="4" fill="#550066"/>
      <rect x="9" y="12" width="2" height="4" fill="#ff00ff"/><rect x="6" y="14" width="8" height="1" fill="#ff00ff"/>
      <rect x="5" y="17" width="4" height="3" fill="#330033"/><rect x="11" y="17" width="4" height="3" fill="#330033"/>
    </svg>`;

  // fallback
  const colors = ['#cc4444','#cc8844','#4444cc','#cc44cc','#44cccc','#884400'];
  const col = colors[(zone - 1) % colors.length];
  return `<svg width="48" height="56" viewBox="0 0 12 14" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <rect x="2" y="0" width="8" height="6" fill="${col}"/>
    <rect x="4" y="2" width="2" height="2" fill="#ffff00"/><rect x="7" y="2" width="2" height="2" fill="#ffff00"/>
    <rect x="4" y="4" width="5" height="1" fill="#880000"/>
    <rect x="2" y="6" width="8" height="4" fill="${col}"/>
    <rect x="2" y="10" width="3" height="3" fill="${col}"/><rect x="7" y="10" width="3" height="3" fill="${col}"/>
  </svg>`;
}

// ---------- Start / show / hide ----------

function startBattle(monster) {
  stopAuto();
  G.battleInProgress    = false;
  G.currentMonster      = null;
  _skillCooldowns  = {};
  _skillBuffs      = {};

  const stats = getMonsterStats(G.currentZone, monster.tier, monster.isBoss);
  G.currentMonster      = {...monster, zone:G.currentZone};
  G.currentMonsterHp    = stats.maxHp;
  G.currentMonsterMaxHp = stats.maxHp;
  G.battleInProgress    = true;
  G.monsterPoisonTurns  = 0;
  G.monsterBurnTurns    = 0;
  G.turnCount           = 0;
  showBattleContent(monster, stats);
  logBattle(`<span class="log-sys">⚔ เริ่มต่อสู้กับ ${monster.name}! HP:${stats.maxHp} ATK:${stats.atk}</span>`);
}

function showBattleContent(monster, stats) {
  document.getElementById('battle-content').style.display    = 'block';
  document.getElementById('monster-list-area').style.display = 'none';
  const stonePanel = document.getElementById('stone-lore-panel');
  if (stonePanel) stonePanel.style.display = 'none';

  // แสดง pixel art arena
  const arena = document.getElementById('pixel-battle-arena');
  if (arena) {
    const cls = CLASSES ? CLASSES.find(c => c.id === G.classId) : null;
    const playerSvg  = (typeof getPlayerSpriteWithCosmetic !== 'undefined')
      ? getPlayerSpriteWithCosmetic(G.classId || 'warrior', G.classTier || 1, G.cosmeticTier || 1)
      : getPlayerSprite(G.classId || 'warrior', G.classTier || 1);
    const monsterSvg = getMonsterSprite(monster.name, monster.isBoss, G.currentZone, monster.img);
    arena.innerHTML = `
      <div id="pixel-player" class="pixel-fighter pixel-player-side">${playerSvg}</div>
      <div class="pixel-vs">⚔</div>
      <div id="pixel-monster" class="pixel-fighter pixel-monster-side">${monsterSvg}</div>
    `;
    arena.style.display = 'flex';
  if (monster.isBoss) {
    arena.style.boxShadow = '0 0 30px rgba(255,100,0,.3) inset, 0 0 60px rgba(255,50,0,.15)';
    arena.style.borderColor = '#ff6600';
  } else {
    arena.style.boxShadow = '';
    arena.style.borderColor = '';
  }
  }

  document.getElementById('mon-sprite').style.display = 'none';
  document.getElementById('mon-name').textContent    = monster.name + (monster.isBoss ? ' 👑' : '');
  document.getElementById('mon-type').textContent    = monster.isBoss ? '🔴 บอสศัตรู' : 'ศัตรูทั่วไป';
  document.getElementById('mon-stats').textContent   = `ATK: ${stats.atk}`;
  updateMonsterHpBar();
  document.getElementById('btn-attack').disabled = false;
  renderSkillBar();
}

function hideBattleContent() {
  // reset combat state ทั้งหมด
  stopAuto();
  G.battleInProgress = false;
  G.currentMonster   = null;
  G.currentMonsterHp = 0;
  G.currentMonsterMaxHp = 0;
  G.monsterPoisonTurns = 0;
  G.monsterBurnTurns   = 0;
  G.turnCount = 0;

  document.getElementById('battle-content').style.display    = 'none';
  document.getElementById('monster-list-area').style.display = 'block';
  document.getElementById('btn-attack').disabled = false;

  const arena = document.getElementById('pixel-battle-arena');
  if (arena) { arena.innerHTML = ''; arena.style.display = 'none'; }

  document.getElementById('mon-sprite').style.display = '';
  renderMonsterList();
}

function updateMonsterHpBar() {
  const pct  = Math.max(0, (G.currentMonsterHp / G.currentMonsterMaxHp) * 100);
  const bar  = document.getElementById('mon-hp-bar');
  bar.style.width = pct + '%';
  bar.style.background = pct > 50
    ? 'linear-gradient(90deg,#cc2222,#ff4444)'
    : pct > 25
      ? 'linear-gradient(90deg,#cc6600,#ff9900)'
      : 'linear-gradient(90deg,#880000,#ff2200)';
  document.getElementById('mon-hp-text').textContent = `${Math.max(0, G.currentMonsterHp)}/${G.currentMonsterMaxHp}`;
}

// ---------- Skill system ----------

let _skillCooldowns  = {};
let _skillBuffs      = {};

// สกิลมาจาก Skill Tree เท่านั้น (G.unlockedSkills)
function _getSkills() {
  if (!G.unlockedSkills || G.unlockedSkills.length === 0) return [];
  const treeDefs = (typeof SKILL_TREES !== 'undefined') ? (SKILL_TREES[G.classId] || []) : [];
  return G.unlockedSkills.map(sid => {
    const node = treeDefs.find(n => n.type === 'skill' && n.skill && n.skill.id === sid);
    if (!node) return null;
    return { id: node.skill.id, name: node.skill.name, icon: node.icon || '⚡', desc: node.skill.desc, cd: node.skill.cooldown || 5, tier: node.skill.tier || 1 };
  }).filter(Boolean);
}

// G.equippedSkills — array of skill IDs the player chose to equip (max 4)
function _getEquippedSkills() {
  if (!G.equippedSkills) G.equippedSkills = [];
  const allSkills = _getSkills();
  if (G.equippedSkills.length === 0 && allSkills.length > 0) {
    G.equippedSkills = allSkills.slice(0, 4).map(s => s.id);
  }
  return allSkills.filter(s => G.equippedSkills.includes(s.id));
}

function renderSkillBar() {
  const bar = document.getElementById('skill-bar');
  if (!bar) return;
  const allSkills = _getSkills();
  if (allSkills.length === 0) {
    bar.innerHTML = '<div style="color:var(--text2);font-size:.72rem;padding:.3rem .5rem">🌳 อัพ Skill Tree เพื่อปลดล็อคสกิล</div>';
    return;
  }
  const equipped = _getEquippedSkills();
  bar.innerHTML = '';
  equipped.forEach(sk => {
    const cd  = _skillCooldowns[sk.id] || 0;
    const btn = document.createElement('button');
    const tierColors = {1:'#4a9',2:'#49f',3:'#a5f',4:'#fa0'};
    const tierBorder = tierColors[sk.tier] || '#4a9';
    btn.className = 'skill-btn tree-skill' + (cd > 0 ? ' on-cd' : '');
    btn.style.borderColor = tierBorder;
    btn.disabled  = cd > 0 || !G.battleInProgress;
    btn.title     = `${sk.name}\n${sk.desc}\nCD: ${sk.cd} ตา`;
    btn.innerHTML = `<span class="sk-icon">${sk.icon}</span><span class="sk-name">${sk.name}</span>${cd > 0 ? `<span class="sk-cd">${cd}</span>` : ''}`;
    btn.onclick   = () => useSkill(sk.id);
    bar.appendChild(btn);
  });
  if (allSkills.length > 0) {
    const manageBtn = document.createElement('button');
    manageBtn.className = 'skill-btn';
    manageBtn.style.cssText = 'border-color:#888;opacity:.8;min-width:2.4rem;padding:.25rem .4rem';
    manageBtn.innerHTML = '⚙';
    manageBtn.title = 'จัดการสกิล';
    manageBtn.onclick = () => openSkillSelectModal();
    bar.appendChild(manageBtn);
  }
}

function openSkillSelectModal() {
  const existing = document.getElementById('skill-select-modal');
  if (existing) { existing.remove(); return; }
  const allSkills = _getSkills();
  if (!G.equippedSkills) G.equippedSkills = [];

  const overlay = document.createElement('div');
  overlay.id = 'skill-select-modal';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:3000;display:flex;align-items:center;justify-content:center;';
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };

  const tierLabel = {1:'T1 เริ่มต้น',2:'T2 วิวัฒนาการ',3:'T3 ปรมาจารย์',4:'T4 ตำนาน'};
  const tierColor = {1:'#4a9',2:'#49f',3:'#a5f',4:'#fa0'};
  const rows = allSkills.reduce((acc, sk) => { (acc[sk.tier||1] = acc[sk.tier||1]||[]).push(sk); return acc; }, {});

  let html = `<div style="background:#1a1a2e;border:2px solid #444;border-radius:12px;max-width:480px;width:95%;max-height:80vh;overflow-y:auto;padding:1rem;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.8rem">
      <h3 style="margin:0;color:#fff;font-size:1rem">⚡ จัดการสกิล <span style="color:#888;font-size:.75rem">(เลือกได้สูงสุด 4)</span></h3>
      <button onclick="document.getElementById('skill-select-modal').remove()" style="background:none;border:none;color:#aaa;font-size:1.2rem;cursor:pointer">✕</button>
    </div>`;

  for (let t = 1; t <= 4; t++) {
    if (!rows[t]) continue;
    html += `<div style="margin-bottom:.6rem"><div style="color:${tierColor[t]||'#aaa'};font-size:.72rem;font-weight:700;margin-bottom:.3rem;text-transform:uppercase">${tierLabel[t]||'Tier '+t}</div><div style="display:flex;flex-wrap:wrap;gap:.4rem">`;
    rows[t].forEach(sk => {
      const isEq = G.equippedSkills.includes(sk.id);
      const cd   = _skillCooldowns[sk.id] || 0;
      html += `<button onclick="toggleEquipSkill('${sk.id}')"
        style="background:${isEq?'rgba(100,200,100,.15)':'rgba(255,255,255,.04)'};
               border:2px solid ${isEq?(tierColor[t]||'#4a9'):'#333'};
               border-radius:8px;padding:.4rem .6rem;cursor:pointer;
               color:${isEq?'#fff':'#aaa'};font-size:.75rem;display:flex;flex-direction:column;
               align-items:center;gap:.15rem;min-width:80px;max-width:100px;position:relative"
        title="${sk.name}: ${sk.desc} (CD ${sk.cd}ตา)" id="ssk-${sk.id}">
        ${isEq ? `<span style="position:absolute;top:-5px;right:-5px;background:#4a9;border-radius:50%;width:14px;height:14px;font-size:10px;display:flex;align-items:center;justify-content:center">✓</span>` : ''}
        <span style="font-size:1.1rem">${sk.icon}</span>
        <span style="font-size:.7rem;text-align:center;line-height:1.1">${sk.name}</span>
        <span style="font-size:.62rem;color:#666">CD:${sk.cd}</span>
      </button>`;
    });
    html += '</div></div>';
  }
  html += `<div style="margin-top:.8rem;padding:.5rem;background:rgba(255,255,255,.05);border-radius:6px;font-size:.72rem;color:#888">
    เลือกแล้ว: <span id="equipped-count" style="color:#4a9;font-weight:700">${G.equippedSkills.length}</span>/4
  </div></div>`;

  overlay.innerHTML = html;
  document.body.appendChild(overlay);
}

function toggleEquipSkill(id) {
  if (!G.equippedSkills) G.equippedSkills = [];
  const idx = G.equippedSkills.indexOf(id);
  if (idx >= 0) {
    G.equippedSkills.splice(idx, 1);
  } else {
    if (G.equippedSkills.length >= 4) {
      G.equippedSkills.shift();
    }
    G.equippedSkills.push(id);
  }
  // re-render modal without closing
  const old = document.getElementById('skill-select-modal');
  if (old) { old.remove(); openSkillSelectModal(); }
  renderSkillBar();
  saveGame();
}

function tickSkillCooldowns() {
  let changed = false;
  for (const k in _skillCooldowns) {
    if (_skillCooldowns[k] > 0) { _skillCooldowns[k]--; changed = true; }
  }
  // tick skill buffs
  for (const k in _skillBuffs) {
    if (typeof _skillBuffs[k] === 'number' && _skillBuffs[k] > 0) {
      _skillBuffs[k]--;
      changed = true;
    }
  }
  if (changed) renderSkillBar();
}

function useSkill(id) {
  if (!G.battleInProgress || !G.currentMonster) return;
  const skills = _getSkills();
  const sk = skills.find(s => s.id === id);
  if (!sk) return;
  if ((_skillCooldowns[id] || 0) > 0) return;

  document.getElementById('btn-attack').disabled = true;
  _skillCooldowns[id] = sk.cd;

  const eqBonus  = (typeof getEquippedStatBonus === 'function') ? getEquippedStatBonus() : { atk:0 };
  let baseAtk    = G.baseAtk + (eqBonus.atk || 0) + Math.floor(Math.random() * G.level) + 1;

  const monStats = getMonsterStats(G.currentZone, G.currentMonster.tier, G.currentMonster.isBoss);
  let dmg = 0;
  let skipMonsterTurn = false;

  switch (id) {
    case 'slam':
      dmg = Math.floor(baseAtk * 2.5);
      _skillBuffs.slamStun = true;
      logBattle(`<span class="log-crit">💥 กระทืบพื้น! ${dmg} ดาเมจ + stun 1 ตา</span>`);
      break;
    case 'dragon_breath':
      dmg = Math.floor(baseAtk * 2);
      G.monsterBurnTurns = 3;
      logBattle(`<span class="log-crit">🐉 ลมหายใจมังกร! ${dmg} ดาเมจ + เผา 3 ตา</span>`);
      break;
    case 'iron_shield':
      _skillBuffs.ironShield = 3;
      skipMonsterTurn = true;
      logBattle(`<span class="log-heal">🏰 โล่เหล็กกล้า! ลด DMG 50% ใน 3 ตา</span>`);
      break;
    case 'arcane_burst':
      dmg = Math.floor(baseAtk * 4);
      logBattle(`<span class="log-crit">💥 เวทระเบิด! ${dmg} ดาเมจ</span>`);
      break;
    case 'dark_nova':
      dmg = Math.floor(baseAtk * 3);
      _skillBuffs.darkNovaDebuff = 3;
      logBattle(`<span class="log-crit">🌑 โนวาแห่งความมืด! ${dmg} ดาเมจ + DEF ศัตรู -50%</span>`);
      break;
    case 'holy_light':
      dmg = Math.floor(baseAtk * 2);
      { const heal = Math.floor(G.maxHp * 0.3); G.hp = Math.min(G.maxHp, G.hp + heal); G.totalHpHealed = (G.totalHpHealed||0)+heal; updateTopBar(); logBattle(`<span class="log-heal">☀️ แสงศักดิ์สิทธิ์! ${dmg} ดาเมจ + ฟื้น ${heal} HP</span>`); }
      break;
    case 'shadow_step':
      _skillBuffs.shadowStep = true;
      logBattle(`<span class="log-heal">🌑 ก้าวเงา! หลบดาเมจรอบถัดไป + โจมตี ×2</span>`);
      dmg = Math.floor(baseAtk * 2);
      logBattle(`<span class="log-crit">🗡 Shadow Strike! ${dmg} ดาเมจ</span>`);
      break;
    case 'plunder': {
      dmg = Math.floor(baseAtk * 2);
      const extraGold = Math.floor(Math.random() * G.level * 2) + 5;
      G.gold += extraGold;
      logBattle(`<span class="log-crit">💰 ปล้นสะดม! ${dmg} ดาเมจ + 💰+${extraGold} ทอง</span>`);
      break;
    }
    case 'arrow_rain':
      dmg = Math.floor(baseAtk * 1.2) * 3;
      logBattle(`<span class="log-crit">🌧 ฝนลูกธนู! 3 ครั้ง รวม ${dmg} ดาเมจ</span>`);
      break;
    case 'hunters_mark':
      _skillBuffs.huntersMark = 5;
      skipMonsterTurn = true;
      logBattle(`<span class="log-heal">🦅 ตราล่า! ดาเมจ +100% ใน 5 ตา</span>`);
      break;
    case 'wind_shot':
      dmg = Math.floor((G.baseAtk + (eqBonus.atk||0)) * 3.5);
      logBattle(`<span class="log-crit">🌪️ ลูกธนูลม! ${dmg} ดาเมจ (ทะลุ DEF, ไม่พลาด)</span>`);
      break;
    case 'divine_heal': {
      const dHeal = Math.floor(G.maxHp * 0.4); G.hp = Math.min(G.maxHp, G.hp + dHeal);
      G.totalHpHealed = (G.totalHpHealed||0)+dHeal; updateTopBar();
      logBattle(`<span class="log-heal">💊 รักษาศักดิ์สิทธิ์! ฟื้น ${dHeal} HP</span>`);
      break;
    }
    case 'holy_aura':
      _skillBuffs.holyAura = 5;
      skipMonsterTurn = true;
      logBattle(`<span class="log-heal">🌈 ออร่าศักดิ์สิทธิ์! ฟื้น 15% HP/ตา ใน 5 ตา</span>`);
      break;
    case 'holy_smite':
      dmg = Math.floor(baseAtk * (G.currentMonster?.isBoss ? 8 : 4));
      { const smiteHeal = Math.floor(G.maxHp * 0.15); G.hp = Math.min(G.maxHp, G.hp + smiteHeal); G.totalHpHealed=(G.totalHpHealed||0)+smiteHeal; updateTopBar(); }
      logBattle(`<span class="log-crit">⚡ สมิตศักดิ์สิทธิ์! ${dmg} ดาเมจ${G.currentMonster?.isBoss?' (×8 vs บอส)':''} + ฟื้น HP</span>`);
      break;

    // ── T1 skills ──
    case 'heavy_blow':
      dmg = Math.floor(baseAtk * 2);
      logBattle(`<span class="log-crit">💢 โจมตีหนัก! ${dmg} ดาเมจ</span>`);
      break;
    case 'magic_bolt':
      dmg = Math.floor(baseAtk * 1.8);
      G.monsterBurnTurns = Math.max(G.monsterBurnTurns, 1);
      logBattle(`<span class="log-crit">🔥 ลูกไฟเล็ก! ${dmg} ดาเมจ + เผา 1 ตา</span>`);
      break;
    case 'quick_stab':
      dmg = Math.floor(baseAtk * 1.2) * 2;
      logBattle(`<span class="log-crit">🗡 แทงเร็ว! ${dmg} ดาเมจ (2 ครั้ง)</span>`);
      break;
    case 'precise_shot':
      dmg = Math.floor(baseAtk * 2 * (Math.random() < (0.05 + (G.critBonusFromTree||0) + 0.2) ? 2 : 1));
      logBattle(`<span class="log-crit">🎯 ยิงแม่น! ${dmg} ดาเมจ (ทะลุ DEF 50%)</span>`);
      break;
    case 'holy_strike_t1':
      dmg = Math.floor(baseAtk * 1.8);
      { const ht1heal = Math.floor(G.maxHp * 0.1); G.hp = Math.min(G.maxHp, G.hp + ht1heal); G.totalHpHealed=(G.totalHpHealed||0)+ht1heal; updateTopBar(); }
      logBattle(`<span class="log-crit">✨ ตีศักดิ์สิทธิ์! ${dmg} ดาเมจ + ฟื้น HP 10%</span>`);
      break;

    // ── T2 skills ──
    case 'blade_storm':
      dmg = Math.floor(baseAtk * 0.8) * 4;
      _skillBuffs.darkNovaDebuff = (_skillBuffs.darkNovaDebuff||0) + 1;
      logBattle(`<span class="log-crit">🌀 พายุดาบ! 4 ครั้ง รวม ${dmg} ดาเมจ + ลด DEF ศัตรู</span>`);
      break;
    case 'blizzard':
      dmg = Math.floor(baseAtk * 1.0) * 3;
      _skillBuffs.blizzardDebuff = 3;
      logBattle(`<span class="log-crit">❄️ พายุน้ำแข็ง! 3 ครั้ง รวม ${dmg} ดาเมจ + ลด ATK ศัตรู 40%</span>`);
      break;
    case 'death_mark': {
      _skillBuffs.deathMark = 2;
      skipMonsterTurn = true;
      logBattle(`<span class="log-heal">☠ เงามรณะ! ตราชีวิต — โจมตีต่อไป ×4 ดาเมจ</span>`);
      break;
    }
    case 'triple_shot':
      dmg = Math.floor(baseAtk * 1.2) * 2 + Math.floor(baseAtk * 1.2 * 2);
      logBattle(`<span class="log-crit">🏹 ยิงสามลูก! รวม ${dmg} ดาเมจ (ลูกกลาง crit)</span>`);
      break;
    case 'light_shield':
      _skillBuffs.lightShield = 3;
      _skillBuffs.lightShieldRegen = 3;
      skipMonsterTurn = true;
      logBattle(`<span class="log-heal">🌟 โล่แสง! ลด DMG 40% ใน 3 ตา + ฟื้น HP/ตา</span>`);
      break;

    // ── T4 branch A skills ──
    case 'doom_nova':
      dmg = Math.floor(baseAtk * 5);
      G.monsterBurnTurns = Math.max(G.monsterBurnTurns, 4);
      G.monsterPoisonTurns = Math.max(G.monsterPoisonTurns, 4);
      _skillBuffs.darkNovaDebuff = (_skillBuffs.darkNovaDebuff||0) + 3;
      logBattle(`<span class="log-crit">💀 โนวาหายนะ! ${dmg} ดาเมจ + เผา+พิษ 4 ตา + DEF debuff ×3</span>`);
      break;
    case 'void_curse':
      dmg = Math.floor(baseAtk * 6);
      G.monsterBurnTurns = Math.max(G.monsterBurnTurns, 5);
      G.monsterPoisonTurns = Math.max(G.monsterPoisonTurns, 5);
      _skillBuffs.darkNovaDebuff = 5;
      logBattle(`<span class="log-crit">🌌 สาปจักรวาล! ${dmg} ดาเมจ + พิษ+เผา+DEF debuff 5 ตา</span>`);
      break;
    case 'shadow_execute': {
      const isBelow30 = G.currentMonsterHp < G.currentMonsterMaxHp * 0.3;
      if (isBelow30) {
        dmg = G.currentMonsterHp;
        logBattle(`<span class="log-crit">👑 จ้องมรณะ! สังหารทันที!</span>`);
      } else {
        dmg = Math.floor(baseAtk * 8);
        logBattle(`<span class="log-crit">👑 จ้องมรณะ! ${dmg} ดาเมจ crit</span>`);
      }
      break;
    }
    case 'empire_plunder': {
      dmg = Math.floor(baseAtk * 1.8) * 5;
      const stats2 = getMonsterStats(G.currentZone, G.currentMonster.tier, G.currentMonster.isBoss);
      const bigGold = Math.floor(stats2.atk * (G.currentMonster.isBoss ? 6 : 2)) + 50;
      G.gold += bigGold;
      logBattle(`<span class="log-crit">💰 ปล้นจักรวรรดิ! 5 ครั้ง รวม ${dmg} ดาเมจ + 💰+${bigGold} ทอง</span>`);
      break;
    }
    case 'meteor_arrow':
      dmg = Math.floor(baseAtk * 7);
      _skillBuffs.meteorDoT = 5;
      logBattle(`<span class="log-crit">🌠 ดาวตก! ${dmg} ดาเมจ + DoT 15%HP/ตา 5 ตา</span>`);
      break;
    case 'thunder_storm': {
      dmg = Math.floor(baseAtk * 1.5 * 8);
      _skillBuffs.slamStun = true;
      logBattle(`<span class="log-crit">⚡ พายุสายฟ้า! 8 ลูก รวม ${dmg} ดาเมจ + stun 2 ตา</span>`);
      _skillBuffs.thunderStun = 2;
      break;
    }
    case 'eternal_fortress':
      _skillBuffs.eternalFortress = 2;
      _skillBuffs.eternalCounter = 2;
      skipMonsterTurn = true;
      logBattle(`<span class="log-heal">🏯 ปราการนิรันดร์! บล็อกดาเมจ 2 ตา + โจมตีตอบ ×3 เตรียมพร้อม</span>`);
      break;
    case 'divine_radiance': {
      G.hp = G.maxHp;
      G.totalHpHealed = (G.totalHpHealed||0) + G.maxHp;
      updateTopBar();
      _skillBuffs.divineRadiance = 4;
      skipMonsterTurn = true;
      logBattle(`<span class="log-heal">☀️ พระประภา! ฟื้น HP เต็ม + เกราะแสง -70% DMG 4 ตา + โจมตีตอบ ×2/ตา</span>`);
      break;
    }
    case 'final_judgment': {
      const monHP = G.currentMonsterMaxHp;
      dmg = Math.floor(monHP * (G.currentMonster?.isBoss ? 0.7 : 0.35));
      logBattle(`<span class="log-crit">👑 พิพากษา! ${dmg} ดาเมจ (${G.currentMonster?.isBoss?'70':'35'}% HP สูงสุดศัตรู)</span>`);
      break;
    }
    case 'heaven_rain': {
      let totalRain = 0;
      for (let i = 0; i < 6; i++) {
        const hit = Math.floor(baseAtk * 1.5);
        totalRain += hit;
        const healH = Math.floor(G.maxHp * 0.08);
        G.hp = Math.min(G.maxHp, G.hp + healH);
        G.totalHpHealed = (G.totalHpHealed||0) + healH;
      }
      dmg = totalRain;
      _skillBuffs.heavenRain = 5;
      updateTopBar();
      logBattle(`<span class="log-crit">🌟 ฝนแสงสวรรค์! 6 ลูก รวม ${dmg} ดาเมจ + ฟื้น 48% HP รวม + aura 5 ตา</span>`);
      break;
    }
    case 'backstab':
      dmg = Math.floor(baseAtk * (Math.random() < 0.15 ? 7 : 3.5));
      { const bsGold = Math.floor(Math.random() * 20) + 5; G.gold += bsGold; logBattle(`<span class="log-crit">🔪 แทงสังหาร! ${dmg} ดาเมจ + 💰+${bsGold}</span>`); }
      break;
  }

  if (dmg > 0) {
    G.currentMonsterHp -= dmg;
    floatDamage(dmg, true, true);
    const monEl = document.getElementById('pixel-monster');
    if (monEl) { monEl.classList.add('shake-anim'); setTimeout(() => monEl.classList.remove('shake-anim'), 300); }
  }
  playSound('attack');
  G.turnCount++;
  tickSkillCooldowns();
  updateMonsterHpBar();

  if (G.currentMonsterHp <= 0) { monsterDie(); return; }
  if (skipMonsterTurn) {
    document.getElementById('btn-attack').disabled = false;
    renderSkillBar();
  } else {
    setTimeout(() => monsterAttack(), 600);
  }
}

// ---------- Player attack ----------

function playerAttack() {
  if (!G.battleInProgress || !G.currentMonster) return;
  document.getElementById('btn-attack').disabled = true;

  // animate player attacking
  const playerEl = document.getElementById('pixel-player');
  if (playerEl) {
    playerEl.classList.add('attack-anim');
    setTimeout(() => playerEl.classList.remove('attack-anim'), 500);
  }

  const eqBonus = (typeof getEquippedStatBonus === 'function') ? getEquippedStatBonus() : { atk:0, def:0, hp:0, crit:0, speed:0 };
  const weapon  = G.equippedWeaponId ? G.inventory.find(i => i.uid === G.equippedWeaponId) : null;
  // eqBonus.atk already includes weapon slot + gloves — do NOT add weapon.atk separately
  let atk = G.baseAtk + (eqBonus.atk || 0) + Math.floor(Math.random() * G.level) + 1;
  // event modifiers
  const weatherMult  = (typeof getWeatherAtkMult  === 'function') ? getWeatherAtkMult()  : 1;
  const fatigueMult  = (typeof getFatigueAtkMult  === 'function') ? getFatigueAtkMult()  : 1;
  atk = Math.floor(atk * weatherMult * fatigueMult);

  const cls = CLASSES.find(c => c.id === G.classId);
  let critChance = .05 + (cls && cls.bonuses.critBonus ? cls.bonuses.critBonus : 0) + (eqBonus.crit || 0) / 100 + (G.critBonusFromTree || 0);
  let isCrit = Math.random() < critChance;

  let lifesteal = 0;
  if (weapon && weapon.effect) {
    if (weapon.effect.includes('crit×2') && G.turnCount % 3 === 0) isCrit = true;
    if (weapon.effect.includes('crit×3') && G.turnCount % 3 === 0) { isCrit = true; atk *= 3; }
    if (weapon.effect.includes('crit×5') && G.turnCount % 3 === 0) { isCrit = true; atk *= 5; }
    if (weapon.effect.includes('ดูดเลือด')) { const pct = parseInt(weapon.effect.match(/\d+/)[0]) / 100; lifesteal = Math.floor(atk * pct); }
    if (weapon.effect.includes('ยิง 2 ครั้ง'))           atk *= 2;
    if (weapon.effect.includes('ดาเมจ+30%')   && G.currentMonster.isBoss) atk = Math.floor(atk * 1.3);
    if (weapon.effect.includes('ดาเมจ×2 vs บอส')   && G.currentMonster.isBoss) atk *= 2;
    if (weapon.effect.includes('ดาเมจ×2 vs มังกร') && G.currentZone === 3)     atk *= 2;
    if (weapon.effect.includes('ทะลุ DEF 100%'))  atk += G.currentMonsterMaxHp * 0.05;
  }
  if (_skillBuffs.huntersMark > 0) atk = Math.floor(atk * 2.2);
  if (_skillBuffs.deathMark > 0) { atk = Math.floor(atk * 4); _skillBuffs.deathMark--; logBattle(`<span class="log-crit">☠ ตราชีวิตระเบิด! ×4 ดาเมจ</span>`); }
  if (isCrit) { atk = Math.floor(atk * 2); G.critCount = (G.critCount || 0) + 1; }

  G.currentMonsterHp -= atk;
  G.turnCount++;
  tickSkillCooldowns();
  if (typeof tickWeatherBuff === 'function') tickWeatherBuff();

  if (isCrit) {
    logBattle(`<span class="log-crit">💥 CRIT! ${atk} ดาเมจ!</span>`);
    _flashArena('#ff8800');
  } else {
    logBattle(`<span class="log-dmg">⚔ คุณโจมตี ${atk} ดาเมจ</span>`);
  }

  if (lifesteal > 0) {
    G.hp = Math.min(G.maxHp, G.hp + lifesteal);
    G.totalHpHealed = (G.totalHpHealed || 0) + lifesteal;
    logBattle(`<span class="log-heal">💚 ดูดเลือด +${lifesteal} HP</span>`);
  }
  playSound('attack');
  floatDamage(atk, true, isCrit);

  // DoT on monster
  const monStats = getMonsterStats(G.currentZone, G.currentMonster.tier, G.currentMonster.isBoss);
  if (G.monsterPoisonTurns > 0) {
    const pdmg = Math.floor(monStats.maxHp * .05);
    G.currentMonsterHp -= pdmg;
    logBattle(`<span class="log-dmg">☠ พิษ ${pdmg} ดาเมจ</span>`);
    G.monsterPoisonTurns--;
  }
  if (G.monsterBurnTurns > 0) {
    const bdmg = Math.floor(monStats.maxHp * .05);
    G.currentMonsterHp -= bdmg;
    logBattle(`<span class="log-dmg">🔥 เผา ${bdmg} ดาเมจ</span>`);
    G.monsterBurnTurns--;
  }
  if ((_skillBuffs.meteorDoT||0) > 0) {
    const meteorDmg = Math.floor(monStats.maxHp * 0.15);
    G.currentMonsterHp -= meteorDmg;
    logBattle(`<span class="log-dmg">🌠 ดาวตก DoT ${meteorDmg} ดาเมจ</span>`);
    _skillBuffs.meteorDoT--;
  }

  updateMonsterHpBar();

  // shake monster sprite
  const monEl = document.getElementById('pixel-monster');
  if (monEl) { monEl.classList.add('shake-anim'); setTimeout(() => monEl.classList.remove('shake-anim'), 300); }

  if (G.currentMonsterHp <= 0) { monsterDie(); return; }
  setTimeout(() => { monsterAttack(); }, 600);
}

// ---------- Monster attack ----------

function monsterAttack() {
  if (!G.battleInProgress) return;
  const stats  = getMonsterStats(G.currentZone, G.currentMonster.tier, G.currentMonster.isBoss);
  let monAtk   = stats.atk;
  const weapon = G.equippedWeaponId ? G.inventory.find(i => i.uid === G.equippedWeaponId) : null;
  if (weapon && weapon.effect && weapon.effect.includes('ชะลอ')) monAtk = Math.floor(monAtk * .9);
  const monWeatherMult = (typeof getWeatherAtkMult === 'function') ? getWeatherAtkMult() : 1;
  monAtk = Math.floor(monAtk * monWeatherMult);

  const eqBonus = (typeof getEquippedStatBonus === 'function') ? getEquippedStatBonus() : { def:0 };
  const totalDef = G.baseDef + (eqBonus.def || 0);
  if (_skillBuffs.darkNovaDebuff > 0) monAtk = Math.floor(monAtk * 0.5);
  if (_skillBuffs.blizzardDebuff > 0) { monAtk = Math.floor(monAtk * 0.6); _skillBuffs.blizzardDebuff--; }
  let dmgTaken = Math.max(1, monAtk - totalDef);
  if (_skillBuffs.slamStun)       { dmgTaken = 0; _skillBuffs.slamStun = false;       logBattle(`<span class="log-heal">💥 ศัตรูหยุดโจมตีจาก Slam!</span>`); }
  if (_skillBuffs.thunderStun > 0){ dmgTaken = 0; _skillBuffs.thunderStun--;           logBattle(`<span class="log-heal">⚡ ศัตรูถูก stun จาก Thunder Storm!</span>`); }
  if (_skillBuffs.shadowStep)     { dmgTaken = 0; _skillBuffs.shadowStep = false;      logBattle(`<span class="log-heal">🌑 หลบการโจมตีได้จาก Shadow Step!</span>`); }
  if (_skillBuffs.ironShield > 0)   dmgTaken = Math.floor(dmgTaken * 0.5);
  if (_skillBuffs.lightShield > 0) { dmgTaken = Math.floor(dmgTaken * 0.6); _skillBuffs.lightShield--; }
  if (_skillBuffs.eternalFortress > 0) {
    const counterDmg = Math.floor((G.baseAtk + ((typeof getEquippedStatBonus==='function'?getEquippedStatBonus():{atk:0}).atk||0)) * 3);
    G.currentMonsterHp -= counterDmg;
    dmgTaken = 0;
    _skillBuffs.eternalFortress--;
    logBattle(`<span class="log-crit">🏯 ปราการตอบโต้! ${counterDmg} ดาเมจ (บล็อกดาเมจ)</span>`);
  }
  if (_skillBuffs.divineRadiance > 0) {
    const radDmg = Math.floor((G.baseAtk + ((typeof getEquippedStatBonus==='function'?getEquippedStatBonus():{atk:0}).atk||0)) * 2);
    G.currentMonsterHp -= radDmg;
    dmgTaken = Math.floor(dmgTaken * 0.3);
    _skillBuffs.divineRadiance--;
    logBattle(`<span class="log-crit">☀️ แสงตอบโต้! ${radDmg} ดาเมจ (-70% DMG รับ)</span>`);
  }
  G.hp = Math.max(0, G.hp - dmgTaken);
  if (dmgTaken > 0) {
    G.totalDmgTaken = (G.totalDmgTaken || 0) + dmgTaken;
    logBattle(`<span class="log-dmg">💔 ${G.currentMonster.name} โจมตี ${dmgTaken} ดาเมจ${_skillBuffs.ironShield > 0 ? ' (Iron Shield)' : ''}</span>`);
    _flashArena('#ff0000');
  } else {
    logBattle(`<span class="log-heal">🛡 หลบการโจมตีของ ${G.currentMonster.name}!</span>`);
  }
  playSound('hit');
  floatDamage(dmgTaken, false, false);

  // shake player
  const playerEl = document.getElementById('pixel-player');
  if (playerEl) { playerEl.classList.add('hurt-anim'); setTimeout(() => playerEl.classList.remove('hurt-anim'), 300); }

  if (weapon && weapon.effect) {
    if (weapon.effect.includes('พิษ') && Math.random() < .3) { G.monsterPoisonTurns = 3; logBattle(`<span class="log-dmg">☠ ศัตรูติดพิษ!</span>`); }
    if (weapon.effect.includes('เผา') && Math.random() < .3) { G.monsterBurnTurns   = 3; logBattle(`<span class="log-dmg">🔥 ศัตรูถูกเผา!</span>`); }
  }

  // heal per turn จาก equipment
  const eqBonusH = (typeof getEquippedStatBonus === 'function') ? getEquippedStatBonus() : { healPerTurn:0 };
  if (eqBonusH.healPerTurn > 0) {
    G.hp = Math.min(G.maxHp, G.hp + eqBonusH.healPerTurn);
    G.totalHpHealed = (G.totalHpHealed || 0) + eqBonusH.healPerTurn;
  }
  // heal per turn จาก skill tree
  if ((G.regenBonusFromTree || 0) > 0) {
    const treeRegen = Math.floor(G.maxHp * G.regenBonusFromTree);
    if (treeRegen > 0) {
      G.hp = Math.min(G.maxHp, G.hp + treeRegen);
      G.totalHpHealed = (G.totalHpHealed || 0) + treeRegen;
    }
  }
  // holyAura per-turn heal
  if ((_skillBuffs.holyAura || 0) > 0) {
    const auraHeal = Math.floor(G.maxHp * 0.20);
    G.hp = Math.min(G.maxHp, G.hp + auraHeal);
    G.totalHpHealed = (G.totalHpHealed || 0) + auraHeal;
    logBattle(`<span class="log-heal">🌈 ออร่า ฟื้น ${auraHeal} HP</span>`);
    _skillBuffs.holyAura--;
  }
  // lightShield per-turn regen
  if ((_skillBuffs.lightShieldRegen||0) > 0) {
    const lsHeal = Math.floor(G.maxHp * 0.05);
    G.hp = Math.min(G.maxHp, G.hp + lsHeal);
    G.totalHpHealed = (G.totalHpHealed||0) + lsHeal;
    logBattle(`<span class="log-heal">🌟 โล่แสง ฟื้น ${lsHeal} HP</span>`);
    _skillBuffs.lightShieldRegen--;
  }
  // heavenRain per-turn regen
  if ((_skillBuffs.heavenRain||0) > 0) {
    const hrHeal = Math.floor(G.maxHp * 0.08);
    G.hp = Math.min(G.maxHp, G.hp + hrHeal);
    G.totalHpHealed = (G.totalHpHealed||0) + hrHeal;
    logBattle(`<span class="log-heal">🌟 ฝนแสง ฟื้น ${hrHeal} HP</span>`);
    _skillBuffs.heavenRain--;
  }

  updateTopBar();
  document.getElementById('btn-attack').disabled = false;
  renderSkillBar();
  if (G.hp <= 0) playerDie();
}

// ---------- Monster die — spawn ใหม่ทันที ----------

function monsterDie() {
  G.battleInProgress = false;
  const monster = G.currentMonster;
  const key = `${G.currentZone}_${monster.tier}`;
  G.defeatedMonsters[key] = true;
  G.totalKills++;
  G.sessionKills++;
  if (monster.isBoss) {
    G.bossKills++;
    G.chests.boss = (G.chests.boss || 0) + 1;
    if (typeof tryDropLegendaryCosmetic === 'function' && tryDropLegendaryCosmetic()) {
      logBattle(`<span style="color:#ffdd00;font-weight:700">✨ ตำนาน! ได้รับชุด ตำนาน จากบอส! (Cosmetic T6)</span>`);
    }
  }

  playEnemyDeathVoice(G.currentZone, monster.isBoss);

  let stats  = getMonsterStats(G.currentZone, monster.tier, monster.isBoss);
  // apply event monster modifiers
  if (typeof applyMonsterEventMods === 'function') stats = applyMonsterEventMods(stats);
  // Full RPG: EXP จาก kill สูงกว่า 8× เพราะไม่มี task EXP
  const killExpBase = G.gameMode === 'fullrpg' ? 0.5 : 0.03;
  let expGain  = Math.floor(stats.maxHp * killExpBase);
  if (monster.isBoss) expGain *= 3;
  // Full RPG boss bonus
  if (G.gameMode === 'fullrpg' && monster.isBoss) expGain = Math.floor(expGain * 1.5);
  // apply event exp rewards (ferocious ×3, rare ×2 etc.)
  let evExpMult = 1;
  if (typeof applyMonsterEventRewards === 'function') evExpMult = applyMonsterEventRewards(stats);
  expGain = Math.floor(expGain * evExpMult);
  // apply exp boost buff
  const expBoostMult = (typeof getExpBoostMult === 'function') ? getExpBoostMult() : 1;
  expGain = Math.floor(expGain * expBoostMult * (1 + (G.expBonusFromTree || 0)));
  G.totalExpGained += expGain;

  let dropChest = null;
  const cls      = CLASSES.find(c => c.id === G.classId);
  const dropBonus = cls && cls.bonuses.dropBonus ? cls.bonuses.dropBonus : 0;
  if (monster.isBoss) {
    dropChest = 'boss';
  } else if (Math.random() < (.03 + dropBonus)) {
    dropChest = monster.tier >= 4 ? 'rare' : monster.tier >= 2 ? 'uncommon' : 'common';
  }
  if (dropChest) {
    G.chests[dropChest] = (G.chests[dropChest] || 0) + 1;
    if (G.inventory.length >= 40) {
      logBattle(`<span class="log-sys">⚠ กระเป๋าเกือบเต็ม (${G.inventory.length}/50) — ขายของออกก่อนเปิดหีบ</span>`);
    }
  }

  let goldGain = Math.floor(stats.atk * (monster.isBoss ? 3 : 0.5));
  if (cls && cls.bonuses.goldMult) goldGain = Math.floor(goldGain * cls.bonuses.goldMult);
  if ((G.goldBonusFromTree || 0) > 0) goldGain = Math.floor(goldGain * (1 + G.goldBonusFromTree));
  G.gold += goldGain;
  if (typeof rpgOnGoldGain === 'function') rpgOnGoldGain(goldGain);

  if (cls && cls.bonuses.regenAfterFight) {
    const regenAmt = Math.floor(G.maxHp * cls.bonuses.regenAfterFight);
    G.hp = Math.min(G.maxHp, G.hp + regenAmt);
    G.totalHpHealed = (G.totalHpHealed || 0) + regenAmt;
    logBattle(`<span class="log-heal">✨ ฟื้นฟู HP!</span>`);
  }

  if (monster.isBoss && (G.currentZone === 3 || G.currentZone === 6)) {
    if (Math.random() < 0.02) tryDropSetPiece(G.currentZone, true);
  }

  updateDailyQuestProgress('dailyKills');
  if (monster.isBoss) updateDailyQuestProgress('dailyBossKills');

  // monster die animation + particle burst
  const monEl = document.getElementById('pixel-monster');
  if (monEl) {
    monEl.classList.add('die-anim');
    _spawnKillParticles(monEl, monster.isBoss);
  }

  logBattle(`<span class="log-exp">🏆 ${monster.name} ตาย! +${expGain} EXP 💰+${goldGain}${dropChest ? ` 📦 หีบ${dropChest==='boss'?'บอส':dropChest==='rare'?'หายาก':dropChest==='uncommon'?'พิเศษ':'ธรรมดา'}` : ''} [Kill #${G.sessionKills}]</span>`);

  giveExp(expGain);
  checkAchievements();
  saveGame();
  updateKillCounter();
  if (typeof renderEvolutionButton === 'function') renderEvolutionButton();
  // event system hooks
  if (typeof checkCombatEvent     === 'function') checkCombatEvent();
  if (typeof renderActiveBuffs    === 'function') renderActiveBuffs();
  if (typeof resolveInvasionWin   === 'function' && G.pendingMonsterInvasion) resolveInvasionWin();
  // Full RPG quest tracking
  if (typeof rpgOnKill === 'function') rpgOnKill(monster.name, monster.tier, G.currentZone);

  setTimeout(() => {
    if (G.hp > 0) {
      spawnSameMonster(monster);
    } else {
      hideBattleContent();
    }
    updateTopBar();
    updateCharPanel();
    renderInventory();
    renderDailyQuests();
  }, 800);
}

function spawnSameMonster(monster) {
  const stats = getMonsterStats(G.currentZone, monster.tier, monster.isBoss);
  G.currentMonster      = {...monster, zone:G.currentZone};
  G.currentMonsterHp    = stats.maxHp;
  G.currentMonsterMaxHp = stats.maxHp;
  G.battleInProgress    = true;
  G.monsterPoisonTurns  = 0;
  G.monsterBurnTurns    = 0;
  G.turnCount           = 0;

  // refresh monster sprite
  const monEl = document.getElementById('pixel-monster');
  if (monEl) {
    monEl.classList.remove('die-anim');
    monEl.innerHTML = getMonsterSprite(monster.name, monster.isBoss, G.currentZone, monster.img);
  }
  updateMonsterHpBar();
  document.getElementById('btn-attack').disabled = false;
  renderSkillBar();
}

// ---------- Kill counter ----------

function updateKillCounter() {
  const el = document.getElementById('kill-counter');
  if (el) el.textContent = G.sessionKills;
}

// ---------- Auto attack ----------

function toggleAuto() {
  if (autoAttackInterval) {
    clearInterval(autoAttackInterval);
    autoAttackInterval = null;
    const btn = document.getElementById('btn-auto');
    if (btn) { btn.textContent = '🤖 Auto'; btn.classList.remove('on'); }
    logBattle('<span class="log-sys">⏹ Auto OFF</span>');
  } else {
    if (!G.battleInProgress || !G.currentMonster) return;
    const btn = document.getElementById('btn-auto');
    if (btn) { btn.textContent = '⏹ Auto ON'; btn.classList.add('on'); }
    logBattle('<span class="log-sys">▶ Auto ON — โจมตีทุก 2 วินาที</span>');
    autoAttackInterval = setInterval(() => {
      if (G.battleInProgress && G.hp > 0 && G.currentMonster) {
        playerAttack();
      } else {
        stopAuto();
      }
    }, 2000);
  }
}

function stopAuto() {
  if (!autoAttackInterval) return;
  clearInterval(autoAttackInterval);
  autoAttackInterval = null;
  const b = document.getElementById('btn-auto');
  if (b) { b.textContent = '🤖 Auto'; b.classList.remove('on'); }
}

// ---------- Player die / flee ----------

function playerDie() {
  G.battleInProgress = false;
  stopAuto();
  G.hp = Math.floor(G.maxHp * .3);
  logBattle(`<span class="log-dmg">💀 คุณพ่ายแพ้! ฟื้น HP 30%</span>`);
  updateTopBar();
  setTimeout(hideBattleContent, 800);
  if (typeof resolveInvasionLose === 'function' && G.pendingMonsterInvasion) resolveInvasionLose();
  saveGame();
}

function fleeBattle() {
  // reset ทุกอย่างอย่างสมบูรณ์
  stopAuto();
  G.battleInProgress    = false;
  G.currentMonster      = null;
  G.currentMonsterHp    = 0;
  G.currentMonsterMaxHp = 0;
  G.monsterPoisonTurns  = 0;
  G.monsterBurnTurns    = 0;
  G.turnCount           = 0;
  logBattle(`<span class="log-sys">🏃 หนีออกจากการต่อสู้</span>`);

  // ซ่อน battle content และแสดง monster list ใหม่
  document.getElementById('battle-content').style.display    = 'none';
  document.getElementById('monster-list-area').style.display = 'block';
  document.getElementById('btn-attack').disabled = false;

  const arena = document.getElementById('pixel-battle-arena');
  if (arena) { arena.innerHTML = ''; arena.style.display = 'none'; }
  document.getElementById('mon-sprite').style.display = '';

  renderMonsterList();
  saveGame();
}

// ---------- Animations ----------

function _flashArena(color) {
  const arena = document.getElementById('pixel-battle-arena');
  if (!arena) return;
  const flash = document.createElement('div');
  flash.style.cssText = `position:absolute;inset:0;background:${color};opacity:.25;border-radius:10px;pointer-events:none;z-index:10;animation:arenaFlash .3s forwards`;
  arena.appendChild(flash);
  setTimeout(() => flash.remove(), 350);
}

function _spawnKillParticles(el, isBoss) {
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top  + rect.height / 2;
  const count = isBoss ? 14 : 7;
  const colors = isBoss ? ['#ffd700','#ff8800','#ff4444','#ff00ff','#ffffff']
                        : ['#ff4444','#ff8800','#ffcc00'];
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    const angle = (360 / count) * i * (Math.PI / 180);
    const dist  = 30 + Math.random() * (isBoss ? 60 : 30);
    const col   = colors[Math.floor(Math.random() * colors.length)];
    p.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:6px;height:6px;border-radius:50%;background:${col};pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:all .6s ease-out;box-shadow:0 0 6px ${col}`;
    document.body.appendChild(p);
    requestAnimationFrame(() => {
      p.style.left    = cx + Math.cos(angle) * dist + 'px';
      p.style.top     = cy + Math.sin(angle) * dist + 'px';
      p.style.opacity = '0';
      p.style.transform = 'translate(-50%,-50%) scale(0)';
    });
    setTimeout(() => p.remove(), 700);
  }
}

function animateSprite(id, cls) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'monster-sprite ' + cls;
  if (cls === 'shake') setTimeout(() => { el.className = 'monster-sprite'; }, 300);
}

function floatDamage(amount, isPlayer, isCrit) {
  const el = document.createElement('div');
  el.className  = 'damage-float';
  el.textContent = (isPlayer ? '-' : '💔-') + amount + (isCrit ? ' CRIT!' : '');
  el.style.color = isPlayer ? (isCrit ? '#ff8800' : '#ff4444') : '#ff8888';
  const arena = document.querySelector('.battle-arena');
  if (!arena) return;
  const rect = arena.getBoundingClientRect();
  el.style.left = (rect.left + rect.width / 2 + Math.random() * 60 - 30) + 'px';
  el.style.top  = (rect.top  + 100             + Math.random() * 40)      + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}