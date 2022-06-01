import { defineStore } from 'pinia'

export const useStore = defineStore('store', {
    state: () => {
        return {
            snippets: []
        }
    },
    actions: {
        async loadSnippets() {
            const response = await fetch('/snippets')
            this.snippets = await response.json()
        },
        async addSnippet(snippet) {
            const response = await fetch('/snippets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    snippet
                })
            })
            const savedSnippet = await response.json()
            this.snippets.push({ ...snippet, ...savedSnippet })
            return savedSnippet
        },
        async updateSnippet(snippet) {
            await fetch(`/snippets/${snippet.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    snippet
                })
            })
        }
    }
})
