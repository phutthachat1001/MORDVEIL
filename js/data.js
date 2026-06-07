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
  {id:'paladin',name:'อัศวินศักดิ์สิทธิ์',icon:'✨',color:'#4488ff',
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
    {name:'ซอมบี้เน่า',sprite:'🧟',tier:1,isBoss:false},
    {name:'ซอมบี้เดิน',sprite:'🤢',tier:2,isBoss:false},
    {name:'ซอมบี้นักรบ',sprite:'⚔️',tier:3,isBoss:false},
    {name:'ซอมบี้แม่มด',sprite:'💀',tier:4,isBoss:false},
    {name:'ซอมบี้ยักษ์',sprite:'🦴',tier:5,isBoss:false},
    {name:'จอมซอมบี้',sprite:'👻',tier:6,isBoss:true}
   ]},
  {id:3,name:'ถ้ำมังกร',emoji:'🐉',reqLevel:25,
   monsters:[
    {name:'มังกรน้ำแข็ง',sprite:'❄️',tier:1,isBoss:false},
    {name:'มังกรไฟ',sprite:'🔥',tier:2,isBoss:false},
    {name:'มังกรพิษ',sprite:'☠️',tier:3,isBoss:false},
    {name:'มังกรสายฟ้า',sprite:'⚡',tier:4,isBoss:false},
    {name:'มังกรมืด',sprite:'🌑',tier:5,isBoss:false},
    {name:'มังกรราชัน',sprite:'🐲',tier:6,isBoss:true}
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
  {id:'w08',name:'ธนูล่าสัตว์',rarity:'uncommon',atk:7,effect:'crit+8%',icon:'🏹'},
  {id:'w09',name:'ไม้เท้าเวทมนตร์',rarity:'uncommon',atk:6,effect:'EXP+5%',icon:'🪄'},
  {id:'w10',name:'กริชสองคม',rarity:'uncommon',atk:9,effect:'crit+10%',icon:'🗡️'},
  // RARE (blue)
  {id:'w11',name:'ดาบมังกรน้ำแข็ง',rarity:'rare',atk:20,effect:'ชะลอ-10% ATK ศัตรู',icon:'❄️'},
  {id:'w12',name:'คทาสายฟ้า',rarity:'rare',atk:18,effect:'EXP+10%',icon:'⚡'},
  {id:'w13',name:'โล่สายลม',rarity:'rare',atk:12,effect:'DEF+5',icon:'🛡️'},
  {id:'w14',name:'ธนูเพลิง',rarity:'rare',atk:22,effect:'เผา 5%/เทิร์น',icon:'🔥'},
  {id:'w15',name:'กระบี่อสูร',rarity:'rare',atk:25,effect:'ดูดเลือด 5%',icon:'🗡️'},
  {id:'w16',name:'ขวานสายเลือด',rarity:'rare',atk:28,effect:'ดูดเลือด 8%',icon:'🪓'},
  {id:'w17',name:'ไม้เท้าเงา',rarity:'rare',atk:16,effect:'EXP+15%',icon:'🌑'},
  // EPIC (purple)
  {id:'w18',name:'ดาบวิญญาณมืด',rarity:'epic',atk:45,effect:'crit×2 ทุก 3 เทิร์น',icon:'💜'},
  {id:'w19',name:'คทาพลังจักรวาล',rarity:'epic',atk:40,effect:'EXP+20%',icon:'🔮'},
  {id:'w20',name:'ธนูนักล่าปีศาจ',rarity:'epic',atk:42,effect:'ไม่พลาด+20%',icon:'🏹'},
  {id:'w21',name:'กระบี่สายพิษ',rarity:'epic',atk:38,effect:'พิษ 10%/เทิร์น',icon:'☠️'},
  {id:'w22',name:'ขวานยักษ์โบราณ',rarity:'epic',atk:55,effect:'ดาเมจ+30% vs บอส',icon:'🪓'},
  {id:'w23',name:'โล่อัศวินศักดิ์สิทธิ์',rarity:'epic',atk:30,effect:'DEF+15 ดูดเลือด 5%',icon:'✨'},
  {id:'w24',name:'หอกพิฆาตมังกร',rarity:'epic',atk:50,effect:'ดาเมจ×2 vs มังกร',icon:'🐉'},
  // LEGENDARY (orange)
  {id:'w25',name:'ดาบสยบสวรรค์',rarity:'legend',atk:80,effect:'crit×3 ดูดเลือด 15%',icon:'⚔️'},
  {id:'w26',name:'คทาผู้พิพากษาโลก',rarity:'legend',atk:75,effect:'EXP+30% ดาเมจทะลุ DEF',icon:'🔮'},
  {id:'w27',name:'ธนูแห่งรุ่งอรุณ',rarity:'legend',atk:70,effect:'ยิง 2 ครั้ง/เทิร์น',icon:'🌅'},
  {id:'w28',name:'กระบี่อมตะ',rarity:'legend',atk:85,effect:'ดูดเลือด 20% HP+50',icon:'♾️'},
  {id:'w29',name:'ขวานปราบอสูร',rarity:'legend',atk:90,effect:'ดาเมจ×2 ทุกครั้ง vs บอส',icon:'💥'},
  {id:'w30',name:'หอกเจาะนิรันดร์',rarity:'legend',atk:78,effect:'ทะลุ DEF 100% DEF+10',icon:'🌟'},
  // ANCIENT (red)
  {id:'w31',name:'ดาบพิฆาตเทพ',rarity:'ancient',atk:150,effect:'crit×5 ดูดเลือด 25% EXP+50%',icon:'🌈'},
  {id:'w32',name:'คทาแห่งจักรวาล',rarity:'ancient',atk:130,effect:'EXP+50% ดาเมจทะลุทุกอย่าง',icon:'🌌'}
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
  {id:'g07',name:'ถุงมือมีดคม',slot:'gloves',rarity:'uncommon',atk:8,crit:8,icon:'🧤',requiredClass:'rogue'},
  {id:'g08',name:'ถุงมือยิงธนู',slot:'gloves',rarity:'uncommon',atk:7,crit:6,icon:'🧤',requiredClass:'archer'},
  {id:'g09',name:'ถุงมือเวทย์',slot:'gloves',rarity:'uncommon',atk:4,crit:4,effect:'EXP+5%',icon:'🧤',requiredClass:'mage'},
  {id:'g10',name:'ถุงมือเกราะเหล็ก',slot:'gloves',rarity:'uncommon',atk:7,crit:2,icon:'🧤',requiredClass:'warrior'},
  // RARE
  {id:'g11',name:'ถุงมือมังกรดำ',slot:'gloves',rarity:'rare',atk:14,crit:10,icon:'🧤',requiredClass:null},
  {id:'g12',name:'ถุงมือนักฆ่าเงา',slot:'gloves',rarity:'rare',atk:16,crit:15,icon:'🧤',requiredClass:'rogue'},
  {id:'g13',name:'ถุงมือแสงสวรรค์',slot:'gloves',rarity:'rare',atk:10,crit:8,effect:'ฟื้น HP+5/เทิร์น',icon:'🧤',requiredClass:'paladin'},
  {id:'g14',name:'ถุงมือธนูเพลิง',slot:'gloves',rarity:'rare',atk:15,crit:12,icon:'🧤',requiredClass:'archer'},
  {id:'g15',name:'ถุงมือเวทย์มืด',slot:'gloves',rarity:'rare',atk:10,crit:10,effect:'EXP+10%',icon:'🧤',requiredClass:'mage'},
  // EPIC
  {id:'g16',name:'ถุงมือหายนะ',slot:'gloves',rarity:'epic',atk:26,crit:18,icon:'🧤',requiredClass:'warrior'},
  {id:'g17',name:'ถุงมือมืดสนิท',slot:'gloves',rarity:'epic',atk:28,crit:25,icon:'🧤',requiredClass:'rogue'},
  {id:'g18',name:'ถุงมือเทพ',slot:'gloves',rarity:'epic',atk:18,crit:15,effect:'EXP+15%',icon:'🧤',requiredClass:'mage'},
  {id:'g19',name:'ถุงมือจอมล่า',slot:'gloves',rarity:'epic',atk:25,crit:22,icon:'🧤',requiredClass:'archer'},
  {id:'g20',name:'ถุงมือแสงจักรวาล',slot:'gloves',rarity:'epic',atk:20,crit:15,effect:'ฟื้น HP+10/เทิร์น',icon:'🧤',requiredClass:'paladin'},
  // LEGENDARY
  {id:'g21',name:'ถุงมือสยบสวรรค์',slot:'gloves',rarity:'legend',atk:42,crit:30,icon:'🧤',requiredClass:'warrior'},
  {id:'g22',name:'ถุงมือราชาเงา',slot:'gloves',rarity:'legend',atk:45,crit:40,icon:'🧤',requiredClass:'rogue'},
  {id:'g23',name:'ถุงมือจักรวาลเวทย์',slot:'gloves',rarity:'legend',atk:32,crit:28,effect:'EXP+25%',icon:'🧤',requiredClass:'mage'},
  {id:'g24',name:'ถุงมือจอมล่าจักรวาล',slot:'gloves',rarity:'legend',atk:40,crit:35,icon:'🧤',requiredClass:'archer'},
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
  // COMMON
  {id:'b01',name:'รองเท้าฟาง',slot:'boots',rarity:'common',speed:5,icon:'👢',requiredClass:null},
  {id:'b02',name:'รองเท้าหนังเก่า',slot:'boots',rarity:'common',speed:8,icon:'👢',requiredClass:null},
  {id:'b03',name:'รองเท้าไม้',slot:'boots',rarity:'common',speed:4,icon:'👢',requiredClass:null},
  {id:'b04',name:'รองเท้าชาวนา',slot:'boots',rarity:'common',speed:6,icon:'👢',requiredClass:null},
  {id:'b05',name:'รองเท้าผ้าหยาบ',slot:'boots',rarity:'common',speed:7,icon:'👢',requiredClass:null},
  // UNCOMMON
  {id:'b06',name:'รองเท้าบูทหนัง',slot:'boots',rarity:'uncommon',speed:15,icon:'👢',requiredClass:null},
  {id:'b07',name:'รองเท้าป่า',slot:'boots',rarity:'uncommon',speed:18,icon:'👢',requiredClass:'archer'},
  {id:'b08',name:'รองเท้าเงียบเงา',slot:'boots',rarity:'uncommon',speed:20,icon:'👢',requiredClass:'rogue'},
  {id:'b09',name:'รองเท้าเวทมืด',slot:'boots',rarity:'uncommon',speed:12,effect:'EXP+5%',icon:'👢',requiredClass:'mage'},
  {id:'b10',name:'รองเท้าบูทอัศวิน',slot:'boots',rarity:'uncommon',speed:14,icon:'👢',requiredClass:'warrior'},
  // RARE
  {id:'b11',name:'รองเท้ามังกรน้ำแข็ง',slot:'boots',rarity:'rare',speed:28,icon:'👢',requiredClass:null},
  {id:'b12',name:'รองเท้าเงาพิฆาต',slot:'boots',rarity:'rare',speed:35,icon:'👢',requiredClass:'rogue'},
  {id:'b13',name:'รองเท้าเทพแสง',slot:'boots',rarity:'rare',speed:22,effect:'ฟื้น HP+5/เทิร์น',icon:'👢',requiredClass:'paladin'},
  {id:'b14',name:'รองเท้านักล่าโบราณ',slot:'boots',rarity:'rare',speed:32,icon:'👢',requiredClass:'archer'},
  {id:'b15',name:'รองเท้าเวทย์มืด',slot:'boots',rarity:'rare',speed:20,effect:'EXP+10%',icon:'👢',requiredClass:'mage'},
  // EPIC
  {id:'b16',name:'รองเท้าหายนะ',slot:'boots',rarity:'epic',speed:45,icon:'👢',requiredClass:'warrior'},
  {id:'b17',name:'รองเท้าเงามืดสนิท',slot:'boots',rarity:'epic',speed:55,icon:'👢',requiredClass:'rogue'},
  {id:'b18',name:'รองเท้าเทพเวทย์',slot:'boots',rarity:'epic',speed:35,effect:'EXP+15%',icon:'👢',requiredClass:'mage'},
  {id:'b19',name:'รองเท้าจอมล่า',slot:'boots',rarity:'epic',speed:50,icon:'👢',requiredClass:'archer'},
  {id:'b20',name:'รองเท้าแสงจักรวาล',slot:'boots',rarity:'epic',speed:40,effect:'ฟื้น HP+10/เทิร์น',icon:'👢',requiredClass:'paladin'},
  // LEGENDARY
  {id:'b21',name:'รองเท้าหายนะมืด',slot:'boots',rarity:'legend',speed:70,icon:'👢',requiredClass:'warrior'},
  {id:'b22',name:'รองเท้าเงาอมตะ',slot:'boots',rarity:'legend',speed:85,icon:'👢',requiredClass:'rogue'},
  {id:'b23',name:'รองเท้าจักรวาลนิรันดร์',slot:'boots',rarity:'legend',speed:60,effect:'EXP+25%',icon:'👢',requiredClass:'mage'},
  {id:'b24',name:'รองเท้าจอมล่าจักรวาล',slot:'boots',rarity:'legend',speed:78,icon:'👢',requiredClass:'archer'},
  {id:'b25',name:'รองเท้าแสงนิรันดร์',slot:'boots',rarity:'legend',speed:65,effect:'ฟื้น HP+18/เทิร์น',icon:'👢',requiredClass:'paladin'},
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

// ราคาซื้อ/ขาย ตาม rarity
const SHOP_SELL_PRICE = {common:30,uncommon:100,rare:400,epic:1200,legend:4000,ancient:12000};
const SHOP_BUY_PRICE  = {common:200,uncommon:600,rare:2000,epic:6000,legend:20000,ancient:60000};

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
  ancient: {label:'โบราณ',   color:'#ff4400',        bg:'#1a0500'}
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
  {id:'inventory_full',name:'นักสะสม',        desc:'กระเป๋าเต็ม 50 ชิ้น',     icon:'🎒', check:s=>s.inventory&&s.inventory.length>=50}
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
     conditions:{level:20,kills:30},
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
     conditions:{level:80,bossKills:10,evoQuest:'warrior_4A'},
     bonuses:{hpMult:1.5,atkMult:1.4,defMult:1.3,critBonus:0.2},
     rewardWeapon:{name:'ดาบหายนะนิรันดร์',icon:'💀',slot:'weapon',rarity:'legend',atk:90,requiredClass:'warrior'}},
    // tier4 branch B→B
    {tier:4,branch:'B',parentBranch:'B',name:'ผู้พิทักษ์นิรันดร์',icon:'🏰🛡',color:'#4466ff',
     lore:'ผู้ที่ยืนหยัดสุดท้าย ไม่มีอะไรทะลุผ่านได้',
     conditions:{level:80,tasks:60,evoQuest:'warrior_4B'},
     bonuses:{hpMult:2.0,defMult:1.8,damageReduction:0.2},
     rewardWeapon:{name:'โล่ศักดิ์สิทธิ์นิรันดร์',icon:'🏰',slot:'armor',rarity:'legend',atk:20,def:60,requiredClass:'warrior'}}
  ],
  mage:[
    {tier:1,name:'จอมเวทย์',icon:'🔮',color:'#aa44ff'},
    {tier:2,name:'อาร์เคนเมจ',icon:'✨🔮',color:'#bb55ff',
     lore:'กระแสเวทมนตร์โบราณซึมซับเข้าสู่ร่าง',
     conditions:{level:20,tasks:20},
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
     conditions:{level:80,tasks:60,evoQuest:'mage_4A'},
     bonuses:{expMult:1.5,atkMult:2.0},
     rewardWeapon:{name:'คทาผู้พิพากษา',icon:'🌌',slot:'weapon',rarity:'legend',atk:100,requiredClass:'mage'}},
    {tier:4,branch:'B',parentBranch:'B',name:'นักบวชสวรรค์',icon:'🌟',color:'#ffee44',
     lore:'ผู้รับพลังจากสรวงสวรรค์ ทุกคำอธิษฐานคือสายฟ้า',
     conditions:{level:80,epicTasks:15,evoQuest:'mage_4B'},
     bonuses:{expMult:1.6,hpMult:1.5,regenMult:1.3},
     rewardWeapon:{name:'ไม้เท้าสวรรค์',icon:'🌟',slot:'weapon',rarity:'legend',atk:70,requiredClass:'mage'}}
  ],
  rogue:[
    {tier:1,name:'โจร',icon:'🗡️',color:'#44ff88'},
    {tier:2,name:'นักฆ่า',icon:'🔪',color:'#55ff99',
     lore:'นิ้วที่รวดเร็วกว่าสายตา นักฆ่าไม่สังหาร — พวกเขา "แก้ปัญหา"',
     conditions:{level:20,critCount:20},
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
     conditions:{level:80,critCount:150,evoQuest:'rogue_4A'},
     bonuses:{critBonus:0.15,dropBonus:0.05,goldMult:1.5},
     rewardWeapon:{name:'กระบี่ราชาเงา',icon:'👑',slot:'weapon',rarity:'legend',atk:88,requiredClass:'rogue'}},
    {tier:4,branch:'B',parentBranch:'B',name:'จักรพรรดิโจร',icon:'💰👑',color:'#ffaa00',
     lore:'ทองคือพระเจ้า อำนาจคือศาสนา จักรพรรดิโจรปกครองด้วยความกลัวและความโลภ',
     conditions:{level:80,gold:8000,evoQuest:'rogue_4B'},
     bonuses:{goldMult:2.0,dropBonus:0.15,critBonus:0.08},
     rewardWeapon:{name:'ดาบจักรพรรดิทอง',icon:'💰',slot:'weapon',rarity:'legend',atk:75,requiredClass:'rogue'}}
  ],
  archer:[
    {tier:1,name:'นักธนู',icon:'🏹',color:'#ffd700'},
    {tier:2,name:'นักล่า',icon:'🦅🏹',color:'#ffcc00',
     lore:'ป่าสอนให้รู้จักความอดทน นักล่าเรียนรู้จากธรรมชาติ',
     conditions:{level:20,streak:5},
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
     conditions:{level:80,streak:25,evoQuest:'archer_4A'},
     bonuses:{streakMult:3.0,atkMult:1.5},
     rewardWeapon:{name:'ธนูจักรวาล',icon:'🌠',slot:'weapon',rarity:'legend',atk:92,requiredClass:'archer'}},
    {tier:4,branch:'B',parentBranch:'B',name:'เทพสายลม',icon:'⚡🌪️',color:'#44eeff',
     lore:'เร็วกว่าฟ้าแลบ แม่นกว่าโชคชะตา เทพสายลมไม่ยิงครั้งเดียว — ยิงพร้อมกันทั้งหมด',
     conditions:{level:80,critCount:100,evoQuest:'archer_4B'},
     bonuses:{atkMult:1.8,critBonus:0.15},
     rewardWeapon:{name:'ธนูฟ้าผ่า',icon:'⚡',slot:'weapon',rarity:'legend',atk:95,requiredClass:'archer'}}
  ],
  paladin:[
    {tier:1,name:'อัศวินศักดิ์สิทธิ์',icon:'✨',color:'#4488ff'},
    {tier:2,name:'พาลาดินแสงสว่าง',icon:'🌟✨',color:'#5599ff',
     lore:'ศรัทธาแกร่งพอที่จะหักดาบศัตรู พาลาดินเดินบนเส้นทางแห่งแสง',
     conditions:{level:20,hp:300},
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
     conditions:{level:80,hpHealed:5000,evoQuest:'paladin_4A'},
     bonuses:{regenMult:1.5,hpMult:1.6,damageReduction:0.1},
     rewardWeapon:{name:'ดาบเทพแห่งแสง',icon:'☀️',slot:'weapon',rarity:'legend',atk:65,requiredClass:'paladin'}},
    {tier:4,branch:'B',parentBranch:'B',name:'ราชันพิฆาต',icon:'👑⚡',color:'#ff8800',
     lore:'ราชาแห่งการพิฆาต ทุกก้าวคือความตายของศัตรู',
     conditions:{level:80,bossKills:15,evoQuest:'paladin_4B'},
     bonuses:{atkMult:1.6,critBonus:0.12,hpMult:1.2},
     rewardWeapon:{name:'ดาบราชันพิฆาต',icon:'👑',slot:'weapon',rarity:'legend',atk:95,requiredClass:'paladin'}}
  ]
};

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
  ],
};
