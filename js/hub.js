// ============================================================
// HUB — เมืองพักแรม: Full-screen scene, NPC sprites, dialogue
// ============================================================

// ---------- NPC sprites — PNG where available, SVG fallback ----------

const _npcImg = (file, alt) =>
  `<img src="assets/sprites/${file}" alt="${alt}"
    style="width:400px;height:400px;image-rendering:pixelated;display:block;background:transparent;"
    onerror="this.style.display='none'">`;

const HUB_NPC_SPRITES = {

  innkeeper: _npcImg('Rosa.png', 'Rosa'),

  quest_giver: _npcImg('aldric.png', 'Aldric'),

  blacksmith: _npcImg('goran.png', 'Goran'),

  sage: _npcImg('Miriel.png', 'Miriel'),

  tailor: _npcImg('lila.png', 'Lila'),
};

// ---------- NPC data ----------

const HUB_NPCS = [
  {
    id: 'innkeeper',
    name: 'เจ้าของโรงแรม',
    title: 'Rosa — ผู้ดูแลโรงแรม',
    color: '#ff9966',
    pos: '10%',
    floatDur: '3.2s', floatDel: '0s',
    greeting: () => {
      const hpPct = G.hp / G.maxHp;
      if (hpPct >= 1) return 'ยินดีต้อนรับ! คุณดูสดชื่นดีนะ ไม่จำเป็นต้องพักหรือเปล่า?';
      if (hpPct < 0.3) return 'โอ้โห! คุณได้รับบาดเจ็บหนักมาก! มาพักก่อนเลย ฉันจะดูแลเอง!';
      return 'ยินดีต้อนรับกลับมา นักผจญภัย! ต้องการพักผ่อนหรือเปล่า?';
    },
    actions: () => {
      const maxHp = G.maxHp + (typeof getEquippedStatBonus === 'function' ? (getEquippedStatBonus().hp || 0) : 0);
      const missing = maxHp - G.hp;
      const healCost = Math.max(0, Math.floor(missing * 3)); // แพงขึ้น — ตายมีราคา (gold sink)
      const freeHeal = Math.floor(maxHp * 0.2);
      const canFreeHeal = !G.hubFreeHealUsed || G.hubFreeHealDate !== new Date().toDateString();
      const acts = [];
      if (missing > 0) {
        acts.push({ label:`💊 ฟื้นฟู HP เต็ม (💰${healCost})`, style:'green', disabled:G.gold<healCost, onclick:()=>hubHealFull(healCost,maxHp) });
        acts.push({ label:`🌿 พักสั้น +${freeHeal} HP (ฟรีวันละครั้ง)`, style: canFreeHeal?'blue':'gray', disabled:!canFreeHeal||G.hp>=maxHp, onclick:()=>hubFreeHeal(freeHeal,maxHp) });
      } else {
        acts.push({ label:'❤ HP ของคุณเต็มแล้ว!', style:'gray', disabled:true, onclick:()=>{} });
      }
      if (G.gameMode === 'fullrpg') {
        acts.push({ label:'💰 เควส Gold', style:'gold', onclick:()=>rpgShowNpcQuests('innkeeper') });
      }
      acts.push({ label:'🚶 ลาก่อน', style:'close', onclick:()=>closeHubDialogue() });
      return acts;
    },
  },
  {
    id: 'quest_giver',
    name: 'นักวิชาการ',
    title: 'Aldric — ผู้รักษาความรู้',
    color: '#88aaff',
    pos: '28%',
    floatDur: '4s', floatDel: '0.8s',
    greeting: () => {
      if (G.gameMode === 'fullrpg') {
        if (typeof rpgOnNpcTalk === 'function') rpgOnNpcTalk('aldric');
        const avail = (typeof rpgGetAvailableQuests === 'function') ? rpgGetAvailableQuests().length : 0;
        if (!avail) return 'ข้าไม่มีภารกิจใหม่สำหรับเจ้าตอนนี้ — รออีกนิด หรือเลเวลอัพก่อน!';
        return `ข้ามีภารกิจ ${avail} อย่างที่เหมาะกับมือเจ้า สนใจไหม นักผจญภัย?`;
      }
      const pending = getHubQuestsPending();
      if (!pending.length) return 'เยี่ยมมาก! คุณทำภารกิจทุกอย่างเสร็จแล้ว ฉันภูมิใจในตัวคุณ!';
      return `ข้ามีภารกิจ ${pending.length} อย่างที่เหมาะกับมือคุณ สนใจไหม นักผจญภัย?`;
    },
    actions: () => {
      if (G.gameMode === 'fullrpg') return [
        { label:'📜 ดูเควส Full RPG', style:'gold',  onclick:()=>rpgShowNpcQuests('quest_giver') },
        { label:'🚶 ลาก่อน',          style:'close', onclick:()=>closeHubDialogue() },
      ];
      return [
        { label:'📜 ดูภารกิจที่รับได้', style:'gold',  onclick:()=>hubShowQuests()       },
        { label:'🚶 ลาก่อน',            style:'close', onclick:()=>closeHubDialogue() },
      ];
    },
  },
  {
    id: 'blacksmith',
    name: 'ช่างตีเหล็ก',
    title: 'Goran — ช่างแห่งยุค',
    color: '#ff6644',
    pos: '48%',
    floatDur: '2.8s', floatDel: '0.3s',
    greeting: () => {
      const c = Object.values(G.equippedSlots||{}).filter(Boolean).length;
      if (c===0) return 'เฮ้! แกไม่มีอุปกรณ์เลยสักชิ้น ข้าช่วยอะไรไม่ได้ถ้าแกไม่มีของมาให้ตรวจ!';
      if (c < 3)  return `แกใส่อุปกรณ์แค่ ${c}/6 ชิ้น ยังไม่พอนะ ไปเปิดหีบเพิ่มสิ!`;
      return `โอ้ อุปกรณ์ ${c}/6 ชิ้น ไม่เลว! มาให้ข้าตรวจดูซิ`;
    },
    actions: () => {
      const c = Object.values(G.equippedSlots||{}).filter(Boolean).length;
      const acts = [
        { label:`🔍 ตรวจสอบอุปกรณ์ (${c}/6)`, style:'blue',  onclick:()=>hubCheckGear()    },
      ];
      if (G.gameMode === 'fullrpg') {
        acts.push({ label:'💎 เควส Collect', style:'gold', onclick:()=>rpgShowNpcQuests('blacksmith') });
      }
      acts.push({ label:'🚶 ลาก่อน', style:'close', onclick:()=>closeHubDialogue() });
      return acts;
    },
  },
  {
    id: 'sage',
    name: 'นักปราชญ์',
    title: 'Miriel — ผู้รู้แห่งดวงดาว',
    color: '#cc88ff',
    pos: '67%',
    floatDur: '5s', floatDel: '1.5s',
    greeting: () => {
      const tips = [
        `เจ้าอยู่ที่เลเวล ${G.level} แล้ว — EXP จากงานจะเพิ่มขึ้น 15% ทุก 10 เลเวล!`,
        'ทำงานทุกวันเพื่อรักษา Streak และรับโบนัส EXP ×1.5!',
        'งานมหาโหดรับประกันหีบ Rare+ ทุกครั้ง อย่ากลัวความยาก!',
        'สวมอุปกรณ์ให้ครบ 6 ช่อง — ทุก slot ช่วยเพิ่มพลัง!',
        'ดวงจันทร์บอกข้าว่าเจ้ามีศักยภาพมหาศาล... แต่ขึ้นอยู่กับความขยัน',
      ];
      return tips[Math.floor(Math.random() * tips.length)];
    },
    actions: () => {
      if (G.gameMode === 'fullrpg') return [
        { label:'🌳 เควส Skill Tree',  style:'purple', onclick:()=>rpgShowNpcQuests('sage') },
        { label:'🚶 ลาก่อน',           style:'close',  onclick:()=>closeHubDialogue() },
      ];
      return [
        { label:`📊 EXP งาน LV ${G.level}`, style:'purple', onclick:()=>hubShowExpInfo() },
        { label:'🚶 ลาก่อน',               style:'close',  onclick:()=>closeHubDialogue() },
      ];
    },
  },
  {
    id: 'tailor',
    name: 'ช่างเย็บผ้า',
    title: 'Lila — ช่างแห่งรูปลักษณ์',
    color: '#ff88cc',
    pos: '86%',
    floatDur: '3.8s', floatDel: '2.2s',
    greeting: () => {
      const ct = G.cosmeticTier || 1;
      const tier = COSMETIC_TIERS ? COSMETIC_TIERS.find(t => t.tier === ct) : null;
      if (ct >= 6) return 'โอ้! ชุดตำนานนี่หาได้ยากมาก คุณดูสง่างามมากเลย!';
      if (ct >= 4) return `ชุด${tier?.name||''}ของคุณดูยอดเยี่ยม! ยังมีที่ดีกว่านี้อีกนะ~`;
      return 'ยินดีต้อนรับ! ฉัน Lila ช่างเย็บผ้าแห่งเมืองนี้ อยากให้ตัวละครของคุณดูสวยงามไหม?';
    },
    actions: () => [
      { label:'✨ เปลี่ยนรูปลักษณ์', style:'purple', onclick:()=>openCosmeticPanel() },
      { label:'🚶 ลาก่อน',           style:'close',  onclick:()=>closeHubDialogue() },
    ],
  },
];

// ---------- Hub quests ----------

const HUB_QUESTS = [
  { id:'hq_first_task', title:'ก้าวแรก',           desc:'ทำงานให้เสร็จ 1 ชิ้น',               check:()=>G.totalTasks>=1,   reward:{gold:500,exp:200},    rewardText:'💰500 +200 EXP' },
  { id:'hq_kill_10',    title:'นักรบฝึกหัด',        desc:'กำจัดมอนสเตอร์ 10 ตัว',              check:()=>G.totalKills>=10,  reward:{gold:800,chest:'common'},   rewardText:'💰800 📦หีบธรรมดา' },
  { id:'hq_task_5',     title:'นักผจญภัยขยัน',      desc:'ทำงานสะสม 5 ชิ้น',                  check:()=>G.totalTasks>=5,   reward:{gold:1500,exp:500},   rewardText:'💰1500 +500 EXP' },
  { id:'hq_lv10',       title:'เติบโต',              desc:'ถึงเลเวล 10',                        check:()=>G.level>=10,       reward:{gold:2000,chest:'uncommon'}, rewardText:'💰2000 📦หีบพิเศษ' },
  { id:'hq_hard_task',  title:'งานหนัก',             desc:'ทำงานระดับยากหรือมหาโหด 3 ชิ้น',   check:()=>(G.epicTasksDone||0)+(G.hardTasksDone||0)>=3, reward:{gold:3000,chest:'rare'}, rewardText:'💰3000 📦หีบหายาก' },
  { id:'hq_boss',       title:'นักล่าบอส',           desc:'กำจัดบอสให้ได้ 1 ตัว',              check:()=>G.bossKills>=1,    reward:{gold:2500,chest:'rare'},    rewardText:'💰2500 📦หีบหายาก' },
  { id:'hq_streak7',    title:'ความสม่ำเสมอ',        desc:'รักษา Streak ได้ 7 วัน',            check:()=>G.maxStreak>=7,    reward:{gold:5000,exp:2000},  rewardText:'💰5000 +2000 EXP' },
  { id:'hq_lv25',       title:'นักรบผู้เชี่ยวชาญ',  desc:'ถึงเลเวล 25',                       check:()=>G.level>=25,       reward:{gold:8000,chest:'boss'},    rewardText:'💰8000 📦หีบบอส' },
  { id:'hq_task_20',    title:'นักผจญภัยมืออาชีพ',  desc:'ทำงานสะสม 20 ชิ้น',                check:()=>G.totalTasks>=20,  reward:{gold:6000,exp:3000},  rewardText:'💰6000 +3000 EXP' },
  { id:'hq_kill_50',    title:'จอมนักล่า',           desc:'กำจัดมอนสเตอร์ 50 ตัว',             check:()=>G.totalKills>=50,  reward:{gold:4000,chest:'uncommon'}, rewardText:'💰4000 📦หีบพิเศษ×2' },
];

