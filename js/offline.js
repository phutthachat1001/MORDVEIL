// ============================================================
// OFFLINE PROGRESS — รางวัลตอนกลับมาเล่น
// While the player is away the IDLE hero "keeps farming".
// On return we estimate kills from the elapsed time using the
// same reward math the IDLE panel uses, then show a
// "welcome back" popup with a claim button.
// ============================================================

const OFFLINE_MIN_MS = 3 * 60 * 1000;        // need ≥3 minutes away
const OFFLINE_CAP_MS = 3 * 60 * 60 * 1000;   // earnings cap at 3 hours
const OFFLINE_EFF    = 0.6;                  // 60% of live IDLE rate

let _offlinePending = null; // { kills, exp, gold, ms }

// heartbeat so lastSeenTime stays fresh even if nothing else saves
setInterval(() => {
  if (typeof G !== 'undefined' && G && G.classId) { G.lastSeenTime = Date.now(); saveGame(); }
}, 30000);

function _fmtOfflineDuration(ms) {
  const mins = Math.floor(ms / 60000);
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${h} ชม. ${m} นาที` : `${m} นาที`;
}

// estimate rewards using the IDLE panel's formulas
function _calcOfflineRewards(ms) {
  const curZone = G.currentZone || 1;
  const cleared = (G.zoneProgress && G.zoneProgress[curZone]) || 1;
  const tier    = Math.max(1, Math.min(cleared, 5));
  const full    = getMonsterStats(curZone, tier, false);

  // hero damage per hit (same base math as the IDLE tick, no crits/skills)
  const eq  = (typeof getEquippedStatBonus === 'function') ? getEquippedStatBonus() : { atk:0 };
  const atk = Math.max(1, (G.baseAtk || 10) + (eq.atk || 0) + Math.floor((G.level || 1) / 2));

  const idleHp = Math.max(1, Math.floor(full.maxHp * IDLE_HP_MULT));
  const hits   = Math.max(1, Math.ceil(idleHp / atk));
  const killMs = hits * getAttackInterval() + 900; // + respawn gap between waves
  const eff    = Math.min(1, OFFLINE_EFF + (G.offlineEffBonus || 0)); // IDLE-tree boosts efficiency
  const kills  = Math.floor((ms * eff) / killMs);
  if (kills <= 0) return null;

  const killExpBase = G.gameMode === 'fullrpg' ? 0.5 : 0.03;
  // IDLE-tree EXP/Gold bonuses also apply to offline farming
  const expMult  = 1 + (G.expBonusFromTree || 0)  + (G.idleExpBonus  || 0);
  const expPer = Math.max(1, Math.floor(full.maxHp * killExpBase * 3 * IDLE_REWARD_MULT * expMult));
  let goldPer  = Math.max(1, Math.floor(full.atk * 1.2 * IDLE_REWARD_MULT)); // sync with idle.js gold rate
  const cls = (typeof CLASSES !== 'undefined') ? CLASSES.find(c => c.id === G.classId) : null;
  if (cls && cls.bonuses && cls.bonuses.goldMult) goldPer = Math.floor(goldPer * cls.bonuses.goldMult);
  const goldMult = 1 + (G.goldBonusFromTree || 0) + (G.idleGoldBonus || 0);
  goldPer = Math.floor(goldPer * goldMult);

  return { kills, exp: expPer * kills, gold: goldPer * kills, ms };
}

// called from continueGame() after renderAll()
function checkOfflineProgress() {
  // use the snapshot loadGame() took — G.lastSeenTime gets refreshed by
  // every saveGame() during boot, so it can't be trusted here
  const lastSeen = window._offlineLastSeen || 0;
  window._offlineLastSeen = 0; // claim once per load
  if (!G.classId || !lastSeen) return;
  const away = Date.now() - lastSeen;
  if (away < OFFLINE_MIN_MS) return;

  // IDLE-tree can extend the offline cap (base 3hr + offlineCapBonus hours)
  const cap = OFFLINE_CAP_MS + (G.offlineCapBonus || 0) * 60 * 60 * 1000;
  const rewards = _calcOfflineRewards(Math.min(away, cap));
  if (!rewards) return;
  _offlinePending = rewards;
  _showOfflinePopup(rewards, away, cap);
}

function _showOfflinePopup(r, awayMs, cap) {
  const ov = document.getElementById('offline-overlay');
  if (!ov) return;
  cap = cap || OFFLINE_CAP_MS;
  document.getElementById('offline-time').textContent = _fmtOfflineDuration(awayMs);
  const capEl = document.getElementById('offline-capped');
  if (capEl) {
    capEl.style.display = awayMs > cap ? '' : 'none';
    capEl.textContent = `(นับสูงสุด ${Math.round(cap/3600000)} ชม.)`;
  }
  document.getElementById('offline-rewards').innerHTML = `
    <div class="offline-reward-row"><span>💀 มอนสเตอร์ที่ล่าได้</span><b>${r.kills.toLocaleString()} ตัว</b></div>
    <div class="offline-reward-row"><span>⭐ EXP</span><b style="color:var(--purple)">+${r.exp.toLocaleString()}</b></div>
    <div class="offline-reward-row"><span>💰 ทอง</span><b style="color:var(--gold)">+${r.gold.toLocaleString()}</b></div>`;
  ov.classList.add('active');
  if (typeof playSound === 'function') playSound('chest');
}

function claimOfflineRewards() {
  const r = _offlinePending;
  const ov = document.getElementById('offline-overlay');
  if (ov) ov.classList.remove('active');
  if (!r) return;
  _offlinePending = null;

  G.gold = (G.gold || 0) + r.gold;
  G.idleKills = (G.idleKills || 0) + r.kills; // offline farm = IDLE kills (no achievement credit)
  if (typeof giveExp === 'function') giveExp(r.exp);
  logBattle(`<span class="log-exp">🌙 ฮีโร่ฟาร์มระหว่างคุณไม่อยู่: 💀${r.kills.toLocaleString()} ตัว · +${r.exp.toLocaleString()} EXP · 💰+${r.gold.toLocaleString()}</span>`);
  updateTopBar();
  if (typeof checkAchievements === 'function') checkAchievements('idle');
  saveGame();
  if (typeof playSound === 'function') playSound('exp');
}
