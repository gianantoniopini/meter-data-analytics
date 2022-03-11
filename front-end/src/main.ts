import { createApp } from 'vue';
import App from './App.vue';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import DatePicker from 'vue3-date-time-picker';
import 'vue3-date-time-picker/dist/main.css';
import 'mosha-vue-toastify/dist/style.css';
import store from '@/store';
import { setupI18n } from '@/i18n';
import router from '@/router';

const app = createApp(App);
app.use(store);
app.use(setupI18n());
app.use(router);
app.component('DatePicker', DatePicker);
app.mount('#app');
