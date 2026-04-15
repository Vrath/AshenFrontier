import { defineStore } from "pinia";

export const useVillageStore = defineStore('village', {
    state: () => ({
        gold: 100,
        tavern: {
            gold: 0,
            goldCap: 100,
            goldPerTick: 1
        }
    }),

    getters: {
        canAfford: (state) => {
            return (amount: number) => state.gold >= amount
        }
    },

    actions: {
        startVillageTick(){
          setInterval(() => {
                this.tavern.gold += this.tavern.goldPerTick
                if (this.tavern.gold > this.tavern.goldCap) {this.tavern.gold = this.tavern.goldCap}
            }, 1000)
        },
        claimTavernGold(){
            this.gold += this.tavern.gold
            this.tavern.gold = 0
        },
        spendGold(amount: number){
            if (this.canAfford(amount)){
                this.gold -= amount;
                return true;
            }
            return false;
        },
    }
})