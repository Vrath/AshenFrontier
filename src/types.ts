export type SlotType =  'weapon' | 'head' | 'armor' | 'boots' | 'gloves' | 'amulet'
export type TargetingType = 'melee' | 'ranged'
export type SecondaryStatKey = 'physicalPower' | 'maxHealth' | 'healthRegen' | 'evasion' | 'accuracy' | 'attackSpeed' | 'magicPower' | 'skillSpeed' | 'physicalDefense' | 'magicDefense'

export interface EquipmentSlots {
  weapon?: Item,
  head?: Item,
  armor?: Item,
  boots?: Item,
  gloves?: Item,
  amulet?: Item
}
export interface DamageWeights {
    piercing?: number,
    slashing?: number,
    bludgeoning?: number,
    fire?: number,
    frost?: number,
    lightning?: number,
    shadow?: number,
    light?: number
}
export interface ItemTemplate {
    id: string
    slot: SlotType
    requirements: { str?: number; vit?: number; agi?: number; dex?: number; int?: number; wil?: number }
    bonusRanges: Partial<Record<SecondaryStatKey, number>>
    attackValue?: number,
    damageWeights?: DamageWeights,
    targetingType?: TargetingType
}
export interface Item {
    templateId: string
    instanceId: number
    slot: SlotType
    requirements: { str?: number; vit?: number; agi?: number; dex?: number; int?: number; wil?: number }
    bonuses: Partial<Record<SecondaryStatKey, number>>
    attackValue?: number
    damageWeights?: DamageWeights,
    targetingType?: TargetingType
}
export interface Entity {
    id: string
    name: string
    displayName?: string
    level?: number
    str: number
    vit: number
    agi: number
    dex: number
    int: number
    wil: number
    hp: number
    race?: string | null
    class?: string | null
    equipment: EquipmentSlots
}