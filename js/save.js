// ============================================================
// SAVE / LOAD — localStorage (robust version)
// ============================================================

const SAVE_KEY    = 'workquest_save';
const SAVE_BACKUP = 'workquest_save_backup';

function saveGame() {
  try {
    const data = JSON.stringify(G);
    localStorage.setItem(SAVE_KEY, data);
    localStorage.setItem(SAVE_BACKUP, data);
  } catch(e) {
    console.warn('[SaveGame] failed:', e);
  }
}

function manualSave() {
  saveGame();
  const btn = document.getElementById('btn-manualsave');
  if (!btn) return;
  const orig = btn.innerHTML;
  btn.innerHTML = '✅ บันทึกแล้ว!';
  btn.style.borderColor = '#44ff88';
  btn.style.color = '#44ff88';
  setTimeout(() => {
    btn.innerHTML = orig;
    btn.style.borderColor = '';
    btn.style.color = '';
  }, 1800);
}

function loadGame() {
  let raw = null;
  try {
    raw = localStorage.getItem(SAVE_KEY);
    // ถ้า key หลักไม่มี ลอง backup
    if (!raw) raw = localStorage.getItem(SAVE_BACKUP);
    if (!raw) return; // เกมใหม่ ไม่มีเซฟ

    const parsed = JSON.parse(raw);
    // validate ว่าเป็น object จริงและมี classId field
    if (parsed && typeof parsed === 'object') {
      Object.assign(G, parsed);
      // migrate: เซฟเก่าอาจไม่มี equippedSlots
      if (!G.equippedSlots) {
        G.equippedSlots = { weapon:null, helmet:null, armor:null, gloves:null, pants:null, boots:null };
        if (G.equippedWeaponId) G.equippedSlots.weapon = G.equippedWeaponId;
      }
      // migrate: event system fields
      if (!G.eventLog)              G.eventLog              = [];
      if (!G.streakEventsTriggered) G.streakEventsTriggered = [];
      if (G.lastWorkEventTime   === undefined) G.lastWorkEventTime   = 0;
      if (G.lastTaskTime        === undefined) G.lastTaskTime        = 0;
      if (G.fatigueDebuff       === undefined) G.fatigueDebuff       = false;
      if (G.pendingMonsterInvasion === undefined) G.pendingMonsterInvasion = false;
      if (G.nextCombatEventKill === undefined) G.nextCombatEventKill = -1;
      // migrate: hub system fields
      if (!G.completedHubQuests)            G.completedHubQuests = [];
      if (G.hubFreeHealUsed === undefined)  G.hubFreeHealUsed    = false;
      if (G.hubFreeHealDate === undefined)  G.hubFreeHealDate    = null;
      if (G.hardTasksDone   === undefined)  G.hardTasksDone      = 0;
      // migrate: cosmetic system
      if (G.cosmeticTier          === undefined) G.cosmeticTier          = 1;
      if (!G.unlockedCosmeticTiers)              G.unlockedCosmeticTiers = [1];
      // migrate: skill tree & branching
      if (!G.skillTreeSpent)    G.skillTreeSpent    = {};
      if (!G.enemyQueue)        G.enemyQueue        = [];
      if (!G.evoQuestProgress)  G.evoQuestProgress  = {};
      if (!G.evoQuestDone)      G.evoQuestDone      = {};
      if (!G.unlockedSkills)    G.unlockedSkills    = [];
      if (G.skillTreePoints   === undefined) G.skillTreePoints   = 0;
      if (G.classBranch       === undefined) G.classBranch       = null;
      if (G.totalDmgTaken     === undefined) G.totalDmgTaken     = 0;
      if (G.critBonusFromTree  === undefined) G.critBonusFromTree  = 0;
      if (G.expBonusFromTree   === undefined) G.expBonusFromTree   = 0;
      if (G.goldBonusFromTree  === undefined) G.goldBonusFromTree  = 0;
      if (G.regenBonusFromTree === undefined) G.regenBonusFromTree = 0;
      if (G.streakBonusFromTree=== undefined) G.streakBonusFromTree= 0;
      if (!G.equippedSkills)    G.equippedSkills    = [];
      if (!G.gameMode)          G.gameMode          = 'working';
      if (!G.rpgQuests)         G.rpgQuests         = {};
      if (G.rpgDaily === undefined) G.rpgDaily      = null;
    }
  } catch(e) {
    console.warn('[LoadGame] failed, trying backup:', e);
    // parse หลักพัง ลอง backup
    try {
      const backup = localStorage.getItem(SAVE_BACKUP);
      if (backup) {
        const parsed = JSON.parse(backup);
        if (parsed && typeof parsed === 'object') Object.assign(G, parsed);
      }
    } catch(e2) {
      console.warn('[LoadGame] backup also failed:', e2);
    }
  }
}