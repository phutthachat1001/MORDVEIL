// ============================================================
// DATA DEFINITIONS — แก้ข้อมูลคลาส, มอนสเตอร์, อาวุธ ที่นี่
// ============================================================

const CLASSES = [
  {id:'warrior',name:'นักรบ',icon:'🗡',color:'#ff6644',
   desc:'นักสู้แถวหน้า HP และ DEF สูง ได้ EXP โบนัสจากงานที่มี deadline',
   stats:'+30% HP, +20% DEF',
   bonuses:{hpMult:1.3,defMult:1.2,deadlineExpBonus:0.25}},
  {id:'mage',name:'จอมเวทย์',icon:'🔮',color:'#aa44ff',
   desc:'ดาเมจ burst สูง EXP จากทุกงาน +15%',
   stats:'+25% Burst DMG, +15% EXP',
   bonuses:{atkMult:1.25,expMult:1.15}},
  {id:'rogue',name:'โจร',icon:'🗡️',color:'#44ff88',
   desc:'crit เล็กน้อย ดรอปไอเทมเพิ่มนิดหน่อย ได้ทองมากกว่าเล็กน้อย',
   stats:'+10% CRIT, +5% Drop',
   bonuses:{critBonus:0.1,dropBonus:0.05,goldMult:1.2}},
  {id:'archer',name:'นักธนู',icon:'🏹',color:'#ffd700',
   desc:'Streak bonus ×1.5 เมื่อทำครบ 5 งาน/วัน สถิติสมดุล',
   stats:'Streak ×1.5 @5งาน/วัน',
   bonuses:{streakMult:1.5,streakThreshold:5}},
  {id:'paladin',name:'อัศวินศักดิ์สิทธิ์',icon:'✨',color:'#4488ff',locked:true,
   desc:'ฟื้น HP 10% หลังสู้ทุกครั้ง ทนทานสูง',
   stats:'+10% HP regen/fight, +10% HP',
   bonuses:{hpMult:1.1,regenAfterFight:0.1}}
];

const ZONES = [
  {id:1,name:'ป่ากอบลิน',emoji:'🌲',reqLevel:1,
   monsters:[
    {name:'กอบลินน้อย',  sprite:'👺',img:'gobin',       tier:1,isBoss:false},
    {name:'กอบลินทหาร',  sprite:'👹',img:'warrior_gobin', tier:2,isBoss:false},
    {name:'กอบลินหัวหน้า',sprite:'😤',img:'head_gobin',  tier:3,isBoss:false},
    {name:'กอบลินแม่มด', sprite:'🧙',img:'mage_gobin',  tier:4,isBoss:false},
    {name:'กอบลินยักษ์', sprite:'👾',img:'warrior_gobin',tier:5,isBoss:false},
    {name:'ราชากอบลิน',  sprite:'👑',img:'king_gobin',  tier:6,isBoss:true}
   ]},
  {id:2,name:'หุบเขาซอมบี้',emoji:'🪦',reqLevel:10,
   monsters:[
    {name:'ซอมบี้เน่า',sprite:'🧟',img:'zombie_rot',     tier:1,isBoss:false},
    {name:'ซอมบี้เดิน',sprite:'🤢',img:'zombie_walk',    tier:2,isBoss:false},
    {name:'ซอมบี้นักรบ',sprite:'⚔️',img:'zombie_warrior', tier:3,isBoss:false},
    {name:'ซอมบี้แม่มด',sprite:'💀',img:'zombie_mage',    tier:4,isBoss:false},
    {name:'ซอมบี้ยักษ์',sprite:'🦴',img:'zombie_giant',   tier:5,isBoss:false},
    {name:'จอมซอมบี้',sprite:'👻',img:'zombie_king',     tier:6,isBoss:true}
   ]},
  {id:3,name:'ถ้ำมังกร',emoji:'🐉',reqLevel:25,
   monsters:[
    {name:'มังกรน้ำแข็ง',sprite:'❄️',img:'dragon_ice',    tier:1,isBoss:false},
    {name:'มังกรไฟ',sprite:'🔥',img:'dragon_fire',        tier:2,isBoss:false},
    {name:'มังกรพิษ',sprite:'☠️',img:'dragon_poison',     tier:3,isBoss:false},
    {name:'มังกรสายฟ้า',sprite:'⚡',img:'dragon_thunder', tier:4,isBoss:false},
    {name:'มังกรมืด',sprite:'🌑',img:'dragon_dark',       tier:5,isBoss:false},
    {name:'มังกรราชัน',sprite:'🐲',img:'dragon_king',     tier:6,isBoss:true}
   ]},
  {id:4,name:'ซากอสูร',emoji:'💀',reqLevel:40,
   monsters:[
    {name:'อสูรหัวแตก',sprite:'👿',tier:1,isBoss:false},
    {name:'อสูรทหาร',sprite:'😈',tier:2,isBoss:false},
    {name:'อสูรแม่มด',sprite:'🔱',tier:3,isBoss:false},
    {name:'อสูรยักษ์',sprite:'👹',tier:4,isBoss:false},
    {name:'อสูรจอม',sprite:'💢',tier:5,isBoss:false},
    {name:'ราชาอสูร',sprite:'👑',tier:6,isBoss:true}
   ]},
  {id:5,name:'ปราสาทมืด',emoji:'🏰',reqLevel:60,
   monsters:[
    {name:'ผีปราสาท',sprite:'👻',tier:1,isBoss:false},
    {name:'อัศวินมืด',sprite:'🗡️',tier:2,isBoss:false},
    {name:'แม่มดปราสาท',sprite:'🧙',tier:3,isBoss:false},
    {name:'สัตว์ประหลาด',sprite:'🦇',tier:4,isBoss:false},
    {name:'เจ้าชายมืด',sprite:'🌑',tier:5,isBoss:false},
    {name:'เจ้าแห่งปราสาท',sprite:'👑',tier:6,isBoss:true}
   ]},
  {id:6,name:'อาณาจักรโกลาหล',emoji:'🌀',reqLevel:80,
   monsters:[
    {name:'ปีศาจโกลาหล',sprite:'🌀',tier:1,isBoss:false},
    {name:'อสูรจักรวาล',sprite:'💫',tier:2,isBoss:false},
    {name:'เทพมืด',sprite:'🌌',tier:3,isBoss:false},
    {name:'อสูรนิรันดร์',sprite:'⚡',tier:4,isBoss:false},
    {name:'ผู้พิทักษ์โกลาหล',sprite:'🔥',tier:5,isBoss:false},
    {name:'เทพแห่งโกลาหล',sprite:'🌠',tier:6,isBoss:true}
   ]}
];

// ============================================================
// MONSTER CARDS — การ์ดสะสม (ดรอปจากมอนตัวนั้นๆ)
// เก็บการ์ดแล้วได้โบนัส stat ถาวร (สะสมยิ่งเยอะ ยิ่งแกร่ง)
//  rarity ตาม tier ของมอน · บอส = การ์ดแรร์ขึ้น
//  + 2 ระดับพิเศษเหนือ mythic:
//    • Limited (ฟ้า) — การ์ดอีเวนต์ หาได้เฉพาะบางช่วง
//    • Secret  (ดำ)  — การ์ดลับ หายากสุดๆ (ดรอปจากบอสด้วยอัตราต่ำมาก)
// ============================================================
const CARD_CONFIG = {
  // โบนัส stat ต่อการ์ด 1 ใบ (ตาม rarity)
  statByRarity: {
    common:  { atk:1,  def:1,  hp:8  },
    uncommon:{ atk:2,  def:2,  hp:15 },
    rare:    { atk:4,  def:3,  hp:30 },
    epic:    { atk:7,  def:5,  hp:55 },
    legend:  { atk:12, def:9,  hp:90 },
    ancient: { atk:18, def:14, hp:140 },
    mythic:  { atk:28, def:20, hp:220 },
    limited: { atk:35, def:25, hp:280, crit:0.05 },
    secret:  { atk:55, def:40, hp:450, crit:0.10 },
  },
  // โอกาสดรอปการ์ด — "ยิ่งด่านยาก/มอนยาก ยิ่งหายาก" (ไล่จากด่าน1ตัวแรกสุด)
  //   chance = topChance × decay^(rank-1)
  //   rank = (zone-1)*5 + min(tier,5)  → ด่าน1ตัว1 = rank1 (เยอะสุด)
  //          ด่าน6ตัว5 = rank30 (ต่ำสุด)
  topChance: 0.06,   // ด่าน 1 ตัวแรก = 6%
  decayPerRank: 0.93, // ลดลง 7% ต่ออันดับความยาก → ด่าน6ตัว5 ≈ 0.7%
  bossChance: 0.05,   // การ์ดบอส (tier 6) — บอสนานๆเจอ เลยให้คงที่พอเหมาะ
  secretDropChance: 0.0015, // 0.15% จากบอสด่านนั้น (ต้องเป็นบอส)
};

// โอกาสดรอปการ์ดมอนตาม zone+tier (rank ความยากรวม)
function cardDropChance(zone, tier, isBoss) {
  if (typeof CARD_CONFIG === 'undefined') return 0;
  if (isBoss || tier >= 6) return CARD_CONFIG.bossChance;
  const z = Math.min(6, Math.max(1, zone || 1));
  const t = Math.min(5, Math.max(1, tier || 1));
  const rank = (z - 1) * 5 + t;        // 1..30
  return CARD_CONFIG.topChance * Math.pow(CARD_CONFIG.decayPerRank, rank - 1);
}

// rarity ของการ์ดมอนตาม tier
function _cardRarityForTier(tier, isBoss) {
  if (isBoss) return ['ancient','mythic'][Math.min(1, Math.floor((tier-5)))] || 'ancient';
  return ['common','common','uncommon','rare','epic','legend'][tier-1] || 'common';
}

// สร้าง CARDS จาก ZONES (1 ใบ/มอน) + การ์ด Secret ลับ 1 ใบ/ด่าน
const CARDS = (function buildCards() {
  const list = [];
  ZONES.forEach(z => {
    z.monsters.forEach((m, idx) => {
      const rarity = _cardRarityForTier(m.tier, m.isBoss);
      list.push({
        id: `card_z${z.id}_t${m.tier}`,
        name: m.name,
        icon: m.sprite || '👾',
        img: m.img || null,
        zone: z.id, tier: m.tier, isBoss: !!m.isBoss,
        rarity,
        source: 'monster',          // ดรอปจากมอนตัวนี้
        stat: CARD_CONFIG.statByRarity[rarity],
      });
    });
    // การ์ด Secret ลับประจำด่าน — ดรอปจากบอสด่านนั้นเท่านั้น (โอกาสต่ำมาก)
    const boss = z.monsters.find(mm => mm.isBoss);
    list.push({
      id: `card_secret_z${z.id}`,
      name: `เงาลับแห่ง${z.name}`,
      icon: '🃏',
      zone: z.id, tier: 6, isBoss: false,
      rarity: 'secret',
      source: 'secret',            // ดรอปลับจากบอสด่านนี้
      bossSprite: boss ? boss.sprite : '👑',
      stat: CARD_CONFIG.statByRarity.secret,
    });
  });
  return list;
})();

// การ์ด Limited (อีเวนต์) — เพิ่ม/เปิดได้ตามช่วงเวลา (ดู isCardAvailable)
// availableFrom/To = วันที่ ISO (YYYY-MM-DD) ที่ดรอปได้ · ถ้าไม่กำหนด = ปิดไว้ก่อน
const LIMITED_CARDS = [
  { id:'card_ltd_founder', name:'การ์ดผู้บุกเบิก', icon:'🎴', rarity:'limited', source:'limited',
    stat: CARD_CONFIG.statByRarity.limited, dropZone:'any', dropChance:0.004,
    availableFrom:'2026-06-01', availableTo:'2026-07-31',
    desc:'การ์ดฉลองเปิดเกม — ดรอปได้จากมอนทุกด่านในช่วงเปิดตัวเท่านั้น' },
];

// การ์ดทั้งหมด (มอน + ลับ + ลิมิเต็ด)
const ALL_CARDS = CARDS.concat(LIMITED_CARDS);

// การ์ด Limited ใบนี้เปิดให้ดรอปอยู่ไหม (ตามวันที่)
function isCardAvailable(card) {
  if (card.source !== 'limited') return true;
  const today = new Date().toISOString().slice(0, 10);
  if (card.availableFrom && today < card.availableFrom) return false;
  if (card.availableTo   && today > card.availableTo)   return false;
  return true;
}

const WEAPONS = [
  // COMMON (gray)
  {id:'w01',name:'ดาบไม้',rarity:'common',atk:2,effect:null,icon:'🪵'},
  {id:'w02',name:'มีดเก่า',rarity:'common',atk:3,effect:null,icon:'🔪'},
  {id:'w03',name:'กระบองชาวนา',rarity:'common',atk:2,effect:null,icon:'🏏'},
  {id:'w04',name:'หอกหัก',rarity:'common',atk:4,effect:null,icon:'🔱'},
  {id:'w05',name:'ธนูไม้',rarity:'common',atk:3,effect:null,icon:'🏹'},
  // UNCOMMON (green)
  {id:'w06',name:'ดาบเหล็กกล้า',rarity:'uncommon',atk:8,effect:'crit+5%',icon:'⚔️'},
  {id:'w07',name:'ขวานป่า',rarity:'uncommon',atk:10,effect:null,icon:'🪓'},
  {id:'w08',name:'ธนูล่าสัตว์',rarity:'uncommon',atk:7,effect:'crit+8%',attackSpeed:0.05,icon:'🏹'},
  {id:'w09',name:'ไม้เท้าเวทมนตร์',rarity:'uncommon',atk:6,effect:'EXP+5%',attackSpeed:0.05,icon:'🪄'},
  {id:'w10',name:'กริชสองคม',rarity:'uncommon',atk:9,effect:'crit+10%',attackSpeed:0.06,icon:'🗡️'},
  // RARE (blue)
  {id:'w11',name:'ดาบมังกรน้ำแข็ง',rarity:'rare',atk:20,effect:'ชะลอ-10% ATK ศัตรู',icon:'❄️'},
  {id:'w12',name:'คทาสายฟ้า',rarity:'rare',atk:18,effect:'EXP+10%',attackSpeed:0.08,icon:'⚡'},
  {id:'w13',name:'โล่สายลม',rarity:'rare',atk:12,effect:'DEF+5',icon:'🛡️'},
  {id:'w14',name:'ธนูเพลิง',rarity:'rare',atk:22,effect:'เผา 5%/เทิร์น',attackSpeed:0.10,icon:'🔥'},
  {id:'w15',name:'กระบี่อสูร',rarity:'rare',atk:25,effect:'ดูดเลือด 5%',attackSpeed:0.08,icon:'🗡️'},
  {id:'w16',name:'ขวานสายเลือด',rarity:'rare',atk:28,effect:'ดูดเลือด 8%',icon:'🪓'},
  {id:'w17',name:'ไม้เท้าเงา',rarity:'rare',atk:16,effect:'EXP+15%',attackSpeed:0.08,icon:'🌑'},
  // EPIC (purple)
  {id:'w18',name:'ดาบวิญญาณมืด',rarity:'epic',atk:45,effect:'crit×2 ทุก 3 เทิร์น',attackSpeed:0.12,icon:'💜'},
  {id:'w19',name:'คทาพลังจักรวาล',rarity:'epic',atk:40,effect:'EXP+20%',attackSpeed:0.12,icon:'🔮'},
  {id:'w20',name:'ธนูนักล่าปีศาจ',rarity:'epic',atk:42,effect:'ไม่พลาด+20%',attackSpeed:0.15,icon:'🏹'},
  {id:'w21',name:'กระบี่สายพิษ',rarity:'epic',atk:38,effect:'พิษ 10%/เทิร์น',attackSpeed:0.12,icon:'☠️'},
  {id:'w22',name:'ขวานยักษ์โบราณ',rarity:'epic',atk:55,effect:'ดาเมจ+30% vs บอส',icon:'🪓'},
  {id:'w23',name:'โล่อัศวินศักดิ์สิทธิ์',rarity:'epic',atk:30,effect:'DEF+15 ดูดเลือด 5%',icon:'✨'},
  {id:'w24',name:'หอกพิฆาตมังกร',rarity:'epic',atk:50,effect:'ดาเมจ×2 vs มังกร',attackSpeed:0.12,icon:'🐉'},
  // LEGENDARY (orange)
  {id:'w25',name:'ดาบสยบสวรรค์',rarity:'legend',atk:80,effect:'crit×3 ดูดเลือด 15%',attackSpeed:0.18,icon:'⚔️'},
  {id:'w26',name:'คทาผู้พิพากษาโลก',rarity:'legend',atk:75,effect:'EXP+30% ดาเมจทะลุ DEF',attackSpeed:0.15,icon:'🔮'},
  {id:'w27',name:'ธนูแห่งรุ่งอรุณ',rarity:'legend',atk:70,effect:'ยิง 2 ครั้ง/เทิร์น',attackSpeed:0.20,icon:'🌅'},
  {id:'w28',name:'กระบี่อมตะ',rarity:'legend',atk:85,effect:'ดูดเลือด 20% HP+50',attackSpeed:0.18,icon:'♾️'},
  {id:'w29',name:'ขวานปราบอสูร',rarity:'legend',atk:90,effect:'ดาเมจ×2 ทุกครั้ง vs บอส',icon:'💥'},
  {id:'w30',name:'หอกเจาะนิรันดร์',rarity:'legend',atk:78,effect:'ทะลุ DEF 100% DEF+10',attackSpeed:0.15,icon:'🌟'},
  // ANCIENT (red)
  {id:'w31',name:'ดาบพิฆาตเทพ',rarity:'ancient',atk:150,effect:'crit×5 ดูดเลือด 25% EXP+50%',attackSpeed:0.25,icon:'🌈'},
  {id:'w32',name:'คทาแห่งจักรวาล',rarity:'ancient',atk:130,effect:'EXP+50% ดาเมจทะลุทุกอย่าง',attackSpeed:0.20,icon:'🌌'}
];

// ====================================================================
// EQUIPMENT ITEM POOLS — แต่ละ slot มี item ของตัวเอง
// ====================================================================

// เพิ่ม slot:'weapon' ให้ WEAPONS ทุกชิ้น (backward compat)
WEAPONS.forEach(w => { w.slot = 'weapon'; });

const HELMETS = [
  // COMMON
  {id:'h01',name:'หมวกฟางชาวนา',slot:'helmet',rarity:'common',def:2,hp:10,icon:'🪖',requiredClass:null},
  {id:'h02',name:'ผ้าโพกศีรษะเก่า',slot:'helmet',rarity:'common',def:1,hp:15,icon:'🎩',requiredClass:null},
  {id:'h03',name:'หมวกหนังสัตว์',slot:'helmet',rarity:'common',def:3,hp:8,icon:'🪖',requiredClass:null},
  {id:'h04',name:'โครงเหล็กหัก',slot:'helmet',rarity:'common',def:2,hp:12,icon:'🪖',requiredClass:null},
  {id:'h05',name:'หมวกผ้าหยาบ',slot:'helmet',rarity:'common',def:1,hp:20,icon:'🎩',requiredClass:null},
  // UNCOMMON
  {id:'h06',name:'หมวกเกราะเหล็ก',slot:'helmet',rarity:'uncommon',def:6,hp:25,icon:'🪖',requiredClass:null},
  {id:'h07',name:'มงกุฎหนามเงิน',slot:'helmet',rarity:'uncommon',def:5,hp:30,icon:'👑',requiredClass:null},
  {id:'h08',name:'หมวกนักล่าป่า',slot:'helmet',rarity:'uncommon',def:4,hp:35,icon:'🎩',requiredClass:'archer'},
  {id:'h09',name:'โบนาร์เวทย์',slot:'helmet',rarity:'uncommon',def:3,hp:20,effect:'EXP+5%',icon:'🎩',requiredClass:'mage'},
  {id:'h10',name:'หมวกโจรหนัง',slot:'helmet',rarity:'uncommon',def:4,hp:28,icon:'🪖',requiredClass:'rogue'},
  // RARE
  {id:'h11',name:'หมวกมังกรเงิน',slot:'helmet',rarity:'rare',def:12,hp:60,icon:'🪖',requiredClass:null},
  {id:'h12',name:'มงกุฎนักบุญ',slot:'helmet',rarity:'rare',def:8,hp:80,effect:'ฟื้น HP+5/เทิร์น',icon:'👑',requiredClass:'paladin'},
  {id:'h13',name:'หมวกเงาพิฆาต',slot:'helmet',rarity:'rare',def:10,hp:50,effect:'crit+5%',icon:'🪖',requiredClass:'rogue'},
  {id:'h14',name:'มงกุฎนักรบ',slot:'helmet',rarity:'rare',def:15,hp:55,icon:'👑',requiredClass:'warrior'},
  {id:'h15',name:'หมวกจอมเวทย์',slot:'helmet',rarity:'rare',def:6,hp:40,effect:'EXP+10%',icon:'🎩',requiredClass:'mage'},
  // EPIC
  {id:'h16',name:'หมวกอัศวินเพลิง',slot:'helmet',rarity:'epic',def:22,hp:120,icon:'🪖',requiredClass:'warrior'},
  {id:'h17',name:'มงกุฎเวทย์มืด',slot:'helmet',rarity:'epic',def:14,hp:90,effect:'EXP+15%',icon:'👑',requiredClass:'mage'},
  {id:'h18',name:'หมวกราชาเงา',slot:'helmet',rarity:'epic',def:18,hp:100,effect:'crit+10%',icon:'🪖',requiredClass:'rogue'},
  {id:'h19',name:'มงกุฎนักล่าดาว',slot:'helmet',rarity:'epic',def:20,hp:110,icon:'👑',requiredClass:'archer'},
  {id:'h20',name:'หมวกเทพแสง',slot:'helmet',rarity:'epic',def:16,hp:130,effect:'ฟื้น HP+10/เทิร์น',icon:'👑',requiredClass:'paladin'},
  // LEGENDARY
  {id:'h21',name:'มงกุฎหายนะ',slot:'helmet',rarity:'legend',def:35,hp:200,icon:'👑',requiredClass:'warrior'},
  {id:'h22',name:'หมวกจักรวาลเวทย์',slot:'helmet',rarity:'legend',def:25,hp:160,effect:'EXP+25%',icon:'🎩',requiredClass:'mage'},
  {id:'h23',name:'มงกุฎเงาอมตะ',slot:'helmet',rarity:'legend',def:30,hp:180,effect:'crit+20%',icon:'👑',requiredClass:'rogue'},
  {id:'h24',name:'มงกุฎจอมล่าจักรวาล',slot:'helmet',rarity:'legend',def:32,hp:190,icon:'👑',requiredClass:'archer'},
  {id:'h25',name:'มงกุฎเทพแสงนิรันดร์',slot:'helmet',rarity:'legend',def:28,hp:220,effect:'ฟื้น HP+20/เทิร์น',icon:'👑',requiredClass:'paladin'},
];

