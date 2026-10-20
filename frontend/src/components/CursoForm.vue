<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <q-card class="form-card">
      <q-card-section>
        <h2>{{ editando ? "Editar curso" : "Nuevo curso" }}</h2>
        <p class="sub">{{ editando ? "Actualiza los datos del curso." : "Registra un curso de formación." }}</p>

        <form novalidate @submit.prevent="guardar">
          <q-input v-model="form.codigo" label="Código de ficha" outlined :error="mal.codigo" hide-bottom-space class="q-mb-md" :disable="guardando">
            <template #prepend><q-icon :name="iTag" /></template>
          </q-input>
          <q-input v-model="form.nombre" label="Nombre del curso" outlined :error="mal.nombre" hide-bottom-space class="q-mb-md" :disable="guardando">
            <template #prepend><q-icon :name="iBook" /></template>
          </q-input>
          <q-input v-model.number="form.duracion" type="number" min="1" label="Duración (horas)" outlined :error="mal.duracion" hide-bottom-space :disable="guardando">
            <template #prepend><q-icon :name="iClock" /></template>
          </q-input>

          <div class="row justify-end q-gutter-sm q-mt-lg">
            <q-btn flat no-caps class="btn-main" label="Cancelar" :disable="guardando" @click="cerrar" />
            <q-btn type="submit" unelevated no-caps color="secondary" class="btn-main" :loading="guardando" :label="editando ? 'Guardar cambios' : 'Crear curso'" />
          </div>
        </form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { cursosService } from "../services/cursos.service";
import { apiError, toastOk, warning } from "../helpers/alerts";
import { iBook, iClock, iTag } from "../icons";

const props = defineProps({ modelValue: Boolean, curso: { type: Object, default: null } });
const emit = defineEmits(["update:modelValue", "saved"]);

const form = reactive({ codigo: "", nombre: "", duracion: null });
const mal = reactive({ codigo: false, nombre: false, duracion: false });
const guardando = ref(false);
const editando = computed(() => !!props.curso);

watch(
  () => props.modelValue,
  (abierto) => {
    if (!abierto) return;
    form.codigo = props.curso?.codigo ?? "";
    form.nombre = props.curso?.nombre ?? "";
    form.duracion = props.curso?.duracion ?? null;
    Object.assign(mal, { codigo: false, nombre: false, duracion: false });
  }
);

const cerrar = () => emit("update:modelValue", false);

async function guardar() {
  const faltan = [];
  mal.codigo = !String(form.codigo).trim();
  mal.nombre = !String(form.nombre).trim();
  mal.duracion = !(Number(form.duracion) > 0);
  if (mal.codigo) faltan.push("El código es obligatorio");
  if (mal.nombre) faltan.push("El nombre es obligatorio");
  if (mal.duracion) faltan.push("La duración debe ser un número de horas mayor a 0");
  if (faltan.length) return warning("Faltan datos", faltan);

  guardando.value = true;
  try {
    const body = { codigo: String(form.codigo).trim(), nombre: String(form.nombre).trim(), duracion: Number(form.duracion) };
    const { data } = editando.value
      ? await cursosService.actualizar(props.curso._id, body)
      : await cursosService.crear(body);
    toastOk(data.msg || "Curso guardado");
    emit("saved");
    cerrar();
  } catch (e) {
    apiError(e, "No se pudo guardar el curso");
  } finally {
    guardando.value = false;
  }
}
</script>
