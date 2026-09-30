import { useState } from "react";
import { useAccesibilidad } from "../../context/AccesibilidadContext";
import BotonEscuchar from "../BotonEscuchar";
import Imagen from "../Imagen";
import { IMAGENES } from "../../data/imagenes";
import { AUDIOS } from "../../data/audios";
import { aFecha, diasHasta, formatoFecha, formatoHora, hoyISO, textoDias } from "../../utils/fechas";
import { nuevoId } from "../../utils/id";

const vacio = { motivo: "", fecha: "", hora: "09:00", lugar: "" };

export default function Citas({ citas, setCitas }) {
  const { hablar, anunciar } = useAccesibilidad();
  const [f, setF] = useState(vacio);
  const [errores, setErrores] = useState([]);

  const ordenadas = [...citas].sort((a, b) => aFecha(a.fecha, a.hora) - aFecha(b.fecha, b.hora));

  const agregar = (e) => {
    e.preventDefault();
    const errs = [];
    if (!f.motivo.trim()) errs.push("Escribe con quién o para qué es la cita.");
    if (!f.fecha) errs.push("Elige la fecha de la cita.");
    else if (f.fecha < hoyISO()) errs.push("La fecha no puede ser anterior a hoy.");
    if (errs.length) { setErrores(errs); hablar(errs[0]); return; }
    setCitas([...citas, { id: nuevoId(), motivo: f.motivo.trim(), fecha: f.fecha, hora: f.hora, lugar: f.lugar.trim(), hecha: false }]);
    anunciar("Cita agendada");
    hablar("Cita agendada.");
    setF(vacio);
    setErrores([]);
  };

  const alternar = (c) => {
    setCitas(citas.map((x) => (x.id === c.id ? { ...x, hecha: !x.hecha } : x)));
    anunciar(c.hecha ? "Cita marcada como pendiente" : "Cita marcada como asistida");
  };

  const quitar = (c) => {
    if (window.confirm(`¿Eliminar la cita de ${c.motivo}?`)) {
      setCitas(citas.filter((x) => x.id !== c.id));
      anunciar("Cita eliminada");
    }
  };

  return (
    <div className="d-grid gap-4">
      <div className="sury-card">
        <Imagen {...IMAGENES.citas} className="banner-img" />
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h2 className="h3 m-0">Mis citas médicas</h2>
          <BotonEscuchar texto={AUDIOS.citas} etiqueta="Escuchar ayuda" />
        </div>
      </div>

      {ordenadas.length === 0 ? (
        <p className="sury-card fs-5 m-0">No tienes citas. Agenda la primera con el formulario de abajo.</p>
      ) : (
        <ul className="list-unstyled d-grid gap-3 m-0">
          {ordenadas.map((c) => {
            const d = diasHasta(c.fecha);
            const pasada = d < 0 && !c.hecha;
            return (
              <li key={c.id} className={`item ${c.hecha ? "hecho" : ""}`}>
                <div>
                  <strong className="fs-4">{c.motivo}</strong>
                  <div><span aria-hidden="true">📅</span> {formatoFecha(c.fecha)}, {formatoHora(c.hora)}</div>
                  {c.lugar && <div><span aria-hidden="true">📍</span> {c.lugar}</div>}
                  <span className={`badge-sury mt-1 ${c.hecha ? "ok" : pasada ? "error" : d <= 1 ? "aviso" : "info"}`}>
                    {c.hecha ? "✔ Asistida" : pasada ? "❗ Ya pasó" : `⏳ ${textoDias(d)}`}
                  </span>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <button type="button" className={c.hecha ? "btn-sury" : "btn-sury-sec"} aria-pressed={c.hecha}
                    aria-label={`Asistí a la cita de ${c.motivo}`} onClick={() => alternar(c)}>
                    {c.hecha ? "✔ Asistí" : "Marcar: asistí"}
                  </button>
                  <button type="button" className="btn-sury-sec" aria-label={`Escuchar cita de ${c.motivo}`}
                    onClick={() => hablar(`${c.motivo}. ${textoDias(d)}, ${formatoFecha(c.fecha)}, a las ${formatoHora(c.hora)}.${c.lugar ? ` Lugar: ${c.lugar}.` : ""}`)}>
                    <span aria-hidden="true">🔊</span>
                  </button>
                  <button type="button" className="btn-sury-sec" aria-label={`Eliminar cita de ${c.motivo}`} onClick={() => quitar(c)}>
                    <span aria-hidden="true">🗑</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form className="sury-card d-grid gap-3" onSubmit={agregar} noValidate>
        <h3 className="h4 m-0">Agendar cita</h3>
        {errores.length > 0 && (
          <div role="alert" className="mensaje error">
            <ul className="mb-0">{errores.map((e) => <li key={e}>❗ {e}</li>)}</ul>
          </div>
        )}
        <div>
          <label htmlFor="cita-motivo" className="form-label">Especialidad o médico *</label>
          <input id="cita-motivo" className="form-control" placeholder="Ej.: Cardiología" value={f.motivo}
            onChange={(e) => setF({ ...f, motivo: e.target.value })} />
        </div>
        <div className="row g-3">
          <div className="col-sm-7">
            <label htmlFor="cita-fecha" className="form-label">Fecha *</label>
            <input id="cita-fecha" type="date" min={hoyISO()} className="form-control" value={f.fecha}
              onChange={(e) => setF({ ...f, fecha: e.target.value })} />
          </div>
          <div className="col-sm-5">
            <label htmlFor="cita-hora" className="form-label">Hora</label>
            <input id="cita-hora" type="time" className="form-control" value={f.hora}
              onChange={(e) => setF({ ...f, hora: e.target.value })} />
          </div>
        </div>
        <div>
          <label htmlFor="cita-lugar" className="form-label">Lugar (opcional)</label>
          <input id="cita-lugar" className="form-control" value={f.lugar}
            onChange={(e) => setF({ ...f, lugar: e.target.value })} />
        </div>
        <button type="submit" className="btn-sury">Agendar cita</button>
      </form>
    </div>
  );
}