const ARMORS = [
  // COMMON
  {id:'a01',name:'เสื้อหนังสัตว์',slot:'armor',rarity:'common',def:4,icon:'🥋',requiredClass:null},
  {id:'a02',name:'ชุดผ้าหยาบ',slot:'armor',rarity:'common',def:3,icon:'👕',requiredClass:null},
  {id:'a03',name:'เกราะไม้',slot:'armor',rarity:'common',def:5,icon:'🥋',requiredClass:null},
  {id:'a04',name:'เสื้อผ้าเก่า',slot:'armor',rarity:'common',def:2,icon:'👕',requiredClass:null},
  {id:'a05',name:'ชุดชาวนาเก่า',slot:'armor',rarity:'common',def:3,icon:'🥋',requiredClass:null},
  // UNCOMMON
  {id:'a06',name:'เกราะโซ่เหล็ก',slot:'armor',rarity:'uncommon',def:12,icon:'🥋',requiredClass:null},
  {id:'a07',name:'ชุดหนังนักล่า',slot:'armor',rarity:'uncommon',def:9,icon:'🥋',requiredClass:'archer'},
  {id:'a08',name:'เสื้อคลุมเวทย์',slot:'armor',rarity:'uncommon',def:7,effect:'EXP+5%',icon:'🥋',requiredClass:'mage'},
  {id:'a09',name:'ชุดดำนักฆ่า',slot:'armor',rarity:'uncommon',def:8,icon:'🥋',requiredClass:'rogue'},
  {id:'a10',name:'เกราะอัศวิน',slot:'armor',rarity:'uncommon',def:14,icon:'🥋',requiredClass:'warrior'},
  // RARE
  {id:'a11',name:'เกราะมังกรดำ',slot:'armor',rarity:'rare',def:22,icon:'🥋',requiredClass:null},
  {id:'a12',name:'ชุดเงาพิษ',slot:'armor',rarity:'rare',def:16,effect:'crit+5%',icon:'🥋',requiredClass:'rogue'},
  {id:'a13',name:'เสื้อคลุมจักรวาล',slot:'armor',rarity:'rare',def:14,effect:'EXP+10%',icon:'🥋',requiredClass:'mage'},
  {id:'a14',name:'เกราะนักบุญ',slot:'armor',rarity:'rare',def:20,effect:'ฟื้น HP+5/เทิร์น',icon:'🥋',requiredClass:'paladin'},
  {id:'a15',name:'เกราะหนังป่าเขียว',slot:'armor',rarity:'rare',def:18,icon:'🥋',requiredClass:'archer'},
  // EPIC
  {id:'a16',name:'เกราะอัศวินเพลิง',slot:'armor',rarity:'epic',def:38,icon:'🥋',requiredClass:'warrior'},
  {id:'a17',name:'ชุดเงาราชัน',slot:'armor',rarity:'epic',def:28,effect:'crit+8%',icon:'🥋',requiredClass:'rogue'},
  {id:'a18',name:'เสื้อคลุมเทพเวทย์',slot:'armor',rarity:'epic',def:22,effect:'EXP+18%',icon:'🥋',requiredClass:'mage'},
  {id:'a19',name:'เกราะนักล่าดาว',slot:'armor',rarity:'epic',def:32,icon:'🥋',requiredClass:'archer'},
  {id:'a20',name:'เกราะแสงศักดิ์สิทธิ์',slot:'armor',rarity:'epic',def:30,effect:'ฟื้น HP+12/เทิร์น',icon:'🥋',requiredClass:'paladin'},
  // LEGENDARY
  {id:'a21',name:'เกราะมืดหายนะ',slot:'armor',rarity:'legend',def:60,icon:'🥋',requiredClass:'warrior'},
  {id:'a22',name:'ชุดราชาเงาอมตะ',slot:'armor',rarity:'legend',def:45,effect:'crit+15%',icon:'🥋',requiredClass:'rogue'},
  {id:'a23',name:'เสื้อคลุมจักรวาลนิรันดร์',slot:'armor',rarity:'legend',def:38,effect:'EXP+30%',icon:'🥋',requiredClass:'mage'},
  {id:'a24',name:'เกราะจอมล่าจักรวาล',slot:'armor',rarity:'legend',def:52,icon:'🥋',requiredClass:'archer'},
  {id:'a25',name:'เกราะเทพแห่งแสง',slot:'armor',rarity:'legend',def:50,effect:'ฟื้น HP+20/เทิร์น',icon:'🥋',requiredClass:'paladin'},
];

const GLOVES = [
  // COMMON
  {id:'g01',name:'ถุงมือหนังหยาบ',slot:'gloves',rarity:'common',atk:2,crit:1,icon:'🧤',requiredClass:null},
  {id:'g02',name:'ถุงมือผ้าเก่า',slot:'gloves',rarity:'common',atk:1,crit:2,icon:'🧤',requiredClass:null},
  {id:'g03',name:'ถุงมือชาวนา',slot:'gloves',rarity:'common',atk:3,crit:0,icon:'🧤',requiredClass:null},
  {id:'g04',name:'ถุงมือหนังสัตว์',slot:'gloves',rarity:'common',atk:2,crit:1,icon:'🧤',requiredClass:null},
  {id:'g05',name:'ถุงมือไม้',slot:'gloves',rarity:'common',atk:1,crit:3,icon:'🧤',requiredClass:null},
  // UNCOMMON
  {id:'g06',name:'ถุงมือนักล่า',slot:'gloves',rarity:'uncommon',atk:6,crit:5,icon:'🧤',requiredClass:null},
  {id:'g07',name:'ถุงมือมีดคม',slot:'gloves',rarity:'uncommon',atk:8,crit:8,attackSpeed:0.04,icon:'🧤',requiredClass:'rogue'},
  {id:'g08',name:'ถุงมือยิงธนู',slot:'gloves',rarity:'uncommon',atk:7,crit:6,attackSpeed:0.04,icon:'🧤',requiredClass:'archer'},
  {id:'g09',name:'ถุงมือเวทย์',slot:'gloves',rarity:'uncommon',atk:4,crit:4,effect:'EXP+5%',icon:'🧤',requiredClass:'mage'},
  {id:'g10',name:'ถุงมือเกราะเหล็ก',slot:'gloves',rarity:'uncommon',atk:7,crit:2,icon:'🧤',requiredClass:'warrior'},
  // RARE
  {id:'g11',name:'ถุงมือมังกรดำ',slot:'gloves',rarity:'rare',atk:14,crit:10,icon:'🧤',requiredClass:null},
  {id:'g12',name:'ถุงมือนักฆ่าเงา',slot:'gloves',rarity:'rare',atk:16,crit:15,attackSpeed:0.08,icon:'🧤',requiredClass:'rogue'},
  {id:'g13',name:'ถุงมือแสงสวรรค์',slot:'gloves',rarity:'rare',atk:10,crit:8,effect:'ฟื้น HP+5/เทิร์น',icon:'🧤',requiredClass:'paladin'},
  {id:'g14',name:'ถุงมือธนูเพลิง',slot:'gloves',rarity:'rare',atk:15,crit:12,attackSpeed:0.08,icon:'🧤',requiredClass:'archer'},
  {id:'g15',name:'ถุงมือเวทย์มืด',slot:'gloves',rarity:'rare',atk:10,crit:10,effect:'EXP+10%',icon:'🧤',requiredClass:'mage'},
  // EPIC
  {id:'g16',name:'ถุงมือหายนะ',slot:'gloves',rarity:'epic',atk:26,crit:18,icon:'🧤',requiredClass:'warrior'},
  {id:'g17',name:'ถุงมือมืดสนิท',slot:'gloves',rarity:'epic',atk:28,crit:25,attackSpeed:0.12,icon:'🧤',requiredClass:'rogue'},
  {id:'g18',name:'ถุงมือเทพ',slot:'gloves',rarity:'epic',atk:18,crit:15,effect:'EXP+15%',icon:'🧤',requiredClass:'mage'},
  {id:'g19',name:'ถุงมือจอมล่า',slot:'gloves',rarity:'epic',atk:25,crit:22,attackSpeed:0.12,icon:'🧤',requiredClass:'archer'},
  {id:'g20',name:'ถุงมือแสงจักรวาล',slot:'gloves',rarity:'epic',atk:20,crit:15,effect:'ฟื้น HP+10/เทิร์น',icon:'🧤',requiredClass:'paladin'},
  // LEGENDARY
  {id:'g21',name:'ถุงมือสยบสวรรค์',slot:'gloves',rarity:'legend',atk:42,crit:30,icon:'🧤',requiredClass:'warrior'},
  {id:'g22',name:'ถุงมือราชาเงา',slot:'gloves',rarity:'legend',atk:45,crit:40,attackSpeed:0.18,icon:'🧤',requiredClass:'rogue'},
  {id:'g23',name:'ถุงมือจักรวาลเวทย์',slot:'gloves',rarity:'legend',atk:32,crit:28,effect:'EXP+25%',icon:'🧤',requiredClass:'mage'},
  {id:'g24',name:'ถุงมือจอมล่าจักรวาล',slot:'gloves',rarity:'legend',atk:40,crit:35,attackSpeed:0.18,icon:'🧤',requiredClass:'archer'},
  {id:'g25',name:'ถุงมือเทพแสงนิรันดร์',slot:'gloves',rarity:'legend',atk:35,crit:25,effect:'ฟื้น HP+18/เทิร์น',icon:'🧤',requiredClass:'paladin'},
];

const PANTS = [
  // COMMON
  {id:'p01',name:'กางเกงชาวนา',slot:'pants',rarity:'common',hp:15,def:2,icon:'👖',requiredClass:null},
  {id:'p02',name:'กางเกงหนังหยาบ',slot:'pants',rarity:'common',hp:20,def:1,icon:'👖',requiredClass:null},
  {id:'p03',name:'กางเกงผ้าเก่า',slot:'pants',rarity:'common',hp:12,def:3,icon:'👖',requiredClass:null},
  {id:'p04',name:'กางเกงสัตว์ป่า',slot:'pants',rarity:'common',hp:18,def:2,icon:'👖',requiredClass:null},
  {id:'p05',name:'กางเกงผ้าดิบ',slot:'pants',rarity:'common',hp:10,def:4,icon:'👖',requiredClass:null},
  // UNCOMMON
  {id:'p06',name:'กางเกงเกราะโซ่',slot:'pants',rarity:'uncommon',hp:40,def:8,icon:'👖',requiredClass:null},
  {id:'p07',name:'กางเกงหนังนักล่า',slot:'pants',rarity:'uncommon',hp:35,def:6,icon:'👖',requiredClass:'archer'},
  {id:'p08',name:'กางเกงนักฆ่า',slot:'pants',rarity:'uncommon',hp:30,def:6,icon:'👖',requiredClass:'rogue'},
  {id:'p09',name:'กางเกงเวทย์มนตร์',slot:'pants',rarity:'uncommon',hp:25,def:5,effect:'EXP+5%',icon:'👖',requiredClass:'mage'},
  {id:'p10',name:'กางเกงอัศวิน',slot:'pants',rarity:'uncommon',hp:45,def:10,icon:'👖',requiredClass:'warrior'},
  // RARE
  {id:'p11',name:'กางเกงมังกรดำ',slot:'pants',rarity:'rare',hp:70,def:18,icon:'👖',requiredClass:null},
  {id:'p12',name:'กางเกงนักฆ่าเงา',slot:'pants',rarity:'rare',hp:60,def:14,icon:'👖',requiredClass:'rogue'},
  {id:'p13',name:'กางเกงเวทย์มืด',slot:'pants',rarity:'rare',hp:50,def:12,effect:'EXP+10%',icon:'👖',requiredClass:'mage'},
  {id:'p14',name:'ชุดขานักบุญ',slot:'pants',rarity:'rare',hp:65,def:18,effect:'ฟื้น HP+5/เทิร์น',icon:'👖',requiredClass:'paladin'},
  {id:'p15',name:'กางเกงหนังป่าเขียว',slot:'pants',rarity:'rare',hp:58,def:16,icon:'👖',requiredClass:'archer'},
  // EPIC
  {id:'p16',name:'กางเกงหายนะ',slot:'pants',rarity:'epic',hp:120,def:30,icon:'👖',requiredClass:'warrior'},
  {id:'p17',name:'กางเกงราชาเงา',slot:'pants',rarity:'epic',hp:100,def:22,icon:'👖',requiredClass:'rogue'},
  {id:'p18',name:'กางเกงจักรวาล',slot:'pants',rarity:'epic',hp:80,def:18,effect:'EXP+15%',icon:'👖',requiredClass:'mage'},
  {id:'p19',name:'กางเกงจอมล่า',slot:'pants',rarity:'epic',hp:110,def:26,icon:'👖',requiredClass:'archer'},
  {id:'p20',name:'กางเกงเทพแสง',slot:'pants',rarity:'epic',hp:115,def:24,effect:'ฟื้น HP+12/เทิร์น',icon:'👖',requiredClass:'paladin'},
  // LEGENDARY
  {id:'p21',name:'กางเกงหายนะมืด',slot:'pants',rarity:'legend',hp:200,def:50,icon:'👖',requiredClass:'warrior'},
  {id:'p22',name:'กางเกงเงาอมตะ',slot:'pants',rarity:'legend',hp:170,def:40,icon:'👖',requiredClass:'rogue'},
  {id:'p23',name:'กางเกงจักรวาลนิรันดร์',slot:'pants',rarity:'legend',hp:140,def:35,effect:'EXP+28%',icon:'👖',requiredClass:'mage'},
  {id:'p24',name:'กางเกงจอมล่าจักรวาล',slot:'pants',rarity:'legend',hp:180,def:45,icon:'👖',requiredClass:'archer'},
  {id:'p25',name:'กางเกงเทพแห่งแสง',slot:'pants',rarity:'legend',hp:190,def:42,effect:'ฟื้น HP+20/เทิร์น',icon:'👖',requiredClass:'paladin'},
];

const BOOTS = [
  // COMMON — attackSpeed 2-4% (เริ่มต้นน้อยมาก)
  {id:'b01',name:'รองเท้าฟาง',slot:'boots',rarity:'common',attackSpeed:0.02,icon:'👢',requiredClass:null},
  {id:'b02',name:'รองเท้าหนังเก่า',slot:'boots',rarity:'common',attackSpeed:0.03,icon:'👢',requiredClass:null},
  {id:'b03',name:'รองเท้าไม้',slot:'boots',rarity:'common',attackSpeed:0.02,icon:'👢',requiredClass:null},
  {id:'b04',name:'รองเท้าชาวนา',slot:'boots',rarity:'common',attackSpeed:0.03,icon:'👢',requiredClass:null},
  {id:'b05',name:'รองเท้าผ้าหยาบ',slot:'boots',rarity:'common',attackSpeed:0.04,icon:'👢',requiredClass:null},
  // UNCOMMON — attackSpeed 5-8%
  {id:'b06',name:'รองเท้าบูทหนัง',slot:'boots',rarity:'uncommon',attackSpeed:0.05,icon:'👢',requiredClass:null},
  {id:'b07',name:'รองเท้าป่า',slot:'boots',rarity:'uncommon',attackSpeed:0.08,icon:'👢',requiredClass:'archer'},
  {id:'b08',name:'รองเท้าเงียบเงา',slot:'boots',rarity:'uncommon',attackSpeed:0.08,icon:'👢',requiredClass:'rogue'},
  {id:'b09',name:'รองเท้าเวทมืด',slot:'boots',rarity:'uncommon',attackSpeed:0.05,effect:'EXP+5%',icon:'👢',requiredClass:'mage'},
  {id:'b10',name:'รองเท้าบูทอัศวิน',slot:'boots',rarity:'uncommon',attackSpeed:0.06,icon:'👢',requiredClass:'warrior'},
  // RARE — attackSpeed 10-15%
  {id:'b11',name:'รองเท้ามังกรน้ำแข็ง',slot:'boots',rarity:'rare',attackSpeed:0.10,icon:'👢',requiredClass:null},
  {id:'b12',name:'รองเท้าเงาพิฆาต',slot:'boots',rarity:'rare',attackSpeed:0.15,icon:'👢',requiredClass:'rogue'},
  {id:'b13',name:'รองเท้าเทพแสง',slot:'boots',rarity:'rare',attackSpeed:0.10,effect:'ฟื้น HP+5/เทิร์น',icon:'👢',requiredClass:'paladin'},
  {id:'b14',name:'รองเท้านักล่าโบราณ',slot:'boots',rarity:'rare',attackSpeed:0.13,icon:'👢',requiredClass:'archer'},
  {id:'b15',name:'รองเท้าเวทย์มืด',slot:'boots',rarity:'rare',attackSpeed:0.10,effect:'EXP+10%',icon:'👢',requiredClass:'mage'},
  // EPIC — attackSpeed 18-25%
  {id:'b16',name:'รองเท้าหายนะ',slot:'boots',rarity:'epic',attackSpeed:0.20,icon:'👢',requiredClass:'warrior'},
  {id:'b17',name:'รองเท้าเงามืดสนิท',slot:'boots',rarity:'epic',attackSpeed:0.25,icon:'👢',requiredClass:'rogue'},
  {id:'b18',name:'รองเท้าเทพเวทย์',slot:'boots',rarity:'epic',attackSpeed:0.18,effect:'EXP+15%',icon:'👢',requiredClass:'mage'},
  {id:'b19',name:'รองเท้าจอมล่า',slot:'boots',rarity:'epic',attackSpeed:0.22,icon:'👢',requiredClass:'archer'},
  {id:'b20',name:'รองเท้าแสงจักรวาล',slot:'boots',rarity:'epic',attackSpeed:0.20,effect:'ฟื้น HP+10/เทิร์น',icon:'👢',requiredClass:'paladin'},
  // LEGENDARY — attackSpeed 28-35%
  {id:'b21',name:'รองเท้าหายนะมืด',slot:'boots',rarity:'legend',attackSpeed:0.30,icon:'👢',requiredClass:'warrior'},
  {id:'b22',name:'รองเท้าเงาอมตะ',slot:'boots',rarity:'legend',attackSpeed:0.35,icon:'👢',requiredClass:'rogue'},
  {id:'b23',name:'รองเท้าจักรวาลนิรันดร์',slot:'boots',rarity:'legend',attackSpeed:0.28,effect:'EXP+25%',icon:'👢',requiredClass:'mage'},
  {id:'b24',name:'รองเท้าจอมล่าจักรวาล',slot:'boots',rarity:'legend',attackSpeed:0.33,icon:'👢',requiredClass:'archer'},
  {id:'b25',name:'รองเท้าแสงนิรันดร์',slot:'boots',rarity:'legend',attackSpeed:0.30,effect:'ฟื้น HP+18/เทิร์น',icon:'👢',requiredClass:'paladin'},
];

// ความต้องการขั้นต่ำเพื่อต่อสู้บอส (ATK รวมอุปกรณ์)
const BOSS_REQ = {
  1: { atk: 15,  label: 'ราชากอบลิน' },
  2: { atk: 45,  label: 'จอมซอมบี้' },
  3: { atk: 100, label: 'มังกรราชัน' },
  4: { atk: 200, label: 'ราชาอสูร' },
  5: { atk: 380, label: 'เจ้าแห่งปราสาท' },
  6: { atk: 700, label: 'เทพแห่งโกลาหล' },
};

// Milestone rewards — kill milestones
const KILL_MILESTONES = [
  { kills:10,   reward:'gold',    amount:200,  label:'นักล่าหน้าใหม่',  icon:'🥉' },
  { kills:50,   reward:'chest',   type:'uncommon', label:'นักล่าผ่านศึก', icon:'🥈' },
  { kills:100,  reward:'chest',   type:'rare',  label:'นักล่าชำนาญ',    icon:'🥇' },
  { kills:250,  reward:'gold',    amount:1500, label:'นักล่าผู้เชี่ยวชาญ', icon:'💎' },
  { kills:500,  reward:'chest',   type:'boss',  label:'มือสังหารระดับตำนาน', icon:'👑' },
  { kills:1000, reward:'gold',    amount:8000, label:'ราชาแห่งนักล่า',   icon:'🌟' },
];

// รวม item pool ทุกประเภท
const ALL_ITEMS_BY_SLOT = {
  weapon: WEAPONS,
  helmet: HELMETS,
  armor:  ARMORS,
  gloves: GLOVES,
  pants:  PANTS,
  boots:  BOOTS,
};

const SLOT_SLOTS = ['weapon','helmet','armor','gloves','pants','boots'];

const SLOT_META = {
  weapon: {label:'อาวุธ',   icon:'🗡'},
  helmet: {label:'หมวก',    icon:'🪖'},
  armor:  {label:'เกราะ',   icon:'⚔'},
  gloves: {label:'ถุงมือ',  icon:'🧤'},
  pants:  {label:'กางเกง',  icon:'👖'},
  boots:  {label:'รองเท้า', icon:'👢'},
};

// ============================================================
// CRAFTING MATERIALS — วัตถุดิบที่มอนดรอป (เก็บใน G.materials[id])
// แต่ละโซนดรอปวัตถุดิบของตัวเอง (ไล่ rarity ตามโซน)
// ============================================================
const MATERIALS = {
  // zone 1 — ป่ากอบลิน
  goblin_hide:   { id:'goblin_hide',   name:'หนังกอบลิน',    icon:'🟫', zone:1, rarity:'common' },
  goblin_fang:   { id:'goblin_fang',   name:'เขี้ยวกอบลิน',  icon:'🦷', zone:1, rarity:'uncommon' },
  // zone 2 — หุบเขาซอมบี้
  rotten_flesh:  { id:'rotten_flesh',  name:'เนื้อเน่า',      icon:'🥩', zone:2, rarity:'common' },
  bone_shard:    { id:'bone_shard',    name:'เศษกระดูก',      icon:'🦴', zone:2, rarity:'uncommon' },
  // zone 3 — ถ้ำมังกร
  dragon_scale:  { id:'dragon_scale',  name:'เกล็ดมังกร',    icon:'🐲', zone:3, rarity:'rare' },
  fire_essence:  { id:'fire_essence',  name:'แก่นเพลิง',      icon:'🔥', zone:3, rarity:'rare' },
  // zone 4 — ซากอสูร
  demon_horn:    { id:'demon_horn',    name:'เขาอสูร',        icon:'😈', zone:4, rarity:'epic' },
  cursed_metal:  { id:'cursed_metal',  name:'เหล็กต้องสาป',  icon:'⛓', zone:4, rarity:'epic' },
  // zone 5 — ปราสาทมืด
  shadow_cloth:  { id:'shadow_cloth',  name:'ผ้าเงามืด',      icon:'🕸', zone:5, rarity:'epic' },
  dark_crystal:  { id:'dark_crystal',  name:'คริสตัลมืด',    icon:'🔮', zone:5, rarity:'legend' },
  // zone 6 — อาณาจักรโกลาหล
  chaos_core:    { id:'chaos_core',    name:'แก่นโกลาหล',    icon:'🌀', zone:6, rarity:'legend' },
  cosmic_dust:   { id:'cosmic_dust',   name:'ผงจักรวาล',      icon:'✨', zone:6, rarity:'legend' },
  // ── Dungeon-only (หลุมลึกนิรันดร์) — ตีบวก & คราฟชุดเทพ ──
  dungeon_key:   { id:'dungeon_key',   name:'กุญแจหลุมลึก',  icon:'🗝️', zone:0, rarity:'epic',   dungeonOnly:true },
  enhance_stone: { id:'enhance_stone', name:'หินตีบวก',      icon:'🔨', zone:0, rarity:'rare',   dungeonOnly:true },
  enhance_core:  { id:'enhance_core',  name:'แก่นเสริมพลัง',  icon:'💠', zone:0, rarity:'epic',   dungeonOnly:true },
  void_shard:    { id:'void_shard',    name:'เศษมิติว่างเปล่า',icon:'🕳️', zone:0, rarity:'legend', dungeonOnly:true },
  abyss_essence: { id:'abyss_essence', name:'แก่นห้วงลึก',    icon:'🌌', zone:0, rarity:'ancient',dungeonOnly:true },
};

