# MORDVEIL — พรอมพ์สร้างรูปไอเทม (Item Art Prompts)

พรอมพ์เจนรูป **ของสวมใส่ / หินตีบวก / วัตถุดิบคราฟ** (ChatGPT / DALL·E)

> **สเปกไฟล์:** ไอคอนไอเทมเป็น **PNG พื้นหลังโปร่งใส (transparent)** ชิ้นเดียว วางบนช่องกระเป๋า
> สไตล์เดียวกับตัวละคร (chibi pixel-art) — ไอเทมชิ้นเดียว ไม่มีฉาก

---

## 🎨 STYLE BASE (วางต่อท้ายทุกพรอมพ์)

```
{STYLE BASE} =
pixel-art game item icon, single object centered, crisp clean pixel edges with
bold dark outline, vibrant saturated colors, soft cel shading, slight glow rim,
TRANSPARENT background (alpha, no scene, no ground, no shadow box), no text,
no watermark, square 1:1, high resolution, game inventory icon, item fills ~80%.
```

**โทนสีตาม Rarity** (เติมเข้าไปในพรอมพ์เพื่อสื่อความหายาก):
- ⚪ **common** — เรียบ ๆ สีเทา-น้ำตาล ไม่มีแสง
- 🟢 **uncommon** — เขียวอ่อน เรืองแสงบาง ๆ
- 🔵 **rare** — ฟ้าน้ำเงิน เรืองแสงชัด
- 🟣 **epic** — ม่วง เรืองแสงเข้ม + ประกาย
- 🟠 **legend** — ส้ม-ทอง เรืองแสงแรง + อนุภาคลอย
- 🔴 **ancient** — แดงเข้ม พลังโบราณ รอยร้าวเรืองแสง
- 🌈 **mythic** — รุ้งชมพู-ม่วง พลังล้นทะลัก ออร่าจักรวาล

---

# 🛡️ ส่วน A — ของสวมใส่ (Equipment)

มี 6 ช่อง: อาวุธหลัก / อาวุธรอง / หมวก / เกราะ / ถุงมือ / รองเท้า
ตั้งชื่อแนะนำ: `gear_{slot}_{rarity}.png` (เช่น `gear_helmet_epic.png`)

### 🗡️ อาวุธหลัก (weapon)
```
A {RARITY} fantasy weapon, a detailed sword/axe/staff/bow blade glinting with
energy, ornate hilt, magical aura matching its rarity color. {STYLE BASE}
```
แยกตามคลาส (เลือกชนิดอาวุธ):
- warrior → **greatsword / battle axe** (ดาบใหญ่/ขวานศึก)
- mage → **arcane staff / wand** (คทาเวท)
- rogue → **twin daggers** (กริชคู่)
- archer → **longbow** (ธนูยาว)
- paladin → **holy sword / spear** (ดาบศักดิ์สิทธิ์/หอก)

### 🛡️ อาวุธรอง (offhand)
```
A {RARITY} offhand item — a shield / spell tome / dagger / quiver / holy relic,
ornate detailed design, glowing rarity-colored runes. {STYLE BASE}
```

### 🪖 หมวก (helmet)
```
A {RARITY} fantasy helmet/crown, detailed metal or cloth headgear with gemstone
accents, glowing rarity-colored trim. {STYLE BASE}
```

### ⚔️ เกราะ (armor / chestplate)
```
A {RARITY} fantasy chest armor / robe, detailed plating or enchanted cloth,
ornate engravings, glowing rarity-colored core gem. {STYLE BASE}
```

### 🧤 ถุงมือ (gloves)
```
A {RARITY} pair of fantasy gauntlets/gloves, detailed knuckle plating or
enchanted wraps, glowing rarity-colored fingertips. {STYLE BASE}
```

### 👢 รองเท้า (boots)
```
A {RARITY} pair of fantasy boots/greaves, detailed armored or leather footwear,
glowing rarity-colored sole trail. {STYLE BASE}
```

> ทำซ้ำแต่ละชิ้น × 7 rarity (common→mythic) เปลี่ยน `{RARITY}` + โทนสีตามตารางด้านบน

---

# 🔨 ส่วน B — หินตีบวก & แก่นเสริมพลัง (Enhancement)

ดรอปจากดันเจี้ยนเท่านั้น — ตั้งชื่อตาม id: `mat_{id}.png`

