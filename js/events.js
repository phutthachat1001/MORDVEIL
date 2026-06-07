// ============================================================
// RANDOM EVENT SYSTEM
// ============================================================

// ---------- constants ----------

const EV_COLORS = {
  danger:  '#ff4444',
  gold:    '#ffd700',
  purple:  '#aa44ff',
  blue:    '#44aaff',
  green:   '#44ff88',
  orange:  '#ff8800',
};

let _evCountdownInterval = null;
let _evPendingAction     = null;  // function to call if user picks choice A
let _wandererItem        = null;  // ไอเทมพ่อค้าเร่ร่อน
let _wandererTimer       = null;
let _urgentTimer         = null;

// ---------- screen shake + flash ----------

function evShakeScreen() {
  document.body.classList.add('ev-shake');
  setTimeout(() => document.body.classList.remove('ev-shake'), 500);
}

function evFlash(color) {
  const el = document.getElementById('ev-flash');
  if (!el) return;
  el.style.background = color;
  el.style.opacity = '0.18';
  el.style.pointerEvents = 'none';
  setTimeout(() => { el.style.opacity = '0'; }, 350);
}

// ---------- event log ----------

function evLog(icon, title, detail) {
  const ts = new Date().toLocaleTimeString('th-TH', { hour:'2-digit', minute:'2-digit' });
  if (!G.eventLog) G.eventLog = [];
  G.eventLog.unshift({ icon, title, detail, ts });
  if (G.eventLog.length > 50) G.eventLog.pop();
  renderEventLog();
}

function renderEventLog() {
  const el = document.getElementById('event-log-list');
  if (!el) return;
  if (!G.eventLog || G.eventLog.length === 0) {
    el.innerHTML = '<div style="color:var(--text2);font-size:.8rem;text-align:center;padding:.5rem">ยังไม่มีเหตุการณ์</div>';
    return;
  }
  el.innerHTML = G.eventLog.slice(0, 20).map(e =>
    `<div class="ev-log-row">
      <span class="ev-log-icon">${e.icon}</span>
      <div class="ev-log-body">
        <div class="ev-log-title">${e.title}</div>
        <div class="ev-log-detail">${e.detail}</div>
      </div>
      <span class="ev-log-time">${e.ts}</span>
    </div>`
  ).join('');
}

// ---------- popup helpers ----------

function showEventPopup({ icon, title, desc, color, choiceA, choiceB, onA, onB, countdown }) {
  playSound('event_alert');
  evShakeScreen();
  evFlash(color || EV_COLORS.purple);

  document.getElementById('ev-popup-icon').textContent  = icon;
  document.getElementById('ev-popup-title').textContent = title;
  document.getElementById('ev-popup-desc').textContent  = desc;
  document.getElementById('ev-popup-icon').style.filter = `drop-shadow(0 0 16px ${color || EV_COLORS.purple})`;

  const btnA = document.getElementById('ev-btn-a');
  const btnB = document.getElementById('ev-btn-b');
  const cdEl = document.getElementById('ev-countdown');

  btnA.textContent = choiceA;
  btnA.style.display = 'inline-block';
  btnA.onclick = () => { closeEventPopup(); if (onA) onA(); };

  if (choiceB) {
    btnB.textContent = choiceB;
    btnB.style.display = 'inline-block';
    btnB.onclick = () => { closeEventPopup(); if (onB) onB(); };
  } else {
    btnB.style.display = 'none';
  }

  if (_evCountdownInterval) clearInterval(_evCountdownInterval);
  if (countdown) {
    let left = countdown;
    cdEl.style.display = 'block';
    cdEl.textContent   = `⏱ ${left}s`;
    _evCountdownInterval = setInterval(() => {
      left--;
      cdEl.textContent = `⏱ ${left}s`;
      if (left <= 0) {
        clearInterval(_evCountdownInterval);
        closeEventPopup();
        if (onB) onB(); // time out = ปฏิเสธ
      }
    }, 1000);
  } else {
    cdEl.style.display = 'none';
  }

  document.getElementById('ev-popup-overlay').classList.add('active');
}

