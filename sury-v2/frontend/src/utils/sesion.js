// Guarda solo lo mínimo de la persona registrada en este dispositivo.
const K = "sury_persona";

export const guardarPersona = (p) => {
  try { localStorage.setItem(K, JSON.stringify(p)); } catch {}
};
export const obtenerPersona = () => {
  try { return JSON.parse(localStorage.getItem(K)); } catch { return null; }
};
export const cerrarSesion = () => {
  try { localStorage.removeItem(K); } catch {}
};