- **หินตีบวก** (enhance_stone, 🔨 rare)
  ```
  A glowing blue enhancement stone, a polished rune-etched gem-rock pulsing with
  blue magical energy, sparks of upgrade power around it. {STYLE BASE}
  ```
- **แก่นเสริมพลัง** (enhance_core, 💠 epic)
  ```
  A purple power core crystal, a faceted diamond-shaped gem with swirling purple
  energy inside, radiant epic glow and floating shards. {STYLE BASE}
  ```
- **เศษมิติว่างเปล่า** (void_shard, 🕳️ legend)
  ```
  A void shard, a jagged black crystal fragment leaking dark-purple void energy
  and tiny stars, distorted space ripple around it, legendary aura. {STYLE BASE}
  ```
- **แก่นห้วงลึก** (abyss_essence, 🌌 ancient)
  ```
  An abyss essence orb, a swirling deep cosmic sphere of dark-red and black
  ancient energy, cracked glowing core, overwhelming ancient power. {STYLE BASE}
  ```
- **กุญแจหลุมลึก** (dungeon_key, 🗝️ epic)
  ```
  An ornate dungeon key, an old engraved skeleton key glowing with purple
  magical runes, mysterious epic aura. {STYLE BASE}
  ```

---

# ⛏️ ส่วน C — วัตถุดิบคราฟ (Crafting Materials)

ดรอปตามโซน — ตั้งชื่อตาม id: `mat_{id}.png`

### Zone 1 — ป่ากอบลิน
- **หนังกอบลิน** (goblin_hide, ⚪) — `A piece of rough green goblin hide leather, common material. {STYLE BASE}`
- **เขี้ยวกอบลิน** (goblin_fang, 🟢) — `A sharp curved goblin fang tooth, faint green glow, uncommon material. {STYLE BASE}`

### Zone 2 — หุบเขาซอมบี้
- **เนื้อเน่า** (rotten_flesh, ⚪) — `A chunk of rotten greenish zombie flesh, common material. {STYLE BASE}`
- **เศษกระดูก** (bone_shard, 🟢) — `a cluster of pale bone shards, faint glow, uncommon material. {STYLE BASE}`

### Zone 3 — ถ้ำมังกร
- **เกล็ดมังกร** (dragon_scale, 🔵) — `A shiny red-orange dragon scale, hard glinting plate, blue rare glow. {STYLE BASE}`
- **แก่นเพลิง** (fire_essence, 🔵) — `A glowing fire essence orb, swirling orange flame trapped in a crystal, rare glow. {STYLE BASE}`

### Zone 4 — ซากอสูร
- **เขาอสูร** (demon_horn, 🟣) — `A twisted black demon horn with red cracks, purple epic aura. {STYLE BASE}`
- **เหล็กต้องสาป** (cursed_metal, 🟣) — `A chunk of dark cursed metal ingot with glowing purple runes, epic glow. {STYLE BASE}`

### Zone 5 — ปราสาทมืด
- **ผ้าเงามืด** (shadow_cloth, 🟣) — `A piece of flowing shadow-black enchanted cloth with purple wispy edges, epic. {STYLE BASE}`
- **คริสตัลมืด** (dark_crystal, 🟠) — `A dark crystal cluster glowing with deep violet-orange legendary energy. {STYLE BASE}`

### Zone 6 — อาณาจักรโกลาหล
- **แก่นโกลาหล** (chaos_core, 🟠) — `A chaos core, a swirling spiral orb of orange-gold chaotic energy, legendary aura. {STYLE BASE}`
- **ผงจักรวาล** (cosmic_dust, 🟠) — `A vial/cluster of sparkling cosmic dust, golden star particles, legendary glow. {STYLE BASE}`

---

## 📌 หมายเหตุการใช้งาน
- ปัจจุบันเกมแสดงไอเทมด้วย **emoji** (เช่น 🔨 หินตีบวก, 🐲 เกล็ดมังกร) — ถ้าจะใช้รูป PNG ต้องเพิ่ม
  mapping `{id} → img` แล้วแก้จุด render ไอคอน (บอกผมได้ถ้าต้องการให้ทำระบบรองรับรูป)
- material id อยู่ใน `MATERIALS` ที่ [js/data.js](js/data.js#L343) — ใช้ id ตั้งชื่อไฟล์ให้ map ตรงในอนาคต
- rarity color ตรงกับ `RARITY` ในเกม (common→mythic) — โทนสีในพรอมพ์ควรล้อตามนี้เพื่อให้ผู้เล่นอ่านความหายากได้ทันที
