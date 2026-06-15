// ============================================================
// NPC ENCOUNTER — Zone entry dialogues + secret quests
// ============================================================

// NPC definitions per zone
const ZONE_NPCS = {
  1: {
    name: 'ชาวบ้านหวาดกลัว',
    portrait: '🧑‍🌾',
    lines: [
      'ช่วยด้วย! กอบลินพวกนั้นโจมตีหมู่บ้านทุกคืน...',
      'ได้ยินว่า มีราชากอบลินซ่อนตัวอยู่ลึกเข้าไปในป่า',
      'ถ้าคุณกล้าพอ... ลองเข้าไปดูสิ'
    ],
    quest: {
      id: 'npc_q_zone1',
      text: '🗡 ภารกิจ: กำจัดกอบลิน 5 ตัว',
      goal: 5,
      type: 'kill_zone',
      zone: 1,
      reward: { gold: 150, exp: 500 },
      rewardText: '+150 ทอง +500 EXP'
    }
  },
  2: {
    name: 'นักล่าซอมบี้',
    portrait: '🪖',
    lines: [
      'ฉันเคยอยู่ในหุบเขาแห่งนี้มาหลายปี...',
      'ซอมบี้เหล่านี้ไม่ตายจริงๆ พวกมันสร้างใหม่ได้เสมอ',
      'แต่ถ้าฆ่าจอมซอมบี้ได้ — มันจะอ่อนแอลงชั่วคราว'
    ],
    quest: {
      id: 'npc_q_zone2',
      text: '💀 ภารกิจ: กำจัดซอมบี้ 5 ตัว',
      goal: 5,
      type: 'kill_zone',
      zone: 2,
      reward: { gold: 250, exp: 1200 },
      rewardText: '+250 ทอง +1200 EXP'
    }
  },
  3: {
    name: 'พ่อมดโบราณ',
    portrait: '🧙‍♂️',
    lines: [
      'ถ้ำมังกร... สถานที่ที่สาปสรรค์ที่สุดในแผ่นดิน',
      'ไฟของมังกรสามารถเผาทุกอย่างที่อยู่ในเส้นทางมัน',
      'แต่ผู้กล้าหาญแท้จริงจะค้นพบสมบัติล้ำค่าในนั้น...'
    ],
    quest: {
      id: 'npc_q_zone3',
      text: '🐉 ภารกิจ: กำจัดมังกร 3 ตัว',
      goal: 3,
      type: 'kill_zone',
      zone: 3,
      reward: { gold: 500, exp: 3000 },
      rewardText: '+500 ทอง +3000 EXP'
    }
  },
  4: {
    name: 'ทหารรับจ้าง',
    portrait: '⚔️',
    lines: [
      'ซากอสูรแห่งนี้... แม้แต่เพื่อนร่วมทีมฉันยังหนีไป',
      'อสูรพวกนี้ไม่ได้ต้องการแค่เลือด — พวกมันต้องการจิตวิญญาณ',
      'ระวังไว้... ความมืดในที่นี้กินผู้กล้าหาญไปแล้วมากมาย'
    ],
    quest: {
      id: 'npc_q_zone4',
      text: '👹 ภารกิจ: กำจัดอสูร 3 ตัว',
      goal: 3,
      type: 'kill_zone',
      zone: 4,
      reward: { gold: 800, exp: 6000 },
      rewardText: '+800 ทอง +6000 EXP'
    }
  },
  5: {
    name: 'วิญญาณอัศวิน',
    portrait: '👻',
    lines: [
      '...ข้าเคยเป็นอัศวินแห่งปราสาทนี้มาก่อน',
      'เจ้าแห่งปราสาทกักขังวิญญาณเราไว้ตั้งแต่ยุคมืด',
      'หากเจ้าสามารถปลดปล่อยพวกเราได้... ข้าจะให้สมบัติทั้งหมดที่ข้ามี'
    ],
    quest: {
      id: 'npc_q_zone5',
      text: '🏰 ภารกิจ: กำจัดผีปราสาท 3 ตัว',
      goal: 3,
      type: 'kill_zone',
      zone: 5,
      reward: { gold: 1200, exp: 10000 },
      rewardText: '+1200 ทอง +10000 EXP'
    }
  },
  6: {
    name: 'เทพผู้ตกต่ำ',
    portrait: '🌀',
    lines: [
      'ข้าเคยเป็นผู้พิทักษ์อาณาจักรแห่งนี้...',
      'แต่ตอนนี้... โกลาหลครอบงำทุกสิ่ง ไม่มีอะไรเหลือให้ปกป้อง',
      'ถ้าเจ้าต้องการพิสูจน์ตัวเอง... จงเผชิญกับเทพแห่งโกลาหล'
    ],
    quest: {
      id: 'npc_q_zone6',
      text: '🌀 ภารกิจ: กำจัดปีศาจ 3 ตัว',
      goal: 3,
      type: 'kill_zone',
      zone: 6,
      reward: { gold: 2000, exp: 20000 },
      rewardText: '+2000 ทอง +20000 EXP'
    }
  }
};

