// ============================================================
// COSMETIC SYSTEM — 6-tier visual upgrade for player sprites
// ============================================================

// Tier definitions
const COSMETIC_TIERS = [
  { tier: 1, name: 'ธรรมดา',    icon: '⚪', color: '#aaaaaa', cssClass: 'cosm-t1', unlockDesc: 'ฟรี' },
  { tier: 2, name: 'ดีขึ้น',    icon: '🟢', color: '#44ff88', cssClass: 'cosm-t2', unlockDesc: '💰 500 ทอง' },
  { tier: 3, name: 'หายาก',    icon: '🔵', color: '#4488ff', cssClass: 'cosm-t3', unlockDesc: '💰 2,000 ทอง หรือ 10 ภารกิจ Hub' },
  { tier: 4, name: 'วีรบุรุษ',  icon: '🟣', color: '#cc44ff', cssClass: 'cosm-t4', unlockDesc: '💰 5,000 ทอง + ฆ่าบอส 5 ตัว' },
  { tier: 5, name: 'มหากาพย์', icon: '🟠', color: '#ff8800', cssClass: 'cosm-t5', unlockDesc: '💰 15,000 ทอง + Prestige 1 ครั้ง' },
  { tier: 6, name: 'ตำนาน',    icon: '🌟', color: '#ffdd00', cssClass: 'cosm-t6', unlockDesc: 'หีบบอส (2%) เท่านั้น' },
];

// Class accent colors for glow effects
const COSM_CLASS_COLOR = {
  warrior: '#6699cc',
  mage:    '#aa44ff',
  rogue:   '#00ff88',
  archer:  '#aadd00',
  paladin: '#ffdd44',
};

// ── Tier-2 palette-swap variants (enhanced highlights, richer colors) ──
// These replace the base sprite with a more saturated version via CSS filter
// No new SVG needed for T2 — CSS handles it.

