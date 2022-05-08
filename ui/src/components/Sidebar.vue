<script setup>
defineProps({
    files: {
        type: Array,
        required: true
    },
    activeFile: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['update:activeFile', 'addfile'])
</script>

<template>
    <div class="sidebar">
        <div v-for="file in files" class="sidebar-item" :class="{ 'active': activeFile.filename === file.filename }" @click="emit('update:activeFile', file)">
            {{ file.filename }}
        </div>
        <div class="sidebar-item" @click="emit('addfile')">Add File +</div>
    </div>
</template>
