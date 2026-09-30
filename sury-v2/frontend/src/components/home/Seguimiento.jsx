import { useState } from "react";
import { useAccesibilidad } from "../../context/AccesibilidadContext";
import BotonEscuchar from "../BotonEscuchar";
import Imagen from "../Imagen";
import { IMAGENES } from "../../data/imagenes";
import { AUDIOS } from "../../data/audios";
import { ANIMOS, clasificarPresion, ICONO_NIVEL } from "../../utils/salud";
import { ahoraHHMM, formatoFechaCorta, hoyISO } from "../../utils/fechas";
import { nuevoId } from "../../utils/id";
import { normalizarDictado } from "../../utils/dictado";

const vacio = { sys: "", dia: "", glucosa: "", peso: "", animo: 0, nota: "" };
const num = (v) => (v === "" ? null : Number(v));

function CampoNumero({ id, label, valor, onChange, unidad, ayuda, tipo = "numero", step }) {
  const { hablar, dictar, puedeDictar, escuchando } = useAccesibilidad();
  const [activo, setActivo] = useState(false);

  const dictarNum = () => {
    setActivo(true);
    hablar(`Dicta ${label}`, () =>
      dictar(
        (t) => {
          const v = normalizarDictado(tipo, t);
          if (v) { onChange(v); hablar(`Registrado ${v}`); } else hablar("No entendí el número.");
          setActivo(false);
        },
        (m) => { hablar(m); setActivo(false); }
      )
    );
  };

  return (
    <div>
      <label htmlFor={id} className="form-label">{label} <span className="texto-suave">({unidad})</span></label>
      <div className="fila-campo">
        <input id={id} type="number" inputMode="decimal" step={step} className="form-control" value={valor}
          onChange={(e) => onChange(e.target.value)} aria-describedby={ayuda ? `${id}-ayuda` : undefined} />
        {puedeDictar && (
          <button type="button" className="btn-sury-sec" aria-label={`Dictar ${label}`} aria-pressed={activo && escuchando} onClick={dictarNum}>
            <span aria-hidden="true">🎤</span>
          </button>
        )}
      </div>
      {ayuda && <div id={`${id}-ayuda`} className="form-text">{ayuda}</div>}
    </div>
  );
}

