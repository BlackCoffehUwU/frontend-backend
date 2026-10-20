import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { Quasar } from "quasar";
import langEs from "quasar/lang/es";
import iconSet from "quasar/icon-set/svg-material-symbols-rounded";

import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/dm-sans";
import "quasar/src/css/index.sass";
import "./css/app.scss";

import App from "./App.vue";
import router from "./router";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

createApp(App)
  .use(Quasar, { lang: langEs, iconSet })
  .use(pinia)
  .use(router)
  .mount("#app");
