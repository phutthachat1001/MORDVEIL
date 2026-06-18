// ============================================================
// EXP & LEVEL — สูตร EXP, เลเวลอัพ, แอนิเมชัน
// ============================================================

function expRequired(level) {
  // Steeper curve (1.95) so late levels take meaningfully longer — combined
  // with reduced per-kill / idle EXP this stretches LV90 from ~2 days to a
  // week+ of play instead of a couple of sessions.
  return Math.floor(100 * Math.pow(level, 1.95));
}

function giveExp(amount) {
  G.exp += amount;
  let leveled = false;
  while (G.exp >= expRequired(G.level)) {
    G.exp -= expRequired(G.level);
    G.level++;
    G.maxHp += 10;
    G.hp = Math.min(G.hp + 10, G.maxHp);
    G.baseAtk += 2;
    G.baseDef += 1;
    if (typeof refreshSkillPoints === 'function') refreshSkillPoints();
    leveled = true;
    logBattle(`<span class="log-sys">⭐ เลเวลอัพ! ตอนนี้ LV ${G.level}!</span>`);
    showLevelUpEffect();
    playSound('levelup');
    const zoneUnlocks = {10:2, 25:3, 40:4, 60:5, 80:6};
    if (zoneUnlocks[G.level] && typeof ZONE_LORE !== 'undefined') {
      const zid = zoneUnlocks[G.level];
      logBattle(`<span class="log-sys">🗺 โซนใหม่เปิดแล้ว: ${ZONES.find(z=>z.id===zid)?.name || 'โซน'+zid}! — ${ZONE_LORE[zid] || ''}</span>`);
    }
  }
  updateTopBar();
  checkAchievements();
  if (leveled) {
    renderZoneTabs();
    updateCharPanel();
    // refresh evolution + skill-tree UI in realtime (no reload needed)
    if (typeof renderEvolutionButton === 'function') renderEvolutionButton();
    if (typeof renderSkillTree === 'function') renderSkillTree();
  }
  saveGame();
}

function showLevelUpEffect() {
  const ov  = document.getElementById('levelup-overlay');
  const txt = document.getElementById('levelup-text');
  txt.textContent = `⭐ LEVEL UP! LV ${G.level} ⭐`;
  ov.classList.add('active');
  const flash = document.createElement('div');
  flash.className = 'levelup-flash';
  document.body.appendChild(flash);
  setTimeout(() => { ov.classList.remove('active'); flash.remove(); }, 1500);
}
