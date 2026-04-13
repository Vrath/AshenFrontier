# Phase 5: Real Stats Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded `attack` and `maxHp` values with a real primary stat system, add a `heroStats` Pinia store for derived stats, and wire hit chance into combat.

**Architecture:** A new `heroStats` store holds parameterized getters that compute secondary stats from a hero's primary stats. The `Hero` interface in `combat.ts` is updated to use 6 primary stats instead of `attack`/`maxHp`. The combat tick uses these derived values instead of raw numbers.

**Tech Stack:** Vue 3 (Composition API), TypeScript, Pinia

**Spec:** `docs/superpowers/specs/2026-04-13-stats-system-design.md`

---

## File Map

| File | Change | Responsibility |
|---|---|---|
| `src/stores/combat.ts` | Modify | Update `Hero` interface, seed data, `startCombat()`, `combatTick()` |
| `src/stores/heroStats.ts` | Create | Parameterized getters for all Phase 5 secondary stats |
| `src/components/HeroSlot.vue` | Modify | Display `hp` against derived `maxHealth` instead of `hero.maxHp` |

---

## Task 1: Update the Hero interface and seed data

**Files:**
- Modify: `src/stores/combat.ts`

The `Hero` interface currently has `maxHp` and `attack`. These become derived values. We replace them with 6 primary stats. The `hp` field stays — it tracks current health during combat.

> **Note:** After this task, the app will have TypeScript errors because `hero.attack` and `hero.maxHp` are still referenced in other places. That's fine — this is a solo project and we're doing it in deliberate steps. The errors will be gone by the end of Task 3. Don't commit until Task 3 is complete.

- [ ] **Step 1: Update the `Hero` interface**

In `src/stores/combat.ts`, find the `Hero` interface (lines 3–9) and replace it:

```typescript
export interface Hero {
    id: string
    name: string
    str: number
    vit: number
    agi: number
    dex: number
    int: number
    wil: number
    hp: number  // current HP — changes during combat
}
```

- [ ] **Step 2: Update the seed hero data**

In `combat.ts`, find the `heroes` array in `state()` (lines 21–25) and replace it with primary stats. Give each hero a distinct stat profile that fits their name:

```typescript
heroes: [
    { id: 'h1', name: 'Orc Paladin',   hp: 0, str: 12, vit: 13, agi: 7,  dex: 7,  int: 6,  wil: 10 },
    { id: 'h2', name: 'Elf Berserker', hp: 0, str: 14, vit: 8,  agi: 12, dex: 10, int: 6,  wil: 5  },
    { id: 'h3', name: 'Dwarf Shaman',  hp: 0, str: 8,  vit: 10, agi: 6,  dex: 8,  int: 12, wil: 11 },
],
```

`hp` starts at 0 — it gets set properly in Task 3 when combat starts. Until then, heroes will display `0 / 50` in the UI — that's expected and will be fixed by the end of Task 3.

---

## Task 2: Create the heroStats store

**Files:**
- Create: `src/stores/heroStats.ts`

This store has no state — only getters. Each getter accepts a `Hero` object and returns a calculated number. This is the same pattern as `heroById` in the combat store: the getter returns a function, and you call that function with an argument.

The getters here use `() =>` instead of `(state) =>` because this store has no state — there's nothing to read from the store itself, only from the hero you pass in. Compare with `heroById` in `combat.ts` which uses `(state) =>` because it reads from `state.heroes`.

- [ ] **Step 1: Create `src/stores/heroStats.ts`**

```typescript
import { defineStore } from 'pinia'
import type { Hero } from './combat'

export const useHeroStatsStore = defineStore('heroStats', {
    getters: {
        maxHealth: () => (hero: Hero): number =>
            hero.vit * 4 + hero.str * 1,

        physicalPower: () => (hero: Hero): number =>
            hero.str * 2 + hero.dex * 0.5,

        evasion: () => (hero: Hero): number =>
            hero.agi * 2 + hero.dex * 0.5,

        accuracy: () => (hero: Hero): number =>
            hero.dex * 2 + hero.agi * 0.5,

        hitChance: () => (attacker: Hero, defender: Hero): number => {
            // Note: we inline the accuracy/evasion formulas here rather than
            // calling this.accuracy(attacker) — calling other getters from
            // inside a returned function requires extra care in Pinia's options
            // API. Keeping it simple for now. If you change the accuracy or
            // evasion formulas later, remember to update this too.
            const acc = attacker.dex * 2 + attacker.agi * 0.5
            const eva = defender.agi * 2 + defender.dex * 0.5
            return 0.5 + (acc / (acc + eva)) * 0.49
        },
    }
})
```

- [ ] **Step 2: Verify the math manually**

At base stats (all 10s), check each formula produces the right number:
- `maxHealth`: `10*4 + 10*1 = 50` ✓
- `physicalPower`: `10*2 + 10*0.5 = 25` ✓
- `evasion`: `10*2 + 10*0.5 = 25` ✓
- `accuracy`: `10*2 + 10*0.5 = 25` ✓
- `hitChance` at equal stats: `0.5 + (25 / 50) * 0.49 = 0.745` = 74.5% ✓

---

## Task 3: Wire heroStats into the combat store

**Files:**
- Modify: `src/stores/combat.ts`

Now we update `startCombat()` to initialize `hp` from the formula, and `combatTick()` to use `physicalPower` for damage and `hitChance` for the hit roll.

