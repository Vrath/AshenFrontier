import { defineStore } from 'pinia';

export interface Hero {
    id: string
    name: string
    hp: number
    maxHp: number
    attack: number
}

interface Enemy {
    name: string
    hp: number
    maxHp: number
}

export const useCombatStore = defineStore('combat', {
    state: () => ({
        heroes: [
            { id: 'h1', name: 'Ketamine Wook', hp: 100, maxHp: 100, attack: 10 },
            { id: 'h2', name: 'Spunion', hp: 80, maxHp: 80, attack: 15 },
            { id: 'h3', name: 'Mushroom Shaman', hp: 90, maxHp: 90, attack: 12 },
        ],
        enemy: {
            name: 'Ashboar',
            hp: 50,
            maxHp: 50
        } as Enemy,
        combatRunning: false,            
        combatIntervalId: undefined as number | undefined,
        roster: ['h1', 'h2', 'h3', undefined] as (string | undefined)[],
        battlefield: [undefined, undefined, undefined, undefined, undefined, undefined] as (string | undefined)[],
        selectedHero: undefined as string | undefined,
        selectedHeroSource: undefined as string | undefined,
        selectedHeroSlot: undefined as number | undefined
    }),

    getters: {
        enemyIsDead: (state) => state.enemy.hp <= 0,
        heroById: (state) => (heroId: string | undefined) => state.heroes.find(h => h.id === heroId),
        frontRow: (state) => {
            const result = []
            for (let i = 0; i < 3; i++) {
                result.push({
                hero: state.battlefield[i],
                slotIndex: i
                })
            }
            return result;
        },
        backRow: (state) => {
            const result = []
            for (let i = 3; i < 6; i++) {
                result.push({
                hero: state.battlefield[i],
                slotIndex: i
                })
            }
            return result;
        },
    },

    actions: {
        startCombat() {
            if (this.combatRunning) return
            this.combatRunning = true
            this.combatIntervalId = setInterval(() => {
                this.combatTick()
            }, 1000)
        },

        combatTick() {
            if (this.enemyIsDead) {
                clearInterval(this.combatIntervalId);
                this.combatRunning = false;
                return;
            }

            for (let heroId of this.battlefield) {
                if (heroId) {
                    const hero = this.heroes.find(h => h.id === heroId)
                    if (hero) {
                        this.enemy.hp -= hero.attack;
                    }
                }
            }
        },

       handleSlotClick(heroIdOrNull: string | undefined, location: string, slotIndex?: number){
            //check if a hero is selected
            if (this.selectedHero) {
                // A hero is already selected; try to place it
                if (location === 'battlefield' && !heroIdOrNull) {
                    // Target is an empty battlefield slot - safe to place
                    this.roster = this.roster.filter(id => id !== this.selectedHero);
                    this.battlefield[slotIndex!] = this.selectedHero;
                    if (this.selectedHeroSource === "battlefield" && this.selectedHeroSlot !== undefined){
                        this.battlefield[this.selectedHeroSlot] = undefined;
                    }
                } else if (location === 'battlefield' && heroIdOrNull) {
                    // Target is a hero on battlefield - swap them
                    
                } else {
                    // Target is a hero in roster - swap them
                } 
                this.selectedHero = undefined;
                this.selectedHeroSource = undefined;
                this.selectedHeroSlot = undefined;
            } else {
                // No hero selected yet - remember which one we clicked
                this.selectedHero = heroIdOrNull;
                this.selectedHeroSource = location;
                if (slotIndex !== undefined){
                    this.selectedHeroSlot = slotIndex;
                }
            }
            if (!this.roster.includes(undefined)) {
                this.roster.push(undefined);
            }
        }
    }
})