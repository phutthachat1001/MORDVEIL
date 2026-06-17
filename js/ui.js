// ============================================================
// UI — อัปเดต HUD, topbar, character panel, tabs, stats
// ============================================================

function updateTopBar() {
  document.getElementById('tb-name').textContent  = G.playerName;
  document.getElementById('tb-level').textContent = G.level;

  const expReq = expRequired(G.level);
  const expPct = Math.min(100, (G.exp / expReq) * 100);
  document.getElementById('exp-bar').style.width  = expPct + '%';
  document.getElementById('exp-text').textContent = `${G.exp}/${expReq}`;

  const hpPct = Math.max(0, (G.hp / G.maxHp) * 100);
  const hpBar = document.getElementById('hp-bar');
  hpBar.style.width = hpPct + '%';
  hpBar.style.background = hpPct > 50 ? 'linear-gradient(90deg,#cc2222,#ff6644)'
    : hpPct > 25 ? 'linear-gradient(90deg,#cc6600,#ff9900)'
    : 'linear-gradient(90deg,#880000,#ff2200)';
  document.getElementById('hp-text').textContent  = `${G.hp}/${G.maxHp}`;

  const eqBonus  = (typeof getEquippedStatBonus === 'function') ? getEquippedStatBonus() : { atk:0, def:0 };
  const weapon   = G.equippedWeaponId ? G.inventory.find(i => i.uid === G.equippedWeaponId) : null;
  // eqBonus.atk already includes weapon slot — no double-count
  const totalAtk = G.baseAtk + (eqBonus.atk || 0);
  const totalDef = G.baseDef + (eqBonus.def || 0);
  document.getElementById('tb-atk').textContent  = totalAtk;
  document.getElementById('tb-def').textContent  = totalDef;
  document.getElementById('tb-gold').textContent = G.gold;
  const tbWeapon = document.getElementById('tb-weapon');
  if (tbWeapon) {
    tbWeapon.textContent = weapon ? weapon.name : 'ไม่มีอาวุธ';
    if (weapon) tbWeapon.style.color = RARITIES[weapon.rarity]?.color || 'var(--text)';
    else tbWeapon.style.color = '';
  }

  // mobile stat strip (desktop pills are hidden on phones)
  const msGold = document.getElementById('ms-gold-val');
  if (msGold) {
    msGold.textContent = G.gold.toLocaleString();
    document.getElementById('ms-atk-val').textContent = totalAtk;
    document.getElementById('ms-def-val').textContent = totalDef;
    const msW = document.getElementById('ms-weapon-val');
    msW.textContent = weapon ? weapon.name : 'ไม่มีอาวุธ';
    msW.style.color = weapon ? (RARITIES[weapon.rarity]?.color || '') : '';
  }
}

