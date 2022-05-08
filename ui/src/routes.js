import Home from './components/Home.vue'
import Snippet from './components/Snippet.vue'

export default [
    {
        path: '/',
        component: Home,
        name: 'Home'
    },
    {
        path: '/add-snippet',
        component: Snippet,
        name: 'Add Snippet'
    }
]
