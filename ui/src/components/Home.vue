<script setup>
import { reactive, inject, onBeforeMount } from 'vue'
import { useStore } from '../store';
import Header from './Header.vue';
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'

const router = useRouter()
const store = useStore()
const loading = inject('loading')

async function viewSnippet(snippetId) {
    router.push({
        name: 'View Snippet',
        params: { id: snippetId }
    });
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
</script>

<template>
    <Header>
        <h2>Snippets</h2>
    </Header>
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
                <tr class="clickable-row" v-for="snippet in store.snippets" @click="viewSnippet(snippet.id)">
                    <td>{{ snippet.title }}</td>
                    <td>{{ formatTimestamp(snippet.created) }}</td>
                    <td>{{ formatTimestamp(snippet.modified) }}</td>
                    <td>
                        <button class="small" @click.stop="toggleSharing(snippet.id)">
                            <template v-if="snippet.shared">Disable</template>
                            <template v-else>Enable</template>
                        </button>
                    </td>
                    <td><button class="small" @click.stop="shareSnippet(snippet.id)" :disabled="!snippet.shared">Share</button></td>
                    <td><button class="small" @click.stop="deleteSnippet(snippet.id)">Delete</button></td>
                </tr>
                <tr v-if="store.snippets.length === 0">
                    <td colspan="100%" class="text-center">No Records Found</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