// Active NPC quests progress
if (typeof G !== 'undefined' && !G.npcQuestProgress) G.npcQuestProgress = {};

let _npcEncounterZone = null;
let _npcLineIdx = 0;
let _npcTypingTimer = null;
let _npcFullText = '';

function openNpcEncounter(zone, onClose) {
  const npc = ZONE_NPCS[zone];
  if (!npc) { if (onClose) onClose(); return; }

  // Don't show if already seen this zone's NPC
  const seenKey = `npc_seen_z${zone}`;
  if (!G.npcQuestProgress) G.npcQuestProgress = {};

  _npcEncounterZone = zone;
  _npcLineIdx = 0;

  const overlay = document.getElementById('npc-encounter-overlay');
  const portrait = document.getElementById('npc-enc-portrait');
  const nameEl   = document.getElementById('npc-enc-name');
  const textEl   = document.getElementById('npc-enc-text');
  const actEl    = document.getElementById('npc-enc-actions');

  if (!overlay) { if (onClose) onClose(); return; }

  portrait.textContent = npc.portrait;
  nameEl.textContent   = npc.name;
  actEl.innerHTML      = '';
  overlay.classList.add('active');

  function showLine(idx) {
    if (idx >= npc.lines.length) {
      showQuestOptions(npc, onClose);
      return;
    }
    _npcLineIdx = idx;
    typeText(textEl, npc.lines[idx], () => {
      actEl.innerHTML = '';
      // Next button
      const nextBtn = document.createElement('button');
      nextBtn.className = 'npc-enc-btn';
      nextBtn.textContent = idx < npc.lines.length - 1 ? '▶ ต่อไป' : '📜 รับภารกิจ';
      nextBtn.onclick = () => showLine(idx + 1);
      actEl.appendChild(nextBtn);

      // Skip all
      if (idx < npc.lines.length - 1) {
        const skipBtn = document.createElement('button');
        skipBtn.className = 'npc-enc-btn';
        skipBtn.textContent = '⏭ ข้ามทั้งหมด';
        skipBtn.onclick = () => showQuestOptions(npc, onClose);
        actEl.appendChild(skipBtn);
      }
    });
  }

  showLine(0);
}

function showQuestOptions(npc, onClose) {
  const textEl = document.getElementById('npc-enc-text');
  const actEl  = document.getElementById('npc-enc-actions');
  const q = npc.quest;
  const progress = (G.npcQuestProgress || {})[q.id] || 0;
  const done = progress >= q.goal;

  if (done) {
    textEl.innerHTML = `✅ <b>ภารกิจสำเร็จแล้ว!</b><br><span style="color:var(--text2);font-size:.8rem">คุณได้ทำภารกิจนี้เรียบร้อย</span>`;
    actEl.innerHTML = '';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'npc-enc-btn primary';
    closeBtn.textContent = '⚔ เข้าสู่การต่อสู้';
    closeBtn.onclick = () => closeNpcEncounter(onClose);
    actEl.appendChild(closeBtn);
    return;
  }

  textEl.innerHTML = `<b style="color:var(--gold)">${q.text}</b><br>
    <span style="color:var(--text2);font-size:.78rem">รางวัล: ${q.rewardText}</span><br>
    <span style="color:#aaa;font-size:.72rem">ความคืบหน้า: ${progress}/${q.goal}</span>`;
  actEl.innerHTML = '';

  const acceptBtn = document.createElement('button');
  acceptBtn.className = 'npc-enc-btn primary';
  acceptBtn.textContent = '✅ รับภารกิจ + เข้าสู้';
  acceptBtn.onclick = () => { activateNpcQuest(q); closeNpcEncounter(onClose); };
  actEl.appendChild(acceptBtn);

  const skipBtn = document.createElement('button');
  skipBtn.className = 'npc-enc-btn';
  skipBtn.textContent = '⚔ ข้ามไปสู้เลย';
  skipBtn.onclick = () => closeNpcEncounter(onClose);
  actEl.appendChild(skipBtn);
}

