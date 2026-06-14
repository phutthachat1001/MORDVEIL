// ============================================================
// INTRO & CLASS SELECT — หน้าแรก, เลือกคลาส, reset ประจำวัน
// ============================================================

function showModeSelect() {
  // ปิดทุก screen ก่อน แล้วเปิด mode
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-mode').classList.add('active');
}

function selectMode(mode) {
  G.gameMode = mode;
  document.getElementById('screen-mode').classList.remove('active');
  document.getElementById('screen-class').classList.add('active');
  renderClassGrid();
}

function showClassSelect() {
  // ถ้ายังไม่ได้เลือก mode ให้ไปที่ mode select ก่อน
  if (!G.gameMode) {
    showModeSelect();
    return;
  }
  document.getElementById('screen-intro').classList.remove('active');
  document.getElementById('screen-class').classList.add('active');
  renderClassGrid();
}

function continueGame() {
  loadGame();
  if (G.classId) {
    fadeToGame(() => {
      document.getElementById('screen-intro').classList.remove('active');
      document.getElementById('screen-game').classList.add('active');
      checkDailyReset();
      if (G.gameMode === 'fullrpg' && typeof rpgGenerateDaily === 'function') rpgGenerateDaily();
      renderAll();
      if (typeof showBattleMap === 'function') showBattleMap();
      if (typeof migrateEventState       === 'function') migrateEventState();
      if (typeof scheduleNextCombatEvent === 'function') scheduleNextCombatEvent();
      if (typeof startEventTimers        === 'function') startEventTimers();
      if (typeof renderActiveBuffs       === 'function') renderActiveBuffs();
      if (typeof checkStreakEvents       === 'function') checkStreakEvents();
      if (typeof checkOfflineProgress    === 'function') checkOfflineProgress();
    });
  } else {
    showClassSelect();
  }
}

function fadeToGame(callback) {
  const ov = document.getElementById('fade-overlay');
  ov.style.display = 'block';
  requestAnimationFrame(() => {
    ov.style.opacity = '1';
    setTimeout(() => {
      callback();
      setTimeout(() => {
        ov.style.opacity = '0';
        setTimeout(() => { ov.style.display = 'none'; }, 600);
      }, 100);
    }, 600);
  });
}

function renderClassGrid() {
  const grid = document.getElementById('class-grid');
  grid.innerHTML = '';
  CLASSES.forEach(c => {
    const card = document.createElement('div');
    card.className = 'class-card' + (c.locked ? ' locked' : '');
    if (c.locked) {
      card.innerHTML = `<div class="class-icon">${c.icon}</div>
        <div class="class-name">${c.name}</div>
        <div class="class-desc">🔒 เร็วๆ นี้</div>
        <div class="class-stats" style="color:${c.color}">เร็วๆ นี้</div>`;
      grid.appendChild(card);
      return;
    }
    card.innerHTML = `<div class="class-icon">${c.icon}</div>
      <div class="class-name">${c.name}</div>
      <div class="class-desc">${c.desc}</div>
      <div class="class-stats" style="color:${c.color}">${c.stats}</div>`;
    card.onclick = () => {
      document.querySelectorAll('.class-card').forEach(x => x.classList.remove('selected'));
      card.classList.add('selected');
      selectedClass = c.id;
      document.getElementById('btn-confirm-class').disabled = false;
    };
    grid.appendChild(card);
  });
}

