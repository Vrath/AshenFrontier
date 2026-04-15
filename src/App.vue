<script setup lang="ts">
import { onMounted } from 'vue'
import { useCombatStore } from './stores/combat';
import HeroSlot from './components/HeroSlot.vue';
import EnemySlot from './components/EnemySlot.vue';
import { useVillageStore } from './stores/village';
import { useHeroesStore } from './stores/heroes';
import TavernPanel from './components/TavernPanel.vue';
import { useEntityStatsStore } from './stores/entityStats';

const combat = useCombatStore();
const village = useVillageStore();
const heroes = useHeroesStore();

onMounted(() => {
    village.startVillageTick();
    heroes.refreshTavern();
    heroes.startTimerTick();
    
    const stats = useEntityStatsStore()
    // Initialize HP for all heroes (roster + Tavern)
    for (const hero of heroes.roster) {
        if (hero.hp === 0) hero.hp = stats.maxHealth(hero)
    }
    for (const hero of heroes.tavernHeroes) {
        if (hero.hp === 0) hero.hp = stats.maxHealth(hero)
    }
    // Initialize enemies
    for (const enemy of combat.enemies) {
        if (enemy.hp === 0) enemy.hp = stats.maxHealth(enemy)
    }
})
</script>

<template>
  <div>
    <p>Owned Gold: {{ village.gold }}</p>

    <h3>Battlefield:</h3> 
      <div style="display: flex; flex-direction: row; gap: 20px;">
        <div style="display: flex; flex-direction: column; gap: 10px;">
           <HeroSlot v-for="(slot) of combat.backRow" :hero="combat.entityById(slot.hero)" :location="'battlefield'" :slotIndex="slot.slotIndex" @click="(heroId, location, slotIndex) => combat.handleSlotClick(heroId, location, slotIndex)" />
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
           <HeroSlot v-for="(slot) of combat.frontRow" :hero="combat.entityById(slot.hero)" :location="'battlefield'" :slotIndex="slot.slotIndex" @click="(heroId, location, slotIndex) => combat.handleSlotClick(heroId, location, slotIndex)" />
        </div>

        <div style="min-height: 100%; align-content: center;">
          <p>Hero Upkeep: {{ heroes.totalBattleUpkeep + heroes.totalRosterUpkeep }}</p>
          <button @click="combat.startCombat()" :disabled="!combat.hasHeroOnBattlefield || combat.combatRunning">Start Combat</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <EnemySlot v-for="(slot) of combat.enemyFrontRow" :enemy="combat.entityById(slot.enemy) " :slotIndex="slot.slotIndex" />
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <EnemySlot v-for="(slot) of combat.enemyBackRow" :enemy="combat.entityById(slot.enemy)"  :slotIndex="slot.slotIndex" />
        </div>
      </div>
    
    <h3>Roster:</h3>
    <div style="display: flex;">
        <HeroSlot v-for="[slotIndex, hero] in heroes.roster.filter(h => !combat.battlefield.includes(h.id)).entries()" :hero="hero" :location="'roster'" :slotIndex="slotIndex" @click="(heroId, location, slotIndex) => combat.handleSlotClick(heroId, location, slotIndex)" />
    </div>
      
  
    <h3>Tavern:</h3>
    <TavernPanel />

  </div>
</template>