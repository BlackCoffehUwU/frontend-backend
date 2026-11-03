# Frontend · Aulario (Cursos y Aprendices)

Vue 3 + Quasar + Vue Router + Pinia (con `pinia-plugin-persistedstate`) + Axios.
Todas las alertas usan **SweetAlert2** (no hay `alert()`, `confirm()` ni Notify de Quasar).

## Cómo correrlo

```bash
# 1) Backend (carpeta /backend)
npm install
cp .env.example .env     # Windows: copy .env.example .env
npm run seed             # crea admin@sena.edu.co / 123456 y datos de ejemplo
npm run dev              # http://localhost:4500

# 2) Frontend (esta carpeta)
npm install
npm run dev              # http://localhost:5173
```

axios usa automáticamente el mismo host con el que abres la página (puerto 4500), así funciona con cualquier IP de la red. Solo si el backend está en otra máquina, define `VITE_API_URL` en `.env`.

## Estructura

```
src/
├── main.js              Quasar + Pinia (persistedstate) + Router
├── icons.js             Iconos Material Symbols usados
├── css/                 variables de Quasar y estilos globales
├── router/              rutas + guard de autenticación (modo hash)
├── stores/              auth.js (token + usuario) y ui.js (filtros), ambos persistidos
├── services/            api.js (axios + interceptores) y un servicio por modelo
├── helpers/alerts.js    todas las alertas con SweetAlert2
├── layouts/             MainLayout (menú lateral)
├── components/          AnimatedBackground, CursoForm, AprendizForm, BrandMark
└── pages/               Login, Dashboard, Cursos, Aprendices, Equipo
```

## Notas

- El token viaja en la cabecera `x-token`; si el backend responde `401` se cierra la sesión y se vuelve al login.
- Los errores de validación del backend (`errors[]`) se muestran listados en una alerta de SweetAlert.
- Borrado lógico: desde las tablas se activa o desactiva (no se elimina nada).
