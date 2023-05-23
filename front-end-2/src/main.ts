import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { setupI18n } from '@/i18n'
import router from './router'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import 'bootstrap-icons/font/bootstrap-icons.css'

const app = createApp(App)

app.use(createPinia())
app.use(setupI18n())
app.use(router)

app.mount('#app')
