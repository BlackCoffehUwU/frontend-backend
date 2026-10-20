<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <q-card class="form-card">
      <q-card-section>
        <h2>{{ editando ? "Editar aprendiz" : "Nuevo aprendiz" }}</h2>
        <p class="sub">{{ editando ? "Actualiza los datos del aprendiz." : "Registra un aprendiz y asígnale un curso." }}</p>

        <form novalidate @submit.prevent="guardar">
          <q-input v-model="form.documento" label="Documento" outlined :error="mal.documento" hide-bottom-space class="q-mb-md" :disable="guardando">
            <template #prepend><q-icon :name="iBadge" /></template>
          </q-input>
          <q-input v-model="form.nombre" label="Nombre completo" outlined :error="mal.nombre" hide-bottom-space class="q-mb-md" :disable="guardando">
            <template #prepend><q-icon :name="iPerson" /></template>
          </q-input>
          <q-input v-model="form.email" type="email" label="Correo electrónico" outlined :error="mal.email" hide-bottom-space class="q-mb-md" :disable="guardando">
            <template #prepend><q-icon :name="iMail" /></template>
          </q-input>
          <q-select
            v-model="form.curso"
            :options="opciones"
            option-value="_id"
            option-label="etiqueta"
            emit-value
            map-options
            label="Curso"
            outlined
            :error="mal.curso"
            hide-bottom-space
            :disable="guardando"
            behavior="menu"
          >
            <template #prepend><q-icon :name="iCursos" /></template>
          </q-select>

          <div class="row justify-end q-gutter-sm q-mt-lg">
            <q-btn flat no-caps class="btn-main" label="Cancelar" :disable="guardando" @click="cerrar" />
            <q-btn type="submit" unelevated no-caps color="secondary" class="btn-main" :loading="guardando" :label="editando ? 'Guardar cambios' : 'Registrar aprendiz'" />
          </div>
        </form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { aprendicesService } from "../services/aprendices.service";
import { apiError, toastOk, warning } from "../helpers/alerts";
import { iBadge, iCursos, iMail, iPerson } from "../icons";

const props = defineProps({
  modelValue: Boolean,
  aprendiz: { type: Object, default: null },
  cursos: { type: Array, default: () => [] },
  cursoInicial: { type: String, default: "" },
});
const emit = defineEmits(["update:modelValue", "saved"]);

const form = reactive({ documento: "", nombre: "", email: "", curso: "" });
const mal = reactive({ documento: false, nombre: false, email: false, curso: false });
const guardando = ref(false);
const editando = computed(() => !!props.aprendiz);

// Solo cursos activos (y el actual del aprendiz, aunque este inactivo).
const opciones = computed(() =>
  props.cursos
    .filter((c) => c.status === 0 || c._id === form.curso)
    .map((c) => ({ ...c, etiqueta: `${c.nombre} · ${c.codigo}` }))
);

watch(
  () => props.modelValue,
  (abierto) => {
    if (!abierto) return;
    form.documento = props.aprendiz?.documento ?? "";
    form.nombre = props.aprendiz?.nombre ?? "";
    form.email = props.aprendiz?.email ?? "";
    form.curso = props.aprendiz?.curso?._id ?? props.cursoInicial ?? "";
    Object.assign(mal, { documento: false, nombre: false, email: false, curso: false });
  }
);

const cerrar = () => emit("update:modelValue", false);
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

async function guardar() {
  const faltan = [];
  mal.documento = !String(form.documento).trim();
  mal.nombre = !String(form.nombre).trim();
  mal.email = !emailOk(String(form.email).trim());
  mal.curso = !form.curso;
  if (mal.documento) faltan.push("El documento es obligatorio");
  if (mal.nombre) faltan.push("El nombre es obligatorio");
  if (mal.email) faltan.push(form.email ? "El correo no es válido" : "El correo es obligatorio");
  if (mal.curso) faltan.push("Selecciona un curso");
  if (faltan.length) return warning("Faltan datos", faltan);

  guardando.value = true;
  try {
    const body = {
      documento: String(form.documento).trim(),
      nombre: String(form.nombre).trim(),
      email: String(form.email).trim(),
      curso: form.curso,
    };
    const { data } = editando.value
      ? await aprendicesService.actualizar(props.aprendiz._id, body)
      : await aprendicesService.crear(body);
    toastOk(data.msg || "Aprendiz guardado");
    emit("saved");
    cerrar();
  } catch (e) {
    apiError(e, "No se pudo guardar el aprendiz");
  } finally {
    guardando.value = false;
  }
}
</script>