// วัตถุดิบที่ดรอปได้ในแต่ละโซน (ไล่ตามที่ผู้เล่นอยากได้: โซนสูง = วัตถุดิบดีขึ้น)
const ZONE_MATERIALS = {
  1: ['goblin_hide','goblin_fang'],
  2: ['rotten_flesh','bone_shard'],
  3: ['dragon_scale','fire_essence'],
  4: ['demon_horn','cursed_metal'],
  5: ['shadow_cloth','dark_crystal'],
  6: ['chaos_core','cosmic_dust'],
};

// ============================================================
// CRAFTABLE SETS — ชุดคราฟ (6 ชิ้น/เซ็ต) + โบนัสเซ็ต
// แต่ละชิ้นใช้วัตถุดิบ + ทอง คราฟได้ที่ NPC ช่างตีเหล็ก
// ============================================================
const CRAFT_SETS = {
  goblin_set: {
    id:'goblin_set', name:'ชุดนักล่ากอบลิน', tier:1, rarity:'uncommon',
    setBonus:{ need:4, atk:8, def:8, hp:60, label:'ครบ 4 ชิ้น: +8 ATK +8 DEF +60 HP' },
    pieces: [
      { slot:'weapon', name:'ดาบเขี้ยวกอบลิน', icon:'🗡', atk:14, def:0,  mats:{goblin_fang:5, goblin_hide:8}, gold:200 },
      { slot:'helmet', name:'หมวกหนังกอบลิน', icon:'🪖', atk:2,  def:6,  mats:{goblin_hide:6}, gold:120 },
      { slot:'armor',  name:'เกราะหนังกอบลิน',icon:'⚔', atk:3,  def:8,  mats:{goblin_hide:10}, gold:180 },
      { slot:'gloves', name:'ถุงมือกอบลิน',   icon:'🧤', atk:4,  def:3,  mats:{goblin_hide:5, goblin_fang:2}, gold:120 },
      { slot:'pants',  name:'กางเกงกอบลิน',   icon:'👖', atk:2,  def:6,  mats:{goblin_hide:7}, gold:150 },
      { slot:'boots',  name:'รองเท้ากอบลิน',  icon:'👢', atk:2,  def:5,  mats:{goblin_hide:5}, gold:120 },
    ],
  },
  undead_set: {
    id:'undead_set', name:'ชุดอัศวินอมตะ', tier:2, rarity:'rare',
    setBonus:{ need:4, atk:18, def:16, hp:140, label:'ครบ 4 ชิ้น: +18 ATK +16 DEF +140 HP' },
    pieces: [
      { slot:'weapon', name:'ดาบกระดูกมรณะ', icon:'🗡', atk:30, def:0,  mats:{bone_shard:8, rotten_flesh:10}, gold:600 },
      { slot:'helmet', name:'หมวกกะโหลก',     icon:'🪖', atk:5,  def:14, mats:{bone_shard:6}, gold:400 },
      { slot:'armor',  name:'เกราะกระดูก',    icon:'⚔', atk:6,  def:18, mats:{bone_shard:12, rotten_flesh:8}, gold:550 },
      { slot:'gloves', name:'ถุงมืออมตะ',     icon:'🧤', atk:9,  def:7,  mats:{bone_shard:5}, gold:380 },
      { slot:'pants',  name:'กางเกงกระดูก',   icon:'👖', atk:5,  def:13, mats:{bone_shard:7, rotten_flesh:6}, gold:420 },
      { slot:'boots',  name:'รองเท้าอมตะ',    icon:'👢', atk:5,  def:11, mats:{bone_shard:6}, gold:380 },
    ],
  },
  dragon_set: {
    id:'dragon_set', name:'ชุดเกล็ดมังกร', tier:3, rarity:'epic',
    setBonus:{ need:4, atk:35, def:30, hp:280, crit:0.08, label:'ครบ 4 ชิ้น: +35 ATK +30 DEF +280 HP +8% Crit' },
    pieces: [
      { slot:'weapon', name:'ดาบเขี้ยวมังกรไฟ', icon:'🐲', atk:58, def:0,  mats:{dragon_scale:10, fire_essence:8}, gold:1800 },
      { slot:'helmet', name:'หมวกเกล็ดมังกร',   icon:'🪖', atk:10, def:26, mats:{dragon_scale:8}, gold:1200 },
      { slot:'armor',  name:'เกราะเกล็ดมังกร',  icon:'⚔', atk:12, def:34, mats:{dragon_scale:14, fire_essence:6}, gold:1600 },
      { slot:'gloves', name:'ถุงมือมังกรเพลิง', icon:'🧤', atk:18, def:12, mats:{dragon_scale:7, fire_essence:5}, gold:1100 },
      { slot:'pants',  name:'กางเกงเกล็ดมังกร', icon:'👖', atk:10, def:24, mats:{dragon_scale:9}, gold:1300 },
      { slot:'boots',  name:'รองเท้ามังกร',     icon:'👢', atk:10, def:20, mats:{dragon_scale:7, fire_essence:4}, gold:1100 },
    ],
  },
  // ── ชุดเทพห้วงลึก — คราฟจากวัตถุดิบหายากในดันเจี้ยนเท่านั้น ──
  abyss_set: {
    id:'abyss_set', name:'ชุดห้วงลึกนิรันดร์', tier:4, rarity:'legend',
    setBonus:{ need:4, atk:60, def:50, hp:500, crit:0.15, label:'ครบ 4 ชิ้น: +60 ATK +50 DEF +500 HP +15% Crit' },
    pieces: [
      { slot:'weapon', name:'ดาบห้วงลึก',      icon:'🗡', atk:95, def:0,  mats:{void_shard:8, abyss_essence:4}, gold:6000 },
      { slot:'helmet', name:'หมวกมิติว่าง',    icon:'🪖', atk:18, def:42, mats:{void_shard:6, abyss_essence:2}, gold:4000 },
      { slot:'armor',  name:'เกราะห้วงลึก',    icon:'⚔', atk:20, def:55, mats:{void_shard:10, abyss_essence:3}, gold:5500 },
      { slot:'gloves', name:'ถุงมือมิติ',      icon:'🧤', atk:30, def:20, mats:{void_shard:6, abyss_essence:2}, gold:3800 },
      { slot:'pants',  name:'กางเกงห้วงลึก',   icon:'👖', atk:18, def:40, mats:{void_shard:7, abyss_essence:2}, gold:4200 },
      { slot:'boots',  name:'รองเท้ามิติ',     icon:'👢', atk:18, def:34, mats:{void_shard:6, abyss_essence:2}, gold:3800 },
    ],
  },
};

// ============================================================
// ENHANCEMENT — ตีบวกอุปกรณ์ (+0 → +15)
// ใช้ "หินตีบวก/แก่น" + ทอง · มีอัตราสำเร็จที่ลดลงตามระดับ
// ปรัชญาสมดุล: +0..+4 ปลอดภัย 100% · +5..+9 ล้มเหลว=ลดระดับ -1 ·
//  +10 ขึ้นไป ล้มเหลว=ของหายทั้งชิ้น · ระดับสูงแพง+เสี่ยงสูง แต่พลังเยอะ
// stat ที่ได้: ทุกระดับ +8% ของ stat ฐานต่อชิ้น (สะสม) → +10 ≈ +80%, +15 ≈ +120%
// ============================================================
const ENHANCE = {
  maxLevel: 15,
  statPerLevel: 0.08,         // +8% ของ atk/def/hp/crit ฐานต่อระดับ
  safeUpTo: 4,                // +0..+4 ปลอดภัย 100%
  // การลงโทษเมื่อล้มเหลว แบ่ง 3 ช่วง:
  //  +0..+4  → ปลอดภัย (ไม่พลาด)
  //  +5..+9  → ล้มเหลว = ลดระดับลง 1
  //  +10++   → ล้มเหลว = ของหายทั้งชิ้น (แตกหาย!)
  delevelFromLevel: 5,        // ดันจากระดับนี้ขึ้นไป ล้มเหลว = -1
  destroyFromLevel: 10,       // ดันจากระดับนี้ขึ้นไป ล้มเหลว = ของหาย
  // ต่อความพยายาม 1 ครั้ง: ต้องการหิน/แก่น + ทอง + อัตราสำเร็จ
  // level = ระดับ "ปัจจุบัน" ที่กำลังจะดันขึ้น (0 = ดันเป็น +1)
  tiers: [
    // upToLevel, stones, cores, gold, successRate
    { upTo:4,  stones:2, cores:0, gold:300,   rate:1.00 },  // +0..+3 → ปลอดภัย
    { upTo:5,  stones:3, cores:0, gold:800,   rate:1.00 },  // +4 → +5 ยังปลอดภัย (safeUpTo)
    { upTo:7,  stones:3, cores:1, gold:1500,  rate:0.78 },  // +5,+6 ล้มเหลว=ลดระดับ -1
    { upTo:10, stones:5, cores:2, gold:4500,  rate:0.58 },  // +7..+9 ล้มเหลว=ลดระดับ -1
    { upTo:13, stones:8, cores:3, gold:13000, rate:0.42 },  // +10..+12 ล้มเหลว=ของหาย!
    { upTo:15, stones:12,cores:5, gold:32000, rate:0.30 },  // +13,+14 ล้มเหลว=ของหาย!
  ],
};

// ============================================================
// ENDLESS DUNGEON — หลุมลึกนิรันดร์ (เข้าซ้ำได้ ฟาร์มของตีบวก/คราฟหายาก)
// ปลดล็อกเมื่อผ่านด่าน 2 · ความลึกไต่ไม่สิ้นสุด · ตายแล้วได้ของที่เก็บ
// ทุกๆ "ชั้นบอส" (หาร 5 ลงตัว) ดรอปเยอะ + โอกาสได้ของหายากสูง
// ============================================================
const ENDLESS_DUNGEON = {
  unlockZoneCleared: 2,       // ต้องผ่านด่าน 2 ก่อน
  bossEveryFloors: 5,
  // ── การเข้า: ฟรีวันละ 1 รอบ · รอบถัดไปใช้กุญแจ 1 ดอก ──
  freeRunsPerDay: 1,
  // กุญแจดรอปจากมอนทุกด่าน (จากการสู้จริง + IDLE): ด่าน 1 = 0.25% ไต่ขึ้น
  // จนสูงสุด 2.5% (ด่าน 6) · บอสดรอป ×2
  keyDrop: {
    baseByZone1: 0.0025,      // 0.25% ที่ด่าน 1
    perZone: 0.0045,          // +0.45%/ด่าน → ด่าน 6 = 0.25+2.25 = 2.5%
    cap: 0.025,               // เพดาน 2.5%
    bossMult: 2,              // บอส ×2
  },
  // ดรอปต่อการสังหาร (ปกติ) — ไต่ขึ้นตามความลึก
  drops: {
    enhance_stone: { base: 0.55, perFloor: 0.010, cap: 0.95 },
    enhance_core:  { base: 0.10, perFloor: 0.006, cap: 0.45, minFloor: 4 },
    void_shard:    { base: 0.04, perFloor: 0.004, cap: 0.30, minFloor: 10 },
    abyss_essence: { base: 0.00, perFloor: 0.002, cap: 0.12, minFloor: 16 },
  },
  bossBundleMult: 3,          // ชั้นบอสดรอปเป็นชุด ×3
};

// ราคาซื้อ/ขาย ตาม rarity
// ขาย ≈ 5-8% ของราคาซื้อ — กันเงินเฟ้อจากการฟาร์มของมาขาย
// อยากได้ของร้านต้องเก็บเงินจริงจัง (ทำให้เกมท้าทาย+มีเป้าหมาย)
const SHOP_SELL_PRICE = {common:10,uncommon:40,rare:150,epic:500,legend:1500,ancient:5000,mythic:15000};
const SHOP_BUY_PRICE  = {common:200,uncommon:600,rare:2000,epic:6000,legend:20000,ancient:60000,mythic:200000};

// Class hierarchy — tier สูงกว่า inherit สิทธิ์ tier ต่ำ
const CLASS_HIERARCHY = {
  warrior: ['warrior'],
  mage:    ['mage'],
  rogue:   ['rogue'],
  archer:  ['archer'],
  paladin: ['paladin'],
};

const RARITIES = {
  common:  {label:'ธรรมดา',  color:'var(--common)', bg:'#1a1a1a'},
  uncommon:{label:'พิเศษ',   color:'var(--uncommon)',bg:'#0d1a0d'},
  rare:    {label:'หายาก',   color:'var(--rare)',    bg:'#0d0d1a'},
  epic:    {label:'มหากาพย์',color:'var(--epic)',    bg:'#1a0d1a'},
  legend:  {label:'ตำนาน',   color:'var(--legend)',  bg:'#1a0d00'},
  ancient: {label:'โบราณ',   color:'#ff4400',        bg:'#1a0500'},
  mythic:  {label:'เทพนิยาย',color:'#ff00cc',        bg:'#1a0014'},
  // ── card-only rarities (above mythic) ──
  limited: {label:'ลิมิเต็ด',color:'#22ccff',        bg:'#001824'},  // ฟ้า — หาได้บางช่วง
  secret:  {label:'ซีเคร็ต', color:'#e8e8e8',        bg:'#050505', dark:true}  // ดำ — หายากสุดๆ
};

const CHEST_TABLES = {
  common:   [{r:'common',w:70},{r:'uncommon',w:25},{r:'rare',w:5}],
  uncommon: [{r:'uncommon',w:40},{r:'rare',w:45},{r:'epic',w:15}],
  rare:     [{r:'rare',w:20},{r:'epic',w:60},{r:'legend',w:20}],
  boss:     [{r:'epic',w:50},{r:'legend',w:40},{r:'ancient',w:10}]
};

const ACHIEVEMENTS = [
  {id:'first_task',  name:'ก้าวแรก',         desc:'เพิ่มงานชิ้นแรก',           icon:'🌱', check:s=>s.totalTasks>=1},
  {id:'first_kill',  name:'เลือดแรก',         desc:'ฆ่ามอนสเตอร์ตัวแรก',       icon:'⚔️', check:s=>s.totalKills>=1},
  {id:'tasks10',     name:'ขยันขันแข็ง',      desc:'ทำงานครบ 10 ชิ้น',         icon:'💪', check:s=>s.totalTasks>=10},
  {id:'tasks50',     name:'มืออาชีพ',         desc:'ทำงานครบ 50 ชิ้น',         icon:'🏅', check:s=>s.totalTasks>=50},
  {id:'tasks100',    name:'คนทำงาน',          desc:'ทำงานครบ 100 ชิ้น',        icon:'🏆', check:s=>s.totalTasks>=100},
  {id:'level10',     name:'นักผจญภัยมือเก่า', desc:'เลเวล 10',                 icon:'⭐', check:s=>s.level>=10},
  {id:'level25',     name:'นักรบผ่านศึก',     desc:'เลเวล 25',                 icon:'🌟', check:s=>s.level>=25},
  {id:'level50',     name:'วีรบุรุษ',          desc:'เลเวล 50',                 icon:'👑', check:s=>s.level>=50},
  {id:'level100',    name:'ตำนาน',            desc:'เลเวล 100',                icon:'🔥', check:s=>s.level>=100},
  {id:'kills10',     name:'นักล่า',           desc:'ฆ่ามอนสเตอร์ 10 ตัว',     icon:'💀', check:s=>s.totalKills>=10},
  {id:'kills50',     name:'นักล่าผู้ชำนาญ',  desc:'ฆ่ามอนสเตอร์ 50 ตัว',     icon:'☠️', check:s=>s.totalKills>=50},
  {id:'kills100',    name:'นักล่ามังกร',      desc:'ฆ่ามอนสเตอร์ 100 ตัว',    icon:'🐉', check:s=>s.totalKills>=100},
  {id:'streak3',     name:'สม่ำเสมอ',         desc:'streak 3 วันติด',          icon:'🔥', check:s=>s.maxStreak>=3},
  {id:'streak7',     name:'แกร่งไม่หยุด',     desc:'streak 7 วันติด',          icon:'💫', check:s=>s.maxStreak>=7},
  {id:'rare_weapon', name:'ผู้ใช้อาวุธหายาก',desc:'ได้รับอาวุธระดับหายากขึ้นไป',icon:'💎',check:s=>s.gotRareWeapon},
  {id:'legend_weapon',name:'ผู้ถือตำนาน',    desc:'ได้รับอาวุธระดับตำนาน',    icon:'🌈', check:s=>s.gotLegendWeapon},
  {id:'boss_kill',   name:'ผู้ปราบบอส',       desc:'ฆ่าบอสตัวแรก',             icon:'👑', check:s=>s.bossKills>=1},
  {id:'boss5',       name:'นักปราบบอส',       desc:'ฆ่าบอส 5 ตัว',            icon:'⚡', check:s=>s.bossKills>=5},
  {id:'prestige',    name:'เหนือกว่า',         desc:'Prestige ครั้งแรก',        icon:'✨', check:s=>s.prestigeCount>=1},
  {id:'inventory_full',name:'นักสะสม',        desc:'กระเป๋าเต็ม 50 ชิ้น',     icon:'🎒', check:s=>s.inventory&&s.inventory.length>=50},
  // ── Evolution / Infinity Trial ──
  {id:'trial_done',  name:'ผู้ผ่านการทดสอบ',  desc:'จบการทดสอบนิรันดร์ครั้งแรก', icon:'♾️', check:s=>(s.classTier||1)>=3},
  {id:'tier4',       name:'ร่างสูงสุด',        desc:'วิวัฒนาการถึง Tier 4',      icon:'🌌', check:s=>(s.classTier||1)>=4},
  {id:'secret_class',name:'ผู้ค้นพบความลับ',   desc:'ปลดล็อกคลาส Tier ลับ',     icon:'🩸', check:s=>(s.classEvolutionHistory||[]).some(e=>e.secret)},
  {id:'secret_max',  name:'ตำนานที่ไม่ควรมีอยู่',desc:'ไปถึง Tier 4 สายลับ',     icon:'💮', check:s=>s.classBranch==='S'&&(s.classTier||1)>=4},
  // ── IDLE FARM achievements (แยกหมวด — นับเฉพาะการฟาร์มอัตโนมัติ) ──
  {id:'idle_first', cat:'idle', name:'เริ่มฟาร์ม',      desc:'ฟาร์ม IDLE สังหารตัวแรก',     icon:'🌙', check:s=>(s.idleKills||0)>=1},
  {id:'idle_100',   cat:'idle', name:'นักฟาร์ม',        desc:'ฟาร์ม IDLE ครบ 100 ตัว',       icon:'🌾', check:s=>(s.idleKills||0)>=100},
  {id:'idle_1000',  cat:'idle', name:'เครื่องจักรฟาร์ม',desc:'ฟาร์ม IDLE ครบ 1,000 ตัว',    icon:'⚙️', check:s=>(s.idleKills||0)>=1000},
  {id:'idle_5000',  cat:'idle', name:'เจ้าแห่ง IDLE',   desc:'ฟาร์ม IDLE ครบ 5,000 ตัว',    icon:'🏭', check:s=>(s.idleKills||0)>=5000},
  {id:'idle_10000', cat:'idle', name:'ตำนานสายฟาร์ม',   desc:'ฟาร์ม IDLE ครบ 10,000 ตัว',   icon:'💫', check:s=>(s.idleKills||0)>=10000}
];

const DAILY_QUEST_POOL = [
  {id:'dq_hard2',  desc:'ทำงานระดับยาก 2 งาน',     reward:'หีบหายาก',      target:2,track:'hardTasks',  chestType:'rare'},
  {id:'dq_easy5',  desc:'ทำงานระดับง่าย 5 งาน',     reward:'หีบธรรมดา ×2', target:5,track:'easyTasks',  chestType:'common',  chestCount:2},
  {id:'dq_kill5',  desc:'ฆ่ามอนสเตอร์ 5 ตัว',       reward:'หีบพิเศษ',      target:5,track:'dailyKills', chestType:'uncommon'},
  {id:'dq_epic1',  desc:'ทำงานระดับมหาโหด 1 งาน',   reward:'หีบบอส',        target:1,track:'epicTasks',  chestType:'boss'},
  {id:'dq_medium3',desc:'ทำงานระดับปานกลาง 3 งาน',  reward:'หีบพิเศษ',      target:3,track:'mediumTasks',chestType:'uncommon'},
  {id:'dq_boss1',  desc:'ฆ่าบอส 1 ตัว',             reward:'หีบหายาก',      target:1,track:'dailyBossKills',chestType:'rare'},
  {id:'dq_streak', desc:'ทำงานวันนี้ 3+ งาน',        reward:'หีบธรรมดา ×3', target:3,track:'todayCount', chestType:'common',  chestCount:3}
];

// ============================================================
// ZONE LORE
// ============================================================
const ZONE_LORE = {
  1:'🌲 ป่ากอบลิน — ดงไม้รกร้างซ่อนอันตรายนับร้อย เสียงหัวเราะของกอบลินดังก้องในยามค่ำคืน...',
  2:'🪦 หุบเขาซอมบี้ — แผ่นดินที่คนตายไม่ยอมสงบนิ่ง กลิ่นเน่าลอยคลุ้ง เสียงครวญครางดังก้องไปทั่ว',
  3:'🐉 ถ้ำมังกร — แสงไม่เคยส่องถึง ความร้อนไม่เคยหาย มังกรโบราณรอคอยผู้บุกรุก... และชุดเซ็ต Tier 3 อยู่ที่นี่!',
  4:'💀 ซากอสูร — อาณาจักรที่ล่มสลายเมื่อพันปีก่อน อสูรที่สาปสูญยังคงตรึงอยู่กับซากปรักหักพัง',
  5:'🏰 ปราสาทมืด — กำแพงที่ยืนหยัดมาพันปีซ่อนความลับที่ไม่ควรถูกเปิดเผย เงาของเจ้าปราสาทเก่ายังคงหลอกหลอน',
  6:'🌀 อาณาจักรโกลาหล — ที่ปลายสุดของโลก กฎฟิสิกส์ไม่มีความหมาย ชุดเซ็ต Tier 4 ซ่อนอยู่ในความโกลาหลนี้!'
};

