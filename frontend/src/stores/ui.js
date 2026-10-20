import { defineStore } from "pinia";
import { ref } from "vue";

// Preferencias de interfaz que tambien se recuerdan entre visitas.
export const useUiStore = defineStore(
  "ui",
  () => {
    const filtroCursos = ref("todos"); // todos | activos | inactivos
    const filtroAprendices = ref("todos");
    return { filtroCursos, filtroAprendices };
  },
  { persist: { key: "aulario-ui" } }
);