function closeEventPopup() {
  document.getElementById('ev-popup-overlay').classList.remove('active');
  if (_evCountdownInterval) { clearInterval(_evCountdownInterval); _evCountdownInterval = null; }
}

// ---------- active buff display ----------

function renderActiveBuffs() {
  const area = document.getElementById('ev-active-buffs');
  if (!area) return;
  const now = Date.now();
  let html = '';

  if (G.activeExpBoost && G.activeExpBoost.expiresAt > now) {
    const sec = Math.ceil((G.activeExpBoost.expiresAt - now) / 1000);
    const m = Math.floor(sec / 60), s = sec % 60;
    html += `<div class="ev-buff-pill buff-gold">⭐ EXP×${G.activeExpBoost.mult} ${m}:${String(s).padStart(2,'0')}</div>`;
  }
  if (G.activeWeatherBuff > 0) {
    html += `<div class="ev-buff-pill buff-orange">🔥 พายุ ATK+50% ${G.activeWeatherBuff} เทิร์น</div>`;
  }
  if (G.fatigueDebuff) {
    html += `<div class="ev-buff-pill buff-red">😴 เหนื่อย ATK-20%</div>`;
  }
  if (G.pendingMonsterInvasion) {
    html += `<div class="ev-buff-pill buff-red">⚔ มอนบุกรุก! ต้องสู้ชนะ</div>`;
  }

  area.innerHTML = html;

  // badge บน icon กระเป๋า
  const badge = document.getElementById('ev-bag-badge');
  if (badge) badge.style.display = G.pendingMonsterInvasion ? 'inline' : 'none';
}

// ---------- EXP boost helper ----------

function getExpBoostMult() {
  if (!G.activeExpBoost) return 1;
  if (Date.now() > G.activeExpBoost.expiresAt) { G.activeExpBoost = null; return 1; }
  return G.activeExpBoost.mult;
}

// ---------- fatigue debuff ----------

function checkFatigueDebuff() {
  if (!G.lastTaskTime) return;
  const hoursSinceLast = (Date.now() - G.lastTaskTime) / 3600000;
  if (hoursSinceLast >= 3 && !G.fatigueDebuff) {
    G.fatigueDebuff = true;
    evLog('😴', 'ตัวละครเหนื่อย', 'ATK-20% เพราะพักงานนาน — ทำงาน 1 ชิ้นหายทันที');
    logBattle('<span class="log-sys">😴 ตัวละครเหนื่อย! ATK-20% ทำงาน 1 งานเพื่อฟื้น</span>');
    evFlash(EV_COLORS.danger);
    renderActiveBuffs();
    saveGame();
  }
}

function clearFatigueDebuff() {
  if (G.fatigueDebuff) {
    G.fatigueDebuff = false;
    logBattle('<span class="log-sys">💪 หายเหนื่อยแล้ว! ATK กลับมาปกติ</span>');
    renderActiveBuffs();
    updateTopBar();
  }
}

// ---------- hourly chest ----------

function checkHourlyChest() {
  const hourKey = new Date().toISOString().slice(0, 13); // "2025-06-05T14"
  if (G.hourlyChestClaimed === hourKey) return;
  if (!G.lastTaskTime && !G.totalKills) return; // ยังไม่ได้เล่นจริงๆ

  G.hourlyChestClaimed = hourKey;
  const type = Math.random() < 0.15 ? 'uncommon' : 'common';
  G.chests[type] = (G.chests[type] || 0) + 1;
  renderInventory();
  saveGame();

  evLog('🎁', 'กล่องของขวัญรายชั่วโมง', `ได้หีบ${type === 'uncommon' ? 'พิเศษ' : 'ธรรมดา'} ฟรี 1 ใบ!`);
  logBattle(`<span class="log-exp">🎁 รางวัลรายชั่วโมง! หีบ${type === 'uncommon' ? 'พิเศษ' : 'ธรรมดา'} +1</span>`);
  playSound('chest');

  // badge บนกระเป๋า
  const badge = document.getElementById('ev-bag-badge');
  if (badge) { badge.style.display = 'inline'; setTimeout(() => { badge.style.display = 'none'; }, 8000); }
}

