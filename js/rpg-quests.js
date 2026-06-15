// ============================================================
// FULL RPG QUEST SYSTEM — ใช้เฉพาะ gameMode === 'fullrpg'
// Types: kill | explore | collect | chain | daily | skilltree
// ============================================================

// ──────────────────────────────────────────────────────────────
// MAIN QUEST DEFINITIONS
// ──────────────────────────────────────────────────────────────
const RPG_QUESTS = [

  // ════════════════════════════════════
  // CHAIN STORY — เรื่องราวหลัก
  // ════════════════════════════════════

  // ── Act 1: ป่ากอบลิน ──
  { id:'story_01', name:'[เรื่องราว] จุดเริ่มต้น', zone:1,
    type:'chain', chainNext:'story_02',
    desc:'พูดคุยกับ Aldric นักวิชาการที่ Hub เพื่อรับเรื่องราว',
    trigger:'npc_aldric', required:1,
    reward:{ exp:500, gold:200 }, minLevel:1,
    lore:'Aldric รู้สึกถึงพลังโบราณในตัวคุณ และขอให้คุณพิสูจน์ตัวเอง' },

  { id:'story_02', name:'[เรื่องราว] ปราบแม่ทัพกอบลิน', zone:1,
    type:'kill', chainNext:'story_03', chainFrom:'story_01',
    target:'กอบลินหัวหน้า', targetZone:1, targetTier:3, required:3,
    desc:'กำจัด กอบลินหัวหน้า 3 ตัว ผู้นำกองทัพโจมตีหมู่บ้าน',
    reward:{ exp:2000, gold:400, chest:'uncommon' }, minLevel:1,
    lore:'หัวหน้ากอบลินรู้ตัวแล้วว่ามีนักล่าออกตามล่า' },

  { id:'story_03', name:'[เรื่องราว] ราชันแห่งป่า', zone:1,
    type:'kill', chainNext:'story_04', chainFrom:'story_02',
    target:'ราชากอบลิน', targetZone:1, targetTier:6, required:1,
    desc:'ปราบ ราชากอบลิน ผู้ปกครองป่า เพื่อยุติสงคราม',
    reward:{ exp:5000, gold:1000, chest:'boss' }, minLevel:8,
    lore:'ราชากอบลินซ่อนกุญแจสู่โลกใต้ดิน' },

  { id:'story_04', name:'[เรื่องราว] เงามืดในหุบเขา', zone:2,
    type:'explore', chainNext:'story_05', chainFrom:'story_03',
    target:'หุบเขาซอมบี้', targetZone:2, required:1,
    desc:'สำรวจ หุบเขาซอมบี้ — เดินทางไปโซน 2',
    reward:{ exp:3000, gold:500 }, minLevel:10,
    lore:'กุญแจที่ได้มาชี้ทางสู่หุบเขาแห่งความตาย' },

  { id:'story_05', name:'[เรื่องราว] ทำลายจอมซอมบี้', zone:2,
    type:'kill', chainNext:'story_06', chainFrom:'story_04',
    target:'จอมซอมบี้', targetZone:2, targetTier:6, required:1,
    desc:'ปราบ จอมซอมบี้ ผู้ฟื้นคืนความตาย',
    reward:{ exp:12000, gold:2000, chest:'boss' }, minLevel:20,
    lore:'จอมซอมบี้ถือเศษหน้ากากโบราณที่ชี้ทางสู่ถ้ำมังกร' },

  { id:'story_06', name:'[เรื่องราว] เสียงคำรามแห่งถ้ำ', zone:3,
    type:'explore', chainNext:'story_07', chainFrom:'story_05',
    target:'ถ้ำมังกร', targetZone:3, required:1,
    desc:'สำรวจ ถ้ำมังกร — เดินทางไปโซน 3',
    reward:{ exp:8000, gold:1000 }, minLevel:25,
    lore:'เสียงคำรามสะท้านถ้ำ มังกรราชันตื่นจากหลับ' },

  { id:'story_07', name:'[เรื่องราว] ราชันมังกร', zone:3,
    type:'kill', chainNext:'story_08', chainFrom:'story_06',
    target:'มังกรราชัน', targetZone:3, targetTier:6, required:1,
    desc:'ปราบ มังกรราชัน เพื่อเอาเกล็ดมังกรโบราณ',
    reward:{ exp:25000, gold:4000, chest:'boss' }, minLevel:40,
    lore:'เกล็ดมังกรเผยที่ซ่อนของ Nexus มืดในซากอสูร' },

  { id:'story_08', name:'[เรื่องราว] ซากแห่งอาณาจักรเก่า', zone:4,
    type:'explore', chainNext:'story_09', chainFrom:'story_07',
    target:'ซากอสูร', targetZone:4, required:1,
    desc:'สำรวจ ซากอสูร — เดินทางไปโซน 4',
    reward:{ exp:15000, gold:2000 }, minLevel:40,
    lore:'อาณาจักรที่ล่มสลายไปนานแล้ว แต่อสูรยังปกครองอยู่' },

  { id:'story_09', name:'[เรื่องราว] ราชาอสูร', zone:4,
    type:'kill', chainNext:'story_10', chainFrom:'story_08',
    target:'ราชาอสูร', targetZone:4, targetTier:6, required:1,
    desc:'ปราบ ราชาอสูร เพื่อปลดปล่อยซากอาณาจักร',
    reward:{ exp:60000, gold:8000, chest:'boss' }, minLevel:58,
    lore:'คทาราชาชี้สู่ปราสาทมืดที่ปิดผนึกไว้นาน' },

  { id:'story_10', name:'[เรื่องราว] ปราสาทมืดตื่น', zone:5,
    type:'explore', chainNext:'story_11', chainFrom:'story_09',
    target:'ปราสาทมืด', targetZone:5, required:1,
    desc:'สำรวจ ปราสาทมืด — เดินทางไปโซน 5',
    reward:{ exp:30000, gold:4000 }, minLevel:60,
    lore:'ปราสาทที่ถูกสาปมาร้อยปี ตื่นขึ้นรับนักล่า' },

  { id:'story_11', name:'[เรื่องราว] เจ้าแห่งปราสาท', zone:5,
    type:'kill', chainNext:'story_12', chainFrom:'story_10',
    target:'เจ้าแห่งปราสาท', targetZone:5, targetTier:6, required:1,
    desc:'ปราบ เจ้าแห่งปราสาท ผู้เฝ้าประตูสวรรค์สุดท้าย',
    reward:{ exp:120000, gold:15000, chest:'boss' }, minLevel:78,
    lore:'ผนึกสุดท้ายแตกสลาย — อาณาจักรโกลาหลปรากฏ' },

  { id:'story_12', name:'[เรื่องราว] อาณาจักรปลายทาง', zone:6,
    type:'explore', chainNext:'story_final', chainFrom:'story_11',
    target:'อาณาจักรโกลาหล', targetZone:6, required:1,
    desc:'สำรวจ อาณาจักรโกลาหล — เดินทางไปโซน 6',
    reward:{ exp:60000, gold:8000 }, minLevel:80,
    lore:'จุดสิ้นสุดและจุดเริ่มต้น — เทพแห่งโกลาหลรอคอย' },

  { id:'story_final', name:'[เรื่องราว] ปิดตำนานโลก', zone:6,
    type:'kill', chainFrom:'story_12',
    target:'เทพแห่งโกลาหล', targetZone:6, targetTier:6, required:1,
    desc:'ปราบ เทพแห่งโกลาหล — จุดจบของการผจญภัย',
    reward:{ exp:500000, gold:30000, chest:'boss' }, minLevel:98,
    lore:'ท้ายที่สุดมีแค่นักผจญภัยและเทพ — ผู้ใดจะชนะ?' },

  // ════════════════════════════════════
  // KILL QUESTS — ล่ามอนสเตอร์
  // ════════════════════════════════════

  // Zone 1
  { id:'q001', name:'ทดสอบฝีมือ', zone:1, type:'kill',
    target:'กอบลินน้อย', targetZone:1, targetTier:1, required:3,
    desc:'ฆ่า กอบลินน้อย 3 ตัว',
    reward:{ exp:300, gold:50, chest:'common' }, minLevel:1 },
  { id:'q002', name:'ภัยจากป่า', zone:1, type:'kill',
    target:'กอบลินทหาร', targetZone:1, targetTier:2, required:5,
    desc:'กำจัด กอบลินทหาร 5 ตัว',
    reward:{ exp:800, gold:100, chest:'common' }, minLevel:2 },
  { id:'q003', name:'ล่าหัวหน้า', zone:1, type:'kill',
    target:'กอบลินหัวหน้า', targetZone:1, targetTier:3, required:2,
    desc:'กำจัด กอบลินหัวหน้า 2 ตัว',
    reward:{ exp:1500, gold:200, chest:'uncommon' }, minLevel:5 },
  { id:'q004', name:'แม่มดแห่งป่า', zone:1, type:'kill',
    target:'กอบลินแม่มด', targetZone:1, targetTier:4, required:3,
    desc:'ล้มล้าง กอบลินแม่มด 3 ตัว',
    reward:{ exp:2500, gold:350, chest:'uncommon' }, minLevel:7 },
  { id:'q005', name:'ยักษ์แห่งป่า', zone:1, type:'kill',
    target:'กอบลินยักษ์', targetZone:1, targetTier:5, required:2,
    desc:'ปราบ กอบลินยักษ์ 2 ตัว',
    reward:{ exp:4000, gold:500, chest:'rare' }, minLevel:9 },
  { id:'q006', name:'ปิดตำนานราชา', zone:1, type:'kill',
    target:'ราชากอบลิน', targetZone:1, targetTier:6, required:1,
    desc:'ปราบ ราชากอบลิน ผู้นำแห่งป่า',
    reward:{ exp:8000, gold:1000, chest:'boss' }, minLevel:10 },

  // Zone 2
  { id:'q101', name:'คลื่นซอมบี้', zone:2, type:'kill',
    target:'ซอมบี้เน่า', targetZone:2, targetTier:1, required:5,
    desc:'ทำลาย ซอมบี้เน่า 5 ตัว',
    reward:{ exp:1200, gold:150, chest:'common' }, minLevel:10 },
  { id:'q102', name:'กองทัพผี', zone:2, type:'kill',
    target:'ซอมบี้เดิน', targetZone:2, targetTier:2, required:5,
    desc:'กำจัด ซอมบี้เดิน 5 ตัว',
    reward:{ exp:2000, gold:250, chest:'uncommon' }, minLevel:12 },
  { id:'q103', name:'นักรบผู้ตาย', zone:2, type:'kill',
    target:'ซอมบี้นักรบ', targetZone:2, targetTier:3, required:3,
    desc:'ปราบ ซอมบี้นักรบ 3 ตัว',
    reward:{ exp:3500, gold:400, chest:'uncommon' }, minLevel:15 },
  { id:'q104', name:'แม่มดแห่งความตาย', zone:2, type:'kill',
    target:'ซอมบี้แม่มด', targetZone:2, targetTier:4, required:3,
    desc:'หยุด ซอมบี้แม่มด 3 ตัว',
    reward:{ exp:6000, gold:600, chest:'rare' }, minLevel:18 },
  { id:'q105', name:'ยักษ์ผุพัง', zone:2, type:'kill',
    target:'ซอมบี้ยักษ์', targetZone:2, targetTier:5, required:2,
    desc:'ล้มล้าง ซอมบี้ยักษ์ 2 ตัว',
    reward:{ exp:9000, gold:800, chest:'rare' }, minLevel:20 },
  { id:'q106', name:'จอมซอมบี้', zone:2, type:'kill',
    target:'จอมซอมบี้', targetZone:2, targetTier:6, required:1,
    desc:'ปราบ จอมซอมบี้ ผู้ควบคุมหุบเขา',
    reward:{ exp:18000, gold:1800, chest:'boss' }, minLevel:22 },

  // Zone 3
  { id:'q201', name:'มังกรหนาว', zone:3, type:'kill',
    target:'มังกรน้ำแข็ง', targetZone:3, targetTier:1, required:4,
    desc:'ปราบ มังกรน้ำแข็ง 4 ตัว',
    reward:{ exp:3000, gold:400, chest:'uncommon' }, minLevel:25 },
  { id:'q202', name:'ลูกไฟร้อนระอุ', zone:3, type:'kill',
    target:'มังกรไฟ', targetZone:3, targetTier:2, required:4,
    desc:'กำจัด มังกรไฟ 4 ตัว',
    reward:{ exp:5000, gold:600, chest:'uncommon' }, minLevel:28 },
  { id:'q203', name:'พิษมังกร', zone:3, type:'kill',
    target:'มังกรพิษ', targetZone:3, targetTier:3, required:3,
    desc:'ปราบ มังกรพิษ 3 ตัว',
    reward:{ exp:8000, gold:900, chest:'rare' }, minLevel:32 },
  { id:'q204', name:'สายฟ้าแห่งถ้ำ', zone:3, type:'kill',
    target:'มังกรสายฟ้า', targetZone:3, targetTier:4, required:3,
    desc:'หยุด มังกรสายฟ้า 3 ตัว',
    reward:{ exp:13000, gold:1200, chest:'rare' }, minLevel:36 },
  { id:'q205', name:'ความมืดในถ้ำ', zone:3, type:'kill',
    target:'มังกรมืด', targetZone:3, targetTier:5, required:2,
    desc:'ปราบ มังกรมืด 2 ตัว',
    reward:{ exp:20000, gold:1600, chest:'boss' }, minLevel:40 },
  { id:'q206', name:'ราชันมังกร', zone:3, type:'kill',
    target:'มังกรราชัน', targetZone:3, targetTier:6, required:1,
    desc:'ปราบ มังกรราชัน ผู้ครองถ้ำ',
    reward:{ exp:40000, gold:3000, chest:'boss' }, minLevel:42 },

  // Zone 4-6
  { id:'q301', name:'อสูรแตกแยก', zone:4, type:'kill',
    target:'อสูรหัวแตก', targetZone:4, targetTier:1, required:5,
    desc:'ล้มล้าง อสูรหัวแตก 5 ตัว',
    reward:{ exp:6000, gold:700, chest:'uncommon' }, minLevel:40 },
  { id:'q302', name:'ทหารแห่งความชั่ว', zone:4, type:'kill',
    target:'อสูรทหาร', targetZone:4, targetTier:2, required:4,
    desc:'กำจัด อสูรทหาร 4 ตัว',
    reward:{ exp:10000, gold:1100, chest:'rare' }, minLevel:43 },
  { id:'q303', name:'เวทย์แห่งนรก', zone:4, type:'kill',
    target:'อสูรแม่มด', targetZone:4, targetTier:3, required:3,
    desc:'ปราบ อสูรแม่มด 3 ตัว',
    reward:{ exp:16000, gold:1600, chest:'rare' }, minLevel:47 },
  { id:'q304', name:'ยักษ์นรก', zone:4, type:'kill',
    target:'อสูรยักษ์', targetZone:4, targetTier:4, required:2,
    desc:'ล้มล้าง อสูรยักษ์ 2 ตัว',
    reward:{ exp:25000, gold:2200, chest:'boss' }, minLevel:51 },
  { id:'q305', name:'จอมอสูร', zone:4, type:'kill',
    target:'อสูรจอม', targetZone:4, targetTier:5, required:2,
    desc:'ปราบ อสูรจอม 2 ตัว',
    reward:{ exp:40000, gold:3000, chest:'boss' }, minLevel:55 },
  { id:'q306', name:'ราชาซากอสูร', zone:4, type:'kill',
    target:'ราชาอสูร', targetZone:4, targetTier:6, required:1,
    desc:'ปราบ ราชาอสูร ผู้ปกครองซาก',
    reward:{ exp:80000, gold:5000, chest:'boss' }, minLevel:58 },

  { id:'q401', name:'ผีปราสาท', zone:5, type:'kill',
    target:'ผีปราสาท', targetZone:5, targetTier:1, required:5,
    desc:'ขับไล่ ผีปราสาท 5 ตัว',
    reward:{ exp:12000, gold:1200, chest:'rare' }, minLevel:60 },
  { id:'q402', name:'อัศวินมืดตก', zone:5, type:'kill',
    target:'อัศวินมืด', targetZone:5, targetTier:2, required:4,
    desc:'ล้มล้าง อัศวินมืด 4 ตัว',
    reward:{ exp:20000, gold:2000, chest:'rare' }, minLevel:63 },
  { id:'q403', name:'แม่มดปราสาท', zone:5, type:'kill',
    target:'แม่มดปราสาท', targetZone:5, targetTier:3, required:3,
    desc:'ปราบ แม่มดปราสาท 3 ตัว',
    reward:{ exp:32000, gold:2800, chest:'boss' }, minLevel:67 },
  { id:'q404', name:'สัตว์ประหลาดพิษ', zone:5, type:'kill',
    target:'สัตว์ประหลาด', targetZone:5, targetTier:4, required:3,
    desc:'ล้มล้าง สัตว์ประหลาด 3 ตัว',
    reward:{ exp:50000, gold:4000, chest:'boss' }, minLevel:71 },
  { id:'q405', name:'เจ้าชายมืด', zone:5, type:'kill',
    target:'เจ้าชายมืด', targetZone:5, targetTier:5, required:2,
    desc:'ปราบ เจ้าชายมืด 2 ตัว',
    reward:{ exp:75000, gold:5500, chest:'boss' }, minLevel:75 },
  { id:'q406', name:'เจ้าแห่งปราสาท', zone:5, type:'kill',
    target:'เจ้าแห่งปราสาท', targetZone:5, targetTier:6, required:1,
    desc:'ปราบ เจ้าแห่งปราสาท',
    reward:{ exp:150000, gold:8000, chest:'boss' }, minLevel:78 },

  { id:'q501', name:'ปีศาจโกลาหล', zone:6, type:'kill',
    target:'ปีศาจโกลาหล', targetZone:6, targetTier:1, required:5,
    desc:'ปราบ ปีศาจโกลาหล 5 ตัว',
    reward:{ exp:25000, gold:2500, chest:'rare' }, minLevel:80 },
  { id:'q502', name:'อสูรจักรวาล', zone:6, type:'kill',
    target:'อสูรจักรวาล', targetZone:6, targetTier:2, required:4,
    desc:'ล้มล้าง อสูรจักรวาล 4 ตัว',
    reward:{ exp:40000, gold:4000, chest:'boss' }, minLevel:83 },
  { id:'q503', name:'เทพมืด', zone:6, type:'kill',
    target:'เทพมืด', targetZone:6, targetTier:3, required:3,
    desc:'ปราบ เทพมืด 3 ตัว',
    reward:{ exp:65000, gold:6000, chest:'boss' }, minLevel:87 },
  { id:'q504', name:'อสูรนิรันดร์', zone:6, type:'kill',
    target:'อสูรนิรันดร์', targetZone:6, targetTier:4, required:2,
    desc:'ล้มล้าง อสูรนิรันดร์ 2 ตัว',
    reward:{ exp:100000, gold:8000, chest:'boss' }, minLevel:91 },
  { id:'q505', name:'ผู้พิทักษ์โกลาหล', zone:6, type:'kill',
    target:'ผู้พิทักษ์โกลาหล', targetZone:6, targetTier:5, required:2,
    desc:'ปราบ ผู้พิทักษ์โกลาหล 2 ตัว',
    reward:{ exp:160000, gold:12000, chest:'boss' }, minLevel:95 },
  { id:'q506', name:'ปิดตำนานโกลาหล', zone:6, type:'kill',
    target:'เทพแห่งโกลาหล', targetZone:6, targetTier:6, required:1,
    desc:'ปราบ เทพแห่งโกลาหล เพื่อปิดตำนาน',
    reward:{ exp:500000, gold:20000, chest:'boss' }, minLevel:98 },

  // ════════════════════════════════════
  // COLLECT QUESTS — เก็บของ/หีบ
  // ════════════════════════════════════
  { id:'col01', name:'รวบรวมทรัพย์สมบัติ', zone:1, type:'collect',
    collectType:'chest', required:5,
    desc:'เปิดหีบสมบัติ 5 ใบ (ทุกประเภท)',
    reward:{ exp:2000, gold:500 }, minLevel:1 },
  { id:'col02', name:'นักล่าสมบัติ', zone:1, type:'collect',
    collectType:'chest', required:20,
    desc:'เปิดหีบสมบัติรวม 20 ใบ',
    reward:{ exp:8000, gold:1500, chest:'rare' }, minLevel:5 },
  { id:'col03', name:'ราชาสมบัติ', zone:1, type:'collect',
    collectType:'chest', required:50,
    desc:'เปิดหีบสมบัติรวม 50 ใบ',
    reward:{ exp:30000, gold:5000, chest:'boss' }, minLevel:20 },
  { id:'col04', name:'สะสมทอง', zone:1, type:'collect',
    collectType:'gold', required:1000,
    desc:'สะสมทอง 1,000 เหรียญ',
    reward:{ exp:3000, gold:500 }, minLevel:1 },
  { id:'col05', name:'เศรษฐีแห่งดินแดน', zone:1, type:'collect',
    collectType:'gold', required:10000,
    desc:'สะสมทอง 10,000 เหรียญ',
    reward:{ exp:15000, gold:2000, chest:'rare' }, minLevel:15 },
  { id:'col06', name:'เปิดหีบบอส', zone:1, type:'collect',
    collectType:'bosschest', required:3,
    desc:'เปิดหีบบอส 3 ใบ',
    reward:{ exp:10000, gold:3000 }, minLevel:10 },

  // ════════════════════════════════════
  // EXPLORE QUESTS — สำรวจโซน
  // ════════════════════════════════════
  { id:'exp01', name:'นักสำรวจหน้าใหม่', zone:2, type:'explore',
    target:'หุบเขาซอมบี้', targetZone:2, required:1,
    desc:'เดินทางไปสำรวจ หุบเขาซอมบี้ (โซน 2)',
    reward:{ exp:1500, gold:300 }, minLevel:10 },
  { id:'exp02', name:'ล่ามังกร', zone:3, type:'explore',
    target:'ถ้ำมังกร', targetZone:3, required:1,
    desc:'เดินทางไปสำรวจ ถ้ำมังกร (โซน 3)',
    reward:{ exp:4000, gold:600 }, minLevel:25 },
  { id:'exp03', name:'ซากแห่งอาณาจักร', zone:4, type:'explore',
    target:'ซากอสูร', targetZone:4, required:1,
    desc:'เดินทางไปสำรวจ ซากอสูร (โซน 4)',
    reward:{ exp:8000, gold:1200 }, minLevel:40 },
  { id:'exp04', name:'ปราสาทต้องห้าม', zone:5, type:'explore',
    target:'ปราสาทมืด', targetZone:5, required:1,
    desc:'เดินทางไปสำรวจ ปราสาทมืด (โซน 5)',
    reward:{ exp:18000, gold:2500 }, minLevel:60 },
  { id:'exp05', name:'ดินแดนสุดท้าย', zone:6, type:'explore',
    target:'อาณาจักรโกลาหล', targetZone:6, required:1,
    desc:'เดินทางไปสำรวจ อาณาจักรโกลาหล (โซน 6)',
    reward:{ exp:40000, gold:6000 }, minLevel:80 },

  // ════════════════════════════════════
  // SKILL TREE QUESTS — ปลดล็อค skill tree
  // ════════════════════════════════════
  { id:'sk01', name:'ตื่นพลัง', zone:0, type:'skilltree',
    skillTarget:'unlock_any', required:1,
    desc:'ปลดล็อค node ใน Skill Tree ครั้งแรก',
    reward:{ exp:1000, gold:200 }, minLevel:1 },
  { id:'sk02', name:'ผู้เรียนรู้', zone:0, type:'skilltree',
    skillTarget:'unlock_any', required:5,
    desc:'ปลดล็อค node ใน Skill Tree รวม 5 ครั้ง',
    reward:{ exp:3000, gold:500, chest:'uncommon' }, minLevel:5 },
  { id:'sk03', name:'เชี่ยวชาญ', zone:0, type:'skilltree',
    skillTarget:'unlock_any', required:10,
    desc:'ปลดล็อค node ใน Skill Tree รวม 10 ครั้ง',
    reward:{ exp:8000, gold:1000, chest:'rare' }, minLevel:15 },
  { id:'sk04', name:'สกิลใหม่!', zone:0, type:'skilltree',
    skillTarget:'unlock_skill', required:1,
    desc:'ปลดล็อคสกิลจาก Skill Tree ครั้งแรก',
    reward:{ exp:2000, gold:300 }, minLevel:1 },
  { id:'sk05', name:'คลังสกิล', zone:0, type:'skilltree',
    skillTarget:'unlock_skill', required:4,
    desc:'ปลดล็อคสกิลจาก Skill Tree รวม 4 ตัว (เต็ม slot)',
    reward:{ exp:10000, gold:2000, chest:'rare' }, minLevel:10 },
  { id:'sk06', name:'สกิล Tier 4', zone:0, type:'skilltree',
    skillTarget:'unlock_t4', required:1,
    desc:'ปลดล็อคสกิล Tier 4 (สูงสุด)',
    reward:{ exp:25000, gold:5000, chest:'boss' }, minLevel:50 },
  { id:'sk07', name:'วิวัฒนาการ Tier 2', zone:0, type:'skilltree',
    skillTarget:'evolution', required:2,
    desc:'วิวัฒนาการคลาสถึง Tier 2',
    reward:{ exp:5000, gold:1000, chest:'uncommon' }, minLevel:20 },
  { id:'sk08', name:'วิวัฒนาการ Tier 3', zone:0, type:'skilltree',
    skillTarget:'evolution', required:3,
    desc:'วิวัฒนาการคลาสถึง Tier 3 (เลือก Branch)',
    reward:{ exp:15000, gold:3000, chest:'rare' }, minLevel:50 },
  { id:'sk09', name:'วิวัฒนาการสูงสุด', zone:0, type:'skilltree',
    skillTarget:'evolution', required:4,
    desc:'วิวัฒนาการคลาสถึง Tier 4 (ขั้นสุดท้าย)',
    reward:{ exp:50000, gold:10000, chest:'boss' }, minLevel:80 },
];

