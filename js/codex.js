// ============================================================
// CODEX — Collection Log + Weekly Boss
// ============================================================

let _codexZone = 1;

// ── Collection Log ────────────────────────────────────────────

function renderCodex() {
  _renderClassCodex();
  _renderCodexZoneTabs();
  _renderCodexContent(_codexZone);
  _renderWeeklyBoss();
}

// ── Class Evolution Codex — โชว์สายวิวัฒนาการ + Tier ลับ ──
function _renderClassCodex() {
  const el = document.getElementById('class-codex');
  if (!el) return;
  const path = (typeof CLASS_EVOLUTIONS !== 'undefined') ? CLASS_EVOLUTIONS[G.classId] : null;
  if (!path) { el.innerHTML = '<div style="color:#888;font-size:.78rem">ยังไม่ได้เลือกคลาส</div>'; return; }

  const curTier   = G.classTier || 1;
  const curBranch = G.classBranch || null;
  // names this player has actually been (revealed for sure)
  const history   = new Set((G.classEvolutionHistory || []).map(e => e.name));
  const foundSecret = (G.classEvolutionHistory || []).some(e => e.secret);

  // count secret classes discovered across all base classes (persisted flag)
  const secretFound = G.secretClassesFound || [];

  const cell = (evo) => {
    if (!evo) return '';
    const isCur     = (curTier === evo.tier) && ((evo.branch||null) === curBranch || (!evo.branch && curTier === evo.tier));
    const wasBeen   = history.has(evo.name);
    // secret cells stay hidden until discovered (this class OR globally seen)
    const secretHidden = evo.secret && !wasBeen && !secretFound.includes(`${G.classId}_S`);
    const known = wasBeen || (!evo.secret && (evo.tier <= curTier));
    const color = evo.color || '#aaa';
    if (secretHidden) {
      return `<div class="cc-node cc-secret-locked" title="ปลดล็อกผ่าน Tier ลับใน Infinity Trial">
        <div class="cc-icon">❓</div><div class="cc-name">Tier ลับ</div></div>`;
    }
    return `<div class="cc-node${isCur?' cc-current':''}${evo.secret?' cc-secret':''}${known?'':' cc-unknown'}"
      title="${(evo.lore||'').replace(/"/g,'')}">
      <div class="cc-icon" style="${known?`filter:drop-shadow(0 0 6px ${color})`:''}">${known?evo.icon:'🔒'}</div>
      <div class="cc-name" style="color:${known?color:'#666'}">${known?evo.name:'???'}</div>
      ${evo.secret?'<div class="cc-tag">★ ลับ</div>':''}
      ${isCur?'<div class="cc-you">● ตอนนี้</div>':''}
    </div>`;
  };

  const t1 = path.find(e=>e.tier===1);
  const t2 = path.find(e=>e.tier===2);
  // order branches weakest → strongest:  B, A, C, D, then secret S
  const order = ['B','A','C','D','S'];
  const t3 = order.map(b => path.find(e=>e.tier===3&&e.branch===b)).filter(Boolean);
  const t4 = order.map(b => path.find(e=>e.tier===4&&e.branch===b)).filter(Boolean);

  el.innerHTML = `
    <div class="cc-row cc-row-single">${cell(t1)}<span class="cc-arrow">→</span>${cell(t2)}</div>
    <div class="cc-tierlabel">Tier 3 — ตัดสินด้วยการทดสอบนิรันดร์ (ยิ่งตีเยอะ ยิ่งสายโหด)</div>
    <div class="cc-row cc-row-wrap">${t3.map(cell).join('')}</div>
    <div class="cc-tierlabel">Tier 4 — เส้นตรงตามสายที่ได้</div>
    <div class="cc-row cc-row-wrap">${t4.map(cell).join('')}</div>
    ${foundSecret ? '<div class="cc-secret-banner">🩸 คุณได้ค้นพบ Tier ลับของคลาสนี้แล้ว!</div>' : ''}`;
}

function _renderCodexZoneTabs() {
  const el = document.getElementById('codex-zone-tabs');
  if (!el) return;
  el.innerHTML = '';
  ZONES.forEach(z => {
    const btn = document.createElement('button');
    btn.textContent = `${z.emoji}${z.id}`;
    btn.style.cssText = `background:${_codexZone===z.id?'rgba(68,136,255,.25)':'rgba(255,255,255,.05)'};border:1px solid ${_codexZone===z.id?'#4488ff':'#333'};color:${_codexZone===z.id?'#88aaff':'#888'};padding:.2rem .5rem;border-radius:6px;cursor:pointer;font-size:.75rem`;
    btn.onclick = () => { _codexZone = z.id; renderCodex(); };
    el.appendChild(btn);
  });
}