// ── Tier-3 sprites: larger viewBox 16×24, added shadow layer + face detail ──
const COSM_T3_SPRITES = {

  warrior: `<svg width="64" height="96" viewBox="0 0 16 24" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <!-- GROUND SHADOW -->
    <ellipse cx="8" cy="23" rx="5" ry="1" fill="#000000" opacity=".35"/>
    <!-- SWORD -->
    <rect x="13" y="1" width="1" height="10" fill="#ddeeff"/>
    <rect x="13" y="1" width="1" height="1"  fill="#ffffff"/>
    <rect x="13" y="9" width="1" height="2"  fill="#aabbcc"/>
    <rect x="11" y="5" width="4" height="1" fill="#aabbcc"/>
    <rect x="12" y="6" width="2" height="1" fill="#778899"/>
    <rect x="13" y="6" width="1" height="3" fill="#885533"/>
    <rect x="13" y="9" width="1" height="1" fill="#ffee55"/>
    <!-- PLUME -->
    <rect x="7"  y="0" width="3" height="1" fill="#ee3311"/>
    <rect x="8"  y="0" width="1" height="1" fill="#ff6644"/>
    <rect x="7"  y="1" width="3" height="1" fill="#cc2200"/>
    <!-- HELMET -->
    <rect x="5"  y="1" width="5" height="1" fill="#ccdde8"/>
    <rect x="4"  y="1" width="8" height="4" fill="#8899aa"/>
    <rect x="3"  y="2" width="2" height="4" fill="#778899"/>
    <rect x="11" y="2" width="2" height="4" fill="#667788"/>
    <rect x="4"  y="1" width="1" height="4" fill="#aabbcc"/>
    <rect x="4"  y="4" width="8" height="1" fill="#667788"/>
    <rect x="4"  y="3" width="8" height="1" fill="#223344"/>
    <rect x="5"  y="3" width="2" height="1" fill="#66bbff"/>
    <rect x="9"  y="3" width="2" height="1" fill="#66bbff"/>
    <!-- GORGET -->
    <rect x="5"  y="5" width="5" height="1" fill="#ddbb44"/>
    <rect x="6"  y="5" width="3" height="1" fill="#ffee66"/>
    <!-- PAULDRONS -->
    <rect x="1"  y="6" width="4" height="3" fill="#8899aa"/>
    <rect x="1"  y="6" width="4" height="1" fill="#bbccdd"/>
    <rect x="1"  y="8" width="4" height="1" fill="#556677"/>
    <rect x="11" y="6" width="4" height="3" fill="#8899aa"/>
    <rect x="11" y="6" width="4" height="1" fill="#bbccdd"/>
    <rect x="11" y="8" width="4" height="1" fill="#556677"/>
    <!-- CHEST -->
    <rect x="4"  y="6" width="8" height="7" fill="#8899aa"/>
    <rect x="5"  y="6" width="6" height="1" fill="#aabbcc"/>
    <rect x="4"  y="6" width="1" height="7" fill="#aabbcc"/>
    <rect x="11" y="6" width="1" height="7" fill="#556677"/>
    <rect x="4"  y="12" width="8" height="1" fill="#556677"/>
    <rect x="7"  y="6" width="2" height="7" fill="#778899"/>
    <rect x="6"  y="9" width="4" height="1" fill="#ddbb44"/>
    <rect x="7"  y="8" width="2" height="3" fill="#ddbb44"/>
    <rect x="7"  y="8" width="2" height="1" fill="#ffee66"/>
    <!-- BELT -->
    <rect x="4"  y="13" width="8" height="1" fill="#886633"/>
    <rect x="7"  y="13" width="2" height="1" fill="#ffdd44"/>
    <!-- ARMS -->
    <rect x="2"  y="9"  width="2" height="4" fill="#8899aa"/>
    <rect x="2"  y="9"  width="1" height="4" fill="#aabbcc"/>
    <rect x="2"  y="13" width="2" height="2" fill="#778899"/>
    <rect x="12" y="9"  width="2" height="4" fill="#8899aa"/>
    <rect x="12" y="13" width="2" height="2" fill="#778899"/>
    <!-- LEGS -->
    <rect x="4"  y="14" width="3" height="4" fill="#8899aa"/>
    <rect x="4"  y="14" width="1" height="4" fill="#aabbcc"/>
    <rect x="6"  y="14" width="1" height="4" fill="#556677"/>
    <rect x="4"  y="15" width="3" height="1" fill="#bbccdd"/>
    <rect x="9"  y="14" width="3" height="4" fill="#8899aa"/>
    <rect x="9"  y="14" width="1" height="4" fill="#aabbcc"/>
    <rect x="11" y="14" width="1" height="4" fill="#556677"/>
    <rect x="9"  y="15" width="3" height="1" fill="#bbccdd"/>
    <!-- BOOTS -->
    <rect x="3"  y="18" width="4" height="3" fill="#556677"/>
    <rect x="3"  y="18" width="4" height="1" fill="#778899"/>
    <rect x="9"  y="18" width="4" height="3" fill="#556677"/>
    <rect x="9"  y="18" width="4" height="1" fill="#778899"/>
  </svg>`,

  mage: `<svg width="64" height="96" viewBox="0 0 16 24" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <!-- SHADOW -->
    <ellipse cx="8" cy="23" rx="5" ry="1" fill="#000000" opacity=".35"/>
    <!-- STAFF -->
    <rect x="13" y="3"  width="1" height="14" fill="#775533"/>
    <rect x="13" y="3"  width="1" height="1"  fill="#997755"/>
    <rect x="12" y="2"  width="3" height="2"  fill="#aabb88"/>
    <rect x="13" y="1"  width="1" height="2"  fill="#ccddaa"/>
    <rect x="12" y="0"  width="3" height="2"  fill="#88ffee"/>
    <rect x="13" y="0"  width="1" height="1"  fill="#ffffff"/>
    <!-- HAT -->
    <rect x="7"  y="0"  width="2" height="1"  fill="#9955dd"/>
    <rect x="6"  y="1"  width="4" height="1"  fill="#8844cc"/>
    <rect x="5"  y="2"  width="6" height="1"  fill="#7733bb"/>
    <rect x="3"  y="3"  width="10" height="1" fill="#5522aa"/>
    <rect x="4"  y="3"  width="8"  height="1" fill="#7744bb"/>
    <rect x="7"  y="1"  width="1" height="2"  fill="#bb77ff"/>
    <!-- FACE -->
    <rect x="5"  y="4"  width="6" height="5"  fill="#f0c8a0"/>
    <rect x="5"  y="4"  width="1" height="5"  fill="#f5d5b0"/>
    <rect x="10" y="4"  width="1" height="5"  fill="#d4a878"/>
    <rect x="5"  y="8"  width="6" height="1"  fill="#d4a878"/>
    <rect x="6"  y="5"  width="2" height="2"  fill="#ffffff"/>
    <rect x="9"  y="5"  width="2" height="2"  fill="#ffffff"/>
    <rect x="6"  y="6"  width="2" height="1"  fill="#8800cc"/>
    <rect x="9"  y="6"  width="2" height="1"  fill="#8800cc"/>
    <!-- wrinkle detail -->
    <rect x="7"  y="5"  width="1" height="1"  fill="#aa44ee"/>
    <rect x="5"  y="6"  width="1" height="1"  fill="#c4906a"/>
    <!-- BEARD -->
    <rect x="6"  y="8"  width="4" height="1"  fill="#eeeeff"/>
    <rect x="6"  y="9"  width="4" height="1"  fill="#ddddee"/>
    <!-- ROBE -->
    <rect x="3"  y="9"  width="10" height="7" fill="#6633aa"/>
    <rect x="4"  y="9"  width="8"  height="1" fill="#8855cc"/>
    <rect x="3"  y="9"  width="1"  height="7" fill="#8855cc"/>
    <rect x="12" y="9"  width="1"  height="7" fill="#441188"/>
    <rect x="7"  y="9"  width="2"  height="7" fill="#5522aa"/>
    <rect x="6"  y="11" width="4"  height="1" fill="#ddaaff"/>
    <rect x="7"  y="10" width="2"  height="3" fill="#ddaaff"/>
    <rect x="7"  y="10" width="2"  height="1" fill="#ffffff"/>
    <rect x="4"  y="15" width="8"  height="1" fill="#886644"/>
    <rect x="7"  y="15" width="2"  height="1" fill="#ffdd88"/>
    <!-- SLEEVES -->
    <rect x="1"  y="9"  width="3"  height="5" fill="#5522aa"/>
    <rect x="1"  y="9"  width="1"  height="5" fill="#7744cc"/>
    <rect x="12" y="9"  width="3"  height="5" fill="#5522aa"/>
    <rect x="14" y="9"  width="1"  height="5" fill="#331188"/>
    <!-- ROBE LOWER -->
    <rect x="4"  y="16" width="8"  height="5" fill="#5522aa"/>
    <rect x="5"  y="16" width="6"  height="1" fill="#7744cc"/>
    <rect x="4"  y="16" width="1"  height="5" fill="#7744cc"/>
    <rect x="11" y="16" width="1"  height="5" fill="#441188"/>
    <rect x="4"  y="20" width="2"  height="1" fill="#441188"/>
    <rect x="7"  y="19" width="2"  height="2" fill="#441188"/>
    <rect x="10" y="20" width="2"  height="1" fill="#441188"/>
  </svg>`,

  rogue: `<svg width="64" height="96" viewBox="0 0 16 24" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <ellipse cx="8" cy="23" rx="5" ry="1" fill="#000000" opacity=".4"/>
    <!-- DAGGERS -->
    <rect x="1"  y="4"  width="1" height="7"  fill="#ccdde0"/>
    <rect x="1"  y="4"  width="1" height="1"  fill="#eef8ff"/>
    <rect x="1"  y="9"  width="1" height="2"  fill="#99aacc"/>
    <rect x="0"  y="6"  width="2" height="1"  fill="#aabbcc"/>
    <rect x="1"  y="7"  width="1" height="2"  fill="#664422"/>
    <rect x="14" y="4"  width="1" height="7"  fill="#ccdde0"/>
    <rect x="14" y="4"  width="1" height="1"  fill="#eef8ff"/>
    <rect x="14" y="9"  width="1" height="2"  fill="#99aacc"/>
    <rect x="14" y="6"  width="2" height="1"  fill="#aabbcc"/>
    <rect x="14" y="7"  width="1" height="2"  fill="#664422"/>
    <!-- HOOD -->
    <rect x="3"  y="0"  width="10" height="6" fill="#1a1a2a"/>
    <rect x="2"  y="1"  width="12" height="5" fill="#222233"/>
    <rect x="4"  y="0"  width="8"  height="1" fill="#334455"/>
    <rect x="3"  y="0"  width="1"  height="4" fill="#334455"/>
    <!-- FACE -->
    <rect x="5"  y="3"  width="6"  height="4" fill="#b88050"/>
    <rect x="5"  y="3"  width="1"  height="4" fill="#c89060"/>
    <rect x="10" y="3"  width="1"  height="4" fill="#8a5a30"/>
    <rect x="5"  y="3"  width="6"  height="1" fill="#a06040"/>
    <!-- scar detail -->
    <rect x="9"  y="5"  width="1"  height="2" fill="#7a3a10"/>
    <!-- EYES -->
    <rect x="6"  y="4"  width="2"  height="1" fill="#00ff88"/>
    <rect x="9"  y="4"  width="2"  height="1" fill="#00ff88"/>
    <rect x="7"  y="4"  width="1"  height="1" fill="#88ffcc"/>
    <rect x="10" y="4"  width="1"  height="1" fill="#88ffcc"/>
    <!-- SCARF -->
    <rect x="5"  y="6"  width="6"  height="2" fill="#1a1a2a"/>
    <rect x="5"  y="6"  width="6"  height="1" fill="#2a2a3a"/>
    <!-- COLLAR -->
    <rect x="4"  y="7"  width="8"  height="2" fill="#222233"/>
    <!-- VEST -->
    <rect x="4"  y="9"  width="8"  height="6" fill="#333344"/>
    <rect x="5"  y="9"  width="6"  height="1" fill="#445566"/>
    <rect x="4"  y="9"  width="1"  height="6" fill="#445566"/>
    <rect x="11" y="9"  width="1"  height="6" fill="#222233"/>
    <rect x="7"  y="9"  width="2"  height="5" fill="#2a2a3a"/>
    <rect x="5"  y="11" width="1"  height="1" fill="#ccaa44"/>
    <rect x="10" y="11" width="1"  height="1" fill="#ccaa44"/>
    <!-- BELT -->
    <rect x="4"  y="14" width="8"  height="1" fill="#886644"/>
    <rect x="7"  y="14" width="2"  height="1" fill="#ffdd44"/>
    <rect x="4"  y="15" width="2"  height="2" fill="#664422"/>
    <rect x="10" y="15" width="2"  height="2" fill="#664422"/>
    <!-- ARMS -->
    <rect x="2"  y="9"  width="2"  height="5" fill="#2a2a3a"/>
    <rect x="2"  y="14" width="2"  height="2" fill="#441100"/>
    <rect x="12" y="9"  width="2"  height="5" fill="#2a2a3a"/>
    <rect x="12" y="14" width="2"  height="2" fill="#441100"/>
    <!-- LEGS -->
    <rect x="4"  y="17" width="3"  height="4" fill="#222233"/>
    <rect x="4"  y="17" width="1"  height="4" fill="#334455"/>
    <rect x="9"  y="17" width="3"  height="4" fill="#222233"/>
    <rect x="11" y="17" width="1"  height="4" fill="#111122"/>
    <!-- BOOTS -->
    <rect x="3"  y="19" width="4"  height="3" fill="#331100"/>
    <rect x="3"  y="19" width="4"  height="1" fill="#552211"/>
    <rect x="9"  y="19" width="4"  height="3" fill="#331100"/>
    <rect x="9"  y="19" width="4"  height="1" fill="#552211"/>
  </svg>`,

  archer: `<svg width="64" height="96" viewBox="0 0 16 24" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <ellipse cx="8" cy="23" rx="5" ry="1" fill="#000000" opacity=".3"/>
    <!-- BOW -->
    <rect x="14" y="0"  width="1" height="2"  fill="#6a4a1a"/>
    <rect x="13" y="2"  width="1" height="1"  fill="#886633"/>
    <rect x="13" y="3"  width="1" height="10" fill="#886633"/>
    <rect x="14" y="13" width="1" height="2"  fill="#6a4a1a"/>
    <rect x="13" y="12" width="1" height="1"  fill="#886633"/>
    <rect x="15" y="1"  width="1" height="1"  fill="#ddcc88"/>
    <rect x="15" y="14" width="1" height="1"  fill="#ddcc88"/>
    <rect x="15" y="2"  width="1" height="12" fill="#ccbb77"/>
    <!-- QUIVER -->
    <rect x="2"  y="5"  width="2" height="7"  fill="#774422"/>
    <rect x="2"  y="5"  width="2" height="1"  fill="#996633"/>
    <rect x="2"  y="3"  width="1" height="3"  fill="#886644"/>
    <rect x="3"  y="2"  width="1" height="4"  fill="#886644"/>
    <!-- HAT -->
    <rect x="4"  y="0"  width="7" height="2"  fill="#4a6a1a"/>
    <rect x="4"  y="0"  width="7" height="1"  fill="#5a7a2a"/>
    <rect x="2"  y="2"  width="12" height="1" fill="#3a5a0a"/>
    <rect x="3"  y="2"  width="10" height="1" fill="#5a7a2a"/>
    <rect x="10" y="0"  width="1" height="2"  fill="#88bb44"/>
    <rect x="11" y="0"  width="1" height="1"  fill="#aad455"/>
    <!-- FACE -->
    <rect x="5"  y="3"  width="6" height="5"  fill="#e0a870"/>
    <rect x="5"  y="3"  width="1" height="5"  fill="#ebb880"/>
    <rect x="10" y="3"  width="1" height="5"  fill="#c08848"/>
    <rect x="5"  y="7"  width="6" height="1"  fill="#c08848"/>
    <!-- determined brow -->
    <rect x="6"  y="3"  width="2" height="1"  fill="#6a3a10"/>
    <rect x="9"  y="3"  width="2" height="1"  fill="#6a3a10"/>
    <!-- EYES -->
    <rect x="6"  y="4"  width="2" height="2"  fill="#ffffff"/>
    <rect x="9"  y="4"  width="2" height="2"  fill="#ffffff"/>
    <rect x="6"  y="5"  width="2" height="1"  fill="#2a6a2a"/>
    <rect x="9"  y="5"  width="2" height="1"  fill="#2a6a2a"/>
    <rect x="7"  y="4"  width="1" height="1"  fill="#44aa44"/>
    <!-- TUNIC -->
    <rect x="4"  y="9"  width="8" height="6"  fill="#4a6a2a"/>
    <rect x="5"  y="9"  width="6" height="1"  fill="#6a8a4a"/>
    <rect x="4"  y="9"  width="1" height="6"  fill="#6a8a4a"/>
    <rect x="11" y="9"  width="1" height="6"  fill="#2a4a0a"/>
    <rect x="4"  y="14" width="8" height="1"  fill="#2a4a0a"/>
    <rect x="7"  y="9"  width="2" height="3"  fill="#3a5a1a"/>
    <rect x="3"  y="9"  width="2" height="2"  fill="#886644"/>
    <rect x="11" y="9"  width="2" height="2"  fill="#886644"/>
    <rect x="4"  y="14" width="8" height="1"  fill="#775533"/>
    <rect x="7"  y="14" width="2" height="1"  fill="#ffdd44"/>
    <!-- ARMS -->
    <rect x="2"  y="11" width="2" height="4"  fill="#4a6a2a"/>
    <rect x="2"  y="13" width="2" height="2"  fill="#774422"/>
    <rect x="12" y="11" width="2" height="4"  fill="#4a6a2a"/>
    <rect x="12" y="13" width="2" height="2"  fill="#774422"/>
    <!-- LEGS -->
    <rect x="4"  y="15" width="3" height="6"  fill="#3a5a1a"/>
    <rect x="4"  y="15" width="1" height="6"  fill="#5a7a3a"/>
    <rect x="9"  y="15" width="3" height="6"  fill="#3a5a1a"/>
    <rect x="11" y="15" width="1" height="6"  fill="#2a4a0a"/>
    <!-- BOOTS -->
    <rect x="3"  y="19" width="4" height="3"  fill="#552211"/>
    <rect x="3"  y="19" width="4" height="1"  fill="#774433"/>
    <rect x="9"  y="19" width="4" height="3"  fill="#552211"/>
    <rect x="9"  y="19" width="4" height="1"  fill="#774433"/>
  </svg>`,

  paladin: `<svg width="64" height="96" viewBox="0 0 16 24" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <ellipse cx="8" cy="23" rx="5" ry="1" fill="#ffee44" opacity=".2"/>
    <!-- SHIELD -->
    <rect x="0"  y="7"  width="3" height="5"  fill="#ddbb44"/>
    <rect x="0"  y="7"  width="3" height="1"  fill="#ffee88"/>
    <rect x="0"  y="7"  width="1" height="5"  fill="#ffee88"/>
    <rect x="0"  y="11" width="3" height="1"  fill="#aa8822"/>
    <rect x="1"  y="8"  width="1" height="3"  fill="#ffffff"/>
    <rect x="0"  y="9"  width="3" height="1"  fill="#ffffff"/>
    <rect x="1"  y="8"  width="1" height="1"  fill="#88ccff"/>
    <!-- WARHAMMER -->
    <rect x="13" y="7"  width="1" height="8"  fill="#886644"/>
    <rect x="12" y="3"  width="3" height="5"  fill="#99aabb"/>
    <rect x="12" y="3"  width="3" height="1"  fill="#bbccdd"/>
    <rect x="12" y="3"  width="1" height="5"  fill="#bbccdd"/>
    <rect x="14" y="3"  width="1" height="5"  fill="#667788"/>
    <rect x="13" y="5"  width="1" height="1"  fill="#88aaff"/>
    <!-- CROWN -->
    <rect x="4"  y="0"  width="8" height="2"  fill="#ddbb44"/>
    <rect x="7"  y="0"  width="2" height="1"  fill="#88aaff"/>
    <rect x="8"  y="0"  width="1" height="1"  fill="#aaccff"/>
    <rect x="5"  y="0"  width="1" height="1"  fill="#ffee66"/>
    <rect x="10" y="0"  width="1" height="1"  fill="#ffee66"/>
    <!-- FACE -->
    <rect x="5"  y="2"  width="6" height="5"  fill="#f5d0a0"/>
    <rect x="5"  y="2"  width="1" height="5"  fill="#f8ddb0"/>
    <rect x="10" y="2"  width="1" height="5"  fill="#d4a878"/>
    <!-- noble jaw detail -->
    <rect x="6"  y="6"  width="4" height="1"  fill="#c0905a"/>
    <rect x="7"  y="6"  width="2" height="1"  fill="#e0b880"/>
    <!-- EYES -->
    <rect x="6"  y="3"  width="2" height="2"  fill="#ffffff"/>
    <rect x="9"  y="3"  width="2" height="2"  fill="#ffffff"/>
    <rect x="6"  y="4"  width="2" height="1"  fill="#2244cc"/>
    <rect x="9"  y="4"  width="2" height="1"  fill="#2244cc"/>
    <rect x="7"  y="3"  width="1" height="1"  fill="#4466ee"/>
    <!-- GORGET -->
    <rect x="5"  y="7"  width="6" height="1"  fill="#ddbb44"/>
    <!-- PAULDRONS -->
    <rect x="2"  y="8"  width="4" height="3"  fill="#ddbb44"/>
    <rect x="2"  y="8"  width="4" height="1"  fill="#ffee88"/>
    <rect x="2"  y="8"  width="1" height="3"  fill="#ffee88"/>
    <rect x="10" y="8"  width="4" height="3"  fill="#ddbb44"/>
    <rect x="10" y="8"  width="4" height="1"  fill="#ffee88"/>
    <rect x="13" y="8"  width="1" height="3"  fill="#aa8822"/>
    <!-- CHEST PLATE -->
    <rect x="4"  y="8"  width="8" height="7"  fill="#ccaa33"/>
    <rect x="5"  y="8"  width="6" height="1"  fill="#ffee88"/>
    <rect x="4"  y="8"  width="1" height="7"  fill="#ffee88"/>
    <rect x="11" y="8"  width="1" height="7"  fill="#886622"/>
    <rect x="7"  y="8"  width="2" height="7"  fill="#bbaa33"/>
    <rect x="5"  y="10" width="6" height="1"  fill="#ffffff"/>
    <rect x="7"  y="9"  width="2" height="4"  fill="#ffffff"/>
    <rect x="7"  y="9"  width="2" height="1"  fill="#88ccff"/>
    <!-- BELT -->
    <rect x="4"  y="15" width="8" height="1"  fill="#aa8833"/>
    <rect x="7"  y="15" width="2" height="1"  fill="#ffee44"/>
    <!-- ARMS -->
    <rect x="2"  y="11" width="2" height="4"  fill="#ccaa33"/>
    <rect x="2"  y="11" width="1" height="4"  fill="#ddbb44"/>
    <rect x="12" y="11" width="2" height="4"  fill="#ccaa33"/>
    <rect x="2"  y="15" width="2" height="2"  fill="#bbaa33"/>
    <rect x="12" y="15" width="2" height="2"  fill="#bbaa33"/>
    <!-- LEGS -->
    <rect x="4"  y="16" width="3" height="5"  fill="#ccaa33"/>
    <rect x="4"  y="16" width="1" height="5"  fill="#ffee88"/>
    <rect x="6"  y="16" width="1" height="5"  fill="#886622"/>
    <rect x="4"  y="17" width="3" height="1"  fill="#ffee88"/>
    <rect x="9"  y="16" width="3" height="5"  fill="#ccaa33"/>
    <rect x="9"  y="16" width="1" height="5"  fill="#ffee88"/>
    <rect x="11" y="16" width="1" height="5"  fill="#886622"/>
    <!-- BOOTS -->
    <rect x="3"  y="19" width="4" height="3"  fill="#aa8822"/>
    <rect x="3"  y="19" width="4" height="1"  fill="#ccaa33"/>
    <rect x="9"  y="19" width="4" height="3"  fill="#aa8822"/>
    <rect x="9"  y="19" width="4" height="1"  fill="#ccaa33"/>
  </svg>`,
};