// ============================================================
// CLASS EVOLUTIONS — 5 สาย × 4 ระดับ
// ============================================================
const CLASS_EVOLUTIONS = {
  warrior:[
    {tier:1,name:'นักรบ',icon:'🗡',color:'#ff6644'},
    {tier:2,name:'อัศวิน',icon:'⚔️',color:'#ff8844',
     lore:'ผ่านศึกนับร้อย ร่างกายและจิตใจถูกหลอมเป็นเหล็กกล้า',
     conditions:{level:15,kills:30},
     bonuses:{hpMult:1.2,atkMult:1.15},
     rewardWeapon:{name:'ดาบอัศวิน',icon:'⚔️',slot:'weapon',rarity:'uncommon',atk:18,requiredClass:'warrior'}},
    // tier3 branch A
    {tier:3,branch:'A',name:'อัศวินมังกร',icon:'🐉⚔️',color:'#ff4422',
     lore:'เลือดมังกรไหลในเส้นเลือด พลังโบราณตื่นขึ้น',
     conditions:{level:50,bossKills:3,evoQuest:'warrior_3A'},
     bonuses:{hpMult:1.3,atkMult:1.2,defMult:1.2},
     rewardWeapon:{name:'ดาบมังกรเพลิง',icon:'🐉',slot:'weapon',rarity:'epic',atk:45,requiredClass:'warrior'}},
    // tier3 branch B
    {tier:3,branch:'B',name:'นักรบป้องกัน',icon:'🛡⚔️',color:'#aabbff',
     lore:'โล่คือชีวิต ทุกการโจมตีคือโอกาสตอบโต้',
     conditions:{level:50,kills:80,evoQuest:'warrior_3B'},
     bonuses:{hpMult:1.5,defMult:1.4},
     rewardWeapon:{name:'โล่อัศวินศักดิ์สิทธิ์',icon:'🛡',slot:'armor',rarity:'epic',atk:10,def:30,requiredClass:'warrior'}},
    // tier4 branch A→A
    {tier:4,branch:'A',parentBranch:'A',name:'อัศวินแห่งหายนะ',icon:'💀⚔️',color:'#cc2200',
     lore:'ระหว่างแสงและมืด — คุณเลือกเส้นทางที่สาม: หายนะ',
     conditions:{level:60,bossKills:10,evoQuest:'warrior_4A'},
     bonuses:{hpMult:1.5,atkMult:1.4,defMult:1.3,critBonus:0.2},
     rewardWeapon:{name:'ดาบหายนะนิรันดร์',icon:'💀',slot:'weapon',rarity:'legend',atk:90,requiredClass:'warrior'}},
    // tier4 branch B→B
    {tier:4,branch:'B',parentBranch:'B',name:'ผู้พิทักษ์นิรันดร์',icon:'🏰🛡',color:'#4466ff',
     lore:'ผู้ที่ยืนหยัดสุดท้าย ไม่มีอะไรทะลุผ่านได้',
     conditions:{level:60,tasks:60,evoQuest:'warrior_4B'},
     bonuses:{hpMult:2.0,defMult:1.8,damageReduction:0.2},
     rewardWeapon:{name:'โล่ศักดิ์สิทธิ์นิรันดร์',icon:'🏰',slot:'armor',rarity:'legend',atk:20,def:60,requiredClass:'warrior'}},
    // ── SECRET branch (S) — ปลดล็อกจาก Infinity Trial เท่านั้น ──
    {tier:3,branch:'S',secret:true,name:'นักรบเลือดอสูร',icon:'🩸⚔️',color:'#cc0033',
     lore:'เลือดของศัตรูนับพันหลอมรวมเข้ากายในการทดสอบนิรันดร์ — ความโกรธคือพลัง',
     bonuses:{hpMult:1.4,atkMult:1.45,critBonus:0.1,lifesteal:0.08},
     rewardWeapon:{name:'ดาบกระหายเลือด',icon:'🩸',slot:'weapon',rarity:'legend',atk:70,requiredClass:'warrior'}},
    {tier:4,branch:'S',parentBranch:'S',secret:true,name:'อสูรสงครามนิรันดร์',icon:'👹⚔️',color:'#aa0022',
     lore:'ไม่ใช่มนุษย์ ไม่ใช่อสูร — คือสงครามที่มีชีวิต',
     conditions:{evoQuest:'warrior_4S'},
     bonuses:{hpMult:1.8,atkMult:1.8,critBonus:0.25,lifesteal:0.15},
     rewardWeapon:{name:'มหาดาบอสูรนิรันดร์',icon:'👹',slot:'weapon',rarity:'mythic',atk:120,requiredClass:'warrior'}},
    // ── branch C (kills 35-60) — เบอร์เซิร์กเกอร์สายดุ ──
    {tier:3,branch:'C',name:'นักรบคลั่ง',icon:'🪓⚔️',color:'#ff7733',
     lore:'ยิ่งบาดเจ็บ ยิ่งบ้าคลั่ง ความเจ็บปวดคือเชื้อเพลิง',
     bonuses:{hpMult:1.3,atkMult:1.35,critBonus:0.12,lifesteal:0.05},
     rewardWeapon:{name:'ขวานคลั่งสงคราม',icon:'🪓',slot:'weapon',rarity:'epic',atk:58,requiredClass:'warrior'}},
    {tier:4,branch:'C',parentBranch:'C',name:'ปีศาจสงครามเลือด',icon:'🔥🪓',color:'#dd3311',
     lore:'สนามรบคือบ้าน เลือดศัตรูคืออาหาร',
     conditions:{evoQuest:'warrior_4C'},
     bonuses:{hpMult:1.5,atkMult:1.6,critBonus:0.22,lifesteal:0.1},
     rewardWeapon:{name:'ขวานสังหารหมู่',icon:'🔥',slot:'weapon',rarity:'legend',atk:98,requiredClass:'warrior'}},
    // ── branch D (kills 60-90) — จอมทัพรอบด้าน ──
    {tier:3,branch:'D',name:'แม่ทัพเหล็ก',icon:'🎖⚔️',color:'#ffaa44',
     lore:'นำทัพนับพันโดยไม่เคยพ่าย ทุกคำสั่งคือชัยชนะ',
     bonuses:{hpMult:1.4,atkMult:1.35,defMult:1.25,critBonus:0.08},
     rewardWeapon:{name:'ดาบแม่ทัพ',icon:'🎖',slot:'weapon',rarity:'epic',atk:62,requiredClass:'warrior'}},
    {tier:4,branch:'D',parentBranch:'D',name:'จอมจักรพรรดิสงคราม',icon:'👑⚔️',color:'#ffcc00',
     lore:'อาณาจักรสั่นสะเทือนเมื่อเขายกดาบ',
     conditions:{evoQuest:'warrior_4D'},
     bonuses:{hpMult:1.7,atkMult:1.7,defMult:1.4,critBonus:0.2,lifesteal:0.08},
     rewardWeapon:{name:'มหาดาบจักรพรรดิ',icon:'👑',slot:'weapon',rarity:'legend',atk:108,requiredClass:'warrior'}}
  ],
  mage:[
    {tier:1,name:'จอมเวทย์',icon:'🔮',color:'#aa44ff'},
    {tier:2,name:'อาร์เคนเมจ',icon:'✨🔮',color:'#bb55ff',
     lore:'กระแสเวทมนตร์โบราณซึมซับเข้าสู่ร่าง',
     conditions:{level:15,tasks:20},
     bonuses:{expMult:1.2,atkMult:1.3},
     rewardWeapon:{name:'คทาอาร์เคน',icon:'🪄',slot:'weapon',rarity:'uncommon',atk:22,requiredClass:'mage'}},
    {tier:3,branch:'A',name:'จอมเวทย์มืด',icon:'🌑🔮',color:'#8822cc',
     lore:'ในความมืดนั้นเองที่พลังแท้จริงซ่อนอยู่',
     conditions:{level:50,epicTasks:5,evoQuest:'mage_3A'},
     bonuses:{expMult:1.3,atkMult:1.25},
     rewardWeapon:{name:'คทาเงามืด',icon:'🌑',slot:'weapon',rarity:'epic',atk:52,requiredClass:'mage'}},
    {tier:3,branch:'B',name:'จอมเวทย์แสง',icon:'☀️🔮',color:'#ffcc44',
     lore:'แสงสว่างคือพลังบริสุทธิ์ที่สุด ผู้ใดถือครองแสง ย่อมพิชิตความมืด',
     conditions:{level:50,tasks:30,evoQuest:'mage_3B'},
     bonuses:{expMult:1.4,hpMult:1.2},
     rewardWeapon:{name:'คทาแสงศักดิ์สิทธิ์',icon:'☀️',slot:'weapon',rarity:'epic',atk:40,requiredClass:'mage'}},
    {tier:4,branch:'A',parentBranch:'A',name:'เทพแห่งเวทมนตร์',icon:'🌌',color:'#6600ff',
     lore:'จักรวาลโน้มตัวเคารพ คำพูดกลายเป็นกฎ',
     conditions:{level:60,tasks:60,evoQuest:'mage_4A'},
     bonuses:{expMult:1.5,atkMult:2.0},
     rewardWeapon:{name:'คทาผู้พิพากษา',icon:'🌌',slot:'weapon',rarity:'legend',atk:100,requiredClass:'mage'}},
    {tier:4,branch:'B',parentBranch:'B',name:'นักบวชสวรรค์',icon:'🌟',color:'#ffee44',
     lore:'ผู้รับพลังจากสรวงสวรรค์ ทุกคำอธิษฐานคือสายฟ้า',
     conditions:{level:60,epicTasks:15,evoQuest:'mage_4B'},
     bonuses:{expMult:1.6,hpMult:1.5,regenMult:1.3},
     rewardWeapon:{name:'ไม้เท้าสวรรค์',icon:'🌟',slot:'weapon',rarity:'legend',atk:70,requiredClass:'mage'}},
    // ── SECRET branch (S) — ปลดล็อกจาก Infinity Trial เท่านั้น ──
    {tier:3,branch:'S',secret:true,name:'จอมเวทย์มิติว่างเปล่า',icon:'🕳️🔮',color:'#5500aa',
     lore:'มองลึกเข้าไปในความว่างเปล่าระหว่างคลื่นศัตรู และความว่างเปล่ามองกลับมา',
     bonuses:{atkMult:1.5,expMult:1.4,critBonus:0.12,spellEcho:0.15},
     rewardWeapon:{name:'คทาแห่งความว่างเปล่า',icon:'🕳️',slot:'weapon',rarity:'legend',atk:75,requiredClass:'mage'}},
    {tier:4,branch:'S',parentBranch:'S',secret:true,name:'ผู้กลืนกินจักรวาล',icon:'🌀🔮',color:'#3300dd',
     lore:'ดวงดาวดับลงเมื่อเขาท่องคาถา — เวทมนตร์ที่ไม่ควรมีอยู่',
     conditions:{evoQuest:'mage_4S'},
     bonuses:{atkMult:2.2,expMult:1.7,critBonus:0.3,spellEcho:0.3},
     rewardWeapon:{name:'คทากลืนจักรวาล',icon:'🌀',slot:'weapon',rarity:'mythic',atk:130,requiredClass:'mage'}},
    // ── branch C (kills 35-60) — เวทไฟล้างผลาญ ──
    {tier:3,branch:'C',name:'จอมเวทย์เพลิงพิโรธ',icon:'🔥🔮',color:'#ff5522',
     lore:'เปลวไฟไม่เคยถามว่าใครคือศัตรู มันเผาทุกสิ่ง',
     bonuses:{atkMult:1.45,expMult:1.25,critBonus:0.12},
     rewardWeapon:{name:'คทาเพลิงพิโรธ',icon:'🔥',slot:'weapon',rarity:'epic',atk:56,requiredClass:'mage'}},
    {tier:4,branch:'C',parentBranch:'C',name:'เทพอัคนีประลัยกัลป์',icon:'☄️🔮',color:'#ff3300',
     lore:'เปลวไฟแห่งวันสิ้นโลกอยู่ในกำมือของเขา',
     conditions:{evoQuest:'mage_4C'},
     bonuses:{atkMult:1.8,expMult:1.4,critBonus:0.2,spellEcho:0.12},
     rewardWeapon:{name:'คทาอัคนีประลัย',icon:'☄️',slot:'weapon',rarity:'legend',atk:96,requiredClass:'mage'}},
    // ── branch D (kills 60-90) — มหาเวทกาลเวลา ──
    {tier:3,branch:'D',name:'จอมเวทย์กาลเวลา',icon:'⏳🔮',color:'#44ccdd',
     lore:'ผู้บงการเวลา ทุกคาถาเกิดซ้ำก่อนศัตรูจะรู้ตัว',
     bonuses:{atkMult:1.5,expMult:1.35,critBonus:0.14,spellEcho:0.1},
     rewardWeapon:{name:'คทากาลเวลา',icon:'⏳',slot:'weapon',rarity:'epic',atk:60,requiredClass:'mage'}},
    {tier:4,branch:'D',parentBranch:'D',name:'เทพผู้บงการกาลเวลา',icon:'🌌⏳',color:'#22aaff',
     lore:'อดีต ปัจจุบัน อนาคต — ทั้งหมดคือสนามเด็กเล่นของเขา',
     conditions:{evoQuest:'mage_4D'},
     bonuses:{atkMult:1.85,expMult:1.5,critBonus:0.22,spellEcho:0.18},
     rewardWeapon:{name:'คทาบงการกาลเวลา',icon:'🌌',slot:'weapon',rarity:'legend',atk:112,requiredClass:'mage'}}
  ],
  rogue:[
    {tier:1,name:'โจร',icon:'🗡️',color:'#44ff88'},
    {tier:2,name:'นักฆ่า',icon:'🔪',color:'#55ff99',
     lore:'นิ้วที่รวดเร็วกว่าสายตา นักฆ่าไม่สังหาร — พวกเขา "แก้ปัญหา"',
     conditions:{level:15,critCount:20},
     bonuses:{critBonus:0.08,dropBonus:0.05},
     rewardWeapon:{name:'กริชนักฆ่า',icon:'🔪',slot:'weapon',rarity:'uncommon',atk:20,requiredClass:'rogue'}},
    {tier:3,branch:'A',name:'นักฆ่าเงา',icon:'🌑🔪',color:'#22cc66',
     lore:'เงาไม่มีเสียง เงาไม่มีชื่อ แต่เงาสังหารได้โดยไม่ทิ้งรอยไว้',
     conditions:{level:50,critCount:50,evoQuest:'rogue_3A'},
     bonuses:{critBonus:0.1,dropBonus:0.05,goldMult:1.3},
     rewardWeapon:{name:'กริชเงา',icon:'🌑',slot:'weapon',rarity:'epic',atk:48,requiredClass:'rogue'}},
    {tier:3,branch:'B',name:'โจรสลัดเถื่อน',icon:'☠️🔪',color:'#ff8844',
     lore:'ชีวิตบนดาบ ทองในมือ ไม่มีกฎ ไม่มีเจ้านาย มีแค่เป้าหมายถัดไป',
     conditions:{level:50,gold:2000,evoQuest:'rogue_3B'},
     bonuses:{goldMult:1.5,dropBonus:0.1,critBonus:0.05},
     rewardWeapon:{name:'ดาบโจรสลัด',icon:'⚓',slot:'weapon',rarity:'epic',atk:42,requiredClass:'rogue'}},
    {tier:4,branch:'A',parentBranch:'A',name:'ราชาเงามืด',icon:'👑🌑',color:'#008844',
     lore:'ไม่มีใครเห็นหน้าราชาเงา แต่ทุกคนรู้สึกถึงการมีอยู่... ก่อนที่จะล้มลง',
     conditions:{level:60,critCount:150,evoQuest:'rogue_4A'},
     bonuses:{critBonus:0.15,dropBonus:0.05,goldMult:1.5},
     rewardWeapon:{name:'กระบี่ราชาเงา',icon:'👑',slot:'weapon',rarity:'legend',atk:88,requiredClass:'rogue'}},
    {tier:4,branch:'B',parentBranch:'B',name:'จักรพรรดิโจร',icon:'💰👑',color:'#ffaa00',
     lore:'ทองคือพระเจ้า อำนาจคือศาสนา จักรพรรดิโจรปกครองด้วยความกลัวและความโลภ',
     conditions:{level:60,gold:8000,evoQuest:'rogue_4B'},
     bonuses:{goldMult:2.0,dropBonus:0.15,critBonus:0.08},
     rewardWeapon:{name:'ดาบจักรพรรดิทอง',icon:'💰',slot:'weapon',rarity:'legend',atk:75,requiredClass:'rogue'}},
    // ── SECRET branch (S) — ปลดล็อกจาก Infinity Trial เท่านั้น ──
    {tier:3,branch:'S',secret:true,name:'เนโครแมนเซอร์',icon:'💀🔮',color:'#9b30ff',
     lore:'ในการทดสอบนิรันดร์ เขาเรียนรู้ที่จะปลุกศพศัตรูที่ล้มลงให้รับใช้ — ความตายไม่ใช่จุดจบ แต่คือจุดเริ่มต้น',
     bonuses:{atkMult:1.3,critBonus:0.25,dropBonus:0.1,goldMult:1.6,doubleStrike:0.25,lifesteal:0.05},
     rewardWeapon:{name:'คทาเรียกวิญญาณ',icon:'💀',slot:'weapon',rarity:'legend',atk:65,requiredClass:'rogue'}},
    {tier:4,branch:'S',parentBranch:'S',secret:true,name:'จักรพรรดิเงา',icon:'👑🌑',color:'#6a0dad',
     lore:'กองทัพของผู้ตายคุกเข่าให้เขา เงาทุกเงาในแผ่นดินคือบัลลังก์ — จักรพรรดิผู้ปกครองทั้งคนเป็นและคนตาย',
     conditions:{evoQuest:'rogue_4S'},
     bonuses:{atkMult:1.5,critBonus:0.4,dropBonus:0.15,goldMult:2.0,doubleStrike:0.4,lifesteal:0.08},
     rewardWeapon:{name:'คทาจักรพรรดิเงา',icon:'👑',slot:'weapon',rarity:'mythic',atk:115,requiredClass:'rogue'}},
    // ── branch C (kills 35-60) — นักฆ่าพิษ ──
    {tier:3,branch:'C',name:'นักฆ่าพิษอสรพิษ',icon:'🐍🔪',color:'#66cc44',
     lore:'ดาบจุ่มพิษงู เหยื่อไม่มีวันรู้ว่าตายเพราะอะไร',
     bonuses:{atkMult:1.3,critBonus:0.14,doubleStrike:0.1,lifesteal:0.05},
     rewardWeapon:{name:'กริชอสรพิษ',icon:'🐍',slot:'weapon',rarity:'epic',atk:54,requiredClass:'rogue'}},
    {tier:4,branch:'C',parentBranch:'C',name:'ราชาพิษมรณะ',icon:'☠️🐍',color:'#44aa22',
     lore:'อาณาจักรพิษที่ไม่มีใครรอดชีวิตกลับไปเล่า',
     conditions:{evoQuest:'rogue_4C'},
     bonuses:{atkMult:1.55,critBonus:0.22,doubleStrike:0.2,lifesteal:0.1},
     rewardWeapon:{name:'กริชมรณะอสรพิษ',icon:'☠️',slot:'weapon',rarity:'legend',atk:94,requiredClass:'rogue'}},
    // ── branch D (kills 60-90) — นักฆ่าสายฟ้า ──
    {tier:3,branch:'D',name:'นักฆ่าสายฟ้า',icon:'⚡🔪',color:'#ffdd44',
     lore:'เร็วกว่าสายตา ก่อนเสียงฟ้าผ่าจะดัง เหยื่อก็สิ้นใจแล้ว',
     bonuses:{atkMult:1.4,critBonus:0.16,doubleStrike:0.15,goldMult:1.4},
     rewardWeapon:{name:'กริชสายฟ้า',icon:'⚡',slot:'weapon',rarity:'epic',atk:60,requiredClass:'rogue'}},
    {tier:4,branch:'D',parentBranch:'D',name:'เทพสังหารสายฟ้า',icon:'🌩🔪',color:'#ffcc00',
     lore:'หนึ่งกะพริบตา หนึ่งร้อยศพ',
     conditions:{evoQuest:'rogue_4D'},
     bonuses:{atkMult:1.65,critBonus:0.26,doubleStrike:0.3,goldMult:1.6},
     rewardWeapon:{name:'กริชเทพสายฟ้า',icon:'🌩',slot:'weapon',rarity:'legend',atk:102,requiredClass:'rogue'}}
  ],
  archer:[
    {tier:1,name:'นักธนู',icon:'🏹',color:'#ffd700'},
    {tier:2,name:'นักล่า',icon:'🦅🏹',color:'#ffcc00',
     lore:'ป่าสอนให้รู้จักความอดทน นักล่าเรียนรู้จากธรรมชาติ',
     conditions:{level:15,streak:5},
     bonuses:{streakMult:1.2,atkMult:1.1},
     rewardWeapon:{name:'ธนูนักล่า',icon:'🦅',slot:'weapon',rarity:'uncommon',atk:19,requiredClass:'archer'}},
    {tier:3,branch:'A',name:'นักล่าป่า',icon:'🌿🏹',color:'#ffaa00',
     lore:'หนึ่งลูกธนู หนึ่งชีวิต นักล่าป่าไม่เคยพลาด',
     conditions:{level:50,streak:14,evoQuest:'archer_3A'},
     bonuses:{streakMult:2.0,atkMult:1.2},
     rewardWeapon:{name:'ธนูโบราณป่าลึก',icon:'🌿',slot:'weapon',rarity:'epic',atk:46,requiredClass:'archer'}},
    {tier:3,branch:'B',name:'นักธนูลม',icon:'🌪️🏹',color:'#88ddff',
     lore:'ลมพัดลูกธนู ลูกธนูพัดศัตรู ผู้ควบคุมลมคือผู้ควบคุมสนามรบ',
     conditions:{level:50,kills:60,evoQuest:'archer_3B'},
     bonuses:{atkMult:1.3,critBonus:0.08},
     rewardWeapon:{name:'ธนูพายุ',icon:'🌪️',slot:'weapon',rarity:'epic',atk:50,requiredClass:'archer'}},
    {tier:4,branch:'A',parentBranch:'A',name:'จอมล่าแห่งจักรวาล',icon:'🌠🏹',color:'#ff8800',
     lore:'เป้าหมายคือดวงดาว — จอมล่าแห่งจักรวาลยิงสู่นิรันดร์',
     conditions:{level:60,streak:25,evoQuest:'archer_4A'},
     bonuses:{streakMult:3.0,atkMult:1.5},
     rewardWeapon:{name:'ธนูจักรวาล',icon:'🌠',slot:'weapon',rarity:'legend',atk:92,requiredClass:'archer'}},
    {tier:4,branch:'B',parentBranch:'B',name:'เทพสายลม',icon:'⚡🌪️',color:'#44eeff',
     lore:'เร็วกว่าฟ้าแลบ แม่นกว่าโชคชะตา เทพสายลมไม่ยิงครั้งเดียว — ยิงพร้อมกันทั้งหมด',
     conditions:{level:60,critCount:100,evoQuest:'archer_4B'},
     bonuses:{atkMult:1.8,critBonus:0.15},
     rewardWeapon:{name:'ธนูฟ้าผ่า',icon:'⚡',slot:'weapon',rarity:'legend',atk:95,requiredClass:'archer'}},
    // ── SECRET branch (S) — ปลดล็อกจาก Infinity Trial เท่านั้น ──
    {tier:3,branch:'S',secret:true,name:'นักล่าวิญญาณนิรันดร์',icon:'👁️🏹',color:'#cc44ff',
     lore:'ในการทดสอบไม่จบสิ้น ดวงตาของเขาเห็นวิญญาณของศัตรูทุกตัวที่จะมาถึง',
     bonuses:{atkMult:1.5,critBonus:0.2,pierce:0.3,multiShot:2},
     rewardWeapon:{name:'ธนูล่าวิญญาณ',icon:'👁️',slot:'weapon',rarity:'legend',atk:72,requiredClass:'archer'}},
    {tier:4,branch:'S',parentBranch:'S',secret:true,name:'เทพแห่งการล่านิรันดร์',icon:'🌌🏹',color:'#9900ff',
     lore:'ไม่มีเป้าหมายใดหนีพ้น แม้แต่ดวงดาวที่กำลังจะดับ',
     conditions:{evoQuest:'archer_4S'},
     bonuses:{atkMult:2.1,critBonus:0.35,pierce:0.6,multiShot:3},
     rewardWeapon:{name:'ธนูพิฆาตนิรันดร์',icon:'🌌',slot:'weapon',rarity:'mythic',atk:125,requiredClass:'archer'}},
    // ── branch C (kills 35-60) — นักธนูเพลิง ──
    {tier:3,branch:'C',name:'นักธนูเพลิงมาร',icon:'🔥🏹',color:'#ff6622',
     lore:'ลูกธนูทุกดอกลุกเป็นไฟ เผาทั้งกายและวิญญาณ',
     bonuses:{atkMult:1.5,critBonus:0.16,pierce:0.2,multiShot:1},
     rewardWeapon:{name:'ธนูเพลิงมาร',icon:'🔥',slot:'weapon',rarity:'epic',atk:57,requiredClass:'archer'}},
    {tier:4,branch:'C',parentBranch:'C',name:'เทพธนูเพลิงประลัย',icon:'☄️🏹',color:'#ff3300',
     lore:'ฝนลูกธนูเพลิงตกลงมาราวกับวันสิ้นโลก',
     conditions:{evoQuest:'archer_4C'},
     bonuses:{atkMult:1.85,critBonus:0.26,pierce:0.4,multiShot:2},
     rewardWeapon:{name:'ธนูเพลิงประลัย',icon:'☄️',slot:'weapon',rarity:'legend',atk:100,requiredClass:'archer'}},
    // ── branch D (kills 60-90) — พรานเงา ──
    {tier:3,branch:'D',name:'พรานเงาไร้เสียง',icon:'🌑🏹',color:'#8866cc',
     lore:'ไม่มีใครได้ยินคันธนู มีเพียงเสียงร่างล้มลง',
     bonuses:{atkMult:1.55,critBonus:0.22,pierce:0.3,multiShot:1},
     rewardWeapon:{name:'ธนูพรานเงา',icon:'🌑',slot:'weapon',rarity:'epic',atk:61,requiredClass:'archer'}},
    {tier:4,branch:'D',parentBranch:'D',name:'เทพพรานแห่งความมืด',icon:'🌒🏹',color:'#6644aa',
     lore:'ความมืดคือลูกธนู เงาคือคันศร เป้าหมายคือทุกสิ่ง',
     conditions:{evoQuest:'archer_4D'},
     bonuses:{atkMult:1.95,critBonus:0.3,pierce:0.5,multiShot:2},
     rewardWeapon:{name:'ธนูเทพมืด',icon:'🌒',slot:'weapon',rarity:'legend',atk:106,requiredClass:'archer'}}
  ],
  paladin:[
    {tier:1,name:'อัศวินศักดิ์สิทธิ์',icon:'✨',color:'#4488ff'},
    {tier:2,name:'พาลาดินแสงสว่าง',icon:'🌟✨',color:'#5599ff',
     lore:'ศรัทธาแกร่งพอที่จะหักดาบศัตรู พาลาดินเดินบนเส้นทางแห่งแสง',
     conditions:{level:15,hp:300},
     bonuses:{regenMult:1.2,hpMult:1.2},
     rewardWeapon:{name:'ดาบศักดิ์สิทธิ์',icon:'✨',slot:'weapon',rarity:'uncommon',atk:16,requiredClass:'paladin'}},
    {tier:3,branch:'A',name:'นักบุญนักรบ',icon:'🌈✨',color:'#3366ee',
     lore:'เมื่อนักรบกลายเป็นนักบุญ ดาบก็กลายเป็นสัญลักษณ์ของความหวัง',
     conditions:{level:50,hpHealed:2000,evoQuest:'paladin_3A'},
     bonuses:{regenMult:1.3,hpMult:1.3},
     rewardWeapon:{name:'ดาบนักบุญ',icon:'🌈',slot:'weapon',rarity:'epic',atk:38,requiredClass:'paladin'}},
    {tier:3,branch:'B',name:'อัศวินพิฆาตมาร',icon:'⚡✨',color:'#ffaa22',
     lore:'ความชั่วร้ายไม่มีที่หลบซ่อน เมื่ออัศวินพิฆาตมารออกล่า',
     conditions:{level:50,bossKills:5,evoQuest:'paladin_3B'},
     bonuses:{atkMult:1.3,critBonus:0.06,hpMult:1.1},
     rewardWeapon:{name:'ดาบพิฆาตมาร',icon:'⚡',slot:'weapon',rarity:'epic',atk:50,requiredClass:'paladin'}},
    {tier:4,branch:'A',parentBranch:'A',name:'เทพแห่งแสง',icon:'☀️',color:'#2244dd',
     lore:'แสงจากอีกโลก ผ่านร่างของนักรบมนุษย์',
     conditions:{level:60,hpHealed:5000,evoQuest:'paladin_4A'},
     bonuses:{regenMult:1.5,hpMult:1.6,damageReduction:0.1},
     rewardWeapon:{name:'ดาบเทพแห่งแสง',icon:'☀️',slot:'weapon',rarity:'legend',atk:65,requiredClass:'paladin'}},
    {tier:4,branch:'B',parentBranch:'B',name:'ราชันพิฆาต',icon:'👑⚡',color:'#ff8800',
     lore:'ราชาแห่งการพิฆาต ทุกก้าวคือความตายของศัตรู',
     conditions:{level:60,bossKills:15,evoQuest:'paladin_4B'},
     bonuses:{atkMult:1.6,critBonus:0.12,hpMult:1.2},
     rewardWeapon:{name:'ดาบราชันพิฆาต',icon:'👑',slot:'weapon',rarity:'legend',atk:95,requiredClass:'paladin'}},
    // ── SECRET branch (S) — ปลดล็อกจาก Infinity Trial เท่านั้น ──
    {tier:3,branch:'S',secret:true,name:'อัศวินผู้ไม่ตาย',icon:'⚜️🛡',color:'#ffcc66',
     lore:'ยืนหยัดผ่านคลื่นศัตรูนับไม่ถ้วนโดยไม่ล้มลง — ความตายปฏิเสธที่จะรับเขาไว้',
     bonuses:{hpMult:1.6,defMult:1.5,regenMult:1.4,reviveOnce:true},
     rewardWeapon:{name:'ดาบอมตะศักดิ์สิทธิ์',icon:'⚜️',slot:'weapon',rarity:'legend',atk:60,def:20,requiredClass:'paladin'}},
    {tier:4,branch:'S',parentBranch:'S',secret:true,name:'เทพผู้คุ้มครองนิรันดร์',icon:'🕊️☀️',color:'#ffdd88',
     lore:'แสงของเขาไม่เคยดับ แม้ในความมืดมิดที่สุดของจักรวาล',
     conditions:{evoQuest:'paladin_4S'},
     bonuses:{hpMult:2.2,defMult:1.9,regenMult:1.8,damageReduction:0.25,reviveOnce:true},
     rewardWeapon:{name:'ดาบเทพผู้คุ้มครอง',icon:'🕊️',slot:'weapon',rarity:'mythic',atk:100,def:40,requiredClass:'paladin'}},
    // ── branch C (kills 35-60) — อัศวินครูเสด ──
    {tier:3,branch:'C',name:'อัศวินครูเสด',icon:'⚔️✨',color:'#ddbb44',
     lore:'ดาบและศรัทธาเป็นหนึ่งเดียว ทั้งโจมตีและปกป้อง',
     bonuses:{hpMult:1.3,atkMult:1.35,defMult:1.2,critBonus:0.1},
     rewardWeapon:{name:'ดาบครูเสด',icon:'⚔️',slot:'weapon',rarity:'epic',atk:55,requiredClass:'paladin'}},
    {tier:4,branch:'C',parentBranch:'C',name:'จอมพลครูเสดศักดิ์สิทธิ์',icon:'🛡☀️',color:'#ffaa22',
     lore:'นำกองทัพแสงพิชิตความมืด ดาบไม่เคยพ่าย',
     conditions:{evoQuest:'paladin_4C'},
     bonuses:{hpMult:1.5,atkMult:1.6,defMult:1.3,critBonus:0.2,regenMult:1.2},
     rewardWeapon:{name:'ดาบจอมพลครูเสด',icon:'🛡',slot:'weapon',rarity:'legend',atk:95,requiredClass:'paladin'}},
    // ── branch D (kills 60-90) — เทพแห่งการพิพากษา ──
    {tier:3,branch:'D',name:'ผู้พิพากษาศักดิ์สิทธิ์',icon:'⚖️✨',color:'#ffcc66',
     lore:'ตราชั่งแห่งความยุติธรรม บาปหนักเท่าใด ดาบก็หนักเท่านั้น',
     bonuses:{hpMult:1.45,atkMult:1.4,defMult:1.35,critBonus:0.12,regenMult:1.2},
     rewardWeapon:{name:'ดาบผู้พิพากษา',icon:'⚖️',slot:'weapon',rarity:'epic',atk:59,requiredClass:'paladin'}},
    {tier:4,branch:'D',parentBranch:'D',name:'เทพแห่งการพิพากษา',icon:'👁☀️',color:'#ffbb33',
     lore:'คำตัดสินสุดท้ายของจักรวาลอยู่ในมือของเขา',
     conditions:{evoQuest:'paladin_4D'},
     bonuses:{hpMult:1.7,atkMult:1.65,defMult:1.5,critBonus:0.22,regenMult:1.4,damageReduction:0.1},
     rewardWeapon:{name:'ดาบพิพากษาสวรรค์',icon:'👁',slot:'weapon',rarity:'legend',atk:104,requiredClass:'paladin'}}
  ]
};

