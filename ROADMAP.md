# Ashen Frontier — Development Roadmap

The rule: **finish a phase completely before touching the next one.**
Each phase ends with something you can interact with in the browser.
Update CLAUDE.md "Current phase" every time you move forward.

---

## Phase 1 — The Combat Tick

**Goal:** One hero attacks one enemy. HP goes down. You can see it happen.

**What you'll learn:**

- Pinia store basics (state, getters, actions)
- TypeScript interfaces for game objects
- setInterval for a game loop
- Binding store data to a Vue template

**Done when:**

- [X] Hero and Enemy objects exist in the store with correct types
- [X] `combatTick()` reduces enemy HP by hero attack value
- [X] `startCombat()` runs the tick on an interval
- [X] App.vue displays enemy HP live
- [X] Combat stops when enemy reaches 0

**Do not add yet:** grid, multiple heroes, skills, stats formula, anything else.

---

## Phase 2 — The Battlefield Array

**Goal:** A 3x2 grid exists in data. Heroes can be placed into slots.

**What you'll learn:**

- Representing a grid as a flat array (6 slots = indices 0–5)
- v-for with index to render a grid
- Computed properties to read rows from the array
- Moving data between arrays (roster → slot)

**Done when:**

- [X] `battlefield` is an array of 6 slots in the store (null = empty)
- [X] A roster of 2–3 placeholder heroes exists
- [X] Clicking a hero then clicking a slot places them
- [X] The grid renders visually as 2 rows of 3
- [X] Combat tick loops over all heroes in the battlefield, not just one

**Do not add yet:** drag and drop, enemy grid, back row logic.

---

## Phase 3 — Drag and Drop

**Goal:** Heroes can be dragged from roster to grid slots and between slots.

**What you'll learn:**

- Native HTML5 drag and drop API (4 events only)
- Storing "what is being dragged" in temporary state
- The difference between moving data vs copying it

**Done when:**

- [X] Slots are components that display hero data (name, health etc) or "Empty Slot"
- [X] Dragging a hero from roster to slot places them
- [X] Dragging a hero between slots swaps them
- [X] Dragging a hero off the grid returns them to roster
- [ ] Visual feedback while dragging (highlight valid slots) - POSTPONED TO UI POLISH

---

## Phase 4 — Enemy Grid & Real Combat

**Goal:** Enemies also have a 3x2 grid. Combat resolves between the two grids.

**What you'll learn:**

- Front row / back row targeting logic
- Iterating over two arrays simultaneously
- Death removal from array
- Win / lose condition

**Done when:**

- [X] Enemy grid exists with hardcoded enemies placed in slots
- [X] Heroes target front row enemies first
- [X] Dead units are removed from their slot
- [X] Combat ends when one side has no units remaining
- [X] A result message shows (win / lose)

---

## Phase 5 — Real Stats

**Goal:** Hero stats (STR, AGI etc.) actually calculate secondary stats and damage.

**What you'll learn:**

- Derived/computed values from base data
- Pinia getters for per-hero calculations
- Keeping formulas in one place (not scattered in components)

**Done when:**

- [X] Hero has all 6 primary stats
- [X] Physical Power, Max Health, Evasion calculated from primary stats
- [X] Hit chance uses the ratio formula (not just 100% hit)
- [X] Damage uses Physical Power, not raw attack number
- [X] All formulas live in the store or a helpers file, not in templates

---

## Phase 6 — Economy & Tavern

**Goal:** Gold ticks up. Heroes appear in a tavern. Recruiting costs gold.

**What you'll learn:**

- A second Pinia store (village/economy)
- Multiple stores talking to each other
- Generating random objects from a template

**Done when:**

- [X] Tavern generates passive income thats capped (eg. 100, 1 hour)
- [X] Tavern shows 3 randomly generated heroes
- [X] Recruiting a hero costs gold and adds them to your roster
- [X] Each hero has a cost per battle, which increases with level

---

## Phase 7 — Items & Equipment

**Goal:** Items exist. Heroes can equip them. Stats change accordingly.

**What you'll learn:**

