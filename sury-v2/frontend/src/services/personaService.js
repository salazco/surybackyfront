const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:8080";

// AJUSTA AQUÍ si tu controlador usa otra ruta
const ENDPOINT = "/api/personas";

export class ApiError extends Error {
  constructor(message, status, fieldErrors = {}) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export async function registrarPersona(payload, signal) {
  let response;
  try {
    response = await fetch(`${API_URL}${ENDPOINT}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new ApiError(
      "No pudimos conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.",
      0
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Soporta {errors: {campo: "msg"}}, {fieldErrors: {...}} o {message: "..."}
    const fieldErrors = data?.errors || data?.fieldErrors || {};
    const message =
      response.status === 409
        ? "Ya existe una persona registrada con ese documento."
        : data?.message || "No se pudo completar el registro.";
    throw new ApiError(message, response.status, fieldErrors);
  }

  return data;
}
