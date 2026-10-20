<template>
  <div class="page">
    <section class="hero fade-up">
      <div class="eyebrow" style="color: var(--mint)">{{ fechaHoy }}</div>
      <h1>{{ saludo }}, {{ nombrePila }}.</h1>
      <p>Este es el pulso de tu centro: cuántos cursos están en marcha y cómo se reparten tus aprendices.</p>
      <div class="row q-gutter-sm">
        <q-btn unelevated no-caps class="btn-main" color="accent" text-color="dark" :icon="iAdd" label="Nuevo aprendiz" :to="{ name: 'aprendices' }" />
        <q-btn flat no-caps class="btn-main" style="color: #cfe6d8; background: rgba(255,255,255,0.08)" :icon-right="iArrow" label="Ver cursos" :to="{ name: 'cursos' }" />
      </div>
    </section>

    <div class="row q-col-gutter-md q-mb-md">
      <div v-for="(s, i) in stats" :key="s.label" class="col-6 col-md-3">
        <div class="card stat fade-up" :style="{ animationDelay: `${0.05 + i * 0.05}s` }">
          <div class="stat__icon" :class="s.tone"><q-icon :name="s.icon" size="22px" /></div>
          <q-skeleton v-if="cargando" type="text" width="60px" height="38px" class="q-mt-md" />
          <div v-else class="stat__value">{{ s.value }}</div>
          <div class="stat__label">{{ s.label }}</div>
          <div v-if="s.hint && !cargando" class="stat__hint">{{ s.hint }}</div>
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-7">
        <div class="card fade-up q-pa-lg" style="animation-delay: 0.2s">
          <div class="row items-center q-mb-sm">
            <h3 class="q-ma-none text-h6 text-weight-bold">Aprendices por curso</h3>
            <q-space />
            <span class="text-grey-7" style="font-size: 13px">Solo activos</span>
          </div>
          <template v-if="cargando">
            <q-skeleton v-for="n in 5" :key="n" type="rect" height="22px" class="q-my-sm" />
          </template>
          <div v-else-if="porCurso.length">
            <div v-for="c in porCurso" :key="c.id" class="bar-row">
              <div class="bar-row__name" :title="c.nombre">{{ c.nombre }}</div>
              <div class="bar-track"><div class="bar-fill" :style="{ width: `${(c.n / maxCurso) * 100}%` }" /></div>
              <div class="bar-row__n">{{ c.n }}</div>
            </div>
          </div>
          <div v-else class="empty">Todavía no hay aprendices asignados a cursos.</div>
        </div>
      </div>

      <div class="col-12 col-md-5">
        <div class="card fade-up q-pa-lg" style="animation-delay: 0.25s">
          <div class="row items-center q-mb-md">
            <h3 class="q-ma-none text-h6 text-weight-bold">Últimos registros</h3>
            <q-space />
            <q-btn flat dense no-caps color="primary" label="Ver todos" :to="{ name: 'aprendices' }" />
          </div>
          <template v-if="cargando">
            <q-skeleton v-for="n in 5" :key="n" type="rect" height="40px" class="q-my-sm" />
          </template>
          <div v-else-if="recientes.length" class="column q-gutter-y-md">
            <div v-for="a in recientes" :key="a._id" class="person">
              <div class="person__avatar">{{ iniciales(a.nombre) }}</div>
              <div class="col" style="min-width: 0">
                <div class="person__name ellipsis">{{ a.nombre }}</div>
                <div class="person__sub ellipsis">{{ a.curso?.nombre || "Sin curso" }}</div>
              </div>
            </div>
          </div>
          <div v-else class="empty">Aún no hay aprendices registrados.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { cursosService } from "../services/cursos.service";
import { aprendicesService } from "../services/aprendices.service";
import { apiError } from "../helpers/alerts";
import { iAdd, iAprendices, iArrow, iClock, iCursos, iCheck } from "../icons";

const auth = useAuthStore();
const cursos = ref([]);
const aprendices = ref([]);
const cargando = ref(true);

const nombrePila = computed(() => auth.nombrePila || "bienvenido");
const saludo = computed(() => {
  const h = new Date().getHours();
  return h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
});
const fechaHoy = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
const iniciales = (n = "") => n.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("");
const fmt = (n) => new Intl.NumberFormat("es-CO").format(n);

const cursosActivos = computed(() => cursos.value.filter((c) => c.status === 0));
const aprendicesActivos = computed(() => aprendices.value.filter((a) => a.status === 0));
const horas = computed(() => cursosActivos.value.reduce((t, c) => t + (c.duracion || 0), 0));

const stats = computed(() => [
  { label: "Cursos activos", value: cursosActivos.value.length, hint: `de ${cursos.value.length}`, icon: iCursos, tone: "" },
  { label: "Aprendices activos", value: aprendicesActivos.value.length, hint: `de ${aprendices.value.length}`, icon: iAprendices, tone: "stat__icon--sun" },
  { label: "Horas de formación", value: fmt(horas.value), icon: iClock, tone: "stat__icon--ink" },
  {
    label: "Promedio por curso",
    value: cursosActivos.value.length ? Math.round(aprendicesActivos.value.length / cursosActivos.value.length) : 0,
    icon: iCheck,
    tone: "",
  },
]);

const porCurso = computed(() => {
  const m = {};
  for (const a of aprendicesActivos.value) {
    if (!a.curso?._id) continue;
    m[a.curso._id] ??= { id: a.curso._id, nombre: a.curso.nombre, n: 0 };
    m[a.curso._id].n++;
  }
  return Object.values(m).sort((a, b) => b.n - a.n).slice(0, 6);
});
const maxCurso = computed(() => Math.max(1, ...porCurso.value.map((c) => c.n)));
const recientes = computed(() =>
  aprendices.value.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6)
);

onMounted(async () => {
  try {
    const [c, a] = await Promise.all([cursosService.listar(), aprendicesService.listar()]);
    cursos.value = c.data;
    aprendices.value = a.data;
  } catch (e) {
    if (e.response?.status !== 401) apiError(e, "No se pudo cargar el panel");
  } finally {
    cargando.value = false;
  }
});
</script>
