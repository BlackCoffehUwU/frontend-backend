<template>
  <div class="page">
    <div class="page-head fade-up">
      <div>
        <div class="eyebrow">Gestión</div>
        <h1>Cursos</h1>
        <p>{{ cursos.length }} registrados · {{ activos }} activos</p>
      </div>
      <q-btn unelevated no-caps color="secondary" class="btn-main" :icon="iAdd" label="Nuevo curso" @click="abrir(null)" />
    </div>

    <div class="card fade-up" style="animation-delay: 0.05s">
      <div class="toolbar">
        <q-input v-model="buscar" outlined dense placeholder="Buscar por código o nombre" clearable>
          <template #prepend><q-icon :name="iSearch" /></template>
        </q-input>
        <div class="seg">
          <button v-for="f in filtros" :key="f.v" type="button" :class="{ on: ui.filtroCursos === f.v }" @click="ui.filtroCursos = f.v">{{ f.l }}</button>
        </div>
        <q-space />
        <q-btn flat round dense :icon="iRefresh" color="grey-7" :loading="cargando" @click="cargar"><q-tooltip>Actualizar</q-tooltip></q-btn>
      </div>

      <q-table
        class="aula-table"
        flat
        :rows="filas"
        :columns="columnas"
        row-key="_id"
        :loading="cargando"
        v-model:pagination="paginacion"
        :rows-per-page-options="[8, 15, 30]"
      >
        <template #body-cell-codigo="p"><q-td :props="p"><span class="code-pill">{{ p.row.codigo }}</span></q-td></template>
        <template #body-cell-nombre="p">
          <q-td :props="p"><div class="person__name">{{ p.row.nombre }}</div></q-td>
        </template>
        <template #body-cell-duracion="p"><q-td :props="p">{{ fmt(p.row.duracion) }} h</q-td></template>
        <template #body-cell-aprendices="p">
          <q-td :props="p">
            <q-btn flat dense no-caps :icon-right="iArrow" :label="String(conteo[p.row._id] || 0)" color="primary" @click="verAprendices(p.row)">
              <q-tooltip>Ver aprendices del curso</q-tooltip>
            </q-btn>
          </q-td>
        </template>
        <template #body-cell-status="p">
          <q-td :props="p"><span class="badge" :class="p.row.status === 0 ? 'badge--on' : 'badge--off'">{{ p.row.status === 0 ? "Activo" : "Inactivo" }}</span></q-td>
        </template>
        <template #body-cell-acciones="p">
          <q-td :props="p" class="row-actions">
            <q-btn flat round dense :icon="iEdit" @click="abrir(p.row)"><q-tooltip>Editar</q-tooltip></q-btn>
            <q-btn flat round dense :icon="p.row.status === 0 ? iBlock : iPlay" @click="alternar(p.row)">
              <q-tooltip>{{ p.row.status === 0 ? "Desactivar" : "Activar" }}</q-tooltip>
            </q-btn>
          </q-td>
        </template>
        <template #no-data>
          <div class="empty full-width">
            <div class="empty__icon"><q-icon :name="iCursos" size="30px" /></div>
            <h3>{{ cursos.length ? "Sin resultados" : "Aún no hay cursos" }}</h3>
            <div>{{ cursos.length ? "Prueba con otra búsqueda o filtro." : "Crea el primero para empezar." }}</div>
          </div>
        </template>
      </q-table>
    </div>

    <CursoForm v-model="dialogo" :curso="seleccion" @saved="cargar" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import CursoForm from "../components/CursoForm.vue";
import { cursosService } from "../services/cursos.service";
import { aprendicesService } from "../services/aprendices.service";
import { useUiStore } from "../stores/ui";
import { apiError, confirmar, toastOk } from "../helpers/alerts";
import { iAdd, iArrow, iBlock, iCursos, iEdit, iPlay, iRefresh, iSearch } from "../icons";

const router = useRouter();
const ui = useUiStore();

const cursos = ref([]);
const conteo = ref({});
const cargando = ref(false);
const buscar = ref("");
const dialogo = ref(false);
const seleccion = ref(null);
const paginacion = ref({ page: 1, rowsPerPage: 8, sortBy: "nombre", descending: false });

const filtros = [
  { v: "todos", l: "Todos" },
  { v: "activos", l: "Activos" },
  { v: "inactivos", l: "Inactivos" },
];
const columnas = [
  { name: "codigo", label: "Código", field: "codigo", align: "left", sortable: true },
  { name: "nombre", label: "Curso", field: "nombre", align: "left", sortable: true },
  { name: "duracion", label: "Duración", field: "duracion", align: "left", sortable: true },
  { name: "aprendices", label: "Aprendices", field: (r) => conteo.value[r._id] || 0, align: "left", sortable: true },
  { name: "status", label: "Estado", field: "status", align: "left", sortable: true },
  { name: "acciones", label: "", field: "acciones", align: "right" },
];

const fmt = (n) => new Intl.NumberFormat("es-CO").format(n);
const activos = computed(() => cursos.value.filter((c) => c.status === 0).length);

const filas = computed(() => {
  const q = (buscar.value || "").toLowerCase().trim();
  return cursos.value.filter((c) => {
    if (ui.filtroCursos === "activos" && c.status !== 0) return false;
    if (ui.filtroCursos === "inactivos" && c.status === 0) return false;
    return !q || c.codigo.toLowerCase().includes(q) || c.nombre.toLowerCase().includes(q);
  });
});

async function cargar() {
  cargando.value = true;
  try {
    const [c, a] = await Promise.all([cursosService.listar(), aprendicesService.listar()]);
    cursos.value = c.data;
    const mapa = {};
    for (const ap of a.data) if (ap.status === 0 && ap.curso?._id) mapa[ap.curso._id] = (mapa[ap.curso._id] || 0) + 1;
    conteo.value = mapa;
  } catch (e) {
    if (e.response?.status !== 401) apiError(e, "No se pudieron cargar los cursos");
  } finally {
    cargando.value = false;
  }
}

const abrir = (curso) => { seleccion.value = curso; dialogo.value = true; };
const verAprendices = (c) => router.push({ name: "aprendices", query: { curso: c._id } });

async function alternar(c) {
  const desactivar = c.status === 0;
  const ok = await confirmar({
    title: desactivar ? "¿Desactivar curso?" : "¿Activar curso?",
    text: desactivar
      ? `"${c.nombre}" dejará de estar disponible para nuevos aprendices.`
      : `"${c.nombre}" volverá a estar disponible.`,
    confirmText: desactivar ? "Sí, desactivar" : "Sí, activar",
    icon: desactivar ? "warning" : "question",
    danger: desactivar,
  });
  if (!ok) return;
  try {
    const { data } = desactivar ? await cursosService.desactivar(c._id) : await cursosService.activar(c._id);
    toastOk(data.msg || (desactivar ? "Curso desactivado" : "Curso activado"));
    cargar();
  } catch (e) {
    apiError(e);
  }
}

onMounted(cargar);
</script>
