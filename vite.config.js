import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";
import { fileURLToPath } from "node:url";

export default defineConfig({
  server: { port: 5173, host: true }, // host: true permite entrar desde otros equipos de la red
  plugins: [
    vue({ template: { transformAssetUrls } }),
    quasar({
      sassVariables: fileURLToPath(new URL("./src/css/quasar.variables.scss", import.meta.url)),
    }),
  ],
});
