import { createApp } from 'vue';
import App from './App.vue';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'mosha-vue-toastify/dist/style.css';
import { setupI18n } from '@/i18n';
import router from '@/router';
import store from '@/store';

const app = createApp(App);
app.use(store);
app.use(setupI18n());
app.use(router);
app.mount('#app');
