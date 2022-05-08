<script setup>
import routes from '../routes'
</script>

<template>
    <nav class="p-1rem bb">
        <router-link :to="route.path" v-for="(route, routeIndex) in routes" :class="{ 'ml-1rem': routeIndex > 0, 'td-n': $route.path === route.path }">{{ route.name }}</router-link>
    </nav>
</template>
