<script setup lang="ts">
import type { Entity } from '../stores/combat';
import { useCombatStore } from '../stores/combat';
import { useEntityStatsStore } from '../stores/entityStats';

const combat = useCombatStore();
const stats = useEntityStatsStore();

const { enemy, slotIndex } = defineProps<{
  enemy: Entity | undefined
  slotIndex: number
}>()
</script>


<template>

  <div class="enemy-slot">
    <div v-if="enemy">
        <h4>{{ enemy.name }}</h4>
        <p>{{ Math.round(enemy.hp) }} / {{ stats.maxHealth(enemy) }}</p>
    </div>
    <div v-else>
      <p>Empty slot</p>
    </div>
  </div>

</template>


<style>
.enemy-slot{
    width: 100px;
    height: 120px;
}
</style>