// ──────────────────────────────────────────────────────────────
// DAILY QUESTS สำหรับ fullrpg — reset ทุกวัน
// ──────────────────────────────────────────────────────────────
const RPG_DAILY_POOL = [
  { id:'d_kill10',  name:'นักล่าประจำวัน',    desc:'กำจัดมอนสเตอร์ 10 ตัววันนี้',   type:'daily_kill',    required:10,  reward:{ exp:3000,  gold:500,  chest:'common'   } },
  { id:'d_kill25',  name:'ล่าไม่หยุด',         desc:'กำจัดมอนสเตอร์ 25 ตัววันนี้',   type:'daily_kill',    required:25,  reward:{ exp:8000,  gold:1200, chest:'uncommon' } },
  { id:'d_boss1',   name:'ล่าบอสประจำวัน',     desc:'ปราบบอส 1 ตัววันนี้',           type:'daily_boss',    required:1,   reward:{ exp:5000,  gold:800,  chest:'rare'     } },
  { id:'d_boss3',   name:'นักล่าบอส',          desc:'ปราบบอส 3 ตัววันนี้',           type:'daily_boss',    required:3,   reward:{ exp:15000, gold:2500, chest:'boss'     } },
  { id:'d_chest3',  name:'เปิดสมบัติ',         desc:'เปิดหีบสมบัติ 3 ใบวันนี้',     type:'daily_chest',   required:3,   reward:{ exp:2000,  gold:400  } },
  { id:'d_zone2',   name:'สำรวจหุบเขา',        desc:'ล่ามอนในโซน 2 จำนวน 10 ตัว',  type:'daily_zonekill',required:10, zone:2, reward:{ exp:4000,  gold:600  } },
  { id:'d_zone3',   name:'ล่ามังกร',            desc:'ล่ามอนในโซน 3 จำนวน 8 ตัว',   type:'daily_zonekill',required:8,  zone:3, reward:{ exp:8000,  gold:1000, chest:'uncommon' } },
  { id:'d_zone4',   name:'สำรวจซาก',           desc:'ล่ามอนในโซน 4 จำนวน 6 ตัว',   type:'daily_zonekill',required:6,  zone:4, reward:{ exp:15000, gold:2000, chest:'rare'     } },
  { id:'d_zone5',   name:'บุกปราสาท',          desc:'ล่ามอนในโซน 5 จำนวน 5 ตัว',   type:'daily_zonekill',required:5,  zone:5, reward:{ exp:25000, gold:3000, chest:'rare'     } },
  { id:'d_zone6',   name:'เข้าโกลาหล',         desc:'ล่ามอนในโซน 6 จำนวน 3 ตัว',   type:'daily_zonekill',required:3,  zone:6, reward:{ exp:40000, gold:5000, chest:'boss'     } },
  { id:'d_gold500', name:'สะสมทองวันนี้',       desc:'ได้รับทองรวม 500 วันนี้',       type:'daily_gold',    required:500, reward:{ exp:2000,  gold:300  } },
  { id:'d_equip',   name:'นักสะสมอุปกรณ์',     desc:'มีอุปกรณ์สวมครบ 4 ช่องขึ้นไป', type:'daily_equip',   required:4,   reward:{ exp:3000,  gold:500  } },
];

