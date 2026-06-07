// ============================================================
// DAILY QUESTS & PRESTIGE
// ============================================================

// ---------- Daily quests ----------

function updateDailyQuestProgress(track) {
  if (!track || !G.dailyQuests) return;
  G.dailyQuests.forEach(q => {
    if (q.track === track && !q.done) {
      q.progress = (q.progress || 0) + 1;
      if (q.progress >= q.target) {
        q.done = true;
        const count = q.chestCount || 1;
        for (let i = 0; i < count; i++) G.chests[q.chestType] = (G.chests[q.chestType] || 0) + 1;
        logBattle(`<span class="log-exp">🎯 ภารกิจวันสำเร็จ: ${q.desc}! ได้ ${q.reward}!</span>`);
      }
    }
  });
  renderDailyQuests();
  renderInventory();
}

function renderDailyQuests() {
  const area = document.getElementById('daily-quests');
  if (!area || !G.dailyQuests) return;
  area.innerHTML = '';
  G.dailyQuests.forEach(q => {
    const el = document.createElement('div');
    el.className = 'dq-item' + (q.done ? ' done' : '');
    el.innerHTML = `${q.done ? '✅' : '🎯'} ${q.desc}<br>
      <span class="dq-prog">${Math.min(q.progress || 0, q.target)}/${q.target}</span>
      <span class="dq-reward"> → 🎁 ${q.reward}</span>`;
    area.appendChild(el);
  });
}

// ---------- Prestige ----------

function doPrestige() {
  if (G.level < 100) return;
  const cls = CLASSES.find(c => c.id === G.classId);
  G.prestigeCount++;
  G.prestigeBadges.push({ count:G.prestigeCount, class:G.classId, icon:cls ? cls.icon : '⭐' });

  // reset combat stats but keep badges & achievements
  G.level = 1; G.exp = 0;
  G.maxHp = 100; G.hp = 100;
  G.baseAtk = 10; G.baseDef = 5; G.skillPoints = 0;
  G.tasks = []; G.inventory = []; G.equippedWeaponId = null;
  G.chests = { common:0, uncommon:0, rare:0, boss:0 };
  G.defeatedMonsters = {}; G.battleInProgress = false; G.currentMonster = null;

  logBattle(`<span class="log-exp">✨ PRESTIGE ${G.prestigeCount}! เริ่มใหม่ด้วยพลังที่แข็งแกร่งกว่าเดิม!</span>`);
  checkAchievements();
  saveGame();
  renderAll();
}
