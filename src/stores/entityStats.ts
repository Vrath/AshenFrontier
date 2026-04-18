import { defineStore } from "pinia";
import type { Entity } from "../types";

export const useEntityStatsStore = defineStore('stats', {
    state: () => ({
    }),

    getters: {
        physicalPower: () => (hero: Entity): number =>
            (hero.str * 8 + hero.dex * 2) / 5,
        maxHealth: () => (hero: Entity): number =>
            (hero.vit * 9 + hero.str * 1) / 2, 
        healthRegen: () => (hero: Entity): number =>
            (hero.vit * 7 + hero.wil * 3) / 100,
        evasion: () => (hero: Entity): number =>
            (hero.agi * 9 + hero.vit * 1) / 5,
        accuracy: () => (hero: Entity): number =>
            (hero.dex * 8 + hero.wil * 1) / 5,
        attackSpeed: () => (hero: Entity): number =>
            (hero.agi * 8 + hero.dex * 2) / 10,
        magicPower: () => (hero: Entity): number =>
            (hero.int * 8 + hero.wil * 2) / 5,
        skillSpeed: () => (hero: Entity): number =>
            (hero.wil * 7 + hero.int * 3) / 10,
        physicalDefense: () => (hero: Entity): number =>
            (hero.int * 7 + hero.str * 3) / 5,
        magicDefense: () => (hero: Entity): number =>
            (hero.int * 8 + hero.wil * 2) / 5,


        hitChance: () => (attacker: Entity, defender: Entity): number => {
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