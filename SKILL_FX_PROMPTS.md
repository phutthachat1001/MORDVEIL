# MORDVEIL — พรอมพ์เอฟเฟกต์สกิล (Skill FX Prompts)

พรอมพ์สำหรับเจนภาพ **เอฟเฟกต์การโจมตี/สกิล** (ใช้ ChatGPT / DALL·E / image-gen)

> **สำคัญ — สเปกไฟล์:** เอฟเฟกต์ในเกมเป็น **PNG พื้นหลังโปร่งใส (transparent)** แสดงทับตัวมอน
> ระบบปัจจุบันโหลดไฟล์ชื่อ `assets/effects/{class}_T{tier}[-{branch}].png`
> (เอฟเฟกต์ผูกกับ **คลาส + tier + สาขา** — ดูส่วน A) — ส่วน B เป็นพรอมพ์ราย "สกิล" เผื่อขยายในอนาคต

---

## 🎨 STYLE BASE (วางต่อท้ายทุกพรอมพ์)

```
{STYLE BASE} =
pixel-art game VFX sprite, single combat effect, bold vibrant colors, crisp
pixel edges with glowing rim light, dynamic energy burst, motion-streak shapes,
centered composition, TRANSPARENT background (alpha, no scene, no character,
no ground), no text, no watermark, square 1:1, high resolution, game-ready
overlay effect.
```

ปรับสีตามคลาส:
- ⚔️ **warrior** = แดง-ส้มเหล็ก (steel red-orange)
- 🔮 **mage** = ม่วง-ฟ้าเวท (arcane purple-blue)
- 🗡️ **rogue** = เขียว-ดำเงา (shadow green-black) / ม่วงเนโคร (T3-S+)
- 🏹 **archer** = ทอง-เขียวลม (gold-green wind)
- ✨ **paladin** = ฟ้า-ขาวศักดิ์สิทธิ์ (holy blue-white)

---

# ส่วน A — เอฟเฟกต์ตามคลาส + Tier (ตรงกับระบบไฟล์จริง)

> ตั้งชื่อไฟล์: `{class}_T{tier}.png` (T1/T2) · `{class}_T{tier}-{branch}.png` (T3/T4)
> เช่น `warrior_T1.png`, `mage_T3-A.png`, `rogue_T4-S.png`

### ⚔️ WARRIOR (แดง-ส้มเหล็ก)
- **warrior_T1** — a single heavy steel slash arc, white-hot edge, sparks. {STYLE BASE}
- **warrior_T2** — a swirling 4-blade storm of crossing slashes, red motion streaks. {STYLE BASE}
- **warrior_T3-A** (มังกร) — a fiery dragon-breath burst, orange flames and embers. {STYLE BASE}
- **warrior_T3-B** (ป้องกัน) — a glowing steel shield barrier with impact ring. {STYLE BASE}
- **warrior_T3-C** (คลั่ง) — a savage red axe-cleave with blood-rage aura. {STYLE BASE}
- **warrior_T3-D** (จอมทัพ) — a golden commander's blade slash with banner glow. {STYLE BASE}
- **warrior_T3-S** (เลือดอสูร) — a crimson demonic claw-slash, dripping red energy. {STYLE BASE}
- **warrior_T4-A** (หายนะ) — a black-red doom nova explosion, skull-shaped smoke. {STYLE BASE}
- **warrior_T4-B** (นิรันดร์) — a towering blue fortress shockwave, indestructible glow. {STYLE BASE}
- **warrior_T4-C** (สงครามเลือด) — a massive fiery axe whirlwind, blood and fire. {STYLE BASE}
- **warrior_T4-D** (จักรพรรดิ) — a golden imperial greatsword shockwave, crown sparks. {STYLE BASE}
- **warrior_T4-S** (อสูรนิรันดร์) — a colossal dark-crimson demon-warlord energy eruption. {STYLE BASE}