// ============================================================
// INFINITY TRIAL — โหมดตีมอนไม่จบสิ้น (ปลดล็อกตอน Tier 2)
// kills จาก trial ตัดสินว่าได้ branch ไหนของ Tier 3
// ============================================================
const INFINITY_TRIAL = {
  // wave scaling — มอนแรงขึ้นเรื่อยๆ ตามคลื่น
  hpGrowthPerWave:  0.085,   // +8.5% HP ต่อคลื่น (สะสมแบบทบต้น)
  atkGrowthPerWave: 0.075,   // +7.5% ATK ต่อคลื่น
  mobsPerWave:      3,       // จำนวนมอนต่อคลื่น
  baseHpMult:       0.22,    // คลื่นแรกเทียบมอนจริง (ตีไม่กี่ทีตาย → เล่นลื่นแบบ gauntlet)
  baseAtkMult:      0.4,
  attackSpeedMult:  0.42,    // trial ตีเร็วกว่าปกติ (× ของ getAttackInterval, ขั้นต่ำ 420ms)

  // ── kills → คลาส แบบ "สุ่มถ่วงน้ำหนัก" (ทุกคลาสมีดีของตัวเอง) ──
  // แต่ละ branch มีน้ำหนัก = base + perKill × kills (clamp ไม่ติดลบ)
  // ยิ่งตีเยอะ → น้ำหนัก S/D สูงขึ้น, B/A ต่ำลง → S ออกบ่อยขึ้นแต่ไม่การันตี
  // label/rank ใช้โชว์ความ "เท่" ของผล (ไม่ใช่ลำดับ fixed อีกต่อไป)
  // rank ของแต่ละ branch ต้อง "ไม่ซ้ำกัน" และตรงกับผลที่ได้จริง
  // (เดิม C โชว์ rank A, D โชว์ rank S → ทำให้ดูเหมือนสุ่มได้ A แต่ได้ C)
  branchInfo: {
    B: { label:'เส้นทางตั้งรับ', rank:'B', base:40, perKill:-0.30 },
    A: { label:'เส้นทางบุก',      rank:'A', base:35, perKill:-0.10 },
    C: { label:'เส้นทางพิฆาต',    rank:'C', base:18, perKill: 0.18 },
    D: { label:'เส้นทางจอมทัพ',   rank:'D', base: 7, perKill: 0.30 },
  },
  // SECRET (S) — ต้องผ่านคลื่นลึกถึงจะมีสิทธิ์ลุ้น, น้ำหนักโตตาม kills
  // rank โชว์เป็น "S" (Tier ลับเดียวของเกม) — ไม่มี SS แยกต่างหาก
  secret: { label:'TIER ลับ', rank:'S', minWave:10, base:0, perKill:0.45, minKillsToRoll:30 },
  // floor ขั้นต่ำของแต่ละ weight (กันติดลบ)
  minWeight: 1,

  // ── รางวัลตาม kills (นอกจาก % คลาส) — ตีเยอะยิ่งคุ้ม, ออกแบบให้สมดุล ──
  // แต้มสกิล: ทุก killsPerSkillPoint kills = +1 แต้ม (เข้า main pool)
  // ค่าสถานะถาวร: ATK/HP/DEF เพิ่มตาม kills (× ต่อ kill) ปัดเศษ
  killRewards: {
    killsPerSkillPoint: 20,   // ตี 20 ตัว = +1 แต้มสกิล
    maxSkillPoints: 6,        // เพดานแต้มจาก trial เดียว (กัน farm เกิน)
    atkPerKill: 0.6,          // +0.6 ATK ต่อ kill
    hpPerKill: 3,             // +3 HP ต่อ kill
    defPerKill: 0.2,          // +0.2 DEF ต่อ kill
    maxKillsForStats: 150,    // นับ stat สูงสุดที่ 150 kills (กันเฟ้อ)
  },
};

// ============================================================
// TALENTS — ระบบติดตัวละคร (ปั้น build เอง)
// ได้ 1 แต้มทุก 3 เลเวล · ลงในต้นไม้ talent · รีเซ็ตได้ด้วยทอง
// แต่ละ talent มีหลายขั้น (maxRank) · ผลรวม fold เข้า stat/derived ทั้งหมด
//   stat keys: atk,def,hp (flat ต่อขั้น) · crit,lifesteal,speed,expBonus,
//              goldBonus,dropBonus,damageReduction (fraction ต่อขั้น)
// ============================================================
const TALENT_POINTS_PER_LEVELS = 3;   // +1 แต้มทุก 3 เลเวล
const TALENT_RESET_COST = 2000;       // ทองในการรีเซ็ต
// ============================================================
// WORLD BOSS — บอสโลกประจำสัปดาห์ (เรดสะสมดาเมจ)
// ตีได้หลายครั้งต่อสัปดาห์ · ดาเมจสะสมข้ามรอบ · รับรางวัลตามขั้น
// หมุนเวียนทุกสัปดาห์ · ดาเมจรีเซ็ตเมื่อขึ้นสัปดาห์ใหม่
// ============================================================
const WORLD_BOSSES = [
  { id:'wb_titan',  name:'ไททันโลกันตร์', icon:'🗿', color:'#cc8844',
    desc:'ยักษ์หินดึกดำบรรพ์ที่ตื่นขึ้นทุกสัปดาห์', maxHp: 5000000 },
  { id:'wb_leviath',name:'เลวีอาธาน',     icon:'🐙', color:'#3399cc',
    desc:'อสูรใต้สมุทรที่กลืนกินกองเรือทั้งกอง', maxHp: 8000000 },
  { id:'wb_phoenix',name:'ฟีนิกซ์มรณะ',   icon:'🔥', color:'#ff5522',
    desc:'นกเพลิงที่เผาผลาญทุกสิ่งเมื่อโกรธ', maxHp: 12000000 },
];
// รางวัลตามดาเมจสะสม (ส่วนตัว) — ไต่ขั้น
const WORLD_BOSS_TIERS = [
  { dmg: 50000,    reward:{ gold:3000,  stones:5  }, label:'ผู้เข้าร่วม' },
  { dmg: 250000,   reward:{ gold:10000, stones:15, cores:3 }, label:'นักรบ' },
  { dmg: 1000000,  reward:{ gold:30000, stones:40, cores:8, keys:2 }, label:'วีรบุรุษ' },
  { dmg: 4000000,  reward:{ gold:100000,stones:100,cores:20,keys:5, card:true }, label:'ตำนาน' },
];

const TALENTS = [
  // ── สายโจมตี (offense) ──
  { id:'t_atk',     name:'พละกำลัง',     icon:'💪', desc:'+4 ATK ต่อขั้น',           col:'off', maxRank:5, per:{ atk:4 } },
  { id:'t_crit',    name:'จุดตาย',       icon:'🎯', desc:'+3% โอกาสคริติคอลต่อขั้น',  col:'off', maxRank:5, per:{ crit:0.03 } },
  { id:'t_speed',   name:'ว่องไว',       icon:'⚡', desc:'+4% ความเร็วโจมตีต่อขั้น',  col:'off', maxRank:5, per:{ speed:0.04 } },
  { id:'t_lifesteal',name:'ดูดพลัง',     icon:'🩸', desc:'+3% ดูดเลือดต่อขั้น',      col:'off', maxRank:4, per:{ lifesteal:0.03 } },
  // ── สายป้องกัน (defense) ──
  { id:'t_hp',      name:'อึด',          icon:'❤️', desc:'+40 HP ต่อขั้น',           col:'def', maxRank:5, per:{ hp:40 } },
  { id:'t_def',     name:'แกร่ง',        icon:'🛡', desc:'+3 DEF ต่อขั้น',           col:'def', maxRank:5, per:{ def:3 } },
  { id:'t_tough',   name:'หนังเหนียว',   icon:'🪨', desc:'ลดดาเมจที่รับ 2% ต่อขั้น',  col:'def', maxRank:5, per:{ damageReduction:0.02 } },
  // ── สายเก็บเกี่ยว (utility) ──
  { id:'t_exp',     name:'หัวไว',        icon:'📘', desc:'+5% EXP ต่อขั้น',          col:'util', maxRank:5, per:{ expBonus:0.05 } },
  { id:'t_gold',    name:'นักสะสม',      icon:'💰', desc:'+5% ทองต่อขั้น',           col:'util', maxRank:5, per:{ goldBonus:0.05 } },
  { id:'t_drop',    name:'โชคลาภ',       icon:'🍀', desc:'+2% โอกาสดรอปของต่อขั้น',  col:'util', maxRank:5, per:{ dropBonus:0.02 } },
];

// ============================================================
// EVOLUTION QUESTS — เงื่อนไขเปลี่ยนอาชีพแบบ quest
// ============================================================
const EVO_QUESTS = {
  // WARRIOR
  warrior_3A:{name:'ทดสอบแห่งมังกร',   desc:'สังหารบอส 3 ตัว และทำงานยาก 5 ชิ้น',  conditions:{bossKills:3, hardTasks:5}},
  warrior_3B:{name:'ปราการเหล็ก',       desc:'รับดาเมจรวม 1000 และทำงาน 20 ชิ้น',   conditions:{totalDmgTaken:1000, tasks:20}},
  warrior_4A:{name:'หายนะตื่น',          desc:'สังหารบอส 10 ตัว และทำงาน epic 3 ชิ้น', conditions:{bossKills:10, epicTasks:3}},
  warrior_4B:{name:'ป้อมปราการนิรันดร์', desc:'ทำงาน 60 ชิ้น และ streak 10 วัน',       conditions:{tasks:60, streak:10}},
  // MAGE
  mage_3A:{name:'เวทมนตร์มืด',    desc:'ทำงาน epic 5 ชิ้น และ kills 50 ตัว',   conditions:{epicTasks:5, kills:50}},
  mage_3B:{name:'แสงศักดิ์สิทธิ์', desc:'ทำงาน 30 ชิ้น และ streak 7 วัน',       conditions:{tasks:30, streak:7}},
  mage_4A:{name:'เทพเจ้าเวทย์',    desc:'ทำงาน epic 10 ชิ้น และ kills 100 ตัว', conditions:{epicTasks:10, kills:100}},
  mage_4B:{name:'ผู้รับพรสวรรค์',  desc:'ทำงาน 50 ชิ้น และ streak 14 วัน',      conditions:{tasks:50, streak:14}},
  // ROGUE
  rogue_3A:{name:'เงาแห่งความตาย', desc:'Crit 50 ครั้ง และ kills 80 ตัว',      conditions:{critCount:50, kills:80}},
  rogue_3B:{name:'โจรสลัดเลือด',   desc:'สะสมทอง 2000 และ kills 60 ตัว',      conditions:{gold:2000, kills:60}},
  rogue_4A:{name:'ราชาเงา',        desc:'Crit 150 ครั้ง และ kills 120 ตัว',    conditions:{critCount:150, kills:120}},
  rogue_4B:{name:'จักรวรรดิโจร',   desc:'สะสมทอง 8000 และ bossKills 5 ตัว',   conditions:{gold:8000, bossKills:5}},
  // ARCHER
  archer_3A:{name:'นักล่าป่าดึกดำบรรพ์',desc:'Streak 14 วัน และ kills 60 ตัว',   conditions:{streak:14, kills:60}},
  archer_3B:{name:'นักธนูพายุ',         desc:'kills 60 ตัว และ crit 30 ครั้ง',   conditions:{kills:60, critCount:30}},
  archer_4A:{name:'จอมล่าดวงดาว',        desc:'Streak 25 วัน และ bossKills 5 ตัว', conditions:{streak:25, bossKills:5}},
  archer_4B:{name:'เทพสายฟ้า',           desc:'Crit 100 ครั้ง และ kills 150 ตัว', conditions:{critCount:100, kills:150}},
  // PALADIN
  paladin_3A:{name:'นักบุญผู้รักษา',  desc:'ฟื้น HP รวม 2000 และทำงาน 25 ชิ้น', conditions:{hpHealed:2000, tasks:25}},
  paladin_3B:{name:'อัศวินพิฆาต',     desc:'bossKills 5 ตัว และ kills 70 ตัว',   conditions:{bossKills:5, kills:70}},
  paladin_4A:{name:'เทพผู้พิทักษ์',   desc:'ฟื้น HP รวม 5000 และ streak 10 วัน', conditions:{hpHealed:5000, streak:10}},
  paladin_4B:{name:'ราชันล่ามาร',     desc:'bossKills 15 ตัว และ epicTasks 5 ชิ้น', conditions:{bossKills:15, epicTasks:5}},
  // ── Tier 4 quests for branches C / D / S (เควสประจำอาชีพสายโหด) ──
  warrior_4C:{name:'ปีศาจสงครามเลือด', desc:'kills 120 ตัว และ bossKills 8 ตัว',   conditions:{kills:120, bossKills:8}},
  warrior_4D:{name:'จอมจักรพรรดิสงคราม',desc:'bossKills 12 ตัว และทำงาน 50 ชิ้น',  conditions:{bossKills:12, tasks:50}},
  warrior_4S:{name:'อสูรสงครามนิรันดร์',desc:'kills 200 ตัว และ bossKills 15 ตัว',  conditions:{kills:200, bossKills:15}},
  mage_4C:{name:'อัคนีประลัยกัลป์',    desc:'kills 130 ตัว และ epicTasks 8 ชิ้น',  conditions:{kills:130, epicTasks:8}},
  mage_4D:{name:'ผู้บงการกาลเวลา',     desc:'ทำงาน 60 ชิ้น และ kills 100 ตัว',     conditions:{tasks:60, kills:100}},
  mage_4S:{name:'ผู้กลืนกินจักรวาล',   desc:'kills 200 ตัว และ epicTasks 15 ชิ้น', conditions:{kills:200, epicTasks:15}},
  rogue_4C:{name:'ราชาพิษมรณะ',        desc:'Crit 130 ครั้ง และ kills 130 ตัว',    conditions:{critCount:130, kills:130}},
  rogue_4D:{name:'เทพสังหารสายฟ้า',    desc:'Crit 150 ครั้ง และสะสมทอง 6000',     conditions:{critCount:150, gold:6000}},
  rogue_4S:{name:'จักรพรรดิเงา',       desc:'Crit 200 ครั้ง และ kills 200 ตัว',    conditions:{critCount:200, kills:200}},
  archer_4C:{name:'เทพธนูเพลิงประลัย', desc:'kills 130 ตัว และ crit 80 ครั้ง',     conditions:{kills:130, critCount:80}},
  archer_4D:{name:'เทพพรานแห่งความมืด', desc:'kills 140 ตัว และ streak 20 วัน',    conditions:{kills:140, streak:20}},
  archer_4S:{name:'เทพแห่งการล่านิรันดร์',desc:'kills 200 ตัว และ crit 120 ครั้ง', conditions:{kills:200, critCount:120}},
  paladin_4C:{name:'จอมพลครูเสด',      desc:'bossKills 10 ตัว และฟื้น HP 4000',    conditions:{bossKills:10, hpHealed:4000}},
  paladin_4D:{name:'เทพแห่งการพิพากษา', desc:'bossKills 12 ตัว และทำงาน 50 ชิ้น',  conditions:{bossKills:12, tasks:50}},
  paladin_4S:{name:'เทพผู้คุ้มครองนิรันดร์',desc:'ฟื้น HP 8000 และ bossKills 15 ตัว',conditions:{hpHealed:8000, bossKills:15}},
};

