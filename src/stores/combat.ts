import { defineStore } from 'pinia';
import { useEntityStatsStore } from './entityStats';

export interface Entity {
    id: string
    name: string
    displayName?: string
    hireCost?: number
    battleUpkeepCost?: number
    rosterUpkeepCost?: number
    str: number
    vit: number
    agi: number
    dex: number
    int: number
    wil: number
    hp: number
    race?: string | null
    class?: string | null
}

export const useCombatStore = defineStore('combat', {
    state: () => ({
        heroes: [
            { id: 'h1', name: 'Orc Paladin',   hp: 0, str: 12, vit: 13, agi: 7,  dex: 7,  int: 6,  wil: 10 },
            { id: 'h2', name: 'Elf Berserker', hp: 0, str: 14, vit: 8,  agi: 12, dex: 10, int: 6,  wil: 5  },
            { id: 'h3', name: 'Dwarf Shaman',  hp: 0, str: 8,  vit: 10, agi: 6,  dex: 8,  int: 12, wil: 11 },
        ],
        enemies: [
            { id: 'e1', name: 'Ashboar', hp: 0, str: 8, vit: 10, agi: 5, dex: 5, int: 5, wil: 5},
            { id: 'e2', name: 'Gnoll Assassin', hp: 0, str: 9, vit: 5, agi: 9, dex: 9, int: 5, wil: 5},
            { id: 'e3', name: 'Zombie Mage', hp: 0, str: 5, vit: 5, agi: 5, dex: 5, int: 9, wil: 7},
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
        entityById: (state) => (entityId: string | undefined) => state.heroes.find(h => h.id === entityId) || state.enemies.find(e => e.id === entityId),
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
            const stats = useEntityStatsStore()

            // Set each hero's hp to their calculated max health
            for (const hero of this.heroes) {
                hero.hp = stats.maxHealth(hero)
            }

            this.generateEnemies()
            this.combatRunning = true
            this.combatIntervalId = setInterval(() => {
                this.combatTick()
            }, 2500)
        },

        generateEnemies(){
            this.enemyTeam = ['e1', undefined, 'e2', undefined, 'e3', undefined];
        },

        combatTick() {
            
            this.applyAttacks(this.battlefield, this.enemyTeam)
            this.applyAttacks(this.enemyTeam, this.battlefield)

            //remove dead heroes
            for (let i = 0; i < this.battlefield.length; i++){
                const heroId = this.battlefield[i]
                if (heroId){
                    const hero = this.entityById(heroId)
                    if (hero && hero.hp <= 0){
                        this.battlefield[i] = undefined
                    }
                }
            }

            //remove dead enemies
            for (let i = 0; i < this.enemyTeam.length; i++){
                const enemyId = this.enemyTeam[i]
                if (enemyId){
                    const enemy = this.entityById(enemyId)
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
        console.log(slotIndex)
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
            const heroColumn = heroSlot % 3  // normalize to column (0, 1, or 2)

            const frontRowSlots = [0, 1, 2];
            const sortedFront = frontRowSlots.sort((a, b) => {
                const distA = Math.abs(heroColumn - a)  // distance from hero's column to slot a
                const distB = Math.abs(heroColumn - b)  // distance from hero's column to slot b
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
                const distA = Math.abs(heroColumn - (a % 3))  // distance from hero's column to slot a's column
                const distB = Math.abs(heroColumn - (b % 3))  // distance from hero's column to slot b's column
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
            const stats = useEntityStatsStore()
            for (const hero of this.heroes) {
                hero.hp = stats.maxHealth(hero)
            }
            for (const enemy of this.enemies){
                enemy.hp = stats.maxHealth(enemy)
            }
        },

        applyAttacks(attackers: (string | undefined)[], defenders: (string | undefined)[]) {
            const stats = useEntityStatsStore()
            
            for (let i = 0; i < attackers.length; i++) {
                const attackerId = attackers[i]
                if (attackerId) {
                    const targetSlot = this.findMeleeTarget(i, defenders)
                    if (targetSlot !== null) {
                        const defenderId = defenders[targetSlot]
                        const attacker = this.entityById(attackerId)
                        const defender = this.entityById(defenderId)
                        if (attacker && defender) {
                            const acc = attacker.dex * 2 + attacker.agi * 0.5
                            const eva = defender.agi * 2 + defender.dex * 0.5
                            const chance = stats.hitChance(attacker, defender)
                            const roll = Math.random()
                            
                            console.log(`${attacker.name} attacks ${defender.name}:`)
                            console.log(`  Accuracy: ${acc.toFixed(1)} vs Evasion: ${eva.toFixed(1)}`)
                            console.log(`  Hit chance: ${(chance * 100).toFixed(1)}%`)
                            console.log(`  Roll: ${roll.toFixed(2)} — ${roll < chance ? 'HIT' : 'MISS'}`)
                            
                            if (roll < chance) {
                                const rawDamage = stats.physicalPower(attacker)
                                const defenderDef = stats.physicalDefense(defender)
                                const mitigated = rawDamage * (stats.physicalPower(attacker) / (stats.physicalPower(attacker) + defenderDef))
                                defender.hp -= mitigated
                                
                                console.log(`  Physical Power: ${rawDamage.toFixed(1)} vs Physical Defense: ${defenderDef.toFixed(1)}`)
                                console.log(`  Damage after mitigation: ${mitigated.toFixed(2)}`)
                                console.log(`  ${defender.name} HP: ${defender.hp.toFixed(2)} / ${stats.maxHealth(defender)}`)
                            } else {
                                console.log(`  ${defender.name} takes no damage`)
                            }
                        }
                    }
                }
            }
        },


    }
})