### 🔮 MAGE (ม่วง-ฟ้าเวท)
- **mage_T1** — a small fiery magic bolt with purple sparks. {STYLE BASE}
- **mage_T2** — a triple icy blizzard shard burst, blue frost crystals. {STYLE BASE}
- **mage_T3-A** (มืด) — a dark void nova, swirling black-purple energy ring. {STYLE BASE}
- **mage_T3-B** (แสง) — a radiant holy light pillar, golden-white rays. {STYLE BASE}
- **mage_T3-C** (เพลิง) — a raging fire-storm meteor burst, orange-red flames. {STYLE BASE}
- **mage_T3-D** (กาลเวลา) — a cyan time-warp clock ripple, glowing runes. {STYLE BASE}
- **mage_T3-S** (มิติว่าง) — a black hole void rift, distorted purple space. {STYLE BASE}
- **mage_T4-A** (เทพเวท) — a cosmic galaxy judgment blast, deep purple stars. {STYLE BASE}
- **mage_T4-B** (สวรรค์) — heavenly golden lightning rain from above. {STYLE BASE}
- **mage_T4-C** (อัคนีประลัย) — an apocalyptic red comet meteor impact. {STYLE BASE}
- **mage_T4-D** (บงการเวลา) — a blue cosmic time-rift explosion, multiple clock echoes. {STYLE BASE}
- **mage_T4-S** (กลืนจักรวาล) — a universe-devouring black-purple spiral vortex. {STYLE BASE}

### 🗡️ ROGUE (เขียว-ดำเงา / ม่วงเนโคร)
- **rogue_T1** — a quick dual dagger slash X-cross, green motion blur. {STYLE BASE}
- **rogue_T2** — a death-mark sigil slash, dark green skull glyph. {STYLE BASE}
- **rogue_T3-A** (เงา) — a shadow-step phantom slash, black-green smoke trail. {STYLE BASE}
- **rogue_T3-B** (โจรสลัด) — a plundering cutlass slash with gold coins. {STYLE BASE}
- **rogue_T3-C** (พิษ) — a venomous green poison-fang strike, dripping toxin. {STYLE BASE}
- **rogue_T3-D** (สายฟ้า) — a lightning-fast yellow dagger flash, electric arc. {STYLE BASE}
- **rogue_T3-S** (เนโครแมนเซอร์) — a purple necrotic soul-burst with floating skulls. {STYLE BASE}
- **rogue_T4-A** (ราชาเงา) — a shadow-execute black guillotine of dark energy. {STYLE BASE}
- **rogue_T4-B** (จักรพรรดิโจร) — a golden imperial-plunder coin-storm slash. {STYLE BASE}
- **rogue_T4-C** (พิษมรณะ) — a deadly green toxic skull-cloud eruption. {STYLE BASE}
- **rogue_T4-D** (สังหารสายฟ้า) — a god-tier thunder-blade lightning storm. {STYLE BASE}
- **rogue_T4-S** (จักรพรรดิเงา) — a dark-purple shadow-emperor soul nova, undead crowns. {STYLE BASE}

### 🏹 ARCHER (ทอง-เขียวลม)
- **archer_T1** — a single precise glowing arrow streak, gold trail. {STYLE BASE}
- **archer_T2** — a triple-shot fan of three arrows, green wind streaks. {STYLE BASE}
- **archer_T3-A** (ป่า) — a primal multi-arrow volley, green leaf-wind burst. {STYLE BASE}
- **archer_T3-B** (ลม) — a swirling wind-arrow tornado, cyan air spirals. {STYLE BASE}
- **archer_T3-C** (เพลิง) — a flaming fire-arrow rain, orange burning trails. {STYLE BASE}
- **archer_T3-D** (พรานเงา) — a silent shadow-arrow flash, dark muffled streak. {STYLE BASE}
- **archer_T3-S** (ล่าวิญญาณ) — a spectral purple soul-arrow with ghostly eye. {STYLE BASE}
- **archer_T4-A** (จอมล่าจักรวาล) — a cosmic meteor-arrow with star trail impact. {STYLE BASE}
- **archer_T4-B** (เทพลม) — a divine multi-lightning arrow storm, electric gold. {STYLE BASE}
- **archer_T4-C** (เพลิงประลัย) — an apocalyptic flaming arrow-rain meteor shower. {STYLE BASE}
- **archer_T4-D** (พรานมืด) — a dark void-arrow volley, black-violet streaks. {STYLE BASE}
- **archer_T4-S** (เทพล่านิรันดร์) — a galaxy-piercing cosmic arrow shockwave. {STYLE BASE}