// ---------- STREAK EVENTS ----------

const STREAK_MILESTONES = [
  { streak:3,  triggered:false,
    fn: () => {
      const expiresAt = Date.now() + 86400000; // ทั้งวัน
      G.activeExpBoost = { mult:1.5, expiresAt };
      saveGame(); renderActiveBuffs();
      evLog('🔥','ร้อนแรง 3 วัน!','EXP×1.5 ทั้งวันนี้');
      showEventPopup({ icon:'🔥', title:'ร้อนแรง!', color:EV_COLORS.orange,
        desc:'Streak 3 วัน! EXP×1.5 ทั้งวันนี้ 🎉',
        choiceA:'รับรางวัล!' });
    }
  },
  { streak:7,  triggered:false,
    fn: () => {
      G.chests.boss = (G.chests.boss || 0) + 1;
      renderInventory(); saveGame();
      evLog('💫','สัปดาห์แห่งตำนาน!','ได้หีบบอส 1 ใบฟรี!');
      showEventPopup({ icon:'💫', title:'สัปดาห์แห่งตำนาน!', color:EV_COLORS.gold,
        desc:'Streak 7 วัน! ได้หีบบอสฟรี 1 ใบ! 🏆',
        choiceA:'รับหีบ!' });
    }
  },
  { streak:14, triggered:false,
    fn: () => {
      G.baseAtk = Math.floor(G.baseAtk * 1.1);
      G.baseDef = Math.floor(G.baseDef * 1.1);
      updateTopBar(); updateCharPanel(); saveGame();
      evLog('⭐','นักรบไม่ย่อท้อ!','ATK+10%, DEF+10% ถาวร (สกิล exclusive)');
      showEventPopup({ icon:'⭐', title:'นักรบไม่ย่อท้อ!', color:EV_COLORS.purple,
        desc:'Streak 14 วัน! ปลดล็อก Exclusive Skill: ATK+10% DEF+10% ถาวร!',
        choiceA:'รับสกิล!' });
    }
  },
  { streak:30, triggered:false,
    fn: () => {
      // ancient weapon
      const ancientWeapon = { id:'ev_ancient_w', name:'ดาบราชาแห่งกาลเวลา',
        slot:'weapon', rarity:'ancient', atk:120, crit:25, icon:'⚔',
        requiredClass:null, effect:'EXP+20%',
        uid: Date.now() + Math.random() };
      if (G.inventory.length < 50) G.inventory.push(ancientWeapon);
      if (!G.prestigeBadges.find(b => b.id === 'streak30')) {
        G.prestigeBadges.push({ id:'streak30', icon:'👑', count:30 });
      }
      renderInventory(); updateCharPanel(); saveGame();
      evLog('👑','ราชาแห่งการทำงาน!','ได้ title badge + ดาบ Ancient ถาวร!');
      showEventPopup({ icon:'👑', title:'ราชาแห่งการทำงาน!', color:EV_COLORS.gold,
        desc:'Streak 30 วัน! ได้ Title Badge ✨ + ดาบ Ancient "ราชาแห่งกาลเวลา" ATK+120!',
        choiceA:'รับรางวัล!' });
    }
  },
];

function checkStreakEvents() {
  if (!G.streak) return;
  if (!G.streakEventsTriggered) G.streakEventsTriggered = [];
  STREAK_MILESTONES.forEach(m => {
    if (G.streak >= m.streak && !G.streakEventsTriggered.includes(m.streak)) {
      G.streakEventsTriggered.push(m.streak);
      saveGame();
      setTimeout(m.fn, 800);
    }
  });
}

// ---------- WORK EVENTS ----------

