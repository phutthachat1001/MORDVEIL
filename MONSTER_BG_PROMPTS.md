# MORDVEIL — พรอมพ์มอนสเตอร์ + พื้นหลังทุกด่าน

พรอมพ์เจนรูป **มอนสเตอร์ทุกด่าน (36 ตัว)** + **พื้นหลังฉากสู้ทุกด่าน (6 ด่าน)**

---

## 🎨 STYLE BASE — มอนสเตอร์

```
{MOB STYLE} =
cute-but-menacing chibi pixel art monster sprite, full body, 3/4 front facing
LEFT (will be flipped in-game), big head small body proportions, bold dark
outline, vibrant saturated colors, soft cel shading, expressive face,
sharp clean edges, no text, no watermark, centered, fills ~85% of frame,
square 1:1, high resolution.
**Output: PNG with TRANSPARENT background (alpha channel), isolated single
creature, no scenery, no ground, no shadow box.**
```

> 💡 **เคล็ดลับสั่ง PNG โปร่งใสกับ ChatGPT:** พิมพ์ต่อท้ายว่า
> *"Generate as a PNG file with a transparent background (alpha channel)."*
> ถ้าได้พื้นขาวมา ให้สั่งต่อ *"remove the white background, make it transparent PNG."*

> **ชื่อไฟล์:** วางที่ `assets/sprites/{img}.png` แล้วใส่ `img:'ชื่อ'` ใน ZONES ของ [js/data.js](js/data.js#L29)
> โซน 1 มีรูปแล้ว (gobin ฯลฯ) — ที่ต้องทำคือโซน 2–6
> tier 1–5 = มอนธรรมดา (ตัวเล็กลง→ใหญ่ขึ้น), tier 6 = **บอส** (ตัวใหญ่ อลังการ)

---

## 🌲 Zone 1 — ป่ากอบลิน (มีรูปแล้ว ✅)
อ้างอิงสไตล์: gobin / warrior_gobin / head_gobin / mage_gobin / king_gobin

## 🪦 Zone 2 — หุบเขาซอมบี้ (โทนเขียว-เทาผี, สุสาน)
> เขียนใหม่แบบ "การ์ตูนน่ารัก" เลี่ยงคำที่ทำให้ GPT ปฏิเสธ (no gore/blood words)
- **zombie_rot** (T1 ซอมบี้เน่า) — `a cute cartoon green zombie creature with patched torn clothes and big round eyes, friendly goofy expression, mint-green skin. {MOB STYLE}`
- **zombie_walk** (T2 ซอมบี้เดิน) — `a chubby grey cartoon zombie mid-step with stitched patches and a tilted head, harmless silly look. {MOB STYLE}`
- **zombie_warrior** (T3 ซอมบี้นักรบ) — `a cartoon undead skeleton warrior holding a rusty toy-like sword and dented armor, cute brave pose, bone-white and grey. {MOB STYLE}`
- **zombie_mage** (T4 ซอมบี้แม่มด) — `a cartoon skeleton mage in a tattered hooded robe with glowing green eyes and floating green magic sparkles. {MOB STYLE}`
- **zombie_giant** (T5 ซอมบี้ยักษ์) — `a big round cartoon green ogre-zombie with huge stubby arms and a goofy underbite, chunky and bouncy looking. {MOB STYLE}`
- **zombie_king** (T6 จอมซอมบี้ — BOSS) — `a tall imposing cartoon undead king boss with a bone crown, regal tattered cape, and a glowing ghostly green aura, commanding presence. {MOB STYLE}`

## 🐉 Zone 3 — ถ้ำมังกร (โทนแดง-ส้มไฟ, ถ้ำหิน)
- **dragon_ice** (T1 มังกรน้ำแข็ง) — `a small icy-blue baby dragon, frost breath, crystal scales. {MOB STYLE}`
- **dragon_fire** (T2 มังกรไฟ) — `a fierce red-orange fire dragon, flaming maw, ember scales. {MOB STYLE}`
- **dragon_poison** (T3 มังกรพิษ) — `a green poison dragon with glowing toxic-green breath puffs and bright acid-green scales, fierce cartoon look. {MOB STYLE}`
- **dragon_thunder** (T4 มังกรสายฟ้า) — `a yellow thunder dragon crackling with electric arcs, spiky scales. {MOB STYLE}`
- **dragon_dark** (T5 มังกรมืด) — `a black shadow dragon, dark purple aura, glowing red eyes. {MOB STYLE}`
- **dragon_king** (T6 มังกรราชัน — BOSS) — `a colossal majestic dragon king boss, golden horns, blazing aura, wings spread. {MOB STYLE}`

## 💀 Zone 4 — ซากอสูร (โทนม่วง-ดำมาร, สนามรบซาก)
- **demon_cracked** (T1 อสูรหัวแตก) — `a small purple imp demon with a cracked horn, mischievous grin. {MOB STYLE}`
- **demon_soldier** (T2 อสูรทหาร) — `a demon soldier with dark armor and a jagged blade, red eyes. {MOB STYLE}`
- **demon_witch** (T3 อสูรแม่มด) — `a demon sorceress with trident, purple flames, horned crown. {MOB STYLE}`
- **demon_giant** (T4 อสูรยักษ์) — `a huge chunky cartoon demon with massive horns and glowing orange cracks, tough but cartoonish. {MOB STYLE}`
- **demon_lord** (T5 อสูรจอม) — `an elite cartoon demon lord wreathed in dark-red magic energy, ornate armor, confident pose. {MOB STYLE}`
- **demon_king** (T6 ราชาอสูร — BOSS) — `a gigantic cartoon demon king boss with a crown of horns, glowing red-orange fiery aura, throne presence. {MOB STYLE}`

## 🏰 Zone 5 — ปราสาทมืด (โทนฟ้า-เทาผี, ปราสาทเก่า)
- **castle_ghost** (T1 ผีปราสาท) — `a small translucent blue castle ghost, wispy tail, sad face. {MOB STYLE}`
- **dark_knight** (T2 อัศวินมืด) — `a dark knight in black plate armor, glowing visor, cursed sword. {MOB STYLE}`
- **castle_witch** (T3 แม่มดปราสาท) — `a castle witch in dark robe with pointed hat, glowing staff. {MOB STYLE}`
- **castle_beast** (T4 สัตว์ประหลาด) — `a monstrous bat-winged castle beast, fangs and claws, shadowy. {MOB STYLE}`
- **dark_prince** (T5 เจ้าชายมืด) — `a dark elegant vampire prince, cape, pale skin, red eyes. {MOB STYLE}`
- **castle_lord** (T6 เจ้าแห่งปราสาท — BOSS) — `a regal dark castle lord boss, ornate black crown, ghostly blue aura, throne. {MOB STYLE}`

## 🌀 Zone 6 — อาณาจักรโกลาหล (โทนรุ้ง-จักรวาล, มิติแตก)
- **chaos_imp** (T1 ปีศาจโกลาหล) — `a small swirling chaos imp made of rainbow distortion energy. {MOB STYLE}`
- **cosmic_demon** (T2 อสูรจักรวาล) — `a cosmic demon with starry skin, galaxy patterns, glowing. {MOB STYLE}`
- **dark_god** (T3 เทพมืด) — `a dark deity with multiple eyes, void-purple robe, cosmic aura. {MOB STYLE}`
- **eternal_demon** (T4 อสูรนิรันดร์) — `an eternal demon crackling with cosmic lightning, armored, radiant. {MOB STYLE}`
- **chaos_guardian** (T5 ผู้พิทักษ์โกลาหล) — `a fiery cosmic guardian construct, blazing core, ornate frame. {MOB STYLE}`
- **chaos_god** (T6 เทพแห่งโกลาหล — BOSS) — `a god-tier cosmic chaos deity boss, swirling galaxy body, rainbow shockwave, overwhelming divine presence. {MOB STYLE}`

---

# 🖼️ พื้นหลังฉากสู้ (Battle Backgrounds)

```
{BG STYLE} =
pixel art game battle background, side-scroller arena view, atmospheric depth
with foreground ground and distant background, no characters, no UI, no text,
no watermark, wide 16:9 landscape, rich lighting and mood, high resolution.
**Output: PNG file, full opaque scene (no transparency needed for backgrounds).**
```

> **ชื่อไฟล์:** `assets/bg/battle/zone{N}.png` (zone1 มีแล้ว — ทำ zone2–6)
> 💡 ขอ ChatGPT: *"Generate as a PNG file, 16:9 landscape."*

- **zone2.png** — หุบเขาซอมบี้: `a misty graveyard valley at dusk, fog, tombstones, bare twisted trees, muted green-grey palette. {BG STYLE}`
- **zone3.png** — ถ้ำมังกร: `a glowing volcanic dragon cave, lava cracks, stalactites, red-orange firelight. {BG STYLE}`
- **zone4.png** — ซากอสูร: `a dark demonic battlefield ruins, scattered broken weapons, glowing purple-and-orange fiery sky, charred ground. {BG STYLE}`
- **zone5.png** — ปราสาทมืด: `a haunted dark castle interior, gothic pillars, blue moonlight through broken windows, eerie. {BG STYLE}`
- **zone6.png** — อาณาจักรโกลาหล: `a surreal cosmic chaos realm, fractured floating platforms, swirling rainbow galaxy sky, reality distortion. {BG STYLE}`

> zone1 (ป่ากอบลิน) มีแล้ว — เผื่ออยากทำใหม่: `a lush green goblin forest, tall trees, dappled sunlight, grassy ground. {BG STYLE}`

---

## 📌 หมายเหตุการเชื่อมเข้าเกม
1. **มอน:** หลังเจน + วางไฟล์ที่ `assets/sprites/` → เพิ่ม `img:'ชื่อไฟล์'` ในแต่ละมอนใน `ZONES` ([js/data.js](js/data.js#L29))
   ระบบจะแสดงรูปอัตโนมัติ (มี fallback เป็น emoji ถ้าไฟล์หาย — โค้ดเดิมรองรับ `onerror`)
2. **พื้นหลัง:** วางที่ `assets/bg/battle/zone{N}.png` → CSS ใช้อัตโนมัติ
   (มี selector `#idle-panel[data-zone="N"]` + ฉากสู้ ที่อ้าง path นี้อยู่แล้วใน [css/style.css](css/style.css))
3. ชื่อไฟล์ในพรอมพ์เป็นเพียงคำแนะนำ — จะตั้งใหม่ก็ได้ แค่ให้ `img` ใน data.js ตรงกับชื่อไฟล์จริง
