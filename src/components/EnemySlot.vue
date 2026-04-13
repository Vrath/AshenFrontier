<script setup lang="ts">
import type { Enemy } from '../stores/combat';
import { useCombatStore } from '../stores/combat';

const combat = useCombatStore();

const { enemy, slotIndex } = defineProps<{
  enemy: Enemy | undefined
  slotIndex: number
}>()
</script>


<template>

  <div class="enemy-slot">
    <div v-if="enemy">
        <p>{{ enemy.name }}</p>
        <p>{{ enemy.hp }} / {{ enemy.maxHp }}</p>
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