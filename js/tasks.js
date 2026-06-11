// ============================================================
// TASK SYSTEM — เพิ่มงาน, ทำงาน, ลบงาน, streak
// ============================================================

function addTask(isEmergency = false) {
  const name = document.getElementById('task-name').value.trim();
  if (!name) return;
  const diff     = document.getElementById('task-diff').value;
  const deadline = document.getElementById('task-deadline').value;
  G.tasks.push({ id:Date.now(), name, diff, deadline, isEmergency });
  document.getElementById('task-name').value    = '';
  document.getElementById('task-deadline').value = '';
  checkAchievements();
  saveGame();
  renderTasks();
}

function completeTask(id) {
  const idx = G.tasks.findIndex(t => t.id === id);
  if (idx < 0) return;
  const task = G.tasks.splice(idx, 1)[0];

  // EXP calc — scale ตาม level ผู้เล่น
  // base + bonus เพิ่มทุก 10 เลเวล (ทำให้งานยังคุ้มค่าเสมอ)
  const lvScale = 1 + Math.floor(G.level / 10) * 0.15;
  const baseRanges = { easy:[500,1000], medium:[1500,2000], hard:[3000,5000], epic:[6000,12000] };
  const [baseMn, baseMx] = baseRanges[task.diff] || [10,30];
  const mn = Math.floor(baseMn * lvScale);
  const mx = Math.floor(baseMx * lvScale);
  let exp = mn + Math.floor(Math.random() * (mx - mn + 1));

  // multipliers
  let mult = 1;
  const cls = CLASSES.find(c => c.id === G.classId);
  if (cls) {
    if (cls.bonuses.expMult)              mult *= cls.bonuses.expMult;
    if (cls.bonuses.deadlineExpBonus && task.deadline) mult += cls.bonuses.deadlineExpBonus;
  }
  // equipment EXP bonus
  if (typeof getEquippedStatBonus === 'function') {
    const eqB = getEquippedStatBonus();
    if (eqB.expMult && eqB.expMult > 1) mult *= eqB.expMult;
  }
  if (task.isEmergency) mult *= 1.5;
  // event EXP boost buff
  if (typeof getExpBoostMult === 'function') mult *= getExpBoostMult();
  // event reward: task ด่วนพิเศษ
  if (task.isEvent && task.eventReward === 'boss_x2') {
    mult *= 5;
    G.chests.boss = (G.chests.boss || 0) + 2;
    logBattle('<span class="log-exp">🚨 ภารกิจด่วนพิเศษเสร็จสิ้น! EXP×5 + หีบบอส×2!</span>');
    if (typeof evLog === 'function') evLog('🚨','ภารกิจด่วนสำเร็จ!','EXP×5 + หีบบอส×2');
  }

  // update task time for fatigue tracking
  G.lastTaskTime = Date.now();
  if (typeof clearFatigueDebuff === 'function') clearFatigueDebuff();

  G.todayCount++;
  mult *= getStreakMultiplier();
  exp = Math.floor(exp * mult);

  // chest drop
  let chestType = null;
  if (task.isEmergency) {
    chestType = ['easy','medium'].includes(task.diff) ? 'common' : 'uncommon';
  } else {
    const roll = Math.random();
    if      (task.diff === 'easy'   && roll < .60) chestType = 'common';
    else if (task.diff === 'medium' && roll < .70) chestType = Math.random() < .4 ? 'common' : 'uncommon';
    else if (task.diff === 'hard'   && roll < .80) chestType = Math.random() < .3 ? 'uncommon' : 'rare';
    else if (task.diff === 'epic')                 chestType = Math.random() < .5 ? 'rare' : Math.random() < .5 ? 'boss' : 'uncommon';
  }
  if (chestType) G.chests[chestType] = (G.chests[chestType] || 0) + 1;

  // gold
  let goldGain = Math.floor(exp * 0.3); // ลดจาก 0.5 กันเงินเฟ้อ
  if (cls && cls.bonuses.goldMult) goldGain = Math.floor(goldGain * cls.bonuses.goldMult);
  G.gold += goldGain;

  G.totalTasks++;
  G.totalExpGained += exp;
  if (task.diff === 'epic') G.epicTasksDone  = (G.epicTasksDone  || 0) + 1;
  if (task.diff === 'hard') G.hardTasksDone  = (G.hardTasksDone  || 0) + 1;

  // daily quest tracking
  const trackMap = { easy:'easyTasks', medium:'mediumTasks', hard:'hardTasks', epic:'epicTasks' };
  updateDailyQuestProgress(trackMap[task.diff]);
  if (G.todayCount >= 3) updateDailyQuestProgress('todayCount');

  giveExp(exp);
  logBattle(`<span class="log-exp">✅ "${task.name}" เสร็จแล้ว! +${exp} EXP 💰+${goldGain}${chestType ? ` 📦 หีบ${chestType==='rare'?'หายาก':chestType==='uncommon'?'พิเศษ':'ธรรมดา'}` : ''}</span>`);
  playSound('exp');
  checkAchievements();
  saveGame();
  renderTasks();
  renderInventory();
  updateTopBar();
  updateCharPanel();
  renderDailyQuests();
  if (typeof renderEvolutionButton === 'function') renderEvolutionButton();
  // event system hooks
  if (typeof checkStreakEvents  === 'function') checkStreakEvents();
  if (typeof renderActiveBuffs  === 'function') renderActiveBuffs();
  // work event: trigger ทุก 3 งาน
  if (G.todayCount > 0 && G.todayCount % 3 === 0) {
    if (typeof triggerWorkEvent === 'function') setTimeout(triggerWorkEvent, 1500);
  }
}

