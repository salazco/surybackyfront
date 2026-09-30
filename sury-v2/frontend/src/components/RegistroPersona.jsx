import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { registrarPersona, ApiError } from "../services/personaService";
import { normalizarDictado } from "../utils/dictado";
import { guardarPersona } from "../utils/sesion";
import { hoyISO } from "../utils/fechas";
import { useAccesibilidad } from "../context/AccesibilidadContext";
import { AUDIOS } from "../data/audios";
import { IMAGENES } from "../data/imagenes";
import Imagen from "./Imagen";
import BotonEscuchar from "./BotonEscuchar";

/* ---------- CONTRATO CON EL BACKEND (los name deben coincidir con PersonaRequest.java) ---------- */
const CAMPOS = [
  { name: "nombres", label: "Nombres", type: "text", required: true, autoComplete: "given-name", ayuda: "Escribe o dicta tus nombres." },
  { name: "apellidos", label: "Apellidos", type: "text", required: true, autoComplete: "family-name", ayuda: "Escribe o dicta tus apellidos." },
  { name: "tipoDocumento", label: "Tipo de documento", type: "select", required: true, ayuda: "Elige el tipo de documento de la lista.",
    options: [{ value: "CC", label: "Cédula de ciudadanía" }, { value: "CE", label: "Cédula de extranjería" }, { value: "PA", label: "Pasaporte" }] },
  { name: "numeroDocumento", label: "Número de documento", type: "text", required: true, inputMode: "numeric", dictado: "numero", pattern: /^[0-9A-Za-z-]{5,20}$/, patternMsg: "Debe tener entre 5 y 20 caracteres.", ayuda: "Dicta o escribe solo los números." },
  { name: "fechaNacimiento", label: "Fecha de nacimiento", type: "date", required: true, dictado: "date", ayuda: "Puedes decir, por ejemplo: cinco de marzo de mil novecientos cincuenta." },
  { name: "telefono", label: "Teléfono", type: "tel", required: true, inputMode: "tel", dictado: "tel", autoComplete: "tel", pattern: /^[0-9+]{7,15}$/, patternMsg: "Ingresa un teléfono válido, solo números.", ayuda: "Dicta o escribe tu número de teléfono." },
  { name: "email", label: "Correo electrónico (opcional)", type: "email", required: false, dictado: "email", autoComplete: "email", pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, patternMsg: "Ingresa un correo válido.", ayuda: "Puedes decir: nombre arroba correo punto com." },
];
/* ------------------------------------------------------------------------------------------------ */

const inicial = Object.fromEntries(CAMPOS.map((c) => [c.name, ""]));

function validar(v) {
  const e = {};
  CAMPOS.forEach((c) => {
    const val = String(v[c.name] ?? "").trim();
    if (c.required && !val) e[c.name] = "Este campo es obligatorio.";
    else if (val && c.pattern && !c.pattern.test(val)) e[c.name] = c.patternMsg;
  });
  if (v.fechaNacimiento && v.fechaNacimiento > hoyISO()) e.fechaNacimiento = "La fecha no puede ser futura.";
  return e;
}

