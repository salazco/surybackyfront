import { useState } from "react";
import { useAccesibilidad } from "../../context/AccesibilidadContext";
import BotonEscuchar from "../BotonEscuchar";
import Imagen from "../Imagen";
import { IMAGENES } from "../../data/imagenes";
import { AUDIOS } from "../../data/audios";
import { formatoHora } from "../../utils/fechas";
import { nuevoId } from "../../utils/id";

export default function Medicamentos({ meds, setMeds, tomasHoy, toggleToma }) {
  const { hablar, anunciar } = useAccesibilidad();
  const [f, setF] = useState({ nombre: "", dosis: "", hora: "08:00" });
  const [err, setErr] = useState("");

  const ordenados = [...meds].sort((a, b) => a.hora.localeCompare(b.hora));
  const tomadas = meds.filter((m) => tomasHoy.includes(m.id)).length;
  const pct = meds.length ? Math.round((tomadas / meds.length) * 100) : 0;

  const agregar = (e) => {
    e.preventDefault();
    if (!f.nombre.trim()) {
      setErr("Escribe el nombre del medicamento.");
      hablar("Escribe el nombre del medicamento.");
      document.getElementById("med-nombre")?.focus();
      return;
    }
    setMeds([...meds, { id: nuevoId(), nombre: f.nombre.trim(), dosis: f.dosis.trim(), hora: f.hora }]);
    anunciar(`Medicamento ${f.nombre.trim()} agregado`);
    hablar("Medicamento agregado.");
    setF({ nombre: "", dosis: "", hora: "08:00" });
    setErr("");
  };

  const marcar = (m) => {
    const ya = tomasHoy.includes(m.id);
    toggleToma(m.id);
    const msg = ya ? `${m.nombre} desmarcado` : `${m.nombre} marcado como tomado`;
    anunciar(msg);
    if (!ya) hablar("Muy bien. Medicamento tomado.");
  };

  const quitar = (m) => {
    if (window.confirm(`¿Quitar ${m.nombre} de tu lista?`)) {
      setMeds(meds.filter((x) => x.id !== m.id));
      anunciar(`${m.nombre} eliminado`);
    }
  };

  return (
    <div className="d-grid gap-4">
      <div className="sury-card">
        <Imagen {...IMAGENES.medicamentos} className="banner-img" />
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h2 className="h3 m-0">Medicamentos de hoy</h2>
          <BotonEscuchar texto={AUDIOS.medicamentos} etiqueta="Escuchar ayuda" />
        </div>
        <p className="fs-5 mt-3 mb-2">
          Has tomado <strong>{tomadas} de {meds.length}</strong>.
        </p>
        <span className="progress-sury" role="progressbar" aria-label="Medicamentos tomados hoy"
          aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <span style={{ width: `${pct}%` }} />
        </span>
      </div>

      {meds.length === 0 ? (
        <p className="sury-card fs-5 m-0">Aún no tienes medicamentos. Agrégalos con el formulario de abajo.</p>
      ) : (
        <ul className="list-unstyled d-grid gap-3 m-0">
          {ordenados.map((m) => {
            const tomado = tomasHoy.includes(m.id);
            return (
              <li key={m.id} className={`item ${tomado ? "hecho" : ""}`}>
                <div>
                  <strong className="fs-4">{m.nombre}</strong>
                  {m.dosis && <span className="fs-5"> · {m.dosis}</span>}
                  <div className="d-flex flex-wrap align-items-center gap-2 mt-1">
                    <span><span aria-hidden="true">🕒</span> {formatoHora(m.hora)}</span>
                    <span className={`badge-sury ${tomado ? "ok" : "aviso"}`}>{tomado ? "✔ Tomado" : "⏳ Pendiente"}</span>
                  </div>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <button type="button" className={tomado ? "btn-sury" : "btn-sury-sec"} aria-pressed={tomado}
                    aria-label={`Ya tomé ${m.nombre}`} onClick={() => marcar(m)}>
                    {tomado ? "✔ Ya lo tomé" : "Marcar: ya lo tomé"}
                  </button>
                  <button type="button" className="btn-sury-sec" aria-label={`Escuchar datos de ${m.nombre}`}
                    onClick={() => hablar(`${m.nombre}${m.dosis ? `, ${m.dosis}` : ""}. Se toma a las ${formatoHora(m.hora)}.`)}>
                    <span aria-hidden="true">🔊</span>
                  </button>
                  <button type="button" className="btn-sury-sec" aria-label={`Quitar ${m.nombre}`} onClick={() => quitar(m)}>
                    <span aria-hidden="true">🗑</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form className="sury-card d-grid gap-3" onSubmit={agregar} noValidate>
        <h3 className="h4 m-0">Agregar medicamento</h3>
        <div>
          <label htmlFor="med-nombre" className="form-label">Nombre *</label>
          <input id="med-nombre" className={`form-control ${err ? "is-invalid" : ""}`} value={f.nombre}
            aria-invalid={!!err} aria-describedby={err ? "med-error" : undefined}
            onChange={(e) => setF({ ...f, nombre: e.target.value })} />
          {err && <div id="med-error" className="error-campo" role="alert">⚠ {err}</div>}
        </div>
        <div className="row g-3">
          <div className="col-sm-7">
            <label htmlFor="med-dosis" className="form-label">Dosis (opcional)</label>
            <input id="med-dosis" className="form-control" placeholder="Ej.: 1 tableta" value={f.dosis}
              onChange={(e) => setF({ ...f, dosis: e.target.value })} />
          </div>
          <div className="col-sm-5">
            <label htmlFor="med-hora" className="form-label">Hora</label>
            <input id="med-hora" type="time" className="form-control" value={f.hora}
              onChange={(e) => setF({ ...f, hora: e.target.value })} />
          </div>
        </div>
        <button type="submit" className="btn-sury">Agregar a mi lista</button>
      </form>
    </div>
  );
}