// ── Tier-4: Glowing Eyes, Cloak, and enhanced armor (same SVG base as T3 + CSS glow) ──
// T4 uses T3 sprites + drop-shadow CSS — no new SVG needed.

// ── Tier-5: Animated weapon shimmer + larger body 20×28 ──
const COSM_T5_SPRITES = {

  warrior: `<svg width="80" height="112" viewBox="0 0 20 28" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <!-- EPIC AURA particles (static positions for SVG) -->
    <circle cx="2"  cy="5"  r="1" fill="#6699ff" opacity=".7"/>
    <circle cx="18" cy="8"  r="1" fill="#6699ff" opacity=".5"/>
    <circle cx="1"  cy="14" r="1" fill="#aaddff" opacity=".6"/>
    <circle cx="19" cy="20" r="1" fill="#6699ff" opacity=".4"/>
    <circle cx="3"  cy="22" r="1" fill="#aaddff" opacity=".5"/>
    <!-- EPIC SHADOW -->
    <ellipse cx="10" cy="27" rx="7" ry="1.5" fill="#000000" opacity=".4"/>
    <!-- BROADSWORD (bigger) -->
    <rect x="16" y="1" width="2" height="13" fill="#ddeeff"/>
    <rect x="16" y="1" width="2" height="2"  fill="#ffffff"/>
    <rect x="16" y="12" width="2" height="2" fill="#aabbcc"/>
    <rect x="14" y="7" width="5" height="1" fill="#aabbcc"/>
    <rect x="15" y="8" width="3" height="1" fill="#778899"/>
    <rect x="16" y="8" width="2" height="4" fill="#885533"/>
    <rect x="16" y="12" width="2" height="1" fill="#ffee55"/>
    <!-- shimmer line on blade -->
    <rect x="17" y="2" width="1" height="9" fill="#ffffff" opacity=".5"/>
    <!-- EPIC PLUME (3 colors) -->
    <rect x="8"  y="0" width="4" height="2" fill="#ee3311"/>
    <rect x="9"  y="0" width="2" height="1" fill="#ffaa00"/>
    <rect x="8"  y="1" width="4" height="1" fill="#cc2200"/>
    <rect x="10" y="0" width="1" height="2" fill="#ffcc44"/>
    <!-- HELMET -->
    <rect x="5"  y="1" width="10" height="5" fill="#8899aa"/>
    <rect x="6"  y="1" width="8"  height="1" fill="#ccdde8"/>
    <rect x="4"  y="2" width="3"  height="5" fill="#778899"/>
    <rect x="13" y="2" width="3"  height="5" fill="#667788"/>
    <rect x="5"  y="1" width="1"  height="5" fill="#aabbcc"/>
    <rect x="5"  y="4" width="10" height="1" fill="#667788"/>
    <rect x="5"  y="3" width="10" height="2" fill="#223344"/>
    <!-- GLOWING EYES (epic) -->
    <rect x="6"  y="4" width="3"  height="1" fill="#00ccff"/>
    <rect x="7"  y="4" width="1"  height="1" fill="#ffffff"/>
    <rect x="11" y="4" width="3"  height="1" fill="#00ccff"/>
    <rect x="12" y="4" width="1"  height="1" fill="#ffffff"/>
    <!-- GORGET -->
    <rect x="7"  y="6" width="6"  height="1" fill="#ddbb44"/>
    <rect x="8"  y="6" width="4"  height="1" fill="#ffee66"/>
    <!-- PAULDRONS (epic, larger) -->
    <rect x="1"  y="7" width="5"  height="4" fill="#8899aa"/>
    <rect x="1"  y="7" width="5"  height="1" fill="#bbccdd"/>
    <rect x="1"  y="10" width="5" height="1" fill="#556677"/>
    <rect x="1"  y="7" width="1"  height="4" fill="#aabbcc"/>
    <!-- pauldron spike -->
    <rect x="1"  y="6" width="2"  height="1" fill="#aabbcc"/>
    <rect x="14" y="7" width="5"  height="4" fill="#8899aa"/>
    <rect x="14" y="7" width="5"  height="1" fill="#bbccdd"/>
    <rect x="14" y="10" width="5" height="1" fill="#556677"/>
    <rect x="17" y="6" width="2"  height="1" fill="#aabbcc"/>
    <!-- CHEST (epic) -->
    <rect x="5"  y="7" width="10" height="8" fill="#8899aa"/>
    <rect x="6"  y="7" width="8"  height="1" fill="#aabbcc"/>
    <rect x="5"  y="7" width="1"  height="8" fill="#aabbcc"/>
    <rect x="14" y="7" width="1"  height="8" fill="#556677"/>
    <rect x="9"  y="7" width="2"  height="8" fill="#778899"/>
    <!-- EPIC CROSS EMBLEM -->
    <rect x="7"  y="10" width="6"  height="2" fill="#ddbb44"/>
    <rect x="9"  y="8"  width="2"  height="6" fill="#ddbb44"/>
    <rect x="9"  y="8"  width="2"  height="1" fill="#ffffff"/>
    <rect x="7"  y="10" width="1"  height="1" fill="#ffffff"/>
    <!-- BELT -->
    <rect x="5"  y="15" width="10" height="2" fill="#886633"/>
    <rect x="9"  y="15" width="2"  height="2" fill="#ffdd44"/>
    <!-- ARMS (epic gauntlets) -->
    <rect x="2"  y="11" width="3"  height="5" fill="#8899aa"/>
    <rect x="2"  y="11" width="1"  height="5" fill="#aabbcc"/>
    <rect x="2"  y="16" width="3"  height="3" fill="#667788"/>
    <rect x="2"  y="16" width="1"  height="3" fill="#778899"/>
    <rect x="15" y="11" width="3"  height="5" fill="#8899aa"/>
    <rect x="15" y="16" width="3"  height="3" fill="#667788"/>
    <!-- LEGS (heavy plate) -->
    <rect x="5"  y="17" width="4"  height="6" fill="#8899aa"/>
    <rect x="5"  y="17" width="1"  height="6" fill="#aabbcc"/>
    <rect x="8"  y="17" width="1"  height="6" fill="#556677"/>
    <rect x="5"  y="18" width="4"  height="1" fill="#bbccdd"/>
    <rect x="11" y="17" width="4"  height="6" fill="#8899aa"/>
    <rect x="11" y="17" width="1"  height="6" fill="#aabbcc"/>
    <rect x="14" y="17" width="1"  height="6" fill="#556677"/>
    <rect x="11" y="18" width="4"  height="1" fill="#bbccdd"/>
    <!-- EPIC SABATONS -->
    <rect x="4"  y="23" width="6"  height="3" fill="#556677"/>
    <rect x="4"  y="23" width="6"  height="1" fill="#778899"/>
    <rect x="11" y="23" width="6"  height="3" fill="#556677"/>
    <rect x="11" y="23" width="6"  height="1" fill="#778899"/>
  </svg>`,

  mage: `<svg width="80" height="112" viewBox="0 0 20 28" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <!-- EPIC ARCANE SPARKS -->
    <circle cx="1"  cy="6"  r="1" fill="#cc88ff" opacity=".8"/>
    <circle cx="19" cy="4"  r="1" fill="#88ffee" opacity=".7"/>
    <circle cx="2"  cy="18" r="1" fill="#aa44ff" opacity=".6"/>
    <circle cx="18" cy="22" r="1" fill="#cc88ff" opacity=".5"/>
    <ellipse cx="10" cy="27" rx="7" ry="1.5" fill="#220055" opacity=".4"/>
    <!-- STAFF (larger, epic) -->
    <rect x="16" y="3"  width="2" height="18" fill="#775533"/>
    <rect x="16" y="3"  width="2" height="2"  fill="#997755"/>
    <rect x="15" y="2"  width="4" height="3"  fill="#aabb88"/>
    <rect x="16" y="0"  width="4" height="3"  fill="#88ffee"/>
    <rect x="17" y="0"  width="2" height="2"  fill="#ffffff"/>
    <rect x="16" y="2"  width="1" height="1"  fill="#aaffdd"/>
    <!-- orb glow rings -->
    <rect x="15" y="0"  width="1" height="3"  fill="#44ddcc" opacity=".7"/>
    <rect x="19" y="0"  width="1" height="3"  fill="#44ddcc" opacity=".5"/>
    <!-- EPIC HAT -->
    <rect x="9"  y="0"  width="2" height="1"  fill="#9955dd"/>
    <rect x="7"  y="1"  width="6" height="2"  fill="#8844cc"/>
    <rect x="5"  y="3"  width="10" height="1" fill="#7733bb"/>
    <rect x="3"  y="4"  width="14" height="2" fill="#5522aa"/>
    <rect x="4"  y="4"  width="12" height="1" fill="#7744bb"/>
    <rect x="9"  y="1"  width="2" height="3"  fill="#bb77ff"/>
    <!-- hat star emblem -->
    <rect x="9"  y="2"  width="2" height="1"  fill="#ffdd00"/>
    <rect x="10" y="1"  width="1" height="3"  fill="#ffdd00" opacity=".6"/>
    <!-- FACE -->
    <rect x="6"  y="6"  width="8" height="6"  fill="#f0c8a0"/>
    <rect x="6"  y="6"  width="1" height="6"  fill="#f5d5b0"/>
    <rect x="13" y="6"  width="1" height="6"  fill="#d4a878"/>
    <rect x="6"  y="11" width="8" height="1"  fill="#d4a878"/>
    <!-- EPIC EYES (glowing purple) -->
    <rect x="7"  y="7"  width="3" height="3"  fill="#ffffff"/>
    <rect x="11" y="7"  width="3" height="3"  fill="#ffffff"/>
    <rect x="7"  y="9"  width="3" height="1"  fill="#aa00ff"/>
    <rect x="11" y="9"  width="3" height="1"  fill="#aa00ff"/>
    <rect x="8"  y="8"  width="1" height="1"  fill="#dd44ff"/>
    <rect x="12" y="8"  width="1" height="1"  fill="#dd44ff"/>
    <!-- BEARD -->
    <rect x="7"  y="11" width="6" height="1"  fill="#eeeeff"/>
    <rect x="7"  y="12" width="6" height="1"  fill="#ddddee"/>
    <!-- EPIC ROBE -->
    <rect x="3"  y="12" width="14" height="9" fill="#6633aa"/>
    <rect x="4"  y="12" width="12" height="1" fill="#8855cc"/>
    <rect x="3"  y="12" width="1"  height="9" fill="#8855cc"/>
    <rect x="16" y="12" width="1"  height="9" fill="#441188"/>
    <rect x="9"  y="12" width="2"  height="9" fill="#5522aa"/>
    <!-- ARCANE RUNE (large) -->
    <rect x="7"  y="14" width="6"  height="2" fill="#ddaaff"/>
    <rect x="9"  y="13" width="2"  height="4" fill="#ddaaff"/>
    <rect x="9"  y="13" width="2"  height="1" fill="#ffffff"/>
    <rect x="7"  y="14" width="1"  height="1" fill="#ffffff"/>
    <!-- diagonal rune lines -->
    <rect x="7"  y="16" width="1"  height="1" fill="#cc88ff"/>
    <rect x="12" y="13" width="1"  height="1" fill="#cc88ff"/>
    <!-- BELT -->
    <rect x="4"  y="20" width="12" height="1" fill="#886644"/>
    <rect x="9"  y="20" width="2"  height="1" fill="#ffdd88"/>
    <!-- SLEEVES -->
    <rect x="1"  y="12" width="3"  height="7" fill="#5522aa"/>
    <rect x="1"  y="12" width="1"  height="7" fill="#7744cc"/>
    <rect x="17" y="12" width="3"  height="7" fill="#5522aa"/>
    <rect x="19" y="12" width="1"  height="7" fill="#331188"/>
    <!-- ROBE LOWER -->
    <rect x="4"  y="21" width="12" height="5" fill="#5522aa"/>
    <rect x="5"  y="21" width="10" height="1" fill="#7744cc"/>
    <rect x="4"  y="21" width="1"  height="5" fill="#7744cc"/>
    <rect x="15" y="21" width="1"  height="5" fill="#441188"/>
    <rect x="4"  y="25" width="4"  height="1" fill="#441188"/>
    <rect x="9"  y="24" width="2"  height="2" fill="#441188"/>
    <rect x="13" y="25" width="4"  height="1" fill="#441188"/>
  </svg>`,

  rogue: `<svg width="80" height="112" viewBox="0 0 20 28" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <!-- SHADOW AURA -->
    <ellipse cx="10" cy="27" rx="7" ry="1.5" fill="#000000" opacity=".5"/>
    <circle cx="1"  cy="8"  r="1" fill="#00ff88" opacity=".6"/>
    <circle cx="19" cy="6"  r="1" fill="#00ff88" opacity=".4"/>
    <circle cx="2"  cy="20" r="1" fill="#00ccff" opacity=".5"/>
    <circle cx="18" cy="18" r="1" fill="#00ff88" opacity=".3"/>
    <!-- EPIC TWIN DAGGERS (longer) -->
    <rect x="1"  y="3"  width="2" height="10" fill="#ccdde0"/>
    <rect x="1"  y="3"  width="2" height="2"  fill="#eef8ff"/>
    <rect x="1"  y="11" width="2" height="2"  fill="#99aacc"/>
    <rect x="0"  y="7"  width="3" height="1"  fill="#aabbcc"/>
    <rect x="1"  y="8"  width="2" height="3"  fill="#664422"/>
    <!-- shimmer -->
    <rect x="2"  y="4"  width="1" height="8"  fill="#ffffff" opacity=".4"/>
    <rect x="17" y="3"  width="2" height="10" fill="#ccdde0"/>
    <rect x="17" y="3"  width="2" height="2"  fill="#eef8ff"/>
    <rect x="17" y="11" width="2" height="2"  fill="#99aacc"/>
    <rect x="17" y="7"  width="3" height="1"  fill="#aabbcc"/>
    <rect x="17" y="8"  width="2" height="3"  fill="#664422"/>
    <rect x="17" y="4"  width="1" height="8"  fill="#ffffff" opacity=".4"/>
    <!-- EPIC HOOD (larger) -->
    <rect x="4"  y="0"  width="12" height="7" fill="#1a1a2a"/>
    <rect x="3"  y="1"  width="14" height="6" fill="#222233"/>
    <rect x="5"  y="0"  width="10" height="1" fill="#334455"/>
    <rect x="4"  y="0"  width="1"  height="5" fill="#334455"/>
    <!-- FACE (larger) -->
    <rect x="6"  y="4"  width="8"  height="5" fill="#b88050"/>
    <rect x="6"  y="4"  width="1"  height="5" fill="#c89060"/>
    <rect x="13" y="4"  width="1"  height="5" fill="#8a5a30"/>
    <!-- scar detail -->
    <rect x="12" y="5"  width="1"  height="3" fill="#7a3a10"/>
    <!-- EPIC EYES (glowing) -->
    <rect x="7"  y="5"  width="3"  height="1" fill="#00ff88"/>
    <rect x="8"  y="5"  width="1"  height="1" fill="#aaffdd"/>
    <rect x="11" y="5"  width="3"  height="1" fill="#00ff88"/>
    <rect x="12" y="5"  width="1"  height="1" fill="#aaffdd"/>
    <!-- SCARF (longer) -->
    <rect x="6"  y="8"  width="8"  height="3" fill="#1a1a2a"/>
    <rect x="6"  y="8"  width="8"  height="1" fill="#2a2a3a"/>
    <!-- trailing scarf end -->
    <rect x="3"  y="9"  width="3"  height="2" fill="#111122"/>
    <!-- COLLAR -->
    <rect x="5"  y="10" width="10" height="2" fill="#222233"/>
    <!-- EPIC VEST (larger) -->
    <rect x="5"  y="12" width="10" height="7" fill="#333344"/>
    <rect x="6"  y="12" width="8"  height="1" fill="#445566"/>
    <rect x="5"  y="12" width="1"  height="7" fill="#445566"/>
    <rect x="14" y="12" width="1"  height="7" fill="#222233"/>
    <rect x="9"  y="12" width="2"  height="6" fill="#2a2a3a"/>
    <rect x="6"  y="14" width="2"  height="1" fill="#ccaa44"/>
    <rect x="12" y="14" width="2"  height="1" fill="#ccaa44"/>
    <!-- BELT + POUCHES -->
    <rect x="5"  y="18" width="10" height="1" fill="#886644"/>
    <rect x="9"  y="18" width="2"  height="1" fill="#ffdd44"/>
    <rect x="5"  y="19" width="3"  height="3" fill="#664422"/>
    <rect x="12" y="19" width="3"  height="3" fill="#664422"/>
    <!-- ARMS + EPIC GLOVES -->
    <rect x="2"  y="12" width="3"  height="7" fill="#2a2a3a"/>
    <rect x="2"  y="19" width="3"  height="3" fill="#440011"/>
    <rect x="15" y="12" width="3"  height="7" fill="#2a2a3a"/>
    <rect x="15" y="19" width="3"  height="3" fill="#440011"/>
    <!-- LEGS -->
    <rect x="5"  y="22" width="4"  height="5" fill="#222233"/>
    <rect x="5"  y="22" width="1"  height="5" fill="#334455"/>
    <rect x="11" y="22" width="4"  height="5" fill="#222233"/>
    <rect x="14" y="22" width="1"  height="5" fill="#111122"/>
    <!-- BOOTS (epic) -->
    <rect x="4"  y="24" width="6"  height="3" fill="#331100"/>
    <rect x="4"  y="24" width="6"  height="1" fill="#552211"/>
    <rect x="10" y="24" width="6"  height="3" fill="#331100"/>
    <rect x="10" y="24" width="6"  height="1" fill="#552211"/>
  </svg>`,

  archer: `<svg width="80" height="112" viewBox="0 0 20 28" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <ellipse cx="10" cy="27" rx="7" ry="1.5" fill="#224400" opacity=".35"/>
    <circle cx="1"  cy="7"  r="1" fill="#aadd00" opacity=".6"/>
    <circle cx="19" cy="10" r="1" fill="#ffdd00" opacity=".5"/>
    <circle cx="2"  cy="20" r="1" fill="#88cc00" opacity=".4"/>
    <!-- EPIC LONGBOW (larger, curved) -->
    <rect x="17" y="0"  width="2" height="3"  fill="#6a4a1a"/>
    <rect x="16" y="3"  width="2" height="1"  fill="#886633"/>
    <rect x="16" y="4"  width="2" height="13" fill="#886633"/>
    <rect x="16" y="4"  width="2" height="2"  fill="#aa8844"/>
    <rect x="17" y="17" width="2" height="3"  fill="#6a4a1a"/>
    <rect x="16" y="16" width="2" height="1"  fill="#886633"/>
    <!-- bowstring -->
    <rect x="19" y="1"  width="1" height="2"  fill="#ddcc88"/>
    <rect x="19" y="18" width="1" height="2"  fill="#ddcc88"/>
    <rect x="19" y="3"  width="1" height="15" fill="#ccbb77"/>
    <!-- EPIC QUIVER -->
    <rect x="2"  y="6"  width="3" height="10" fill="#774422"/>
    <rect x="2"  y="6"  width="3" height="1"  fill="#996633"/>
    <rect x="2"  y="4"  width="2" height="3"  fill="#886644"/>
    <rect x="3"  y="3"  width="2" height="4"  fill="#886644"/>
    <rect x="2"  y="4"  width="1" height="1"  fill="#ccaa55"/>
    <!-- HAT (wider brim) -->
    <rect x="4"  y="0"  width="9" height="3"  fill="#4a6a1a"/>
    <rect x="4"  y="0"  width="9" height="1"  fill="#5a7a2a"/>
    <rect x="2"  y="3"  width="14" height="1" fill="#3a5a0a"/>
    <rect x="3"  y="3"  width="12" height="1" fill="#5a7a2a"/>
    <!-- feather -->
    <rect x="12" y="0"  width="2" height="3"  fill="#88bb44"/>
    <rect x="13" y="0"  width="1" height="1"  fill="#aad455"/>
    <!-- FACE (larger) -->
    <rect x="6"  y="4"  width="8" height="6"  fill="#e0a870"/>
    <rect x="6"  y="4"  width="1" height="6"  fill="#ebb880"/>
    <rect x="13" y="4"  width="1" height="6"  fill="#c08848"/>
    <!-- strong brows -->
    <rect x="7"  y="4"  width="2" height="1"  fill="#6a3a10"/>
    <rect x="11" y="4"  width="2" height="1"  fill="#6a3a10"/>
    <!-- EPIC EYES (sharp focus) -->
    <rect x="7"  y="5"  width="3" height="3"  fill="#ffffff"/>
    <rect x="11" y="5"  width="3" height="3"  fill="#ffffff"/>
    <rect x="7"  y="7"  width="3" height="1"  fill="#226622"/>
    <rect x="11" y="7"  width="3" height="1"  fill="#226622"/>
    <rect x="8"  y="6"  width="1" height="1"  fill="#44bb44"/>
    <rect x="12" y="6"  width="1" height="1"  fill="#44bb44"/>
    <!-- NECK -->
    <rect x="8"  y="10" width="4" height="1"  fill="#d4a060"/>
    <!-- EPIC TUNIC (larger) -->
    <rect x="5"  y="11" width="10" height="7" fill="#4a6a2a"/>
    <rect x="6"  y="11" width="8"  height="1" fill="#6a8a4a"/>
    <rect x="5"  y="11" width="1"  height="7" fill="#6a8a4a"/>
    <rect x="14" y="11" width="1"  height="7" fill="#2a4a0a"/>
    <rect x="5"  y="17" width="10" height="1" fill="#2a4a0a"/>
    <rect x="9"  y="11" width="2"  height="4" fill="#3a5a1a"/>
    <rect x="4"  y="11" width="2"  height="3" fill="#886644"/>
    <rect x="14" y="11" width="2"  height="3" fill="#886644"/>
    <!-- hunter's medal -->
    <rect x="8"  y="14" width="4"  height="2" fill="#ddaa00"/>
    <rect x="9"  y="14" width="2"  height="2" fill="#ffcc00"/>
    <!-- BELT -->
    <rect x="5"  y="17" width="10" height="2" fill="#775533"/>
    <rect x="9"  y="17" width="2"  height="2" fill="#ffdd44"/>
    <!-- ARMS + BRACERS -->
    <rect x="2"  y="14" width="3"  height="5" fill="#4a6a2a"/>
    <rect x="2"  y="17" width="3"  height="3" fill="#774422"/>
    <rect x="15" y="14" width="3"  height="5" fill="#4a6a2a"/>
    <rect x="15" y="17" width="3"  height="3" fill="#774422"/>
    <!-- LEGS -->
    <rect x="5"  y="19" width="4"  height="7" fill="#3a5a1a"/>
    <rect x="5"  y="19" width="1"  height="7" fill="#5a7a3a"/>
    <rect x="8"  y="19" width="1"  height="7" fill="#2a4a0a"/>
    <rect x="11" y="19" width="4"  height="7" fill="#3a5a1a"/>
    <rect x="11" y="19" width="1"  height="7" fill="#5a7a3a"/>
    <rect x="14" y="19" width="1"  height="7" fill="#2a4a0a"/>
    <!-- BOOTS -->
    <rect x="4"  y="23" width="6"  height="3" fill="#552211"/>
    <rect x="4"  y="23" width="6"  height="1" fill="#774433"/>
    <rect x="10" y="23" width="6"  height="3" fill="#552211"/>
    <rect x="10" y="23" width="6"  height="1" fill="#774433"/>
  </svg>`,

  paladin: `<svg width="80" height="112" viewBox="0 0 20 28" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <!-- HOLY AURA -->
    <ellipse cx="10" cy="27" rx="8" ry="2" fill="#ffee44" opacity=".3"/>
    <circle cx="1"  cy="6"  r="1" fill="#ffee44" opacity=".7"/>
    <circle cx="19" cy="4"  r="1" fill="#88aaff" opacity=".6"/>
    <circle cx="2"  cy="18" r="1" fill="#ffee44" opacity=".5"/>
    <circle cx="18" cy="22" r="1" fill="#ffffff" opacity=".4"/>
    <!-- HOLY SHIELD (larger) -->
    <rect x="0"  y="9"  width="4" height="7"  fill="#ddbb44"/>
    <rect x="0"  y="9"  width="4" height="1"  fill="#ffee88"/>
    <rect x="0"  y="9"  width="1" height="7"  fill="#ffee88"/>
    <rect x="0"  y="15" width="4" height="1"  fill="#aa8822"/>
    <rect x="1"  y="10" width="2" height="5"  fill="#ffffff"/>
    <rect x="0"  y="12" width="4" height="1"  fill="#ffffff"/>
    <rect x="1"  y="10" width="1" height="1"  fill="#88ccff"/>
    <!-- EPIC WARHAMMER -->
    <rect x="16" y="9"  width="2" height="11" fill="#886644"/>
    <rect x="16" y="9"  width="2" height="2"  fill="#aa8855"/>
    <rect x="15" y="3"  width="5" height="7"  fill="#99aabb"/>
    <rect x="15" y="3"  width="5" height="1"  fill="#bbccdd"/>
    <rect x="15" y="3"  width="1" height="7"  fill="#bbccdd"/>
    <rect x="19" y="3"  width="1" height="7"  fill="#667788"/>
    <!-- HOLY RUNE glow on hammer -->
    <rect x="16" y="5"  width="2" height="3"  fill="#88aaff"/>
    <rect x="17" y="5"  width="1" height="3"  fill="#aaccff"/>
    <!-- EPIC CROWN -->
    <rect x="5"  y="0"  width="10" height="2" fill="#ddbb44"/>
    <rect x="5"  y="0"  width="1"  height="1" fill="#ffee66"/>
    <rect x="7"  y="0"  width="2"  height="1" fill="#ffee66"/>
    <rect x="10" y="0"  width="2"  height="1" fill="#ffee66"/>
    <rect x="13" y="0"  width="1"  height="1" fill="#ffee66"/>
    <!-- crown gems (holy blue) -->
    <rect x="8"  y="0"  width="4"  height="1" fill="#88aaff"/>
    <rect x="9"  y="0"  width="2"  height="2" fill="#aaccff"/>
    <!-- FACE (noble) -->
    <rect x="6"  y="2"  width="8" height="7"  fill="#f5d0a0"/>
    <rect x="6"  y="2"  width="1" height="7"  fill="#f8ddb0"/>
    <rect x="13" y="2"  width="1" height="7"  fill="#d4a878"/>
    <rect x="7"  y="8"  width="2" height="1"  fill="#c08848"/>
    <!-- EPIC EYES (divine blue) -->
    <rect x="7"  y="4"  width="3" height="3"  fill="#ffffff"/>
    <rect x="11" y="4"  width="3" height="3"  fill="#ffffff"/>
    <rect x="7"  y="6"  width="3" height="1"  fill="#2244cc"/>
    <rect x="11" y="6"  width="3" height="1"  fill="#2244cc"/>
    <rect x="8"  y="5"  width="1" height="1"  fill="#4466ee"/>
    <rect x="12" y="5"  width="1" height="1"  fill="#4466ee"/>
    <!-- inner eye glow -->
    <rect x="8"  y="4"  width="1" height="1"  fill="#88aaff"/>
    <rect x="12" y="4"  width="1" height="1"  fill="#88aaff"/>
    <!-- GORGET -->
    <rect x="7"  y="9"  width="6" height="1"  fill="#ddbb44"/>
    <rect x="8"  y="9"  width="4" height="1"  fill="#ffee66"/>
    <!-- EPIC PAULDRONS (with wings hint) -->
    <rect x="2"  y="10" width="6" height="4"  fill="#ddbb44"/>
    <rect x="2"  y="10" width="6" height="1"  fill="#ffee88"/>
    <rect x="2"  y="10" width="1" height="4"  fill="#ffee88"/>
    <rect x="2"  y="13" width="6" height="1"  fill="#aa8822"/>
    <!-- wing tip -->
    <rect x="2"  y="8"  width="3" height="2"  fill="#ffee88"/>
    <rect x="1"  y="9"  width="2" height="1"  fill="#ffcc44"/>
    <rect x="12" y="10" width="6" height="4"  fill="#ddbb44"/>
    <rect x="12" y="10" width="6" height="1"  fill="#ffee88"/>
    <rect x="17" y="10" width="1" height="4"  fill="#aa8822"/>
    <rect x="15" y="8"  width="3" height="2"  fill="#ffee88"/>
    <rect x="17" y="9"  width="2" height="1"  fill="#ffcc44"/>
    <!-- CHEST PLATE (epic) -->
    <rect x="5"  y="10" width="10" height="9" fill="#ccaa33"/>
    <rect x="6"  y="10" width="8"  height="1" fill="#ffee88"/>
    <rect x="5"  y="10" width="1"  height="9" fill="#ffee88"/>
    <rect x="14" y="10" width="1"  height="9" fill="#886622"/>
    <rect x="9"  y="10" width="2"  height="9" fill="#bbaa33"/>
    <!-- EPIC HOLY CROSS (larger) -->
    <rect x="6"  y="13" width="8"  height="2" fill="#ffffff"/>
    <rect x="9"  y="11" width="2"  height="6" fill="#ffffff"/>
    <rect x="9"  y="11" width="2"  height="2" fill="#88ccff"/>
    <rect x="6"  y="13" width="2"  height="1" fill="#88ccff"/>
    <rect x="12" y="13" width="2"  height="1" fill="#ccddff"/>
    <!-- BELT -->
    <rect x="5"  y="19" width="10" height="2" fill="#aa8833"/>
    <rect x="9"  y="19" width="2"  height="2" fill="#ffee44"/>
    <!-- ARMS (epic gauntlets) -->
    <rect x="2"  y="14" width="3"  height="6" fill="#ccaa33"/>
    <rect x="2"  y="14" width="1"  height="6" fill="#ddbb44"/>
    <rect x="2"  y="20" width="3"  height="3" fill="#bbaa33"/>
    <rect x="15" y="14" width="3"  height="6" fill="#ccaa33"/>
    <rect x="17" y="14" width="1"  height="6" fill="#886622"/>
    <rect x="15" y="20" width="3"  height="3" fill="#bbaa33"/>
    <!-- LEGS (heavy plate) -->
    <rect x="5"  y="21" width="4"  height="6" fill="#ccaa33"/>
    <rect x="5"  y="21" width="1"  height="6" fill="#ffee88"/>
    <rect x="8"  y="21" width="1"  height="6" fill="#886622"/>
    <rect x="5"  y="22" width="4"  height="1" fill="#ffee88"/>
    <rect x="11" y="21" width="4"  height="6" fill="#ccaa33"/>
    <rect x="11" y="21" width="1"  height="6" fill="#ffee88"/>
    <rect x="14" y="21" width="1"  height="6" fill="#886622"/>
    <!-- SABATONS (epic) -->
    <rect x="4"  y="24" width="6"  height="3" fill="#aa8822"/>
    <rect x="4"  y="24" width="6"  height="1" fill="#ccaa33"/>
    <rect x="10" y="24" width="6"  height="3" fill="#aa8822"/>
    <rect x="10" y="24" width="6"  height="1" fill="#ccaa33"/>
  </svg>`,
};

