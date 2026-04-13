# Stats System Design
**Date:** 2026-04-13  
**Phase:** 5 (partial implementation), full design for future phases

---

## Overview

Heroes have 6 primary stats that determine all 10 secondary stats through weighted formulas. Primary stats are set by race and class at creation, then grow per level. Training can also directly increase primary stats. Secondary stats are always derived from primary stats, but can be further enhanced by equipment bonuses on top of the derived value.

---

## Primary Stats

| Stat | Name | Role |
|---|---|---|
| STR | Strength | Physical offense, minor survivability |
| VIT | Vitality | Health, defense, regen |
| AGI | Agility | Speed, evasion |
| DEX | Dexterity | Precision, accuracy, crit |
| INT | Intelligence | Magic offense, skill speed |
| WIL | Willpower | Magic defense, elemental resistance |

**Base value:** 10 in all stats for a generic hero. Races and classes modify starting values (typically ±1 to ±3 per stat - with later unlocks allowing up to -4, and even higher + values).

---

## Secondary Stats & Formulas

All formulas use the pattern: `primary1 * weight1 + primary2 * weight2`

| Secondary Stat | Formula | Value at base 10/10 |
|---|---|---|
| Max Health | `VIT*4 + STR*1` | 50 |
| Physical Power | `STR*2 + DEX*0.5` | 25 |
| Physical Defense | `VIT*1 + STR*0.5` | 15 |
| Magic Power | `INT*2 + WIL*0.5` | 25 |
| Magic Defense | `WIL*1 + INT*0.5` | 15 |
| Health Regen | `VIT*0.3 + WIL*0.1` | 4 |
| Evasion | `AGI*2 + DEX*0.5` | 25 |
| Accuracy | `DEX*2 + AGI*0.5` | 25 |
| Attack Speed | TBD — see Speed section | — |
| Skill Speed | TBD — see Speed section | — |

> **Note:** All multipliers are starting points. Tune after playtesting.

---

## Combat Formulas

### Hit Chance

```
hit_chance = 0.5 + (accuracy / (accuracy + evasion)) * 0.49
```

- At equal Accuracy/Evasion: ~74.5% hit chance
- Never reaches 0% or 100%
- The `0.49` scalar and `0.5` base are tunable constants

### Damage Mitigation

Two separate mitigation paths — physical and magic:

```
physical_damage_taken = raw_damage * (attacker_physical_power / (attacker_physical_power + defender_physical_defense))
magic_damage_taken    = raw_damage * (attacker_magic_power    / (attacker_magic_power    + defender_magic_defense))
```

- Defense is only valuable relative to attacker's power
- Diminishing returns built in — defense never reduces damage to zero
- A warrior with high Physical Defense is still vulnerable to magic

### Health Regen

Applied each combat tick:

```
hp = min(hp + health_regen, max_health)
```

Regen at base stats (~4 per tick) is noticeable but not dominant against ~25 Physical Power damage. Scales meaningfully with VIT investment. Not a healer replacement — a healer class should always be valuable.

---

## Accuracy Overflow System (NOT Phase 5 — document only)

As `accuracy / evasion` ratio grows beyond 1.0, gains shift smoothly across three tiers using S-curves (sigmoid functions). Tiers overlap — all three grow simultaneously, just at different rates.

**Tier 1 — Hit Chance**
- Grows fast when ratio < 1.0
- Starts slowing noticeably around ratio 1.5
- Fades strongly after ratio 2.0
- Soft ceiling ~99%

**Tier 2 — Crit Chance**
- Barely moves when ratio < 1.0
- Grows slowly at ratio 1.0, accelerating toward ratio 1.5
- Equal growth rate to hit chance around ratio 1.5
- Slows after ratio 2.0
- Soft ceiling ~80-85%

**Tier 3 — Crit Multiplier**
- Starts contributing around ratio 2.0
- No ceiling — extremely high Accuracy builds generate legendary multipliers
- Base crit multiplier: 1.5x (150% damage)

**Design principle:** A dedicated Accuracy build is always rewarded, no matter how much has been invested. A hero with 10x the enemy's Evasion hits near-guaranteed crits at extreme multipliers.

**Implementation note:** Requires crit damage calculation, crit visual feedback, and skill interactions to exist first. Implement alongside Phase 8 (Skills) or a dedicated balance phase.

---

## Speed System (NOT Phase 5 — document only)

### Formula family

Speed uses the same ratio shape as damage mitigation — steepest gains around the neutral point, diminishing at extremes:

```
speed_ratio = attack_speed / (attack_speed + BASE_SPEED)
actual_cooldown = base_cooldown * (1 - speed_ratio)
```

