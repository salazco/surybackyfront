import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AccesibilidadProvider } from "./context/AccesibilidadContext";
import Layout from "./components/Layout";
import RegistroPersona from "./components/RegistroPersona";
import Home from "./pages/Home";

export default function App() {
  return (
    <AccesibilidadProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/registro" replace />} />
            <Route path="/registro" element={<RegistroPersona />} />
            <Route path="/home" element={<Home />} />
            <Route path="*" element={<Navigate to="/registro" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AccesibilidadProvider>
  );
}