// ── Tier-6: LEGENDARY — same as T5 sprites, CSS does the full legendary effect ──
// T6 adds a rotating SVG halo overlay + CSS hue-rotate animation

// ── Main function: returns sprite HTML with cosmetic wrapper ──
function getPlayerSpriteWithCosmetic(classId, classTier, cosmeticTier) {
  cosmeticTier = cosmeticTier || G.cosmeticTier || 1;
  const ct = COSMETIC_TIERS.find(t => t.tier === cosmeticTier) || COSMETIC_TIERS[0];

  // PNG tiers t1–t4 cover cosmetic tiers 1–4; t5/t6 use t4 PNG + CSS effects
  const svgHtml = getPlayerSprite(classId, classTier, cosmeticTier);

  const classColor = COSM_CLASS_COLOR[classId] || '#ffffff';
  let wrapperClass = `cosm-sprite ${ct.cssClass}`;
  let extraHtml = '';

  if (cosmeticTier === 6) {
    extraHtml = `<div class="cosm-halo cosm-halo-${classId}"></div>`;
  }
  if (cosmeticTier >= 5) {
    extraHtml += `<div class="cosm-particle-burst cosm-pb-${classId}">` +
      Array.from({length:6}, (_,i) => `<div class="cosm-pb-dot" style="--i:${i}"></div>`).join('') +
      `</div>`;
  }

  return `<div class="${wrapperClass}" style="--class-color:${classColor};position:relative;display:inline-block;">
    ${svgHtml}${extraHtml}
  </div>`;
}

