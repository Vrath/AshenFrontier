import { defineStore } from "pinia";
import type { Entity, SecondaryStatKey } from "../types";

function equipmentBonuses(entity: Entity): Partial<Record<SecondaryStatKey, number>> {
    const totals: Partial<Record<SecondaryStatKey, number>> = {}

    Object.values(entity.equipment).forEach(item => {
        if (!item) return

        Object.entries(item.bonuses).forEach(([stat, bonus]) => {
            totals[stat as SecondaryStatKey] = (totals[stat as SecondaryStatKey] ?? 0) + (bonus as number)
        })
    })

    return totals
}

export const useEntityStatsStore = defineStore('stats', {
    state: () => ({
    }),

    getters: {
        physicalPower: () => (entity: Entity) => {
            const baseFormula = (entity.str * 8 + entity.dex * 2) / 5
            const equipmentBonus = equipmentBonuses(entity).physicalPower ?? 0
            return baseFormula + equipmentBonus
        },
        maxHealth: () => (entity: Entity) => {
            const baseFormula = (entity.vit * 9 + entity.str * 1) / 2
            const equipmentBonus = equipmentBonuses(entity).maxHealth ?? 0
            return baseFormula + equipmentBonus
        },
        healthRegen: () => (entity: Entity) => {
            const baseFormula = (entity.vit * 7 + entity.wil * 3) / 100
            const equipmentBonus = equipmentBonuses(entity).healthRegen ?? 0
            return baseFormula + equipmentBonus
        },
        evasion: () => (entity: Entity) => {
            const baseFormula = (entity.agi * 9 + entity.vit * 1) / 5
            const equipmentBonus = equipmentBonuses(entity).evasion ?? 0
            return baseFormula + equipmentBonus
        },
        accuracy: () => (entity: Entity) => {
            const baseFormula = (entity.dex * 8 + entity.wil * 2) / 5
            const equipmentBonus = equipmentBonuses(entity).accuracy ?? 0
            return baseFormula + equipmentBonus
        },
        attackSpeed: () => (entity: Entity) => {
            const baseFormula = (entity.agi * 8 + entity.dex * 2) / 10
            const equipmentBonus = equipmentBonuses(entity).attackSpeed ?? 0
            return baseFormula + equipmentBonus
        },
        magicPower: () => (entity: Entity) => {
            const baseFormula = (entity.int * 8 + entity.wil * 2) / 5
            const equipmentBonus = equipmentBonuses(entity).magicPower ?? 0
            return baseFormula + equipmentBonus
        },
        skillSpeed: () => (entity: Entity) => {
            const baseFormula = (entity.wil * 7 + entity.int * 3) / 10
            const equipmentBonus = equipmentBonuses(entity).skillSpeed ?? 0
            return baseFormula + equipmentBonus
        },
        physicalDefense: () => (entity: Entity) => {
            const baseFormula = (entity.int * 7 + entity.str * 3) / 5
            const equipmentBonus = equipmentBonuses(entity).physicalDefense ?? 0
            return baseFormula + equipmentBonus
        },
        magicDefense: () => (entity: Entity) => {
            const baseFormula = (entity.int * 8 + entity.wil * 2) / 5
            const equipmentBonus = equipmentBonuses(entity).magicDefense ?? 0
            return baseFormula + equipmentBonus
        },


        hitChance: () => (attacker: Entity, defender: Entity): number => {
            // NOTE: due to pinia's API, we cannot reference getters within getters - it requires extra care. Need to to change this everytime the stat formulas are changed, or find a workaround.
            const acc = attacker.dex * 2 + attacker.agi * 0.5
            const eva = defender.agi * 2 + defender.dex * 0.5
            return 0.5 + (acc / (acc + eva)) * 0.49
        },
    },

    actions: {

    }

})