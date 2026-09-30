import { aFecha } from "../utils/fechas";
import { nuevoId } from "../utils/id";

const enDias = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toLocaleDateString("en-CA"); };

// Datos de demostración (botón "Cargar datos de ejemplo"). No son recomendaciones médicas.
export function datosEjemplo() {
  const meds = [
    { id: nuevoId(), nombre: "Losartán", dosis: "50 mg", hora: "08:00" },
    { id: nuevoId(), nombre: "Metformina", dosis: "850 mg", hora: "13:00" },
    { id: nuevoId(), nombre: "Vitamina D", dosis: "1 cápsula", hora: "20:00" },
  ];
  const citas = [
    { id: nuevoId(), motivo: "Cardiología", fecha: enDias(2), hora: "10:00", lugar: "Clínica (ejemplo)", hecha: false },
    { id: nuevoId(), motivo: "Medicina general", fecha: enDias(12), hora: "15:30", lugar: "Centro de salud (ejemplo)", hecha: false },
  ];
  const base = [[-6, 128, 82], [-5, 132, 85], [-4, 125, 80], [-3, 130, 84], [-2, 127, 81], [-1, 124, 79]];
  const registros = base.map(([d, sys, dia], i) => {
    const fecha = enDias(d);
    return {
      id: nuevoId(), fecha, hora: "08:30", ts: aFecha(fecha, "08:30").getTime(),
      sys, dia, glucosa: 95 + i * 2, peso: null, animo: i % 3 === 0 ? 3 : 4, nota: "",
    };
  });
  return { meds, citas, registros };
}
