import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { authService } from "../services/auth.service";

export const useAuthStore = defineStore(
  "auth",
  () => {
    const token = ref("");
    const usuario = ref(null);

    const autenticado = computed(() => !!token.value);
    const iniciales = computed(() => {
      const partes = (usuario.value?.nombre || "?").trim().split(/\s+/);
      return (partes[0]?.[0] || "?") + (partes[1]?.[0] || "");
    });

    // "ADMINISTRADOR PEREZ" -> "Administrador"
    const nombrePila = computed(() => {
      const n = (usuario.value?.nombre || "").trim().split(/\s+/)[0].toLowerCase();
      return n ? n.charAt(0).toUpperCase() + n.slice(1) : "";
    });

    async function login(credenciales) {
      const { data } = await authService.login(credenciales);
      token.value = data.token;
      usuario.value = data.usuario;
    }

    function limpiar() {
      token.value = "";
      usuario.value = null;
    }

    return { token, usuario, autenticado, iniciales, nombrePila, login, limpiar };
  },
  // pinia-plugin-persistedstate: guarda token y usuario para sobrevivir al F5
  { persist: { key: "aulario-auth", pick: ["token", "usuario"] } }
);