// ──────────────────────────────────────────────────────────────
// NPC QUESTS — เควสจาก NPC ใน Hub
// ──────────────────────────────────────────────────────────────
const NPC_QUEST_MAP = {
  // Aldric (quest_giver) — เควสเนื้อเรื่อง + kill
  quest_giver: ['story_01','q001','q002','q003','q101','q201','q301','q401','q501'],
  // Goran (blacksmith) — เควส collect อุปกรณ์
  blacksmith:  ['col01','col02','col03','col06','sk04','sk05'],
  // Miriel (sage) — เควส skill tree + explore
  sage:        ['sk01','sk02','sk03','sk06','sk07','sk08','sk09','exp01','exp02','exp03','exp04','exp05'],
  // Rosa (innkeeper) — เควส collect gold
  innkeeper:   ['col04','col05'],
};

// ──────────────────────────────────────────────────────────────
// STATE HELPERS
// ──────────────────────────────────────────────────────────────

function _rpgState(id) {
  if (!G.rpgQuests) G.rpgQuests = {};
  if (!G.rpgQuests[id]) G.rpgQuests[id] = { active:false, progress:0, done:false };
  return G.rpgQuests[id];
}

function rpgGetAvailableQuests() {
  if (!G.rpgQuests) G.rpgQuests = {};
  return RPG_QUESTS.filter(q => {
    if (G.level < q.minLevel) return false;
    const st = _rpgState(q.id);
    if (st.done || st.active) return false;
    // chain quests แสดงใน section "เรื่องราว" แยกต่างหาก ไม่ต้องแสดงซ้ำที่นี่
    if (q.type === 'chain' || q.chainFrom || q.chainNext) return false;
    return true;
  });
}

