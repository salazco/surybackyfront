# SURY v2 – Registro accesible + Panel de seguimiento (azul y blanco)

## Requisitos
Java 17+ · Maven 3.9+ · Node 18+

## 1) Backend  → http://localhost:8080
```bash
cd backend
mvn spring-boot:run
```

## 2) Frontend → http://localhost:5173  (otra terminal)
```bash
cd frontend
npm install
npm run dev
```
La URL del API está en `frontend/.env` (`VITE_API_URL`).

## Flujo
/registro → POST /api/personas → 201 → /home (panel con Resumen, Medicamentos, Citas, Seguimiento y Ayuda)

## Accesibilidad incluida
- Tamaño de letra ajustable (A− / A+), modo de alto contraste, foco visible, objetivos táctiles grandes.
- Audios breves (síntesis de voz) en cada sección y en cada elemento; lectura automática opcional.
- Dictado por voz en el formulario y en las mediciones; comandos de voz para navegar.
- Pestañas con teclado (flechas, Inicio, Fin), enlace "Saltar al contenido", regiones aria-live, etiquetas y errores asociados a cada campo.
- El estado nunca depende solo del color: siempre hay ícono + texto. Gráfico con tabla equivalente.
- No hay audio automático al cargar (los navegadores lo bloquean y es mala práctica de accesibilidad).

## Notas técnicas
- Medicamentos, citas y mediciones se guardan en localStorage (este dispositivo). Solo el registro de la persona usa el backend. El siguiente paso natural es crear endpoints para citas, medicamentos y mediciones.
- Las imágenes vienen de LoremFlickr por palabras clave (`src/data/imagenes.js`). Si alguna no carga, se muestra una ilustración de respaldo. Puedes poner tus propias URLs.
- Dictado por voz: Chrome, Edge o Safari, con localhost o HTTPS.
- Contrato del registro: `frontend/src/components/RegistroPersona.jsx` (CAMPOS) ↔ `backend/.../dto/PersonaRequest.java`.