function _renderCodexContent(zoneId) {
  const el = document.getElementById('codex-content');
  if (!el) return;
  const zone = ZONES.find(z => z.id === zoneId);
  if (!zone) { el.innerHTML = ''; return; }

  // build list of all items that can drop from this zone (tier-based rarity)
  const tierRarityMap = { 1:'common', 2:'common', 3:'uncommon', 4:'rare', 5:'rare', 6:'boss' };
  const zoneItems = [];
  zone.monsters.forEach(m => {
    const chestType = m.isBoss ? 'boss' : (m.tier >= 4 ? 'rare' : m.tier >= 2 ? 'uncommon' : 'common');
    const table = CHEST_TABLES[chestType] || CHEST_TABLES.common;
    table.forEach(entry => {
      SLOT_SLOTS.forEach(slot => {
        const pool = (ALL_ITEMS_BY_SLOT[slot] || []).filter(i => i.rarity === entry.r);
        pool.forEach(item => {
          if (!zoneItems.find(x => x.id === item.id)) zoneItems.push(item);
        });
      });
    });
  });

  // check which ones player has obtained
  const obtained = new Set(G.inventory.map(i => i.id));
  // also check equipped items
  Object.values(G.equippedSlots || {}).forEach(uid => {
    if (uid) {
      const it = G.inventory.find(i => i.uid === uid);
      if (it) obtained.add(it.id);
    }
  });

  const total = zoneItems.length;
  const have  = zoneItems.filter(i => obtained.has(i.id)).length;
  const pct   = total > 0 ? Math.floor((have / total) * 100) : 0;

  const rarityOrder = { common:0, uncommon:1, rare:2, epic:3, legend:4, ancient:5 };
  zoneItems.sort((a,b) => (rarityOrder[a.rarity]||0) - (rarityOrder[b.rarity]||0));

  let html = `<div style="margin-bottom:.6rem">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.3rem">
      <span style="color:#88aaff;font-size:.82rem;font-weight:700">${zone.emoji} ${zone.name}</span>
      <span style="color:#aaa;font-size:.75rem">${have}/${total} (${pct}%)</span>
    </div>
    <div style="background:#1a1a2e;border-radius:4px;height:8px;overflow:hidden">
      <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#2244aa,#4488ff);border-radius:4px"></div>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(52px,1fr));gap:.3rem">`;

  zoneItems.forEach(item => {
    const got = obtained.has(item.id);
    const color = RARITIES[item.rarity] ? RARITIES[item.rarity].color : '#aaa';
    html += `<div title="${item.name}" style="background:${got?'rgba(255,255,255,.06)':'rgba(0,0,0,.4)'};border:1px solid ${got?color:'#222'};border-radius:6px;padding:.3rem;text-align:center;opacity:${got?1:.4};font-size:1rem;cursor:default">
      ${item.icon||'⚔'}<div style="font-size:.52rem;color:${got?color:'#555'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:52px">${got?item.name:'???'}</div>
    </div>`;
  });

  html += '</div>';
  el.innerHTML = html;
}

// ── Weekly Boss ────────────────────────────────────────────────

const WEEKLY_BOSSES = [
  { id:'wb1', name:'เบฮีมอธ', icon:'🦣', zone:2, tier:8, atkMult:4, hpMult:5,
    desc:'บอสยักษ์ประจำสัปดาห์', reward:'chest', chestType:'boss', bonusGold:500 },
  { id:'wb2', name:'ลิชจักรวาล', icon:'💀', zone:4, tier:10, atkMult:5, hpMult:6,
    desc:'เจ้าแห่งความตาย', reward:'chest', chestType:'boss', bonusGold:800 },
  { id:'wb3', name:'เทพแห่งมรสุม', icon:'🌊', zone:6, tier:12, atkMult:6, hpMult:8,
    desc:'ผู้ปกครองพายุจักรวาล', reward:'chest', chestType:'boss', bonusGold:1500 },
];

function _getCurrentWeeklyBoss() {
  const now   = new Date();
  const week  = Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000));
  const idx   = week % WEEKLY_BOSSES.length;
  return WEEKLY_BOSSES[idx];
}

function _getWeeklyBossKey() {
  const now  = new Date();
  const week = Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000));
  return `weekly_${week}`;
}