function rpgGetActiveQuests() {
  if (!G.rpgQuests) G.rpgQuests = {};
  return RPG_QUESTS.filter(q => {
    const st = _rpgState(q.id);
    return st.active && !st.done;
  });
}

function rpgAcceptQuest(id) {
  const q = RPG_QUESTS.find(x => x.id === id);
  if (!q) return;
  const st = _rpgState(id);
  if (st.active || st.done) return;
  st.active = true; st.progress = 0;

  // ── retroactive credit: count progress already earned BEFORE accepting ──
  // (this can make the quest immediately READY to turn in — not auto-finished)
  if (q.type === 'explore') {
    const reached = G.currentZone === q.targetZone || ((G.zoneProgress||{})[q.targetZone]||0) > 0;
    if (reached) { st.progress = q.required || 1; _rpgCheckComplete(q, st); }
  } else if (q.type === 'kill') {
    const beaten = (G.defeatedMonsters||{})[`${q.targetZone}_${q.targetTier}`];
    if (beaten) { st.progress = Math.min(q.required || 1, 1); _rpgCheckComplete(q, st); }
  } else if (q.type === 'collect' && q.collectType === 'gold') {
    if (G.gold >= (q.required||0)) { st.progress = G.gold; _rpgCheckComplete(q, st); }
  }

  saveGame();
  renderRpgQuestPanel();
  if (!st.ready) logBattle(`<span class="log-sys">📜 รับเควส: <b>${q.name}</b> — ${q.desc}</span>`);
}