function updateCharPanel() {
  const cls = CLASSES.find(c => c.id === G.classId);
  const evo = (typeof CLASS_EVOLUTIONS !== 'undefined' && G.classId)
    ? CLASS_EVOLUTIONS[G.classId]?.find(e => e.tier === (G.classTier || 1))
    : null;
  const avatarEl = document.getElementById('char-avatar');
  if (G.classId && typeof getPlayerSpriteWithCosmetic !== 'undefined') {
    avatarEl.innerHTML = getPlayerSpriteWithCosmetic(G.classId, G.classTier || 1, G.cosmeticTier || 1);
    avatarEl.style.fontSize = '';
  } else if (G.classId && typeof getPlayerSprite !== 'undefined') {
    avatarEl.innerHTML = getPlayerSprite(G.classId, G.classTier || 1);
    avatarEl.style.fontSize = '';
  } else {
    avatarEl.textContent = evo ? evo.icon : (cls ? cls.icon : '⚔');
  }
  document.getElementById('char-class-label').textContent = evo ? `${evo.name} (Tier ${evo.tier})` : (cls ? cls.name : '');
  if (evo)      document.getElementById('char-class-label').style.color = evo.color || (cls ? cls.color : '');
  else if (cls) document.getElementById('char-class-label').style.color = cls.color;

  const eqBonus = (typeof getEquippedStatBonus === 'function') ? getEquippedStatBonus() : { atk:0, def:0, hp:0 };
  const weapon  = G.equippedWeaponId ? G.inventory.find(i => i.uid === G.equippedWeaponId) : null;
  // eqBonus already includes all slots (weapon + armor + etc.) — no double-count
  const totalAtk = G.baseAtk + (eqBonus.atk || 0);
  const totalDef = G.baseDef + (eqBonus.def || 0);
  const totalHp  = G.maxHp  + (eqBonus.hp  || 0);
  document.getElementById('stat-hp').textContent    = `${G.hp}/${totalHp}`;
  document.getElementById('stat-atk').textContent   = totalAtk;
  document.getElementById('stat-def').textContent   = totalDef;
  document.getElementById('stat-kills').textContent = G.totalKills;

  // stat allocation UI
  renderStatAlloc();

  // equipment slots grid
  if (typeof renderEquipSlots === 'function') renderEquipSlots();

  // equipped weapon display (legacy section replaced by slot grid)
  const ewd = document.getElementById('equipped-weapon-display');
  if (ewd) {
    if (weapon) {
      const r = RARITIES[weapon.rarity] || RARITIES.common;
      ewd.innerHTML = `<div class="weapon-name rarity-glow-${weapon.rarity}">${weapon.icon} ${weapon.name}</div>
        <div class="weapon-bonus">⚔ ATK +${weapon.atk} | <span style="color:${r.color}">${r.label}</span></div>
        ${weapon.effect ? `<div class="weapon-effect">✨ ${weapon.effect}</div>` : ''}
        <div style="font-size:.72rem;color:var(--text2)">รวมทุก slot → ATK ${totalAtk} | DEF ${totalDef} | HP ${totalHp}</div>`;
    } else {
      ewd.innerHTML = `<div style="color:var(--text2);font-size:.85rem">ไม่มีอาวุธ</div>
        <div style="font-size:.72rem;color:var(--text2)">รวมทุก slot → ATK ${totalAtk} | DEF ${totalDef} | HP ${totalHp}</div>`;
    }
  }

  // cosmetic tier badge
  const cosmBadge = document.getElementById('cosm-tier-badge');
  if (cosmBadge && typeof COSMETIC_TIERS !== 'undefined') {
    const ct = (G.cosmeticTier || 1);
    const tier = COSMETIC_TIERS.find(t => t.tier === ct);
    cosmBadge.innerHTML = tier
      ? `<span style="color:${tier.color}">${tier.icon} ชุด: ${tier.name}</span> <span style="color:#555;font-size:.65rem">— แตะเพื่อเปลี่ยน</span>`
      : '';
  }

  // prestige badges
  document.getElementById('prestige-badge-area').innerHTML =
    G.prestigeBadges.map(b => `<span class="prestige-badge">${b.icon} Prestige ${b.count}</span>`).join(' ');

  // prestige button
  document.getElementById('prestige-info').textContent =
    G.level >= 100 ? 'พร้อม Prestige!' : `ต้องการ LV 100 (ตอนนี้ LV ${G.level})`;
  document.getElementById('btn-prestige').style.display = G.level >= 100 ? 'block' : 'none';
}

// ---------- Talent summary (ปุ่มเปิด Talent ในหน้าตัวละคร) ----------
// แทนระบบแต้มสแตทเดิม — Talent คือระบบ build/อัพสแตทของเกม
function renderStatAlloc() {
  const el = document.getElementById('stat-alloc-area');
  if (!el) return;
  if (typeof talentPointsFree !== 'function') { el.innerHTML = ''; return; }
  const free = talentPointsFree();
  const hasPoints = free > 0;
  el.innerHTML = `
    <button class="talent-open-btn${hasPoints?' has-points':''}" onclick="openTalentPanel()">
      🎯 ติดตัวละคร (Talent)
      ${hasPoints ? `<span class="talent-open-badge">+${free} แต้ม</span>` : ''}
    </button>`;
}

function switchTab(name) {
  // ปิดกระเป๋าค้าง เมื่อสลับแท็บ
  if (typeof closeInventoryPopup === 'function') closeInventoryPopup();
  const tabNames = ['char','daily','codex'];
  document.querySelectorAll('.tab').forEach((t, i) => {
    t.classList.toggle('active', tabNames[i] === name);
  });
  document.getElementById('tab-char').classList.toggle('active',  name === 'char');
  document.getElementById('tab-daily').classList.toggle('active', name === 'daily');
  const codexEl = document.getElementById('tab-codex');
  if (codexEl) codexEl.classList.toggle('active', name === 'codex');
  if (name === 'codex') renderCodex();
  // hide daily tab in fullrpg mode
  const dailyTab = document.querySelector('.tab[onclick*="daily"]');
  if (dailyTab) dailyTab.style.display = G.gameMode === 'fullrpg' ? 'none' : '';
}

