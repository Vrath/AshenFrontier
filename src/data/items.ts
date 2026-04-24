export const ITEM_TEMPLATES = [
    {
        id: "longsword",
        slot: "weapon",
        requirements: { str: 5, vit: 0, agi: 0, dex: 0, int: 0, wil: 0 },
        bonusRanges: { physicalPower: 2, maxHealth: 0, healthRegen: 0, evasion: 0, accuracy: 0, attackSpeed: 0, magicPower: 0, skillSpeed: 0, physicalDefense: 0, magicDefense: 0 },
        attackValue: 15,
        damageWeights: { slashing: 1, piercing: 0, bludgeoning: 0, fire: 0, lightning: 0, frost: 0 },
        targetingType: "melee"
    },
    {
        id: "mageStaff",
        slot: "weapon",
        requirements: { str: 0, vit: 0, agi: 0, dex: 0, int: 5, wil: 0 },
        bonusRanges: { physicalPower: 0, maxHealth: 0, healthRegen: 0, evasion: 0, accuracy: 0, attackSpeed: 0, magicPower: 0, skillSpeed: 0, physicalDefense: 0, magicDefense: 0 },
        attackValue: 12,
        damageWeights: { slashing: 0, piercing: 0, bludgeoning: 0, fire: 0.6, lightning: 0, frost: 0.4 },
        targetingType: "ranged"
    },
    {
        id: "ironChestplate",
        slot: "armor",
        requirements: { str: 0, vit: 5, agi: 0, dex: 0, int: 0, wil: 0 },
        bonusRanges: { physicalPower: 0, maxHealth: 0, healthRegen: 0, evasion: 0, accuracy: 0, attackSpeed: 0, magicPower: 0, skillSpeed: 0, physicalDefense: 5, magicDefense: 0 }
    },
]