// ============================================================
// CLASS SETS — ชุดเซ็ตประจำคลาส
// ============================================================
const CLASS_SETS = {
  warrior_3:{name:'ชุดอัศวินมังกร',dropZone:3,rarity:'epic',
   pieces:[
    {icon:'🪖',name:'หมวกมังกรเหล็ก', atk:6, def:4},
    {icon:'⚔',name:'เกราะมังกรดำ',    atk:6, def:6},
    {icon:'🧤',name:'ถุงมือมังกรเพลิง',atk:8, def:2},
    {icon:'👖',name:'ชุดขาอัศวินมังกร',atk:5, def:5},
    {icon:'👢',name:'รองเท้าบูทมังกร', atk:4, def:4},
    {icon:'🗡',name:'ดาบเขี้ยวมังกร',  atk:12,def:1}
   ]},
  warrior_4:{name:'ชุดอัศวินหายนะ',dropZone:6,rarity:'legend',
   pieces:[
    {icon:'🪖',name:'หมวกหายนะ',      atk:18,def:10},
    {icon:'⚔',name:'เกราะมืดหายนะ',   atk:18,def:14},
    {icon:'🧤',name:'ถุงมือหายนะ',     atk:22,def:6},
    {icon:'👖',name:'ชุดขาหายนะ',      atk:15,def:12},
    {icon:'👢',name:'รองเท้าหายนะ',    atk:12,def:10},
    {icon:'🗡',name:'ดาบสยบสวรรค์EX', atk:35,def:5}
   ]},
  mage_3:{name:'ชุดจอมเวทย์มืด',dropZone:3,rarity:'epic',
   pieces:[
    {icon:'🎩',name:'หมวกแม่มดมืด',   atk:8, def:2},
    {icon:'🥋',name:'เสื้อคลุมเงามืด',atk:7, def:3},
    {icon:'🧤',name:'ถุงมือเวทมืด',   atk:9, def:1},
    {icon:'👖',name:'ชุดขาเวทย์มนตร์', atk:6, def:3},
    {icon:'👢',name:'รองเท้าเวทมืด',  atk:5, def:2},
    {icon:'🪄',name:'คทามืดนิรันดร์', atk:14,def:0}
   ]},
  mage_4:{name:'ชุดเทพเวทมนตร์',dropZone:6,rarity:'legend',
   pieces:[
    {icon:'🎩',name:'มงกุฎเทพเวทย์',  atk:20,def:5},
    {icon:'🥋',name:'เสื้อคลุมจักรวาล',atk:18,def:6},
    {icon:'🧤',name:'ถุงมือเทพ',       atk:22,def:3},
    {icon:'👖',name:'ชุดขาจักรวาล',    atk:16,def:5},
    {icon:'👢',name:'รองเท้าเทพ',      atk:14,def:4},
    {icon:'🌌',name:'คทาผู้พิพากษาEX', atk:38,def:0}
   ]},
  rogue_3:{name:'ชุดนักฆ่าเงา',dropZone:3,rarity:'epic',
   pieces:[
    {icon:'🪖',name:'หน้ากากเงา',     atk:7, def:2},
    {icon:'🥋',name:'ชุดนักฆ่าเงา',   atk:6, def:2},
    {icon:'🧤',name:'ถุงมือมีดคม',    atk:10,def:1},
    {icon:'👖',name:'กางเกงนักฆ่า',   atk:6, def:2},
    {icon:'👢',name:'รองเท้าเงียบเงา', atk:4, def:3},
    {icon:'🗡',name:'กริชเงา',         atk:13,def:0}
   ]},
  rogue_4:{name:'ชุดราชาเงามืด',dropZone:6,rarity:'legend',
   pieces:[
    {icon:'🪖',name:'มงกุฎราชาเงา',  atk:18,def:5},
    {icon:'🥋',name:'ชุดราชาเงามืด', atk:16,def:5},
    {icon:'🧤',name:'ถุงมือมืดสนิท', atk:24,def:2},
    {icon:'👖',name:'กางเกงราชาเงา', atk:16,def:4},
    {icon:'👢',name:'รองเท้าเงามืด', atk:12,def:5},
    {icon:'🗡',name:'กระบี่ราชาเงา', atk:34,def:0}
   ]},
  archer_3:{name:'ชุดนักล่าป่า',dropZone:3,rarity:'epic',
   pieces:[
    {icon:'🪖',name:'หมวกนักล่า',     atk:5, def:3},
    {icon:'🥋',name:'เกราะหนังป่า',   atk:5, def:4},
    {icon:'🧤',name:'ถุงมือยิงธนู',   atk:7, def:2},
    {icon:'👖',name:'กางเกงหนังนักล่า',atk:5,def:3},
    {icon:'👢',name:'รองเท้าป่า',      atk:4, def:3},
    {icon:'🏹',name:'ธนูนักล่าโบราณ', atk:12,def:0}
   ]},
  archer_4:{name:'ชุดจอมล่าจักรวาล',dropZone:6,rarity:'legend',
   pieces:[
    {icon:'🪖',name:'หมวกจอมล่า',    atk:15,def:7},
    {icon:'🥋',name:'เกราะจักรวาล',  atk:14,def:8},
    {icon:'🧤',name:'ถุงมือจอมล่า',  atk:18,def:4},
    {icon:'👖',name:'กางเกงจอมล่า',  atk:14,def:6},
    {icon:'👢',name:'รองเท้าจักรวาล',atk:12,def:5},
    {icon:'🏹',name:'ธนูแห่งรุ่งอรุณEX',atk:32,def:0}
   ]},
  paladin_3:{name:'ชุดนักบุญนักรบ',dropZone:3,rarity:'epic',
   pieces:[
    {icon:'🪖',name:'มงกุฎแสงศักดิ์สิทธิ์',atk:4,def:6},
    {icon:'⚔',name:'เกราะนักบุญ',          atk:5,def:7},
    {icon:'🧤',name:'ถุงมือแสงสวรรค์',      atk:5,def:5},
    {icon:'👖',name:'ชุดขานักบุญ',           atk:4,def:6},
    {icon:'👢',name:'รองเท้าศักดิ์สิทธิ์',  atk:3,def:5},
    {icon:'✨',name:'คทาแสงสวรรค์',          atk:10,def:3}
   ]},
  paladin_4:{name:'ชุดเทพแห่งแสง',dropZone:6,rarity:'legend',
   pieces:[
    {icon:'🪖',name:'มงกุฎเทพแสง',    atk:12,def:16},
    {icon:'⚔',name:'เกราะเทพแสง',     atk:13,def:18},
    {icon:'🧤',name:'ถุงมือแสงจักรวาล',atk:14,def:12},
    {icon:'👖',name:'ชุดขาเทพแสง',    atk:12,def:14},
    {icon:'👢',name:'รองเท้าแสงนิรันดร์',atk:10,def:12},
    {icon:'✨',name:'หอกเจาะนิรันดร์EX',atk:28,def:8}
   ]}
};

// ============================================================
// T4 DUNGEON — ดันเจี้ยนหาของเฉพาะอาชีพ (gate ก่อนวิวัฒนาการ Tier 4)
// ------------------------------------------------------------
//  • เข้าได้เฉพาะตอน Tier 3 ของอาชีพตัวเอง
//  • สู้กับ "ตัวละคร T4 ของอาชีพตัวเอง" (เงา/ภาพสะท้อนแห่งอนาคต)
//  • แต่ละชิ้นดรอป ~2.5% ต่อการสังหาร 1 ตัว — มี 6 ชิ้น
//  • เก็บครบ 6 + ทำเควสประจำอาชีพเสร็จ → ปลดล็อกวิวัฒนาการ Tier 4
//  หมายเหตุ slot: "อาวุธรอง" ใช้ช่อง pants (ระบบ equip มี 6 ช่องพอดี)
// ============================================================
const T4_DUNGEON = {
  dropChance: 0.025,   // 2.5% ต่อชิ้น ต่อการสังหาร
  pieceCount: 6,
  // ลำดับชิ้น (ตรงกับ index ใน gear): หมวก เกราะ มือ เท้า อาวุธหลัก อาวุธรอง
  pieceSlots: ['helmet','armor','gloves','boots','weapon','pants'],
  pieceLabels:['หมวก','เกราะ','ถุงมือ','รองเท้า','อาวุธหลัก','อาวุธรอง'],
  // จำนวนตัวที่ต้องสู้ต่อเวฟ + การสเกล
  mobHpMult: 1.15,     // ตัว T4 ในดันแกร่งกว่ามอนปกติ tier เดียวกันนิดหน่อย
  mobAtkMult:1.1,
  // ของ 6 ชิ้น/อาชีพ — rarity mythic, stat สูงสุดในเกม
  gear: {
    warrior:[
      {icon:'🪖',name:'หมวกอสูรสงคราม',     slot:'helmet',atk:24,def:18,hp:120},
      {icon:'⚔',name:'เกราะอสูรนิรันดร์',   slot:'armor', atk:22,def:26,hp:160},
      {icon:'🧤',name:'กำปั้นทำลายล้าง',     slot:'gloves',atk:30,def:8, hp:80},
      {icon:'👢',name:'สนับแข้งจอมพล',       slot:'boots', atk:16,def:16,hp:100},
      {icon:'🗡',name:'มหาดาบสังหารเทพ',     slot:'weapon',atk:48,def:6, hp:60},
      {icon:'🛡',name:'โล่อสูรพิทักษ์',      slot:'pants', atk:14,def:22,hp:140}
    ],
    mage:[
      {icon:'🎩',name:'มงกุฎผู้กลืนจักรวาล', slot:'helmet',atk:28,def:6, hp:70,effect:'EXP+20%'},
      {icon:'🥋',name:'อาภรณ์มิติว่างเปล่า', slot:'armor', atk:26,def:12,hp:100},
      {icon:'🧤',name:'ถุงมือทำลายดวงดาว',   slot:'gloves',atk:34,def:4, hp:60},
      {icon:'👢',name:'รองเท้าเหินมิติ',     slot:'boots', atk:22,def:8, hp:80},
      {icon:'🌌',name:'คทากลืนจักรวาล',      slot:'weapon',atk:52,def:2, hp:40},
      {icon:'📖',name:'คัมภีร์ต้องห้าม',     slot:'pants', atk:24,def:6, hp:90,effect:'EXP+15%'}
    ],
    rogue:[
      {icon:'🪖',name:'หน้ากากจักรพรรดิเงา', slot:'helmet',atk:26,def:8, hp:80,effect:'crit+12%'},
      {icon:'🥋',name:'ชุดเงาแห่งความตาย',   slot:'armor', atk:24,def:14,hp:110},
      {icon:'🧤',name:'ถุงมือเรียกวิญญาณ',   slot:'gloves',atk:32,def:4, hp:70},
      {icon:'👢',name:'รองเท้าไร้เงา',       slot:'boots', atk:20,def:8, hp:80,effect:'crit+8%'},
      {icon:'💀',name:'คทาจักรพรรดิเงา',     slot:'weapon',atk:50,def:2, hp:50},
      {icon:'🗡',name:'กริชคู่สังหาร',       slot:'pants', atk:30,def:4, hp:60,effect:'crit+10%'}
    ],
    archer:[
      {icon:'🪖',name:'หมวกเทพล่านิรันดร์',  slot:'helmet',atk:25,def:10,hp:90},
      {icon:'🥋',name:'เกราะนักล่าวิญญาณ',   slot:'armor', atk:23,def:14,hp:110},
      {icon:'🧤',name:'ปลอกแขนแม่นนิรันดร์', slot:'gloves',atk:33,def:5, hp:65,effect:'crit+10%'},
      {icon:'👢',name:'รองเท้าลมกรด',        slot:'boots', atk:21,def:8, hp:80},
      {icon:'🌌',name:'ธนูพิฆาตนิรันดร์',    slot:'weapon',atk:51,def:2, hp:45},
      {icon:'🏹',name:'หน้าไม้วิญญาณ',       slot:'pants', atk:28,def:5, hp:70,effect:'crit+8%'}
    ],
    paladin:[
      {icon:'🪖',name:'มงกุฎเทพผู้คุ้มครอง', slot:'helmet',atk:16,def:24,hp:160,effect:'ฟื้น HP+15/เทิร์น'},
      {icon:'⚔',name:'เกราะคุ้มครองนิรันดร์',slot:'armor', atk:14,def:32,hp:220},
      {icon:'🧤',name:'ถุงมือศรัทธาบริสุทธิ์',slot:'gloves',atk:20,def:14,hp:120},
      {icon:'👢',name:'รองเท้าผู้พิทักษ์',   slot:'boots', atk:12,def:20,hp:140},
      {icon:'🕊️',name:'ดาบเทพผู้คุ้มครอง',  slot:'weapon',atk:40,def:12,hp:100},
      {icon:'🛡',name:'โล่แสงนิรันดร์',      slot:'pants', atk:10,def:28,hp:180,effect:'ฟื้น HP+10/เทิร์น'}
    ]
  }
};