function getHubQuestsPending() {
  if (!G.completedHubQuests) G.completedHubQuests = [];
  return HUB_QUESTS.filter(q => !G.completedHubQuests.includes(q.id) && q.check());
}
function getHubQuestsLocked() {
  if (!G.completedHubQuests) G.completedHubQuests = [];
  return HUB_QUESTS.filter(q => !G.completedHubQuests.includes(q.id) && !q.check());
}

// ---------- open / close ----------

function openHub() {
  renderHubScene();
  closeHubDialogue();
  closeHubPanel();
  const s = document.getElementById('hub-screen');
  if (window.innerWidth <= 700) {
    // sit above the bottom nav (incl. iOS home-indicator inset)
    const nav = document.getElementById('mobile-nav');
    s.style.bottom = (nav ? nav.offsetHeight : 58) + 'px';
  }
  s.style.display = 'block';
  s.style.opacity = '0';
  s.style.transition = 'opacity .5s';
  requestAnimationFrame(() => { s.style.opacity = '1'; });

  // play hub video — loop attribute handles seamless repeat
  const hv = document.getElementById('hub-bg-video');
  if (hv) {
    hv.currentTime = 0;
    hv.style.opacity = '1';
    hv.play().catch(()=>{});
  }
}

function closeHub() {
  const s = document.getElementById('hub-screen');
  s.style.opacity = '0';
  setTimeout(() => { s.style.display = 'none'; s.style.bottom = ''; }, 400);
}

function closeHubDialogue() {
  document.getElementById('hub-dlg').style.display = 'none';
  // remove talking class from all NPCs
  document.querySelectorAll('.hub-npc-slot').forEach(el => el.classList.remove('talking'));
}

function closeHubPanel() {
  document.getElementById('hub-panel').style.display = 'none';
}

// ---------- build background effects ----------

function _buildStars() {
  const el = document.getElementById('hub-stars');
  if (!el || el.children.length > 0) return; // build once
  for (let i = 0; i < 80; i++) {
    const s = document.createElement('div');
    s.className = 'hub-star';
    const size = Math.random() < 0.15 ? 3 : Math.random() < 0.4 ? 2 : 1;
    s.style.cssText = `
      left:${Math.random()*100}%;
      top:${Math.random()*55}%;
      width:${size}px;height:${size}px;
      --dur:${2+Math.random()*4}s;
      --del:${-Math.random()*5}s;
    `;
    el.appendChild(s);
  }
}

function _buildFireflies() {
  const el = document.getElementById('hub-fireflies');
  if (!el || el.children.length > 0) return;
  for (let i = 0; i < 18; i++) {
    const f = document.createElement('div');
    f.className = 'hub-firefly';
    const dx  = (Math.random()*120-60)|0;
    const dy  = (Math.random()*80 -60)|0;
    const dx2 = (Math.random()*160-80)|0;
    const dy2 = (Math.random()*80 -20)|0;
    f.style.cssText = `
      left:${10+Math.random()*80}%;
      top:${35+Math.random()*40}%;
      --dur:${6+Math.random()*8}s;
      --del:${-Math.random()*8}s;
      --dx:${dx}px;--dy:${dy}px;
      --dx2:${dx2}px;--dy2:${dy2}px;
    `;
    el.appendChild(f);
  }
}

function _buildClouds() {
  const el = document.getElementById('hub-clouds');
  if (!el || el.children.length > 0) return;
  const sizes = [
    {w:280,h:70},{w:200,h:55},{w:350,h:80},{w:160,h:45},
    {w:240,h:65},{w:300,h:75},{w:180,h:50}
  ];
  sizes.forEach((s, i) => {
    const c = document.createElement('div');
    c.className = 'hub-cloud';
    c.style.cssText = `
      width:${s.w}px;height:${s.h}px;
      top:${4 + i * 4.5}%;
      --cdur:${38 + i*7}s;
      --cdel:${-i * 6}s;
    `;
    el.appendChild(c);
  });
}

function _buildBirds() {
  const el = document.getElementById('hub-birds');
  if (!el || el.children.length > 0) return;
  const flocks = [
    {top:8,  bdur:22, bdel:0,   bdy:-15, bdy2:8 },
    {top:12, bdur:30, bdel:-8,  bdy:-8,  bdy2:-5},
    {top:6,  bdur:18, bdel:-15, bdy:-20, bdy2:12},
    {top:15, bdur:35, bdel:-22, bdy:5,   bdy2:-3},
  ];
  flocks.forEach(fl => {
    // 3-5 birds per flock, slight offsets
    const count = 3 + (fl.bdur % 3);
    for (let i = 0; i < count; i++) {
      const b = document.createElement('div');
      b.className = 'hub-bird';
      b.style.cssText = `
        top:${fl.top + i * 1.5}%;
        --bdur:${fl.bdur + i*1.5}s;
        --bdel:${fl.bdel - i * 0.8}s;
        --bdy:${fl.bdy + i*3}px;
        --bdy2:${fl.bdy2}px;
      `;
      el.appendChild(b);
    }
  });
}

