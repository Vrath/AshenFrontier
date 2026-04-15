import { defineStore } from "pinia";
import type { Entity } from "./combat";
import { races } from "../data/races";
import { classes } from "../data/classes";

import { useVillageStore } from "./village";
import { useCombatStore } from "./combat";

export const useHeroesStore = defineStore('heroes', {
    state: () => ({
        roster: [] as Entity[],
        tavernHeroes: [] as Entity[],
        nextHeroId: 1,
        hireCost: 50,
        refreshIntervalId: undefined as number | undefined,
        lastRefreshTime: 0 as number,
        tick: 0 as number,
        barracks: [] as (string | undefined)[],
        battlefield: [undefined, undefined, undefined, undefined, undefined, undefined] as (string | undefined)[],
    }),

    getters: {
        timeUntilRefresh: (state) => {
            state.tick  // force dependency
            const elapsed = Date.now() - state.lastRefreshTime
            const remaining = Math.max(0, 60000 - elapsed)
            return Math.ceil(remaining / 1000)
        },
        totalBattleUpkeep: (state) => {
            const combat = useCombatStore()
            let upkeep = 0
            
            // Sum upkeep for heroes on battlefield
            for (const heroId of combat.battlefield) {
                if (heroId) {
                    const hero = state.roster.find(h => h.id === heroId)
                    if (hero) {
                        upkeep += Math.pow(hero.level || 1, 1.2)
                    }
                }
            }
            return upkeep
        },
        totalRosterUpkeep: (state) => {
            const combat = useCombatStore()
            let upkeep = 0
            
            // Sum upkeep for heroes in roster but NOT on battlefield
            for (const hero of state.roster) {
                if (!combat.battlefield.includes(hero.id)) {
                    upkeep += Math.pow(hero.level || 1, 1.2) / 5
                }
            }
            return upkeep
        }
    },

    actions: {
        generateHero(): Entity{
            let race: string = '';
            let classType: string = '';
            let isUnique = false;

            while (!isUnique) {
                race = Object.keys(races)[Math.floor(Math.random() * 3)];
                classType = Object.keys(classes)[Math.floor(Math.random() * 3)];

                //Check if any tavern hero has this race or class
                const exists = this.tavernHeroes.some(h => h.race === race || h.class === classType);
                isUnique = !exists;
            }
            
            // Now race and classType are unique. Create the hero.
            const raceModifiers = races[race as keyof typeof races];
            const classModifiers = classes[classType as keyof typeof classes];
            
            const hero: Entity = {
                id: `h_${this.nextHeroId++}`,
                name: `${race} ${classType}`,
                displayName: `${race.charAt(0).toUpperCase() + race.slice(1)} ${classType.charAt(0).toUpperCase() + classType.slice(1)}`,
                race: race as string,
                class: classType as string,
                level: 1,
                str: 10 + raceModifiers.str + classModifiers.str,
                vit: 10 + raceModifiers.vit + classModifiers.vit,
                agi: 10 + raceModifiers.agi + classModifiers.agi,
                dex: 10 + raceModifiers.dex + classModifiers.dex,
                int: 10 + raceModifiers.int + classModifiers.int,
                wil: 10 + raceModifiers.wil + classModifiers.wil,
                hp: 0
            };

            return hero;
        },
        refreshTavern() {
            this.tavernHeroes = [];
            this.tavernHeroes.push(this.generateHero());
            this.tavernHeroes.push(this.generateHero());
            this.tavernHeroes.push(this.generateHero());
            this.lastRefreshTime = Date.now();
        },
        recruit(hero: Entity) {
            const villageStore = useVillageStore();
            if (villageStore.spendGold(this.hireCost)) {
                this.roster.push(hero);
                this.tavernHeroes = this.tavernHeroes.filter(h => h.id !== hero.id);
            } 
        },
        removeHero(heroId: string){
            this.roster = this.roster.filter(h => h.id !== heroId)
        },
        startTimerTick() {
            setInterval(() => this.tick++, 100)
        }
    }
})