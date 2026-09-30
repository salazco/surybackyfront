import { useNavigate } from "react-router-dom";
import { useAccesibilidad } from "../context/AccesibilidadContext";

const norm = (t) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default function BarraAccesibilidad() {
  const a = useAccesibilidad();
  const navigate = useNavigate();

  const ir = (seccion, mensaje) => {
    navigate(`/home?seccion=${seccion}`);
    a.anunciar(mensaje);
    a.hablar(mensaje);
  };

  const interpretar = (texto) => {
    const t = norm(texto);
    if (/\b(lee|leer|lectura|escuchar)\b/.test(t)) window.dispatchEvent(new Event("sury:leer"));
    else if (/medicament|pastilla|remedio/.test(t)) ir("medicamentos", "Abriendo medicamentos");
    else if (/cita/.test(t)) ir("citas", "Abriendo citas");
    else if (/seguimiento|presion|animo|salud/.test(t)) ir("seguimiento", "Abriendo seguimiento");
    else if (/ayuda/.test(t)) ir("ayuda", "Abriendo ayuda");
    else if (/resumen|inicio|casa/.test(t)) ir("resumen", "Abriendo resumen");
    else if (/mas grande|aumentar|agrandar/.test(t)) { a.aumentar(); a.hablar("Letra más grande"); }
    else if (/mas pequena|mas chica|reducir|achicar/.test(t)) { a.reducir(); a.hablar("Letra más pequeña"); }
    else if (/contraste/.test(t)) a.toggleContraste();
    else if (/silencio|callar|detener|parar/.test(t)) a.callar();
    else a.hablar("No entendí. Toca el botón y di, por ejemplo: medicamentos, citas o ayuda.");
  };

  const comandar = () => {
    a.hablar(
      "Te escucho. Di, por ejemplo: medicamentos, citas, seguimiento, ayuda, letra más grande, contraste o leer.",
      () => a.dictar(interpretar, (msg) => a.hablar(msg))
    );
  };

  return (
    <div className="barra-acc" role="group" aria-label="Opciones de accesibilidad">
      <button type="button" className="btn-barra" onClick={a.reducir} disabled={a.tamano === 0} aria-label="Reducir tamaño de letra">A−</button>
      <button type="button" className="btn-barra" onClick={a.aumentar} disabled={a.tamano === 3} aria-label="Aumentar tamaño de letra">A+</button>
      <button type="button" className="btn-barra" onClick={a.toggleContraste} aria-pressed={a.contraste}>
        <span aria-hidden="true">◐</span> Alto contraste
      </button>
      {a.puedeHablar && (
        <button type="button" className="btn-barra" onClick={a.toggleLectura} aria-pressed={a.lecturaAuto}>
          <span aria-hidden="true">🔊</span> Lectura automática
        </button>
      )}
      {a.puedeDictar && (
        <button type="button" className="btn-barra" onClick={comandar} aria-pressed={a.escuchando}>
          <span aria-hidden="true">🎤</span> Comandos de voz
        </button>
      )}
    </div>
  );
}
