<script setup>
import routes from '../routes'
</script>

<template>
    <nav class="p-1rem bb">
        <template  v-for="(route, routeIndex) in routes">
            <router-link v-if="route.nav" :to="route.path" :class="{ 'ml-1rem': routeIndex > 0, 'td-n': $route.path === route.path }">{{ route.name }}</router-link>
        </template>
    </nav>
</template>
