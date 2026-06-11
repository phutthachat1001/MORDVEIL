// ============================================================
// AUDIO — Web Audio API เสียงสั้นๆ
// ============================================================

let audioCtx = null;

// ── mute preference (device-level, stored outside the save) ──
let _muted = (() => {
  try { return localStorage.getItem('wq_muted') === '1'; } catch(e) { return false; }
})();

function isMuted() { return _muted; }

function toggleMute() {
  _muted = !_muted;
  try { localStorage.setItem('wq_muted', _muted ? '1' : '0'); } catch(e) {}
  if (_muted && window.speechSynthesis) window.speechSynthesis.cancel();
  updateMuteButton();
  return _muted;
}

function updateMuteButton() {
  document.querySelectorAll('.btn-mute').forEach(btn => {
    btn.textContent = _muted ? '🔇' : '🔊';
    btn.title = _muted ? 'เปิดเสียง' : 'ปิดเสียง';
    btn.classList.toggle('muted', _muted);
  });
}

function getAudio() {
  if (!audioCtx) try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  return audioCtx;
}

function playSound(type) {
  if (_muted) return;
  const ctx = getAudio();
  if (!ctx) return;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);

  switch (type) {
    case 'attack':
      o.frequency.setValueAtTime(220, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + .1);
      g.gain.setValueAtTime(.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.01, ctx.currentTime + .15);
      break;
    case 'hit':
      o.frequency.setValueAtTime(80, ctx.currentTime);
      g.gain.setValueAtTime(.4, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.01, ctx.currentTime + .2);
      break;
    case 'levelup':
      o.type = 'square';
      [262,330,392,523].forEach((f,i) => o.frequency.setValueAtTime(f, ctx.currentTime + i*.1));
      g.gain.setValueAtTime(.2, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.01, ctx.currentTime + .5);
      break;
    case 'chest':
      o.type = 'triangle';
      [440,554,659,880].forEach((f,i) => o.frequency.setValueAtTime(f, ctx.currentTime + i*.08));
      g.gain.setValueAtTime(.25, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.01, ctx.currentTime + .4);
      break;
    case 'exp':
      o.frequency.setValueAtTime(660, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + .1);
      g.gain.setValueAtTime(.15, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.01, ctx.currentTime + .15);
      break;
    case 'event_alert':
      o.type = 'square';
      [523,659,784,1047].forEach((f,i) => o.frequency.setValueAtTime(f, ctx.currentTime + i*.12));
      g.gain.setValueAtTime(.18, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.01, ctx.currentTime + .6);
      break;
    case 'event_danger':
      o.type = 'sawtooth';
      [150,120,90].forEach((f,i) => o.frequency.setValueAtTime(f, ctx.currentTime + i*.15));
      g.gain.setValueAtTime(.25, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.01, ctx.currentTime + .55);
      break;
    case 'event_heal':
      o.type = 'sine';
      [528,660,792].forEach((f,i) => o.frequency.setValueAtTime(f, ctx.currentTime + i*.1));
      g.gain.setValueAtTime(.18, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.01, ctx.currentTime + .4);
      break;
    case 'event_streak':
      o.type = 'triangle';
      [392,523,659,784,1047].forEach((f,i) => o.frequency.setValueAtTime(f, ctx.currentTime + i*.09));
      g.gain.setValueAtTime(.2, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.01, ctx.currentTime + .7);
      break;

  }
  o.start(); o.stop(ctx.currentTime + .8);
}

// ── Enemy death voice (อุทานสั้น) ────────────────────────────

const _DEATH_GRUNTS = {
  beast:  ['อุ๊ก', 'แอ๊ก', 'อึก', 'เอ๊ก', 'อิ๊ก', 'แง', 'อ๊าก'],
  undead: ['อือ...', 'อ้า...', 'อุ้ม...', 'อือออ', 'อ้าา'],
  boss:   ['อ้าาาา!', 'อุ๊กก!', 'แอ๊กก!', 'อึกกก!'],
  normal: ['อุ๊ย', 'โอ๊ย', 'อุ๊ก', 'แอ๊ก', 'อึก', 'เอ็ง', 'อ๊าก'],
};

function playEnemyDeathVoice(zone, isBoss) {
  if (_muted) return;
  if (!window.speechSynthesis) return;

  let pool;
  if (isBoss)                        pool = _DEATH_GRUNTS.boss;
  else if (zone === 2 || zone === 4) pool = _DEATH_GRUNTS.undead;
  else if (zone === 1 || zone === 3) pool = _DEATH_GRUNTS.beast;
  else                               pool = _DEATH_GRUNTS.normal;

  const text = pool[Math.floor(Math.random() * pool.length)];
  const u    = new SpeechSynthesisUtterance(text);
  u.lang     = 'th-TH';
  u.pitch    = isBoss ? 0.5 : (zone === 2 || zone === 4) ? 0.4 : 1.4;
  u.rate     = isBoss ? 0.4 : (zone === 2 || zone === 4) ? 0.35 : 0.55;
  u.volume   = 1.0;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}