function rpgAbandonQuest(id) {
  const st = _rpgState(id);
  st.active = false; st.progress = 0;
  saveGame();
  renderRpgQuestPanel();
}

// ──────────────────────────────────────────────────────────────
// TRACKING — เรียกจาก battle.js, ui.js, evolution.js ฯลฯ
// ──────────────────────────────────────────────────────────────

// จาก monsterDie()
function rpgOnKill(monsterName, monsterTier, zoneId) {
  if (G.gameMode !== 'fullrpg') return;
  if (!G.rpgQuests) G.rpgQuests = {};
  let changed = false;
  RPG_QUESTS.forEach(q => {
    const st = _rpgState(q.id);
    if (!st.active || st.done) return;
    if (q.type === 'kill' && q.targetZone === zoneId && q.targetTier === monsterTier) {
      st.progress = (st.progress||0) + 1; changed = true;
      _rpgCheckComplete(q, st);
    }
  });
  // daily kill tracking
  _rpgDailyKill(zoneId, monsterTier);
  if (changed) { saveGame(); renderRpgQuestPanel(); }
}

// จาก openZone / selectZone (เรียกเมื่อผู้เล่นเดินทางไปโซนใหม่)
function rpgOnExplore(zoneId) {
  if (G.gameMode !== 'fullrpg') return;
  let changed = false;
  RPG_QUESTS.forEach(q => {
    const st = _rpgState(q.id);
    if (!st.active || st.done) return;
    if (q.type === 'explore' && q.targetZone === zoneId) {
      st.progress = 1; changed = true;
      _rpgCheckComplete(q, st);
    }
  });
  if (changed) { saveGame(); renderRpgQuestPanel(); }
  // auto-accept any newly-available quests for this zone (no NPC trip needed)
  rpgAutoAcceptZoneQuests(zoneId);
}

// Auto-accept ONLY plain KILL quests for the zone the player enters — so
// fighting in a zone lights up the quest system + red badge without an NPC trip.
// Collect / explore / NPC-talk / story quests are NOT auto-accepted — those are
// taken manually (visit the NPC). Retroactive credit in rpgAcceptQuest applies.
function rpgAutoAcceptZoneQuests(zoneId) {
  if (G.gameMode !== 'fullrpg') return;
  const MAX_ACTIVE_AUTO = 3;
  const curActive = rpgGetActiveQuests().filter(q => !q.chainFrom && !q.chainNext && q.type !== 'chain').length;
  let slots = Math.max(0, MAX_ACTIVE_AUTO - curActive);
  if (slots <= 0) return;

  const candidates = RPG_QUESTS
    .filter(q => q.type === 'kill')                       // kill quests only
    .filter(q => !(q.chainFrom || q.chainNext))           // exclude story chain
    .filter(q => (q.targetZone || q.zone) === zoneId)
    .filter(q => G.level >= q.minLevel)
    .filter(q => { const st = _rpgState(q.id); return !st.active && !st.done; })
    .sort((a, b) => (a.targetTier || 0) - (b.targetTier || 0));

  let any = false;
  for (const q of candidates) {
    if (slots <= 0) break;
    rpgAcceptQuest(q.id);
    // only consumes a slot if it didn't instantly complete (retroactive)
    if (!_rpgState(q.id).done) slots--;
    any = true;
  }
  if (any) {
    if (typeof updateNavBadges === 'function') updateNavBadges();
    if (typeof renderRpgQuestPanel === 'function') renderRpgQuestPanel();
  }
}

// จาก chest open (เรียกจาก openChest / gacha modal)
function rpgOnChestOpen(chestType) {
  if (G.gameMode !== 'fullrpg') return;
  let changed = false;
  RPG_QUESTS.forEach(q => {
    const st = _rpgState(q.id);
    if (!st.active || st.done) return;
    if (q.type === 'collect' && q.collectType === 'chest') {
      st.progress = (st.progress||0) + 1; changed = true;
      _rpgCheckComplete(q, st);
    }
    if (q.type === 'collect' && q.collectType === 'bosschest' && chestType === 'boss') {
      st.progress = (st.progress||0) + 1; changed = true;
      _rpgCheckComplete(q, st);
    }
  });
  _rpgDailyChest();
  if (changed) { saveGame(); renderRpgQuestPanel(); }
}

// จาก giveGold / goldGain ต่างๆ — track gold สะสม
function rpgOnGoldGain(amount) {
  if (G.gameMode !== 'fullrpg') return;
  let changed = false;
  RPG_QUESTS.forEach(q => {
    const st = _rpgState(q.id);
    if (!st.active || st.done) return;
    if (q.type === 'collect' && q.collectType === 'gold') {
      // ใช้ G.gold ตรงๆ เป็น progress เทียบกับ required
      st.progress = G.gold;
      if (st.progress >= q.required) { changed = true; _rpgCheckComplete(q, st); }
    }
  });
  _rpgDailyGold(amount);
  if (changed) { saveGame(); renderRpgQuestPanel(); }
}

// จาก unlockNode() ใน skilltree.js
function rpgOnSkillUnlock(nodeType, nodeTier) {
  if (G.gameMode !== 'fullrpg') return;
  let changed = false;
  RPG_QUESTS.forEach(q => {
    const st = _rpgState(q.id);
    if (!st.active || st.done) return;
    if (q.type === 'skilltree') {
      if (q.skillTarget === 'unlock_any') {
        st.progress = (st.progress||0) + 1; changed = true;
        _rpgCheckComplete(q, st);
      }
      if (q.skillTarget === 'unlock_skill' && nodeType === 'skill') {
        st.progress = (st.progress||0) + 1; changed = true;
        _rpgCheckComplete(q, st);
      }
      if (q.skillTarget === 'unlock_t4' && nodeTier === 4) {
        st.progress = 1; changed = true;
        _rpgCheckComplete(q, st);
      }
    }
  });
  if (changed) { saveGame(); renderRpgQuestPanel(); }
}

// จาก evolution.js — doEvolution()
function rpgOnEvolution(newTier) {
  if (G.gameMode !== 'fullrpg') return;
  let changed = false;
  RPG_QUESTS.forEach(q => {
    const st = _rpgState(q.id);
    if (!st.active || st.done) return;
    if (q.type === 'skilltree' && q.skillTarget === 'evolution') {
      if (newTier >= q.required) {
        st.progress = newTier; changed = true;
        _rpgCheckComplete(q, st);
      }
    }
  });
  if (changed) { saveGame(); renderRpgQuestPanel(); }
}

// จาก hub.js — NPC talk trigger
function rpgOnNpcTalk(npcId) {
  if (G.gameMode !== 'fullrpg') return;
  RPG_QUESTS.forEach(q => {
    const st = _rpgState(q.id);
    if (!st.active || st.done) return;
    if (q.type === 'chain' && q.trigger === `npc_${npcId}`) {
      st.progress = 1;
      _rpgCheckComplete(q, st);
      saveGame();
      renderRpgQuestPanel();
    }
  });
}

// ──────────────────────────────────────────────────────────────
// COMPLETE LOGIC
// ──────────────────────────────────────────────────────────────

