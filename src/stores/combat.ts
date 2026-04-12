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
                // A hero is selected
                if (this.selectedHeroSlot !== undefined && slotIndex !== undefined && this.selectedHeroSource !== undefined) {
                    if (!heroIdOrNull) {
                        // Target is empty
                        this.moveHero(this.selectedHero, this.selectedHeroSource, this.selectedHeroSlot, location, slotIndex)
                    } else {
                        // Target is occupied
                        this.swapHeroes(this.selectedHero, this.selectedHeroSource, this.selectedHeroSlot, heroIdOrNull, location, slotIndex)
                    }
                }
                this.clearSelection()
                } else {
                // No hero selected yet
                this.selectedHero = heroIdOrNull
                this.selectedHeroSource = location
                this.selectedHeroSlot = slotIndex
            }
            if (!this.roster.includes(undefined)) {
                this.roster.push(undefined);
            }
        },
       moveHero(sourceHeroId: string, sourceLocation: string, sourceSlot: number, targetLocation: string, targetSlot: number) {
                //clear the source location
                if (sourceLocation === 'battlefield') {
                    this.battlefield[sourceSlot] = undefined
                } else {
                    this.roster[sourceSlot] = undefined
                }
                //put the hero in target location
                if (targetLocation === 'battlefield') {
                    this.battlefield[targetSlot] = sourceHeroId
                } else {
                    this.roster[targetSlot] = sourceHeroId
                }
            },
        swapHeroes(sourceHeroId: string, sourceLocation: string, sourceSlot: number, targetHeroId: string, targetLocation: string, targetSlot: number){
                //put target hero in source location
                if (sourceLocation === 'battlefield') {
                    this.battlefield[sourceSlot] = targetHeroId;
                } else {
                    this.roster[sourceSlot] = targetHeroId;
                }
                //put the hero in target location
                if (targetLocation === 'battlefield') {
                    this.battlefield[targetSlot] = sourceHeroId
                } else {
                    this.roster[targetSlot] = sourceHeroId
                }
        },
        clearSelection(){
            this.selectedHero = this.selectedHeroSource = this.selectedHeroSlot = undefined;
        }

    }

})