function showStats() {
  document.getElementById('stats-content').innerHTML = `
    <div>👤 ชื่อ: <b style="color:var(--gold)">${G.playerName}</b></div>
    <div>⭐ เลเวล: <b style="color:var(--blue)">${G.level}</b></div>
    <div>🎖 คลาส: <b style="color:var(--purple)">${CLASSES.find(c=>c.id===G.classId)?.name||'-'}</b></div>
    <div>✅ งานที่เสร็จ: <b style="color:var(--green)">${G.totalTasks}</b></div>
    <div>💫 EXP รวม: <b style="color:var(--gold)">${G.totalExpGained.toLocaleString()}</b></div>
    <div>💀 มอนที่ฆ่า: <b style="color:var(--red)">${G.totalKills}</b></div>
    <div>👑 บอสที่ฆ่า: <b style="color:var(--orange)">${G.bossKills}</b></div>
    <div>💰 ทอง: <b style="color:var(--gold)">${G.gold}</b></div>
    <div>🔥 Streak สูงสุด: <b style="color:var(--orange)">${G.maxStreak}</b> วัน</div>
    <div>✨ Prestige: <b style="color:var(--legend)">${G.prestigeCount}</b> ครั้ง</div>
    <div>🏆 ความสำเร็จ: <b style="color:var(--gold)">${G.unlockedAchievements.length}/${ACHIEVEMENTS.length}</b></div>
  `;
  document.getElementById('stats-overlay').classList.add('active');
}

function logBattle(msg) {
  // Primary: new RPG scene log strip
  const rpgLog = document.getElementById('rpg-battle-log-strip');
  const target = rpgLog || document.getElementById('battle-log');
  if (!target) return;
  const line = document.createElement('div');
  line.innerHTML = msg;
  target.appendChild(line);
  target.scrollTop = target.scrollHeight;
  if (target.children.length > 60) target.removeChild(target.firstChild);
}

function renderAll() {
  updateTopBar();
  updateCharPanel();
  applyGameModeLayout();
  applyMobileLayout();
  renderZoneTabs();
  renderMonsterList();
  renderInventory();
  updateKillCounter();
  checkAchievements();
  if (typeof updateEvoQuestProgress !== 'undefined') updateEvoQuestProgress();
  if (typeof renderEvolutionButton  !== 'undefined') renderEvolutionButton();
  if (typeof renderSkillTree        !== 'undefined') renderSkillTree();
  if (typeof renderSetProgress      !== 'undefined') renderSetProgress();
  if (typeof renderEquipSlots      !== 'undefined') renderEquipSlots();
  if (typeof updateDiffLabel       !== 'undefined') updateDiffLabel();
  if (typeof renderMapPins         !== 'undefined') renderMapPins();
  if (typeof startIdleFarm         !== 'undefined') startIdleFarm();
  if (G.gameMode === 'fullrpg') {
    if (typeof renderRpgQuestPanel  !== 'undefined') renderRpgQuestPanel();
    if (typeof renderRpgDailyPanel  !== 'undefined') renderRpgDailyPanel();
  } else {
    renderTasks();
    renderDailyQuests();
  }
  updateNavBadges();
}

// ── bottom-nav notification badges (เลขแดงเล็กๆ) ──
// quest tab: number of quests available to accept right now
// bag tab: number of new items since the bag was last opened
function updateNavBadges() {
  // QUEST badge
  let questN = 0;
  if (G.gameMode === 'fullrpg') {
    // badge = the next story quest ready to accept (1) + active quests whose
    // objective is already met (ready to turn in). All quests are manual-accept
    // now (taken at NPCs), so the badge focuses on story + ready-to-claim.
    let story = 0, ready = 0;
    if (typeof RPG_QUESTS !== 'undefined' && typeof _rpgState === 'function') {
      const hasNextStory = RPG_QUESTS.some(q => {
        const isChain = q.type === 'chain' || q.chainFrom || q.chainNext;
        if (!isChain) return false;
        const st = _rpgState(q.id);
        return !st.done && !st.active && G.level >= q.minLevel &&
               (!q.chainFrom || _rpgState(q.chainFrom).done);
      });
      story = hasNextStory ? 1 : 0;
      RPG_QUESTS.forEach(q => {
        const st = _rpgState(q.id);
        if (st.active && !st.done && (st.progress||0) >= (q.required||1)) ready++;
      });
    }
    questN = story + ready;
  } else {
    questN = (typeof getHubQuestsPending === 'function') ? getHubQuestsPending().length : 0;
  }
  _setNavBadge('badge-quest', questN);

  // BAG badge — new items since last opened (+ unopened chests)
  const invCount   = (G.inventory || []).length;
  const chestCount = Object.values(G.chests || {}).reduce((a, b) => a + b, 0);
  if (G.seenInvCount === undefined) G.seenInvCount = invCount; // first run baseline
  const newItems = Math.max(0, invCount - G.seenInvCount);
  _setNavBadge('badge-bag', newItems + chestCount);
}

