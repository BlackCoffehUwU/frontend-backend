import { createRouter, createWebHashHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

const routes = [
  {
    path: "/login",
    name: "login",
    component: () => import("../pages/LoginPage.vue"),
    meta: { guest: true, title: "Iniciar sesión" },
  },
  {
    path: "/",
    component: () => import("../layouts/MainLayout.vue"),
    meta: { auth: true },
    children: [
      { path: "", name: "dashboard", component: () => import("../pages/DashboardPage.vue"), meta: { title: "Panel" } },
      { path: "cursos", name: "cursos", component: () => import("../pages/CursosPage.vue"), meta: { title: "Cursos" } },
      { path: "aprendices", name: "aprendices", component: () => import("../pages/AprendicesPage.vue"), meta: { title: "Aprendices" } },
      { path: "equipo", name: "equipo", component: () => import("../pages/EquipoPage.vue"), meta: { title: "Equipo" } },
    ],
  },
  { path: "/:pathMatch(.*)*", redirect: { name: "dashboard" } },
];

const router = createRouter({
  // Modo hash: funciona sin configurar nada en el servidor.
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.auth && !auth.autenticado) return { name: "login" };
  if (to.meta.guest && auth.autenticado) return { name: "dashboard" };
});

router.afterEach((to) => {
  document.title = `${to.meta.title || "Aulario"} · Aulario`;
});

export default router;