function _renderWeeklyBoss() {
  const el = document.getElementById('weekly-boss-panel');
  if (!el) return;

  const wb    = _getCurrentWeeklyBoss();
  const key   = _getWeeklyBossKey();
  const killed = G.weeklyBossKills && G.weeklyBossKills[key];

  // Compute reset time
  const now   = new Date();
  const week  = Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000));
  const nextReset = new Date((week + 1) * 7 * 24 * 60 * 60 * 1000);
  const diff  = nextReset - now;
  const days  = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  const stats = getMonsterStats(wb.zone, 6, true);
  const wbHp  = Math.floor(stats.maxHp * wb.hpMult);
  const wbAtk = Math.floor(stats.atk   * wb.atkMult);

  const reqZone = ZONES.find(z => z.id === wb.zone);
  const eqBonus = (typeof getEquippedStatBonus === 'function') ? getEquippedStatBonus() : {atk:0};
  const playerAtk = G.baseAtk + (eqBonus.atk||0);
  const minAtk  = Math.floor(wbAtk * 0.8);
  const canFight = playerAtk >= minAtk && (G.level >= (reqZone?.reqLevel || 1));

  el.innerHTML = `<div style="background:linear-gradient(135deg,#1a0033,#0a001a);border:2px solid ${killed?'#444':'#880088'};border-radius:10px;padding:.8rem;margin-bottom:.5rem">
    <div style="display:flex;align-items:center;gap:.6rem;margin-bottom:.4rem">
      <span style="font-size:2rem">${wb.icon}</span>
      <div>
        <div style="color:${killed?'#666':'#dd88ff'};font-weight:700;font-size:.9rem">${wb.name}${killed?' ✓ เอาชนะแล้ว':''}</div>
        <div style="color:#888;font-size:.72rem">${wb.desc}</div>
      </div>
      <div style="margin-left:auto;text-align:right">
        <div style="color:#aaa;font-size:.68rem">Reset ใน</div>
        <div style="color:#ff8888;font-size:.75rem;font-weight:700">${days}ว ${hours}ชม</div>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:.72rem;color:#aaa;margin-bottom:.4rem">
      <span>❤ HP: ${wbHp.toLocaleString()}</span>
      <span>⚔ ATK: ${wbAtk}</span>
      <span>🏆 หีบบอส + 💰${wb.bonusGold}</span>
    </div>
    <div style="font-size:.72rem;color:${canFight?'#44ff88':'#ff6644'};margin-bottom:.5rem">
      ${canFight?'✅ พร้อมต่อสู้':'🔒 ต้องการ ATK ≥ '+minAtk+' และ LV '+reqZone?.reqLevel}
    </div>
    ${!killed && canFight
      ? `<button onclick="startWeeklyBoss()" style="background:linear-gradient(135deg,#440066,#880099);border:1px solid #880088;color:#dd88ff;padding:.4rem 1rem;border-radius:8px;cursor:pointer;font-size:.82rem;width:100%">⚔ ต่อสู้ Weekly Boss!</button>`
      : killed
        ? `<div style="color:#666;font-size:.8rem;text-align:center;padding:.3rem">เอาชนะแล้วสัปดาห์นี้</div>`
        : `<div style="color:#ff6644;font-size:.75rem;text-align:center">เสริมความแข็งแกร่งก่อน</div>`
    }
  </div>`;
}

function startWeeklyBoss() {
  const wb  = _getCurrentWeeklyBoss();
  const key = _getWeeklyBossKey();
  if (G.weeklyBossKills && G.weeklyBossKills[key]) {
    logBattle('<span class="log-sys">⚠ เอาชนะ Weekly Boss แล้วสัปดาห์นี้</span>');
    return;
  }

  if (typeof stopAuto === 'function') stopAuto();
  G.battleInProgress = false;
  G.currentMonster   = null;

  // Build a synthetic monster and start battle
  const stats = getMonsterStats(wb.zone, 6, true);
  const wbMonster = {
    name: wb.name,
    sprite: wb.icon,
    img: null,
    tier: 6,
    isBoss: true,
    isWeeklyBoss: true,
    wbData: wb,
    zone: wb.zone,
    hp: Math.floor(stats.maxHp * wb.hpMult),
    maxHp: Math.floor(stats.maxHp * wb.hpMult),
    atk: Math.floor(stats.atk * wb.atkMult),
    poisonTurns: 0,
    burnTurns: 0,
    dead: false,
  };

  G.enemies = [wbMonster];
  G.targetIndex = 0;
  _syncLegacyFromTarget();
  G.battleInProgress = true;
  initClassMechanic();
  G.turnCount = 0;
  _skillCooldowns = {};
  _skillBuffs = {};

  if (typeof switchMobileTab === 'function') switchMobileTab('battle');
  showBattleContent(wbMonster, { maxHp: wbMonster.maxHp, atk: wbMonster.atk });
  logBattle(`<span class="log-crit">⚔ Weekly Boss: ${wb.name} ปรากฏตัว! HP:${wbMonster.maxHp} ATK:${wbMonster.atk}</span>`);
}

function _onWeeklyBossKill(wb) {
  const key = _getWeeklyBossKey();
  if (!G.weeklyBossKills) G.weeklyBossKills = {};
  G.weeklyBossKills[key] = true;

  G.chests.boss = (G.chests.boss||0) + 1;
  G.gold += wb.bonusGold;
  logBattle(`<span class="log-exp" style="color:#dd88ff">🏆 Weekly Boss กำจัดแล้ว! +หีบบอส 💰+${wb.bonusGold}!</span>`);
  saveGame();
}
