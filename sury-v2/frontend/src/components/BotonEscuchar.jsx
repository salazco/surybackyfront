import { useEffect, useState } from "react";
import { useAccesibilidad } from "../context/AccesibilidadContext";

// Botón de audio breve: lee un texto y se puede detener.
export default function BotonEscuchar({ texto, etiqueta = "Escuchar", className = "" }) {
  const { hablar, callar, hablando, puedeHablar } = useAccesibilidad();
  const [activo, setActivo] = useState(false);

  useEffect(() => { if (!hablando) setActivo(false); }, [hablando]);

  if (!puedeHablar) return null;

  const alternar = () => {
    if (activo && hablando) { callar(); setActivo(false); return; }
    hablar(typeof texto === "function" ? texto() : texto);
    setActivo(true);
  };

  return (
    <button type="button" className={`btn-sury-sec btn-escuchar ${className}`} onClick={alternar} aria-pressed={activo && hablando}>
      <span aria-hidden="true">{activo && hablando ? "⏹" : "🔊"}</span>
      <span>{activo && hablando ? "Detener audio" : etiqueta}</span>
    </button>
  );
}
