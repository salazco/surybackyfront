import { createContext, useCallback, useContext, useEffect, useState } from "react";
import useVoz from "../hooks/useVoz";

const Ctx = createContext(null);
const TAMANOS = [100, 115, 130, 150]; // % del tamaño base de letra
const leer = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } };
const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export function AccesibilidadProvider({ children }) {
  const voz = useVoz();
  const [tamano, setTamano] = useState(() => leer("sury_tamano", 0));
  const [contraste, setContraste] = useState(() => leer("sury_contraste", false));
  const [lecturaAuto, setLecturaAuto] = useState(() => leer("sury_lectura", false));
  const [anuncio, setAnuncio] = useState("");

  useEffect(() => {
    document.documentElement.style.fontSize = `${TAMANOS[tamano]}%`;
    guardar("sury_tamano", tamano);
  }, [tamano]);

  useEffect(() => {
    document.documentElement.dataset.contraste = contraste ? "alto" : "normal";
    guardar("sury_contraste", contraste);
  }, [contraste]);

  useEffect(() => { guardar("sury_lectura", lecturaAuto); }, [lecturaAuto]);

  // Mensaje para lectores de pantalla (región aria-live en Layout)
  const anunciar = useCallback((t) => {
    setAnuncio("");
    setTimeout(() => setAnuncio(t), 60);
  }, []);

  const aumentar = useCallback(() => setTamano((t) => Math.min(t + 1, TAMANOS.length - 1)), []);
  const reducir = useCallback(() => setTamano((t) => Math.max(t - 1, 0)), []);
  const toggleContraste = useCallback(() => {
    setContraste((c) => { anunciar(!c ? "Alto contraste activado" : "Alto contraste desactivado"); return !c; });
  }, [anunciar]);
  const toggleLectura = useCallback(() => {
    setLecturaAuto((l) => { anunciar(!l ? "Lectura automática activada" : "Lectura automática desactivada"); return !l; });
  }, [anunciar]);

  const value = {
    ...voz, tamano, aumentar, reducir, contraste, toggleContraste,
    lecturaAuto, toggleLectura, anuncio, anunciar,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAccesibilidad = () => useContext(Ctx);
