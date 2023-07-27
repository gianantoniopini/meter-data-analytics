import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { setupI18n } from '@/i18n'
import router from './router'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import 'bootstrap-icons/font/bootstrap-icons.css'

import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

import 'mosha-vue-toastify/dist/style.css'

const app = createApp(App)

app.use(createPinia())
app.use(setupI18n())
app.use(router)
app.component('VueDatePicker', VueDatePicker)

app.mount('#app')
