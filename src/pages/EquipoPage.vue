<template>
  <div class="page">
    <div class="page-head fade-up">
      <div>
        <div class="eyebrow">Administración</div>
        <h1>Equipo</h1>
        <p>Crea cuentas para otras personas que gestionarán el panel.</p>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-7">
        <div class="card q-pa-lg fade-up" style="animation-delay: 0.05s">
          <h3 class="q-mt-none q-mb-xs text-h6 text-weight-bold">Nuevo usuario</h3>
          <p class="text-grey-7 q-mb-lg">Podrá iniciar sesión con el correo y la contraseña que definas aqui.</p>
          <form novalidate @submit.prevent="registrar">
            <q-input v-model="form.nombre" label="Nombre completo" outlined :error="mal.nombre" hide-bottom-space class="q-mb-md" :disable="guardando">
              <template #prepend><q-icon :name="iPerson" /></template>
            </q-input>
            <q-input v-model="form.email" type="email" label="Correo electrónico" outlined :error="mal.email" hide-bottom-space class="q-mb-md" :disable="guardando">
              <template #prepend><q-icon :name="iMail" /></template>
            </q-input>
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-sm-6">
                <q-input v-model="form.password" :type="ver ? 'text' : 'password'" label="Contraseña" outlined :error="mal.password" hide-bottom-space :disable="guardando">
                  <template #prepend><q-icon :name="iKey" /></template>
                  <template #append><q-icon :name="ver ? iEyeOff : iEye" class="cursor-pointer" @click="ver = !ver" /></template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model="form.confirmar" :type="ver ? 'text' : 'password'" label="Confirmar contraseña" outlined :error="mal.confirmar" hide-bottom-space :disable="guardando">
                  <template #prepend><q-icon :name="iLock" /></template>
                </q-input>
              </div>
            </div>
            <q-btn type="submit" unelevated no-caps color="secondary" class="btn-main" :icon="iPersonAdd" label="Crear usuario" :loading="guardando" />
          </form>
        </div>
      </div>

      <div class="col-12 col-md-5">
        <div class="card q-pa-lg fade-up" style="animation-delay: 0.1s">
          <div class="eyebrow">Tu sesión</div>
          <div class="person q-mt-md">
            <div class="person__avatar" style="width: 52px; height: 52px; font-size: 18px; border-radius: 16px">{{ auth.iniciales }}</div>
            <div style="min-width: 0">
              <div class="person__name" style="font-size: 18px">{{ auth.usuario?.nombre }}</div>
              <div class="person__sub ellipsis">{{ auth.usuario?.email }}</div>
            </div>
          </div>
          <q-separator class="q-my-lg" />
          <div class="row items-center q-gutter-x-sm">
            <q-icon :name="iAdmin" size="22px" color="primary" />
            <span class="text-weight-medium">Rol: {{ auth.usuario?.rol || "USER" }}</span>
          </div>
          <p class="text-grey-7 q-mt-md q-mb-none" style="font-size: 13.5px; line-height: 1.55">
            La sesión dura 4 horas. Al vencer, el sistema te devolverá al inicio de sesión automáticamente.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { authService } from "../services/auth.service";
import { apiError, toastOk, warning } from "../helpers/alerts";
import { iAdmin, iEye, iEyeOff, iKey, iLock, iMail, iPerson, iPersonAdd } from "../icons";

const auth = useAuthStore();
const form = reactive({ nombre: "", email: "", password: "", confirmar: "" });
const mal = reactive({ nombre: false, email: false, password: false, confirmar: false });
const ver = ref(false);
const guardando = ref(false);

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

async function registrar() {
  const faltan = [];
  mal.nombre = !form.nombre.trim();
  mal.email = !emailOk(form.email.trim());
  mal.password = form.password.length < 6;
  mal.confirmar = form.confirmar !== form.password || !form.confirmar;
  if (mal.nombre) faltan.push("El nombre es obligatorio");
  if (mal.email) faltan.push(form.email ? "El correo no es válido" : "El correo es obligatorio");
  if (mal.password) faltan.push("La contraseña debe tener minimo 6 caracteres");
  else if (mal.confirmar) faltan.push("Las contraseñas no coinciden");
  if (faltan.length) return warning("Revisa el formulario", faltan);

  guardando.value = true;
  try {
    const { data } = await authService.registrar({
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      password: form.password,
    });
    toastOk(data.msg || "Usuario creado");
    Object.assign(form, { nombre: "", email: "", password: "", confirmar: "" });
    Object.assign(mal, { nombre: false, email: false, password: false, confirmar: false });
  } catch (e) {
    apiError(e, "No se pudo crear el usuario");
  } finally {
    guardando.value = false;
  }
}
</script>
