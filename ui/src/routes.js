import Home from './components/Home.vue'
import Snippet from './components/Snippet.vue'

export default [
    {
        path: '/',
        component: Home,
        name: 'Home',
        nav: true
    },
    {
        path: '/add',
        component: Snippet,
        name: 'Add Snippet',
        nav: true
    },
    {
        path: '/view/:id',
        component: Snippet,
        name: 'View Snippet',
        nav: false
    }
]
