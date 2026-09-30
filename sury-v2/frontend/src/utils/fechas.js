const dos = (n) => String(n).padStart(2, "0");

export const hoyISO = () => new Date().toLocaleDateString("en-CA"); // AAAA-MM-DD en hora local
export const ahoraHHMM = () => { const d = new Date(); return `${dos(d.getHours())}:${dos(d.getMinutes())}`; };

export function aFecha(iso, hora = "00:00") {
  const [y, m, d] = iso.split("-").map(Number);
  const [hh, mm] = hora.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm);
}

export const formatoFecha = (iso) =>
  aFecha(iso).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });

export const formatoFechaCorta = (iso) =>
  aFecha(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short" });

export const formatoHora = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit", hour12: true });
};

export const diasHasta = (iso) => Math.round((aFecha(iso) - aFecha(hoyISO())) / 86400000);

export function textoDias(n) {
  if (n < 0) return "Ya pasó";
  if (n === 0) return "Hoy";
  if (n === 1) return "Mañana";
  return `En ${n} días`;
}

export function saludo() {
  const h = new Date().getHours();
  return h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
}
