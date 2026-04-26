import { defineStore } from "pinia";
import type { Entity, Item, ItemTemplate, PrimaryStatKey, SecondaryStatKey } from "../types";
import { useHeroesStore } from "./heroes";
import { ITEM_TEMPLATES } from "../data/items";

let nextItemId = 0 as number;

export const useInventoryStore = defineStore('inventory', {
    state: () => ({
        playerInventory: [] as Item[]
    }),

    getters: {
        canEquip: () => {
            return (hero: Entity, item: Item): boolean => {
                if (!item.requirements) return true  // No requirements = can equip

                return Object.entries(item.requirements).every(([stat, requiredValue]) => {
                    return hero[stat as PrimaryStatKey] >= requiredValue
                })
            }
        }
    },

    actions: {
        equipItem(heroId: string, item: Item) {
            const heroesStore = useHeroesStore()
            const hero = heroesStore.roster.find((h: Entity) => h.id === heroId)
            if (!hero) return  // Hero not found
            if (!this.canEquip(hero, item)) return  // Can't equip
            if (hero.equipment[item.slot]) {
                this.playerInventory.push(hero.equipment[item.slot]!)
            }

            // Remove new item from stash and equip it
            const itemIndex = this.playerInventory.findIndex(i => i.instanceId === item.instanceId)
            if (itemIndex !== -1) {
                this.playerInventory.splice(itemIndex, 1)
            }

            hero.equipment[item.slot] = item
        },

        unequipItem(heroId: string, item: Item) {
            const heroesStore = useHeroesStore();
            const hero = heroesStore.roster.find((h: Entity) => h.id === heroId);
            if (!hero) return;

            if (hero.equipment[item.slot]?.instanceId === item.instanceId) {
                this.playerInventory.push(hero.equipment[item.slot]!)
                hero.equipment[item.slot] = undefined
            }
        },

        craftItem(templateId: string) {
            const template = ITEM_TEMPLATES.find((t) => t.id === templateId) as ItemTemplate | undefined
            if (!template) return;

            //roll bonuses
            const bonuses: Partial<Record<SecondaryStatKey, number>> = {}
            Object.entries(template.bonusRanges).forEach(([stat, base]) => {
                if (base === 0) return;

                const min = Math.floor(base * 0.9);
                const max = Math.ceil(base * 1.1);
                const rolled = Math.floor(Math.random() * (max - min + 1)) + min;
                bonuses[stat as SecondaryStatKey] = rolled;
            });

            //create item
            const newItem: Item = {
                templateId: template.id,
                instanceId: nextItemId++,
                slot: template.slot,
                requirements: template.requirements,
                bonuses,
                attackValue: template.attackValue,
                damageWeights: template.damageWeights,
                targetingType: template.targetingType,
            }

            this.playerInventory.push(newItem);
        }
    }
})