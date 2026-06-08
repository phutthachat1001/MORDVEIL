// ============================================================
// GAME STATE — ตัวแปร global ทั้งหมด
// ============================================================

let G = {
  playerName: 'นักผจญภัย',
  classId: null,
  level: 1,
  exp: 0,
  maxHp: 100,
  hp: 100,
  baseAtk: 10,
  baseDef: 5,
  gold: 0,
  tasks: [],
  inventory: [],
  equippedWeaponId: null,
  equippedSlots: { weapon:null, helmet:null, armor:null, gloves:null, pants:null, boots:null },
  chests: {common:0, uncommon:0, rare:0, boss:0},
  currentZone: 1,
  currentMonster: null,
  defeatedMonsters: {},
  totalTasks: 0,
  totalKills: 0,
  bossKills: 0,
  totalExpGained: 0,
  streak: 0,
  maxStreak: 0,
  lastPlayDate: null,
  todayCount: 0,
  skillPoints: 0,
  prestigeCount: 0,
  prestigeBadges: [],
  unlockedAchievements: [],
  gotRareWeapon: false,
  gotLegendWeapon: false,
  dailyQuests: [],
  dailyQuestProgress: {},
  dailyQuestDate: null,
  battleInProgress: false,
  currentMonsterHp: 0,
  currentMonsterMaxHp: 0,
  enemyQueue: [],
  monsterPoisonTurns: 0,
  monsterBurnTurns: 0,
  playerPoisonTurns: 0,
  playerBurnTurns: 0,
  turnCount: 0,
  sessionKills: 0,
  classTier: 1,
  classEvolutionHistory: [],
  shopStock: null,
  shopStockDate: null,
  shopFreeRefreshUsed: false,
  critCount: 0,
  epicTasksDone: 0,
  totalHpHealed: 0,
  collectedSetPieces: {},
  // Random Event System
  eventLog: [],
  lastWorkEventTime: 0,
  hourlyChestClaimed: null,
  activeExpBoost: null,        // { mult, expiresAt }
  activeWeatherBuff: 0,        // turns remaining for storm (+50% ATK all)
  fatigueDebuff: false,        // ATK-20% debuff จากไม่ทำงานนาน
  lastTaskTime: 0,
  streakEventsTriggered: [],   // streak milestones ที่ trigger แล้ว
  pendingMonsterInvasion: false,
  nextCombatEventKill: -1,     // kill count ที่จะ trigger combat event ถัดไป
  // Hub system
  completedHubQuests: [],
  hubFreeHealUsed: false,
  hubFreeHealDate: null,
  hardTasksDone: 0,
  cosmeticTier: 1,
  unlockedCosmeticTiers: [1],
  // Game Mode
  gameMode: null,          // 'working' | 'fullrpg'
  rpgQuests: {},           // questId -> { active, progress, done } — fullrpg mode only
  rpgDaily: null,          // { date, quests:[...] } — fullrpg daily quests
  // Skill Tree
  skillTreePoints: 0,
  skillTreeSpent: {},      // nodeId -> true
  classBranch: null,       // 'A' or 'B' — chosen at tier 3
  unlockedSkills: [],      // skill ids unlocked via skill tree
  equippedSkills: [],      // skill ids currently equipped (max 4)
  critBonusFromTree: 0,
  expBonusFromTree: 0,
  goldBonusFromTree: 0,
  regenBonusFromTree: 0,
  streakBonusFromTree: 0,
  totalDmgTaken: 0,
  // Evolution quests
  evoQuestProgress: {},    // questId -> progress
  evoQuestDone: {},        // questId -> true
  // NPC quests
  npcQuestProgress: {},    // questId/seenKey -> progress/true
  _npcQuestDefs: {},       // questId -> quest def (transient, restored on kill)
  // Multi-enemy battle
  enemies: [],             // [{...monster, hp, maxHp, poisonTurns, burnTurns}]
  targetIndex: 0,          // which enemy the player is targeting
  // Milestone + Weekly Boss tracking
  claimedMilestones: [],   // kill thresholds already claimed
  weeklyBossKills: {},     // weekKey -> true
  // Zone progress — how many monsters cleared per zone (0-6, 6=all done)
  zoneProgress: {},        // { zoneId: tierIndex } 0=none cleared, 6=all cleared
};

let autoAttackInterval = null;
let currentChestItem   = null;
let currentTooltipItem = null;
let selectedClass      = null;