const WORK_EVENTS = [
  {
    id:'urgent_mission',
    fn: () => {
      const deadline = Date.now() + 7200000; // 2 ชม.
      const missionName = '⚡ ภารกิจฉุกเฉิน: กู้โลกจากความมืด';
      // inject task พิเศษ
      G.tasks.push({ id: Date.now(), name: missionName, diff:'epic',
        deadline: new Date(deadline).toISOString().slice(0,10), isEmergency:true, isEvent:true,
        eventReward:'boss_x2', expiresAt: deadline });
      renderTasks();
      // countdown in task panel
      startUrgentTimer(missionName, deadline);
      saveGame();
      evLog('🚨','งานด่วนพิเศษ!','มีภารกิจ Epic 2 ชั่วโมง EXP×5 + หีบบอส ถ้าทำเสร็จ!');
      showEventPopup({ icon:'🚨', title:'งานด่วนพิเศษ!', color:EV_COLORS.danger,
        desc:'ภารกิจ Epic ปรากฏขึ้น! ทำให้เสร็จใน 2 ชั่วโมง → EXP×5 + หีบบอส',
        choiceA:'รับภารกิจ!' });
    }
  },
  {
    id:'exp_boost_30m',
    fn: () => {
      const expiresAt = Date.now() + 1800000; // 30 นาที
      G.activeExpBoost = { mult:2, expiresAt };
      renderActiveBuffs(); saveGame();
      evLog('🎯','โบนัส EXP พิเศษ!','EXP×2 นาน 30 นาที เริ่มแล้ว!');
      showEventPopup({ icon:'🎯', title:'โบนัส EXP พิเศษ!', color:EV_COLORS.gold,
        desc:'EXP จากงานและมอนทุกชิ้น ×2 นาน 30 นาที! ทำงานเร็วๆ!',
        choiceA:'รับโบนัส!' });
    }
  },
];

let _lastWorkEventId = null;

function triggerWorkEvent() {
  const now = Date.now();
  const minGap = 1800000; // 30 นาที min ระหว่าง work events
  if (now - (G.lastWorkEventTime || 0) < minGap) return;

  // สุ่มเลือก event ที่ไม่ใช่อันล่าสุด
  const pool = WORK_EVENTS.filter(e => e.id !== _lastWorkEventId);
  const ev = pool[Math.floor(Math.random() * pool.length)];
  _lastWorkEventId = ev.id;
  G.lastWorkEventTime = now;
  saveGame();
  ev.fn();
}

