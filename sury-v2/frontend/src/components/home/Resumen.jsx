import { useState } from "react";
import BotonEscuchar from "../BotonEscuchar";
import Imagen from "../Imagen";
import { IMAGENES } from "../../data/imagenes";
import { saludo, textoDias, diasHasta, formatoFecha, formatoHora } from "../../utils/fechas";
import { ANIMOS, clasificarPresion, ICONO_NIVEL } from "../../utils/salud";

const CONSEJOS = [
  "Bebe agua a lo largo del día, en pequeños sorbos.",
  "Levántate despacio de la cama o de la silla para evitar mareos.",
  "Camina unos diez minutos si tu médico te lo ha recomendado.",
  "Ten a la mano tu lista de medicamentos cuando vayas a una cita.",
  "Si olvidas una toma, no tomes doble dosis: consulta a tu médico o farmacéutico.",
];

export default function Resumen({ persona, meds, tomadas, proximaCita, ultimaPresion, ultimoAnimo, irA, textoResumen, cargarEjemplo }) {
  const [c, setC] = useState(0);
  const pct = meds.length ? Math.round((tomadas / meds.length) * 100) : 0;
  const vacio = !meds.length && !proximaCita && !ultimaPresion;
  const clas = ultimaPresion ? clasificarPresion(ultimaPresion.sys, ultimaPresion.dia) : null;
  const animo = ultimoAnimo ? ANIMOS[ultimoAnimo.animo - 1] : null;

  return (
    <div className="d-grid gap-4">
      {/* Bienvenida con imagen */}
      <div className="hero">
        <div className="p-4 d-grid gap-3 align-content-center">
          <h2 className="h3 m-0">{saludo()}, {persona.nombres} <span aria-hidden="true">👋</span></h2>
          <p className="m-0 fs-5">{textoResumen}</p>
          <div><BotonEscuchar texto={textoResumen} etiqueta="Escuchar mi resumen" /></div>
        </div>
        <Imagen {...IMAGENES.home} className="hero-img" />
      </div>

      {vacio && (
        <div className="sury-card d-grid gap-2">
          <h2 className="h4 m-0">Empecemos</h2>
          <p className="m-0">Aún no hay información en tu panel. Agrega tus medicamentos y citas, o mira cómo funciona con datos de ejemplo.</p>
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="btn-sury" onClick={() => irA("medicamentos")}>Agregar medicamentos</button>
            <button type="button" className="btn-sury-sec" onClick={cargarEjemplo}>Cargar datos de ejemplo</button>
          </div>
        </div>
      )}

      {/* Tarjetas de resumen (todas son botones que llevan a su sección) */}
      <div className="row g-3">
        <div className="col-md-6 col-xl-3">
          <button type="button" className="stat-card" onClick={() => irA("medicamentos")}>
            <span className="stat-ico" aria-hidden="true">💊</span>
            <span className="stat-tit">Medicamentos de hoy</span>
            <span className="stat-val">{meds.length ? `${tomadas} de ${meds.length}` : "Sin datos"}</span>
            <span className="progress-sury" role="progressbar" aria-label="Medicamentos tomados hoy"
              aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
              <span style={{ width: `${pct}%` }} />
            </span>
            <span className="stat-pie">Ver medicamentos →</span>
          </button>
        </div>

        <div className="col-md-6 col-xl-3">
          <button type="button" className="stat-card" onClick={() => irA("citas")}>
            <span className="stat-ico" aria-hidden="true">📅</span>
            <span className="stat-tit">Próxima cita</span>
            <span className="stat-val">{proximaCita ? textoDias(diasHasta(proximaCita.fecha)) : "Sin citas"}</span>
            {proximaCita && (
              <span>{proximaCita.motivo}<br />{formatoFecha(proximaCita.fecha)}, {formatoHora(proximaCita.hora)}</span>
            )}
            <span className="stat-pie">Ver citas →</span>
          </button>
        </div>

        <div className="col-md-6 col-xl-3">
          <button type="button" className="stat-card" onClick={() => irA("seguimiento")}>
            <span className="stat-ico" aria-hidden="true">❤️</span>
            <span className="stat-tit">Última presión</span>
            <span className="stat-val">{ultimaPresion ? `${ultimaPresion.sys}/${ultimaPresion.dia}` : "Sin datos"}</span>
            {clas && <span className={`badge-sury ${clas.nivel}`}>{ICONO_NIVEL[clas.nivel]} {clas.corto}</span>}
            <span className="stat-pie">Ver seguimiento →</span>
          </button>
        </div>

        <div className="col-md-6 col-xl-3">
          <button type="button" className="stat-card" onClick={() => irA("seguimiento")}>
            <span className="stat-ico" aria-hidden="true">{animo ? animo.e : "🙂"}</span>
            <span className="stat-tit">Cómo te sientes</span>
            <span className="stat-val">{animo ? animo.t : "Sin datos"}</span>
            <span className="stat-pie">Registrar ánimo →</span>
          </button>
        </div>
      </div>

      {/* Consejo interactivo */}
      <div className="sury-card d-grid gap-3">
        <h2 className="h4 m-0">Consejo del día <span aria-hidden="true">💡</span></h2>
        <p className="fs-5 m-0" aria-live="polite">{CONSEJOS[c]}</p>
        <div className="d-flex flex-wrap gap-2">
          <button type="button" className="btn-sury-sec" onClick={() => setC((c + 1) % CONSEJOS.length)}>Otro consejo</button>
          <BotonEscuchar texto={CONSEJOS[c]} etiqueta="Escuchar consejo" />
        </div>
      </div>
    </div>
  );
}
