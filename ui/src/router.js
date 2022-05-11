import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import routes from './routes'

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