function activateNpcQuest(q) {
  if (!G.npcQuestProgress) G.npcQuestProgress = {};
  if (G.npcQuestProgress[q.id] === undefined) G.npcQuestProgress[q.id] = 0;
  // Store full quest data for reward tracking
  if (!G._npcQuestDefs) G._npcQuestDefs = {};
  G._npcQuestDefs[q.id] = q;
  logBattle(`<span class="log-sys">📜 รับภารกิจ: ${q.text}</span>`);
}

function closeNpcEncounter(onClose) {
  const overlay = document.getElementById('npc-encounter-overlay');
  if (overlay) overlay.classList.remove('active');
  if (_npcTypingTimer) clearInterval(_npcTypingTimer);
  if (onClose) onClose();
}

function typeText(el, text, onDone) {
  if (_npcTypingTimer) clearInterval(_npcTypingTimer);
  el.innerHTML = '';
  let i = 0;
  _npcFullText = text;
  _npcTypingTimer = setInterval(() => {
    el.innerHTML = text.slice(0, i) + '<span class="npc-enc-cursor">▌</span>';
    i++;
    if (i > text.length) {
      clearInterval(_npcTypingTimer);
      _npcTypingTimer = null;
      el.innerHTML = text;
      if (onDone) onDone();
    }
  }, 28);
  // Click to skip typing
  el.onclick = () => {
    if (_npcTypingTimer) {
      clearInterval(_npcTypingTimer);
      _npcTypingTimer = null;
      el.innerHTML = text;
      el.onclick = null;
      if (onDone) onDone();
    }
  };
}

// Called on every monster kill — track NPC quest progress
function npcQuestOnKill(monsterName, zone) {
  if (!G.npcQuestProgress) G.npcQuestProgress = {};
  if (!G._npcQuestDefs) return;
  Object.keys(G._npcQuestDefs).forEach(qid => {
    const q = G._npcQuestDefs[qid];
    if (!q || q.type !== 'kill_zone') return;
    if (q.zone !== zone) return;
    if ((G.npcQuestProgress[qid] || 0) >= q.goal) return;
    G.npcQuestProgress[qid] = (G.npcQuestProgress[qid] || 0) + 1;
    const p = G.npcQuestProgress[qid];
    logBattle(`<span class="log-sys">📜 ภารกิจ: ${p}/${q.goal}</span>`);
    if (p >= q.goal) {
      // Reward!
      if (q.reward.gold) { G.gold += q.reward.gold; }
      if (q.reward.exp && typeof giveExp === 'function') giveExp(q.reward.exp);
      logBattle(`<span class="log-exp">🎉 ภารกิจสำเร็จ! ${q.text} — รับ ${q.rewardText}</span>`);
      saveGame();
    }
  });
}

// Hook into zone navigation — show NPC when entering a zone from map.
// Shows ONCE per zone ever (persisted). Won't re-show if already seen, if the
// quest is already active, or if it's already done.
function npcCheckZoneEntry(zone) {
  // fullrpg mode has its own complete quest system (rpg-quests) — don't stack
  // the zone-NPC quests on top of it (that caused "duplicate" quests).
  if (G.gameMode === 'fullrpg') return;
  if (!G.npcQuestProgress) G.npcQuestProgress = {};
  const npc = ZONE_NPCS[zone];
  if (!npc) return;
  const q = npc.quest;
  const seenKey = `npc_enc_shown_z${zone}`;
  // already shown, already accepted, or already finished → never show again
  const accepted = G._npcQuestDefs && G._npcQuestDefs[q.id];
  const progressed = (G.npcQuestProgress[q.id] || 0) > 0;
  if (G.npcQuestProgress[seenKey] || accepted || progressed) return;
  G.npcQuestProgress[seenKey] = true;
  saveGame();   // persist immediately so a reload doesn't re-trigger it
  // Delay slightly so the monster list renders first
  setTimeout(() => openNpcEncounter(zone, null), 400);
}
