export const ANIMOS = [
  { v: 1, e: "😞", t: "Muy mal" },
  { v: 2, e: "😕", t: "Mal" },
  { v: 3, e: "😐", t: "Regular" },
  { v: 4, e: "🙂", t: "Bien" },
  { v: 5, e: "😄", t: "Muy bien" },
];

// Clasificación informativa. No reemplaza el criterio de un profesional de la salud.
export function clasificarPresion(sys, dia) {
  if (sys >= 180 || dia >= 120) return { nivel: "error", corto: "Muy alta", texto: "Muy alta: busca atención médica de inmediato" };
  if (sys >= 140 || dia >= 90) return { nivel: "error", corto: "Alta", texto: "Alta: consulta a tu médico pronto" };
  if (sys >= 120 || dia >= 80) return { nivel: "aviso", corto: "Elevada", texto: "Un poco elevada: coméntalo en tu próxima cita" };
  return { nivel: "ok", corto: "Normal", texto: "Dentro de lo esperado" };
}

export const ICONO_NIVEL = { ok: "✔", aviso: "⚠", error: "❗" };
