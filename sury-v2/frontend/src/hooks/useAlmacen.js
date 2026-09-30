import { useEffect, useState } from "react";

// useState que se guarda en localStorage (en este dispositivo).
export default function useAlmacen(clave, inicial) {
  const [valor, setValor] = useState(() => {
    try {
      const s = localStorage.getItem(clave);
      return s ? JSON.parse(s) : inicial;
    } catch { return inicial; }
  });
  useEffect(() => {
    try { localStorage.setItem(clave, JSON.stringify(valor)); } catch {}
  }, [clave, valor]);
  return [valor, setValor];
}