// ── Unlock checks ──
function canUnlockCosmeticTier(tier) {
  if (!G.unlockedCosmeticTiers) G.unlockedCosmeticTiers = [1];
  if (G.unlockedCosmeticTiers.includes(tier)) return { unlocked: true };
  switch (tier) {
    case 2: return G.gold >= 500 ? { canBuy: true } : { reason: 'ต้องการ 💰500' };
    case 3: return (G.gold >= 2000 || (G.completedHubQuests||[]).length >= 10)
      ? { canBuy: true }
      : { reason: 'ต้องการ 💰2,000 หรือ ภารกิจ Hub 10 ข้อ' };
    case 4: return (G.gold >= 5000 && G.bossKills >= 5)
      ? { canBuy: true }
      : { reason: `ต้องการ 💰5,000 + บอส 5 ตัว (ปัจจุบัน ${G.bossKills})` };
    case 5: return (G.gold >= 15000 && G.prestigeCount >= 1)
      ? { canBuy: true }
      : { reason: `ต้องการ 💰15,000 + Prestige 1 ครั้ง (ปัจจุบัน ${G.prestigeCount})` };
    case 6: return { reason: 'ได้จากหีบบอสเท่านั้น (โอกาส 2%)' };
    default: return { canBuy: true };
  }
}

