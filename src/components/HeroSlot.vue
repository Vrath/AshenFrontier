<script setup lang="ts">
import type { Hero } from '../stores/combat'

const { hero, location, slotIndex } = defineProps<{
  hero: Hero | undefined
  slotIndex: number
  location: string
}>()

const emit = defineEmits<{
  click: [heroId: string | undefined, location: string, slotIndex: number]
}>()

const handleClick = () => {
  emit('click', hero?.id, location, slotIndex)
}
</script>

<template>
  <div class="hero-slot" @click="handleClick">
    <div v-if="hero">
        {{ hero.name }}<br>
        {{ hero.hp }} / {{ hero.maxHp }}
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