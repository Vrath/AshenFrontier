import { defineStore } from "pinia";
import type { Entity } from "./combat";

export const useEntityStatsStore = defineStore('stats', {
    state: () => ({
    }),

    getters: {
        maxHealth: () => (hero: Entity): number =>
            hero.vit * 4 + hero.str * 1,

        physicalPower: () => (hero: Entity): number =>
            hero.str * 2 + hero.dex * 0.5,

        physicalDefense: () => (hero: Entity): number =>
            hero.vit * 1 + hero.str * 0.5,

        evasion: () => (hero: Entity): number =>
            hero.agi * 2 + hero.dex * 0.5,

        accuracy: () => (hero: Entity): number =>
            hero.dex * 2 + hero.agi * 0.5,

        hitChance: () => (attacker: Entity, defender: Entity): number => {
            const acc = attacker.dex * 2 + attacker.agi * 0.5
            const eva = defender.agi * 2 + defender.dex * 0.5
            return 0.5 + (acc / (acc + eva)) * 0.49
        },
    }

})
