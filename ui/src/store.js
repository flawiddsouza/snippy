import { defineStore } from 'pinia'

export const useStore = defineStore('store', {
    state: () => {
        return {
            snippets: []
        }
    },
    actions: {
        addSnippet(snippet) {
            this.snippets.push({...snippet, created: new Date().getTime(), updated: new Date().getTime() })
        }
    }
})
