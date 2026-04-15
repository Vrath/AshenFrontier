<script setup lang="ts">
import { useEntityStatsStore } from '../stores/entityStats';
import { useHeroesStore } from '../stores/heroes';
import { useVillageStore } from '../stores/village';
const heroes = useHeroesStore();
const village = useVillageStore();
const stats = useEntityStatsStore();

</script>
<template>

    <p>Tavern Gold: {{ village.tavern.gold }} / {{ village.tavern.goldCap }} <button @click="village.claimTavernGold()">Claim</button> <button 
    @click="heroes.refreshTavern()" 
    :disabled="heroes.timeUntilRefresh > 0"
>
    Refresh Heroes {{ heroes.timeUntilRefresh > 0 ? `(${heroes.timeUntilRefresh}s)` : '' }}
</button></p>
    
    <div style="display: flex;">
        <div v-for="(hero) of heroes.tavernHeroes" style="min-width: 300px; max-width: 300px;">
            <h4> {{ hero.displayName }}</h4>
            <div style="display: grid; grid-template-columns: auto auto auto; padding: 5px; max-width: 300px;">
                <p> Strength:<br>{{ hero.str }}</p>
                <p> Vitality:<br>{{ hero.vit }}</p>
                <p> Agility:<br>{{ hero.agi }}</p>
                <p> Dexterity:<br>{{ hero.dex }}</p>
                <p> Intelligence:<br>{{ hero.int }}</p>
                <p> Willpower:<br>{{ hero.wil }}</p>
            </div>
            <div style="display: grid; grid-template-columns: auto auto; padding: 5px">
                <p>Max Health:<br>{{ stats.maxHealth(hero) }}</p>
                <p></p>
                <p>Physical Power:<br>{{ stats.physicalPower(hero) }}</p>
                <p>Physical Defense:<br>{{ stats.physicalDefense(hero) }}</p>
                <p>Accuracy:<br>{{ stats.accuracy(hero) }}</p>
                <p>Evasion:<br>{{ stats.evasion(hero) }}</p>
            </div>
            <button @click="heroes.recruit(hero)">Recruit ({{ heroes.hireCost }} gold)</button>
        </div>
    </div>
</template>
<style>
</style>