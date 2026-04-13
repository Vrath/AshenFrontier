<script setup lang="ts">
import { useCombatStore } from './stores/combat'
import HeroSlot from './components/HeroSlot.vue'
import EnemySlot from './components/EnemySlot.vue';

const combat = useCombatStore()
combat.initializeHeroes();
</script>

<template>
  <div>

    <p>Battlefield:</p> 
      <div style="display: flex; flex-direction: row; gap: 20px;">
        <div style="display: flex; flex-direction: column; gap: 10px;">
           <HeroSlot v-for="(slot) of combat.backRow" :hero="combat.entityById(slot.hero)" :location="'battlefield'" :slotIndex="slot.slotIndex" @click="(heroId, location, slotIndex) => combat.handleSlotClick(heroId, location, slotIndex)" />
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
           <HeroSlot v-for="(slot) of combat.frontRow" :hero="combat.entityById(slot.hero)" :location="'battlefield'" :slotIndex="slot.slotIndex" @click="(heroId, location, slotIndex) => combat.handleSlotClick(heroId, location, slotIndex)" />
        </div>

        <div style="min-height: 100%; align-content: center;">
          <button @click="combat.startCombat()" :disabled="!combat.hasHeroOnBattlefield || combat.combatRunning">Start Combat</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <EnemySlot v-for="(slot) of combat.enemyFrontRow" :enemy="combat.entityById(slot.enemy) " :slotIndex="slot.slotIndex" />
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <EnemySlot v-for="(slot) of combat.enemyBackRow" :enemy="combat.entityById(slot.enemy)"  :slotIndex="slot.slotIndex" />
        </div>
      </div>
    
    <p>Roster:</p>
    <div style="display: flex;">
        <HeroSlot v-for="[slotIndex, hero] in combat.roster.entries()" :hero="combat.entityById(hero)" :location="'roster'" :slotIndex="slotIndex" @click="(heroId, location, slotIndex) => combat.handleSlotClick(heroId, location, slotIndex)" />
    </div>
      

  </div>
</template>