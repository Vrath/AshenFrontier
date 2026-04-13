<script setup lang="ts">
import type { Entity } from '../stores/combat';
import { useCombatStore } from '../stores/combat';
import { useEntityStatsStore } from '../stores/entityStats';

const combat = useCombatStore();
const stats = useEntityStatsStore();

const { hero, location, slotIndex } = defineProps<{
  hero: Entity | undefined
  slotIndex: number
  location: string
}>()

const emit = defineEmits<{
  click: [heroId: string | undefined, location: string, slotIndex: number]
}>()

const handleClick = () => {
  emit('click', hero?.id, location, slotIndex)
}

const handleDragStart = (e: DragEvent) => {
  combat.selectedHero = hero?.id
  combat.selectedHeroSource = location
  combat.selectedHeroSlot = slotIndex
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  // Now call handleSlotClick like normal, but the source is already stored
  emit('click', hero?.id, location, slotIndex)
}


</script>


<template>

  <div class="hero-slot" @click="handleClick" @drop="handleDrop" @dragover.prevent>
    <div v-if="hero" draggable="true" @dragstart="handleDragStart">
        <p>{{ hero.name }}</p>
        {{ Math.round(hero.hp) }}/ {{ stats.maxHealth(hero) }}
    </div>
    <div v-else>
      <p>Empty slot</p>
    </div>
  </div>

</template>


<style>
.hero-slot{
    width: 100px;
    height: 120px;
}
</style>