function _buildCityscape() {
  const el = document.getElementById('hub-cityscape');
  if (!el) return;

  // Night cityscape SVG: 1200×320. Street occupies y=278–320 with lamp posts,
  // animated tiny figures, and an animated horse-cart all INSIDE the SVG
  // so they appear behind the foreground NPC layer.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 320" preserveAspectRatio="xMidYMax meet">
  <defs>
    <!-- night building face gradients -->
    <linearGradient id="bFar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a1230" stop-opacity=".7"/>
      <stop offset="100%" stop-color="#080610" stop-opacity="1"/>
    </linearGradient>
    <linearGradient id="bMid1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1e1210"/>
      <stop offset="100%" stop-color="#080406"/>
    </linearGradient>
    <linearGradient id="bMid2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0e1428"/>
      <stop offset="100%" stop-color="#04080e"/>
    </linearGradient>
    <linearGradient id="bMid3" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#18100a"/>
      <stop offset="100%" stop-color="#060402"/>
    </linearGradient>
    <linearGradient id="bMid4" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#12081e"/>
      <stop offset="100%" stop-color="#060208"/>
    </linearGradient>
    <linearGradient id="roofWarm" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3a1e0a"/>
      <stop offset="100%" stop-color="#150a04"/>
    </linearGradient>
    <linearGradient id="roofSlate" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a1828"/>
      <stop offset="100%" stop-color="#080810"/>
    </linearGradient>
    <linearGradient id="roofViolet" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#20103a"/>
      <stop offset="100%" stop-color="#0a0418"/>
    </linearGradient>
    <!-- night window glows -->
    <radialGradient id="winWarm" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffdd88" stop-opacity=".95"/>
      <stop offset="100%" stop-color="#ff8800" stop-opacity=".15"/>
    </radialGradient>
    <radialGradient id="winCool" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#aaddff" stop-opacity=".9"/>
      <stop offset="100%" stop-color="#1155bb" stop-opacity=".1"/>
    </radialGradient>
    <radialGradient id="winPurple" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#dd99ff" stop-opacity=".9"/>
      <stop offset="100%" stop-color="#660099" stop-opacity=".1"/>
    </radialGradient>
    <!-- lamp glow radial -->
    <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffee88" stop-opacity=".9"/>
      <stop offset="100%" stop-color="#ff9900" stop-opacity="0"/>
    </radialGradient>
    <!-- moonlight ambient on road -->
    <linearGradient id="roadGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a1e2c"/>
      <stop offset="100%" stop-color="#0a0c10"/>
    </linearGradient>
    <!-- night haze overlay -->
    <linearGradient id="nightHaze" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%"  stop-color="#0a1428" stop-opacity=".35"/>
      <stop offset="50%" stop-color="#060a18" stop-opacity=".10"/>
      <stop offset="100%" stop-color="#000408" stop-opacity="0"/>
    </linearGradient>
    <!-- glow filters -->
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="lampFilter" x="-150%" y="-150%" width="400%" height="400%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- ═══ FAR BACKGROUND CITY (hazy, night silhouettes) ═══ -->
  <g opacity=".45" filter="url(#softGlow)">
    <rect x="30"  y="140" width="22" height="180" fill="url(#bFar)" rx="1"/>
    <polygon points="30,140 41,115 52,140" fill="#1a0a28"/>
    <rect x="55"  y="160" width="30" height="160" fill="url(#bFar)" rx="1"/>
    <rect x="88"  y="150" width="18" height="170" fill="url(#bFar)" rx="1"/>
    <polygon points="88,150 97,128 106,150" fill="#160820"/>
    <rect x="160" y="130" width="38" height="190" fill="url(#bFar)" rx="1"/>
    <rect x="200" y="155" width="25" height="165" fill="url(#bFar)" rx="1"/>
    <rect x="228" y="120" width="16" height="200" fill="url(#bFar)" rx="1"/>
    <polygon points="228,120 236,95 244,120" fill="#1a0a28"/>
    <rect x="440" y="90"  width="20" height="230" fill="url(#bFar)" rx="1"/>
    <polygon points="440,90 450,60 460,90" fill="#200a30"/>
    <rect x="462" y="120" width="60" height="200" fill="url(#bFar)" rx="1"/>
    <rect x="524" y="100" width="18" height="220" fill="url(#bFar)" rx="1"/>
    <polygon points="524,100 533,72 542,100" fill="#1a0a28"/>
    <rect x="700" y="140" width="35" height="180" fill="url(#bFar)" rx="1"/>
    <rect x="738" y="120" width="22" height="200" fill="url(#bFar)" rx="1"/>
    <polygon points="738,120 749,95 760,120" fill="#160820"/>
    <rect x="900" y="150" width="40" height="170" fill="url(#bFar)" rx="1"/>
    <rect x="942" y="130" width="25" height="190" fill="url(#bFar)" rx="1"/>
    <rect x="1100" y="145" width="30" height="175" fill="url(#bFar)" rx="1"/>
    <rect x="1133" y="125" width="20" height="195" fill="url(#bFar)" rx="1"/>
    <polygon points="1133,125 1143,98 1153,125" fill="#1a0a28"/>
    <!-- dim far windows -->
    <rect x="36"  y="160" width="5" height="4"  fill="url(#winWarm)" opacity=".5"/>
    <rect x="60"  y="175" width="6" height="4"  fill="url(#winWarm)" opacity=".4"/>
    <rect x="167" y="148" width="7" height="5"  fill="url(#winWarm)" opacity=".5"/>
    <rect x="178" y="148" width="7" height="5"  fill="url(#winCool)" opacity=".4"/>
    <rect x="447" y="108" width="7" height="6"  fill="url(#winPurple)" opacity=".6"/>
    <rect x="468" y="135" width="8" height="6"  fill="url(#winWarm)" opacity=".5"/>
    <rect x="707" y="158" width="7" height="5"  fill="url(#winWarm)" opacity=".5"/>
    <rect x="907" y="168" width="8" height="5"  fill="url(#winCool)" opacity=".4"/>
  </g>

  <!-- ═══ NEAR CITY — LEFT DISTRICT ═══ -->
  <rect x="0"   y="155" width="110" height="165" fill="url(#bMid1)" rx="2"/>
  <rect x="0"   y="128" width="110" height="30" fill="url(#roofWarm)" rx="1"/>
  <polygon points="-2,128 55,95 112,128" fill="#2a1008"/>
  <polygon points="5,128 55,100 105,128" fill="#381408"/>
  <rect x="78"  y="80"  width="14" height="52" fill="#1a0e06" rx="1"/>
  <rect x="76"  y="126" width="18" height="5"  fill="#2a1808"/>
  <rect x="12"  y="168" width="18" height="14" fill="url(#winWarm)" rx="1" filter="url(#glow)"/>
  <rect x="40"  y="168" width="18" height="14" fill="url(#winWarm)" rx="1" filter="url(#glow)"/>
  <rect x="68"  y="168" width="18" height="14" fill="url(#winCool)" rx="1" filter="url(#glow)"/>
  <rect x="11"  y="167" width="20" height="16" fill="none" stroke="#3a1808" stroke-width="1.5" rx="1"/>
  <rect x="39"  y="167" width="20" height="16" fill="none" stroke="#3a1808" stroke-width="1.5" rx="1"/>
  <rect x="67"  y="167" width="20" height="16" fill="none" stroke="#3a1808" stroke-width="1.5" rx="1"/>
  <rect x="12"  y="196" width="18" height="14" fill="url(#winWarm)" rx="1" filter="url(#glow)" opacity=".7"/>
  <rect x="40"  y="196" width="18" height="14" fill="url(#winCool)" rx="1" filter="url(#glow)" opacity=".7"/>
  <rect x="68"  y="196" width="18" height="14" fill="url(#winWarm)" rx="1" filter="url(#glow)" opacity=".8"/>
  <rect x="11"  y="195" width="20" height="16" fill="none" stroke="#3a1808" stroke-width="1.5" rx="1"/>
  <rect x="39"  y="195" width="20" height="16" fill="none" stroke="#3a1808" stroke-width="1.5" rx="1"/>
  <rect x="67"  y="195" width="20" height="16" fill="none" stroke="#3a1808" stroke-width="1.5" rx="1"/>
  <rect x="42"  y="270" width="26" height="50" fill="#0a0604" rx="2"/>
  <rect x="41"  y="268" width="28" height="4"  fill="#3a1e08"/>
  <rect x="22"  y="228" width="66" height="18" fill="#18100a" rx="2"/>
  <rect x="21"  y="226" width="68" height="3"  fill="#2a1408"/>
  <line x1="30"  y1="225" x2="30"  y2="218" stroke="#2a1808" stroke-width="1"/>
  <line x1="80"  y1="225" x2="80"  y2="218" stroke="#2a1808" stroke-width="1"/>

  <rect x="112" y="180" width="55"  height="140" fill="url(#bMid3)" rx="1"/>
  <rect x="112" y="160" width="55"  height="22"  fill="url(#roofSlate)" rx="1"/>
  <polygon points="110,160 139,138 167,160" fill="#101018"/>
  <rect x="120" y="192" width="14" height="12" fill="url(#winCool)" rx="1" filter="url(#glow)" opacity=".7"/>
  <rect x="143" y="192" width="14" height="12" fill="url(#winWarm)" rx="1" filter="url(#glow)" opacity=".8"/>
  <rect x="120" y="218" width="14" height="12" fill="url(#winWarm)" rx="1" filter="url(#glow)" opacity=".6"/>
  <rect x="143" y="218" width="14" height="12" fill="url(#winCool)" rx="1" filter="url(#glow)" opacity=".7"/>

  <!-- ═══ NEAR CITY — LIBRARY / MAGE TOWER (center-left) ═══ -->
  <rect x="170" y="120" width="130" height="200" fill="url(#bMid2)" rx="2"/>
  <rect x="166" y="104" width="138" height="18"  fill="#0c1020" rx="1"/>
  <rect x="166" y="100" width="22"  height="10"  fill="#101428"/>
  <rect x="210" y="100" width="22"  height="10"  fill="#101428"/>
  <rect x="254" y="100" width="22"  height="10"  fill="#101428"/>
  <rect x="280" y="100" width="22"  height="10"  fill="#101428"/>
  <rect x="217" y="50"  width="28"  height="72"  fill="#080c18" rx="1"/>
  <polygon points="215,50 231,18 247,50" fill="#0e1428"/>
  <circle cx="231" cy="16" r="5" fill="#88aaff" filter="url(#softGlow)" opacity=".9"/>
  <rect x="178" y="132" width="22" height="28" fill="url(#winCool)" rx="3" filter="url(#glow)"/>
  <rect x="211" y="132" width="22" height="28" fill="url(#winCool)" rx="3" filter="url(#glow)"/>
  <rect x="244" y="132" width="22" height="28" fill="url(#winPurple)" rx="3" filter="url(#glow)"/>
  <rect x="277" y="132" width="18" height="28" fill="url(#winCool)" rx="3" filter="url(#glow)"/>
  <rect x="177" y="131" width="24" height="30" fill="none" stroke="#141e38" stroke-width="1.5" rx="3"/>
  <rect x="210" y="131" width="24" height="30" fill="none" stroke="#141e38" stroke-width="1.5" rx="3"/>
  <rect x="243" y="131" width="24" height="30" fill="none" stroke="#141e38" stroke-width="1.5" rx="3"/>
  <rect x="276" y="131" width="20" height="30" fill="none" stroke="#141e38" stroke-width="1.5" rx="3"/>
  <rect x="178" y="175" width="22" height="22" fill="url(#winCool)" rx="2" filter="url(#glow)" opacity=".7"/>
  <rect x="211" y="175" width="22" height="22" fill="url(#winWarm)" rx="2" filter="url(#glow)" opacity=".8"/>
  <rect x="244" y="175" width="22" height="22" fill="url(#winPurple)" rx="2" filter="url(#glow)" opacity=".7"/>
  <rect x="277" y="175" width="18" height="22" fill="url(#winCool)" rx="2" filter="url(#glow)" opacity=".6"/>
  <rect x="178" y="212" width="22" height="20" fill="url(#winWarm)" rx="2" filter="url(#glow)" opacity=".7"/>
  <rect x="244" y="212" width="22" height="20" fill="url(#winCool)" rx="2" filter="url(#glow)" opacity=".6"/>
  <rect x="215" y="268" width="32" height="52" fill="#04060c" rx="4"/>
  <ellipse cx="231" cy="268" rx="16" ry="10" fill="#04060c"/>
  <rect x="214" y="265" width="34" height="3"  fill="#141e38"/>

  <!-- ═══ NEAR CITY — CENTER: CATHEDRAL ═══ -->
  <rect x="460" y="170" width="90"  height="150" fill="url(#bMid4)" rx="2"/>
  <rect x="440" y="205" width="22"  height="115" fill="url(#bMid4)" rx="1"/>
  <rect x="548" y="205" width="22"  height="115" fill="url(#bMid4)" rx="1"/>
  <polygon points="458,170 505,138 552,170" fill="#140e20"/>
  <polygon points="460,170 505,142 550,170" fill="#1a1230"/>
  <rect x="491" y="80"  width="28"  height="92"  fill="#0c0818" rx="1"/>
  <polygon points="489,80 505,44 521,80" fill="#140e20"/>
  <line x1="505" y1="44" x2="505" y2="36" stroke="#8877bb" stroke-width="2"/>
  <line x1="501" y1="40" x2="509" y2="40" stroke="#8877bb" stroke-width="2"/>
  <circle cx="505" cy="155" r="16" fill="url(#winPurple)" filter="url(#glow)"/>
  <circle cx="505" cy="155" r="16" fill="none" stroke="#1e1230" stroke-width="2"/>
  <line x1="505" y1="139" x2="505" y2="171" stroke="#1e1230" stroke-width="1.5"/>
  <line x1="489" y1="155" x2="521" y2="155" stroke="#1e1230" stroke-width="1.5"/>
  <rect x="468" y="182" width="16" height="22" fill="url(#winPurple)" rx="2" filter="url(#glow)"/>
  <rect x="526" y="182" width="16" height="22" fill="url(#winCool)" rx="2" filter="url(#glow)"/>
  <rect x="468" y="218" width="16" height="18" fill="url(#winWarm)" rx="2" filter="url(#glow)" opacity=".7"/>
  <rect x="526" y="218" width="16" height="18" fill="url(#winPurple)" rx="2" filter="url(#glow)" opacity=".7"/>
  <rect x="490" y="274" width="30" height="46" fill="#06040c" rx="2"/>
  <polygon points="490,274 505,258 520,274" fill="#06040c"/>

  <!-- ═══ NEAR CITY — GUILD HALL / MARKET ═══ -->
  <rect x="560" y="185" width="120" height="135" fill="url(#bMid1)" rx="2"/>
  <rect x="558" y="168" width="124" height="20"  fill="url(#roofWarm)" rx="1"/>
  <polygon points="556,168 620,142 684,168" fill="#2a1008"/>
  <polygon points="560,168 620,146 680,168" fill="#381408"/>
  <rect x="572" y="124" width="10" height="46" fill="#140a04"/>
  <rect x="650" y="118" width="10" height="52" fill="#140a04"/>
  <rect x="569" y="198" width="20" height="16" fill="url(#winWarm)" rx="1" filter="url(#glow)"/>
  <rect x="601" y="198" width="20" height="16" fill="url(#winCool)" rx="1" filter="url(#glow)"/>
  <rect x="633" y="198" width="20" height="16" fill="url(#winWarm)" rx="1" filter="url(#glow)"/>
  <rect x="665" y="198" width="16" height="16" fill="url(#winCool)" rx="1" filter="url(#glow)"/>
  <rect x="569" y="228" width="20" height="14" fill="url(#winCool)" rx="1" filter="url(#glow)" opacity=".7"/>
  <rect x="633" y="228" width="20" height="14" fill="url(#winWarm)" rx="1" filter="url(#glow)" opacity=".8"/>
  <rect x="601" y="264" width="18" height="56" fill="#080404" rx="2"/>
  <rect x="621" y="264" width="18" height="56" fill="#080404" rx="2"/>
  <rect x="586" y="152" width="68" height="14" fill="#380808" rx="1" opacity=".8"/>

  <!-- ═══ NEAR CITY — RIGHT DISTRICT ═══ -->
  <rect x="760" y="175" width="105" height="145" fill="url(#bMid3)" rx="2"/>
  <rect x="758" y="158" width="109" height="20"  fill="url(#roofSlate)" rx="1"/>
  <polygon points="756,158 812,132 868,158" fill="#0c0c10"/>
  <polygon points="760,158 812,136 864,158" fill="#101018"/>
  <rect x="780" y="96"  width="20" height="64"  fill="#0e0a06" rx="1"/>
  <rect x="778" y="154" width="24" height="6"   fill="#181008"/>
  <rect x="840" y="118" width="14" height="42"  fill="#0e0a06" rx="1"/>
  <ellipse cx="790" cy="96" rx="10" ry="6" fill="#ff5500" filter="url(#softGlow)" opacity=".4"/>
  <rect x="768" y="188" width="20" height="16" fill="url(#winWarm)" rx="1" filter="url(#glow)"/>
  <rect x="800" y="188" width="20" height="16" fill="url(#winWarm)" rx="1" filter="url(#glow)" opacity=".7"/>
  <rect x="832" y="188" width="18" height="16" fill="url(#winCool)" rx="1" filter="url(#glow)" opacity=".8"/>
  <rect x="768" y="228" width="40" height="42" fill="#060402" rx="1"/>
  <rect x="769" y="250" width="38" height="20" fill="#ff4400" opacity=".1" filter="url(#softGlow)"/>
  <rect x="820" y="250" width="34" height="10" fill="#2a3040" rx="1"/>
  <rect x="824" y="244" width="26" height="7"  fill="#344050" rx="1"/>

  <rect x="1050" y="185" width="100" height="135" fill="url(#bMid4)" rx="2"/>
  <rect x="1048" y="160" width="104" height="28" fill="#100c06" rx="1"/>
  <polygon points="1046,160 1100,128 1154,160" fill="#0c0804"/>
  <polygon points="1052,160 1100,132 1148,160" fill="#140e06"/>
  <rect x="1048" y="155" width="104" height="8"  fill="#1e1408" rx="1"/>
  <circle cx="1100" cy="126" r="8" fill="#66ddff" filter="url(#softGlow)" opacity=".85"/>
  <circle cx="1100" cy="126" r="5" fill="#aaffff" opacity=".9"/>
  <rect x="1060" y="198" width="20" height="18" fill="url(#winPurple)" rx="2" filter="url(#glow)"/>
  <rect x="1092" y="198" width="20" height="18" fill="url(#winCool)" rx="2" filter="url(#glow)"/>
  <rect x="1124" y="198" width="18" height="18" fill="url(#winPurple)" rx="2" filter="url(#glow)"/>
  <rect x="1060" y="232" width="20" height="14" fill="url(#winCool)" rx="2" filter="url(#glow)" opacity=".7"/>
  <rect x="1124" y="232" width="18" height="14" fill="url(#winPurple)" rx="2" filter="url(#glow)" opacity=".8"/>
  <rect x="1090" y="270" width="22" height="50" fill="#06040c" rx="3"/>
  <ellipse cx="1101" cy="270" rx="11" ry="8" fill="#06040c"/>

  <rect x="880" y="198" width="80"  height="122" fill="url(#bMid2)" rx="1"/>
  <rect x="878" y="183" width="84"  height="17"  fill="url(#roofSlate)" rx="1"/>
  <polygon points="876,183 920,158 964,183" fill="#0c0c18"/>
  <rect x="888" y="210" width="16" height="14" fill="url(#winCool)" rx="1" filter="url(#glow)" opacity=".7"/>
  <rect x="914" y="210" width="16" height="14" fill="url(#winWarm)" rx="1" filter="url(#glow)" opacity=".8"/>
  <rect x="938" y="210" width="14" height="14" fill="url(#winCool)" rx="1" filter="url(#glow)" opacity=".7"/>

  <rect x="968" y="195" width="78"  height="125" fill="url(#bMid1)" rx="1"/>
  <rect x="966" y="178" width="82"  height="19"  fill="url(#roofWarm)" rx="1"/>
  <polygon points="964,178 1007,150 1050,178" fill="#2a1008"/>
  <rect x="976" y="208" width="16" height="13" fill="url(#winWarm)" rx="1" filter="url(#glow)" opacity=".8"/>
  <rect x="1004" y="208" width="16" height="13" fill="url(#winCool)" rx="1" filter="url(#glow)" opacity=".7"/>
  <rect x="1030" y="208" width="14" height="13" fill="url(#winWarm)" rx="1" filter="url(#glow)" opacity=".8"/>

  <!-- ═══ STREET LEVEL — road + lamps + people + cart ═══ -->
  <!-- cobblestone road strip (y 278–320) -->
  <rect x="0" y="278" width="1200" height="42" fill="url(#roadGrad)"/>
  <rect x="0" y="278" width="1200" height="2" fill="#2a2838"/>
  <!-- cobblestone grid lines -->
  <line x1="0" y1="292" x2="1200" y2="292" stroke="#161420" stroke-width="1" opacity=".7"/>
  <line x1="0" y1="306" x2="1200" y2="306" stroke="#161420" stroke-width="1" opacity=".5"/>
  <line x1="0" y1="314" x2="1200" y2="314" stroke="#161420" stroke-width=".7" opacity=".4"/>

  <!-- ── LAMP POSTS ── (7 evenly spaced) -->
  <!-- lamp at x=80 -->
  <rect x="79" y="232" width="3" height="46" fill="#2a2030" rx="1"/>
  <line x1="80" y1="240" x2="98" y2="234" stroke="#2a2030" stroke-width="2"/>
  <circle cx="99" cy="233" r="5" fill="#ffee88" filter="url(#lampFilter)" opacity=".9"/>
  <ellipse cx="99" cy="250" rx="28" ry="18" fill="url(#lampGlow)" opacity=".5"/>
  <!-- lamp at x=230 -->
  <rect x="229" y="232" width="3" height="46" fill="#2a2030" rx="1"/>
  <line x1="230" y1="240" x2="248" y2="234" stroke="#2a2030" stroke-width="2"/>
  <circle cx="249" cy="233" r="5" fill="#ffee88" filter="url(#lampFilter)" opacity=".9"/>
  <ellipse cx="249" cy="250" rx="28" ry="18" fill="url(#lampGlow)" opacity=".5"/>
  <!-- lamp at x=390 -->
  <rect x="389" y="232" width="3" height="46" fill="#2a2030" rx="1"/>
  <line x1="390" y1="240" x2="408" y2="234" stroke="#2a2030" stroke-width="2"/>
  <circle cx="409" cy="233" r="5" fill="#ffee88" filter="url(#lampFilter)" opacity=".9"/>
  <ellipse cx="409" cy="250" rx="28" ry="18" fill="url(#lampGlow)" opacity=".5"/>
  <!-- lamp at x=550 -->
  <rect x="549" y="232" width="3" height="46" fill="#2a2030" rx="1"/>
  <line x1="550" y1="240" x2="568" y2="234" stroke="#2a2030" stroke-width="2"/>
  <circle cx="569" cy="233" r="5" fill="#ffee88" filter="url(#lampFilter)" opacity=".9"/>
  <ellipse cx="569" cy="250" rx="28" ry="18" fill="url(#lampGlow)" opacity=".5"/>
  <!-- lamp at x=720 -->
  <rect x="719" y="232" width="3" height="46" fill="#2a2030" rx="1"/>
  <line x1="720" y1="240" x2="738" y2="234" stroke="#2a2030" stroke-width="2"/>
  <circle cx="739" cy="233" r="5" fill="#ffee88" filter="url(#lampFilter)" opacity=".9"/>
  <ellipse cx="739" cy="250" rx="28" ry="18" fill="url(#lampGlow)" opacity=".5"/>
  <!-- lamp at x=880 -->
  <rect x="879" y="232" width="3" height="46" fill="#2a2030" rx="1"/>
  <line x1="880" y1="240" x2="898" y2="234" stroke="#2a2030" stroke-width="2"/>
  <circle cx="899" cy="233" r="5" fill="#ffee88" filter="url(#lampFilter)" opacity=".9"/>
  <ellipse cx="899" cy="250" rx="28" ry="18" fill="url(#lampGlow)" opacity=".5"/>
  <!-- lamp at x=1060 -->
  <rect x="1059" y="232" width="3" height="46" fill="#2a2030" rx="1"/>
  <line x1="1060" y1="240" x2="1078" y2="234" stroke="#2a2030" stroke-width="2"/>
  <circle cx="1079" cy="233" r="5" fill="#ffee88" filter="url(#lampFilter)" opacity=".9"/>
  <ellipse cx="1079" cy="250" rx="28" ry="18" fill="url(#lampGlow)" opacity=".5"/>

  <!-- ── WALKING TOWNSPEOPLE (tiny silhouettes, bottom of SVG) ── -->
  <!-- person 1: walks left→right (slow, 28s) starting off-left -->
  <g opacity=".85">
    <animateTransform attributeName="transform" type="translate"
      values="-80,0; 1280,0" dur="28s" repeatCount="indefinite" begin="0s"/>
    <rect x="0" y="281" width="5" height="10" fill="#884422" rx="1"/>
    <ellipse cx="2.5" cy="279" rx="3" ry="3" fill="#e8a870"/>
  </g>
  <!-- person 2: walks right→left (medium, 22s) starting off-right -->
  <g opacity=".8">
    <animateTransform attributeName="transform" type="translate"
      values="1280,0; -80,0" dur="22s" repeatCount="indefinite" begin="-8s"/>
    <rect x="0" y="282" width="5" height="9" fill="#446688" rx="1"/>
    <ellipse cx="2.5" cy="280" rx="3" ry="3" fill="#d4b890"/>
  </g>
  <!-- person 3: walks left→right (faster, 18s) starting off-left -->
  <g opacity=".75">
    <animateTransform attributeName="transform" type="translate"
      values="-80,0; 1280,0" dur="18s" repeatCount="indefinite" begin="-13s"/>
    <rect x="0" y="283" width="4" height="8" fill="#336644" rx="1"/>
    <ellipse cx="2" cy="281" rx="2.5" ry="2.5" fill="#e0c080"/>
  </g>
  <!-- person 4: walks right→left (slow, 32s) starting off-right -->
  <g opacity=".7">
    <animateTransform attributeName="transform" type="translate"
      values="1280,0; -80,0" dur="32s" repeatCount="indefinite" begin="-5s"/>
    <rect x="0" y="281" width="5" height="10" fill="#664488" rx="1"/>
    <ellipse cx="2.5" cy="279" rx="3" ry="3" fill="#f0c090"/>
  </g>
  <!-- person 5: walks left→right (medium, 24s) starting off-left -->
  <g opacity=".8">
    <animateTransform attributeName="transform" type="translate"
      values="-80,0; 1280,0" dur="24s" repeatCount="indefinite" begin="-19s"/>
    <rect x="0" y="282" width="5" height="9" fill="#aa6622" rx="1"/>
    <ellipse cx="2.5" cy="280" rx="3" ry="3" fill="#e8b888"/>
  </g>

  <!-- ── HORSE CART (rolls left→right, 36s loop) ── -->
  <g opacity=".8">
    <animateTransform attributeName="transform" type="translate"
      values="-120,0; 1320,0" dur="36s" repeatCount="indefinite" begin="-10s"/>
    <!-- horse body -->
    <ellipse cx="10" cy="289" rx="14" ry="7" fill="#2a1808"/>
    <!-- horse head -->
    <ellipse cx="23" cy="283" rx="6" ry="5" fill="#2a1808"/>
    <!-- horse legs -->
    <rect x="4"  y="294" width="3" height="6" fill="#1e1006" rx="1"/>
    <rect x="9"  y="294" width="3" height="6" fill="#1e1006" rx="1"/>
    <rect x="14" y="294" width="3" height="6" fill="#1e1006" rx="1"/>
    <rect x="19" y="294" width="3" height="6" fill="#1e1006" rx="1"/>
    <!-- cart body -->
    <rect x="28" y="282" width="34" height="14" fill="#3a1e08" rx="2"/>
    <!-- cart wheels -->
    <circle cx="36" cy="298" r="6" fill="#1a0c04" stroke="#4a2c10" stroke-width="1.5"/>
    <line x1="36" y1="292" x2="36" y2="304" stroke="#4a2c10" stroke-width="1"/>
    <line x1="30" y1="298" x2="42" y2="298" stroke="#4a2c10" stroke-width="1"/>
    <circle cx="54" cy="298" r="6" fill="#1a0c04" stroke="#4a2c10" stroke-width="1.5"/>
    <line x1="54" y1="292" x2="54" y2="304" stroke="#4a2c10" stroke-width="1"/>
    <line x1="48" y1="298" x2="60" y2="298" stroke="#4a2c10" stroke-width="1"/>
  </g>

  <!-- ═══ NIGHT HAZE OVERLAY ═══ -->
  <rect x="0" y="0" width="1200" height="320" fill="url(#nightHaze)"/>
</svg>`;

  // Inject as inline SVG so SMIL animations (people/cart) work in DOM
  el.innerHTML = svg;
  const svgEl = el.querySelector('svg');
  if (svgEl) {
    svgEl.style.cssText = 'position:absolute;bottom:0;left:0;width:100%;height:100%;';
  }
}

function _buildSmokes() {
  const el = document.getElementById('hub-smokes');
  if (!el || el.children.length > 0) return;
  // chimney positions matching SVG buildings (% from left, % from bottom)
  const chimneys = [
    {left:'6.5%', bottom:'48%', sdx:'-6', sdy:'-70', sdur:7,  sdel:0},
    {left:'48%',  bottom:'55%', sdx:'4',  sdy:'-80', sdur:9,  sdel:-2},
    {left:'50%',  bottom:'50%', sdx:'-4', sdy:'-75', sdur:8,  sdel:-4},
    {left:'65%',  bottom:'48%', sdx:'5',  sdy:'-70', sdur:10, sdel:-1},
    {left:'71%',  bottom:'46%', sdx:'-3', sdy:'-65', sdur:7,  sdel:-3},
    {left:'88%',  bottom:'50%', sdx:'4',  sdy:'-72', sdur:11, sdel:-5},
  ];
  chimneys.forEach(c => {
    for (let j = 0; j < 3; j++) {
      const s = document.createElement('div');
      s.className = 'hub-smoke';
      s.style.cssText = `
        left:${c.left};bottom:${c.bottom};
        width:${18+j*6}px;height:${18+j*6}px;
        --sdx:${Number(c.sdx)+j*4}px;
        --sdy:${c.sdy}px;
        --sdur:${c.sdur+j*1.5}s;
        --sdel:${-j * (c.sdur/3)}s;
      `;
      el.appendChild(s);
    }
  });
}

function _buildLamps() {
  // lamps are now rendered inside the cityscape SVG
}

function _buildCarts() {
  // cart is now rendered inside the cityscape SVG
}

function _buildPeople() {
  // people are now rendered inside the cityscape SVG
}

// ---------- NPC building SVGs (pixel art background structures) ----------

const HUB_BUILDINGS = {

  innkeeper: `<svg class="hub-building" width="160" height="200" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <!-- main building wall -->
    <rect x="4" y="18" width="32" height="32" fill="#2a1e14"/>
    <rect x="4" y="18" width="32" height="2" fill="#3a2e20"/>
    <!-- roof base beam -->
    <rect x="3" y="16" width="34" height="3" fill="#4a3020"/>
    <!-- roof triangular shape -->
    <rect x="8" y="10" width="24" height="2" fill="#3d2810"/>
    <rect x="10" y="7"  width="20" height="2" fill="#3d2810"/>
    <rect x="13" y="4"  width="14" height="2" fill="#3d2810"/>
    <rect x="16" y="2"  width="8"  height="2" fill="#3d2810"/>
    <rect x="18" y="0"  width="4"  height="2" fill="#4a3820"/>
    <!-- roof shingles (dark rows) -->
    <rect x="7" y="12" width="26" height="2" fill="#2a1e0e"/>
    <rect x="9" y="9"  width="22" height="1" fill="#1e1608"/>
    <rect x="12" y="6" width="16" height="1" fill="#1e1608"/>
    <!-- chimney -->
    <rect x="28" y="0" width="5" height="12" fill="#3a2818"/>
    <rect x="27" y="10" width="7" height="2" fill="#4a3828"/>
    <!-- smoke puff -->
    <rect x="28" y="0" width="3" height="1" fill="#888888aa"/>
    <rect x="27" y="0" width="2" height="1" fill="#aaaaaa88"/>
    <!-- door frame -->
    <rect x="16" y="36" width="8"  height="14" fill="#1a1008"/>
    <rect x="15" y="35" width="10" height="1"  fill="#5a3820"/>
    <rect x="15" y="35" width="1"  height="15" fill="#5a3820"/>
    <rect x="25" y="35" width="1"  height="15" fill="#5a3820"/>
    <!-- door panels -->
    <rect x="16" y="37" width="3" height="6" fill="#2a1a0a"/>
    <rect x="21" y="37" width="3" height="6" fill="#2a1a0a"/>
    <!-- door knob -->
    <rect x="21" y="41" width="1" height="1" fill="#cc9933"/>
    <!-- windows left -->
    <rect x="6" y="21" width="8" height="7" fill="#0a1a2a"/>
    <rect x="5" y="20" width="10" height="1" fill="#6a4a28"/>
    <rect x="5" y="27" width="10" height="1" fill="#6a4a28"/>
    <rect x="5" y="20" width="1"  height="8" fill="#6a4a28"/>
    <rect x="15" y="20" width="1" height="8" fill="#6a4a28"/>
    <!-- window glow left -->
    <rect x="7" y="22" width="3" height="2" fill="#ffdd8844"/>
    <rect x="11" y="22" width="2" height="2" fill="#ffdd8844"/>
    <rect x="7" y="24" width="3" height="2" fill="#ffcc6633"/>
    <rect x="11" y="24" width="2" height="2" fill="#ffcc6633"/>
    <!-- window cross bar -->
    <rect x="5" y="23" width="10" height="1" fill="#6a4a28"/>
    <rect x="10" y="20" width="1"  height="8" fill="#6a4a28"/>
    <!-- windows right -->
    <rect x="26" y="21" width="8" height="7" fill="#0a1a2a"/>
    <rect x="25" y="20" width="10" height="1" fill="#6a4a28"/>
    <rect x="25" y="27" width="10" height="1" fill="#6a4a28"/>
    <rect x="25" y="20" width="1"  height="8" fill="#6a4a28"/>
    <rect x="35" y="20" width="1"  height="8" fill="#6a4a28"/>
    <rect x="25" y="23" width="10" height="1" fill="#6a4a28"/>
    <rect x="30" y="20" width="1"  height="8" fill="#6a4a28"/>
    <!-- window glow right -->
    <rect x="27" y="22" width="2" height="2" fill="#ffdd8844"/>
    <rect x="32" y="22" width="2" height="2" fill="#ffdd8844"/>
    <!-- inn sign hanging -->
    <rect x="13" y="28" width="14" height="5" fill="#4a2e10"/>
    <rect x="13" y="28" width="14" height="1" fill="#6a4a20"/>
    <rect x="12" y="27" width="1"  height="7" fill="#5a3a18"/>
    <rect x="27" y="27" width="1"  height="7" fill="#5a3a18"/>
    <!-- sign text (pixel dots) -->
    <rect x="15" y="30" width="2" height="1" fill="#ffdd88"/>
    <rect x="18" y="30" width="3" height="1" fill="#ffdd88"/>
    <rect x="22" y="30" width="3" height="1" fill="#ffdd88"/>
    <!-- flower pots flanking door -->
    <rect x="12" y="45" width="3" height="3" fill="#6a3a18"/>
    <rect x="11" y="44" width="5" height="1" fill="#8a5a28"/>
    <rect x="12" y="42" width="3" height="2" fill="#44aa44"/>
    <rect x="13" y="40" width="1" height="2" fill="#66cc66"/>
    <rect x="25" y="45" width="3" height="3" fill="#6a3a18"/>
    <rect x="24" y="44" width="5" height="1" fill="#8a5a28"/>
    <rect x="25" y="42" width="3" height="2" fill="#44aa44"/>
    <rect x="26" y="40" width="1" height="2" fill="#66cc66"/>
    <!-- step stone -->
    <rect x="14" y="49" width="12" height="1" fill="#3a3020"/>
  </svg>`,

  quest_giver: `<svg class="hub-building" width="160" height="200" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <!-- main tower wall -->
    <rect x="8" y="14" width="24" height="36" fill="#1e2438"/>
    <rect x="8" y="14" width="24" height="2" fill="#2a3050"/>
    <!-- tower top battlements -->
    <rect x="7" y="10"  width="4" height="4" fill="#2a3050"/>
    <rect x="13" y="10" width="4" height="4" fill="#2a3050"/>
    <rect x="19" y="10" width="4" height="4" fill="#2a3050"/>
    <rect x="25" y="10" width="4" height="4" fill="#2a3050"/>
    <rect x="7" y="13"  width="26" height="2" fill="#1a2040"/>
    <!-- observatory dome top -->
    <rect x="14" y="4" width="12" height="7" fill="#3a2870"/>
    <rect x="12" y="7" width="16" height="3" fill="#2a1e5a"/>
    <rect x="11" y="9" width="18" height="2" fill="#1e1848"/>
    <!-- dome shading -->
    <rect x="15" y="4" width="8" height="1" fill="#5a40a0"/>
    <rect x="16" y="5" width="6" height="1" fill="#4a3080"/>
    <!-- telescope through window -->
    <rect x="18" y="5" width="4" height="1" fill="#aaaacc"/>
    <rect x="20" y="4" width="3" height="1" fill="#ccccee"/>
    <!-- side tower extension (left) -->
    <rect x="2" y="22" width="8" height="28" fill="#18202e"/>
    <rect x="2" y="22" width="8" height="1" fill="#22304a"/>
    <rect x="1" y="20" width="10" height="3" fill="#1e2840"/>
    <!-- side tower ext roof -->
    <rect x="3" y="16" width="6" height="5" fill="#141c2e"/>
    <rect x="4" y="14" width="4" height="2" fill="#141c2e"/>
    <!-- door frame -->
    <rect x="16" y="38" width="8"  height="12" fill="#0a0e1a"/>
    <rect x="15" y="37" width="10" height="1"  fill="#3a4888"/>
    <rect x="15" y="37" width="1"  height="13" fill="#3a4888"/>
    <rect x="25" y="37" width="1"  height="13" fill="#3a4888"/>
    <!-- arched door top -->
    <rect x="16" y="36" width="8" height="2" fill="#0e1428"/>
    <rect x="17" y="35" width="6" height="1" fill="#0e1428"/>
    <!-- door star symbol -->
    <rect x="19" y="39" width="2" height="1" fill="#8888ff44"/>
    <rect x="20" y="38" width="1" height="3" fill="#8888ff44"/>
    <!-- windows tower -->
    <rect x="10" y="17" width="6" height="5" fill="#0a0c1e"/>
    <rect x="9"  y="16" width="8" height="1" fill="#3a4880"/>
    <rect x="9"  y="22" width="8" height="1" fill="#3a4880"/>
    <rect x="9"  y="16" width="1" height="7" fill="#3a4880"/>
    <rect x="17" y="16" width="1" height="7" fill="#3a4880"/>
    <rect x="13" y="16" width="1" height="7" fill="#3a4880"/>
    <rect x="9"  y="19" width="8" height="1" fill="#3a4880"/>
    <!-- star glow window left -->
    <rect x="11" y="17" width="2" height="2" fill="#aabbff44"/>
    <rect x="14" y="17" width="2" height="2" fill="#aabbff33"/>
    <!-- window right -->
    <rect x="24" y="17" width="6" height="5" fill="#0a0c1e"/>
    <rect x="23" y="16" width="8" height="1" fill="#3a4880"/>
    <rect x="23" y="22" width="8" height="1" fill="#3a4880"/>
    <rect x="23" y="16" width="1" height="7" fill="#3a4880"/>
    <rect x="31" y="16" width="1" height="7" fill="#3a4880"/>
    <rect x="27" y="16" width="1" height="7" fill="#3a4880"/>
    <rect x="23" y="19" width="8" height="1" fill="#3a4880"/>
    <rect x="25" y="17" width="2" height="2" fill="#aabbff44"/>
    <rect x="28" y="17" width="2" height="2" fill="#aabbff33"/>
    <!-- telescope on roof platform -->
    <rect x="22" y="9" width="1" height="5" fill="#886644"/>
    <rect x="21" y="9" width="3" height="1" fill="#aa8866"/>
    <rect x="23" y="8" width="4" height="1" fill="#99aabb"/>
    <rect x="24" y="7" width="5" height="1" fill="#bbccdd"/>
    <rect x="26" y="6" width="3" height="1" fill="#ddeeff"/>
    <!-- star decorations on wall -->
    <rect x="15" y="24" width="1" height="1" fill="#8888ff33"/>
    <rect x="28" y="26" width="1" height="1" fill="#aabbff33"/>
    <rect x="22" y="29" width="1" height="1" fill="#8888ff22"/>
    <!-- books through window -->
    <rect x="10" y="20" width="2" height="1" fill="#cc4444aa"/>
    <rect x="13" y="20" width="2" height="1" fill="#4444ccaa"/>
    <!-- step stone -->
    <rect x="14" y="49" width="12" height="1" fill="#1e2438"/>
  </svg>`,

  blacksmith: `<svg class="hub-building" width="160" height="200" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <!-- main forge building -->
    <rect x="5" y="20" width="30" height="30" fill="#2a1e14"/>
    <rect x="5" y="20" width="30" height="2" fill="#3a2e1e"/>
    <!-- sloped roof left section -->
    <rect x="5" y="14"  width="18" height="7" fill="#1e150e"/>
    <rect x="5" y="12"  width="18" height="3" fill="#2a1e12"/>
    <rect x="6" y="10"  width="16" height="2" fill="#241808"/>
    <rect x="7" y="8"   width="14" height="2" fill="#1e1408"/>
    <rect x="9" y="6"   width="10" height="2" fill="#181008"/>
    <!-- right wing lower roof -->
    <rect x="22" y="17" width="13" height="4" fill="#241808"/>
    <rect x="22" y="15" width="13" height="3" fill="#2a1e12"/>
    <!-- smoke stack / large chimney -->
    <rect x="10" y="0" width="6" height="14" fill="#2a1a10"/>
    <rect x="9"  y="12" width="8" height="2"  fill="#3a2a18"/>
    <!-- smoke from chimney -->
    <rect x="10" y="0" width="4" height="1" fill="#555555aa"/>
    <rect x="11" y="0" width="5" height="1" fill="#777777aa"/>
    <rect x="9"  y="0" width="3" height="1" fill="#333333aa"/>
    <!-- fire glow from chimney top -->
    <rect x="10" y="1" width="5" height="2" fill="#ff880033"/>
    <rect x="11" y="0" width="3" height="1" fill="#ffaa0055"/>
    <!-- forge opening (large front opening) -->
    <rect x="6" y="28" width="14" height="12" fill="#0a0704"/>
    <rect x="5" y="27" width="16" height="1"  fill="#5a3a20"/>
    <rect x="5" y="27" width="1"  height="13" fill="#5a3a20"/>
    <rect x="21" y="27" width="1" height="13" fill="#5a3a20"/>
    <!-- forge fire glow inside -->
    <rect x="7" y="33" width="11" height="6"  fill="#2a1508"/>
    <rect x="7" y="33" width="11" height="3"  fill="#aa440022"/>
    <rect x="9" y="34" width="7"  height="3"  fill="#ff660044"/>
    <rect x="10" y="35" width="5" height="2"  fill="#ffaa0055"/>
    <rect x="11" y="36" width="3" height="1"  fill="#ffdd0066"/>
    <!-- orange glow spill at forge base -->
    <rect x="6" y="39" width="14" height="2"  fill="#cc440011"/>
    <!-- anvil in front of forge -->
    <rect x="22" y="38" width="10" height="3" fill="#667788"/>
    <rect x="22" y="38" width="10" height="1" fill="#8899aa"/>
    <rect x="23" y="36" width="8"  height="2" fill="#778899"/>
    <rect x="24" y="34" width="6"  height="2" fill="#99aabb"/>
    <rect x="24" y="34" width="6"  height="1" fill="#bbccdd"/>
    <!-- anvil base/legs -->
    <rect x="23" y="41" width="3"  height="3" fill="#556677"/>
    <rect x="28" y="41" width="3"  height="3" fill="#556677"/>
    <rect x="22" y="43" width="10" height="2" fill="#445566"/>
    <!-- hammer leaning on wall -->
    <rect x="26" y="24" width="2" height="10" fill="#886644"/>
    <rect x="24" y="22" width="6" height="3"  fill="#99aabb"/>
    <rect x="24" y="22" width="6" height="1"  fill="#bbccdd"/>
    <!-- bucket of nails/parts -->
    <rect x="23" y="31" width="4" height="3" fill="#554433"/>
    <rect x="22" y="30" width="6" height="1" fill="#665544"/>
    <rect x="23" y="29" width="1" height="1" fill="#aaaaaa"/>
    <rect x="25" y="29" width="1" height="1" fill="#888888"/>
    <rect x="24" y="29" width="1" height="1" fill="#cccccc"/>
    <!-- right window -->
    <rect x="24" y="21" width="7" height="5" fill="#0a0c10"/>
    <rect x="23" y="20" width="9" height="1" fill="#4a3828"/>
    <rect x="23" y="26" width="9" height="1" fill="#4a3828"/>
    <rect x="23" y="20" width="1" height="7" fill="#4a3828"/>
    <rect x="32" y="20" width="1" height="7" fill="#4a3828"/>
    <rect x="27" y="20" width="1" height="7" fill="#4a3828"/>
    <rect x="23" y="23" width="9" height="1" fill="#4a3828"/>
    <!-- orange glow through window -->
    <rect x="24" y="21" width="3" height="2" fill="#ff660022"/>
    <rect x="28" y="21" width="2" height="2" fill="#ff440011"/>
    <!-- grinding wheel lean -->
    <rect x="3" y="36" width="3" height="8"  fill="#887766"/>
    <rect x="2" y="35" width="5" height="2"  fill="#998877"/>
    <rect x="1" y="38" width="3" height="3"  fill="#776655"/>
    <!-- step stone -->
    <rect x="6" y="49" width="14" height="1" fill="#2a1e14"/>
  </svg>`,

  sage: `<svg class="hub-building" width="160" height="200" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <!-- main cottage wall -->
    <rect x="6" y="22" width="28" height="28" fill="#1e1a2a"/>
    <rect x="6" y="22" width="28" height="2" fill="#2a2440"/>
    <!-- thatched roof main -->
    <rect x="5" y="18"  width="30" height="5" fill="#2a2010"/>
    <rect x="7" y="14"  width="26" height="5" fill="#241c0e"/>
    <rect x="9" y="10"  width="22" height="5" fill="#1e1808"/>
    <rect x="11" y="7"  width="18" height="4" fill="#18140a"/>
    <rect x="14" y="4"  width="12" height="4" fill="#141008"/>
    <rect x="16" y="2"  width="8"  height="3" fill="#100e06"/>
    <rect x="18" y="0"  width="4"  height="2" fill="#0e0c06"/>
    <!-- roof texture lines (thatch) -->
    <rect x="5"  y="19" width="30" height="1" fill="#3a2c14"/>
    <rect x="7"  y="15" width="26" height="1" fill="#342810"/>
    <rect x="9"  y="11" width="22" height="1" fill="#2e240e"/>
    <rect x="11" y="8"  width="18" height="1" fill="#28200c"/>
    <!-- mushrooms on roof (mystic) -->
    <rect x="6"  y="17" width="2" height="2" fill="#cc4488"/>
    <rect x="5"  y="16" width="4" height="1" fill="#ee66aa"/>
    <rect x="32" y="17" width="2" height="2" fill="#cc4488"/>
    <rect x="31" y="16" width="4" height="1" fill="#ee66aa"/>
    <rect x="15" y="4"  width="2" height="2" fill="#aa33cc"/>
    <rect x="14" y="3"  width="4" height="1" fill="#cc55ee"/>
    <!-- crystal/orb on roof peak -->
    <rect x="19" y="0" width="2" height="2" fill="#88eeff"/>
    <rect x="18" y="0" width="4" height="1" fill="#aaffff"/>
    <!-- orb glow on peak -->
    <rect x="18" y="0" width="4" height="3" fill="#44ccff11"/>
    <!-- door with arch -->
    <rect x="16" y="36" width="8"  height="14" fill="#0a0810"/>
    <rect x="15" y="35" width="10" height="1"  fill="#4a3880"/>
    <rect x="15" y="35" width="1"  height="15" fill="#4a3880"/>
    <rect x="25" y="35" width="1"  height="15" fill="#4a3880"/>
    <rect x="16" y="34" width="8"  height="2"  fill="#0a0810"/>
    <rect x="17" y="33" width="6"  height="1"  fill="#0a0810"/>
    <!-- rune markings on door -->
    <rect x="17" y="38" width="2" height="3" fill="#8844cc33"/>
    <rect x="21" y="38" width="2" height="3" fill="#8844cc33"/>
    <rect x="17" y="37" width="6" height="1" fill="#8844cc22"/>
    <!-- crystal ball table outside -->
    <rect x="27" y="36" width="10" height="6" fill="#1a1428"/>
    <rect x="27" y="36" width="10" height="1" fill="#2a2440"/>
    <rect x="28" y="32" width="8"  height="5" fill="#141020"/>
    <rect x="27" y="31" width="10" height="1" fill="#1e1838"/>
    <!-- table legs -->
    <rect x="28" y="41" width="2" height="4" fill="#0e0c18"/>
    <rect x="33" y="41" width="2" height="4" fill="#0e0c18"/>
    <!-- crystal ball on table -->
    <rect x="30" y="27" width="6" height="6" fill="#0a0818"/>
    <rect x="31" y="26" width="4" height="1" fill="#8844cc"/>
    <rect x="29" y="27" width="8" height="1" fill="#8844cc"/>
    <rect x="29" y="32" width="8" height="1" fill="#6633aa"/>
    <rect x="30" y="33" width="6" height="1" fill="#4422aa"/>
    <!-- crystal ball glow inner -->
    <rect x="31" y="28" width="4" height="3" fill="#cc88ff44"/>
    <rect x="32" y="28" width="2" height="2" fill="#eeccff66"/>
    <rect x="31" y="27" width="4" height="1" fill="#ffccff55"/>
    <!-- crystal ball stand -->
    <rect x="31" y="33" width="4" height="2" fill="#2a1a4a"/>
    <rect x="30" y="34" width="6" height="1" fill="#3a2a5a"/>
    <rect x="32" y="35" width="2" height="1" fill="#3a2a5a"/>
    <!-- arcane circles on ground outside -->
    <rect x="28" y="44" width="8" height="1" fill="#6633aa22"/>
    <rect x="27" y="45" width="10" height="1" fill="#4422aa11"/>
    <!-- windows -->
    <rect x="7" y="24" width="7" height="7" fill="#08060e"/>
    <rect x="6" y="23" width="9" height="1" fill="#4a3880"/>
    <rect x="6" y="31" width="9" height="1" fill="#4a3880"/>
    <rect x="6" y="23" width="1" height="9" fill="#4a3880"/>
    <rect x="15" y="23" width="1" height="9" fill="#4a3880"/>
    <rect x="6" y="27" width="9" height="1" fill="#4a3880"/>
    <rect x="10" y="23" width="1" height="9" fill="#4a3880"/>
    <!-- purple window glow -->
    <rect x="8" y="24" width="2" height="3" fill="#9944ff33"/>
    <rect x="11" y="24" width="2" height="3" fill="#aa55ff22"/>
    <rect x="8" y="27" width="2" height="3" fill="#7733ff22"/>
    <rect x="11" y="27" width="2" height="3" fill="#8833ff11"/>
    <!-- window right -->
    <rect x="26" y="24" width="7" height="7" fill="#08060e"/>
    <rect x="25" y="23" width="9" height="1" fill="#4a3880"/>
    <rect x="25" y="31" width="9" height="1" fill="#4a3880"/>
    <rect x="25" y="23" width="1" height="9" fill="#4a3880"/>
    <rect x="34" y="23" width="1" height="9" fill="#4a3880"/>
    <rect x="25" y="27" width="9" height="1" fill="#4a3880"/>
    <rect x="29" y="23" width="1" height="9" fill="#4a3880"/>
    <!-- purple glow right window -->
    <rect x="27" y="24" width="2" height="3" fill="#9944ff33"/>
    <rect x="30" y="24" width="2" height="3" fill="#aa55ff22"/>
    <!-- ivy/vines on wall -->
    <rect x="6"  y="32" width="1" height="3" fill="#2a6a18"/>
    <rect x="6"  y="34" width="2" height="1" fill="#2a6a18"/>
    <rect x="7"  y="35" width="1" height="2" fill="#226018"/>
    <rect x="34" y="32" width="1" height="4" fill="#2a6a18"/>
    <rect x="33" y="33" width="1" height="3" fill="#226018"/>
    <rect x="34" y="36" width="2" height="1" fill="#2a6a18"/>
    <!-- step stone -->
    <rect x="14" y="49" width="12" height="1" fill="#1e1a2a"/>
  </svg>`,

  tailor: `<svg class="hub-building" width="160" height="200" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <!-- main building -->
    <rect x="4" y="20" width="32" height="30" fill="#3a1a2e"/>
    <rect x="4" y="20" width="32" height="2" fill="#5a2a4a"/>
    <rect x="4" y="48" width="32" height="2" fill="#2a0e20"/>
    <!-- colorful awning (patchwork) -->
    <rect x="3" y="18" width="34" height="4" fill="#cc44aa"/>
    <rect x="3" y="18" width="8"  height="4" fill="#4488ff"/>
    <rect x="11" y="18" width="9" height="4" fill="#cc44aa"/>
    <rect x="20" y="18" width="8" height="4" fill="#44cc88"/>
    <rect x="28" y="18" width="9" height="4" fill="#ffaa00"/>
    <rect x="3" y="18" width="34" height="1" fill="#ffddee"/>
    <!-- roof shape -->
    <polygon points="2,18 20,8 38,18" fill="#4a1a38"/>
    <polygon points="4,18 20,10 36,18" fill="#5a2a48"/>
    <!-- chimney -->
    <rect x="26" y="6" width="5" height="10" fill="#3a1a2e"/>
    <rect x="25" y="5" width="7" height="2"  fill="#4a2a3e"/>
    <!-- sign: colorful fabric bolts -->
    <rect x="10" y="22" width="20" height="7" fill="#1a0a14"/>
    <rect x="10" y="22" width="20" height="1" fill="#5a3a4a"/>
    <rect x="10" y="29" width="20" height="1" fill="#2a1a24"/>
    <rect x="11" y="23" width="3" height="5" fill="#cc44aa"/>
    <rect x="15" y="23" width="3" height="5" fill="#4488ff"/>
    <rect x="19" y="23" width="3" height="5" fill="#44cc88"/>
    <rect x="23" y="23" width="3" height="5" fill="#ffaa00"/>
    <rect x="27" y="23" width="2" height="5" fill="#ff4444"/>
    <!-- windows (colorful curtains) -->
    <rect x="7"  y="32" width="10" height="10" fill="#0a060e"/>
    <rect x="6"  y="31" width="12" height="12" fill="none" stroke="#5a3a4a" stroke-width="1"/>
    <rect x="7"  y="32" width="4"  height="10" fill="#cc44aa" opacity=".5"/>
    <rect x="11" y="32" width="2"  height="4"  fill="#ff88cc" opacity=".4"/>
    <rect x="23" y="32" width="10" height="10" fill="#0a060e"/>
    <rect x="22" y="31" width="12" height="12" fill="none" stroke="#5a3a4a" stroke-width="1"/>
    <rect x="29" y="32" width="4"  height="10" fill="#4488ff" opacity=".5"/>
    <rect x="27" y="32" width="2"  height="4"  fill="#88aaff" opacity=".4"/>
    <!-- door -->
    <rect x="16" y="38" width="8" height="12" fill="#1a0a14"/>
    <rect x="15" y="37" width="10" height="2" fill="#5a3a4a"/>
    <rect x="16" y="38" width="8" height="1"  fill="#6a4a5a"/>
    <!-- door decoration: fabric strips -->
    <rect x="16" y="39" width="2" height="11" fill="#cc44aa" opacity=".6"/>
    <rect x="18" y="39" width="2" height="11" fill="#4488ff" opacity=".5"/>
    <rect x="20" y="39" width="2" height="11" fill="#44cc88" opacity=".5"/>
    <rect x="22" y="39" width="2" height="11" fill="#ffaa00" opacity=".5"/>
    <!-- step -->
    <rect x="14" y="49" width="12" height="1" fill="#2a1a24"/>
  </svg>`,
};

// ---------- render NPC scene ----------

function renderHubScene() {
  const scene = document.getElementById('hub-scene');
  scene.innerHTML = '';

  const mob = window.innerWidth <= 700;
  // mobile: video 1280x720 cover on portrait → shows ~center 390px of 1398px render width
  // visible horizontal range ≈ px 504–894 of original 1280px video
  // NPC positions calculated as % of screen width to match building locations in video
  // Building A (left) center ≈ screen 15–20%, Building B (right) center ≈ screen 58–65%
  const mobilePos  = ['10%','30%','50%','70%','90%'];
  const bottomPx   = mob ? 35 : 80;
  // name tag inline style — smaller on mobile
  const nameStyle  = mob
    ? `color:${'{color}'};font-size:.62rem;font-weight:700;-webkit-text-stroke:1.5px #000;paint-order:stroke fill;text-shadow:0 1px 6px #000;background:rgba(0,0,0,.55);padding:.06rem .28rem;border-radius:3px;`
    : `color:${'{color}'};font-size:1.1rem;font-weight:700;-webkit-text-stroke:2px #000;paint-order:stroke fill;text-shadow:0 2px 8px #000,0 0 16px ${'{color}'}cc;background:rgba(0,0,0,.45);padding:.15rem .5rem;border-radius:4px;`;

  HUB_NPCS.forEach((npc, idx) => {
    const slot = document.createElement('div');
    slot.className = 'hub-npc-slot';
    slot.id = `hub-npc-${npc.id}`;
    const posLeft = mob ? mobilePos[idx] : (npc.pos || '50%');
    slot.style.cssText = `position:absolute;bottom:${bottomPx}px;left:${posLeft};transform:translateX(-50%);`;

    const sprite = HUB_NPC_SPRITES[npc.id] || HUB_NPC_SPRITES.innkeeper;
    const ns = nameStyle.replace(/\{color\}/g, npc.color);

    slot.innerHTML = `
      <div class="hub-npc-label">${npc.name}</div>
      <div class="hub-npc-sprite hub-npc-float"
           style="--float-dur:${npc.floatDur};--float-del:${npc.floatDel}">${sprite}</div>
      <div class="hub-npc-shadow" style="--float-dur:${npc.floatDur};--float-del:${npc.floatDel}"></div>
      <div class="hub-npc-name-tag" style="${ns}">${npc.name}</div>
      <div class="hub-npc-role-tag" style="color:#fff;font-size:.72rem;-webkit-text-stroke:.8px #000;paint-order:stroke fill;text-shadow:0 1px 4px #000;">${npc.title}</div>
    `;
    slot.onclick = () => openHubNpc(npc.id);
    scene.appendChild(slot);
  });
}

