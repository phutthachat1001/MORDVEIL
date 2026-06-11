// ============================================================
// ACHIEVEMENTS — ตรวจสอบและแสดงความสำเร็จ
// ============================================================

let _achToastQueue = [];
let _achToastBusy  = false;

// onlyCat: if given, check only achievements in that category
// (IDLE farm calls checkAchievements('idle') so its kills don't get
//  evaluated against manual-fight achievements). Default = main fights.
function checkAchievements(onlyCat) {
  ACHIEVEMENTS.forEach(a => {
    const cat = a.cat || 'main';
    if (onlyCat ? cat !== onlyCat : cat !== 'main') return;
    if (G.unlockedAchievements.includes(a.id)) return;
    if (a.check(G)) {
      G.unlockedAchievements.push(a.id);
      logBattle(`<span class="log-exp">🏆 ความสำเร็จใหม่: ${a.icon} "${a.name}" - ${a.desc}</span>`);
      const recent = document.getElementById('recent-ach');
      if (recent) recent.textContent = `${a.icon} ${a.name}`;
      _achToastQueue.push(a);
      _runAchToast();
    }
  });
}

function _runAchToast() {
  if (_achToastBusy || !_achToastQueue.length) return;
  _achToastBusy = true;
  const a   = _achToastQueue.shift();
  const el  = document.getElementById('ach-toast');
  if (!el) { _achToastBusy = false; return; }
  document.getElementById('ach-toast-icon').textContent = a.icon;
  document.getElementById('ach-toast-name').textContent = a.name;
  document.getElementById('ach-toast-desc').textContent = a.desc;
  el.style.display    = 'block';
  el.style.opacity    = '0';
  el.style.transition = 'opacity .3s';
  requestAnimationFrame(() => { el.style.opacity = '1'; });
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => {
      el.style.display = 'none';
      _achToastBusy = false;
      _runAchToast();
    }, 300);
  }, 3000);
}

function showAchievements() {
  const list = document.getElementById('ach-list');
  list.innerHTML = '';

  const groups = [
    { cat:'main', label:'⚔ ดันมอน & ผจญภัย' },
    { cat:'idle', label:'🌙 ฟาร์ม IDLE' },
  ];

  groups.forEach(g => {
    const items = ACHIEVEMENTS.filter(a => (a.cat || 'main') === g.cat);
    if (!items.length) return;
    const got = items.filter(a => G.unlockedAchievements.includes(a.id)).length;

    const header = document.createElement('div');
    header.className = 'ach-group-header';
    header.innerHTML = `<span>${g.label}</span><span class="ach-group-count">${got}/${items.length}</span>`;
    list.appendChild(header);

    items.forEach(a => {
      const unlocked = G.unlockedAchievements.includes(a.id);
      const el = document.createElement('div');
      el.className = 'ach-item' + (unlocked ? ' unlocked' : '');
      el.innerHTML = `<span class="ach-icon">${unlocked ? a.icon : '🔒'}</span>
        <div><div class="ach-name">${a.name}</div><div class="ach-desc">${a.desc}</div></div>`;
      list.appendChild(el);
    });
  });

  document.getElementById('ach-overlay').classList.add('active');
}
