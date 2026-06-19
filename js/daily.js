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
        if(typeof grantChestReward==="function")grantChestReward(q.chestType,count);
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
// doPrestige() + the upgrade system now live in js/prestige.js (reworked to
// grant Prestige Points and permanent upgrades). This stub is intentionally
// gone to avoid shadowing the new version.