Where `BASE_SPEED` is a tunable constant (tentatively 10, matching base stats). A minimum cooldown floor prevents near-zero values.

### Weapon cooldowns (Phase 7)

Heavier weapons have naturally longer base cooldowns derived from their base damage:

```
base_cooldown = weapon_base_damage * COOLDOWN_CONSTANT
```

A dagger (low damage) swings fast. A greatsword (high damage) swings slow. Attack Speed then modifies that base cooldown. This makes weapon choice a meaningful speed/power tradeoff.

> **Tuning:** Both `BASE_SPEED` and `COOLDOWN_CONSTANT` need playtesting. Don't finalize until weapons exist in Phase 7.

---

## Architecture

### `heroStats` Pinia store (new)

A read-only store containing getters that compute secondary stats from a hero's primary stats. No actions needed — purely derived values.

```
src/stores/heroStats.ts
```

- Components use this store to display stat tooltips, character sheets, etc.
- The combat store calls these getters during `combatTick()` instead of using raw `attack`/`hp` values

**How the getters work:** Pinia getters can accept arguments by returning a function. This is the same pattern as `heroById` in the combat store. The heroStats store follows the same idea:

```typescript
getters: {
  maxHealth: () => (hero: Hero) => hero.vit * 4 + hero.str * 1,
  physicalPower: () => (hero: Hero) => hero.str * 2 + hero.dex * 0.5,
  evasion: () => (hero: Hero) => hero.agi * 2 + hero.dex * 0.5,
  accuracy: () => (hero: Hero) => hero.dex * 2 + hero.agi * 0.5,
}
```

Usage: `statsStore.maxHealth(hero)` — pass the hero object in, get the derived number out.

### Phase 5 scope

These secondary stats get wired up in Phase 5:

1. **Max Health** — replaces hardcoded `maxHp`
2. **Physical Power** — replaces hardcoded `attack`
3. **Evasion** — used in hit chance formula
4. **Accuracy** — also required for the hit chance formula

**What changes in `combatTick()` in Phase 5:**
- Damage uses `statsStore.physicalPower(hero)` instead of `hero.attack`
- Before applying damage, roll hit chance using the formula — a missed attack deals 0 damage
- Hero `hp` is initialized to `statsStore.maxHealth(hero)` at combat start, not a hardcoded value
- Physical Defense, Magic paths, Health Regen, Speed — documented here but NOT wired up yet
- Flat damage (no mitigation formula) persists for Phase 5 — defense is a future phase

Everything else is documented here but not implemented until needed.

### Hero interface changes

The `Hero` interface in `combat.ts` needs 6 primary stats added. Remove `maxHp` and `attack` — they become derived. Keep `hp` as mutable state since it changes during combat.

```typescript
interface Hero {
  id: string
  name: string
  str: number
  vit: number
  agi: number
  dex: number
  int: number
  wil: number
  hp: number  // current HP — mutable, changes each tick
}
```

**Seed data update:** The hardcoded heroes in `combat.ts` must also be updated — remove `maxHp` and `attack`, replace with primary stats. Example:

```typescript
// Before
{ id: 'h1', name: 'Orc Paladin', hp: 100, maxHp: 100, attack: 10 }

// After — no maxHp or attack, primary stats only
{ id: 'h1', name: 'Orc Paladin', str: 12, vit: 11, agi: 8, dex: 7, int: 6, wil: 10 }
```

`hp` is not set in the seed data. It is set dynamically when combat starts — by calculating `statsStore.maxHealth(hero)` and assigning it to `hero.hp` at that moment. This way it always matches the formula, not a hardcoded number.

---

## Race & Class System (future phases)

- Each hero has a race and a class
- Race and class each contribute stat modifiers to the 6 primary stats
- Per-level stat growth is split based on class (with minor race influence)
- Training is the only other way to increase primary stats directly
- Full design deferred — not needed until Phase 6+ content pass

---

## Balance Notes

- All formulas are starting points. Numbers need playtesting.
- Physical and Magic paths are intentionally symmetric — classes have a clear focus, but cross-investment is valid (e.g. a warrior benefits from Magic Defense and Skill Speed even if Magic Power is wasted)
- AGI/DEX are versatile stats (touching 4 secondary stats each) — good for hybrid builds
- INT/WIL are narrow but deep — pure magic builds feel focused
- Health Regen is intentionally not a healer replacement — sustain exists but healers matter
- **Evasion open question:** Evasion currently applies to both physical and magic attacks via the unified hit chance formula. This may be too strong — a high-AGI build could dodge everything. Consider splitting into Physical Evasion and Magic Evasion later, or leaving it as-is and tuning numbers. Revisit after playtesting.