function startUrgentTimer(name, deadline) {
  if (_urgentTimer) clearInterval(_urgentTimer);
  const el = document.getElementById('ev-urgent-banner');
  if (!el) return;
  el.style.display = 'block';
  function tick() {
    const left = Math.max(0, deadline - Date.now());
    if (left === 0) {
      clearInterval(_urgentTimer);
      el.style.display = 'none';
      // ลบ task event ที่หมดเวลา
      G.tasks = G.tasks.filter(t => !t.isEvent || t.expiresAt > Date.now());
      renderTasks();
      logBattle('<span class="log-sys">⏰ หมดเวลาภารกิจฉุกเฉิน!</span>');
      return;
    }
    const h = Math.floor(left / 3600000);
    const m = Math.floor((left % 3600000) / 60000);
    const s = Math.floor((left % 60000) / 1000);
    el.innerHTML = `🚨 ภารกิจด่วน: "${name.slice(0,20)}..." ⏱ ${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  tick();
  _urgentTimer = setInterval(tick, 1000);
}

// ---------- COMBAT EVENTS ----------

function scheduleNextCombatEvent() {
  // trigger ที่ kill ถัดไปอีก ~5 ตัว (random 3-8)
  G.nextCombatEventKill = G.totalKills + 3 + Math.floor(Math.random() * 6);
}

function checkCombatEvent() {
  if (!G.nextCombatEventKill || G.totalKills < G.nextCombatEventKill) return;
  if (Math.random() > 0.20) { scheduleNextCombatEvent(); return; } // 20% chance
  scheduleNextCombatEvent();

  const events = [
    triggerFerociousMonster,
    triggerRareMonster,
    triggerMysticalPortal,
    triggerWanderingMerchant,
    triggerStormWeather,
    triggerMysteryPotion,
    triggerMasterWarrior,
    triggerSurpriseBoss,
  ];
  const fn = events[Math.floor(Math.random() * events.length)];
  setTimeout(fn, 300);
}

// 1) ⚡ มอนสเตอร์ดุร้าย
function triggerFerociousMonster() {
  if (!G.battleInProgress && !G.currentMonster) return;
  evLog('⚡','มอนสเตอร์ดุร้าย!','มอนตัวต่อไป ATK×2 HP×2 แต่ EXP×3 + รับประกันหีบ rare');
  showEventPopup({
    icon:'⚡', title:'มอนสเตอร์ดุร้าย!', color:EV_COLORS.danger,
    desc:'มอนตัวต่อไป HP×2 ATK×2 แต่ชนะได้ EXP×3 + หีบ rare รับประกัน!',
    choiceA:'⚡ รับความท้าทาย (+EXP×3)',
    choiceB:'ข้ามไป ปกติ',
    onA: () => { G._ferociousNext = true; logBattle('<span class="log-sys">⚡ เดิมพันสูง! มอนต่อไปจะแกร่งมาก!</span>'); evLog('⚡','รับท้าทาย',''); },
    onB: () => evLog('⚡','ปฏิเสธ','ข้ามความท้าทาย'),
  });
}

// 2) 💀 มอนสเตอร์หายาก
function triggerRareMonster() {
  evLog('💀','มอนสเตอร์หายาก!','มอนพิเศษสีทอง HP สูง ดรอป Legendary รับประกัน');
  showEventPopup({
    icon:'💀', title:'มอนสเตอร์หายาก!', color:EV_COLORS.gold,
    desc:'มอนพิเศษปรากฏ! HP สูงมาก แต่ฆ่าได้รับ Legendary รับประกัน!',
    choiceA:'💀 สู้เลย!',
    choiceB:'ไม่พร้อม ข้าม',
    onA: () => { G._rareMonsterNext = true; logBattle('<span class="log-sys">💀 มอนหายากจะปรากฏในการต่อสู้ถัดไป!</span>'); evLog('💀','รับสู้',''); },
    onB: () => evLog('💀','ปฏิเสธ','ข้ามมอนหายาก'),
  });
}

// 3) 🌀 พอร์ทัลลึกลับ
function triggerMysticalPortal() {
  evLog('🌀','พอร์ทัลลึกลับ!','EXP×2 นาน 5 นาที แต่ HP ไม่ฟื้นระหว่างนั้น');
  showEventPopup({
    icon:'🌀', title:'พอร์ทัลลึกลับ!', color:EV_COLORS.purple,
    desc:'เข้าพอร์ทัล → EXP×2 นาน 5 นาที แต่ HP จะไม่ฟื้นระหว่างนั้น',
    choiceA:'🌀 เข้าพอร์ทัล',
    choiceB:'ปฏิเสธ',
    onA: () => {
      const expiresAt = Date.now() + 300000;
      G.activeExpBoost = { mult:2, expiresAt, noHeal:true };
      renderActiveBuffs(); saveGame();
      logBattle('<span class="log-sys">🌀 เข้าพอร์ทัลแล้ว! EXP×2 5 นาที แต่ HP ไม่ฟื้น!</span>');
      evLog('🌀','เข้าพอร์ทัล','EXP×2 5 นาที เริ่มแล้ว');
    },
    onB: () => evLog('🌀','ปฏิเสธ',''),
  });
}

// 4) 💰 พ่อค้าเร่ร่อน
function triggerWanderingMerchant() {
  // สุ่ม epic item ครึ่งราคา
  const epicPool = Object.values(ALL_ITEMS_BY_SLOT).flat().filter(i => i.rarity === 'epic');
  if (!epicPool.length) return;
  _wandererItem = { ...epicPool[Math.floor(Math.random() * epicPool.length)], uid: Date.now()+Math.random() };
  const price = Math.floor((SHOP_BUY_PRICE['epic'] || 1500) / 2);
  _wandererItem._price = price;

  evLog('💰','พ่อค้าเร่ร่อน!',`${_wandererItem.icon} ${_wandererItem.name} ราคา ${price} ทอง (ครึ่งราคา) มีแค่ 60 วินาที!`);
  showEventPopup({
    icon:'💰', title:'พ่อค้าเร่ร่อน!', color:EV_COLORS.gold,
    desc:`${_wandererItem.icon} ${_wandererItem.name} (Epic) ราคาพิเศษ ${price} ทอง! (ปกติ ${SHOP_BUY_PRICE['epic']}) มีแค่ 60 วินาที!`,
    choiceA:`ซื้อ ${price} ทอง`,
    choiceB:'ไม่ซื้อ',
    countdown:60,
    onA: () => {
      if (G.gold < price) { logBattle('<span class="log-sys">⚠ ทองไม่พอ!</span>'); return; }
      if (G.inventory.length >= 50) { logBattle('<span class="log-sys">⚠ กระเป๋าเต็ม!</span>'); return; }
      G.gold -= price;
      G.inventory.push({ ..._wandererItem });
      updateTopBar(); renderInventory(); saveGame();
      logBattle(`<span class="log-exp">💰 ซื้อ ${_wandererItem.name} จากพ่อค้าเร่ -${price} ทอง</span>`);
      evLog('💰','ซื้อสำเร็จ',`ได้ ${_wandererItem.name}`);
    },
    onB: () => evLog('💰','ปฏิเสธ','พ่อค้าเร่จากไป'),
  });
}

// 5) 🔥 สภาพอากาศแปรปรวน (auto)
function triggerStormWeather() {
  G.activeWeatherBuff = 10;
  renderActiveBuffs(); saveGame();
  evFlash(EV_COLORS.orange);
  evShakeScreen();
  logBattle('<span class="log-sys">🔥 พายุเวทมนตร์! ATK ทุกฝ่าย+50% นาน 10 เทิร์น!</span>');
  evLog('🔥','พายุแปรปรวน!','ATK ทุกฝ่าย+50% นาน 10 เทิร์น');
  playSound('event_danger');
}

// 6) 💊 ขวดยาลึกลับ
function triggerMysteryPotion() {
  evLog('💊','ขวดยาลึกลับ!','70% ฟื้น HP 50% / 30% ลด HP 20%');
  showEventPopup({
    icon:'💊', title:'ขวดยาลึกลับ!', color:EV_COLORS.green,
    desc:'พบขวดยาลึกลับ! 70%: ฟื้น HP 50% / 30%: ลด HP 20% (เสี่ยง)',
    choiceA:'💊 ดื่ม (เสี่ยง)',
    choiceB:'ทิ้ง',
    onA: () => {
      const roll = Math.random();
      const eqBonus = (typeof getEquippedStatBonus === 'function') ? getEquippedStatBonus() : { hp:0 };
      const maxHp = G.maxHp + (eqBonus.hp || 0);
      if (roll < 0.7) {
        const heal = Math.floor(maxHp * 0.5);
        G.hp = Math.min(maxHp, G.hp + heal);
        updateTopBar(); updateCharPanel(); saveGame();
        logBattle(`<span class="log-exp">💊 ยาได้ผล! ฟื้น HP +${heal}</span>`);
        evLog('💊','ยาได้ผล!',`ฟื้น HP +${heal}`);
        playSound('event_heal');
      } else {
        const dmg = Math.floor(maxHp * 0.2);
        G.hp = Math.max(1, G.hp - dmg);
        updateTopBar(); updateCharPanel(); saveGame();
        logBattle(`<span class="log-sys">💊 ยาเป็นพิษ! HP -${dmg}</span>`);
        evLog('💊','ยาเป็นพิษ!',`HP -${dmg}`);
        evFlash(EV_COLORS.danger);
      }
    },
    onB: () => evLog('💊','ทิ้งขวดยา',''),
  });
}

// 7) ⭐ อาจารย์นักรบ
function triggerMasterWarrior() {
  evLog('⭐','อาจารย์นักรบ!','เสนอสอนสกิลพิเศษ แลกทอง 500');
  showEventPopup({
    icon:'⭐', title:'อาจารย์นักรบ!', color:EV_COLORS.blue,
    desc:'อาจารย์ปรากฏ! เสนอสอนสกิลพิเศษ: ATK+15 DEF+8 ถาวร แลกทอง 500',
    choiceA:'เรียน -500 ทอง',
    choiceB:'ปฏิเสธ',
    onA: () => {
      if (G.gold < 500) { logBattle('<span class="log-sys">⚠ ทองไม่พอ 500!</span>'); return; }
      G.gold -= 500;
      G.baseAtk += 15;
      G.baseDef += 8;
      updateTopBar(); updateCharPanel(); saveGame();
      logBattle('<span class="log-exp">⭐ เรียนสกิลสำเร็จ! ATK+15 DEF+8 ถาวร -500 ทอง</span>');
      evLog('⭐','เรียนสกิล','ATK+15 DEF+8 ถาวร');
    },
    onB: () => evLog('⭐','ปฏิเสธ',''),
  });
}

// 8) 👑 บอสเซอร์ไพรส์ (auto)
function triggerSurpriseBoss() {
  evLog('👑','บอสเซอร์ไพรส์!','บอสแรงกว่าปกติ 20% ปรากฏ ได้หีบบอสพิเศษ!');
  evFlash(EV_COLORS.danger);
  evShakeScreen();
  logBattle('<span class="log-sys">👑 บอสเซอร์ไพรส์ปรากฏ! แรงกว่าปกติ 20% ได้หีบบอสถ้าชนะ!</span>');
  G._surpriseBossActive = true;
  playSound('event_danger');
  // flag จะถูกใช้ใน startBattle สำหรับ override stats
}

// ---------- apply combat modifiers ----------

// เรียกใน playerAttack() และ monsterAttack() เพื่อ apply weather buff
function getWeatherAtkMult() {
  return G.activeWeatherBuff > 0 ? 1.5 : 1;
}

function tickWeatherBuff() {
  if (G.activeWeatherBuff > 0) {
    G.activeWeatherBuff--;
    if (G.activeWeatherBuff === 0) {
      logBattle('<span class="log-sys">🌤 พายุสงบแล้ว ATK กลับสู่ปกติ</span>');
    }
    renderActiveBuffs();
  }
}

function getFatigueAtkMult() {
  return G.fatigueDebuff ? 0.8 : 1;
}

// ---------- monster modifiers from events ----------

function applyMonsterEventMods(stats) {
  if (G._ferociousNext) {
    stats.maxHp *= 2;
    stats.atk   *= 2;
    stats._ferociousReward = true;
    G._ferociousNext = false;
  }
  if (G._rareMonsterNext) {
    stats.maxHp *= 3;
    stats._legendaryReward = true;
    G._rareMonsterNext = false;
  }
  if (G._surpriseBossActive) {
    stats.maxHp = Math.floor(stats.maxHp * 1.2);
    stats.atk   = Math.floor(stats.atk   * 1.2);
    stats._surpriseBossReward = true;
    G._surpriseBossActive = false;
  }
  return stats;
}

// เรียกใน monsterDie() หลังมอนตาย
function applyMonsterEventRewards(stats) {
  if (stats._ferociousReward) {
    G.chests.rare = (G.chests.rare || 0) + 1;
    renderInventory();
    logBattle('<span class="log-exp">⚡ ชนะความท้าทาย! EXP×3 + หีบ rare!</span>');
    evLog('⚡','ชนะท้าทาย!','EXP×3 + หีบ rare');
    return 3; // EXP multiplier
  }
  if (stats._legendaryReward) {
    G.chests.boss = (G.chests.boss || 0) + 1;
    renderInventory();
    logBattle('<span class="log-exp">💀 มอนหายากตาย! หีบบอส Legendary รับประกัน!</span>');
    evLog('💀','ชนะมอนหายาก!','ได้หีบบอส');
    return 2;
  }
  if (stats._surpriseBossReward) {
    G.chests.boss = (G.chests.boss || 0) + 1;
    renderInventory();
    logBattle('<span class="log-exp">👑 บอสเซอร์ไพรส์ตาย! หีบบอสพิเศษ!</span>');
    evLog('👑','ชนะบอสเซอร์ไพรส์!','ได้หีบบอสพิเศษ');
    return 1;
  }
  return 1;
}

// ---------- monster invasion ----------

function triggerMonsterInvasion() {
  G.pendingMonsterInvasion = true;
  renderActiveBuffs(); saveGame();
  evLog('⚔','มอนบุกรุก!','มอนแรงบุกเข้ามา ต้องสู้ชนะถึงจะเล่นปกติ ถ้าแพ้เสีย gold 10%');
  showEventPopup({
    icon:'⚔', title:'มอนบุกรุก!', color:EV_COLORS.danger,
    desc:'มอนแรงกว่าปกติบุกเข้ามา! ต้องสู้ชนะถึงจะเล่นปกติได้ ถ้าแพ้เสีย gold 10%',
    choiceA:'⚔ สู้เลย!',
  });
}

function resolveInvasionWin() {
  if (!G.pendingMonsterInvasion) return;
  G.pendingMonsterInvasion = false;
  renderActiveBuffs(); saveGame();
  logBattle('<span class="log-exp">⚔撃退 มอนบุกรุกพ่ายแพ้! ขับไล่สำเร็จ!</span>');
  evLog('⚔','撃退 มอนบุกรุก!','ขับไล่สำเร็จ');
}

function resolveInvasionLose() {
  if (!G.pendingMonsterInvasion) return;
  G.pendingMonsterInvasion = false;
  const loss = Math.floor(G.gold * 0.1);
  G.gold = Math.max(0, G.gold - loss);
  renderActiveBuffs(); updateTopBar(); saveGame();
  logBattle(`<span class="log-sys">⚔ แพ้มอนบุกรุก! เสีย ${loss} ทอง (10%)</span>`);
  evLog('⚔','แพ้มอนบุกรุก!',`เสีย ${loss} ทอง`);
}

// ---------- event log modal toggle ----------

function toggleEventLog() {
  const el = document.getElementById('ev-log-overlay');
  if (!el) return;
  const isActive = el.classList.contains('active');
  if (isActive) {
    el.classList.remove('active');
  } else {
    renderEventLog();
    el.classList.add('active');
  }
}

// ---------- periodic timer (1 นาที) ----------

function startEventTimers() {
  // check ทุก 60 วินาที
  setInterval(() => {
    checkHourlyChest();
    checkFatigueDebuff();
    renderActiveBuffs();
    // check exp boost expired
    if (G.activeExpBoost && Date.now() > G.activeExpBoost.expiresAt) {
      G.activeExpBoost = null;
      logBattle('<span class="log-sys">⭐ โบนัส EXP หมดเวลาแล้ว</span>');
      renderActiveBuffs();
    }
    saveGame();
  }, 60000);

  // check monster invasion ทุก 3 ชั่วโมง (10800000 ms) - ตรวจทุก 5 นาที
  setInterval(() => {
    if (!G.classId) return;
    const hoursSinceLast = (Date.now() - (G.lastTaskTime || Date.now())) / 3600000;
    if (hoursSinceLast >= 3 && !G.pendingMonsterInvasion && Math.random() < 0.3) {
      triggerMonsterInvasion();
    }
  }, 300000);
}

// ---------- save.js migration ----------

function migrateEventState() {
  if (!G.eventLog)              G.eventLog              = [];
  if (!G.streakEventsTriggered) G.streakEventsTriggered = [];
  if (G.lastWorkEventTime   === undefined) G.lastWorkEventTime   = 0;
  if (G.lastTaskTime        === undefined) G.lastTaskTime        = 0;
  if (G.fatigueDebuff       === undefined) G.fatigueDebuff       = false;
  if (G.pendingMonsterInvasion === undefined) G.pendingMonsterInvasion = false;
  if (G.nextCombatEventKill === undefined) scheduleNextCombatEvent();
}