function _setNavBadge(id, n) {
  const el = document.getElementById(id);
  if (!el) return;
  if (n > 0) { el.textContent = n > 99 ? '99+' : n; el.style.display = ''; }
  else el.style.display = 'none';
}

// call when the bag is opened → clears the "new items" badge
function markBagSeen() {
  G.seenInvCount = (G.inventory || []).length;
  updateNavBadges();
}

// ปรับ layout ตาม gameMode — ซ่อน task panel ใน fullrpg แสดง quest panel แทน
function applyGameModeLayout() {
  const taskPanel  = document.getElementById('panel-left');
  const questPanel = document.getElementById('panel-rpg-quests');
  if (!taskPanel) return;
  // บน mobile ใช้ mobile-active class แทน display toggling
  if (!isMobile()) {
    if (G.gameMode === 'fullrpg') {
      taskPanel.style.display  = 'none';
      if (questPanel) questPanel.style.display = '';
    } else {
      taskPanel.style.display  = '';
      if (questPanel) questPanel.style.display = 'none';
    }
  } else {
    // mobile: both panels get display:'' — visibility controlled by mobile-active
    taskPanel.style.display  = '';
    if (questPanel) questPanel.style.display = '';
  }
  // Mode badge in topbar
  const badge = document.getElementById('mode-badge');
  if (badge) {
    badge.textContent = G.gameMode === 'fullrpg' ? '⚔ Full RPG' : '💼 RPG Working';
    badge.style.color = G.gameMode === 'fullrpg' ? '#fa0' : '#4a9';
  }
  // Hide daily quest tab in fullrpg — daily quests are work-based
  const dailyTab = document.querySelector('.tab[onclick*="daily"]');
  if (dailyTab) dailyTab.style.display = G.gameMode === 'fullrpg' ? 'none' : '';
  // Hide streak UI in fullrpg
  const streakInfo = document.querySelector('.streak-info');
  if (streakInfo) streakInfo.style.display = G.gameMode === 'fullrpg' ? 'none' : '';
}

// ──────────────────────────────────────────────────────────────
// MOBILE NAV
// ──────────────────────────────────────────────────────────────

let _mobileActiveTab = 'battle'; // default on first load

function isMobile() { return window.innerWidth <= 700; }