// Objective reached → mark READY TO TURN IN (no auto-reward). The player must
// press "ส่งเควส" in the quest menu to claim. Keeps the quest active+ready.
function _rpgCheckComplete(q, st) {
  if ((st.progress||0) < (q.required||1)) return;
  if (st.done || st.ready) return;
  st.ready = true;          // shows a "ส่งเควส" button in the panel
  logBattle(`<span class="log-sys">✅ เป้าหมายเควสสำเร็จ: <b>${q.name}</b> — ไปกดส่งเควสที่เมนูเควส!</span>`);
  if (typeof playSound === 'function') playSound('exp');
  if (typeof updateNavBadges === 'function') updateNavBadges();
}

// Player presses "ส่งเควส" — grant reward + finish (and unlock chain next).
function rpgTurnInQuest(id) {
  const q = RPG_QUESTS.find(x => x.id === id);
  if (!q) return;
  const st = _rpgState(id);
  if (st.done || !st.ready) return;
  if ((st.progress||0) < (q.required||1)) return;  // safety
  st.done = true; st.active = false; st.ready = false;
  _rpgCompleteQuest(q);
  // chain story: auto-start the next chapter (kill/explore types continue the
  // story without an NPC trip; pure NPC-talk chapters still wait for the talk).
  if (q.chainNext) {
    const nq = RPG_QUESTS.find(x => x.id === q.chainNext);
    const nextSt = _rpgState(q.chainNext);
    if (nq && !nq.trigger && G.level >= (nq.minLevel || 1)) {
      nextSt.active = true; nextSt.progress = 0;
      // retroactive credit for the new chapter too
      if (nq.type === 'explore') {
        const reached = G.currentZone === nq.targetZone || ((G.zoneProgress||{})[nq.targetZone]||0) > 0;
        if (reached) { nextSt.progress = nq.required||1; _rpgCheckComplete(nq, nextSt); }
      } else if (nq.type === 'kill') {
        if ((G.defeatedMonsters||{})[`${nq.targetZone}_${nq.targetTier}`]) { nextSt.progress = Math.min(nq.required||1,1); _rpgCheckComplete(nq, nextSt); }
      }
    } else {
      nextSt.active = false;
    }
  }
  saveGame();
  if (typeof updateNavBadges === 'function') updateNavBadges();
  renderRpgQuestPanel();
}

function _rpgCompleteQuest(q) {
  const r = q.reward;
  if (r.exp)   giveExp(r.exp);
  if (r.gold)  { G.gold += r.gold; if (typeof rpgOnGoldGain === 'function') {} } // avoid loop
  if (r.chest && typeof grantChestReward==="function") grantChestReward(r.chest,1);
  const chestLabel = { common:'ธรรมดา', uncommon:'พิเศษ', rare:'หายาก', boss:'บอส' };
  const icon = q.type === 'chain' ? '📖' : q.type === 'explore' ? '🗺' : q.type === 'collect' ? '💎' : q.type === 'skilltree' ? '🌳' : '🏆';
  logBattle(`<span class="log-exp">${icon} เควสสำเร็จ! <b>${q.name}</b> — +${(r.exp||0).toLocaleString()} EXP 💰+${r.gold||0}${r.chest ? ` 🎁 ไอเทม${chestLabel[r.chest]}` : ''}</span>`);
  if (q.lore) logBattle(`<span class="log-sys" style="color:#a88;font-style:italic">📜 ${q.lore}</span>`);
  if (typeof playSound === 'function') playSound('exp');
  if (typeof checkAchievements === 'function') checkAchievements();
  if (typeof updateTopBar === 'function') updateTopBar();
  renderRpgQuestPanel();
  renderRpgDailyPanel();
}

// ──────────────────────────────────────────────────────────────
// DAILY QUEST — fullrpg mode
// ──────────────────────────────────────────────────────────────

function _rpgDailyKey() { return new Date().toISOString().slice(0,10); }

function rpgGenerateDaily() {
  const today = _rpgDailyKey();
  if (!G.rpgDaily) G.rpgDaily = {};
  if (G.rpgDaily.date === today && G.rpgDaily.quests?.length === 3) return;
  // pick 3 suitable quests
  const lv = G.level || 1;
  const pool = RPG_DAILY_POOL.filter(q => {
    if (q.type === 'daily_zonekill' && q.zone === 2 && lv < 10) return false;
    if (q.type === 'daily_zonekill' && q.zone === 3 && lv < 25) return false;
    if (q.type === 'daily_zonekill' && q.zone === 4 && lv < 40) return false;
    if (q.type === 'daily_zonekill' && q.zone === 5 && lv < 60) return false;
    if (q.type === 'daily_zonekill' && q.zone === 6 && lv < 80) return false;
    if (q.type === 'daily_boss'     && lv < 8)  return false;
    if (q.type === 'daily_equip'    && lv < 5)  return false;
    return true;
  });
  const chosen = [];
  const used = new Set();
  while (chosen.length < 3 && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    const q = pool.splice(idx, 1)[0];
    if (!used.has(q.type)) { chosen.push({...q, progress:0, done:false}); used.add(q.type); }
    else chosen.push({...q, progress:0, done:false});
  }
  G.rpgDaily = { date:today, quests:chosen };
  saveGame();
}

function _rpgDailyKill(zoneId, tier) {
  if (!G.rpgDaily?.quests) return;
  const today = _rpgDailyKey();
  if (G.rpgDaily.date !== today) { rpgGenerateDaily(); return; }
  let changed = false;
  G.rpgDaily.quests.forEach(q => {
    if (q.done) return;
    if (q.type === 'daily_kill') { q.progress++; changed = true; _rpgDailyCheck(q); }
    if (q.type === 'daily_boss' && tier === 6) { q.progress++; changed = true; _rpgDailyCheck(q); }
    if (q.type === 'daily_zonekill' && q.zone === zoneId) { q.progress++; changed = true; _rpgDailyCheck(q); }
  });
  if (changed) { saveGame(); renderRpgDailyPanel(); }
}

function _rpgDailyChest() {
  if (!G.rpgDaily?.quests) return;
  G.rpgDaily.quests.forEach(q => {
    if (q.done || q.type !== 'daily_chest') return;
    q.progress++; _rpgDailyCheck(q);
  });
  saveGame(); renderRpgDailyPanel();
}

function _rpgDailyGold(amount) {
  if (!G.rpgDaily?.quests) return;
  G.rpgDaily.quests.forEach(q => {
    if (q.done || q.type !== 'daily_gold') return;
    q.progress = (q.progress||0) + amount; _rpgDailyCheck(q);
  });
  saveGame(); renderRpgDailyPanel();
}

function _rpgDailyEquipCheck() {
  if (!G.rpgDaily?.quests) return;
  const slots = Object.values(G.equippedSlots||{}).filter(Boolean).length;
  G.rpgDaily.quests.forEach(q => {
    if (q.done || q.type !== 'daily_equip') return;
    if (slots >= q.required) { q.progress = slots; _rpgDailyCheck(q); }
  });
  saveGame(); renderRpgDailyPanel();
}

function _rpgDailyCheck(q) {
  if ((q.progress||0) < q.required) return;
  q.done = true;
  const r = q.reward;
  if (r.exp)   giveExp(r.exp);
  if (r.gold)  G.gold += r.gold;
  if (r.chest && typeof grantChestReward==="function") grantChestReward(r.chest,1);
  const chestLabel = { common:'ธรรมดา', uncommon:'พิเศษ', rare:'หายาก', boss:'บอส' };
  logBattle(`<span class="log-exp">⭐ ภารกิจวันนี้สำเร็จ! <b>${q.name}</b> — +${(r.exp||0).toLocaleString()} EXP 💰+${r.gold||0}${r.chest ? ` 🎁 ไอเทม${chestLabel[r.chest]}` : ''}</span>`);
  if (typeof playSound === 'function') playSound('exp');
}

// ──────────────────────────────────────────────────────────────
// NPC QUEST PANEL (เปิดจาก Hub)
// ──────────────────────────────────────────────────────────────