// ---------- open NPC dialogue ----------

function openHubNpc(npcId) {
  const npc = HUB_NPCS.find(n => n.id === npcId);
  if (!npc) return;

  // highlight talking NPC
  document.querySelectorAll('.hub-npc-slot').forEach(el => el.classList.remove('talking'));
  const slot = document.getElementById(`hub-npc-${npcId}`);
  if (slot) slot.classList.add('talking');

  // set portrait color variable
  const dlg = document.getElementById('hub-dlg');
  dlg.querySelector('.hub-dlg-portrait-wrap').style.setProperty('--npc-color', npc.color);

  // portrait — fixed size independent of scene NPC size
  const portraitEl = document.getElementById('hub-dlg-portrait');
  portraitEl.innerHTML = HUB_NPC_SPRITES[npcId] || '';
  const portraitImg = portraitEl.querySelector('img');
  if (portraitImg) { portraitImg.style.width = '130px'; portraitImg.style.height = '130px'; }
  portraitEl.style.transform = '';
  portraitEl.style.marginBottom = '.5rem';
  document.getElementById('hub-dlg-portrait-name').textContent = npc.name;
  document.getElementById('hub-dlg-portrait-name').style.color = npc.color;

  // typewriter text effect
  _typeText('hub-dlg-text', npc.greeting(), 30);

  // actions
  const actionsEl = document.getElementById('hub-dlg-actions');
  window._hubCurrentActions = npc.actions();
  actionsEl.innerHTML = window._hubCurrentActions.map((a, i) => {
    const dis = a.disabled ? 'disabled' : '';
    return `<button class="hub-dlg-btn ${a.style}" onclick="_hubAction(${i})" ${dis}>${a.label}</button>`;
  }).join('');

  closeHubPanel();
  dlg.style.display = 'flex';
}