### ✨ PALADIN (ฟ้า-ขาวศักดิ์สิทธิ์)
- **paladin_T1** — a holy white sword strike with light sparkle. {STYLE BASE}
- **paladin_T2** — a radiant light-shield dome with golden cross glow. {STYLE BASE}
- **paladin_T3-A** (นักบุญ) — a healing rainbow light aura burst. {STYLE BASE}
- **paladin_T3-B** (พิฆาตมาร) — a holy thunder-smite golden lightning bolt. {STYLE BASE}
- **paladin_T3-C** (ครูเสด) — a blazing crusader sword-and-shield light slash. {STYLE BASE}
- **paladin_T3-D** (พิพากษา) — a divine judgment scale of glowing light. {STYLE BASE}
- **paladin_T3-S** (อมตะ) — a golden immortal revival light pillar. {STYLE BASE}
- **paladin_T4-A** (เทพแสง) — a blinding heavenly radiance sun-burst. {STYLE BASE}
- **paladin_T4-B** (ราชันพิฆาต) — a king's holy lightning crown-smite. {STYLE BASE}
- **paladin_T4-C** (จอมพลครูเสด) — a holy army banner light-shockwave. {STYLE BASE}
- **paladin_T4-D** (พิพากษาสวรรค์) — a final-judgment all-seeing eye of light. {STYLE BASE}
- **paladin_T4-S** (คุ้มครองนิรันดร์) — an eternal guardian dove-light explosion. {STYLE BASE}

---

# ส่วน B — เอฟเฟกต์ราย "สกิล" (40 สกิล — สำหรับขยายอนาคต)

> ใช้เมื่อต้องการให้แต่ละสกิลมีเอฟเฟกต์เฉพาะตัว (ระบบยังไม่รองรับชื่อไฟล์รายสกิล —
> ต้องเพิ่ม mapping `skillId → fx.png` ก่อน; ดูหมายเหตุท้ายไฟล์)

### Tier 1
- **โจมตีหนัก** (heavy_blow) — a single crushing heavy slam impact, red shockwave ring. {STYLE BASE}
- **ลูกไฟเล็ก** (magic_bolt) — a small fiery magic bolt with ember trail. {STYLE BASE}
- **แทงเร็ว** (quick_stab) — two fast green dagger jabs, X motion blur. {STYLE BASE}
- **ยิงแม่น** (precise_shot) — a piercing focused arrow with target glint. {STYLE BASE}
- **ตีศักดิ์สิทธิ์** (holy_strike_t1) — a white holy slash with small heal sparkle. {STYLE BASE}

### Tier 2
- **พายุดาบ** (blade_storm) — a 4-blade red slash cyclone. {STYLE BASE}
- **โห่ร้องศึก** (war_cry) — a red battle-roar aura ring, rising ATK arrows. {STYLE BASE}
- **พายุน้ำแข็ง** (blizzard) — a triple blue ice-shard storm. {STYLE BASE}
- **คลื่นมานา** (mana_surge) — a swirling blue-purple mana wave aura. {STYLE BASE}
- **ระเบิดควัน** (smoke_bomb) — a dark green smoke-cloud burst, hidden dagger glint. {STYLE BASE}
- **เงามรณะ** (death_mark) — a dark-green skull death sigil mark. {STYLE BASE}
- **ตาอินทรี** (eagle_eye) — a glowing golden eagle-eye targeting reticle. {STYLE BASE}
- **ยิงสามลูก** (triple_shot) — three fanned arrows, middle one glowing crit. {STYLE BASE}
- **พื้นศักดิ์สิทธิ์** (consecrate) — a holy glowing ground-rune circle, light reflect. {STYLE BASE}
- **โล่แสง** (light_shield) — a golden light-shield dome with cross. {STYLE BASE}