// accept a quest from the NPC panel WITHOUT closing it — refresh in place so
// the player can keep accepting the next quest (no more "bounce back to talk").
function rpgAcceptQuestFromNpc(id, npcId) {
  rpgAcceptQuest(id);
  // re-render the same NPC quest list so the accepted quest updates inline
  if (typeof rpgShowNpcQuests === 'function') rpgShowNpcQuests(npcId);
}

function rpgShowNpcQuests(npcId) {
  if (G.gameMode !== 'fullrpg') return;
  const questIds = NPC_QUEST_MAP[npcId] || [];
  const quests = RPG_QUESTS.filter(q => questIds.includes(q.id));
  const chestLabel = { common:'ธรรมดา', uncommon:'พิเศษ', rare:'หายาก', boss:'บอส' };
  const typeIcon = { kill:'⚔', explore:'🗺', collect:'💎', chain:'📖', skilltree:'🌳' };

  if (!quests.length) {
    logBattle('<span class="log-sys">ยังไม่มีเควสจาก NPC นี้</span>');
    return;
  }

  // open hub panel
  const panel = document.getElementById('hub-panel');
  const body  = document.getElementById('hub-panel-body');
  const title = document.getElementById('hub-panel-title');
  if (!panel || !body) return;
  title.innerHTML = '📜 เควสจาก NPC';
  panel.style.display = 'block';

  let html = '';
  quests.forEach(q => {
    const st = _rpgState(q.id);
    const locked = G.level < q.minLevel || (q.chainFrom && !_rpgState(q.chainFrom).done);
    const statusCls = st.done ? 'rpq-npc-done' : st.active ? 'rpq-npc-active' : locked ? 'rpq-npc-locked' : '';
    const statusLabel = st.done ? '✅ เสร็จแล้ว' : st.active ? `⏳ กำลังทำ (${st.progress||0}/${q.required||1})` : locked ? `🔒 LV${q.minLevel}` : '';
    const btnHtml = (!st.done && !st.active && !locked)
      ? `<button class="rpq-btn-accept" onclick="rpgAcceptQuestFromNpc('${q.id}','${npcId}')">รับเควส</button>` : '';
    html += `<div class="rpq-npc-card ${statusCls}">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-family:'Chakra Petch',sans-serif;font-size:.85rem;color:var(--text)">${typeIcon[q.type]||'📜'} ${q.name}</span>
        <span style="font-size:.72rem;color:#888">${statusLabel}</span>
      </div>
      <div style="font-size:.78rem;color:var(--text2);margin:.2rem 0">${q.desc}</div>
      <div style="font-size:.75rem;color:var(--gold)">🏆 +${(q.reward.exp||0).toLocaleString()} EXP 💰+${q.reward.gold||0}${q.reward.chest ? ` 🎁 ไอเทม${chestLabel[q.reward.chest]}` : ''}</div>
      ${q.lore ? `<div style="font-size:.7rem;color:#a88;font-style:italic;margin-top:.2rem">📜 ${q.lore}</div>` : ''}
      ${btnHtml}
    </div>`;
  });
  body.innerHTML = html;
}

// ──────────────────────────────────────────────────────────────
// RENDER — Quest Panel (ซ้าย) + Daily Panel (tab ขวา)
// ──────────────────────────────────────────────────────────────

