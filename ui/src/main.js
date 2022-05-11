import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import loading from './loading'

const app = createApp(App)

app.use(router)
app.use(createPinia())
app.use(loading)

app.mount('#app')