### Tier 3
- **กระทืบพื้น** (slam) — a ground-stomp crater shockwave, stun stars. {STYLE BASE}
- **ลมหายใจมังกร** (dragon_breath) — a cone of orange dragon fire-breath. {STYLE BASE}
- **โล่เหล็กกล้า** (iron_shield) — a steel shield with reflect-spark ring. {STYLE BASE}
- **เวทระเบิด** (arcane_burst) — a purple arcane explosion ring. {STYLE BASE}
- **โนวาแห่งความมืด** (dark_nova) — a black-purple void nova with HP-drain wisps. {STYLE BASE}
- **แสงศักดิ์สิทธิ์** (holy_light) — a golden light pillar with shielding glow. {STYLE BASE}
- **แทงสังหาร** (backstab) — a critical green backstab flash with gold coins. {STYLE BASE}
- **ก้าวเงา** (shadow_step) — a phantom shadow-dash triple-slash trail. {STYLE BASE}
- **ปล้นสะดม** (plunder) — a gold-coin slash burst, treasure sparkle. {STYLE BASE}
- **ฝนลูกธนู** (arrow_rain) — a rain of 5 arrows falling, green DoT motes. {STYLE BASE}
- **ตราล่า** (hunters_mark) — a glowing hunter target-mark with +DMG arrows. {STYLE BASE}
- **ลูกธนูลม** (wind_shot) — a cyan piercing wind-arrow gust. {STYLE BASE}
- **รักษาศักดิ์สิทธิ์** (divine_heal) — a green-gold full-heal cross burst, cleansing motes. {STYLE BASE}
- **ออร่าศักดิ์สิทธิ์** (holy_aura) — a sustained golden heal-aura ring. {STYLE BASE}
- **สมิตศักดิ์สิทธิ์** (holy_smite) — a holy white smite lightning bolt from above. {STYLE BASE}

### Tier 4
- **โนวาหายนะ** (doom_nova) — a black-red doom explosion, fire+poison skull cloud. {STYLE BASE}
- **ปราการนิรันดร์** (eternal_fortress) — a giant blue fortress-wall block + counter spikes. {STYLE BASE}
- **สาปจักรวาล** (void_curse) — a cosmic purple curse vortex, triple debuff glyphs. {STYLE BASE}
- **ฝนแสงสวรรค์** (heaven_rain) — 6 golden light-beams raining with heal sparkles. {STYLE BASE}
- **จ้องมรณะ** (shadow_execute) — a black execution-guillotine of shadow energy. {STYLE BASE}
- **ปล้นจักรวรรดิ** (empire_plunder) — a golden 5-strike imperial coin-storm. {STYLE BASE}
- **ดาวตก** (meteor_arrow) — a cosmic charged meteor-arrow crashing down. {STYLE BASE}
- **พายุสายฟ้า** (thunder_storm) — 8 yellow lightning bolts with stun arcs. {STYLE BASE}
- **พระประภา** (divine_radiance) — a full-heal divine sun-armor radiance burst. {STYLE BASE}
- **พิพากษา** (final_judgment) — a percent-HP execution beam, all-seeing eye of light. {STYLE BASE}

---

## 🔧 หมายเหตุการใช้งานในเกม

**ระบบปัจจุบัน (ส่วน A):** เอฟเฟกต์โหลดจาก `getAttackFxUrl()` ใน [js/idle.js](js/idle.js)
ตามรูปแบบ `{class}_T{tier}[-{branch}].png` — แต่ตอนนี้ยัง hardcode `'rogue'` ทุกคลาส
(มี `// TODO: per-class art`) ถ้าวางไฟล์ครบทุกคลาสแล้ว ให้แก้บรรทัดนั้นเป็น
`const fxClass = G.classId;` เพื่อใช้เอฟเฟกต์ของคลาสจริง

**ระบบรายสกิล (ส่วน B):** ยังไม่รองรับ — ต้องเพิ่ม map `skillId → '{skillId}.png'`
และเปลี่ยนจุดแสดง fx ให้เลือกตาม skill ที่ cast แทน class+tier (บอกผมได้ถ้าต้องการให้ทำ)