function Grafico({ datos }) {
  if (datos.length < 2) {
    return <p className="m-0 fs-5">Registra al menos dos mediciones de presión para ver el gráfico.</p>;
  }
  const W = 640, H = 240, P = { l: 46, r: 16, t: 16, b: 34 };
  const vals = datos.flatMap((d) => [d.sys, d.dia]);
  const min = Math.min(...vals) - 10;
  const max = Math.max(...vals) + 10;
  const x = (i) => P.l + (i * (W - P.l - P.r)) / (datos.length - 1);
  const y = (v) => P.t + ((max - v) * (H - P.t - P.b)) / (max - min);
  const linea = (k) => datos.map((d, i) => `${x(i)},${y(d[k])}`).join(" ");
  const ticks = [min, (min + max) / 2, max].map(Math.round);
  const ult = datos[datos.length - 1];

  return (
    <div>
      <svg className="grafico" viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Gráfico de presión arterial de las últimas ${datos.length} mediciones. La última fue ${ult.sys} sobre ${ult.dia}. Debajo hay una tabla con todos los datos.`}>
        {ticks.map((t) => (
          <g key={t}>
            <line className="rejilla" x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} />
            <text x={P.l - 8} y={y(t) + 4} textAnchor="end">{t}</text>
          </g>
        ))}
        <polyline className="l-sys" points={linea("sys")} />
        <polyline className="l-dia" points={linea("dia")} />
        {datos.map((d, i) => (
          <g key={d.id}>
            <circle className="p-sys" cx={x(i)} cy={y(d.sys)} r="6"><title>{`${formatoFechaCorta(d.fecha)}: alta ${d.sys}`}</title></circle>
            <rect className="p-dia" x={x(i) - 5} y={y(d.dia) - 5} width="10" height="10"><title>{`${formatoFechaCorta(d.fecha)}: baja ${d.dia}`}</title></rect>
          </g>
        ))}
        <text x={P.l} y={H - 8} textAnchor="start">{formatoFechaCorta(datos[0].fecha)}</text>
        <text x={W - P.r} y={H - 8} textAnchor="end">{formatoFechaCorta(ult.fecha)}</text>
      </svg>
      <p className="mt-2 mb-0 texto-suave">
        <strong>● Línea continua:</strong> presión alta (sistólica). <strong>■ Línea punteada:</strong> presión baja (diastólica).
      </p>
    </div>
  );
}

export default function Seguimiento({ registros, setRegistros }) {
  const { hablar, anunciar } = useAccesibilidad();
  const [f, setF] = useState(vacio);
  const [errores, setErrores] = useState([]);
  const [resultado, setResultado] = useState(null);

  const ordenados = [...registros].sort((a, b) => a.ts - b.ts);
  const conPresion = ordenados.filter((r) => r.sys && r.dia).slice(-10);
  const recientes = [...ordenados].reverse().slice(0, 8);

  const guardar = (e) => {
    e.preventDefault();
    const sys = num(f.sys), dia = num(f.dia), glucosa = num(f.glucosa), peso = num(f.peso);
    const errs = [];
    if ((sys === null) !== (dia === null)) errs.push("Escribe las dos cifras de la presión: la alta y la baja.");
    if (sys !== null && (sys < 70 || sys > 260)) errs.push("La presión alta debe estar entre 70 y 260.");
    if (dia !== null && (dia < 40 || dia > 160)) errs.push("La presión baja debe estar entre 40 y 160.");
    if (glucosa !== null && (glucosa < 20 || glucosa > 600)) errs.push("La glucosa debe estar entre 20 y 600.");
    if (peso !== null && (peso < 20 || peso > 300)) errs.push("El peso debe estar entre 20 y 300 kilos.");
    if (sys === null && glucosa === null && peso === null && !f.animo) errs.push("Registra al menos un dato.");
    if (errs.length) { setErrores(errs); setResultado(null); hablar(errs[0]); return; }

    setRegistros([...registros, {
      id: nuevoId(), fecha: hoyISO(), hora: ahoraHHMM(), ts: Date.now(),
      sys, dia, glucosa, peso, animo: f.animo || null, nota: f.nota.trim(),
    }]);

    let msg = "Registro guardado.";
    if (sys !== null) {
      const c = clasificarPresion(sys, dia);
      setResultado({ nivel: c.nivel, texto: `Presión ${sys}/${dia}: ${c.texto}.` });
      msg = `Registro guardado. Presión ${sys} sobre ${dia}. ${c.texto}.`;
    } else {
      setResultado({ nivel: "ok", texto: "Registro guardado." });
    }
    anunciar(msg);
    hablar(msg);
    setF(vacio);
    setErrores([]);
  };

  const quitar = (r) => {
    if (window.confirm("¿Eliminar este registro?")) {
      setRegistros(registros.filter((x) => x.id !== r.id));
      anunciar("Registro eliminado");
    }
  };

  return (
    <div className="d-grid gap-4">
      <div className="sury-card">
        <Imagen {...IMAGENES.seguimiento} className="banner-img" />
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h2 className="h3 m-0">Seguimiento de tu salud</h2>
          <BotonEscuchar texto={AUDIOS.seguimiento} etiqueta="Escuchar ayuda" />
        </div>
      </div>

      <form className="sury-card d-grid gap-3" onSubmit={guardar} noValidate>
        <h3 className="h4 m-0">Registrar hoy</h3>

        {errores.length > 0 && (
          <div role="alert" className="mensaje error">
            <ul className="mb-0">{errores.map((e) => <li key={e}>❗ {e}</li>)}</ul>
          </div>
        )}
        {resultado && (
          <div role="status" className={`mensaje ${resultado.nivel}`}>{ICONO_NIVEL[resultado.nivel]} {resultado.texto}</div>
        )}

        <div className="row g-3">
          <div className="col-sm-6">
            <CampoNumero id="seg-sys" label="Presión alta" unidad="el número mayor" valor={f.sys} onChange={(v) => setF({ ...f, sys: v })} />
          </div>
          <div className="col-sm-6">
            <CampoNumero id="seg-dia" label="Presión baja" unidad="el número menor" valor={f.dia} onChange={(v) => setF({ ...f, dia: v })} />
          </div>
          <div className="col-sm-6">
            <CampoNumero id="seg-glu" label="Glucosa" unidad="mg/dL" valor={f.glucosa} onChange={(v) => setF({ ...f, glucosa: v })} />
          </div>
          <div className="col-sm-6">
            <CampoNumero id="seg-peso" label="Peso" unidad="kg" tipo="decimal" step="0.1" valor={f.peso} onChange={(v) => setF({ ...f, peso: v })} />
          </div>
        </div>

        <fieldset className="animos">
          <legend className="form-label fs-6">¿Cómo te sientes hoy?</legend>
          <div className="animos-fila">
            {ANIMOS.map((a) => (
              <div className="animo-op" key={a.v}>
                <input type="radio" id={`animo-${a.v}`} name="animo" value={a.v} checked={f.animo === a.v}
                  onChange={() => { setF({ ...f, animo: a.v }); hablar(a.t); }} />
                <label htmlFor={`animo-${a.v}`}><span className="e" aria-hidden="true">{a.e}</span>{a.t}</label>
              </div>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="seg-nota" className="form-label">Notas o síntomas (opcional)</label>
          <textarea id="seg-nota" rows={2} className="form-control" value={f.nota}
            onChange={(e) => setF({ ...f, nota: e.target.value })} />
        </div>

        <button type="submit" className="btn-sury">Guardar registro</button>
        <p className="texto-suave m-0">Esta información es solo de apoyo y no reemplaza la valoración de un profesional de la salud.</p>
      </form>

      <div className="sury-card d-grid gap-3">
        <h3 className="h4 m-0">Evolución de tu presión</h3>
        <Grafico datos={conPresion} />
      </div>

      <div className="sury-card">
        <div className="tabla-scroll">
          <table className="tabla-sury">
            <caption>Últimos registros</caption>
            <thead>
              <tr>
                <th scope="col">Fecha</th><th scope="col">Presión</th><th scope="col">Glucosa</th>
                <th scope="col">Peso</th><th scope="col">Ánimo</th><th scope="col"><span className="visually-hidden">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {recientes.length === 0 && (
                <tr><td colSpan={6}>Aún no hay registros.</td></tr>
              )}
              {recientes.map((r) => {
                const c = r.sys && r.dia ? clasificarPresion(r.sys, r.dia) : null;
                const a = r.animo ? ANIMOS[r.animo - 1] : null;
                return (
                  <tr key={r.id}>
                    <td>{formatoFechaCorta(r.fecha)}</td>
                    <td>
                      {c ? (<>{r.sys}/{r.dia} <span className={`badge-sury ${c.nivel}`}>{ICONO_NIVEL[c.nivel]} {c.corto}</span></>) : "—"}
                    </td>
                    <td>{r.glucosa ?? "—"}</td>
                    <td>{r.peso ?? "—"}</td>
                    <td>{a ? <><span aria-hidden="true">{a.e}</span> {a.t}</> : "—"}</td>
                    <td>
                      <button type="button" className="btn-sury-sec" aria-label={`Eliminar registro del ${formatoFechaCorta(r.fecha)}`} onClick={() => quitar(r)}>
                        <span aria-hidden="true">🗑</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