// ============================================================
// SKILL TREES — แต่ละคลาสมี node อัพ stat + สกิล
// format: {id, name, desc, icon, type:'stat'|'skill', row, col,
//          requires:nodeId|null, branch:'A'|'B'|null,
//          stat:{atk,def,hp,crit}, skill:{id,name,desc}}
// ============================================================
const SKILL_TREES = {
  // ══════════════════════════════════════════════════════════
  // WARRIOR — นักรบ
  // T1: โจมตีตรง | T2: โจมตีกว้าง | T3A: มังกร | T3B: ป้องกัน | T4A: หายนะ | T4B: นิรันดร์
  // ══════════════════════════════════════════════════════════
  warrior:[
    // ── Row 0 — T1 stat + T1 skill ──
    {id:'w_hp1',   name:'+20 HP',   icon:'❤', type:'stat',  row:0,col:1, requires:null, stat:{hp:20}},
    {id:'w_atk1',  name:'+3 ATK',   icon:'⚔', type:'stat',  row:0,col:3, requires:null, stat:{atk:3}},
    {id:'w_t1sk',  name:'โจมตีหนัก', icon:'💢', type:'skill', row:0,col:2, requires:null,
     skill:{id:'heavy_blow',name:'โจมตีหนัก',desc:'โจมตี ×2 ดาเมจ ทันที',cooldown:4,tier:1}},
    // ── Row 1 — T2 stat + T2 skill ──
    {id:'w_def1',  name:'+3 DEF',   icon:'🛡', type:'stat',  row:1,col:1, requires:'w_hp1',  stat:{def:3}},
    {id:'w_atk2',  name:'+5 ATK',   icon:'⚔', type:'stat',  row:1,col:3, requires:'w_atk1', stat:{atk:5}},
    {id:'w_t2sk',  name:'พายุดาบ',  icon:'🌀', type:'skill', row:1,col:2, requires:'w_t1sk',
     skill:{id:'blade_storm',name:'พายุดาบ',desc:'โจมตี 4 ครั้ง แต่ละครั้ง ×0.8 ดาเมจ ชั่วคราวลด DEF ศัตรู',cooldown:5,tier:2}},
    {id:'w_t2sk2', name:'โห่ร้องศึก',icon:'📣', type:'skill', row:1,col:4, requires:'w_t2sk',
     skill:{id:'war_cry',name:'โห่ร้องศึก',desc:'บัฟตัวเอง ATK +50% เป็นเวลา 3 ตา (สแต็กกับสกิลอื่นได้)',cooldown:6,tier:2}},
    // ── Row 2 — T3 stat + T3 skill (shared) ──
    {id:'w_hp2',   name:'+40 HP',   icon:'❤', type:'stat',  row:2,col:1, requires:'w_def1', stat:{hp:40}},
    {id:'w_atk3',  name:'+8 ATK',   icon:'⚔', type:'stat',  row:2,col:3, requires:'w_atk2', stat:{atk:8}},
    {id:'w_slam',  name:'กระทืบพื้น',icon:'💥', type:'skill', row:2,col:2, requires:'w_t2sk',
     skill:{id:'slam',name:'กระทืบพื้น',desc:'โจมตี ×2.5 + stun ศัตรู 1 ตา',cooldown:5,tier:3}},
    // ── Row 3 — branch A ──
    {id:'w_A_hp3',   name:'+60 HP',       icon:'❤', type:'stat',  row:3,col:1, requires:'w_hp2',  branch:'A', stat:{hp:60}},
    {id:'w_A_atk4',  name:'+12 ATK',      icon:'⚔', type:'stat',  row:3,col:3, requires:'w_atk3', branch:'A', stat:{atk:12}},
    {id:'w_A_fire',  name:'ลมหายใจมังกร',icon:'🐉', type:'skill', row:3,col:2, requires:'w_slam', branch:'A',
     skill:{id:'dragon_breath',name:'ลมหายใจมังกร',desc:'โจมตี ×2 + เผา 3 ตา (ดาเมจต่อเนื่อง 8% HP/ตา)',cooldown:7,tier:3}},
    // ── Row 3 — branch B ──
    {id:'w_B_def3',   name:'+10 DEF',      icon:'🛡', type:'stat',  row:3,col:1, requires:'w_hp2',  branch:'B', stat:{def:10}},
    {id:'w_B_hp4',    name:'+80 HP',        icon:'❤', type:'stat',  row:3,col:3, requires:'w_atk3', branch:'B', stat:{hp:80}},
    {id:'w_B_shield', name:'โล่เหล็กกล้า', icon:'🏰', type:'skill', row:3,col:2, requires:'w_slam', branch:'B',
     skill:{id:'iron_shield',name:'โล่เหล็กกล้า',desc:'ลดดาเมจที่รับ 50% ใน 3 ตา + สะท้อน 20% กลับ',cooldown:7,tier:3}},
    // ── Row 4 — T4 branch A (อัศวินแห่งหายนะ) ──
    {id:'w_A4_atk',  name:'+18 ATK',     icon:'💀', type:'stat',  row:4,col:1, requires:'w_A_fire',  branch:'A', stat:{atk:18}},
    {id:'w_A4_hp',   name:'+100 HP',     icon:'❤', type:'stat',  row:4,col:3, requires:'w_A_hp3',   branch:'A', stat:{hp:100}},
    {id:'w_A4_sk',   name:'โนวาหายนะ',  icon:'💀', type:'skill', row:4,col:2, requires:'w_A_fire',  branch:'A',
     skill:{id:'doom_nova',name:'โนวาหายนะ',desc:'ระเบิดพลังมืด ×5 ดาเมจ + เผา+พิษ 4 ตา (DoT 12% HP/ตา)',cooldown:10,tier:4}},
    // ── Row 4 — T4 branch B (ผู้พิทักษ์นิรันดร์) ──
    {id:'w_B4_def',  name:'+15 DEF',        icon:'🏰', type:'stat',  row:4,col:1, requires:'w_B_shield', branch:'B', stat:{def:15}},
    {id:'w_B4_hp',   name:'+120 HP',         icon:'❤', type:'stat',  row:4,col:3, requires:'w_B_hp4',    branch:'B', stat:{hp:120}},
    {id:'w_B4_sk',   name:'ปราการนิรันดร์', icon:'🏯', type:'skill', row:4,col:2, requires:'w_B_shield', branch:'B',
     skill:{id:'eternal_fortress',name:'ปราการนิรันดร์',desc:'บล็อกดาเมจทั้งหมด 2 ตา + โจมตีตอบโต้ ×3 หลังจบ',cooldown:12,tier:4}},
    // ── Row 5 — IDLE: Speed + Drop + bulk HP/ATK ──
    {id:'w_spd1',  name:'-5% ช้า',   icon:'⚡', type:'stat', row:5,col:0, requires:'w_atk1',  stat:{speedBonus:0.05}},
    {id:'w_spd2',  name:'-8% ช้า',   icon:'⚡', type:'stat', row:5,col:1, requires:'w_spd1',  stat:{speedBonus:0.08}},
    {id:'w_spd3',  name:'-10% ช้า',  icon:'⚡', type:'stat', row:5,col:2, requires:'w_spd2',  stat:{speedBonus:0.10}},
    {id:'w_hp5',   name:'+150 HP',    icon:'❤', type:'stat', row:5,col:3, requires:'w_hp2',   stat:{hp:150}},
    {id:'w_atk5',  name:'+15 ATK',   icon:'⚔', type:'stat', row:5,col:4, requires:'w_atk3',  stat:{atk:15}},
    {id:'w_drop1', name:'+5% Drop',  icon:'💎', type:'stat', row:5,col:5, requires:'w_atk1',  stat:{dropBonus:0.05}},
    // ── Row 6 — Ultra: massive buffs ──
    {id:'w_spd4',  name:'-15% ช้า',  icon:'⚡', type:'stat', row:6,col:0, requires:'w_spd3',  stat:{speedBonus:0.15}},
    {id:'w_hp6',   name:'+250 HP',    icon:'❤', type:'stat', row:6,col:2, requires:'w_hp5',   stat:{hp:250}},
    {id:'w_atk6',  name:'+25 ATK',   icon:'⚔', type:'stat', row:6,col:3, requires:'w_atk5',  stat:{atk:25}},
    {id:'w_drop2', name:'+10% Drop', icon:'💎', type:'stat', row:6,col:5, requires:'w_drop1', stat:{dropBonus:0.10}},
  ],

  // ══════════════════════════════════════════════════════════
  // MAGE — จอมเวทย์
  // T1: ยิงเวท | T2: ชาร์จพลัง | T3A: มืด | T3B: แสง | T4A: จักรวาล | T4B: สวรรค์
  // ══════════════════════════════════════════════════════════
  mage:[
    // ── Row 0 — T1 ──
    {id:'m_atk1',  name:'+4 ATK',   icon:'🔮', type:'stat',  row:0,col:1, requires:null, stat:{atk:4}},
    {id:'m_exp1',  name:'+5% EXP',  icon:'✨', type:'stat',  row:0,col:3, requires:null, stat:{expBonus:0.05}},
    {id:'m_t1sk',  name:'ลูกไฟเล็ก',icon:'🔥', type:'skill', row:0,col:2, requires:null,
     skill:{id:'magic_bolt',name:'ลูกไฟเล็ก',desc:'โจมตี ×1.8 ดาเมจเวท + เผา 1 ตา',cooldown:3,tier:1}},
    // ── Row 1 — T2 ──
    {id:'m_hp1',   name:'+15 HP',   icon:'❤', type:'stat',  row:1,col:1, requires:'m_atk1', stat:{hp:15}},
    {id:'m_exp2',  name:'+10% EXP', icon:'✨', type:'stat',  row:1,col:3, requires:'m_exp1', stat:{expBonus:0.1}},
    {id:'m_t2sk',  name:'พายุน้ำแข็ง',icon:'❄️', type:'skill', row:1,col:2, requires:'m_t1sk',
     skill:{id:'blizzard',name:'พายุน้ำแข็ง',desc:'โจมตี 3 ครั้ง ×1.0 + ลด ATK ศัตรู 40% (3 ตา)',cooldown:6,tier:2}},
    {id:'m_t2sk2', name:'คลื่นมานา',icon:'🌊', type:'skill', row:1,col:4, requires:'m_t2sk',
     skill:{id:'mana_surge',name:'คลื่นมานา',desc:'บัฟตัวเอง ดาเมจเวท +40% เป็นเวลา 3 ตา + เพิ่มความเร็วโจมตี',cooldown:6,tier:2}},
    // ── Row 2 — T3 shared ──
    {id:'m_atk2',  name:'+10 ATK',  icon:'🔮', type:'stat',  row:2,col:1, requires:'m_hp1',   stat:{atk:10}},
    {id:'m_exp3',  name:'+15% EXP', icon:'✨', type:'stat',  row:2,col:3, requires:'m_exp2',  stat:{expBonus:0.15}},
    {id:'m_burst', name:'เวทระเบิด',icon:'💥', type:'skill', row:2,col:2, requires:'m_t2sk',
     skill:{id:'arcane_burst',name:'เวทระเบิด',desc:'ดาเมจ ×4 + ลด DEF ศัตรู 30% (2 ตา)',cooldown:7,tier:3}},
    // ── Row 3 — branch A (มืด) ──
    {id:'m_A_atk4', name:'+15 ATK',       icon:'🌑', type:'stat',  row:3,col:1, requires:'m_atk2',  branch:'A', stat:{atk:15}},
    {id:'m_A_exp4', name:'+20% EXP',      icon:'✨', type:'stat',  row:3,col:3, requires:'m_exp3',  branch:'A', stat:{expBonus:0.2}},
    {id:'m_A_dark', name:'โนวาความมืด',  icon:'🌑', type:'skill', row:3,col:2, requires:'m_burst',  branch:'A',
     skill:{id:'dark_nova',name:'โนวาแห่งความมืด',desc:'ดาเมจ ×3.5 + ลด DEF ศัตรู 50% (3 ตา) + ดูด HP 20%',cooldown:8,tier:3}},
    // ── Row 3 — branch B (แสง) ──
    {id:'m_B_hp2',  name:'+40 HP',        icon:'❤', type:'stat',  row:3,col:1, requires:'m_hp1',   branch:'B', stat:{hp:40}},
    {id:'m_B_exp4', name:'+20% EXP',      icon:'✨', type:'stat',  row:3,col:3, requires:'m_exp3',  branch:'B', stat:{expBonus:0.2}},
    {id:'m_B_holy', name:'แสงศักดิ์สิทธิ์',icon:'☀️', type:'skill', row:3,col:2, requires:'m_burst', branch:'B',
     skill:{id:'holy_light',name:'แสงศักดิ์สิทธิ์',desc:'โจมตี ×2.5 + ฟื้น HP 35% + แสงป้องกัน -30% DMG (2 ตา)',cooldown:7,tier:3}},
    // ── Row 4 — T4 branch A (เทพแห่งเวทมนตร์) ──
    {id:'m_A4_atk', name:'+22 ATK',      icon:'🌌', type:'stat',  row:4,col:1, requires:'m_A_dark', branch:'A', stat:{atk:22}},
    {id:'m_A4_exp', name:'+30% EXP',     icon:'✨', type:'stat',  row:4,col:3, requires:'m_A_exp4', branch:'A', stat:{expBonus:0.3}},
    {id:'m_A4_sk',  name:'สาปจักรวาล',  icon:'🌌', type:'skill', row:4,col:2, requires:'m_A_dark', branch:'A',
     skill:{id:'void_curse',name:'สาปจักรวาล',desc:'โจมตี ×6 + พิษ+เผา+DEF debuff ×3 พร้อมกัน 5 ตา',cooldown:12,tier:4}},
    // ── Row 4 — T4 branch B (นักบวชสวรรค์) ──
    {id:'m_B4_hp',  name:'+80 HP',       icon:'❤', type:'stat',  row:4,col:1, requires:'m_B_holy',  branch:'B', stat:{hp:80}},
    {id:'m_B4_exp', name:'+30% EXP',     icon:'✨', type:'stat',  row:4,col:3, requires:'m_B_exp4',  branch:'B', stat:{expBonus:0.3}},
    {id:'m_B4_sk',  name:'ฝนแสงสวรรค์', icon:'🌟', type:'skill', row:4,col:2, requires:'m_B_holy',  branch:'B',
     skill:{id:'heaven_rain',name:'ฝนแสงสวรรค์',desc:'โจมตี 6 ลูก ×1.5 + ฟื้น 8% HP/ลูก + ฟื้น HP ทุกตา 5 ตา',cooldown:12,tier:4}},
    // ── Row 5-6 — IDLE nodes ──
    {id:'m_spd1',  name:'-5% ช้า',   icon:'⚡', type:'stat', row:5,col:0, requires:'m_atk1',  stat:{speedBonus:0.05}},
    {id:'m_spd2',  name:'-8% ช้า',   icon:'⚡', type:'stat', row:5,col:1, requires:'m_spd1',  stat:{speedBonus:0.08}},
    {id:'m_spd3',  name:'-12% ช้า',  icon:'⚡', type:'stat', row:5,col:2, requires:'m_spd2',  stat:{speedBonus:0.12}},
    {id:'m_hp5',   name:'+100 HP',    icon:'❤', type:'stat', row:5,col:3, requires:'m_hp1',   stat:{hp:100}},
    {id:'m_atk5',  name:'+12 ATK',   icon:'🔮', type:'stat', row:5,col:4, requires:'m_atk2',  stat:{atk:12}},
    {id:'m_drop1', name:'+5% Drop',  icon:'💎', type:'stat', row:5,col:5, requires:'m_atk1',  stat:{dropBonus:0.05}},
    {id:'m_spd4',  name:'-15% ช้า',  icon:'⚡', type:'stat', row:6,col:0, requires:'m_spd3',  stat:{speedBonus:0.15}},
    {id:'m_hp6',   name:'+200 HP',    icon:'❤', type:'stat', row:6,col:2, requires:'m_hp5',   stat:{hp:200}},
    {id:'m_atk6',  name:'+20 ATK',   icon:'🔮', type:'stat', row:6,col:3, requires:'m_atk5',  stat:{atk:20}},
    {id:'m_drop2', name:'+10% Drop', icon:'💎', type:'stat', row:6,col:5, requires:'m_drop1', stat:{dropBonus:0.10}},
  ],

  // ══════════════════════════════════════════════════════════
  // ROGUE — โจร/นักฆ่า
  // T1: แทงเร็ว | T2: โจมตีลับ | T3A: เงา | T3B: โจรสลัด | T4A: ราชาเงา | T4B: จักรพรรดิ
  // ══════════════════════════════════════════════════════════
  rogue:[
    // ── Row 0 — T1 ──
    {id:'r_crit1', name:'+5% Crit', icon:'💥', type:'stat',  row:0,col:1, requires:null, stat:{crit:0.05}},
    {id:'r_atk1',  name:'+3 ATK',   icon:'🗡', type:'stat',  row:0,col:3, requires:null, stat:{atk:3}},
    {id:'r_t1sk',  name:'แทงเร็ว',  icon:'🗡', type:'skill', row:0,col:2, requires:null,
     skill:{id:'quick_stab',name:'แทงเร็ว',desc:'โจมตี 2 ครั้งเร็ว ×1.2 แต่ละครั้ง + โอกาส crit +20%',cooldown:3,tier:1}},
    // ── Row 1 — T2 ──
    {id:'r_gold1', name:'+10% Gold', icon:'💰', type:'stat',  row:1,col:1, requires:'r_crit1', stat:{goldBonus:0.1}},
    {id:'r_atk2',  name:'+5 ATK',    icon:'🗡', type:'stat',  row:1,col:3, requires:'r_atk1',  stat:{atk:5}},
    {id:'r_t2sk2', name:'ระเบิดควัน',icon:'💨', type:'skill', row:1,col:4, requires:'r_t2sk',
     skill:{id:'smoke_bomb',name:'ระเบิดควัน',desc:'หลบการโจมตี 2 ตา + การโจมตี 2 ครั้งถัดไป crit แน่นอน',cooldown:7,tier:2}},
    {id:'r_t2sk',  name:'เงามรณะ',  icon:'☠', type:'skill', row:1,col:2, requires:'r_t1sk',
     skill:{id:'death_mark',name:'เงามรณะ',desc:'ติดตรา: ครั้งถัดไปที่โจมตีทำ ×4 ดาเมจ (stack 2 ตา)',cooldown:5,tier:2}},
    // ── Row 2 — T3 shared ──
    {id:'r_crit2', name:'+8% Crit',  icon:'💥', type:'stat',  row:2,col:1, requires:'r_gold1', stat:{crit:0.08}},
    {id:'r_atk3',  name:'+8 ATK',    icon:'🗡', type:'stat',  row:2,col:3, requires:'r_atk2',  stat:{atk:8}},
    {id:'r_stab',  name:'แทงสังหาร',icon:'🔪', type:'skill', row:2,col:2, requires:'r_t2sk',
     skill:{id:'backstab',name:'แทงสังหาร',desc:'โจมตี ×3.5 (crit อัตโนมัติ ×7) + ขโมยทอง 5-20',cooldown:5,tier:3}},
    // ── Row 3 — branch A (เงา) ──
    {id:'r_A_crit3', name:'+12% Crit', icon:'💥', type:'stat',  row:3,col:1, requires:'r_crit2', branch:'A', stat:{crit:0.12}},
    {id:'r_A_atk4',  name:'+12 ATK',   icon:'🗡', type:'stat',  row:3,col:3, requires:'r_atk3',  branch:'A', stat:{atk:12}},
    {id:'r_A_shadow',name:'ก้าวเงา',   icon:'🌑', type:'skill', row:3,col:2, requires:'r_stab',  branch:'A',
     skill:{id:'shadow_step',name:'ก้าวเงา',desc:'หลบดาเมจ 100% 1 ตา + โจมตีทันที ×3 + crit ทุกตาใน 2 ตา',cooldown:7,tier:3}},
    // ── Row 3 — branch B (โจรสลัด) ──
    {id:'r_B_gold2', name:'+20% Gold', icon:'💰', type:'stat',  row:3,col:1, requires:'r_gold1', branch:'B', stat:{goldBonus:0.2}},
    {id:'r_B_crit3', name:'+8% Crit',  icon:'💥', type:'stat',  row:3,col:3, requires:'r_crit2', branch:'B', stat:{crit:0.08}},
    {id:'r_B_loot',  name:'ปล้นสะดม', icon:'💰', type:'skill', row:3,col:2, requires:'r_stab',  branch:'B',
     skill:{id:'plunder',name:'ปล้นสะดม',desc:'โจมตี ×2.5 + ได้ทอง ×3 จากมอน + ดรอปเพิ่ม 1 ตา',cooldown:5,tier:3}},
    // ── Row 4 — T4 branch A (ราชาเงามืด) ──
    {id:'r_A4_crit', name:'+18% Crit', icon:'👑', type:'stat',  row:4,col:1, requires:'r_A_shadow', branch:'A', stat:{crit:0.18}},
    {id:'r_A4_atk',  name:'+20 ATK',   icon:'🗡', type:'stat',  row:4,col:3, requires:'r_A_atk4',   branch:'A', stat:{atk:20}},
    {id:'r_A4_sk',   name:'มรณะจาก เงา',icon:'👑', type:'skill', row:4,col:2, requires:'r_A_shadow', branch:'A',
     skill:{id:'shadow_execute',name:'จ้องมรณะ',desc:'โจมตี ×8 crit อัตโนมัติ + ถ้า HP ศัตรู <30% สังหารทันที',cooldown:12,tier:4}},
    // ── Row 4 — T4 branch B (จักรพรรดิโจร) ──
    {id:'r_B4_gold', name:'+30% Gold', icon:'💰', type:'stat',  row:4,col:1, requires:'r_B_loot',   branch:'B', stat:{goldBonus:0.3}},
    {id:'r_B4_crit', name:'+15% Crit', icon:'💥', type:'stat',  row:4,col:3, requires:'r_B_crit3',  branch:'B', stat:{crit:0.15}},
    {id:'r_B4_sk',   name:'ปล้นจักรวรรดิ',icon:'💰', type:'skill', row:4,col:2, requires:'r_B_loot', branch:'B',
     skill:{id:'empire_plunder',name:'ปล้นจักรวรรดิ',desc:'โจมตี 5 ครั้ง ×1.8 + ทองสูงสุดจากมอน + droprate ×3 (ตาต่อไป)',cooldown:10,tier:4}},
    // ── Row 5-6 — IDLE nodes ──
    {id:'r_spd1',  name:'-8% ช้า',   icon:'⚡', type:'stat', row:5,col:0, requires:'r_atk1',  stat:{speedBonus:0.08}},
    {id:'r_spd2',  name:'-10% ช้า',  icon:'⚡', type:'stat', row:5,col:1, requires:'r_spd1',  stat:{speedBonus:0.10}},
    {id:'r_spd3',  name:'-15% ช้า',  icon:'⚡', type:'stat', row:5,col:2, requires:'r_spd2',  stat:{speedBonus:0.15}},
    {id:'r_hp5',   name:'+80 HP',     icon:'❤', type:'stat', row:5,col:3, requires:'r_crit1', stat:{hp:80}},
    {id:'r_atk5',  name:'+10 ATK',   icon:'🗡', type:'stat', row:5,col:4, requires:'r_atk2',  stat:{atk:10}},
    {id:'r_drop1', name:'+8% Drop',  icon:'💎', type:'stat', row:5,col:5, requires:'r_atk1',  stat:{dropBonus:0.08}},
    {id:'r_spd4',  name:'-20% ช้า',  icon:'⚡', type:'stat', row:6,col:0, requires:'r_spd3',  stat:{speedBonus:0.20}},
    {id:'r_hp6',   name:'+150 HP',    icon:'❤', type:'stat', row:6,col:2, requires:'r_hp5',   stat:{hp:150}},
    {id:'r_atk6',  name:'+18 ATK',   icon:'🗡', type:'stat', row:6,col:3, requires:'r_atk5',  stat:{atk:18}},
    {id:'r_drop2', name:'+12% Drop', icon:'💎', type:'stat', row:6,col:5, requires:'r_drop1', stat:{dropBonus:0.12}},
  ],

  // ══════════════════════════════════════════════════════════
  // ARCHER — นักธนู
  // T1: ยิงธรรมดา | T2: ยิงสาม | T3A: ป่า | T3B: ลม | T4A: จักรวาล | T4B: สายฟ้า
  // ══════════════════════════════════════════════════════════
  archer:[
    // ── Row 0 — T1 ──
    {id:'a_atk1',   name:'+3 ATK',      icon:'🏹', type:'stat',  row:0,col:1, requires:null, stat:{atk:3}},
    {id:'a_str1',   name:'+10% Streak', icon:'🔥', type:'stat',  row:0,col:3, requires:null, stat:{streakBonus:0.1}},
    {id:'a_t1sk',   name:'ยิงแม่น',     icon:'🎯', type:'skill', row:0,col:2, requires:null,
     skill:{id:'precise_shot',name:'ยิงแม่น',desc:'โจมตี ×2 ทะลุ DEF 50% + โอกาส crit ×2 ครั้งนี้',cooldown:4,tier:1}},
    // ── Row 1 — T2 ──
    {id:'a_atk2',   name:'+6 ATK',      icon:'🏹', type:'stat',  row:1,col:1, requires:'a_atk1', stat:{atk:6}},
    {id:'a_str2',   name:'+20% Streak', icon:'🔥', type:'stat',  row:1,col:3, requires:'a_str1',  stat:{streakBonus:0.2}},
    {id:'a_t2sk2',  name:'ตาอินทรี',   icon:'🦅', type:'skill', row:1,col:4, requires:'a_t2sk',
     skill:{id:'eagle_eye',name:'ตาอินทรี',desc:'ทะลุ DEF 100% + ไม่พลาดเป้า + crit +30% เป็นเวลา 4 ตา',cooldown:7,tier:2}},
    {id:'a_t2sk',   name:'ยิงสามลูก',  icon:'🏹', type:'skill', row:1,col:2, requires:'a_t1sk',
     skill:{id:'triple_shot',name:'ยิงสามลูก',desc:'ยิง 3 ลูกพร้อมกัน ×1.2 แต่ละลูก + ลูกกลาง crit เสมอ',cooldown:5,tier:2}},
    // ── Row 2 — T3 shared ──
    {id:'a_atk3',   name:'+9 ATK',      icon:'🏹', type:'stat',  row:2,col:1, requires:'a_atk2', stat:{atk:9}},
    {id:'a_crit1',  name:'+5% Crit',    icon:'💥', type:'stat',  row:2,col:3, requires:'a_str2',  stat:{crit:0.05}},
    {id:'a_arrow',  name:'ฝนลูกธนู',   icon:'🌧', type:'skill', row:2,col:2, requires:'a_t2sk',
     skill:{id:'arrow_rain',name:'ฝนลูกธนู',desc:'ยิง 5 ลูก ×1.2 แต่ละลูก + DoT 3% HP ต่อตา 3 ตา',cooldown:7,tier:3}},
    // ── Row 3 — branch A (ป่า) ──
    {id:'a_A_atk4', name:'+12 ATK',     icon:'🌿', type:'stat',  row:3,col:1, requires:'a_atk3',  branch:'A', stat:{atk:12}},
    {id:'a_A_str4', name:'+40% Streak', icon:'🔥', type:'stat',  row:3,col:3, requires:'a_str2',   branch:'A', stat:{streakBonus:0.4}},
    {id:'a_A_hunt', name:'ตราล่า',      icon:'🦅', type:'skill', row:3,col:2, requires:'a_arrow',  branch:'A',
     skill:{id:'hunters_mark',name:'ตราล่า',desc:'ดาเมจ +120% ทุกโจมตี 5 ตา + ลูกธนูทุกครั้งทะลุ DEF ทั้งหมด',cooldown:8,tier:3}},
    // ── Row 3 — branch B (ลม) ──
    {id:'a_B_crit2', name:'+12% Crit',  icon:'💥', type:'stat',  row:3,col:1, requires:'a_crit1',  branch:'B', stat:{crit:0.12}},
    {id:'a_B_atk4',  name:'+15 ATK',    icon:'🏹', type:'stat',  row:3,col:3, requires:'a_atk3',   branch:'B', stat:{atk:15}},
    {id:'a_B_wind',  name:'ลูกธนูลม',  icon:'🌪️', type:'skill', row:3,col:2, requires:'a_arrow',  branch:'B',
     skill:{id:'wind_shot',name:'ลูกธนูลม',desc:'ดาเมจ ×4 ไม่มีทางพลาด + ถ้า crit ยิงซ้ำอีก 1 ลูก ×2',cooldown:6,tier:3}},
    // ── Row 4 — T4 branch A (จอมล่าแห่งจักรวาล) ──
    {id:'a_A4_atk', name:'+20 ATK',       icon:'🌠', type:'stat',  row:4,col:1, requires:'a_A_hunt', branch:'A', stat:{atk:20}},
    {id:'a_A4_str', name:'+60% Streak',   icon:'🔥', type:'stat',  row:4,col:3, requires:'a_A_str4', branch:'A', stat:{streakBonus:0.6}},
    {id:'a_A4_sk',  name:'ดาวตก',         icon:'🌠', type:'skill', row:4,col:2, requires:'a_A_hunt', branch:'A',
     skill:{id:'meteor_arrow',name:'ดาวตก',desc:'ยิงลูกธนูที่ชาร์จแสงจักรวาล ×7 + ติด DoT 15%HP/ตา 5 ตา',cooldown:12,tier:4}},
    // ── Row 4 — T4 branch B (เทพสายลม) ──
    {id:'a_B4_crit', name:'+20% Crit',    icon:'⚡', type:'stat',  row:4,col:1, requires:'a_B_wind',  branch:'B', stat:{crit:0.2}},
    {id:'a_B4_atk',  name:'+25 ATK',      icon:'🏹', type:'stat',  row:4,col:3, requires:'a_B_atk4',  branch:'B', stat:{atk:25}},
    {id:'a_B4_sk',   name:'พายุสายฟ้า',  icon:'⚡', type:'skill', row:4,col:2, requires:'a_B_wind',  branch:'B',
     skill:{id:'thunder_storm',name:'พายุสายฟ้า',desc:'ยิง 8 ลูกสายฟ้า ×1.5 ทุกลูก crit อัตโนมัติ + stun 2 ตา',cooldown:12,tier:4}},
    // ── Row 5-6 — IDLE nodes ──
    {id:'a_spd1',  name:'-8% ช้า',   icon:'⚡', type:'stat', row:5,col:0, requires:'a_atk1',  stat:{speedBonus:0.08}},
    {id:'a_spd2',  name:'-10% ช้า',  icon:'⚡', type:'stat', row:5,col:1, requires:'a_spd1',  stat:{speedBonus:0.10}},
    {id:'a_spd3',  name:'-15% ช้า',  icon:'⚡', type:'stat', row:5,col:2, requires:'a_spd2',  stat:{speedBonus:0.15}},
    {id:'a_hp5',   name:'+80 HP',     icon:'❤', type:'stat', row:5,col:3, requires:'a_atk1',  stat:{hp:80}},
    {id:'a_atk5',  name:'+12 ATK',   icon:'🏹', type:'stat', row:5,col:4, requires:'a_atk3',  stat:{atk:12}},
    {id:'a_drop1', name:'+6% Drop',  icon:'💎', type:'stat', row:5,col:5, requires:'a_atk1',  stat:{dropBonus:0.06}},
    {id:'a_spd4',  name:'-20% ช้า',  icon:'⚡', type:'stat', row:6,col:0, requires:'a_spd3',  stat:{speedBonus:0.20}},
    {id:'a_hp6',   name:'+160 HP',    icon:'❤', type:'stat', row:6,col:2, requires:'a_hp5',   stat:{hp:160}},
    {id:'a_atk6',  name:'+20 ATK',   icon:'🏹', type:'stat', row:6,col:3, requires:'a_atk5',  stat:{atk:20}},
    {id:'a_drop2', name:'+12% Drop', icon:'💎', type:'stat', row:6,col:5, requires:'a_drop1', stat:{dropBonus:0.12}},
  ],

  // ══════════════════════════════════════════════════════════
  // PALADIN — อัศวินศักดิ์สิทธิ์
  // T1: ตีศักดิ์สิทธิ์ | T2: โล่แสง | T3A: นักบุญ | T3B: พิฆาต | T4A: เทพแสง | T4B: ราชันมาร
  // ══════════════════════════════════════════════════════════
  paladin:[
    // ── Row 0 — T1 ──
    {id:'p_hp1',   name:'+25 HP',    icon:'❤', type:'stat',  row:0,col:1, requires:null, stat:{hp:25}},
    {id:'p_def1',  name:'+4 DEF',    icon:'🛡', type:'stat',  row:0,col:3, requires:null, stat:{def:4}},
    {id:'p_t1sk',  name:'ตีศักดิ์สิทธิ์',icon:'✨', type:'skill', row:0,col:2, requires:null,
     skill:{id:'holy_strike_t1',name:'ตีศักดิ์สิทธิ์',desc:'โจมตี ×1.8 + ฟื้น HP 10%',cooldown:3,tier:1}},
    // ── Row 1 — T2 ──
    {id:'p_hp2',   name:'+50 HP',    icon:'❤', type:'stat',  row:1,col:1, requires:'p_hp1',  stat:{hp:50}},
    {id:'p_def2',  name:'+7 DEF',    icon:'🛡', type:'stat',  row:1,col:3, requires:'p_def1', stat:{def:7}},
    {id:'p_t2sk2', name:'พื้นศักดิ์สิทธิ์',icon:'⛪', type:'skill', row:1,col:4, requires:'p_t2sk',
     skill:{id:'consecrate',name:'พื้นศักดิ์สิทธิ์',desc:'ฟื้น 10% HP/ตา + สะท้อนดาเมจ 30% เป็นเวลา 4 ตา',cooldown:8,tier:2}},
    {id:'p_t2sk',  name:'โล่แสง',   icon:'🌟', type:'skill', row:1,col:2, requires:'p_t1sk',
     skill:{id:'light_shield',name:'โล่แสง',desc:'ลด DMG 40% 3 ตา + ฟื้น HP 5% ต่อตา ตลอด',cooldown:6,tier:2}},
    // ── Row 2 — T3 shared ──
    {id:'p_regen1',name:'+5% Regen', icon:'💚', type:'stat',  row:2,col:1, requires:'p_hp2',  stat:{regenBonus:0.05}},
    {id:'p_def3',  name:'+10 DEF',   icon:'🛡', type:'stat',  row:2,col:3, requires:'p_def2', stat:{def:10}},
    {id:'p_heal',  name:'รักษาศักดิ์สิทธิ์',icon:'💊', type:'skill', row:2,col:2, requires:'p_t2sk',
     skill:{id:'divine_heal',name:'รักษาศักดิ์สิทธิ์',desc:'ฟื้น HP 50% ทันที + ล้าง debuff ทั้งหมด',cooldown:7,tier:3}},
    // ── Row 3 — branch A (นักบุญ) ──
    {id:'p_A_regen2',name:'+10% Regen',icon:'💚',type:'stat',  row:3,col:1, requires:'p_regen1', branch:'A', stat:{regenBonus:0.1}},
    {id:'p_A_hp4',   name:'+100 HP',   icon:'❤',type:'stat',  row:3,col:3, requires:'p_hp2',    branch:'A', stat:{hp:100}},
    {id:'p_A_aura',  name:'ออร่าศักดิ์สิทธิ์',icon:'🌈',type:'skill',row:3,col:2, requires:'p_heal', branch:'A',
     skill:{id:'holy_aura',name:'ออร่าศักดิ์สิทธิ์',desc:'ฟื้น 20% HP ทุกตา 5 ตา + ลด DMG ที่รับ 25% ตลอดช่วง',cooldown:10,tier:3}},
    // ── Row 3 — branch B (พิฆาต) ──
    {id:'p_B_atk1',  name:'+10 ATK', icon:'⚔', type:'stat',  row:3,col:1, requires:'p_def3',  branch:'B', stat:{atk:10}},
    {id:'p_B_crit1', name:'+8% Crit',icon:'💥', type:'stat',  row:3,col:3, requires:'p_def2',  branch:'B', stat:{crit:0.08}},
    {id:'p_B_smite', name:'สมิตศักดิ์สิทธิ์',icon:'⚡',type:'skill',row:3,col:2, requires:'p_heal', branch:'B',
     skill:{id:'holy_smite',name:'สมิตศักดิ์สิทธิ์',desc:'ดาเมจ ×4 ปกติ (บอส ×8) + ฟื้น HP 15%',cooldown:7,tier:3}},
    // ── Row 4 — T4 branch A (เทพแห่งแสง) ──
    {id:'p_A4_regen',name:'+15% Regen',icon:'💚',type:'stat',  row:4,col:1, requires:'p_A_aura',  branch:'A', stat:{regenBonus:0.15}},
    {id:'p_A4_hp',   name:'+150 HP',   icon:'❤',type:'stat',  row:4,col:3, requires:'p_A_hp4',   branch:'A', stat:{hp:150}},
    {id:'p_A4_sk',   name:'พระประภา',  icon:'☀️',type:'skill', row:4,col:2, requires:'p_A_aura',  branch:'A',
     skill:{id:'divine_radiance',name:'พระประภา',desc:'ฟื้น HP เต็ม + เกราะแสง -70% DMG ใน 4 ตา + โจมตีตอบ ×2 ทุกตา',cooldown:14,tier:4}},
    // ── Row 4 — T4 branch B (ราชันพิฆาต) ──
    {id:'p_B4_atk',  name:'+18 ATK',   icon:'👑', type:'stat',  row:4,col:1, requires:'p_B_smite', branch:'B', stat:{atk:18}},
    {id:'p_B4_crit', name:'+15% Crit', icon:'💥', type:'stat',  row:4,col:3, requires:'p_B_crit1', branch:'B', stat:{crit:0.15}},
    {id:'p_B4_sk',   name:'พิพากษา',   icon:'👑', type:'skill', row:4,col:2, requires:'p_B_smite', branch:'B',
     skill:{id:'final_judgment',name:'พิพากษา',desc:'ดาเมจ = 35% HP max ศัตรู + ถ้าบอส ×2 + crit อัตโนมัติ',cooldown:12,tier:4}},
    // ── Row 5-6 — IDLE nodes ──
    {id:'p_spd1',  name:'-5% ช้า',   icon:'⚡', type:'stat', row:5,col:0, requires:'p_hp1',   stat:{speedBonus:0.05}},
    {id:'p_spd2',  name:'-8% ช้า',   icon:'⚡', type:'stat', row:5,col:1, requires:'p_spd1',  stat:{speedBonus:0.08}},
    {id:'p_spd3',  name:'-10% ช้า',  icon:'⚡', type:'stat', row:5,col:2, requires:'p_spd2',  stat:{speedBonus:0.10}},
    {id:'p_hp5',   name:'+200 HP',    icon:'❤', type:'stat', row:5,col:3, requires:'p_hp2',   stat:{hp:200}},
    {id:'p_atk5',  name:'+10 ATK',   icon:'⚔', type:'stat', row:5,col:4, requires:'p_def3',  stat:{atk:10}},
    {id:'p_drop1', name:'+5% Drop',  icon:'💎', type:'stat', row:5,col:5, requires:'p_hp1',   stat:{dropBonus:0.05}},
    {id:'p_spd4',  name:'-12% ช้า',  icon:'⚡', type:'stat', row:6,col:0, requires:'p_spd3',  stat:{speedBonus:0.12}},
    {id:'p_hp6',   name:'+300 HP',    icon:'❤', type:'stat', row:6,col:2, requires:'p_hp5',   stat:{hp:300}},
    {id:'p_atk6',  name:'+18 ATK',   icon:'⚔', type:'stat', row:6,col:3, requires:'p_atk5',  stat:{atk:18}},
    {id:'p_drop2', name:'+10% Drop', icon:'💎', type:'stat', row:6,col:5, requires:'p_drop1', stat:{dropBonus:0.10}},
  ],
};