function _hubAction(idx) {
  const a = (window._hubCurrentActions || [])[idx];
  if (a && !a.disabled) a.onclick();
}

// typewriter animation
function _typeText(elId, text, speed) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = '';
  let i = 0;
  clearInterval(el._typeTimer);
  el._typeTimer = setInterval(() => {
    el.textContent += text[i++];
    if (i >= text.length) clearInterval(el._typeTimer);
  }, speed);
}

function _hubNpcSay(text) {
  _typeText('hub-dlg-text', text, 25);
}

// ---------- innkeeper ----------

function hubHealFull(cost, maxHp) {
  if (G.gold < cost) { _hubNpcSay('ทองไม่พอนะ ต้องการ 💰' + cost + ' ทอง!'); return; }
  G.gold -= cost;
  const healed = maxHp - G.hp;
  G.hp = maxHp;
  G.totalHpHealed = (G.totalHpHealed||0) + healed;
  logBattle(`<span class="log-exp">❤ ฟื้นฟู HP เต็ม! +${healed} HP (💰-${cost})</span>`);
  updateTopBar(); saveGame();
  _hubNpcSay(`เยี่ยมเลย! ฟื้นฟู +${healed} HP แล้ว ขอให้โชคดีในการออกรบ!`);
  setTimeout(() => openHubNpc('innkeeper'), 1800);
}

