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
      if (c===0) return 'เฮ้! แกไม่มีอุปกรณ์เลยสักชิ้น เก็บวัตถุดิบจากมอนมา ข้าจะตีชุดให้!';
      if (c < 3)  return `แกใส่อุปกรณ์แค่ ${c}/6 ชิ้น ยังไม่พอนะ เก็บวัตถุดิบมาคราฟชุดเพิ่มสิ!`;
      return `โอ้ อุปกรณ์ ${c}/6 ชิ้น ไม่เลว! อยากตีชุดใหม่ไหม ข้ามีสูตรเด็ด`;
    },
    actions: () => {
      const c = Object.values(G.equippedSlots||{}).filter(Boolean).length;
      const acts = [
        { label:'⚒ คราฟชุด (ใช้วัตถุดิบ)', style:'gold',  onclick:()=>hubOpenCrafting() },
        { label:`🔍 ตรวจสอบอุปกรณ์ (${c}/6)`, style:'blue',  onclick:()=>hubCheckGear()    },
      ];
      if (typeof canEnterDungeon === 'function') {
        if (canEnterDungeon()) {
          acts.push({ label:'🕳️ หลุมลึกนิรันดร์ (ฟาร์มของตีบวก)', style:'purple', onclick:()=>{ closeHubDialogue(); openDungeon(); } });
        } else {
          acts.push({ label:`🔒 หลุมลึก — ${dungeonUnlockHint()}`, style:'close', onclick:()=>{} });
        }
      }
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
  if (typeof closeInventoryPopup === 'function') closeInventoryPopup();
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
    hdr.style.cssText = 'color:#88ff88;font-size:.75rem;letter-spacing:1px;margin-bottom:.4rem;font-family:"Chakra Petch","Sarabun",sans-serif';
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
    hdr.style.cssText = 'color:#778899;font-size:.75rem;letter-spacing:1px;margin:.6rem 0 .4rem;font-family:"Chakra Petch","Sarabun",sans-serif';
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
    if (typeof grantChestReward === 'function') grantChestReward(ct, questId === 'hq_kill_50' ? 2 : 1);
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

// ---------- CRAFTING (blacksmith) ----------

function _matCount(id) { return (G.materials && G.materials[id]) || 0; }

// does the player already own a crafted piece (by name)?
function _ownsCraftPiece(name) {
  return (G.inventory || []).some(i => i.name === name);
}

function hubOpenCrafting(setId) {
  const panel = document.getElementById('hub-panel');
  const body  = document.getElementById('hub-panel-body');
  document.getElementById('hub-panel-title').textContent = '⚒ คราฟชุด';
  if (!panel || !body) return;
  panel.style.display = 'flex';

  const sets = Object.values(CRAFT_SETS);
  // set selector tabs
  let html = `<div style="display:flex;gap:.3rem;flex-wrap:wrap;margin-bottom:.6rem">`;
  sets.forEach(s => {
    const owned = s.pieces.filter(p => _ownsCraftPiece(p.name)).length;
    const active = (setId || sets[0].id) === s.id;
    const col = RARITIES[s.rarity]?.color || '#aaa';
    html += `<button onclick="hubOpenCrafting('${s.id}')" style="flex:1;min-width:90px;padding:.35rem;border-radius:8px;cursor:pointer;font-size:.72rem;font-weight:700;
      background:${active?'rgba(255,200,60,.18)':'rgba(255,255,255,.05)'};border:1px solid ${active?'#ffcc44':'#333'};color:${col}">
      ${s.name}<br><span style="font-size:.62rem;color:#999">${owned}/6</span></button>`;
  });
  html += `</div>`;

  const set = sets.find(s => s.id === (setId || sets[0].id)) || sets[0];
  const col = RARITIES[set.rarity]?.color || '#aaa';
  // set bonus line
  const ownedCount = set.pieces.filter(p => _ownsCraftPiece(p.name)).length;
  html += `<div style="background:rgba(255,200,60,.08);border:1px solid #5a4a2a;border-radius:8px;padding:.4rem .6rem;margin-bottom:.6rem;font-size:.72rem;color:#ffcc88">
    🎖 เซ็ตโบนัส (${ownedCount}/${set.setBonus.need}): ${set.setBonus.label}</div>`;

  // each piece: stats, material cost, craft button
  set.pieces.forEach(p => {
    const owned = _ownsCraftPiece(p.name);
    const matRows = Object.entries(p.mats).map(([mid, need]) => {
      const have = _matCount(mid); const m = MATERIALS[mid] || {};
      const ok = have >= need;
      return `<span style="color:${ok?'#88dd88':'#dd6666'};font-size:.66rem">${m.icon||'•'}${have}/${need}</span>`;
    }).join(' ');
    const goldOk = G.gold >= p.gold;
    const canCraft = !owned && goldOk && Object.entries(p.mats).every(([mid,need]) => _matCount(mid) >= need);
    const btn = owned
      ? `<span style="color:#88dd88;font-size:.72rem;font-weight:700">✅ มีแล้ว</span>`
      : `<button onclick="hubCraftPiece('${set.id}','${p.slot}')" ${canCraft?'':'disabled'}
          style="padding:.3rem .7rem;border-radius:6px;font-size:.72rem;font-weight:700;cursor:${canCraft?'pointer':'not-allowed'};
          background:${canCraft?'linear-gradient(135deg,#3a2a0a,#5a3a10)':'#222'};border:1px solid ${canCraft?'#ffcc44':'#444'};color:${canCraft?'#ffdd66':'#666'}">⚒ คราฟ</button>`;
    html += `<div class="hub-gear-row" style="flex-direction:column;align-items:stretch;gap:.25rem">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="color:${col};font-size:.8rem">${p.icon} ${p.name}</span>
        <span style="color:#7a9a70;font-size:.68rem">⚔${p.atk} 🛡${p.def}</span>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span>${matRows} <span style="color:${goldOk?'#ffd700':'#dd6666'};font-size:.66rem">💰${p.gold}</span></span>
        ${btn}
      </div>
    </div>`;
  });
  body.innerHTML = html;
}

function hubCraftPiece(setId, slot) {
  const set = CRAFT_SETS[setId];
  if (!set) return;
  const p = set.pieces.find(x => x.slot === slot);
  if (!p || _ownsCraftPiece(p.name)) return;
  // verify cost
  if (G.gold < p.gold) { logBattle('<span class="log-sys">⚠ ทองไม่พอ</span>'); return; }
  for (const [mid, need] of Object.entries(p.mats)) {
    if (_matCount(mid) < need) { logBattle('<span class="log-sys">⚠ วัตถุดิบไม่พอ</span>'); return; }
  }
  if ((G.inventory||[]).length >= 50) { logBattle('<span class="log-sys">⚠ กระเป๋าเต็ม</span>'); return; }
  // pay
  G.gold -= p.gold;
  for (const [mid, need] of Object.entries(p.mats)) G.materials[mid] -= need;
  // create item (tagged with craftSet so set bonus can be computed)
  const item = {
    id: `craft_${setId}_${slot}`, name: p.name, icon: p.icon,
    slot: p.slot, rarity: set.rarity, atk: p.atk, def: p.def,
    craftSet: setId, requiredClass: null, uid: Date.now() + Math.random(),
  };
  if (!G.inventory) G.inventory = [];
  G.inventory.push(item);
  const col = RARITIES[set.rarity]?.color || '#aaa';
  logBattle(`<span class="log-exp" style="color:${col}">⚒ คราฟสำเร็จ: ${p.icon} ${p.name}!</span>`);
  if (typeof playSound === 'function') playSound('chest');
  saveGame(); updateTopBar(); renderInventory();
  hubOpenCrafting(setId); // refresh in place
  _hubNpcSay(`ตีเสร็จแล้ว! ${p.name} เป็นของแกแล้ว ⚒`);
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
