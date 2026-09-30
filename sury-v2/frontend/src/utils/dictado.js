const MESES = { enero:1, febrero:2, marzo:3, abril:4, mayo:5, junio:6, julio:7, agosto:8, septiembre:9, setiembre:9, octubre:10, noviembre:11, diciembre:12 };

export function normalizarDictado(tipo, texto) {
  const t = texto.trim();
  switch (tipo) {
    case "numero":
      return t.replace(/[^0-9]/g, "");
    case "decimal":
      return t.replace(",", ".").replace(/[^0-9.]/g, "");
    case "tel":
      return t.replace(/[^0-9+]/g, "");
    case "email":
      return t.toLowerCase()
        .replace(/\s+arroba\s+/g, "@").replace(/\s+punto\s+/g, ".")
        .replace(/\s+guion bajo\s+/g, "_").replace(/\s+/g, "");
    case "date": {
      const m = t.toLowerCase().match(/(\d{1,2})\s+de\s+([a-záéíóú]+)\s+de\s+(\d{4})/);
      if (m && MESES[m[2]]) {
        return `${m[3]}-${String(MESES[m[2]]).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
      }
      return "";
    }
    default:
      return t.replace(/\.$/, "");
  }
}