function buyCosmeticTier(tier) {
  if (!G.unlockedCosmeticTiers) G.unlockedCosmeticTiers = [1];
  if (G.unlockedCosmeticTiers.includes(tier)) return;
  const costs = { 2: 500, 3: 2000, 4: 5000, 5: 15000 };
  const cost = costs[tier] || 0;
  if (cost > 0 && G.gold < cost) return;
  G.gold -= cost;
  G.unlockedCosmeticTiers.push(tier);
  G.cosmeticTier = tier;
  saveGame();
  renderCosmeticPanel();
  updateTopBar();
  if (typeof updateCharPanel !== 'undefined') updateCharPanel();
}

function setCosmeticTier(tier) {
  if (!G.unlockedCosmeticTiers) G.unlockedCosmeticTiers = [1];
  if (!G.unlockedCosmeticTiers.includes(tier)) return;
  G.cosmeticTier = tier;
  saveGame();
  renderCosmeticPanel();
  if (typeof updateCharPanel !== 'undefined') updateCharPanel();
}

// ── Try to drop T6 from boss chest ──
function tryDropLegendaryCosmetic() {
  if (!G.unlockedCosmeticTiers) G.unlockedCosmeticTiers = [1];
  if (G.unlockedCosmeticTiers.includes(6)) return false;
  if (Math.random() < 0.02) {
    G.unlockedCosmeticTiers.push(6);
    saveGame();
    return true;
  }
  return false;
}

