// ============================================================
// GOAL TRACKER — "เป้าหมายถัดไป" banner in the battle/IDLE view
// Picks the single most relevant next objective so the player always knows
// what to do next, with a progress bar + a one-tap action.
// ============================================================

// Return the current top-priority goal as:
//   { icon, title, cur, max, hint, action?:{label,fn} }
function _computeNextGoal() {
  const lvl = G.level || 1;
  const tier = G.classTier || 1;
  const zp = G.zoneProgress || {};
  const clearedCount = (zid) => zp[zid] || 0;
  const zoneSize = (zid) => ((ZONES.find(z => z.id === zid) || {}).monsters || []).length || 6;

  // 1) Unlock the next zone by level (matches map/zone-tab gating)
  const nextLockedZone = (typeof ZONES !== 'undefined')
    ? ZONES.find(z => lvl < (z.reqLevel || 1)) : null;
  // current zone the player is working through
  const curZone = G.currentZone || 1;

  // --- Priority chain ---

  // A) Clear the CURRENT zone fully (kill all 6) — the moment-to-moment goal
  const curCleared = clearedCount(curZone), curSize = zoneSize(curZone);
  if (curCleared < curSize) {
    const z = ZONES.find(zz => zz.id === curZone) || {};
    return {
      icon: z.emoji || '⚔️',
      title: `เคลียร์ด่าน ${z.name || curZone}`,
      cur: curCleared, max: curSize,
      hint: `ตีมอนในด่านนี้ให้ครบ ${curSize} ตัว เพื่อปลดล็อกด่านถัดไป`,
    };
  }

  // B) Class progression — Tier 2 → 3 via Infinity Trial (level-gated)
  const TRIAL_LV = (typeof TRIAL_MIN_LEVEL !== 'undefined') ? TRIAL_MIN_LEVEL : 50;
  if (tier === 2) {
    if (lvl < TRIAL_LV) {
      return { icon: '♾️', title: `เลเวลให้ถึง ${TRIAL_LV} เพื่อเข้าการทดสอบนิรันดร์ (เปลี่ยนเป็น Tier 3)`,
        cur: lvl, max: TRIAL_LV, hint: 'ถึงเลเวลแล้วกดปุ่มวิวัฒนาการที่หน้าตัวละครเพื่อเข้าทดสอบ' };
    }
    return { icon: '♾️', title: 'เข้าการทดสอบนิรันดร์ — ตัดสิน Tier 3!',
      cur: 1, max: 1, hint: 'กดปุ่มวิวัฒนาการที่หน้าตัวละคร แล้วลุยการทดสอบ ยิ่งตีเยอะยิ่งได้สายโหด',
      action: (typeof openInfinityTrial === 'function') ? { label: '♾️ เข้าทดสอบ', fn: 'openInfinityTrial' } : null };
  }

  // D) Tier 3 → 4 — reach level + collect T4 dungeon gear
  if (tier === 3) {
    const path = (typeof CLASS_EVOLUTIONS !== 'undefined') ? (CLASS_EVOLUTIONS[G.classId] || []) : [];
    const t4 = path.find(e => e.tier === 4 && (e.branch === G.classBranch || e.parentBranch === G.classBranch));
    const needLv = (t4 && t4.conditions && t4.conditions.level) || 80;
    if (lvl < needLv) {
      return { icon: '👑', title: `เลเวลให้ถึง ${needLv} เพื่อปลดล็อก Tier 4`,
        cur: lvl, max: needLv, hint: 'เก็บของในดันเจี้ยน T4 ระหว่างฟาร์มเลเวลด้วย' };
    }
    const got = (typeof t4GearCount === 'function') ? t4GearCount() : 0;
    return { icon: '👑', title: 'เก็บของในดันเจี้ยน Tier 4 ให้ครบ',
      cur: got, max: 6, hint: 'เข้าดันเจี้ยนอาชีพ เก็บของครบ 6 ชิ้น + ทำเควสอาชีพ เพื่อขึ้น Tier 4' };
  }

  // D2) Tier 1: current zone cleared but not yet leveled enough for the next zone
  if (nextLockedZone) {
    return {
      icon: '⭐',
      title: `เลเวลให้ถึง ${nextLockedZone.reqLevel} เพื่อปลดล็อก ${nextLockedZone.emoji} ${nextLockedZone.name}`,
      cur: lvl, max: nextLockedZone.reqLevel,
      hint: 'ฟาร์มมอน/ทำเควสเก็บ EXP จนถึงเลเวลที่ต้องการ',
    };
  }

  // E) Endgame (Tier 4 / all zones cleared) — chase Endless Depth records
  const best = G.dungeonBestFloor || 0;
  const nextMilestone = best < 10 ? 10 : best < 25 ? 25 : best < 50 ? 50 : best < 100 ? 100 : (Math.floor(best / 50) + 1) * 50;
  return {
    icon: '🕳️',
    title: `ไต่หลุมลึกนิรันดร์ให้ถึงชั้น ${nextMilestone}`,
    cur: best, max: nextMilestone,
    hint: 'คุณคือผู้เล่นปลายเกมแล้ว! ท้าทายความลึก ดันเจี้ยน + ล้มบอสโลกเก็บของหายาก',
    action: (typeof openDungeon === 'function') ? { label: '🕳️ ลุยหลุมลึก', fn: 'openDungeon' } : null,
  };
}

function renderGoalTracker() {
  const el = document.getElementById('goal-tracker');
  if (!el) return;
  if (!G.classId) { el.innerHTML = ''; return; }
  let g;
  try { g = _computeNextGoal(); } catch (e) { el.innerHTML = ''; return; }
  if (!g) { el.innerHTML = ''; return; }

  const pct = g.max > 0 ? Math.min(100, Math.floor((g.cur / g.max) * 100)) : 0;
  const actionBtn = g.action
    ? `<button onclick="${g.action.fn}()" style="flex-shrink:0;background:linear-gradient(135deg,#3a2a00,#6a5010);border:1px solid var(--gold);color:var(--gold);padding:.3rem .7rem;border-radius:8px;cursor:pointer;font-size:.78rem;font-weight:700;white-space:nowrap">${g.action.label}</button>`
    : '';

  el.innerHTML = `
    <div style="background:linear-gradient(135deg,rgba(40,32,8,.55),rgba(20,16,6,.55));border:1px solid #5a4a1a;border-radius:12px;padding:.6rem .75rem;margin-bottom:.7rem">
      <div style="display:flex;align-items:center;gap:.6rem">
        <span style="font-size:1.5rem;flex-shrink:0">${g.icon}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:.55rem;color:#c8a860;letter-spacing:1px;font-weight:700">🎯 เป้าหมายถัดไป</div>
          <div style="font-size:.82rem;color:#ffe9b8;font-weight:700;line-height:1.25">${g.title}</div>
        </div>
        ${actionBtn}
      </div>
      <div style="display:flex;align-items:center;gap:.5rem;margin-top:.45rem">
        <div style="flex:1;background:#1a1410;border-radius:5px;height:9px;overflow:hidden;border:1px solid #3a2e18">
          <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#caa030,#ffd966);border-radius:5px;transition:width .4s"></div>
        </div>
        <span style="font-size:.7rem;color:#d8c088;font-weight:700;white-space:nowrap">${g.cur.toLocaleString()}/${g.max.toLocaleString()}</span>
      </div>
      <div style="font-size:.66rem;color:#9a8a66;margin-top:.35rem;line-height:1.4">💡 ${g.hint}</div>
    </div>`;
}
