import { useEffect, useRef } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import BarraAccesibilidad from "./BarraAccesibilidad";
import { useAccesibilidad } from "../context/AccesibilidadContext";

export default function Layout() {
  const { anuncio } = useAccesibilidad();
  const { pathname } = useLocation();
  const anterior = useRef(pathname);

  // Al cambiar de página, el foco va al contenido (útil para lectores de pantalla y teclado)
  useEffect(() => {
    if (anterior.current !== pathname) {
      anterior.current = pathname;
      document.getElementById("contenido")?.focus();
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return (
    <>
      <a className="skip-link" href="#contenido">Saltar al contenido principal</a>
      <header className="sury-header">
        <div className="container d-flex flex-wrap align-items-center justify-content-between gap-3 py-3">
          <Link to="/" className="sury-logo" aria-label="SURY, ir al inicio">
            <span><span aria-hidden="true">💙 </span>SURY</span>
            <small>Tu salud, paso a paso</small>
          </Link>
          <BarraAccesibilidad />
        </div>
      </header>

      <main id="contenido" tabIndex={-1} style={{ outline: "none" }}>
        <Outlet />
      </main>

      <footer className="sury-footer">
        <div className="container">
          <p className="mb-1">SURY te ayuda a organizar tu salud y no reemplaza la atención médica.</p>
          <p className="mb-0">Tus datos de seguimiento se guardan solo en este dispositivo.</p>
        </div>
      </footer>

      <div className="visually-hidden" role="status" aria-live="polite">{anuncio}</div>
    </>
  );
}