function confirmClass() {
  const name = document.getElementById('player-name-input').value.trim() || 'นักผจญภัย';
  if (!selectedClass) return;
  const cls = CLASSES.find(c => c.id === selectedClass);
  G.playerName = name;
  G.classId = selectedClass;
  const b = cls.bonuses;
  if (b.hpMult)  { G.maxHp = Math.floor(100 * b.hpMult); G.hp = G.maxHp; }
  if (b.defMult)   G.baseDef = Math.floor(5  * b.defMult);
  if (b.atkMult)   G.baseAtk = Math.floor(10 * b.atkMult);
  G.lastPlayDate = todayStr();
  G.todayCount   = 0;
  G.classTier    = 1;
  G.classEvolutionHistory = [];
  generateDailyQuests();
  saveGame();
  fadeToGame(() => {
  document.getElementById('screen-class').classList.remove('active');
  document.getElementById('screen-game').classList.add('active');
  renderAll();
  if (typeof showBattleMap === 'function') showBattleMap();
  if (typeof migrateEventState       === 'function') migrateEventState();
  if (typeof scheduleNextCombatEvent === 'function') scheduleNextCombatEvent();
  if (typeof startEventTimers        === 'function') startEventTimers();
  if (typeof renderActiveBuffs       === 'function') renderActiveBuffs();
  if (G.gameMode === 'fullrpg') {
    logBattle(`<span class="log-sys">⚔ ยินดีต้อนรับ ${name} คลาส ${cls.name}! — โหมด Full RPG</span>`);
    logBattle(`<span class="log-sys">📜 รับเควสจากแผง <b>เควส</b> ทางซ้าย แล้วออกล่ามอนสเตอร์เพื่อเก็บ EXP!</span>`);
    if (typeof rpgGenerateDaily    === 'function') rpgGenerateDaily();
    if (typeof renderRpgQuestPanel === 'function') renderRpgQuestPanel();
    if (typeof renderRpgDailyPanel === 'function') renderRpgDailyPanel();
  } else {
    logBattle(`<span class="log-sys">ยินดีต้อนรับ ${name} คลาส ${cls.name}! เริ่มผจญภัยได้เลย!</span>`);
    if (typeof ZONE_LORE !== 'undefined') {
      logBattle(`<span class="log-sys">🗺 ${ZONES[0].name} — ${ZONE_LORE[1]}</span>`);
    }
  }
  // First-time onboarding for new players (covers the lore + core systems).
  // Falls back to the lore-stone popup if the tutorial module isn't present.
  setTimeout(() => {
    if (typeof maybeStartTutorial === 'function' && !G.tutorialDone) {
      maybeStartTutorial();
    } else {
      const overlay = document.getElementById('lore-popup-overlay');
      if (overlay) overlay.classList.add('active');
    }
  }, 600);
  });
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function checkDailyReset() {
  const today = todayStr();
  if (G.lastPlayDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const ys = yesterday.toISOString().slice(0, 10);
    if (G.lastPlayDate === ys)        { G.streak++; if (G.streak > G.maxStreak) G.maxStreak = G.streak; }
    else if (G.lastPlayDate && G.lastPlayDate < ys) G.streak = 0;
    G.lastPlayDate = today;
    G.todayCount = 0;
    generateDailyQuests();
    saveGame();
  }
  if (!G.dailyQuestDate || G.dailyQuestDate !== today) generateDailyQuests();
}

function generateDailyQuests() {
  const today = todayStr();
  if (G.dailyQuestDate === today && G.dailyQuests && G.dailyQuests.length === 3) return;
  G.dailyQuestDate = today;
  const pool = [...DAILY_QUEST_POOL];
  G.dailyQuests = [];
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    G.dailyQuests.push({...pool[idx], progress:0, done:false});
    pool.splice(idx, 1);
  }
  G.dailyQuestProgress = {};
  G.dailyQuests.forEach(q => { G.dailyQuestProgress[q.track] = 0; });
  saveGame();
}

function closeLorePopup() {
  const overlay = document.getElementById('lore-popup-overlay');
  if (overlay) overlay.classList.remove('active');
}

// ---------- New Game / Reset ----------

function confirmNewGame() {
  const overlay = document.getElementById('newgame-overlay');
  if (overlay) overlay.classList.add('active');
}

function cancelNewGame() {
  const overlay = document.getElementById('newgame-overlay');
  if (overlay) overlay.classList.remove('active');
}

function doNewGame() {
  try { localStorage.removeItem('workquest_save'); } catch(e) {}
  window.location.reload();
}