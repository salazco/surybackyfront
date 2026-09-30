import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { obtenerPersona, cerrarSesion } from "../utils/sesion";
import { useAccesibilidad } from "../context/AccesibilidadContext";
import useAlmacen from "../hooks/useAlmacen";
import { AUDIOS } from "../data/audios";
import { datosEjemplo } from "../data/ejemplo";
import { aFecha, hoyISO, saludo, textoDias, diasHasta, formatoHora } from "../utils/fechas";
import Resumen from "../components/home/Resumen";
import Medicamentos from "../components/home/Medicamentos";
import Citas from "../components/home/Citas";
import Seguimiento from "../components/home/Seguimiento";
import Ayuda from "../components/home/Ayuda";

const SECCIONES = [
  { id: "resumen", label: "Resumen", icono: "🏠" },
  { id: "medicamentos", label: "Medicamentos", icono: "💊" },
  { id: "citas", label: "Citas", icono: "📅" },
  { id: "seguimiento", label: "Seguimiento", icono: "❤️" },
  { id: "ayuda", label: "Ayuda", icono: "🙋" },
];

export default function Home() {
  const persona = obtenerPersona();
  if (!persona) return <Navigate to="/registro" replace />; // sin registro no hay panel
  return <Panel persona={persona} />;
}

function Panel({ persona }) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { hablar, lecturaAuto, anunciar } = useAccesibilidad();

  const clave = (s) => `sury_${persona.id}_${s}`;
  const [meds, setMeds] = useAlmacen(clave("meds"), []);
  const [tomas, setTomas] = useAlmacen(clave("tomas"), {});
  const [citas, setCitas] = useAlmacen(clave("citas"), []);
  const [registros, setRegistros] = useAlmacen(clave("registros"), []);
  const [bienvenida, setBienvenida] = useState(!!state?.registroExitoso);

  const hoy = hoyISO();
  const pedida = params.get("seccion");
  const seccion = SECCIONES.some((s) => s.id === pedida) ? pedida : "resumen";
  const irA = (id) => setParams({ seccion: id });

  // ---- Datos derivados para el resumen ----
  const tomasHoy = tomas[hoy] || [];
  const idsMeds = new Set(meds.map((m) => m.id));
  const tomadas = tomasHoy.filter((id) => idsMeds.has(id)).length;
  const toggleToma = (id) =>
    setTomas({ ...tomas, [hoy]: tomasHoy.includes(id) ? tomasHoy.filter((x) => x !== id) : [...tomasHoy, id] });

  const ahora = new Date();
  const proximaCita = citas
    .filter((c) => !c.hecha && aFecha(c.fecha, c.hora) >= ahora)
    .sort((a, b) => aFecha(a.fecha, a.hora) - aFecha(b.fecha, b.hora))[0];
  const ordenR = [...registros].sort((a, b) => b.ts - a.ts);
  const ultimaPresion = ordenR.find((r) => r.sys && r.dia);
  const ultimoAnimo = ordenR.find((r) => r.animo);

  const textoResumen = () => {
    const partes = [`${saludo()}, ${persona.nombres}.`];
    partes.push(meds.length
      ? `Hoy has tomado ${tomadas} de ${meds.length} medicamentos.`
      : "Aún no has agregado medicamentos.");
    partes.push(proximaCita
      ? `Tu próxima cita es ${textoDias(diasHasta(proximaCita.fecha)).toLowerCase()}, ${proximaCita.motivo}, a las ${formatoHora(proximaCita.hora)}.`
      : "No tienes citas próximas.");
    if (ultimaPresion) partes.push(`Tu última presión fue ${ultimaPresion.sys} sobre ${ultimaPresion.dia}.`);
    return partes.join(" ");
  };

  const cargarEjemplo = () => {
    const d = datosEjemplo();
    setMeds(d.meds); setCitas(d.citas); setRegistros(d.registros); setTomas({});
    anunciar("Datos de ejemplo cargados");
    hablar("Datos de ejemplo cargados.");
  };

  const salir = () => { cerrarSesion(); navigate("/registro", { replace: true }); };

  // ---- Audio/anuncio al cambiar de sección ----
  const anterior = useRef(seccion);
  useEffect(() => {
    document.title = `${SECCIONES.find((s) => s.id === seccion).label} | SURY`;
    if (anterior.current === seccion) return;
    anterior.current = seccion;
    anunciar(`Sección ${SECCIONES.find((s) => s.id === seccion).label}`);
    if (lecturaAuto) hablar(AUDIOS[seccion]);
  });

  // Comando de voz "leer"
  useEffect(() => {
    const leer = () => hablar(seccion === "resumen" ? `${AUDIOS.resumen} ${textoResumen()}` : AUDIOS[seccion]);
    window.addEventListener("sury:leer", leer);
    return () => window.removeEventListener("sury:leer", leer);
  });

  // Teclado: flechas para moverse entre pestañas
  const onKeyTabs = (e) => {
    const i = SECCIONES.findIndex((s) => s.id === seccion);
    const n = SECCIONES.length;
    let destino = null;
    if (e.key === "ArrowRight") destino = (i + 1) % n;
    if (e.key === "ArrowLeft") destino = (i - 1 + n) % n;
    if (e.key === "Home") destino = 0;
    if (e.key === "End") destino = n - 1;
    if (destino !== null) {
      e.preventDefault();
      irA(SECCIONES[destino].id);
      document.getElementById(`tab-${SECCIONES[destino].id}`)?.focus();
    }
  };

  return (
    <div className="container py-4">
      {bienvenida && (
        <div role="status" className="mensaje ok d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <span>✔ ¡Registro completado! Bienvenido(a), {persona.nombres}.</span>
          <button type="button" className="btn-sury-sec" onClick={() => setBienvenida(false)}>Cerrar aviso</button>
        </div>
      )}

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h2 m-0">Panel de {persona.nombres} {persona.apellidos}</h1>
        <button type="button" className="btn-sury-sec" onClick={salir}>Salir</button>
      </div>

      <div className="tabs-sury" role="tablist" aria-label="Secciones de tu panel" onKeyDown={onKeyTabs}>
        {SECCIONES.map((s) => (
          <button key={s.id} id={`tab-${s.id}`} type="button" role="tab"
            aria-selected={seccion === s.id} aria-controls={`panel-${s.id}`}
            tabIndex={seccion === s.id ? 0 : -1} className="tab-sury" onClick={() => irA(s.id)}>
            <span className="ico" aria-hidden="true">{s.icono}</span>
            {s.label}
          </button>
        ))}
      </div>

      <section id={`panel-${seccion}`} role="tabpanel" aria-labelledby={`tab-${seccion}`} tabIndex={0}>
        {seccion === "resumen" && (
          <Resumen persona={persona} meds={meds} tomadas={tomadas} proximaCita={proximaCita}
            ultimaPresion={ultimaPresion} ultimoAnimo={ultimoAnimo} irA={irA}
            textoResumen={textoResumen()} cargarEjemplo={cargarEjemplo} />
        )}
        {seccion === "medicamentos" && (
          <Medicamentos meds={meds} setMeds={setMeds} tomasHoy={tomasHoy} toggleToma={toggleToma} />
        )}
        {seccion === "citas" && <Citas citas={citas} setCitas={setCitas} />}
        {seccion === "seguimiento" && <Seguimiento registros={registros} setRegistros={setRegistros} />}
        {seccion === "ayuda" && <Ayuda />}
      </section>
    </div>
  );
}
