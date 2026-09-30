import BotonEscuchar from "../BotonEscuchar";
import Imagen from "../Imagen";
import { IMAGENES } from "../../data/imagenes";
import { AUDIOS } from "../../data/audios";
import { NUMERO_EMERGENCIAS } from "../../config";

const TEMAS = [
  {
    t: "¿Cómo uso mi panel?",
    d: "Usa las cinco pestañas: Resumen, Medicamentos, Citas, Seguimiento y Ayuda. Con el teclado puedes moverte entre pestañas con las flechas izquierda y derecha.",
  },
  {
    t: "Letra grande y alto contraste",
    d: "En la barra azul de arriba, toca A más para agrandar la letra, o Alto contraste para ver colores más fuertes. Tus preferencias se guardan.",
  },
  {
    t: "Comandos de voz",
    d: "Toca el botón Comandos de voz y di: medicamentos, citas, seguimiento, ayuda, letra más grande, contraste, leer o silencio. Funciona en Chrome, Edge y Safari.",
  },
  {
    t: "Mis datos y privacidad",
    d: "Tus medicamentos, citas y mediciones se guardan solo en este dispositivo. Si compartes el equipo con otras personas, toca Salir cuando termines.",
  },
];

export default function Ayuda() {
  const emergencia = `Si tienes dolor fuerte en el pecho, dificultad para respirar, desmayo o mareo intenso, llama de inmediato a emergencias al ${NUMERO_EMERGENCIAS}.`;
  return (
    <div className="d-grid gap-3">
      <div className="sury-card">
        <Imagen {...IMAGENES.ayuda} className="banner-img" />
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h2 className="h3 m-0">Ayuda</h2>
          <BotonEscuchar texto={AUDIOS.ayuda} etiqueta="Escuchar ayuda general" />
        </div>
      </div>

      <div className="mensaje error">
        <h3 className="h5">❗ ¿Te sientes mal?</h3>
        <p className="mb-2">{emergencia}</p>
        <BotonEscuchar texto={emergencia} etiqueta="Escuchar aviso" />
      </div>

      {TEMAS.map((x) => (
        <details className="sury-card" key={x.t}>
          <summary>{x.t}</summary>
          <p className="fs-5 mt-3">{x.d}</p>
          <BotonEscuchar texto={x.d} etiqueta="Escuchar" />
        </details>
      ))}
    </div>
  );
}
