// ============================================================
// BATTLE SYSTEM — โซน, มอนสเตอร์, การต่อสู้, auto attack
// ============================================================

// ---------- Zone tabs ----------

function renderZoneTabs() {
  const tabs = document.getElementById('zone-tabs');
  tabs.innerHTML = '';
  tabs.style.display = 'flex';
  ZONES.forEach(z => {
    // Zone 1 always unlocked; subsequent zones unlock when previous zone is fully cleared
    const prevZone = ZONES.find(pz => pz.id === z.id - 1);
    const prevProgress = prevZone ? ((G.zoneProgress && G.zoneProgress[prevZone.id]) || 0) : 999;
    const prevCleared  = prevZone ? prevProgress >= prevZone.monsters.length : true;
    const locked = z.id > 1 && !prevCleared;

    const zProgress = (G.zoneProgress && G.zoneProgress[z.id]) || 0;
    const zTotal    = z.monsters.length;
    const zComplete = zProgress >= zTotal;

    const tab = document.createElement('div');
    tab.className = 'zone-tab' + (G.currentZone === z.id ? ' active' : '') + (locked ? ' locked' : '');
    const progressStr = locked ? '' : ` ${zProgress}/${zTotal}`;
    tab.textContent = `${z.emoji}${locked ? '🔒' : zComplete ? '✅' : ''}${progressStr}`;
    tab.title = `${z.name}${locked ? ' (ล็อค — ผ่านด่านก่อนหน้าก่อน)' : ''}`;

    if (!locked) tab.onclick = () => {
      G.currentZone = z.id;
      G.currentMonster = null;
      stopAuto();
      G.battleInProgress = false;
      document.getElementById('battle-content').style.display    = 'none';
      document.getElementById('monster-list-area').style.display = 'block';
      document.getElementById('battle-map-wrap').style.display   = 'none';
      const ba = document.getElementById('battle-arena');
      if (ba) ba.style.display = '';
      const arena = document.getElementById('pixel-battle-arena');
      if (arena) { arena.innerHTML = ''; arena.style.display = 'none'; }
      renderZoneTabs();
      renderMonsterList();
      if (typeof rpgOnExplore === 'function') rpgOnExplore(z.id);
      if (typeof npcCheckZoneEntry === 'function') npcCheckZoneEntry(z.id);
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

  const progress = (G.zoneProgress && G.zoneProgress[G.currentZone]) || 0;
  // progress = number of monsters cleared (0-6)
  const currentTierIdx = progress; // next monster to fight (0-based index into zone.monsters)
  const zoneComplete   = progress >= zone.monsters.length;

  area.innerHTML = '';

  // ── Zone header ──
  const header = document.createElement('div');
  header.style.cssText = 'margin-bottom:.8rem';
  const progPct = Math.floor((progress / zone.monsters.length) * 100);
  const progColor = zoneComplete ? '#44ff88' : (progress >= 4 ? '#ffaa00' : '#4488ff');
  header.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.4rem">
      <span style="color:#ccd;font-size:.85rem;font-weight:700">${zone.emoji} ${zone.name}</span>
      <span style="color:${progColor};font-size:.8rem;font-weight:700">${zoneComplete ? '✅ ผ่านแล้ว!' : `${progress}/${zone.monsters.length} ตัว`}</span>
    </div>
    <div style="background:#1a1a2e;border-radius:4px;height:8px;overflow:hidden">
      <div style="height:100%;width:${progPct}%;background:linear-gradient(90deg,${progColor},${zoneComplete?'#88ffaa':'#88aaff'});border-radius:4px;transition:width .4s"></div>
    </div>`;
  area.appendChild(header);

  // ── Kill milestone progress ──
  const milestoneHtml = _renderMilestoneProgress();
  if (milestoneHtml) {
    const msDiv = document.createElement('div');
    msDiv.id = 'kill-milestone-bar';
    msDiv.innerHTML = milestoneHtml;
    area.appendChild(msDiv);
  }

  // ── Monster progression list ──
  const list = document.createElement('div');
  list.style.cssText = 'display:flex;flex-direction:column;gap:.45rem';

  zone.monsters.forEach((m, idx) => {
    const cleared  = idx < progress;
    const isCurrent = idx === currentTierIdx && !zoneComplete;
    const isLocked = idx > currentTierIdx;
    const stats    = getMonsterStats(G.currentZone, m.tier, m.isBoss);

    const row = document.createElement('div');
    row.style.cssText = `display:flex;align-items:center;gap:.7rem;padding:.55rem .7rem;border-radius:10px;
      background:${cleared ? 'rgba(40,80,40,.35)' : isCurrent ? 'rgba(68,100,180,.25)' : 'rgba(255,255,255,.03)'};
      border:1px solid ${cleared ? '#2a5a2a' : isCurrent ? '#4466cc' : '#222'};
      opacity:${isLocked ? '.45' : '1'};
      transition:background .2s;`;

    const monIcon = m.img
      ? `<img src="assets/sprites/${m.img}.png" style="width:38px;height:38px;object-fit:contain" onerror="this.outerHTML='<span style=font-size:1.8rem>${m.sprite}</span>'">`
      : `<span style="font-size:1.8rem">${m.sprite}</span>`;

    const tierLabel = m.isBoss
      ? `<span style="color:#ffcc44;font-size:.7rem;font-weight:700">👑 BOSS</span>`
      : `<span style="color:#888;font-size:.7rem">Tier ${m.tier}</span>`;

    const statusIcon = cleared ? '✅' : isCurrent ? '⚔' : '🔒';
    const hpLabel = `HP ${stats.maxHp.toLocaleString()} / ATK ${stats.atk}`;

    row.innerHTML = `
      <span style="font-size:1.1rem;min-width:1.4rem;text-align:center">${statusIcon}</span>
      <div style="flex-shrink:0">${monIcon}</div>
      <div style="flex:1;min-width:0">
        <div style="color:${cleared?'#66aa66':isCurrent?'#aabbff':'#888'};font-size:.82rem;font-weight:${isCurrent?'700':'400'}">${m.name}${m.isBoss?' 👑':''}</div>
        <div style="color:#666;font-size:.68rem">${hpLabel}</div>
        ${tierLabel}
      </div>`;

    if (isCurrent) {
      const btn = document.createElement('button');
      btn.textContent = '▶ สู้!';
      btn.style.cssText = 'background:linear-gradient(135deg,#1a3a8a,#2244cc);border:1px solid #4466ff;color:#aaccff;padding:.3rem .8rem;border-radius:8px;cursor:pointer;font-size:.8rem;white-space:nowrap;font-weight:700';
      btn.onclick = () => startBattle(m);
      row.appendChild(btn);
    } else if (cleared) {
      const rebtn = document.createElement('button');
      rebtn.textContent = '↺';
      rebtn.title = 'ฝึกซ้ำ (ไม่นับ progress)';
      rebtn.style.cssText = 'background:rgba(40,80,40,.4);border:1px solid #2a5a2a;color:#66aa66;padding:.3rem .6rem;border-radius:8px;cursor:pointer;font-size:.8rem';
      rebtn.onclick = () => startBattle(m, true);
      row.appendChild(rebtn);
    }

    list.appendChild(row);
  });

  area.appendChild(list);

  // ── Zone complete banner ──
  if (zoneComplete) {
    const nextZone = ZONES.find(z => z.id === G.currentZone + 1);
    if (nextZone) {
      const banner = document.createElement('div');
      banner.style.cssText = 'margin-top:.8rem;padding:.7rem;background:linear-gradient(135deg,rgba(0,60,0,.4),rgba(0,100,30,.3));border:1px solid #44ff88;border-radius:10px;text-align:center';
      banner.innerHTML = `<div style="color:#44ff88;font-size:.85rem;font-weight:700">🎉 ผ่านด่านนี้แล้ว!</div>
        <div style="color:#aaa;font-size:.75rem;margin-top:.2rem">ด่านถัดไป: ${nextZone.emoji} ${nextZone.name} ปลดล็อคแล้ว!</div>`;
      area.appendChild(banner);
    }
  }
}

function _showBossLockedPopup(m, req, playerAtk) {
  let box = document.getElementById('boss-locked-popup');
  if (box) box.remove();
  box = document.createElement('div');
  box.id = 'boss-locked-popup';
  box.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9000;background:#1a0800;border:2px solid #ff6644;border-radius:12px;padding:1.2rem 1.5rem;text-align:center;box-shadow:0 0 40px #ff664466;max-width:300px;width:90%';
  const pct = Math.min(100, Math.floor((playerAtk / req.atk) * 100));
  box.innerHTML = `<div style="font-size:2rem;margin-bottom:.4rem">🔒</div>
    <div style="color:#ff8866;font-size:1rem;font-weight:700;margin-bottom:.4rem">${m.name} ยังล็อคอยู่!</div>
    <div style="color:#aaa;font-size:.82rem;margin-bottom:.8rem">ต้องการ ATK ≥ ${req.atk}<br>ATK ปัจจุบัน: ${playerAtk}</div>
    <div style="background:#330000;border-radius:6px;height:10px;margin-bottom:.6rem;overflow:hidden">
      <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#ff4400,#ff8800);border-radius:6px"></div>
    </div>
    <div style="color:#ff8800;font-size:.8rem;margin-bottom:.9rem">พลังยังไม่เพียงพอ (${pct}%)</div>
    <button onclick="document.getElementById('boss-locked-popup').remove()" style="background:#3a1000;border:1px solid #ff6644;color:#ff8866;padding:.35rem 1.2rem;border-radius:8px;cursor:pointer">ตกลง</button>`;
  document.body.appendChild(box);
  setTimeout(() => { if (box.parentNode) box.remove(); }, 4000);
}

function _renderMilestoneProgress() {
  const kills = G.totalKills || 0;
  const next = KILL_MILESTONES.find(ms => kills < ms.kills);
  if (!next) return '';
  const prev = KILL_MILESTONES.filter(ms => ms.kills <= kills).slice(-1)[0];
  const from = prev ? prev.kills : 0;
  const pct  = Math.floor(((kills - from) / (next.kills - from)) * 100);
  const rewardStr = next.reward === 'gold' ? `💰${next.amount} ทอง` : `📦 หีบ${next.type==='boss'?'บอส':next.type==='rare'?'หายาก':next.type==='uncommon'?'พิเศษ':'ธรรมดา'}`;
  return `<div class="milestone-bar-wrap">
    <div class="milestone-bar-row">
      <span class="milestone-icon">${next.icon}</span>
      <span class="milestone-label">${next.label}</span>
      <span class="milestone-reward">${rewardStr}</span>
    </div>
    <div class="milestone-bar-bg">
      <div class="milestone-bar-fill" style="width:${pct}%"></div>
    </div>
    <div class="milestone-bar-text">Kill ${kills}/${next.kills} (${pct}%)</div>
  </div>`;
}

function _showMonsterDropTooltip(el, m) {
  const cls       = CLASSES.find(c => c.id === G.classId);
  const dropBonus = cls && cls.bonuses && cls.bonuses.dropBonus ? cls.bonuses.dropBonus : 0;
  const zone      = G.currentZone || 1;

  if (m.isBoss) {
    const rarityNames = { common:'ธรรมดา', uncommon:'พิเศษ', rare:'หายาก', epic:'ยอดเยี่ยม', legend:'ตำนาน', ancient:'โบราณ' };
    const r = _dropRarityForZone(zone, true);
    const lines = [`💎 ดรอปของ 1-2 ชิ้น (100%)`, `ความหายาก: ${rarityNames[r]||r} ขึ้นไป`];
    showDropTooltip(el, lines, '👑 บอส: ดรอปของแน่นอน');
  } else {
    const baseRate = 0.08 + (zone - 1) * 0.02;
    const total    = Math.min(0.95, baseRate + dropBonus + (G.dropBonusFromTree || 0));
    const pctStr   = `${Math.round(total * 100)}%`;
    const rarityLabel = {1:'ธรรมดา-พิเศษ', 2:'พิเศษ-หายาก', 3:'หายาก-ยอดเยี่ยม', 4:'หายาก-ยอดเยี่ยม', 5:'ยอดเยี่ยม-ตำนาน', 6:'ยอดเยี่ยม-โบราณ'}[zone] || '';
    const lines = [`📦 ดรอปโดยตรง (ไม่มีกล่อง)`, `ด่าน ${zone}: ${rarityLabel}`];
    showDropTooltip(el, lines, `โอกาสดรอป: ${pctStr}`);
  }
}

// ---------- Stats ----------

function getMonsterStats(zone, tier, isBoss) {
  // Zone Progress mode: each monster in a zone is a "boss encounter"
  // tier scaling: 1→1x, 2→1.8x, 3→3x, 4→5x, 5→8x, 6→14x (exponential curve)
  const tierMult = [0, 1, 1.8, 3, 5, 8, 14][tier] || tier;
  const zoneBase = 1 + (zone - 1) * 1.2; // zone 1=1, zone 2=2.2, zone 3=3.4 ... zone 6=7
  let maxHp = Math.floor(200 * zoneBase * tierMult);
  let atk   = Math.floor(12 * zoneBase * tierMult);
  // tier 6 (zone boss) — extra tough
  if (isBoss) { maxHp = Math.floor(maxHp * 1.5); atk = Math.floor(atk * 1.4); }
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

function _rollWaveSize(monster) {
  // Boss zone fights (progress mode) always single
  if (monster.isBoss) return 1;
  // IDLE mode: 1-4 enemies based on zone
  if (G._idleMode) {
    const maxWave = Math.min(4, 1 + Math.floor(G.currentZone / 2));
    return Math.floor(Math.random() * maxWave) + 1;
  }
  // Normal mode: single enemy
  return 1;
}

// Build G.enemies[] for a new wave of the given monster type
function _buildWave(monster) {
  const waveSize = _rollWaveSize(monster);
  G.enemies = [];
  for (let i = 0; i < waveSize; i++) {
    const stats = getMonsterStats(G.currentZone, monster.tier, monster.isBoss);
    G.enemies.push({
      ...monster,
      zone: G.currentZone,
      hp: stats.maxHp,
      maxHp: stats.maxHp,
      atk: stats.atk,
      poisonTurns: 0,
      burnTurns: 0,
      dead: false,
    });
  }
  G.targetIndex = 0;
  // legacy compat — keep currentMonster pointing at target
  _syncLegacyFromTarget();
  return waveSize;
}

// Keep legacy G.currentMonster / G.currentMonsterHp in sync with target
function _syncLegacyFromTarget() {
  const e = G.enemies[G.targetIndex];
  if (!e) return;
  G.currentMonster      = e;
  G.currentMonsterHp    = e.hp;
  G.currentMonsterMaxHp = e.maxHp;
  G.monsterPoisonTurns  = e.poisonTurns;
  G.monsterBurnTurns    = e.burnTurns;
}

function startBattle(monster, isReplay) {
  stopAuto();
  G.battleInProgress = false;
  G.currentMonster   = null;
  _skillCooldowns    = {};
  _skillBuffs        = {};
  G.turnCount        = 0;
  G.enemyQueue       = [];

  // Tag monster with replay flag so monsterDie() won't advance progress
  const monsterObj = {...monster, _isReplay: !!isReplay};
  const waveSize = _buildWave(monsterObj);
  G.battleInProgress = true;
  initClassMechanic();

  const stats = { maxHp: G.enemies[0].maxHp, atk: G.enemies[0].atk };
  showBattleContent(monsterObj, stats);
  const tierLabel = monsterObj.isBoss ? ' 👑 BOSS' : ` (Tier ${monsterObj.tier})`;
  logBattle(`<span class="log-sys">⚔ ${monsterObj.name}${tierLabel} — HP:${stats.maxHp} ATK:${stats.atk}</span>`);

  // IDLE: auto-start immediately when entering a zone
  if (G._idleMode) {
    setTimeout(() => _startAutoIfNeeded(), 300);
  }
}

function _startAutoIfNeeded() {
  if (!G.battleInProgress || !G.currentMonster) return;
  if (autoAttackInterval) return; // already running
  G._idleMode = true;
  _updateAutoBtn(true);
  const interval = getAttackInterval();
  autoAttackInterval = setInterval(() => {
    if (G.battleInProgress && G.hp > 0 && G.currentMonster) {
      playerAttack();
    } else if (!G.battleInProgress && G.hp > 0) {
      // waiting for next battle to start — keep interval alive but do nothing
    } else {
      stopAuto();
    }
  }, interval);
}

function restartAutoWithNewSpeed() {
  if (!G._idleMode) return;
  stopAuto();
  if (G.battleInProgress && G.currentMonster) _startAutoIfNeeded();
}

function showBattleContent(monster, stats) {
  document.getElementById('battle-content').style.display    = 'block';
  document.getElementById('monster-list-area').style.display = 'none';
  document.getElementById('battle-map-wrap').style.display   = 'none';
  const ba = document.getElementById('battle-arena');
  if (ba) ba.style.display = '';
  const stonePanel = document.getElementById('stone-lore-panel');
  if (stonePanel) stonePanel.style.display = 'none';

  // ── RPG Scene setup ──
  // Set zone background class
  const sceneBg = document.getElementById('battle-scene-bg');
  if (sceneBg) {
    sceneBg.className = 'zone-' + (G.currentZone || 1);
    if (monster.isBoss) sceneBg.style.filter = 'brightness(1.15) saturate(1.3)';
    else sceneBg.style.filter = '';
  }

  // Load zone battle background image
  const bgImg = document.getElementById('battle-bg-img');
  if (bgImg) {
    const src = `./assets/bg/battle/zone${G.currentZone || 1}.png`;
    bgImg.onload  = () => bgImg.classList.add('active');
    bgImg.onerror = () => bgImg.classList.remove('active');
    bgImg.classList.remove('active');
    bgImg.src = src;
  }

  // Boss glow on the scene
  const scene = document.getElementById('rpg-battle-scene');
  if (scene) {
    scene.style.boxShadow = monster.isBoss
      ? 'inset 0 0 60px rgba(255,80,0,.2)'
      : '';
  }

  // Inject player sprite
  const playerEl = document.getElementById('pixel-player');
  if (playerEl) {
    const playerSvg = (typeof getPlayerSpriteWithCosmetic !== 'undefined')
      ? getPlayerSpriteWithCosmetic(G.classId || 'warrior', G.classTier || 1, G.cosmeticTier || 1)
      : getPlayerSprite(G.classId || 'warrior', G.classTier || 1);
    playerEl.innerHTML = playerSvg;
  }

  // Render all enemies
  renderEnemyCards();

  updateBattlePlayerStatus();
  document.getElementById('btn-attack').disabled = false;

  // Close skill menu if open
  const sm = document.getElementById('rpg-skill-menu');
  if (sm) sm.classList.remove('open');

  renderSkillBar();

  // Legacy hidden elements (JS still reads them in some paths)
  const nm = document.getElementById('mon-name'); if (nm) nm.textContent = monster.name;
  const mt = document.getElementById('mon-type'); if (mt) mt.textContent = monster.isBoss ? 'บอส' : 'ศัตรู';
  const ms = document.getElementById('mon-stats'); if (ms) ms.textContent = `ATK: ${stats.atk}`;
}

function _setEnemyInfo(monster, stats) {
  // legacy — kept for skill paths that call it directly
  const nameEl = document.getElementById('battle-enemy-name');
  const typeEl = document.getElementById('battle-enemy-type');
  const atkEl  = document.getElementById('battle-enemy-atk');
  if (nameEl) nameEl.textContent = monster.name + (monster.isBoss ? ' 👑' : '');
  if (typeEl) typeEl.textContent = monster.isBoss ? '🔴 บอสศัตรู' : '⚔ ศัตรูทั่วไป';
  if (atkEl)  atkEl.textContent  = `ATK: ${stats.atk}`;
}

function renderEnemyQueue() {
  // legacy — not shown in multi-enemy mode (cards replace this)
  const el = document.getElementById('battle-enemy-queue');
  if (el) el.innerHTML = '';
}

// ── Multi-enemy card rendering ──────────────────────────────────
function renderEnemyCards() {
  const container = document.getElementById('battle-enemy-side');
  if (!container) return;
  container.innerHTML = '';

  const enemies = G.enemies || [];
  const alive   = enemies.filter(e => !e.dead);
  if (alive.length === 0) return;

  // Wrapper for all cards
  const cardsWrap = document.createElement('div');
  cardsWrap.id = 'enemy-cards-wrap';
  cardsWrap.className = `enemy-count-${Math.min(alive.length, 3)}`;

  enemies.forEach((e, idx) => {
    if (e.dead) return;
    const isTarget = (idx === G.targetIndex);
    const pct = Math.max(0, (e.hp / e.maxHp) * 100);
    const hpColor = pct > 50
      ? 'linear-gradient(90deg,#cc0000,#ff4444)'
      : pct > 25
        ? 'linear-gradient(90deg,#cc6600,#ff9900)'
        : 'linear-gradient(90deg,#880000,#ff2200)';

    const card = document.createElement('div');
    card.className = 'enemy-card' + (isTarget ? ' targeted' : '');
    card.dataset.idx = idx;
    card.onclick = () => selectTarget(idx);

    card.innerHTML = `
      <div class="enemy-card-sprite" id="enemy-sprite-${idx}">
        ${getMonsterSprite(e.name, e.isBoss, G.currentZone, e.img)}
      </div>
      <div class="enemy-card-info">
        <div class="enemy-card-name">${e.name}${e.isBoss ? ' 👑' : ''}</div>
        <div class="enemy-card-hp-wrap">
          <div class="enemy-card-hp-fill" style="width:${pct}%;background:${hpColor}"></div>
          <div class="enemy-card-hp-text">${Math.max(0,e.hp)}/${e.maxHp}</div>
        </div>
        <div class="enemy-card-atk">ATK: ${e.atk}</div>
      </div>`;

    cardsWrap.appendChild(card);
  });

  container.appendChild(cardsWrap);

  // legacy sync for updateMonsterHpBar() calls in skill paths
  _syncLegacyFromTarget();
  const legName = document.getElementById('mon-name'); if (legName) legName.textContent = (G.enemies[G.targetIndex]||{}).name||'';
}

function selectTarget(idx) {
  if (!G.enemies[idx] || G.enemies[idx].dead) return;
  G.targetIndex = idx;
  _syncLegacyFromTarget();
  renderEnemyCards();
}

function hideBattleContent() {
  stopAuto();
  G.battleInProgress    = false;
  G.currentMonster      = null;
  G.currentMonsterHp    = 0;
  G.currentMonsterMaxHp = 0;
  G.enemyQueue          = [];
  G.enemies             = [];
  G.targetIndex         = 0;
  G.monsterPoisonTurns  = 0;
  G.monsterBurnTurns    = 0;
  G.turnCount           = 0;

  const sm = document.getElementById('rpg-skill-menu');
  if (sm) sm.classList.remove('open');

  document.getElementById('battle-content').style.display    = 'none';
  document.getElementById('monster-list-area').style.display = 'block';
  document.getElementById('btn-attack').disabled = false;

  const arena = document.getElementById('pixel-battle-arena');
  if (arena) { arena.innerHTML = ''; arena.style.display = 'none'; }

  renderMonsterList();
}

function updateMonsterHpBar() {
  // Update the specific targeted enemy card's HP bar in-place
  const e = G.enemies && G.enemies[G.targetIndex];
  if (e) {
    e.hp = G.currentMonsterHp; // write back from legacy field
    const card = document.querySelector(`.enemy-card[data-idx="${G.targetIndex}"]`);
    if (card) {
      const pct = Math.max(0, (e.hp / e.maxHp) * 100);
      const fill = card.querySelector('.enemy-card-hp-fill');
      const txt  = card.querySelector('.enemy-card-hp-text');
      if (fill) {
        fill.style.width = pct + '%';
        fill.style.background = pct > 50
          ? 'linear-gradient(90deg,#cc0000,#ff4444)'
          : pct > 25
            ? 'linear-gradient(90deg,#cc6600,#ff9900)'
            : 'linear-gradient(90deg,#880000,#ff2200)';
      }
      if (txt) txt.textContent = `${Math.max(0,e.hp)}/${e.maxHp}`;
    }
  }
  // legacy hidden elements sync
  const legBar = document.getElementById('mon-hp-bar');
  if (legBar) legBar.style.width = Math.max(0,(G.currentMonsterHp/G.currentMonsterMaxHp)*100) + '%';
  const legTxt = document.getElementById('mon-hp-text');
  if (legTxt) legTxt.textContent = `${Math.max(0,G.currentMonsterHp)}/${G.currentMonsterMaxHp}`;
}

function updateBattlePlayerStatus() {
  const cls = CLASSES ? CLASSES.find(c => c.id === G.classId) : null;
  const eqBonus = (typeof getEquippedStatBonus === 'function') ? getEquippedStatBonus() : { atk:0, def:0 };
  const playerAtk = G.baseAtk + (eqBonus.atk || 0);

  // ── Fighter scene: player info panel ──
  const pLabel  = document.getElementById('battle-player-label');
  const pFill   = document.getElementById('battle-player-hp-fill');
  const pTxt    = document.getElementById('battle-player-hp-text');
  const pAtkEl  = document.getElementById('battle-player-atk');
  const pStatus = document.getElementById('battle-player-status-inline');
  const pct = Math.max(0, (G.hp / G.maxHp) * 100);
  const hpColor = pct > 50
    ? 'linear-gradient(90deg,#22cc44,#44ff88)'
    : pct > 25
      ? 'linear-gradient(90deg,#cc8800,#ffbb00)'
      : 'linear-gradient(90deg,#cc2200,#ff4400)';
  if (pLabel) pLabel.textContent = `${cls ? cls.icon : '⚔'} LV${G.level} ${G.playerName}`;
  if (pFill)  { pFill.style.width = pct + '%'; pFill.style.background = hpColor; }
  if (pTxt)   pTxt.textContent = `${G.hp}/${G.maxHp}`;
  if (pAtkEl) pAtkEl.textContent = `ATK: ${playerAtk}`;
  if (pStatus) {
    let sHtml = '';
    if ((G.playerPoisonTurns||0) > 0) sHtml += `<span class="status-tag poison">☠${G.playerPoisonTurns}</span>`;
    if ((G.playerBurnTurns||0)   > 0) sHtml += `<span class="status-tag burn">🔥${G.playerBurnTurns}</span>`;
    if ((_skillBuffs.ironShield||0) > 0) sHtml += `<span class="status-tag shield">🛡${_skillBuffs.ironShield}</span>`;
    if ((_skillBuffs.lightShield||0) > 0) sHtml += `<span class="status-tag shield">✦${_skillBuffs.lightShield}</span>`;
    pStatus.innerHTML = sHtml;
  }

  // ── Bottom UI name bar ──
  const nameEl = document.getElementById('rpg-player-name');
  const fill   = document.getElementById('rpg-player-hp-fill');
  const txt    = document.getElementById('rpg-player-hp-text');
  if (nameEl) nameEl.textContent = `${cls ? cls.icon : '⚔'} LV${G.level} ${G.playerName}`;
  if (fill)   { fill.style.width = pct + '%'; fill.style.background = hpColor; }
  if (txt)    txt.textContent = `${G.hp}/${G.maxHp}`;

  // Status tags in bottom bar
  const tags = document.getElementById('rpg-player-status-tags');
  if (tags) {
    let html = '';
    if ((G.playerPoisonTurns||0) > 0) html += `<span class="status-tag poison">☠${G.playerPoisonTurns}</span>`;
    if ((G.playerBurnTurns||0)   > 0) html += `<span class="status-tag burn">🔥${G.playerBurnTurns}</span>`;
    if ((_skillBuffs.ironShield||0) > 0) html += `<span class="status-tag shield">🛡${_skillBuffs.ironShield}</span>`;
    if ((_skillBuffs.lightShield||0) > 0) html += `<span class="status-tag shield">✦${_skillBuffs.lightShield}</span>`;
    tags.innerHTML = html;
  }

  // Legacy hidden bar
  const legBar = document.getElementById('bps-hp-bar');
  const legTxt = document.getElementById('bps-hp-text');
  if (legBar) legBar.style.width = pct + '%';
  if (legTxt) legTxt.textContent = `${G.hp}/${G.maxHp}`;
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
  // Primary: rpg-skill-menu (new RPG scene)
  const rpgMenu = document.getElementById('rpg-skill-menu');
  // Fallback: legacy skill-bar (hidden, keeps old code happy)
  const legBar = document.getElementById('skill-bar');

  const allSkills = _getSkills();

  if (rpgMenu) {
    if (allSkills.length === 0) {
      rpgMenu.innerHTML = '<div style="color:var(--text2);font-size:.72rem;padding:.3rem .5rem;grid-column:1/-1">🌳 อัพ Skill Tree เพื่อปลดล็อคสกิล</div>';
    } else {
      const equipped = _getEquippedSkills();
      const tierColors = {1:'#4a9',2:'#49f',3:'#a5f',4:'#fa0'};
      rpgMenu.innerHTML = '';
      equipped.forEach(sk => {
        const cd = _skillCooldowns[sk.id] || 0;
        const btn = document.createElement('button');
        btn.className = 'rpg-cmd-btn skill-btn tree-skill' + (cd > 0 ? ' on-cd' : '');
        btn.style.borderColor = tierColors[sk.tier] || '#4a9';
        btn.disabled = cd > 0 || !G.battleInProgress;
        btn.title = `${sk.name}\n${sk.desc}\nCD: ${sk.cd} ตา`;
        btn.innerHTML = `<span class="rpg-cmd-icon">${sk.icon}</span>
          <div class="rpg-cmd-label">${sk.name}
            <div class="rpg-cmd-sub">${cd > 0 ? `CD: ${cd}` : 'พร้อมใช้'}</div>
          </div>`;
        btn.onclick = () => { useSkill(sk.id); toggleSkillMenu(false); };
        rpgMenu.appendChild(btn);
      });
      // Manage button
      const mgBtn = document.createElement('button');
      mgBtn.className = 'rpg-cmd-btn skill-btn';
      mgBtn.style.borderColor = '#666';
      mgBtn.innerHTML = '<span class="rpg-cmd-icon">⚙</span><div class="rpg-cmd-label">จัดการ<div class="rpg-cmd-sub">Manage</div></div>';
      mgBtn.onclick = () => openSkillSelectModal();
      rpgMenu.appendChild(mgBtn);
    }
  }

  // Update skills button label
  const skillsBtn = document.getElementById('btn-skills');
  if (skillsBtn) {
    const count = allSkills.length;
    skillsBtn.querySelector('.rpg-cmd-sub').textContent = count > 0 ? `${count} สกิล` : 'ล็อค';
  }

  if (legBar) legBar.innerHTML = '';
}

function toggleSkillMenu(forceOpen) {
  const menu = document.getElementById('rpg-skill-menu');
  if (!menu) return;
  if (forceOpen === false) { menu.classList.remove('open'); return; }
  menu.classList.toggle('open');
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
  const atkBtn = document.getElementById('btn-attack');
  // guard: don't stack attacks while waiting for monster's counter-turn
  // (auto-attack interval can fire while the button is mid-cooldown)
  if (atkBtn && atkBtn.disabled) return;
  if (atkBtn) atkBtn.disabled = true;

  // animate player attacking
  const playerEl = document.getElementById('pixel-player');
  if (playerEl) {
    playerEl.classList.add('attack-anim');
    setTimeout(() => playerEl.classList.remove('attack-anim'), 500);
  }

  const eqBonus = (typeof getEquippedStatBonus === 'function') ? getEquippedStatBonus() : { atk:0, def:0, hp:0, crit:0, attackSpeed:0 };
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
  atk = _applyClassMechOnAttack(atk);
  if (isCrit) { atk = Math.floor(atk * 2); G.critCount = (G.critCount || 0) + 1; }

  // Write damage to multi-enemy array
  if (G.enemies && G.enemies[G.targetIndex]) {
    G.enemies[G.targetIndex].hp -= atk;
    G.currentMonsterHp = G.enemies[G.targetIndex].hp; // keep legacy in sync
  } else {
    G.currentMonsterHp -= atk;
  }
  G.turnCount++;
  tickSkillCooldowns();
  _tickClassMechTurn();
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

  // DoT on monster (target)
  const monStats = getMonsterStats(G.currentZone, G.currentMonster.tier, G.currentMonster.isBoss);
  const _applyDoTDmg = (dmg) => {
    G.currentMonsterHp -= dmg;
    if (G.enemies && G.enemies[G.targetIndex]) G.enemies[G.targetIndex].hp = G.currentMonsterHp;
  };
  if (G.monsterPoisonTurns > 0) {
    const pdmg = Math.floor(monStats.maxHp * .05);
    _applyDoTDmg(pdmg);
    logBattle(`<span class="log-dmg">☠ พิษ ${pdmg} ดาเมจ</span>`);
    G.monsterPoisonTurns--;
    if (G.enemies && G.enemies[G.targetIndex]) G.enemies[G.targetIndex].poisonTurns = G.monsterPoisonTurns;
  }
  if (G.monsterBurnTurns > 0) {
    const bdmg = Math.floor(monStats.maxHp * .05);
    _applyDoTDmg(bdmg);
    logBattle(`<span class="log-dmg">🔥 เผา ${bdmg} ดาเมจ</span>`);
    G.monsterBurnTurns--;
    if (G.enemies && G.enemies[G.targetIndex]) G.enemies[G.targetIndex].burnTurns = G.monsterBurnTurns;
  }
  if ((_skillBuffs.meteorDoT||0) > 0) {
    const meteorDmg = Math.floor(monStats.maxHp * 0.15);
    _applyDoTDmg(meteorDmg);
    logBattle(`<span class="log-dmg">🌠 ดาวตก DoT ${meteorDmg} ดาเมจ</span>`);
    _skillBuffs.meteorDoT--;
  }

  updateMonsterHpBar();

  // shake + hit flash + attack effect image on target enemy card
  const targetCard = document.querySelector(`.enemy-card[data-idx="${G.targetIndex}"]`);
  if (targetCard) {
    targetCard.classList.add('shake-anim');
    setTimeout(() => targetCard.classList.remove('shake-anim'), 300);
    const sprite = targetCard.querySelector('.enemy-card-sprite');
    if (sprite) {
      sprite.classList.add('hit-flash');
      setTimeout(() => sprite.classList.remove('hit-flash'), 350);
    }
    // pick effect image based on weapon / crit
    _showAttackEffect(targetCard, isCrit);
  }

  if (G.currentMonsterHp <= 0) { monsterDie(); return; }
  updateBattlePlayerStatus();
  setTimeout(() => { monsterAttack(); }, 600);
}

// ---------- Attack effect image ----------

// ---------- Drop rarity table by zone ----------
// zone 1: common/uncommon; zone 2-3: uncommon/rare; zone 4-5: rare/epic; zone 6: epic/legend
// boss always 1 tier higher than normal
function _dropRarityForZone(zone, isBoss, tier = 3) {
  // weighted table: [rarity, weight]
  const tables = {
    1: [['common',70],['uncommon',28],['rare',2]],
    2: [['common',30],['uncommon',55],['rare',15]],
    3: [['uncommon',40],['rare',45],['epic',15]],
    4: [['uncommon',15],['rare',50],['epic',33],['legend',2]],
    5: [['rare',30],['epic',52],['legend',18]],
    6: [['rare',10],['epic',45],['legend',38],['ancient',7]],
  };
  let table = tables[Math.min(6, Math.max(1, zone))];
  // high-tier monsters (5-6) in the zone: shift toward rarer
  if (!isBoss && tier >= 5) {
    table = table.map(([r, w]) => {
      const shift = { common:-30, uncommon:-15, rare:10, epic:20, legend:12, ancient:3 };
      return [r, Math.max(0, w + (shift[r] || 0))];
    });
  }
  if (isBoss) {
    table = table.map(([r, w]) => {
      const bossShift = { common:-50, uncommon:-20, rare:5, epic:25, legend:15, ancient:5 };
      return [r, Math.max(0, w + (bossShift[r] || 0))];
    });
  }
  const total = table.reduce((s, [, w]) => s + w, 0);
  let roll = Math.random() * total;
  for (const [r, w] of table) {
    roll -= w;
    if (roll <= 0) return r;
  }
  return table[table.length - 1][0];
}

// ---------- Direct item drop (no chest) ----------

const _RARITY_ORDER = ['common','uncommon','rare','epic','legend','ancient'];

function _dropDirectItem(rarity) {
  if (G.inventory && G.inventory.length >= 50) {
    logBattle(`<span class="log-sys">⚠ กระเป๋าเต็ม! ขายของก่อน</span>`);
    return;
  }
  // Pick random slot and random item of that rarity
  const slots = ['weapon','helmet','armor','gloves','pants','boots'];
  const slot  = slots[Math.floor(Math.random() * slots.length)];

  // Find pool for requested rarity; if empty (e.g. ancient only exists for weapon),
  // fall back to the next-lower rarity that has items for this slot.
  let effRarity = rarity;
  let pool = (ALL_ITEMS_BY_SLOT[slot] || []).filter(i => i.rarity === effRarity);
  let ri = _RARITY_ORDER.indexOf(rarity);
  while (!pool.length && ri > 0) {
    ri--;
    effRarity = _RARITY_ORDER[ri];
    pool = (ALL_ITEMS_BY_SLOT[slot] || []).filter(i => i.rarity === effRarity);
  }
  if (!pool.length) return;

  const base = pool[Math.floor(Math.random() * pool.length)];
  const item = { ...base, uid: Date.now() + Math.random() };
  if (!G.inventory) G.inventory = [];
  G.inventory.push(item);
  const rarityColor = RARITIES[effRarity] ? RARITIES[effRarity].color : '#aaa';
  logBattle(`<span class="log-exp" style="color:${rarityColor}">💎 ดรอป: ${item.icon||'⚔'} ${item.name} [${RARITIES[effRarity]?.label||effRarity}]</span>`);
  // flag for achievements
  if (['rare','epic','legend','ancient'].includes(effRarity)) G.gotRareWeapon = true;
  if (effRarity === 'legend' || effRarity === 'ancient') G.gotLegendWeapon = true;
  renderInventory();
}

// ---------- Attack speed (ms per hit) ----------

function getAttackInterval() {
  // Base 6000ms; reduced by attackSpeedBonus (skill tree) + equipment attackSpeed
  const treeBonus  = G.attackSpeedBonus || 0;
  const equipBonus = typeof getEquippedStatBonus === 'function' ? (getEquippedStatBonus().attackSpeed || 0) : 0;
  const bonus = Math.min(0.9, treeBonus + equipBonus);
  const ms = Math.max(800, Math.floor(6000 * (1 - bonus)));
  return ms;
}

function _showAttackEffect(container, isCrit) {
  const CLASS_FX = {
    warrior: 'slash',
    mage:    'explosion',
    rogue:   'dark',
    archer:  'arrow',
    paladin: 'holy',
  };
  const fx = CLASS_FX[G.classId] || 'slash';

  const img = document.createElement('img');
  img.src = `./assets/effects/${fx}.png`;
  img.className = 'attack-fx-img' + (isCrit ? ' crit' : '');
  img.draggable = false;
  container.style.position = 'relative';
  container.appendChild(img);
  setTimeout(() => img.remove(), 600);
}

// ---------- Monster attack ----------

function monsterAttack() {
  if (!G.battleInProgress) return;

  // Multi-enemy: each alive enemy attacks once
  const aliveEnemies = (G.enemies || []).filter(e => !e.dead);
  if (aliveEnemies.length > 1) {
    aliveEnemies.forEach(e => _singleMonsterAttack(e));
    return;
  }
  // Single enemy (or fallback): use legacy path
  _singleMonsterAttack(G.currentMonster);
}

function _singleMonsterAttack(enemyObj) {
  if (!G.battleInProgress || G.hp <= 0) return;
  const stats  = getMonsterStats(G.currentZone, enemyObj.tier, enemyObj.isBoss);
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
    if (G.enemies && G.enemies[G.targetIndex]) G.enemies[G.targetIndex].hp = G.currentMonsterHp;
    dmgTaken = 0;
    _skillBuffs.eternalFortress--;
    logBattle(`<span class="log-crit">🏯 ปราการตอบโต้! ${counterDmg} ดาเมจ (บล็อกดาเมจ)</span>`);
  }
  if (_skillBuffs.divineRadiance > 0) {
    const radDmg = Math.floor((G.baseAtk + ((typeof getEquippedStatBonus==='function'?getEquippedStatBonus():{atk:0}).atk||0)) * 2);
    G.currentMonsterHp -= radDmg;
    if (G.enemies && G.enemies[G.targetIndex]) G.enemies[G.targetIndex].hp = G.currentMonsterHp;
    dmgTaken = Math.floor(dmgTaken * 0.3);
    _skillBuffs.divineRadiance--;
    logBattle(`<span class="log-crit">☀️ แสงตอบโต้! ${radDmg} ดาเมจ (-70% DMG รับ)</span>`);
  }
  G.hp = Math.max(0, G.hp - dmgTaken);
  if (dmgTaken > 0) {
    _applyClassMechOnHit(dmgTaken);
    G.totalDmgTaken = (G.totalDmgTaken || 0) + dmgTaken;
    logBattle(`<span class="log-dmg">💔 ${enemyObj.name} โจมตี ${dmgTaken} ดาเมจ${_skillBuffs.ironShield > 0 ? ' (Iron Shield)' : ''}</span>`);
    _flashArena('#ff0000');
  } else {
    logBattle(`<span class="log-heal">🛡 หลบการโจมตีของ ${enemyObj.name}!</span>`);
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
  updateBattlePlayerStatus();
  document.getElementById('btn-attack').disabled = false;
  renderSkillBar();
  if (G.hp <= 0) playerDie();
}

// ---------- Monster die — spawn ใหม่ทันที ----------

function monsterDie() {
  G.battleInProgress = false;
  const monster = G.currentMonster;

  // Mark this enemy as dead in the multi-enemy array
  if (G.enemies && G.enemies[G.targetIndex]) {
    G.enemies[G.targetIndex].dead = true;
  }

  const key = `${G.currentZone}_${monster.tier}`;
  G.defeatedMonsters[key] = true;
  G.totalKills++;
  G.sessionKills++;
  if (monster.isBoss) {
    G.bossKills++;
    if (monster.isWeeklyBoss && monster.wbData) {
      if (typeof _onWeeklyBossKill === 'function') _onWeeklyBossKill(monster.wbData);
    } else {
      G.chests.boss = (G.chests.boss || 0) + 1;
    }
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

  const cls      = CLASSES.find(c => c.id === G.classId);
  const dropBonus = cls && cls.bonuses.dropBonus ? cls.bonuses.dropBonus : 0;
  // Direct item drop (no chest middleman)
  let dropChest = null; // keep for boss chest reward
  if (monster.isBoss) {
    // boss guaranteed 1-2 items, rarity based on zone
    const bossRarity = _dropRarityForZone(G.currentZone, true);
    _dropDirectItem(bossRarity);
    if (Math.random() < 0.5) _dropDirectItem(bossRarity);
  } else {
    // base drop rate scales with zone (8% → 20%), bonus from class + tree
    const baseRate = 0.08 + (G.currentZone - 1) * 0.02;
    const dropRate = baseRate + dropBonus + (G.dropBonusFromTree || 0);
    if (Math.random() < dropRate) {
      const rarity = _dropRarityForZone(G.currentZone, false, monster.tier);
      _dropDirectItem(rarity);
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

  // monster die animation + particle burst on the target card
  const dyingCard = document.querySelector(`.enemy-card[data-idx="${G.targetIndex}"]`);
  const dyingSprite = dyingCard ? dyingCard.querySelector('.enemy-card-sprite') : null;
  if (dyingSprite) {
    dyingSprite.classList.add('die-anim');
    _spawnKillParticles(dyingSprite, monster.isBoss);
  }
  // legacy element (some paths reference pixel-monster)
  const monEl = document.getElementById('pixel-monster');
  if (monEl) monEl.classList.add('die-anim');

  logBattle(`<span class="log-exp">🏆 ${monster.name} ตาย! +${expGain} EXP 💰+${goldGain}${dropChest ? ` 📦 หีบบอส` : ''} [Kill #${G.sessionKills}]</span>`);

  giveExp(expGain);
  checkAchievements();
  _checkKillMilestones();
  saveGame();
  updateKillCounter();
  if (typeof renderEvolutionButton === 'function') renderEvolutionButton();
  // event system hooks
  if (typeof checkCombatEvent     === 'function') checkCombatEvent();
  if (typeof renderActiveBuffs    === 'function') renderActiveBuffs();
  if (typeof resolveInvasionWin   === 'function' && G.pendingMonsterInvasion) resolveInvasionWin();
  // Full RPG quest tracking
  if (typeof rpgOnKill === 'function') rpgOnKill(monster.name, monster.tier, G.currentZone);
  if (typeof npcQuestOnKill === 'function') npcQuestOnKill(monster.name, G.currentZone);

  setTimeout(() => {
    if (G.hp > 0) {
      const aliveRemaining = (G.enemies || []).filter(e => !e.dead);
      if (aliveRemaining.length > 0) {
        // More enemies still alive in this wave — switch target to first alive
        const nextIdx = G.enemies.findIndex(e => !e.dead);
        G.targetIndex = nextIdx;
        _syncLegacyFromTarget();
        G.battleInProgress = true;
        renderEnemyCards();
        document.getElementById('btn-attack').disabled = false;
        renderSkillBar();
        logBattle(`<span class="log-sys">⚔ เหลือ ${aliveRemaining.length} ตัว! เลือกเป้าหมาย</span>`);
      } else {
        // ── Zone Progress: advance to next monster ──
        const isReplay = monster._isReplay;
        if (!isReplay) {
          if (!G.zoneProgress) G.zoneProgress = {};
          const zoneMonsters = (ZONES.find(z => z.id === G.currentZone) || {}).monsters || [];
          const currentProgress = G.zoneProgress[G.currentZone] || 0;
          // advance only if this monster's tier matches current progress position
          if (monster.tier === currentProgress + 1 && currentProgress < zoneMonsters.length) {
            G.zoneProgress[G.currentZone] = currentProgress + 1;
            const newProg = G.zoneProgress[G.currentZone];
            if (newProg >= zoneMonsters.length) {
              // Zone fully cleared — unlock next zone
              const nextZoneId = G.currentZone + 1;
              const nextZone = ZONES.find(z => z.id === nextZoneId);
              logBattle(`<span class="log-exp" style="color:#44ff88;font-size:1.1em">🎉 ผ่านด่าน ${ZONES.find(z=>z.id===G.currentZone)?.name}! ${nextZone ? `ปลดล็อค ${nextZone.emoji} ${nextZone.name}!` : '🏆 ผ่านทุกด่านแล้ว!'}</span>`);
              saveGame();
              renderZoneTabs();
              hideBattleContent();
              return;
            } else {
              // Advance to next monster in zone — auto-start IDLE
              const nextMonster = zoneMonsters[newProg];
              logBattle(`<span class="log-sys">✅ ผ่าน ${monster.name}! → ถัดไป: ${nextMonster.name}</span>`);
              saveGame();
              setTimeout(() => {
                startBattle(nextMonster);
                // auto-start if auto was on or IDLE mode
                if (autoAttackInterval || G._idleMode) {
                  setTimeout(() => { if (G.battleInProgress && G.currentMonster) _startAutoIfNeeded(); }, 400);
                }
              }, 600);
              updateTopBar(); updateCharPanel(); renderInventory(); renderDailyQuests();
              return;
            }
          }
        }
        // Replay mode or fallback — respawn same monster
        _buildWave(monster);
        G.battleInProgress = true;
        const stats = { maxHp: G.enemies[0].maxHp, atk: G.enemies[0].atk };
        renderEnemyCards();
        updateBattlePlayerStatus();
        document.getElementById('btn-attack').disabled = false;
        renderSkillBar();
        logBattle(`<span class="log-sys">⚔ ${monster.name} เกิดใหม่! HP:${stats.maxHp}</span>`);
        if (autoAttackInterval || G._idleMode) {
          setTimeout(() => { if (G.battleInProgress && G.currentMonster) _startAutoIfNeeded(); }, 300);
        }
      }
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

  const monEl = document.getElementById('pixel-monster');
  if (monEl) {
    monEl.classList.remove('die-anim');
    monEl.innerHTML = getMonsterSprite(monster.name, monster.isBoss, G.currentZone, monster.img);
  }
  _setEnemyInfo(monster, stats);
  updateMonsterHpBar();
  renderEnemyQueue();
  document.getElementById('btn-attack').disabled = false;
  renderSkillBar();
}

function spawnNextEnemy(next, prevMonster) {
  const stats = getMonsterStats(G.currentZone, next.tier, next.isBoss);
  G.currentMonster      = {...next, zone:G.currentZone};
  G.currentMonsterHp    = stats.maxHp;
  G.currentMonsterMaxHp = stats.maxHp;
  G.battleInProgress    = true;
  G.monsterPoisonTurns  = 0;
  G.monsterBurnTurns    = 0;
  G.turnCount           = 0;

  const monEl = document.getElementById('pixel-monster');
  if (monEl) {
    monEl.classList.remove('die-anim');
    monEl.innerHTML = getMonsterSprite(next.name, next.isBoss, G.currentZone, next.img);
    monEl.classList.add('spawn-anim');
    setTimeout(() => monEl.classList.remove('spawn-anim'), 400);
  }
  _setEnemyInfo(next, stats);
  updateMonsterHpBar();
  renderEnemyQueue();
  document.getElementById('btn-attack').disabled = false;
  renderSkillBar();
  logBattle(`<span class="log-sys">⚔ ตัวถัดไป: ${next.name}! HP:${stats.maxHp} (เหลือ ${(G.enemyQueue||[]).length} ตัว)</span>`);
}

// ---------- Kill counter ----------

function updateKillCounter() {
  // kill-counter appears in rpg-kill-counter div
  document.querySelectorAll('#kill-counter').forEach(el => { el.textContent = G.sessionKills; });
}

// ---------- Auto attack ----------

function _updateAutoBtn(on) {
  const btn = document.getElementById('btn-auto');
  if (!btn) return;
  if (on) {
    btn.classList.add('on');
    const sub = btn.querySelector('.rpg-cmd-sub, #auto-status-label');
    if (sub) sub.textContent = 'ON';
  } else {
    btn.classList.remove('on');
    const sub = btn.querySelector('.rpg-cmd-sub, #auto-status-label');
    if (sub) sub.textContent = 'OFF';
  }
}

function toggleAuto() {
  if (autoAttackInterval) {
    clearInterval(autoAttackInterval);
    autoAttackInterval = null;
    G._idleMode = false;
    _updateAutoBtn(false);
    logBattle('<span class="log-sys">⏹ IDLE OFF</span>');
  } else {
    if (!G.battleInProgress || !G.currentMonster) {
      // Enable IDLE mode even before battle starts — will auto-start when battle begins
      G._idleMode = true;
      _updateAutoBtn(true);
      logBattle('<span class="log-sys">▶ IDLE ON — จะโจมตีอัตโนมัติ</span>');
      return;
    }
    G._idleMode = true;
    logBattle(`<span class="log-sys">▶ IDLE ON — โจมตีทุก ${(getAttackInterval()/1000).toFixed(1)} วิ</span>`);
    _startAutoIfNeeded();
  }
}

function stopAuto() {
  if (!autoAttackInterval) return;
  clearInterval(autoAttackInterval);
  autoAttackInterval = null;
  _updateAutoBtn(false);
  // Don't reset G._idleMode here — only toggleAuto() should reset it
}

// ---------- Player die / flee ----------

function playerDie() {
  G.battleInProgress = false;
  const dyingMonster = G.currentMonster ? {...G.currentMonster} : null;
  const wasIdle = G._idleMode || !!autoAttackInterval;
  stopAuto();
  G.hp = Math.floor(G.maxHp * .3);
  logBattle(`<span class="log-dmg">💀 คุณพ่ายแพ้! ฟื้น HP 30%${wasIdle ? ' — รีสตาร์ทใน 3 วิ...' : ''}</span>`);
  updateTopBar();
  if (typeof resolveInvasionLose === 'function' && G.pendingMonsterInvasion) resolveInvasionLose();
  saveGame();
  // IDLE mode: retry same monster after short delay
  if (wasIdle && dyingMonster) {
    setTimeout(() => {
      hideBattleContent();
      setTimeout(() => {
        startBattle(dyingMonster, dyingMonster._isReplay);
        setTimeout(() => _startAutoIfNeeded(), 400);
      }, 600);
    }, 1200);
  } else {
    setTimeout(hideBattleContent, 800);
  }
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

// ---------- Kill Milestone system ----------

function _checkKillMilestones() {
  if (!G.claimedMilestones) G.claimedMilestones = [];
  KILL_MILESTONES.forEach(ms => {
    if (G.totalKills >= ms.kills && !G.claimedMilestones.includes(ms.kills)) {
      G.claimedMilestones.push(ms.kills);
      if (ms.reward === 'gold') {
        G.gold += ms.amount;
        setTimeout(() => _showMilestonePopup(ms, `💰 +${ms.amount} ทอง`), 1000);
      } else if (ms.reward === 'chest') {
        G.chests[ms.type] = (G.chests[ms.type] || 0) + 1;
        const chestLabel = ms.type==='boss'?'บอส':ms.type==='rare'?'หายาก':ms.type==='uncommon'?'พิเศษ':'ธรรมดา';
        setTimeout(() => _showMilestonePopup(ms, `📦 หีบ${chestLabel}`), 1000);
      }
    }
  });
}

function _showMilestonePopup(ms, rewardStr) {
  let box = document.getElementById('milestone-popup');
  if (box) box.remove();
  box = document.createElement('div');
  box.id = 'milestone-popup';
  box.style.cssText = 'position:fixed;top:20%;left:50%;transform:translateX(-50%);z-index:9500;background:linear-gradient(135deg,#1a1a00,#2a2000);border:2px solid #ffd700;border-radius:16px;padding:1.4rem 2rem;text-align:center;box-shadow:0 0 50px #ffd70066,0 0 20px #ff8800;max-width:320px;width:90%;animation:msPopIn .4s cubic-bezier(.2,1.4,.4,1)';
  box.innerHTML = `
    <div style="font-size:2.5rem;margin-bottom:.3rem">${ms.icon}</div>
    <div style="color:#ffd700;font-size:1rem;font-weight:700;margin-bottom:.2rem">${ms.label}</div>
    <div style="color:#aaa;font-size:.82rem;margin-bottom:.5rem">ถึง ${ms.kills} Kill!</div>
    <div style="color:#ffcc44;font-size:1.1rem;font-weight:700;margin-bottom:.8rem">${rewardStr}</div>
    <button onclick="document.getElementById('milestone-popup').remove()" style="background:#2a1800;border:1px solid #ffd700;color:#ffd700;padding:.35rem 1.2rem;border-radius:8px;cursor:pointer">รับรางวัล!</button>`;
  document.body.appendChild(box);
  setTimeout(() => { if (box && box.parentNode) box.remove(); }, 6000);
  updateTopBar();
  renderMonsterList();
}

// ---------- Class Mechanic bars ----------
// Warrior: Rage (เพิ่มเมื่อโดนโจมตี, ≥100 = Rage mode +50% ATK)
// Mage: MP (เต็มตอนเริ่มต่อสู้, สกิลใช้ MP, ฟื้น 10/ตา)
// Rogue: Combo (โจมตีติดกัน +1, ถึง 3 = Crit ครั้งถัดไปแน่นอน, reset เมื่อโดนตี)
// Archer: Focus (เพิ่มทีละ 10/ตา, ≥50 = +30% ATK ครั้งถัดไป แล้ว reset)
// Paladin: Faith (ฟื้น HP ขึ้นเรื่อยๆ → +Faith stacks)

let _classMechanic = {};

function initClassMechanic() {
  const cls = G.classId;
  if (cls === 'warrior') _classMechanic = { rage: 0, rageMode: false };
  else if (cls === 'mage')    _classMechanic = { mp: 100, maxMp: 100 };
  else if (cls === 'rogue')   _classMechanic = { combo: 0 };
  else if (cls === 'archer')  _classMechanic = { focus: 0 };
  else if (cls === 'paladin') _classMechanic = { faith: 0 };
  else _classMechanic = {};
  _renderClassMechBar();
}

function _renderClassMechBar() {
  const el = document.getElementById('class-mech-bar');
  if (!el) return;
  const cls = G.classId;
  let html = '';
  if (cls === 'warrior') {
    const r = Math.min(100, _classMechanic.rage || 0);
    const mode = _classMechanic.rageMode;
    html = `<div class="cmb-wrap cmb-warrior${mode?' cmb-rage-active':''}">
      <span class="cmb-icon">⚔</span>
      <span class="cmb-label">${mode?'RAGE!':'Rage'}</span>
      <div class="cmb-bar-bg"><div class="cmb-bar-fill" style="width:${r}%;background:${mode?'#ff2200':'linear-gradient(90deg,#cc4400,#ff6600)'}"></div></div>
      <span class="cmb-val">${r}/100</span>
    </div>`;
  } else if (cls === 'mage') {
    const mp = _classMechanic.mp || 0, maxMp = _classMechanic.maxMp || 100;
    html = `<div class="cmb-wrap cmb-mage">
      <span class="cmb-icon">🔮</span>
      <span class="cmb-label">MP</span>
      <div class="cmb-bar-bg"><div class="cmb-bar-fill" style="width:${(mp/maxMp)*100}%;background:linear-gradient(90deg,#4400aa,#aa44ff)"></div></div>
      <span class="cmb-val">${mp}/${maxMp}</span>
    </div>`;
  } else if (cls === 'rogue') {
    const c = _classMechanic.combo || 0;
    const ready = c >= 3;
    html = `<div class="cmb-wrap cmb-rogue${ready?' cmb-crit-ready':''}">
      <span class="cmb-icon">🗡</span>
      <span class="cmb-label">${ready?'CRIT!':'Combo'}</span>
      <div class="cmb-pip-row">${[0,1,2].map(i=>`<div class="cmb-pip${i<c?' filled':''}"></div>`).join('')}</div>
      <span class="cmb-val">${c}/3</span>
    </div>`;
  } else if (cls === 'archer') {
    const f = Math.min(100, _classMechanic.focus || 0);
    const ready = f >= 50;
    html = `<div class="cmb-wrap cmb-archer${ready?' cmb-focus-ready':''}">
      <span class="cmb-icon">🏹</span>
      <span class="cmb-label">${ready?'FOCUS!':'Focus'}</span>
      <div class="cmb-bar-bg"><div class="cmb-bar-fill" style="width:${f}%;background:linear-gradient(90deg,#886600,#ffd700)"></div></div>
      <span class="cmb-val">${f}/100</span>
    </div>`;
  } else if (cls === 'paladin') {
    const fa = Math.min(10, _classMechanic.faith || 0);
    html = `<div class="cmb-wrap cmb-paladin">
      <span class="cmb-icon">✨</span>
      <span class="cmb-label">Faith</span>
      <div class="cmb-pip-row">${[0,1,2,3,4,5,6,7,8,9].map(i=>`<div class="cmb-pip${i<fa?' filled faith-pip':''}"></div>`).join('')}</div>
      <span class="cmb-val">${fa}/10</span>
    </div>`;
  }
  el.innerHTML = html;
}

// Called in playerAttack BEFORE damage apply — returns atk multiplier
function _applyClassMechOnAttack(atk) {
  const cls = G.classId;
  if (cls === 'warrior') {
    if (_classMechanic.rageMode) {
      atk = Math.floor(atk * 1.5);
      _classMechanic.rage = Math.max(0, (_classMechanic.rage||0) - 25);
      if (_classMechanic.rage <= 0) { _classMechanic.rageMode = false; logBattle('<span class="log-heal">⚔ Rage สิ้นสุด</span>'); }
    }
  } else if (cls === 'rogue') {
    if ((_classMechanic.combo||0) >= 3) {
      atk = Math.floor(atk * 2.5);
      _classMechanic.combo = 0;
      logBattle('<span class="log-crit">🗡 Combo Crit x2.5!</span>');
    } else {
      _classMechanic.combo = (_classMechanic.combo||0) + 1;
    }
  } else if (cls === 'archer') {
    if ((_classMechanic.focus||0) >= 50) {
      atk = Math.floor(atk * 1.3);
      _classMechanic.focus = 0;
      logBattle('<span class="log-crit">🏹 Focus! +30% ATK</span>');
    }
    // focus accumulation is handled by _tickClassMechTurn (per turn)
  }
  _renderClassMechBar();
  return atk;
}

// Called when player takes damage
function _applyClassMechOnHit(dmg) {
  const cls = G.classId;
  if (cls === 'warrior' && dmg > 0) {
    const gain = Math.min(20, Math.floor(dmg / 5) + 5);
    _classMechanic.rage = Math.min(100, (_classMechanic.rage||0) + gain);
    if (_classMechanic.rage >= 100 && !_classMechanic.rageMode) {
      _classMechanic.rageMode = true;
      logBattle('<span class="log-crit">🔥 RAGE! +50% ATK ชั่วคราว!</span>');
    }
  } else if (cls === 'rogue' && dmg > 0) {
    _classMechanic.combo = 0;
    _renderClassMechBar();
  } else if (cls === 'paladin' && dmg > 0) {
    const faithHeal = Math.floor(G.maxHp * 0.02 * (1 + (_classMechanic.faith||0)));
    if (faithHeal > 0) {
      G.hp = Math.min(G.maxHp, G.hp + faithHeal);
      G.totalHpHealed = (G.totalHpHealed||0) + faithHeal;
      _classMechanic.faith = Math.min(10, (_classMechanic.faith||0) + 1);
      logBattle(`<span class="log-heal">✨ Faith ฟื้น ${faithHeal} HP (stacks:${_classMechanic.faith})</span>`);
    }
  }
  _renderClassMechBar();
}

// Called per turn for mage MP regen
function _tickClassMechTurn() {
  const cls = G.classId;
  if (cls === 'mage') {
    _classMechanic.mp = Math.min(_classMechanic.maxMp||100, (_classMechanic.mp||0) + 10);
    _renderClassMechBar();
  } else if (cls === 'archer') {
    _classMechanic.focus = Math.min(100, (_classMechanic.focus||0) + 5);
    _renderClassMechBar();
  }
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