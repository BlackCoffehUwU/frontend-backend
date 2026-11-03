import axios from "axios";
import { useAuthStore } from "../stores/auth";
import { Swal } from "../helpers/alerts";

// Instancia unica de axios.
// La URL del backend usa el MISMO host con el que se abrio la pagina
// (localhost, 192.168.x.x, etc.), asi funciona aunque cambie la IP de la red.
// Solo si defines VITE_API_URL en .env se usa esa direccion fija.
const API_URL =
  import.meta.env.VITE_API_URL ||
  `http://${window.location.hostname}:4500/api`;

const api = axios.create({
  // Nunca "quemar" la URL en el codigo: viene del .env (VITE_API_URL).
  //baseURL: import.meta.env.VITE_API_URL,
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10000, // si el backend no responde en 10s, corta y avisa
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
