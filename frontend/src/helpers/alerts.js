// Todas las alertas de la app pasan por aqui y usan SweetAlert2.
// No se usa alert(), confirm(), prompt() ni Notify/Dialog de Quasar.
import Swal from "sweetalert2";

const base = Swal.mixin({
  buttonsStyling: false,
  reverseButtons: true,
  heightAuto: false,
  customClass: {
    popup: "aula-swal",
    title: "aula-swal__title",
    htmlContainer: "aula-swal__text",
    confirmButton: "aula-swal__btn aula-swal__btn--ok",
    cancelButton: "aula-swal__btn aula-swal__btn--cancel",
    denyButton: "aula-swal__btn aula-swal__btn--danger",
  },
});

const toastBase = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2800,
  timerProgressBar: true,
  customClass: { popup: "aula-toast", title: "aula-toast__title" },
  didOpen: (el) => {
    el.addEventListener("mouseenter", Swal.stopTimer);
    el.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

/** Aviso corto y discreto (esquina superior derecha). */
export const toast = (icon, title) => toastBase.fire({ icon, title });
export const toastOk = (title) => toast("success", title);

/** Alerta de exito centrada. */
export const success = (title, text = "") =>
  base.fire({ icon: "success", title, text, confirmButtonText: "Listo" });

/** Alerta de error. `detalle` puede ser texto o un arreglo de mensajes. */
export const error = (title, detalle = "") => {
  const text = Array.isArray(detalle)
    ? detalle.map((d) => `• ${d}`).join("\n")
    : detalle;
  return base.fire({ icon: "error", title, text, confirmButtonText: "Entendido" });
};

/** Alerta de advertencia (por ejemplo, formulario incompleto). */
export const warning = (title, detalle = "") => {
  const text = Array.isArray(detalle)
    ? detalle.map((d) => `• ${d}`).join("\n")
    : detalle;
  return base.fire({ icon: "warning", title, text, confirmButtonText: "Revisar" });
};

/** Pregunta de confirmacion. Devuelve true / false. */
export const confirmar = async ({
  title,
  text = "",
  confirmText = "Sí, continuar",
  cancelText = "Cancelar",
  icon = "question",
  danger = false,
}) => {
  const r = await base.fire({
    icon,
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    focusCancel: danger,
    customClass: {
      popup: "aula-swal",
      title: "aula-swal__title",
      htmlContainer: "aula-swal__text",
      confirmButton: `aula-swal__btn ${danger ? "aula-swal__btn--danger" : "aula-swal__btn--ok"}`,
      cancelButton: "aula-swal__btn aula-swal__btn--cancel",
    },
  });
  return r.isConfirmed;
};

/**
 * Muestra el error que devuelve axios con el formato del backend:
 *  - 400 de validacion: { msg, errors: [..] }
 *  - otros:             { msg }
 *  - sin respuesta:     el servidor esta apagado o no hay conexión
 */
export const apiError = (e, titulo = "No se pudo completar la accion") => {
  if (!e.response) {
    return error(
      "Sin conexión con el servidor",
      "Verifica que el backend esté corriendo en el puerto 4500."
    );
  }
  const { msg, errors } = e.response.data || {};
  if (Array.isArray(errors) && errors.length) {
    return error(msg || titulo, errors.map((x) => x.msg || x));
  }
  return error(titulo, msg || "Ocurrió un error inesperado.");
};

export { Swal };