- Item objects and equipment slots
- Drag and drop reused for a second purpose
- Computed stats that include equipment bonuses

**Done when:**

- [ ] Item objects exist with secondary stat bonuses
- [ ] Each hero has equipment slots (weapon, armor etc.)
- [ ] Dragging an item to a hero equips it
- [ ] Hero's effective stats update when equipped
- [ ] Items have primary stat requirements — can't equip if too low

---

## Phase 8 — Leveling & Active Skills

**Goal:** Heroes have active skills with their own cooldown bars.

**What you'll learn:**

- Multiple independent timers on one entity
- Skill objects and how they modify combat resolution
- Rendering multiple cooldown bars per hero

**Done when:**

- [ ] Heroes level up with experience and gain skill points
- [ ] Skill object type defined (name, cooldown, effect)
- [ ] Each hero has 2 active skill slots
- [ ] Skills fire automatically when cooldown expires
- [ ] At least 3 distinct skill effects work (damage, heal, debuff)
- [ ] Cooldown bars visible per skill in the UI

---

## Phase 9 — Buildings & Research

**Goal:** Village has buildings. Buildings have levels. Research unlocks things.

**What you'll learn:**

- Nested state (building has level, level has effects)
- Unlock flags — boolean values that gate content
- A queue system (one thing at a time)

**Done when:**

- [ ] 3 buildings exist with upgrade levels
- [ ] Upgrading costs materials and takes time
- [ ] Research Hall has a simple linear tree with 5 nodes
- [ ] Completing research flips an unlock flag somewhere meaningful

---

## Phase 10 — Locations & Loot

**Goal:** Multiple expedition locations. Enemies generated from location pools. Materials drop.

**What you'll learn:**

- Data-driven content (locations as config objects, not hardcoded)
- Weighted random selection
- The budget encounter generation system

**Done when:**

- [ ] 3 locations exist across 2 regions
- [ ] Each location has a monster pool with costs
- [ ] Encounter generator produces varied enemy teams per battle
- [ ] Winning drops materials into inventory
- [ ] Mastery counter increments per location
- [ ] Quests/Contracts: Tavern offers simple objectives that reward materials, gold, or unlocks when completed

---

## Phase 11 — Content Pass

**Goal:** Fill the game with real races, classes, monsters, items, skills.

This phase has no new programming concepts.
It is copy, paste, rename, adjust numbers, playtest, repeat.

**Done when:**

- [ ] 5 races with real passives
- [ ] 5 classes with real skill trees (simplified)
- [ ] 10+ monsters across first 3 regions
- [ ] 20+ items across rarity tiers
- [ ] Game is playable start to finish in a basic form


---

## Phase 12 — Polish & Balance

**Goal:** The game feels good to play, not just technically correct.

- [ ] Autosave to localStorage on every meaningful state change
- [ ] Load saved state automatically on app open
- [ ] "New game" option that clears the save
- [ ] Tune numbers so early game isn't instant-win or impossible
- [ ] Add combat log messages that are readable
- [ ] Add basic visual feedback (damage flash, death animation)
- [ ] Performance check — no memory leaks from intervals
- [ ] Pixel art UI - buttons, backgrounds, etc.
- [ ] Tauri packaging and desktop build
- [ ] Procedural name generation + reroll (eg. Mira the Thornmage)

---

## Backlog (do not touch until Phase 11+)

These are real ideas, not forgotten — just not yet:

- Multiple expedition teams
- Enchanting and rune sockets
- Region 4–10 content
- Legendary items
- 10 races, 10 classes
- Infinite dungeons, where you send a team in and they fight through endless procedurally generated floors until they die, with a high score leaderboard

---

## Principles to remember

**One phase at a time.** Seriously. The GDD exists. Trust it. Don't design during build phases.

**Data before UI.** Every feature starts as an object and a function. The visual comes after.

**If you're bored, you're probably in the right phase.** The interesting parts come later. The boring foundation is what makes them possible.

**Commit after every phase.** Even if the code is messy. Especially if the code is messy. You need a restore point.