// IDLE auto-cast table for the new C/D/S branch skills (merged into
// _IDLE_SKILL_DMG by idle.js so they auto-cast in the IDLE farm).
const INFINITY_IDLE_SKILLS = {};

// ============================================================
// SKILL TREE — สาขาใหม่ C/D/S (ปลดล็อกจาก Infinity Trial)
// สร้างอัตโนมัติให้ครบทุกคลาส: row 3 (stat, skill, stat) + row 4 (stat, skill, stat)
// requires อิงจาก node row-2 ของแต่ละคลาส (เหมือนสาย A/B เดิม)
// ============================================================
(function buildSecretBranchNodes() {
  // [classId, prefix, [row2-stat-req, row2-skill-req, row2-stat-req2]]
  const CLS = {
    warrior: { p:'w', req:['w_hp2','w_slam','w_atk3'] },
    mage:    { p:'m', req:['m_atk2','m_burst','m_exp3'] },
    rogue:   { p:'r', req:['r_crit2','r_stab','r_atk3'] },
    archer:  { p:'a', req:['a_atk3','a_arrow','a_crit1'] },
    paladin: { p:'p', req:['p_regen1','p_heal','p_def3'] },
  };
  // per class+branch: T3 skill + T4 skill (id,name,desc,icon, idle mult/hits)
  const SK = {
    // BALANCE: T3 effective dmg (mult×hits) ≈ 4.5(C)/5.0(D)/5.5(S);
    //          T4 effective dmg ≈ 7.5(C)/8.0(D)/9.0(S). C/D/S = สายโหด แรงกว่า A/B.
    warrior:{
      C:[['berserk_rage','คลั่งสงคราม','โจมตี ×4.5 + ดูดเลือด 10%','🪓',4.5,1],['blood_massacre','สังหารหมู่','โจมตี ×7.5 ดูดเลือด 20% เผา 3 ตา','🔥',7.5,1]],
      D:[['marshal_strike','ดาบแม่ทัพ','โจมตี ×5 ทะลุ DEF','🎖',5,1],['imperial_smash','ทุบจักรพรรดิ','โจมตี ×8 กว้าง สตัน 1 ตา','👑',8,1]],
      S:[['blood_demon_slash','ฟันเลือดอสูร','โจมตี ×5.5 ดูดเลือด 15%','🩸',5.5,1],['eternal_war','สงครามนิรันดร์','โจมตี ×9 ดูดเลือด 25%','👹',9,1]],
    },
    mage:{
      C:[['wrath_flame','เพลิงพิโรธ','โจมตี ×4.3 เผา 4 ตา','🔥',4.3,1],['apocalypse_flame','อัคนีประลัย','อุกกาบาต ×3.7×2 เผาทั้งจอ','☄️',3.7,2]],
      D:[['time_bolt','คาถากาลเวลา','โจมตี ×2.5 เกิดซ้ำ 2 ครั้ง','⏳',2.5,2],['time_collapse','กาลเวลาล่มสลาย','โจมตี ×4×2 หยุดเวลาศัตรู','🌌',4,2]],
      S:[['void_burst','ระเบิดมิติ','โจมตี ×5.5 ดูดพลัง','🕳️',5.5,1],['cosmos_devour','กลืนจักรวาล','โจมตี ×9 ทะลุทุกอย่าง','🌀',9,1]],
    },
    rogue:{
      C:[['venom_strike','พิษอสรพิษ','โจมตี ×4.3 พิษ 4 ตา','🐍',4.3,1],['death_venom','พิษมรณะ','โจมตี ×7.5 พิษหนัก ลด DEF','☠️',7.5,1]],
      D:[['thunder_dagger','กริชสายฟ้า','โจมตี ×2.5 ฟ้าผ่า 2 ครั้ง','⚡',2.5,2],['thunder_god','เทพสายฟ้า','โจมตี ×4×2 ฟ้าผ่าทั้งจอ','🌩',4,2]],
      S:[['timeless_strike','ฟันไร้กาลเวลา','โจมตี ×2.75×2 โจมตีซ้ำ','⏳',2.75,2],['shadow_emperor','จักรพรรดิเงา','โจมตี ×9 crit สูง','☠️',9,1]],
    },
    archer:{
      C:[['flame_arrow','ธนูเพลิง','โจมตี ×4.5 เผา','🔥',4.5,1],['meteor_arrow','ธนูอุกกาบาต','ฝนธนูเพลิง ×2.5×3','☄️',2.5,3]],
      D:[['shadow_arrow','ธนูเงา','โจมตี ×5 ทะลุ','🌑',5,1],['dark_volley','ห่าธนูมืด','ยิงพร้อม ×2.7×3','🌒',2.7,3]],
      S:[['soul_arrow','ธนูวิญญาณ','โจมตี ×2.75×2 ทะลุเกราะ','👁️',2.75,2],['eternal_hunt','ล่านิรันดร์','ยิงดาว ×3×3 ทะลุ','🌌',3,3]],
    },
    paladin:{
      C:[['crusade_strike','ฟันครูเสด','โจมตี ×4.5 + เกราะ','⚔️',4.5,1],['holy_crusade','ครูเสดศักดิ์สิทธิ์','โจมตี ×7.5 + ฟื้น HP','🛡',7.5,1]],
      D:[['judgment','พิพากษา','โจมตี ×5 ตามบาป','⚖️',5,1],['final_verdict','คำตัดสินสุดท้าย','โจมตี ×8 ลงทัณฑ์','👁',8,1]],
      S:[['undying_smite','ทัณฑ์อมตะ','โจมตี ×5.5 + เกราะหนา','⚜️',5.5,1],['eternal_light','แสงนิรันดร์','โจมตี ×9 + ฟื้นเต็ม','🕊️',9,1]],
    },
  };
  const STAT3 = { // row-3 stat values per class (mirror A/B power)
    warrior:{a:{atk:14},b:{hp:70}}, mage:{a:{atk:14},b:{expBonus:0.1}},
    rogue:{a:{crit:0.06},b:{atk:12}}, archer:{a:{atk:14},b:{crit:0.06}},
    paladin:{a:{hp:70},b:{def:10}},
  };
  const STAT4 = {
    warrior:{a:{atk:20},b:{hp:110}}, mage:{a:{atk:22},b:{expBonus:0.12}},
    rogue:{a:{crit:0.1},b:{atk:18}}, archer:{a:{atk:22},b:{crit:0.1}},
    paladin:{a:{hp:110},b:{def:15}},
  };
  const BR_ICON = { C:'🔥', D:'⚡', S:'★' };

  Object.keys(CLS).forEach(clsId => {
    const { p, req } = CLS[clsId];
    const tree = SKILL_TREES[clsId];
    if (!tree) return;
    ['C','D','S'].forEach(br => {
      const sk3 = SK[clsId][br][0], sk4 = SK[clsId][br][1];
      const s3 = STAT3[clsId], s4 = STAT4[clsId];
      // row 3 (saขา): stat | skill | stat
      tree.push({ id:`${p}_${br}_s3a`, name:_statName(s3.a), icon:'⚔', type:'stat', row:3, col:1, requires:req[0], branch:br, stat:s3.a });
      tree.push({ id:`${p}_${br}_sk3`, name:sk3[1], icon:sk3[3], type:'skill', row:3, col:2, requires:req[1], branch:br,
        skill:{ id:sk3[0], name:sk3[1], desc:sk3[2], cooldown:7, tier:3 } });
      tree.push({ id:`${p}_${br}_s3b`, name:_statName(s3.b), icon:'❤', type:'stat', row:3, col:3, requires:req[2], branch:br, stat:s3.b });
      // row 4: stat | skill | stat
      tree.push({ id:`${p}_${br}_s4a`, name:_statName(s4.a), icon:BR_ICON[br], type:'stat', row:4, col:1, requires:`${p}_${br}_sk3`, branch:br, stat:s4.a });
      tree.push({ id:`${p}_${br}_sk4`, name:sk4[1], icon:sk4[3], type:'skill', row:4, col:2, requires:`${p}_${br}_sk3`, branch:br,
        skill:{ id:sk4[0], name:sk4[1], desc:sk4[2], cooldown:10, tier:4 } });
      tree.push({ id:`${p}_${br}_s4b`, name:_statName(s4.b), icon:'❤', type:'stat', row:4, col:3, requires:`${p}_${br}_s3b`, branch:br, stat:s4.b });
      // register the new skills for IDLE auto-cast
      INFINITY_IDLE_SKILLS[sk3[0]] = { mult:sk3[4], hits:sk3[5], label:`${sk3[3]} ${sk3[1]}` };
      INFINITY_IDLE_SKILLS[sk4[0]] = { mult:sk4[4], hits:sk4[5], label:`${sk4[3]} ${sk4[1]}` };
    });
  });
  function _statName(s){
    if(!s) return '';
    if(s.hp) return `+${s.hp} HP`; if(s.atk) return `+${s.atk} ATK`;
    if(s.def) return `+${s.def} DEF`; if(s.crit) return `+${Math.round(s.crit*100)}% Crit`;
    if(s.expBonus) return `+${Math.round(s.expBonus*100)}% EXP`;
    return '+stat';
  }
})();

// ============================================================
// DAMAGE-OVER-TIME (DoT) for skills themed as พิษ/เผา ("X ตา")
// Previously these skills only dealt their direct multiplier — the
// "poison/burn for N turns" never actually happened. Tag each such skill
// with a dot spec so combat (idle/trial/dungeon) applies the DoT.
//   dot: { type:'poison'|'burn', pct:<fraction of the SKILL hit dealt per tick>,
//          ticks:<number of follow-up ticks>, defDown?:<flat DEF reduction> }
// pct is a fraction of the damage the casting hit dealt, so it scales with the
// player's power without being overpowered.
// ============================================================
const SKILL_DOT = {
  // rogue — poison line
  venom_strike: { type:'poison', pct:0.30, ticks:4 },
  death_venom:  { type:'poison', pct:0.45, ticks:4, defDown:0.25 },
  // mage — flame line
  wrath_flame:      { type:'burn', pct:0.30, ticks:4 },
  apocalypse_flame: { type:'burn', pct:0.40, ticks:4 },
  // archer — flame line
  flame_arrow:  { type:'burn', pct:0.28, ticks:3 },
  meteor_arrow: { type:'burn', pct:0.38, ticks:4 },
  // warrior secret — blood massacre burn
  blood_massacre: { type:'burn', pct:0.25, ticks:3 },
  // mage T4 nova / void curse (already strong, light DoT)
  doom_nova:  { type:'burn', pct:0.20, ticks:4 },
  void_curse: { type:'poison', pct:0.20, ticks:5, defDown:0.2 },
};
// (the dot spec is folded onto the skill defs in idle.js, after _IDLE_SKILL_DMG
//  is fully assembled — see attachSkillDots there)

// ── FIX: IDLE entry nodes (row 5) were gated behind main-tree stat nodes
// (e.g. r_spd1 required r_atk1). A player who spent points on skills could
// "have points but cant upgrade IDLE". Free up each IDLE entry node so it
// only chains within the IDLE rows (row >= 5), making them unlockable anytime.
(function freeIdleEntryNodes() {
  Object.keys(SKILL_TREES).forEach(clsId => {
    const tree = SKILL_TREES[clsId];
    const byId = Object.fromEntries(tree.map(n => [n.id, n]));
    tree.forEach(n => {
      if (n.row >= 5 && n.requires) {
        const req = byId[n.requires];
        // if it depends on a node OUTSIDE the IDLE section, drop the gate
        if (!req || req.row < 5) n.requires = null;
      }
    });
  });
})();

// ── BALANCE: scale point cost so strong upgrades slow down progression ──
// IDLE speed (the biggest power spike — it speeds up BOTH idle and battle)
// costs more each step: tier 1 = 1pt, tier 2 = 2pt, tier 3 = 3pt, tier 4 = 4pt.
// Other late IDLE stat nodes (row 6) cost 2pt. Main-tree T4 skills cost 2pt.
(function scaleNodeCosts() {
  // re-balance attack-speed: game felt too fast. Normalize every class to the
  // same gentle curve 4/6/8/10% (was up to 8/10/15/20% on rogue/archer).
  const SPEED_STEPS = [0.04, 0.06, 0.08, 0.10];
  Object.keys(SKILL_TREES).forEach(clsId => {
    const tree = SKILL_TREES[clsId];
    // order speed nodes by their speedBonus value = the upgrade step
    const speedNodes = tree
      .filter(n => n.stat && n.stat.speedBonus)
      .sort((a, b) => a.stat.speedBonus - b.stat.speedBonus);
    speedNodes.forEach((n, i) => {
      n.cost = i + 1;                                  // 1,2,3,4 points per step
      const v = SPEED_STEPS[i] != null ? SPEED_STEPS[i] : SPEED_STEPS[SPEED_STEPS.length - 1];
      n.stat.speedBonus = v;                           // re-balanced value
      n.name = `-${Math.round(v * 100)}% ช้า`;          // keep label in sync
    });

    tree.forEach(n => {
      // top-tier IDLE stat nodes (row 6) that aren't speed → cost 2
      if (n.row >= 6 && !(n.stat && n.stat.speedBonus) && !n.cost) n.cost = 2;
      // main-tree Tier-4 active skills → cost 2 (powerful)
      if (n.type === 'skill' && n.row === 4 && !n.cost) n.cost = 2;
    });
  });
})();

// ============================================================
// IDLE SKILL TREE — extra row-7 nodes (farm & offline rewards)
// 8 new nodes per class, each a 3-step scaling chain (cost 1→2→3).
// Uses the IDLE point pool (row >= 5). Effects read in offline.js / idle.js.
// ============================================================
(function buildIdleRewardNodes() {
  // [statKey, label, icon, perStep value]  — 3 steps each, cost = step (1,2,3)
  const CHAINS = [
    ['idleExpBonus',  'IDLE EXP',     '⭐', [0.05, 0.08, 0.12]],
    ['idleGoldBonus', 'IDLE ทอง',    '💰', [0.05, 0.08, 0.12]],
    ['offlineCapBonus','เวลาออฟไลน์','⏰', [1, 1, 1]],          // +1 hr per step (max +3hr)
    ['offlineEffBonus','ออฟไลน์ %',  '🌙', [0.10, 0.10, 0.15]], // +offline efficiency
  ];
  const PREFIX = { warrior:'w', mage:'m', rogue:'r', archer:'a', paladin:'p' };
  Object.keys(PREFIX).forEach(clsId => {
    const tree = SKILL_TREES[clsId]; if (!tree) return;
    const p = PREFIX[clsId];
    CHAINS.forEach((chain, ci) => {
      const [statKey, label, icon, steps] = chain;
      let prevId = null;
      steps.forEach((val, si) => {
        const id = `${p}_idle7_${statKey}_${si+1}`;
        const node = {
          id, name: `${label} +${statKey.includes('Bonus') && val < 1 ? Math.round(val*100)+'%' : val+(statKey==='offlineCapBonus'?' ชม.':'')}`,
          icon, type:'stat', row:7, col:ci, cost: si+1,
          requires: prevId, stat: { [statKey]: val },
        };
        tree.push(node);
        prevId = id;
      });
    });
  });
})();
