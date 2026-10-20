<template>
  <q-layout view="hHh LpR lFf">
    <q-header class="aula-topbar lt-md">
      <q-toolbar>
        <q-btn flat round dense :icon="iMenu" @click="drawer = !drawer" />
        <q-toolbar-title class="display text-weight-bold">Aulario</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" show-if-above :width="272" :breakpoint="1023" class="aula-drawer">
      <div class="column full-height no-wrap">
        <div class="aula-brand">
          <div class="aula-brand__mark"><BrandMark :size="26" /></div>
          <div>
            <div class="aula-brand__name">Aulario</div>
            <div class="aula-brand__sub">Cursos y aprendices</div>
          </div>
        </div>

        <nav class="aula-nav">
          <div class="aula-nav__label">Gestión</div>
          <router-link v-for="n in nav" :key="n.name" :to="{ name: n.name }" class="aula-link" @click="cerrarEnMovil">
            <q-icon :name="n.icon" size="22px" /> {{ n.label }}
          </router-link>
        </nav>

        <q-space />

        <div class="aula-user">
          <div class="aula-user__avatar">{{ auth.iniciales }}</div>
          <div class="col" style="min-width: 0">
            <div class="aula-user__name ellipsis">{{ auth.usuario?.nombre }}</div>
            <div class="aula-user__mail">{{ auth.usuario?.email }}</div>
          </div>
          <q-btn flat round dense color="grey-5" :icon="iLogout" @click="salir">
            <q-tooltip>Cerrar sesión</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import BrandMark from "../components/BrandMark.vue";
import { useAuthStore } from "../stores/auth";
import { confirmar, toastOk } from "../helpers/alerts";
import { iAprendices, iCursos, iDashboard, iLogout, iMenu, iPersonAdd } from "../icons";

const $q = useQuasar();
const router = useRouter();
const auth = useAuthStore();
const drawer = ref(false);

const nav = [
  { name: "dashboard", label: "Panel", icon: iDashboard },
  { name: "cursos", label: "Cursos", icon: iCursos },
  { name: "aprendices", label: "Aprendices", icon: iAprendices },
  { name: "equipo", label: "Equipo", icon: iPersonAdd },
];

const cerrarEnMovil = () => { if ($q.screen.lt.md) drawer.value = false; };

async function salir() {
  const ok = await confirmar({
    title: "¿Cerrar sesión?",
    text: "Tendrás que ingresar de nuevo para volver al panel.",
    confirmText: "Cerrar sesión",
  });
  if (!ok) return;
  auth.limpiar();
  await router.replace({ name: "login" });
  toastOk("Sesión cerrada");
}
</script>

<style>
.page-enter-active, .page-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.page-enter-from { opacity: 0; transform: translateY(8px); }
.page-leave-to { opacity: 0; }
</style>