function deleteTask(id) {
  G.tasks = G.tasks.filter(t => t.id !== id);
  saveGame();
  renderTasks();
}

function getStreakMultiplier() {
  const cls = CLASSES.find(c => c.id === G.classId);
  if (G.streak >= 7) return 1.5;
  if (G.todayCount >= 3) return 1.2;
  if (cls && cls.id === 'archer' && G.todayCount >= (cls.bonuses.streakThreshold || 5)) return cls.bonuses.streakMult || 1.5;
  return 1;
}

function renderTasks() {
  if (G.gameMode === 'fullrpg') return; // fullrpg ไม่ใช้ task panel
  const list = document.getElementById('task-list');
  if (G.tasks.length === 0) {
    list.innerHTML = '<div style="color:var(--text2);text-align:center;font-size:.85rem;padding:1rem">ไม่มีงานค้างอยู่</div>';
    return;
  }
  list.innerHTML = '';
  const today = todayStr();
  const diffMap   = { easy:'diff-easy', medium:'diff-medium', hard:'diff-hard', epic:'diff-epic' };
  const diffLabel = { easy:'ง่าย', medium:'ปานกลาง', hard:'ยาก', epic:'มหาโหด' };
  G.tasks.forEach(t => {
    const isUrgent = t.deadline && t.deadline <= today;
    const item = document.createElement('div');
    item.className = 'task-item' + (isUrgent || t.isEmergency ? ' urgent' : '');
    item.innerHTML = `<span class="task-diff ${diffMap[t.diff]}">${diffLabel[t.diff]}</span>
      <span class="task-name">${t.isEmergency ? '⚡ ' : ''}<b>${t.name}</b>${t.deadline
        ? `<br><span class="task-deadline">📅 ${t.deadline}${isUrgent ? ' ⚠️ เกิน deadline' : ''}</span>`
        : ''}</span>
      <button class="btn-done" onclick="completeTask(${t.id})">✓ เสร็จ</button>
      <button class="btn-del"  onclick="deleteTask(${t.id})">✕</button>`;
    list.appendChild(item);
  });

  const mult = getStreakMultiplier();
  document.getElementById('streak-display').textContent     = G.streak;
  document.getElementById('today-count').textContent        = G.todayCount;
  document.getElementById('streak-bonus-display').textContent = mult > 1 ? `(×${mult.toFixed(1)} EXP)` : '';
}