// ── Hub panel renderer ──
function renderCosmeticPanel() {
  const panel = document.getElementById('hub-cosmetic-panel');
  if (!panel) return;
  if (!G.unlockedCosmeticTiers) G.unlockedCosmeticTiers = [1];
  const current = G.cosmeticTier || 1;
  const classId = G.classId || 'warrior';

  const previewHtml = getPlayerSpriteWithCosmetic(classId, G.classTier || 1, current);
  const tilesHtml = COSMETIC_TIERS.map(ct => {
    const check = canUnlockCosmeticTier(ct.tier);
    const isUnlocked = G.unlockedCosmeticTiers.includes(ct.tier);
    const isActive = current === ct.tier;
    let btnLabel, btnStyle, btnDisabled = '';
    if (isActive) {
      btnLabel = '✓ ใช้อยู่';
      btnStyle = 'background:#1a2a1a;border-color:#44ff88;color:#44ff88;';
      btnDisabled = 'disabled';
    } else if (isUnlocked) {
      btnLabel = '▶ เลือก';
      btnStyle = `border-color:${ct.color};color:${ct.color};`;
    } else if (check.canBuy) {
      btnLabel = '💰 ซื้อ';
      btnStyle = `border-color:${ct.color};color:${ct.color};`;
    } else {
      btnLabel = '🔒 ล็อก';
      btnStyle = 'border-color:#555;color:#666;';
      btnDisabled = 'disabled';
    }
    return `<div class="cosm-tile ${isActive ? 'active' : ''}" style="border-color:${isActive ? ct.color : '#333'}">
      <div class="cosm-tile-icon">${ct.icon}</div>
      <div class="cosm-tile-name" style="color:${ct.color}">${ct.name}</div>
      <div class="cosm-tile-cond">${ct.unlockDesc}</div>
      <button class="cosm-tile-btn" style="${btnStyle}" ${btnDisabled}
        onclick="${isUnlocked ? `setCosmeticTier(${ct.tier})` : `buyCosmeticTier(${ct.tier})`}">
        ${btnLabel}
      </button>
    </div>`;
  }).join('');

  panel.innerHTML = `
    <div class="cosm-preview-area">
      <div class="cosm-preview-label" style="color:#aaa;font-size:.8rem;margin-bottom:.4rem">ตัวอย่าง: Tier ${current} — ${COSMETIC_TIERS.find(t=>t.tier===current)?.name}</div>
      <div class="cosm-preview-sprite">${previewHtml}</div>
    </div>
    <div class="cosm-tiles">${tilesHtml}</div>
  `;
}