function hubFreeHeal(amount, maxHp) {
  const today = new Date().toDateString();
  if (G.hubFreeHealUsed && G.hubFreeHealDate === today) {
    _hubNpcSay('ใช้การพักฟรีไปแล้ววันนี้แล้ว มาพรุ่งนี้ใหม่นะ!'); return;
  }
  const actual = Math.min(amount, maxHp - G.hp);
  if (actual <= 0) { _hubNpcSay('HP เต็มอยู่แล้ว ไม่จำเป็นต้องพักหรอก!'); return; }
  G.hp = Math.min(maxHp, G.hp + actual);
  G.hubFreeHealUsed = true;
  G.hubFreeHealDate = today;
  G.totalHpHealed = (G.totalHpHealed||0) + actual;
  logBattle(`<span class="log-exp">🌿 พักผ่อน +${actual} HP</span>`);
  updateTopBar(); saveGame();
  _hubNpcSay(`สดชื่นขึ้นแล้วใช่ไหม? ฟื้นฟู +${actual} HP นะ!`);
  setTimeout(() => openHubNpc('innkeeper'), 1800);
}

// ---------- quest giver ----------

function hubShowQuests() {
  const pending = getHubQuestsPending();
  const locked  = getHubQuestsLocked();
  const done    = (G.completedHubQuests||[]);

  document.getElementById('hub-panel-title').textContent = '📜 ภารกิจพิเศษ';
  const body = document.getElementById('hub-panel-body');
  body.innerHTML = '';

  if (pending.length) {
    const hdr = document.createElement('div');
    hdr.style.cssText = 'color:#88ff88;font-size:.75rem;letter-spacing:1px;margin-bottom:.4rem;font-family:Chakra Petch,sans-serif';
    hdr.textContent = '✅ รับรางวัลได้เลย';
    body.appendChild(hdr);
  }
  pending.forEach(q => {
    const el = document.createElement('div');
    el.className = 'hub-quest-card ready';
    el.innerHTML = `
      <div class="hub-quest-title">✅ ${q.title}</div>
      <div class="hub-quest-desc">${q.desc}</div>
      <div class="hub-quest-reward">รางวัล: ${q.rewardText}</div>
      <button class="hub-quest-claim" onclick="claimHubQuest('${q.id}')">รับรางวัล</button>
      <div style="clear:both"></div>`;
    body.appendChild(el);
  });

  if (locked.length) {
    const hdr = document.createElement('div');
    hdr.style.cssText = 'color:#778899;font-size:.75rem;letter-spacing:1px;margin:.6rem 0 .4rem;font-family:Chakra Petch,sans-serif';
    hdr.textContent = '🔒 ยังไม่เสร็จ';
    body.appendChild(hdr);
  }
  locked.slice(0,6).forEach(q => {
    const el = document.createElement('div');
    el.className = 'hub-quest-card';
    el.innerHTML = `
      <div class="hub-quest-title" style="color:#667788">🔒 ${q.title}</div>
      <div class="hub-quest-desc">${q.desc}</div>
      <div class="hub-quest-reward" style="color:#556677">รางวัล: ${q.rewardText}</div>`;
    body.appendChild(el);
  });

  if (!pending.length && !locked.length) {
    body.innerHTML = '<div style="color:#7a9a70;text-align:center;padding:1rem;font-size:.85rem">🏆 ทำภารกิจทั้งหมดเสร็จแล้ว!</div>';
  }

  document.getElementById('hub-panel').style.display = 'flex';
}

