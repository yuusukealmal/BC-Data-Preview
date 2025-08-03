import { createApp } from "vue";
import { createPinia } from "pinia";

import { router } from "./router";

import "./style.css";

import App from "./App.vue";
import { applyTheme } from "./utils/theme";

const isDarked = localStorage.getItem("isDark");
if (isDarked) {
  const theme = JSON.parse(isDarked);
  applyTheme(theme);
} else {
  applyTheme(false);
}

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.mount("#app");
