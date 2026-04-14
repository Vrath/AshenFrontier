import { defineStore } from "pinia";
import type { Entity } from "./combat";
import { races } from "../data/races";
import { classes } from "../data/classes";

import { useVillageStore } from "./villageStore";

export const useHeroesStore = defineStore('heroes', {
    state: () => ({
        roster: [] as Entity[],
        tavernHeroes: [] as Entity[],
        nextHeroId: 1,
        hireCost: 50,
        refreshIntervalId: undefined as number | undefined,
        lastRefreshTime: 0 as number,
    }),

    getters: {
        timeUntilRefresh: (state) => {
            const elapsed = Date.now() - state.lastRefreshTime
            const remaining = Math.max(0, 60000 - elapsed)  // 60000ms = 1 minute
            return Math.ceil(remaining / 1000)  // return seconds
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
                displayName: `${race} ${classType}`,
                race: race as string,
                class: classType as string,
                str: 10 + raceModifiers.str + classModifiers.str,
                vit: 10 + raceModifiers.vit + classModifiers.vit,
                agi: 10 + raceModifiers.agi + classModifiers.agi,
                dex: 10 + raceModifiers.dex + classModifiers.dex,
                int: 10 + raceModifiers.int + classModifiers.int,
                wil: 10 + raceModifiers.wil + classModifiers.wil,
                hp: 0,
                hireCost: 50,
                battleUpkeepCost: 1,
                rosterUpkeepCost: 0.2,
            };

            return hero;
        },
        refreshTavern() {
            this.tavernHeroes = [];
            this.tavernHeroes.push(this.generateHero());
            this.tavernHeroes.push(this.generateHero());
            this.tavernHeroes.push(this.generateHero());
            this.lastRefreshTime = Date.now();
            if (this.refreshIntervalId === undefined) {
                this.refreshIntervalId = setInterval(() => {
                    this.refreshTavern()
                }, 60000)  // 60 seconds for testing
            }
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
        }
    }
})