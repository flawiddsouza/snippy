import { defineStore } from 'pinia'

function getCombinedFilters(snippets) {
    const filters = snippets.map(snippet => {
        const regex = /\[(.*?)\]/g
        const matches = snippet.title.match(regex)
        return matches ? matches.map(match => match.slice(1, -1)) : []
    })

    const combinedFilters = []

    filters.forEach(filterGroup => {
        if (filterGroup.length > 0) {
            combinedFilters.push(`[${filterGroup.join('] [')}]`)
            filterGroup.forEach(filter => {
                combinedFilters.push(`[${filter}]`)
            })
        }
    })

    return [...new Set(combinedFilters)].sort((a, b) => a.localeCompare(b))
}

export const useStore = defineStore('store', {
    state: () => {
        return {
            snippets: [],
            filters: [],
            search: ''
        }
    },
    getters: {
        filteredSnippets() {
            const search = this.search.toLowerCase()

            if(search === '') {
                return this.snippets
            }

            return this.snippets.filter(snippet => snippet.title.toLowerCase().includes(search))
        }
    },
    actions: {
        async loadSnippets() {
            const response = await fetch('/snippets')
            this.snippets = await response.json()
            this.filters = getCombinedFilters(this.snippets)
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
