import { useState } from "react";

// Imagen en línea con texto alternativo y respaldo si no carga.
export default function Imagen({ src, alt, fallback = "🩺", className = "" }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div className={`img-fallback ${className}`} role="img" aria-label={alt}>
        <span aria-hidden="true">{fallback}</span>
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setError(true)} />;
}