> **Important Pinia rule:** When using one store inside another store, you must call `useHeroStatsStore()` *inside* an action — not at the top of the file. This is because Pinia stores can only be accessed after the app has been set up. If you put it at the top of the file, you'll get a cryptic "used outside of a plugin" error.

- [ ] **Step 1: Import the heroStats store**

At the top of `combat.ts`, add:

```typescript
import { useHeroStatsStore } from './heroStats'
```

- [ ] **Step 2: Update `startCombat()` to initialize hero HP**

Find the `startCombat()` action and replace it entirely:

```typescript
startCombat() {
    if (this.combatRunning) return
    const stats = useHeroStatsStore()

    // Set each hero's hp to their calculated max health
    for (const hero of this.heroes) {
        hero.hp = stats.maxHealth(hero)
    }

    this.generateEnemies()
    this.combatRunning = true
    this.combatIntervalId = setInterval(() => {
        this.combatTick()
    }, 1000)
},
```

- [ ] **Step 3: Update the hero attack section of `combatTick()`**

Inside `combatTick()`, find the hero attack loop — it's the first `for` loop, around lines 104–117. Replace only the `if (enemy && hero)` block inside it. Do not touch anything below this loop (the enemy attack loop, dead-unit removal, and win/lose check all stay unchanged):

```typescript
if (enemy && hero) {
    const chance = stats.hitChance(hero, enemy)
    const roll = Math.random()
    // Math.random() gives a number 0–1. If hitChance is 0.75,
    // then 75% of rolls will be below it — that's how the % works.
    if (roll < chance) {
        enemy.hp -= stats.physicalPower(hero)
    }
}
```

- [ ] **Step 4: Update the enemy attack section of `combatTick()`**

Find the enemy attack loop — the second `for` loop, around lines 119–132. Replace only the `if (enemy && hero)` block inside it:

```typescript
if (enemy && hero) {
    // TODO: enemies use flat attack until Enemy gets primary stats (future phase)
    hero.hp -= enemy.attack
}
```

Enemies always hit for now — they don't have primary stats yet, so we can't use the hit chance formula for them.

- [ ] **Step 5: Add `const stats` at the top of `combatTick()`**

Make sure `combatTick()` starts with this line (you may have already added it in Step 3 — if so, skip this):

```typescript
combatTick() {
    const stats = useHeroStatsStore()
    // ... rest of the function
```

- [ ] **Step 6: Run TypeScript check**

Run: `npx vue-tsc --noEmit`

The only remaining errors should be in `HeroSlot.vue` referencing `hero.maxHp`. Everything in `combat.ts` should be clean.

- [ ] **Step 7: Commit**

```bash
git add src/stores/combat.ts src/stores/heroStats.ts
git commit -m "feat: primary stats, derived secondary stats, hit chance in combat"
```

---

## Task 4: Fix HeroSlot component — display HP correctly

**Files:**
- Modify: `src/components/HeroSlot.vue`

The component currently displays `hero.maxHp` which no longer exists on the `Hero` type. We need to show HP as a fraction of max health using the heroStats store.

- [ ] **Step 1: Read the current HeroSlot component**

Read `src/components/HeroSlot.vue` to see how it currently displays health before making any changes.

- [ ] **Step 2: Import and use the heroStats store**

In the `<script setup>` block, add:

```typescript
import { useHeroStatsStore } from '../stores/heroStats'
const stats = useHeroStatsStore()
```

- [ ] **Step 3: Update the HP display**

Find wherever `hero.maxHp` is referenced in the template and replace it with `stats.maxHealth(hero)`. For example:

```html
<!-- Before -->
{{ hero.hp }} / {{ hero.maxHp }}

<!-- After -->
{{ hero.hp }} / {{ stats.maxHealth(hero) }}
```

- [ ] **Step 4: Run TypeScript check**

Run: `npx vue-tsc --noEmit`

Expected: zero errors.

- [ ] **Step 5: Start the dev server and test manually**

Run: `npm run dev`

Check in the browser:
- Heroes show HP as e.g. `50 / 50` before combat starts (not `0 / 0` or `100 / 100`)
- After clicking Start Combat, hero HP goes down as enemies hit
- Hero HP display updates each tick
- Combat still ends when one side is eliminated
- Hero attacks occasionally miss — you'll see ticks where some heroes deal no damage

- [ ] **Step 6: Commit**

```bash
git add src/components/HeroSlot.vue
git commit -m "fix: update HeroSlot to use derived maxHealth from heroStats store"
```

---

## Task 5: Final verification

- [ ] **Step 1: Full TypeScript check**

Run: `npx vue-tsc --noEmit`

Expected: zero errors.

- [ ] **Step 2: Manual playtest checklist**

Start the dev server (`npm run dev`) and run a full combat:
- [ ] Heroes display ~50 HP before combat starts
- [ ] Combat starts without errors in the browser console
- [ ] Enemies take damage each tick (Physical Power ~25 at base stats)
- [ ] Hero HP decreases as enemies attack
- [ ] Some hero attack ticks deal no damage (hit chance ~74.5% at equal stats)
- [ ] Combat ends correctly — win or lose message in the console
- [ ] No JavaScript errors in the browser console

---

## What is NOT in this plan (deferred)

- Enemies getting primary stats (they still use flat `attack` and `maxHp`)
- Physical Defense / damage mitigation formula
- Health Regen in combat
- Magic Power / Magic Defense
- Attack Speed / Skill Speed
- Accuracy overflow / crit system
- Race and class system
