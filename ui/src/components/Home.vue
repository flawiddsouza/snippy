<script setup>
import { reactive } from 'vue'
import { useStore } from '../store';
import Header from './Header.vue';
const store = useStore()
const snippets = store.snippets
</script>

<template>
    <Header>
        <h2>Snippets</h2>
    </Header>
    <div class="p-1rem">
        <div v-for="snippet in snippets">
            {{ snippet }}
        </div>
    </div>
</template>
