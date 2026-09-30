// Imágenes en línea relacionadas por palabras clave (servicio LoremFlickr, fotos de Flickr con licencia Creative Commons).
// Si una imagen no carga, el componente <Imagen> muestra una ilustración de respaldo.
// Para usar tus propias fotos, reemplaza cada "src" por una URL fija o por un archivo en /public.
const lf = (w, h, palabras, lock) => `https://loremflickr.com/${w}/${h}/${palabras}?lock=${lock}`;

export const IMAGENES = {
  registro:     { src: lf(900, 600, "senior,doctor", 11),     alt: "Imagen ilustrativa: profesional de la salud atendiendo a una persona mayor", fallback: "🩺" },
  home:         { src: lf(800, 600, "elderly,healthy", 12),   alt: "Imagen ilustrativa: persona mayor activa y saludable", fallback: "💙" },
  medicamentos: { src: lf(800, 360, "pills,medicine", 13),    alt: "Imagen ilustrativa: medicamentos y pastillas", fallback: "💊" },
  citas:        { src: lf(800, 360, "doctor,clinic", 14),     alt: "Imagen ilustrativa: consultorio médico", fallback: "📅" },
  seguimiento:  { src: lf(800, 360, "stethoscope,health", 15), alt: "Imagen ilustrativa: estetoscopio y control de salud", fallback: "❤️" },
  ayuda:        { src: lf(800, 360, "senior,smile", 16),      alt: "Imagen ilustrativa: persona mayor sonriendo", fallback: "🙋" },
};