function claimHubQuest(questId) {
  const quest = HUB_QUESTS.find(q => q.id === questId);
  if (!quest) return;
  if (!G.completedHubQuests) G.completedHubQuests = [];
  if (G.completedHubQuests.includes(questId) || !quest.check()) return;

  G.completedHubQuests.push(questId);
  if (quest.reward.gold)  G.gold += quest.reward.gold;
  if (quest.reward.exp)   giveExp(quest.reward.exp);
  if (quest.reward.chest) {
    const ct = quest.reward.chest;
    G.chests[ct] = (G.chests[ct]||0) + (questId === 'hq_kill_50' ? 2 : 1);
  }
  logBattle(`<span class="log-exp">📜 ภารกิจ "${quest.title}" เสร็จสิ้น! ${quest.rewardText}</span>`);
  saveGame(); updateTopBar(); renderInventory(); checkAchievements();
  hubShowQuests();
  _hubNpcSay(`ขอบคุณมาก! นี่คือรางวัลของคุณ: ${quest.rewardText} 🎉`);
}

// ---------- blacksmith ----------

function hubCheckGear() {
  document.getElementById('hub-panel-title').textContent = '⚒ ตรวจสอบอุปกรณ์';
  const body = document.getElementById('hub-panel-body');
  const equipped = G.equippedSlots || {};
  body.innerHTML = Object.entries(SLOT_META).map(([slot, meta]) => {
    const uid  = equipped[slot];
    const item = uid ? G.inventory.find(i => i.uid === uid) : null;
    const col  = item ? (RARITIES[item.rarity]?.color || 'var(--text)') : '#445566';
    const name = item ? `${item.icon||''} ${item.name}` : '— ว่าง —';
    const stat = item ? `<span style="color:#7a9a70;font-size:.7rem">${buildStatLine(item)}</span>` : '';
    return `<div class="hub-gear-row">
      <span style="color:#8899aa">${meta.icon} ${meta.label}</span>
      <div style="text-align:right"><span style="color:${col};font-size:.82rem">${name}</span><br>${stat}</div>
    </div>`;
  }).join('');
  document.getElementById('hub-panel').style.display = 'flex';
}

