import { createApp } from "vue";
import App from "./App.vue";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import router from "@/router";
import "vue3-date-time-picker/dist/main.css";

createApp(App).use(router).mount("#app");
