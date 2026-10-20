import api from "./api";

export const authService = {
  login: (data) => api.post("/usuarios/login", data),
  registrar: (data) => api.post("/usuarios/register", data),
};
