import { defineStore } from 'pinia';
import { useHeroStatsStore } from './heroStats'

export interface Hero {
    id: string
    name: string
    str: number
    vit: number
    agi: number
    dex: number
    int: number
    wil: number
    hp: number
}

export interface Enemy {
    id: string
    name: string
    hp: number
    maxHp: number
    attack: number
}

export const useCombatStore = defineStore('combat', {
    state: () => ({
        heroes: [
            { id: 'h1', name: 'Orc Paladin',   hp: 0, str: 12, vit: 13, agi: 7,  dex: 7,  int: 6,  wil: 10 },
            { id: 'h2', name: 'Elf Berserker', hp: 0, str: 14, vit: 8,  agi: 12, dex: 10, int: 6,  wil: 5  },
            { id: 'h3', name: 'Dwarf Shaman',  hp: 0, str: 8,  vit: 10, agi: 6,  dex: 8,  int: 12, wil: 11 },
        ],
        enemies: [
            { id: 'e1', name: 'Ashboar', hp: 50, maxHp: 50, attack: 8},
            { id: 'e2', name: 'Gnoll Assassin', hp: 40, maxHp: 40, attack: 13},
            { id: 'e3', name: 'Zombie Mage', hp: 30, maxHp: 30, attack: 18},
        ],
        combatRunning: false,            
        combatIntervalId: undefined as number | undefined,
        roster: ['h1', 'h2', 'h3', undefined] as (string | undefined)[],
        battlefield: [undefined, undefined, undefined, undefined, undefined, undefined] as (string | undefined)[],
        enemyTeam: [undefined, undefined, undefined, undefined, undefined, undefined] as (string | undefined)[],
        selectedHero: undefined as string | undefined,
        selectedHeroSource: undefined as string | undefined,
        selectedHeroSlot: undefined as number | undefined
    }),

    getters: {
        heroById: (state) => (heroId: string | undefined) => state.heroes.find(h => h.id === heroId),
        enemyById: (state) => (enemyId: string | undefined) => state.enemies.find(e => e.id === enemyId),
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
        enemyFrontRow: (state) => {
            const result = []
            for (let i = 0; i < 3; i++) {
                result.push({
                enemy: state.enemyTeam[i],
                slotIndex: i
                })
            }
            return result;
        },
        enemyBackRow: (state) => {
            const result = []
            for (let i = 3; i < 6; i++) {
                result.push({
                enemy: state.enemyTeam[i],
                slotIndex: i
                })
            }
            return result;
        },
        hasHeroOnBattlefield: (state) => state.battlefield.some(slot => slot !== undefined),
        hasEnemyOnBattlefield: (state) => state.enemyTeam.some(slot => slot !== undefined)
    },

    actions: {
        startCombat() {
            if (this.combatRunning) return
            const stats = useHeroStatsStore()

            // Set each hero's hp to their calculated max health
            for (const hero of this.heroes) {
                hero.hp = stats.maxHealth(hero)
            }

            this.generateEnemies()
            this.combatRunning = true
            this.combatIntervalId = setInterval(() => {
                this.combatTick()
            }, 1000)
        },

        generateEnemies(){
            this.enemyTeam = ['e1', undefined, 'e2', undefined, 'e3', undefined];
        },

        combatTick() {
            const stats = useHeroStatsStore()
            
            for (let i = 0; i < this.battlefield.length; i++) {
                const heroId = this.battlefield[i]
                if (heroId) {
                    const targetSlot = this.findMeleeTarget(i, this.enemyTeam)
                    if (targetSlot !== null){
                        const enemyId = this.enemyTeam[targetSlot]
                        const enemy = this.enemyById(enemyId)
                        const hero = this.heroById(heroId)
                        if (enemy && hero){
                            const chance = stats.hitChance(hero, enemy)
                            const roll = Math.random()
                            if (roll < chance) {
                                enemy.hp -= stats.physicalPower(hero)
                            }
                        }
                    }
                }
            }

            for (let i = 0; i < this.enemyTeam.length; i++) {
                const enemyId = this.enemyTeam[i]
                if (enemyId) {
                    const targetSlot = this.findMeleeTarget(i, this.battlefield)
                    if (targetSlot !== null){
                        const heroId = this.battlefield[targetSlot]
                        const enemy = this.enemyById(enemyId)
                        const hero = this.heroById(heroId)
                        if (enemy && hero) {
                            // TODO: enemies use flat attack until they get primary stats (future phase)
                            hero.hp -= enemy.attack
                        }
                    }
                }
            }

            //remove dead heroes
            for (let i = 0; i < this.battlefield.length; i++){
                const heroId = this.battlefield[i]
                if (heroId){
                    const hero = this.heroById(heroId)
                    if (hero && hero.hp <= 0){
                        this.battlefield[i] = undefined
                    }
                }
            }

            //remove dead enemies
            for (let i = 0; i < this.enemyTeam.length; i++){
                const enemyId = this.enemyTeam[i]
                if (enemyId){
                    const enemy = this.enemyById(enemyId)
                    if (enemy && enemy.hp <= 0){
                        this.enemyTeam[i] = undefined
                    }
                }
            }

            //if either team is dead, stop combat
            if (!this.hasHeroOnBattlefield || !this.hasEnemyOnBattlefield){
                clearInterval(this.combatIntervalId)
                this.combatRunning = false
                if (!this.hasHeroOnBattlefield && !this.hasEnemyOnBattlefield){
                    console.log("Draw!")
                }else if (this.hasHeroOnBattlefield){
                    console.log("You won!")
                } else {
                    console.log("You lost!")
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
        },


        // helper methods
        findMeleeTarget(heroSlot: number, targetArray: (string | undefined)[]): number | null {
            const frontRowSlots = [0, 1, 2];
            const sortedFront =  frontRowSlots.sort((a, b) => {
                const distA = Math.abs(heroSlot - a)  // distance from hero to slot a
                const distB = Math.abs(heroSlot - b)  // distance from hero to slot b
                if (distA !== distB) return distA - distB  // return closer one first
                return a - b  // if same distance, return left one first
            })
            for (let slot of sortedFront) {
                if (targetArray[slot] !== undefined) {
                    return slot  // Found a target!
                }
            }
            //now same for back row
            const backRowSlots = [3, 4, 5];
            const sortedBack = backRowSlots.sort((a, b) => {
                const distA = Math.abs(heroSlot - a)
                const distB = Math.abs(heroSlot - b)
                if (distA !== distB) return distA - distB
                return a - b
            })

            for (let slot of sortedBack) {
                if (targetArray[slot] !== undefined) {
                    return slot
                }
            }

            return null; //no targets
        },
        initializeHeroes() {
            const stats = useHeroStatsStore()
            for (const hero of this.heroes) {
                hero.hp = stats.maxHealth(hero)
            }
        },
    },

})