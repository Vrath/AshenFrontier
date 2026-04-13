import { defineStore } from "pinia";
import type { Hero } from "./combat";

export const useHeroStatsStore = defineStore('stats', {
    state: () => ({
    }),

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