import { useCallback, useEffect, useRef, useState } from "react";

const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
const TTS = typeof window !== "undefined" && "speechSynthesis" in window;

export default function useVoz() {
  const [escuchando, setEscuchando] = useState(false);
  const [hablando, setHablando] = useState(false);
  const recRef = useRef(null);
  const idRef = useRef(0);

  // Lee un texto en voz alta. alTerminar se ejecuta al acabar (o de inmediato si no hay síntesis de voz).
  const hablar = useCallback((texto, alTerminar) => {
    if (!TTS || !texto) { alTerminar?.(); return; }
    window.speechSynthesis.cancel();
    const id = ++idRef.current;
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = "es-CO";
    u.rate = 0.9; // más pausado
    const voz = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("es"));
    if (voz) u.voice = voz;
    const fin = () => {
      if (idRef.current === id) { setHablando(false); alTerminar?.(); }
    };
    u.onend = fin;
    u.onerror = fin;
    setHablando(true);
    window.speechSynthesis.speak(u);
  }, []);

  const callar = useCallback(() => {
    idRef.current++;
    setHablando(false);
    if (TTS) window.speechSynthesis.cancel();
  }, []);

  const dictar = useCallback((onTexto, onError) => {
    if (!SR) return;
    recRef.current?.abort();
    const rec = new SR();
    rec.lang = "es-CO";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onstart = () => setEscuchando(true);
    rec.onend = () => setEscuchando(false);
    rec.onerror = (e) => {
      setEscuchando(false);
      onError?.(e.error === "not-allowed"
        ? "Permite el uso del micrófono en tu navegador."
        : "No te escuchamos bien. Intenta de nuevo.");
    };
    rec.onresult = (e) => onTexto(e.results[0][0].transcript);
    recRef.current = rec;
    rec.start();
  }, []);

  useEffect(() => () => {
    recRef.current?.abort();
    if (TTS) window.speechSynthesis.cancel();
  }, []);

  return { hablar, callar, dictar, escuchando, hablando, puedeHablar: TTS, puedeDictar: !!SR };
}