function openCosmeticPanel() {
  document.getElementById('hub-panel-title').textContent = '✨ รูปลักษณ์ตัวละคร';
  document.getElementById('hub-panel-body').innerHTML = '<div id="hub-cosmetic-panel"></div>';
  document.getElementById('hub-panel').style.display = 'flex';
  renderCosmeticPanel();
  if (typeof closeHubDialogue === 'function') closeHubDialogue();
}

function openCosmeticFromChar() {
  // standalone modal overlay — accessible from character panel without going to hub
  let ov = document.getElementById('cosm-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'cosm-overlay';
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:500;display:flex;align-items:center;justify-content:center;';
    ov.onclick = (e) => { if (e.target === ov) ov.remove(); };
    document.body.appendChild(ov);
  }
  ov.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border2);border-radius:12px;width:min(420px,94vw);max-height:85vh;overflow:hidden;display:flex;flex-direction:column;">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:.8rem 1rem;border-bottom:1px solid var(--border);font-family:'Chakra Petch',sans-serif;color:var(--gold);">
        ✨ รูปลักษณ์ตัวละคร
        <button onclick="document.getElementById('cosm-overlay').remove()" style="background:none;border:none;color:#aaa;font-size:1.2rem;cursor:pointer">✕</button>
      </div>
      <div style="overflow-y:auto;flex:1;">
        <div id="hub-cosmetic-panel"></div>
      </div>
    </div>
  `;
  renderCosmeticPanel();
}
