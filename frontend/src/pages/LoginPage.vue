<template>
  <div class="login">
    <AnimatedBackground />

    <div class="login__wrap">
      <section class="login__intro">
        <div class="login__logo"><BrandMark :size="30" /><span>Aulario</span></div>
        <h1>Cada curso,<br />cada aprendiz,<br /><em>en su lugar.</em></h1>
        <p>
          Administra la formación de tu centro: cursos, aprendices y equipo, en un solo
          panel claro y rápido.
        </p>
        <ul class="login__points">
          <li><q-icon :name="iCheck" size="18px" /> Cursos con control de estado</li>
          <li><q-icon :name="iCheck" size="18px" /> Aprendices vinculados a su curso</li>
          <li><q-icon :name="iCheck" size="18px" /> Acceso protegido con sesión segura</li>
        </ul>
      </section>

      <section class="login__card">
        <div class="eyebrow">Bienvenido de nuevo</div>
        <h2>Inicia sesión</h2>
        <p class="login__sub">Ingresa con tu correo institucional.</p>

        <form novalidate @submit.prevent="enviar">
          <q-input
            v-model="form.email"
            type="email"
            label="Correo electrónico"
            outlined
            dark
            dense
            autocomplete="username"
            :error="mal.email"
            hide-bottom-space
            class="login__field"
          >
            <template #prepend><q-icon :name="iMail" /></template>
          </q-input>

          <q-input
            v-model="form.password"
            :type="verClave ? 'text' : 'password'"
            label="Contraseña"
            outlined
            dark
            dense
            autocomplete="current-password"
            :error="mal.password"
            hide-bottom-space
            class="login__field"
          >
            <template #prepend><q-icon :name="iLock" /></template>
            <template #append>
              <q-icon
                :name="verClave ? iEyeOff : iEye"
                class="cursor-pointer"
                @click="verClave = !verClave"
              />
            </template>
          </q-input>

          <q-btn
            type="submit"
            unelevated
            no-caps
            class="login__submit"
            :loading="cargando"
            :icon-right="iArrow"
            label="Entrar al panel"
          />
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import AnimatedBackground from "../components/AnimatedBackground.vue";
import BrandMark from "../components/BrandMark.vue";
import { useAuthStore } from "../stores/auth";
import { apiError, toastOk, warning } from "../helpers/alerts";
import { iArrow, iCheck, iEye, iEyeOff, iLock, iMail } from "../icons";

const router = useRouter();
const auth = useAuthStore();

const form = reactive({ email: "", password: "" });
const mal = reactive({ email: false, password: false });
const verClave = ref(false);
const cargando = ref(false);

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

async function enviar() {
  const faltan = [];
  mal.email = !form.email.trim() || !emailOk(form.email.trim());
  mal.password = form.password.length < 6;
  if (!form.email.trim()) faltan.push("El correo es obligatorio");
  else if (mal.email) faltan.push("El correo no tiene un formato válido");
  if (!form.password) faltan.push("La contraseña es obligatoria");
  else if (mal.password) faltan.push("La contraseña debe tener minimo 6 caracteres");
  if (faltan.length) return warning("Revisa tus datos", faltan);

  cargando.value = true;
  try {
    await auth.login({ email: form.email.trim(), password: form.password });
    toastOk(`Hola, ${auth.nombrePila || "bienvenido"}`);
    router.replace({ name: "dashboard" });
  } catch (e) {
    apiError(e, "No pudimos iniciar sesión");
  } finally {
    cargando.value = false;
  }
}
</script>

<style scoped lang="scss">
.login { min-height: 100vh; position: relative; display: grid; place-items: center; padding: 24px; }
.login__wrap {
  position: relative; z-index: 1; width: min(1080px, 100%);
  display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 56px; align-items: center;
}
.login__intro { color: #d8eadf; animation: rise 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
.login__logo { display: flex; align-items: center; gap: 10px; font-family: var(--font-display); font-weight: 700; font-size: 24px; color: #fff; margin-bottom: 38px; letter-spacing: -0.03em; }
.login__intro h1 { font-size: clamp(38px, 5.2vw, 62px); line-height: 1.02; margin: 0 0 20px; color: #fff; font-weight: 700; }
.login__intro h1 em { font-style: normal; background: linear-gradient(90deg, var(--mint), var(--sun)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.login__intro p { max-width: 460px; font-size: 17px; line-height: 1.6; color: #a9c7b6; margin: 0 0 26px; }
.login__points { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; color: #bfd8c9; font-size: 15px; }
.login__points li { display: flex; align-items: center; gap: 10px; }
.login__points .q-icon { color: var(--mint); }

.login__card {
  background: rgba(12, 26, 21, 0.58); backdrop-filter: blur(22px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 26px; padding: 36px 34px;
  box-shadow: 0 40px 90px -30px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  color: #fff; animation: rise 0.8s 0.12s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
.login__card .eyebrow { color: var(--mint); }
.login__card h2 { margin: 0; font-size: 32px; font-weight: 700; }
.login__sub { color: #93b0a0; margin: 6px 0 24px; }
.login__field { margin-bottom: 14px; }
.login__submit {
  width: 100%; height: 50px; margin-top: 8px; border-radius: 14px; font-weight: 700; font-size: 15.5px;
  background: linear-gradient(135deg, #7be495, #3fbf70); color: #07210f;
  transition: transform 0.15s, box-shadow 0.2s; box-shadow: 0 12px 30px -12px rgba(123, 228, 149, 0.7);
  &:hover { transform: translateY(-1px); box-shadow: 0 16px 36px -12px rgba(123, 228, 149, 0.85); }
}
@keyframes rise { from { opacity: 0; transform: translateY(18px); } }

@media (max-width: 900px) {
  .login__wrap { grid-template-columns: 1fr; gap: 28px; max-width: 460px; }
  .login__intro { text-align: center; }
  .login__intro p, .login__points { display: none; }
  .login__logo { justify-content: center; margin-bottom: 18px; }
  .login__intro h1 { font-size: 34px; margin-bottom: 0; br { display: none; } }
  .login__card { padding: 28px 22px; }
}
</style>
