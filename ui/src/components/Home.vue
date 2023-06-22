<script setup>
import { inject, onBeforeMount, onMounted } from 'vue'
import { useStore } from '../store';
import Header from './Header.vue';
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'

const router = useRouter()
const store = useStore()
const loading = inject('loading')

function viewSnippet(snippetId) {
    const routingData = {
        name: 'View Snippet',
        params: { id: snippetId }
    }

    router.push(routingData)
}

function generateSnippetRoute(snippetId) {
    const routingData = {
        name: 'View Snippet',
        params: { id: snippetId }
    }

    const routeData = router.resolve(routingData)
    return routeData.href
}

async function deleteSnippet(snippetId) {
    if(!confirm('Are you sure?')) {
        return
    }
    const loader = loading.show()
    await fetch(`/snippets/${snippetId}`, {
        method: 'DELETE'
    })
    await store.loadSnippets()
    loader.hide()
}

function shareSnippet(snippetId) {
    window.open(document.location.origin + `/snippet/${snippetId}`)
}

function formatTimestamp(timestamp) {
    return dayjs(timestamp).format('DD-MMM-YY hh:mm A')
}

async function toggleSharing(snippetId) {
    const loader = loading.show()
    await fetch(`/snippets/${snippetId}/toggle-sharing`, {
        method: 'PUT'
    })
    await store.loadSnippets()
    loader.hide()
}

onBeforeMount(() => {
    store.loadSnippets()
})

onMounted(() => {
    document.title = 'Snippy'
})
</script>

<template>
    <Header>
        <h2>Snippets</h2>
    </Header>
    <div class="p-1rem pb-0">
        <input type="search" list="filters" v-model="store.search" placeholder="Filter Snippets" style="width: 20rem;">
        <datalist id="filters">
            <option v-for="filter in store.filters">{{ filter }}</option>
        </datalist>
    </div>
    <div class="p-1rem">
        <table>
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Created</th>
                    <th>Modified</th>
                    <th>Sharing</th>
                    <th></th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <a :href="generateSnippetRoute(snippet.id)" @click.prevent="viewSnippet(snippet.id)" style="display: contents; color: inherit;" v-for="snippet in store.filteredSnippets">
                    <tr class="clickable-row">
                        <td>{{ snippet.title }}</td>
                        <td>{{ formatTimestamp(snippet.created) }}</td>
                        <td>{{ formatTimestamp(snippet.modified) }}</td>
                        <td>
                            <button class="small" @click.stop.prevent="toggleSharing(snippet.id)">
                                <template v-if="snippet.shared">Disable</template>
                                <template v-else>Enable</template>
                            </button>
                        </td>
                        <td><button class="small" @click.stop.prevent="shareSnippet(snippet.id)" :disabled="!snippet.shared">Share</button></td>
                        <td><button class="small" @click.stop.prevent="deleteSnippet(snippet.id)">Delete</button></td>
                    </tr>
                </a>
                <tr v-if="store.filteredSnippets.length === 0">
                    <td colspan="100%" class="text-center">No Records Found</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