// ---------- sage ----------

function hubShowExpInfo() {
  const lvScale = 1 + Math.floor(G.level / 10) * 0.15;
  document.getElementById('hub-panel-title').textContent = '📊 ข้อมูล EXP';
  const body = document.getElementById('hub-panel-body');
  const rows = Object.entries({ easy:[500,1000], medium:[1500,2000], hard:[3000,5000], epic:[6000,12000] }).map(([diff,[mn,mx]]) => {
    const labels = { easy:'ง่าย', medium:'ปานกลาง', hard:'ยาก', epic:'มหาโหด' };
    const cols   = { easy:'#88aa88', medium:'#88aaff', hard:'#aa88ff', epic:'#ffaa44' };
    const sMn = Math.floor(mn * lvScale);
    const sMx = Math.floor(mx * lvScale);
    return `<div class="hub-gear-row">
      <span style="color:${cols[diff]}">${labels[diff]}</span>
      <span style="color:#ffd700">${sMn.toLocaleString()}–${sMx.toLocaleString()} EXP</span>
    </div>`;
  }).join('');
  const next = Math.floor(G.level / 10) * 10 + 10;
  const nScale = 1 + Math.floor(next/10)*0.15;
  body.innerHTML = `
    <div style="color:#9988cc;font-size:.75rem;margin-bottom:.5rem">เลเวล ${G.level} → ×${lvScale.toFixed(2)} EXP</div>
    ${rows}
    <div style="color:#667788;font-size:.72rem;margin-top:.6rem;border-top:1px solid #1a2a12;padding-top:.5rem">
      ⬆ LV ${next}: ×${nScale.toFixed(2)} (ทุก 10 เลเวล +15%)
    </div>
    <div style="color:#556677;font-size:.72rem;margin-top:.3rem">EXP ต่อเลเวลปัจจุบัน: ${expRequired ? expRequired(G.level).toLocaleString() : '?'}</div>`;
  document.getElementById('hub-panel').style.display = 'flex';
}

// ---------- diff label hint ----------

function updateDiffLabel() {
  const sel  = document.getElementById('task-diff');
  const hint = document.getElementById('diff-level-hint');
  if (!sel || !hint) return;
  const lvScale = 1 + Math.floor(G.level / 10) * 0.15;
  const ranges  = { easy:[500,1000], medium:[1500,2000], hard:[3000,5000], epic:[6000,12000] };
  const [mn, mx] = ranges[sel.value] || [0,0];
  const sMn = Math.floor(mn * lvScale);
  const sMx = Math.floor(mx * lvScale);
  if (G.level >= 10) {
    hint.textContent = `LV ${G.level}: จริงๆ +${sMn.toLocaleString()}–${sMx.toLocaleString()} EXP (×${lvScale.toFixed(2)})`;
  } else {
    hint.textContent = '';
  }
}