function switchMobileTab(tab) {
  // bag = popup overlay, does not change the active panel
  if (tab === 'bag') {
    if (typeof toggleInventoryPopup === 'function') toggleInventoryPopup();
    return;
  }

  // เปลี่ยนไปแท็บอื่นที่ไม่ใช่กระเป๋า → ปิดกระเป๋าที่เปิดค้างอยู่
  if (typeof closeInventoryPopup === 'function') closeInventoryPopup();

  // any bottom-nav tap leaves the full-screen Hub (acts as "back to map/game")
  const hub = document.getElementById('hub-screen');
  if (hub && hub.style.display === 'block' && typeof closeHub === 'function') closeHub();

  _mobileActiveTab = tab;

  // IDLE tab → full-screen farm view (a body class drives the CSS overlay).
  // Set this BEFORE the isMobile guard so it always applies on the IDLE tab,
  // and make sure the farm loop is actually running when entering it.
  document.body.classList.toggle('mobile-idle-view', tab === 'idle');
  if (tab === 'idle') {
    // measure the real topbar + bottom-nav heights so the fixed IDLE overlay
    // sits exactly between them on any device
    const topbar = document.querySelector('.topbar, #topbar');
    const nav    = document.getElementById('mobile-nav') || document.querySelector('.mobile-nav');
    const r = document.documentElement.style;
    r.setProperty('--mtop', (topbar ? topbar.getBoundingClientRect().bottom : 50) + 'px');
    r.setProperty('--mnav', (nav ? nav.offsetHeight : 58) + 'px');
    if (typeof startIdleFarm === 'function') startIdleFarm();
  }

  // panel switching below is mobile-only
  if (!isMobile()) return;

  const leftId = G.gameMode === 'fullrpg' ? 'panel-rpg-quests' : 'panel-left';
  document.querySelectorAll('.main-layout .panel').forEach(p => p.classList.remove('mobile-active'));

  if (tab === 'left') {
    const lp = document.getElementById(leftId);
    if (lp) lp.classList.add('mobile-active');
  } else if (tab === 'battle' || tab === 'idle') {
    // IDLE lives inside the battle panel; show the panel, the body class
    // (set above) makes #idle-panel fill the screen for the IDLE tab.
    const bp = document.querySelector('.main-layout .battle-panel');
    if (bp) bp.classList.add('mobile-active');
    // entering the battle tab while NOT mid-fight → show the world map
    // (fixes "map sometimes doesn't appear" when coming back from another tab)
    if (tab === 'battle' && !G.battleInProgress && typeof showBattleMap === 'function') {
      showBattleMap();
    }
  } else if (tab === 'char') {
    const cp = document.getElementById('panel-char');
    if (cp) cp.classList.add('mobile-active');
  }

  // sync bottom nav active state
  document.querySelectorAll('#mobile-nav .mnav-btn').forEach(b => b.classList.remove('active'));
  const btnMap = { left:'mnav-left', battle:'mnav-battle', idle:'mnav-idle', char:'mnav-char' };
  const activeBtn = document.getElementById(btnMap[tab]);
  if (activeBtn) activeBtn.classList.add('active');

  // update left nav label + icon
  const leftLabel = document.getElementById('mnav-left-label');
  const leftBtn   = document.getElementById('mnav-left');
  if (leftLabel && leftBtn) {
    if (G.gameMode === 'fullrpg') {
      leftLabel.textContent = 'เควส';
      leftBtn.querySelector('.mnav-icon').textContent = '📜';
    } else {
      leftLabel.textContent = 'ภารกิจ';
      leftBtn.querySelector('.mnav-icon').textContent = '📋';
    }
  }
}

function applyMobileLayout() {
  if (!isMobile()) {
    // desktop: remove mobile-active, show all panels normally
    document.querySelectorAll('.main-layout .panel').forEach(p => p.classList.remove('mobile-active'));
    return;
  }
  // on mobile: apply current tab (default to battle on first call)
  switchMobileTab(_mobileActiveTab || 'battle');

  // sync mode badge in action bar
  const mobBadge = document.getElementById('mode-badge-mob');
  if (mobBadge) {
    mobBadge.textContent = G.gameMode === 'fullrpg' ? '⚔ Full RPG' : '💼 RPG Working';
    mobBadge.style.color = G.gameMode === 'fullrpg' ? '#fa0' : '#4a9';
    mobBadge.style.borderColor = G.gameMode === 'fullrpg' ? '#fa0' : '#4a9';
  }

  // sync chest/inv counts in action bar
  const mobChest = document.getElementById('mob-chest-count');
  if (mobChest) {
    const totalChests = Object.values(G.chests || {}).reduce((a,b) => a+b, 0);
    mobChest.textContent = totalChests > 0 ? `📦${totalChests}` : '';
  }

  // sync event badge
  const evBadge  = document.getElementById('ev-bag-badge');
  const mobEvB   = document.getElementById('mob-ev-badge');
  if (evBadge && mobEvB) {
    mobEvB.style.display = evBadge.style.display;
  }
}

function rpqSwitchTab(tab) {
  const main  = document.getElementById('rpq-pane-main');
  const daily = document.getElementById('rpq-pane-daily');
  const tMain  = document.getElementById('rpq-tab-main');
  const tDaily = document.getElementById('rpq-tab-daily');
  if (!main || !daily) return;
  if (tab === 'daily') {
    main.style.display  = 'none';
    daily.style.display = '';
    if (tMain)  tMain.classList.remove('active');
    if (tDaily) tDaily.classList.add('active');
    if (typeof renderRpgDailyPanel === 'function') renderRpgDailyPanel();
  } else {
    daily.style.display = 'none';
    main.style.display  = '';
    if (tMain)  tMain.classList.add('active');
    if (tDaily) tDaily.classList.remove('active');
    if (typeof renderRpgQuestPanel === 'function') renderRpgQuestPanel();
  }
}

// INIT handled by Play.html inline script