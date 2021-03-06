import { createApp } from 'vue';
import App from './App.vue';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import VCalendar from 'v-calendar';
import 'v-calendar/dist/style.css';
import 'mosha-vue-toastify/dist/style.css';
import store from '@/store';
import { setupI18n } from '@/i18n';
import router from '@/router';

const app = createApp(App);
app.use(store);
app.use(setupI18n());
app.use(router);
app.use(VCalendar);
app.mount('#app');
