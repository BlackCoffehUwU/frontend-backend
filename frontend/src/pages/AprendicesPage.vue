<template>
  <div class="page">
    <div class="page-head fade-up">
      <div>
        <div class="eyebrow">Gestión</div>
        <h1>Aprendices</h1>
        <p>{{ aprendices.length }} registrados · {{ activos }} activos</p>
      </div>
      <q-btn unelevated no-caps color="secondary" class="btn-main" :icon="iAdd" label="Nuevo aprendiz" @click="abrir(null)" />
    </div>

    <div class="card fade-up" style="animation-delay: 0.05s">
      <div class="toolbar">
        <q-input v-model="buscar" outlined dense placeholder="Buscar nombre, documento o correo" clearable>
          <template #prepend><q-icon :name="iSearch" /></template>
        </q-input>
        <q-select
          v-model="cursoFiltro"
          :options="opcionesCurso"
          option-value="_id"
          option-label="nombre"
          emit-value
          map-options
          clearable
          outlined
          dense
          label="Todos los cursos"
          style="min-width: 240px; max-width: 320px"
          behavior="menu"
        >
          <template #prepend><q-icon :name="iCursos" /></template>
        </q-select>
        <div class="seg">
          <button v-for="f in filtros" :key="f.v" type="button" :class="{ on: ui.filtroAprendices === f.v }" @click="ui.filtroAprendices = f.v">{{ f.l }}</button>
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
        :rows-per-page-options="[8, 15, 30, 50]"
      >
        <template #body-cell-nombre="p">
          <q-td :props="p">
            <div class="person">
              <div class="person__avatar">{{ iniciales(p.row.nombre) }}</div>
              <div>
                <div class="person__name">{{ p.row.nombre }}</div>
                <div class="person__sub">{{ p.row.email }}</div>
              </div>
            </div>
          </q-td>
        </template>
        <template #body-cell-documento="p"><q-td :props="p"><span class="code-pill">{{ p.row.documento }}</span></q-td></template>
        <template #body-cell-curso="p">
          <q-td :props="p">{{ p.row.curso?.nombre || "Sin curso" }}</q-td>
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
            <div class="empty__icon"><q-icon :name="iAprendices" size="30px" /></div>
            <h3>{{ aprendices.length ? "Sin resultados" : "Aún no hay aprendices" }}</h3>
            <div>{{ aprendices.length ? "Prueba con otra búsqueda o filtro." : "Registra el primero para empezar." }}</div>
          </div>
        </template>
      </q-table>
    </div>

    <AprendizForm v-model="dialogo" :aprendiz="seleccion" :cursos="cursos" :curso-inicial="cursoFiltro || ''" @saved="cargar" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import AprendizForm from "../components/AprendizForm.vue";
import { aprendicesService } from "../services/aprendices.service";
import { cursosService } from "../services/cursos.service";
import { useUiStore } from "../stores/ui";
import { apiError, confirmar, toastOk } from "../helpers/alerts";
import { iAdd, iAprendices, iBlock, iCursos, iEdit, iPlay, iRefresh, iSearch } from "../icons";

const route = useRoute();
const ui = useUiStore();

const aprendices = ref([]);
const cursos = ref([]);
const cargando = ref(false);
const buscar = ref("");
const cursoFiltro = ref(route.query.curso || null); // viene de "Ver aprendices" en Cursos
const dialogo = ref(false);
const seleccion = ref(null);
const paginacion = ref({ page: 1, rowsPerPage: 8, sortBy: "nombre", descending: false });

const filtros = [
  { v: "todos", l: "Todos" },
  { v: "activos", l: "Activos" },
  { v: "inactivos", l: "Inactivos" },
];
const columnas = [
  { name: "nombre", label: "Aprendiz", field: "nombre", align: "left", sortable: true },
  { name: "documento", label: "Documento", field: "documento", align: "left", sortable: true },
  { name: "curso", label: "Curso", field: (r) => r.curso?.nombre || "", align: "left", sortable: true },
  { name: "status", label: "Estado", field: "status", align: "left", sortable: true },
  { name: "acciones", label: "", field: "acciones", align: "right" },
];

const opcionesCurso = computed(() => cursos.value.slice().sort((a, b) => a.nombre.localeCompare(b.nombre)));
const activos = computed(() => aprendices.value.filter((a) => a.status === 0).length);
const iniciales = (n = "") => n.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("");

const filas = computed(() => {
  const q = (buscar.value || "").toLowerCase().trim();
  return aprendices.value.filter((a) => {
    if (ui.filtroAprendices === "activos" && a.status !== 0) return false;
    if (ui.filtroAprendices === "inactivos" && a.status === 0) return false;
    if (cursoFiltro.value && a.curso?._id !== cursoFiltro.value) return false;
    return !q || a.nombre.toLowerCase().includes(q) || a.documento.includes(q) || a.email.toLowerCase().includes(q);
  });
});

async function cargar() {
  cargando.value = true;
  try {
    const [a, c] = await Promise.all([aprendicesService.listar(), cursosService.listar()]);
    aprendices.value = a.data;
    cursos.value = c.data;
  } catch (e) {
    if (e.response?.status !== 401) apiError(e, "No se pudieron cargar los aprendices");
  } finally {
    cargando.value = false;
  }
}

const abrir = (a) => { seleccion.value = a; dialogo.value = true; };

async function alternar(a) {
  const desactivar = a.status === 0;
  const ok = await confirmar({
    title: desactivar ? "¿Desactivar aprendiz?" : "¿Activar aprendiz?",
    text: desactivar ? `${a.nombre} quedará como inactivo.` : `${a.nombre} volverá a estar activo.`,
    confirmText: desactivar ? "Sí, desactivar" : "Sí, activar",
    icon: desactivar ? "warning" : "question",
    danger: desactivar,
  });
  if (!ok) return;
  try {
    const { data } = desactivar ? await aprendicesService.desactivar(a._id) : await aprendicesService.activar(a._id);
    toastOk(data.msg || (desactivar ? "Aprendiz desactivado" : "Aprendiz activado"));
    cargar();
  } catch (e) {
    apiError(e);
  }
}

onMounted(cargar);
</script>
