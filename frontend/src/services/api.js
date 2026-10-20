import axios from "axios";
import { useAuthStore } from "../stores/auth";
import { Swal } from "../helpers/alerts";

// Instancia unica de axios: la URL del backend se cambia en .env (VITE_API_URL)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4500/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Inyecta el token (que vive en el store de Pinia persistido) en cada peticion.
api.interceptors.request.use((config) => {
  const auth = useAuthStore();
  if (auth.token) config.headers["x-token"] = auth.token;
  return config;
});

// 401 = "no se quien eres": se cierra la sesión y se manda al login.
let avisando = false;
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error.response?.status;
    const esLogin = error.config?.url?.includes("/usuarios/login");
    if (status === 401 && !esLogin && !avisando) {
      avisando = true;
      const auth = useAuthStore();
      auth.limpiar();
      const { default: router } = await import("../router");
      router.replace({ name: "login" });
      await Swal.fire({
        icon: "info",
        title: "Tu sesión terminó",
        text: "Vuelve a iniciar sesión para continuar.",
        confirmButtonText: "Ir al login",
        buttonsStyling: false,
        heightAuto: false,
        customClass: {
          popup: "aula-swal",
          title: "aula-swal__title",
          htmlContainer: "aula-swal__text",
          confirmButton: "aula-swal__btn aula-swal__btn--ok",
        },
      });
      avisando = false;
    }
    return Promise.reject(error);
  }
);

export default api;
