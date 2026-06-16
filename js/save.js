// ============================================================
// SAVE / LOAD — localStorage (robust version)
// ============================================================

const SAVE_KEY    = 'workquest_save';
const SAVE_BACKUP = 'workquest_save_backup';

function saveGame() {
  try {
    if (G.classId) G.lastSeenTime = Date.now(); // for offline progress
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

// ── Export / Import save (กันเซฟหายตอนลบ PWA — เก็บโค้ดไว้เองได้) ──
// localStorage ของ PWA บน iOS อาจถูกล้างตอนถอนแอป → ให้ผู้เล่น export เก็บไว้
function exportSave() {
  try {
    saveGame();
    const code = btoa(unescape(encodeURIComponent(localStorage.getItem(SAVE_KEY) || '{}')));
    return code;
  } catch (e) { return ''; }
}

function importSave(code) {
  try {
    const json = decodeURIComponent(escape(atob((code || '').trim())));
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object' || !parsed.classId) return false;
    localStorage.setItem(SAVE_KEY, json);
    localStorage.setItem(SAVE_BACKUP, json);
    return true;
  } catch (e) { return false; }
}

// UI: open a small modal to copy/paste the save code
function openSaveTransfer() {
  let ov = document.getElementById('save-transfer-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'save-transfer-overlay';
    ov.className = 'overlay';
    ov.onclick = (e) => { if (e.target === ov) ov.classList.remove('active'); };
    document.body.appendChild(ov);
  }
  const code = exportSave();
  ov.innerHTML = `
    <div class="modal" onclick="event.stopPropagation()" style="max-width:420px;width:94%;text-align:left">
      <div style="font-size:1.1rem;font-weight:800;color:var(--gold);text-align:center;margin-bottom:.3rem">💾 สำรอง / กู้คืนเซฟ</div>
      <div style="font-size:.74rem;color:#bbb;text-align:center;margin-bottom:.8rem;line-height:1.5">
        คัดลอกโค้ดนี้เก็บไว้ (โน้ต/แชท) — ถ้าเซฟหายหรือเปลี่ยนเครื่อง วางโค้ดกลับมาเพื่อกู้คืน
      </div>
      <textarea id="save-code-box" readonly style="width:100%;height:90px;background:#0d0d18;border:1px solid #445;border-radius:8px;color:#9fe;font-size:.66rem;padding:.5rem;resize:none;word-break:break-all">${code}</textarea>
      <button onclick="_copySaveCode()" style="width:100%;margin:.5rem 0;padding:.55rem;border-radius:8px;border:none;background:linear-gradient(90deg,#1a7a3a,#2caa55);color:#fff;font-weight:700;cursor:pointer">📋 คัดลอกโค้ด</button>
      <div style="border-top:1px solid #334;margin:.6rem 0;padding-top:.6rem">
        <div style="font-size:.78rem;color:#ffaa66;margin-bottom:.4rem">กู้คืนเซฟ — วางโค้ดที่นี่:</div>
        <textarea id="save-import-box" placeholder="วางโค้ดเซฟที่นี่..." style="width:100%;height:70px;background:#0d0d18;border:1px solid #553;border-radius:8px;color:#fda;font-size:.66rem;padding:.5rem;resize:none;word-break:break-all"></textarea>
        <button onclick="_doImportSave()" style="width:100%;margin-top:.5rem;padding:.55rem;border-radius:8px;border:1px solid #ff8844;background:#3a1a00;color:#ffaa66;font-weight:700;cursor:pointer">♻ กู้คืนเซฟ (เขียนทับของเดิม)</button>
      </div>
      <button class="btn-close-modal" onclick="document.getElementById('save-transfer-overlay').classList.remove('active')">ปิด</button>
    </div>`;
  ov.classList.add('active');
}

function _copySaveCode() {
  const box = document.getElementById('save-code-box');
  if (!box) return;
  box.select();
  try {
    navigator.clipboard.writeText(box.value);
  } catch (e) { document.execCommand('copy'); }
  logBattle('<span class="log-exp">📋 คัดลอกโค้ดเซฟแล้ว! เก็บไว้ให้ดีนะ</span>');
}

function _doImportSave() {
  const box = document.getElementById('save-import-box');
  if (!box || !box.value.trim()) return;
  if (importSave(box.value)) {
    alert('✅ กู้คืนเซฟสำเร็จ! เกมจะโหลดใหม่');
    window.location.reload();
  } else {
    alert('❌ โค้ดไม่ถูกต้อง — ตรวจสอบแล้วลองใหม่');
  }
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
      // snapshot for offline progress — saveGame() refreshes G.lastSeenTime
      // during boot, so keep the original "when did the player leave" aside
      window._offlineLastSeen = parsed.lastSeenTime || 0;
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
      if (G.idleTreePoints    === undefined) G.idleTreePoints    = 0;
      if (G.trialSkillPoints  === undefined) G.trialSkillPoints  = 0;
      if (G.idleExpBonus      === undefined) G.idleExpBonus      = 0;
      if (G.idleGoldBonus     === undefined) G.idleGoldBonus     = 0;
      if (G.offlineCapBonus   === undefined) G.offlineCapBonus   = 0;
      if (G.offlineEffBonus   === undefined) G.offlineEffBonus   = 0;
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
      if (!G.npcQuestProgress)  G.npcQuestProgress  = {};
      if (!G._npcQuestDefs)     G._npcQuestDefs     = {};
      if (!G.enemies)           G.enemies           = [];
      if (G.targetIndex === undefined) G.targetIndex = 0;
      if (!G.claimedMilestones) G.claimedMilestones = [];
      if (!G.weeklyBossKills)   G.weeklyBossKills   = {};
      if (!G.zoneProgress)           G.zoneProgress      = {};
      if (G.attackSpeedBonus === undefined) G.attackSpeedBonus = 0;
      if (G.dropBonusFromTree === undefined) G.dropBonusFromTree = 0;
      // migrate: Infinity Trial combat traits
      if (G.lifestealBonus     === undefined) G.lifestealBonus     = 0;
      if (G.doubleStrikeChance === undefined) G.doubleStrikeChance = 0;
      if (G.damageReduction    === undefined) G.damageReduction    = 0;
      if (G.hasRevive          === undefined) G.hasRevive          = false;
      if (!G.secretClassesFound)              G.secretClassesFound = [];
      if (!G.claimedIdleMilestones)           G.claimedIdleMilestones = [];
      if (!G.materials)                        G.materials = {};
      if (G.dungeonBestFloor === undefined)    G.dungeonBestFloor = 0;
      // existing saves have already learned the game → don't show onboarding
      if (G.tutorialDone === undefined)       G.tutorialDone       = true;
      // transient flags — reset battle state on reload.
      // _idleMode defaults ON (IDLE game) but don't resume an active battle loop.
      G._idleMode = true;
      G.battleInProgress = false;
      // migrate: build zoneProgress from defeatedMonsters for existing saves
      if (G.defeatedMonsters && Object.keys(G.zoneProgress).length === 0) {
        const allZones = [1,2,3,4,5,6];
        allZones.forEach(zid => {
          // count how many tiers cleared consecutively from tier 1
          let cleared = 0;
          for (let t = 1; t <= 6; t++) {
            if (G.defeatedMonsters[`${zid}_${t}`]) cleared = t;
            else break;
          }
          if (cleared > 0) G.zoneProgress[zid] = cleared;
        });
      }
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