export default function RegistroPersona() {
  const navigate = useNavigate();
  const { hablar, dictar, escuchando, puedeHablar, puedeDictar, lecturaAuto } = useAccesibilidad();
  const [valores, setValores] = useState(inicial);
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [alerta, setAlerta] = useState(null);
  const [dictandoCampo, setDictandoCampo] = useState(null);
  const controllerRef = useRef(null);
  const resumenRef = useRef(null);

  useEffect(() => () => controllerRef.current?.abort(), []);
  useEffect(() => { document.title = "Registro | SURY"; }, []);
  useEffect(() => { if (alerta) resumenRef.current?.focus(); }, [alerta]);

  const setValor = (name, value) => {
    setValores((p) => ({ ...p, [name]: value }));
    if (errores[name]) setErrores((p) => ({ ...p, [name]: undefined }));
  };

  const leerCampo = (c) => hablar(`${c.label}. ${c.ayuda}`);

  const dictarCampo = (c) => {
    setDictandoCampo(c.name);
    hablar(`Dicta ${c.label}`, () =>
      dictar(
        (texto) => {
          const limpio = normalizarDictado(c.dictado, texto);
          if (limpio) { setValor(c.name, limpio); hablar(`Registrado: ${limpio}`); }
          else hablar("No pudimos entender el dato. Intenta de nuevo.");
          setDictandoCampo(null);
        },
        (msg) => { hablar(msg); setAlerta({ texto: msg }); setDictandoCampo(null); }
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;
    setAlerta(null);

    const locales = validar(valores);
    if (Object.keys(locales).length) {
      setErrores(locales);
      const n = Object.keys(locales).length;
      const msg = `Hay ${n} ${n === 1 ? "campo por corregir" : "campos por corregir"}.`;
      setAlerta({ texto: msg });
      hablar(`${msg} ${Object.values(locales)[0]}`);
      return;
    }

    const payload = Object.fromEntries(
      Object.entries(valores).map(([k, v]) => [k, String(v).trim() === "" ? null : String(v).trim()])
    );

    controllerRef.current = new AbortController();
    setEnviando(true);
    try {
      const p = await registrarPersona(payload, controllerRef.current.signal);
      guardarPersona({
        id: p?.id ?? valores.numeroDocumento,
        nombres: p?.nombres || valores.nombres.trim(),
        apellidos: p?.apellidos || valores.apellidos.trim(),
      });
      hablar("Registro completado. Te llevamos a tu panel de salud.");
      navigate("/home", { replace: true, state: { registroExitoso: true } });
    } catch (err) {
      if (err.name === "AbortError") return;
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length) setErrores(err.fieldErrors);
      setAlerta({ texto: err.message });
      hablar(err.message);
      setEnviando(false);
    }
  };

  const erroresLista = CAMPOS.filter((c) => errores[c.name]);

  return (
    <div className="container py-4">
      <div className="row g-4">
        {/* Columna informativa */}
        <div className="col-lg-5">
          <div className="sury-card h-100">
            <Imagen {...IMAGENES.registro} className="banner-img" />
            <h2 className="h4">¿Cómo funciona?</h2>
            <ol className="fs-5 ps-3">
              <li>Completa tus datos.</li>
              <li>Presiona <strong>Registrarme</strong>.</li>
              <li>Verás tu panel con medicamentos, citas y seguimiento.</li>
            </ol>
            <BotonEscuchar texto={AUDIOS.registro} etiqueta="Escuchar ayuda del formulario" />
          </div>
        </div>

        {/* Formulario */}
        <div className="col-lg-7">
          <div className="sury-card">
            <h1 className="h2 mb-2">Registro de persona</h1>
            <p className="fs-5 mb-4">Los campos con asterisco (*) son obligatorios.</p>

            {alerta && (
              <div ref={resumenRef} tabIndex={-1} role="alert" className="mensaje error mb-4">
                <p className="mb-1">❗ {alerta.texto}</p>
                {erroresLista.length > 0 && (
                  <ul className="mb-0">
                    {erroresLista.map((c) => (
                      <li key={c.name}><a href={`#${c.name}`}>{c.label}: {errores[c.name]}</a></li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {CAMPOS.map((c) => {
                const error = errores[c.name];
                const idAyuda = `${c.name}-ayuda`;
                const describedBy = [idAyuda, error && `${c.name}-error`].filter(Boolean).join(" ");
                const comun = {
                  id: c.name, name: c.name, value: valores[c.name],
                  onChange: (e) => setValor(e.target.name, e.target.value),
                  disabled: enviando, required: c.required, autoComplete: c.autoComplete,
                  "aria-invalid": !!error, "aria-describedby": describedBy,
                  onFocus: () => lecturaAuto && leerCampo(c),
                };
                const activo = dictandoCampo === c.name && escuchando;
                return (
                  <div className="mb-4" key={c.name}>
                    <label htmlFor={c.name} className="form-label fs-5">
                      {c.label}{c.required && <span aria-hidden="true"> *</span>}
                    </label>
                    <div id={idAyuda} className="form-text mb-2">{c.ayuda}</div>

                    <div className="fila-campo">
                      {c.type === "select" ? (
                        <select {...comun} className={`form-select ${error ? "is-invalid" : ""}`}>
                          <option value="">Selecciona una opción</option>
                          {c.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      ) : (
                        <input {...comun} type={c.type} inputMode={c.inputMode}
                          max={c.type === "date" ? hoyISO() : undefined}
                          className={`form-control ${error ? "is-invalid" : ""}`} />
                      )}
                      {puedeHablar && (
                        <button type="button" className="btn-sury-sec" onClick={() => leerCampo(c)}
                          aria-label={`Escuchar instrucciones de ${c.label}`}>
                          <span aria-hidden="true">🔊</span>
                        </button>
                      )}
                      {puedeDictar && c.type !== "select" && (
                        <button type="button" className="btn-sury-sec" onClick={() => dictarCampo(c)} disabled={enviando}
                          aria-label={activo ? `Escuchando ${c.label}` : `Dictar ${c.label}`} aria-pressed={activo}>
                          <span aria-hidden="true">🎤</span>
                        </button>
                      )}
                    </div>
                    {error && <div id={`${c.name}-error`} className="error-campo">⚠ {error}</div>}
                  </div>
                );
              })}

              <button type="submit" className="btn-sury w-100 fs-4 py-3" disabled={enviando}>
                {enviando ? (<><span className="spinner-border spinner-border-sm" aria-hidden="true" /> Registrando…</>) : "Registrarme"}
              </button>
            </form>
            <div className="visually-hidden" aria-live="polite">{escuchando ? "Escuchando, habla ahora" : ""}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