function renderRpgQuestPanel() {
  const panel = document.getElementById('rpg-quest-panel');
  if (!panel) return;
  if (G.gameMode !== 'fullrpg') return;

  if (!G.rpgQuests) G.rpgQuests = {};
  const active    = rpgGetActiveQuests().filter(q => !q.chainFrom && !q.chainNext && q.type !== 'chain');
  const available = rpgGetAvailableQuests(); // already excludes chain quests
  const doneCount = RPG_QUESTS.filter(q => _rpgState(q.id).done).length;
  const chestLabel = { common:'ธรรมดา', uncommon:'พิเศษ', rare:'หายาก', boss:'บอส' };
  const typeIcon   = { kill:'⚔', explore:'🗺', collect:'💎', chain:'📖', skilltree:'🌳' };
  const zoneColors = { 1:'#44ff88',2:'#44ccff',3:'#ff7744',4:'#dd88ff',5:'#99aaff',6:'#ffaa00',0:'#cc88ff' };

  let html = `<div style="font-size:.72rem;color:#666;text-align:right;margin-bottom:.3rem">เสร็จแล้ว ${doneCount}/${RPG_QUESTS.length} เควส</div>`;

  // Active quests
  if (active.length) {
    html += `<div class="rpq-section-title">⚔ กำลังทำ (${active.length})</div>`;
    active.forEach(q => {
      const st  = _rpgState(q.id);
      const req = q.required || 1;
      const pct = Math.min(100, Math.floor(((st.progress||0)/req)*100));
      const zc  = zoneColors[q.zone] || '#aaa';
      const zoneName = q.zone > 0 ? (ZONES.find(z=>z.id===q.zone)?.name||'') : 'ทุกที่';
      const turnInBtn = st.ready
        ? `<button class="rpq-btn-accept" style="border-color:#4caf50;color:#7dff7d;background:linear-gradient(135deg,#0f2e0f,#1a3a1a)" onclick="rpgTurnInQuest('${q.id}')">📨 ส่งเควส (รับรางวัล)</button>`
        : `<button class="rpq-btn-abandon" onclick="rpgAbandonQuest('${q.id}')">✕ ยกเลิก</button>`;
      html += `<div class="rpq-card rpq-card-active${st.ready?' rpq-card-ready':''}">
        <div class="rpq-card-top">
          <span class="rpq-name">${typeIcon[q.type]||'📜'} ${q.name}</span>
          <span class="rpq-zone" style="color:${zc}">${zoneName}</span>
        </div>
        <div class="rpq-desc">${q.desc}</div>
        <div class="rpq-progress-wrap"><div class="rpq-progress-bar" style="width:${pct}%"></div></div>
        <div class="rpq-progress-text">${st.ready?'<b style="color:#7dff7d">✅ พร้อมส่ง!</b>':`${st.progress||0}/${req} (${pct}%)`}</div>
        <div class="rpq-reward">🏆 +${(q.reward.exp||0).toLocaleString()} EXP &nbsp;💰 +${q.reward.gold||0}${q.reward.chest?` 🎁 ไอเทม${chestLabel[q.reward.chest]}`:''}
        </div>
        ${turnInBtn}
      </div>`;
    });
  }

  // Story chain highlight — all pending story/chain quests
  const storyQuests = RPG_QUESTS.filter(q => q.type === 'chain' || q.chainFrom || q.chainNext);
  const activeStory = storyQuests.filter(q => _rpgState(q.id).active);
  const nextStory   = storyQuests.find(q => {
    const st = _rpgState(q.id);
    return !st.done && !st.active && G.level >= q.minLevel && (!q.chainFrom || _rpgState(q.chainFrom).done);
  });

  // Show active story quests inline with other active (already shown above),
  // show next story card separately
  if (nextStory || activeStory.length > 0) {
    html += `<div class="rpq-section-title" style="color:#a88">📖 เรื่องราว</div>`;
  }

  // active story quests progress cards
  activeStory.forEach(q => {
    const st  = _rpgState(q.id);
    const req = q.required || 1;
    const pct = Math.min(100, Math.floor(((st.progress||0)/req)*100));
    const zc  = zoneColors[q.zone] || '#aaa';
    const zoneName = q.zone > 0 ? (ZONES.find(z=>z.id===q.zone)?.name||'') : 'ทุกที่';
    const storyTurnIn = st.ready
      ? `<button class="rpq-btn-accept" style="border-color:#4caf50;color:#7dff7d;background:linear-gradient(135deg,#0f2e0f,#1a3a1a)" onclick="rpgTurnInQuest('${q.id}')">📨 ส่งเควส (รับรางวัล)</button>`
      : `<button class="rpq-btn-abandon" onclick="rpgAbandonQuest('${q.id}')">✕ ยกเลิก</button>`;
    html += `<div class="rpq-card rpq-card-active${st.ready?' rpq-card-ready':''}" style="border-color:#a88">
      <div class="rpq-card-top">
        <span class="rpq-name" style="color:#daa">📖 ${q.name}</span>
        <span class="rpq-zone" style="color:${zc}">${zoneName}</span>
      </div>
      <div class="rpq-desc">${q.desc}</div>
      <div class="rpq-progress-wrap"><div class="rpq-progress-bar" style="width:${pct}%;background:linear-gradient(90deg,#a55,#daa)"></div></div>
      <div class="rpq-progress-text">${st.ready?'<b style="color:#7dff7d">✅ พร้อมส่ง!</b>':`${st.progress||0}/${req} (${pct}%)`}</div>
      <div class="rpq-reward" style="color:#daa">🏆 +${(q.reward.exp||0).toLocaleString()} EXP 💰+${q.reward.gold||0}</div>
      ${storyTurnIn}
    </div>`;
  });

  // next story card (to accept)
  if (nextStory) {
    const zc = zoneColors[nextStory.zone] || '#aaa';
    const zoneName = nextStory.zone > 0 ? (ZONES.find(z=>z.id===nextStory.zone)?.name||'') : 'ทุกที่';
    // story quests are always started by talking to the NPC at the Hub
    const actionHtml = `<div style="font-size:.75rem;color:#fa8;margin-top:.3rem">💬 ไปพูดกับ <b>นักวิชาการ (Aldric)</b> ที่หมู่บ้านเพื่อเริ่มเควสนี้</div>`;
    html += `<div class="rpq-card" style="border-color:#a88;background:linear-gradient(135deg,#1a0a0a,#0e0505)">
      <div class="rpq-card-top">
        <span class="rpq-name" style="color:#daa">📖 ${nextStory.name}</span>
        <span class="rpq-zone" style="color:${zc}">${zoneName}</span>
      </div>
      <div class="rpq-desc">${nextStory.desc}</div>
      ${nextStory.lore?`<div style="font-size:.72rem;color:#a88;font-style:italic;margin:.2rem 0">📜 ${nextStory.lore}</div>`:''}
      <div class="rpq-reward" style="color:#daa">🏆 +${(nextStory.reward.exp||0).toLocaleString()} EXP 💰+${nextStory.reward.gold||0}</div>
      ${actionHtml}
    </div>`;
  }

  // Available quests — แบ่งตาม type group
  if (available.length) {
    // แสดง kill quests ก่อน (ส่วนใหญ่ทำได้ทันที), ตามด้วย collect/explore/skilltree
    const killQ     = available.filter(q => q.type === 'kill');
    const otherQ    = available.filter(q => q.type !== 'kill');
    const showKill  = killQ.slice(0, 6);   // แสดงสูงสุด 6 kill quests
    const showOther = otherQ;              // แสดงทุก non-kill quests (collect/explore/skilltree)
    const hiddenKill = killQ.length - showKill.length;

    // quest menu is VIEW-ONLY now: kill quests are auto-accepted by entering
    // their zone; other quests are taken by talking to the matching NPC.
    const _howToGet = (q) => q.type === 'kill'
      ? '⚔ เข้าด่านโซนนี้เพื่อรับอัตโนมัติ'
      : '💬 ไปคุยกับ NPC ที่หมู่บ้านเพื่อรับ';
    const renderQCard = (q) => {
      const zc = zoneColors[q.zone] || '#aaa';
      const zoneName = q.zone > 0 ? (ZONES.find(z=>z.id===q.zone)?.name||'') : 'ทุกที่';
      return `<div class="rpq-card">
        <div class="rpq-card-top">
          <span class="rpq-name">${typeIcon[q.type]||'📜'} ${q.name}</span>
          <span class="rpq-zone" style="color:${zc}">${zoneName}</span>
        </div>
        <div class="rpq-desc">${q.desc}</div>
        <div class="rpq-reward">🏆 +${(q.reward.exp||0).toLocaleString()} EXP 💰+${q.reward.gold||0}${q.reward.chest?` 🎁 ไอเทม${chestLabel[q.reward.chest]}`:''}
        </div>
        <div style="font-size:.72rem;color:#88aadd;margin-top:.3rem">${_howToGet(q)}</div>
      </div>`;
    };

    if (showKill.length) {
      html += `<div class="rpq-section-title">📜 เควส Kill (${killQ.length})</div>`;
      showKill.forEach(q => { html += renderQCard(q); });
      if (hiddenKill > 0) html += `<div style="font-size:.72rem;color:#666;text-align:center;margin:.2rem 0">+${hiddenKill} เควสเพิ่มเติม (เลเวลอัพเพื่อปลดล็อค)</div>`;
    }
    if (showOther.length) {
      html += `<div class="rpq-section-title">💎 เควสพิเศษ (${showOther.length})</div>`;
      showOther.forEach(q => { html += renderQCard(q); });
    }
  }

  const activeStoryCheck = storyQuests.filter(q => _rpgState(q.id).active);
  if (!active.length && !available.length && !nextStory && !activeStoryCheck.length) {
    html += `<div style="color:var(--text2);text-align:center;padding:1.5rem;font-size:.85rem">
      ยังไม่มีเควสที่รับได้<br>
      <span style="font-size:.75rem">🗺 ไปพูดคุยกับ NPC ที่ Hub<br>หรือ เลเวลอัพเพื่อเปิดเควสใหม่</span>
    </div>`;
  }

  panel.innerHTML = html;
}

function renderRpgDailyPanel() {
  const panel = document.getElementById('rpg-daily-panel');
  if (!panel) return;
  if (G.gameMode !== 'fullrpg') return;

  rpgGenerateDaily();
  const today = _rpgDailyKey();
  if (!G.rpgDaily?.quests) { panel.innerHTML = '<div style="color:#666">ยังไม่มีภารกิจวันนี้</div>'; return; }

  const chestLabel = { common:'ธรรมดา', uncommon:'พิเศษ', rare:'หายาก', boss:'บอส' };
  const typeLabel  = {
    daily_kill:'⚔ ฆ่ามอน', daily_boss:'👑 ฆ่าบอส',
    daily_chest:'📦 เปิดหีบ', daily_zonekill:'🗺 ล่าในโซน',
    daily_gold:'💰 หาทอง', daily_equip:'🛡 สวมอุปกรณ์'
  };

  const doneCnt = G.rpgDaily.quests.filter(q=>q.done).length;
  let html = `<div style="font-size:.75rem;color:var(--gold);margin-bottom:.4rem">📅 วันนี้ ${today} — เสร็จ ${doneCnt}/3</div>`;
  G.rpgDaily.quests.forEach(q => {
    const pct = Math.min(100, Math.floor(((q.progress||0)/(q.required||1))*100));
    html += `<div class="rpq-card${q.done?' rpq-card-active':''}">
      <div style="display:flex;justify-content:space-between">
        <span style="font-size:.82rem;font-weight:700;color:${q.done?'#7dff7d':'var(--text)'}">${typeLabel[q.type]||'📜'} ${q.name}</span>
        <span style="font-size:.7rem;color:#888">${q.done?'✅ เสร็จ':''}</span>
      </div>
      <div style="font-size:.77rem;color:var(--text2);margin:.2rem 0">${q.desc}</div>
      ${!q.done?`<div class="rpq-progress-wrap"><div class="rpq-progress-bar" style="width:${pct}%;background:linear-gradient(90deg,#fa0,#ff0)"></div></div>
      <div class="rpq-progress-text">${q.progress||0}/${q.required} (${pct}%)</div>`:''}
      <div class="rpq-reward" style="color:${q.done?'#7dff7d':'var(--gold)'}">🏆 +${(q.reward.exp||0).toLocaleString()} EXP 💰+${q.reward.gold||0}${q.reward.chest?` 🎁 ไอเทม${chestLabel[q.reward.chest]}`:''}</div>
    </div>`;
  });
  panel.innerHTML = html;
}
