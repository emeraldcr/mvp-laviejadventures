// Keep Spanish editorial copy in the same respectful local voice.
const forms: Record<string, string> = {
  "vos": "usted", "tú": "usted", "tu": "su", "tus": "sus", "te": "le", "tenés": "tiene", "querés": "quiere", "podés": "puede",
  "necesitás": "necesita", "estás": "está", "sos": "es", "sentís": "siente", "preferís": "prefiere", "sabés": "sabe", "venís": "viene",
  "buscás": "busca", "llegás": "llega", "salís": "sale", "hacés": "hace", "usás": "usa", "llevás": "lleva", "vayás": "vaya", "reservás": "reserva",
  "elegí": "elija", "elige": "elija", "reservá": "reserve", "mirá": "mire", "confirmá": "confirme", "llegá": "llegue", "llevá": "lleve", "buscanos": "búsquenos",
  "preguntá": "pregunte", "escribinos": "escríbanos", "avisá": "avise", "contanos": "cuéntenos", "tomés": "tome", "tocá": "toque", "traé": "traiga", "veas": "vea", "vas": "va", "uses": "use",
  "practicás": "practica", "mojarte": "mojarse", "sentirte": "sentirse", "adéntrate": "adéntrese", "descubre": "descubra", "recorre": "recorra", "deja": "deje", "usa": "use", "escribe": "escriba", "revisa": "revise", "acepta": "acepte", "prefiere": "prefiere", "finaliza": "finalice", "has": "ha",
  "camina": "camine", "disfruta": "disfrute", "vive": "viva", "explora": "explore", "observa": "observe", "escucha": "escuche", "conecta": "conecte",
  "sumérgete": "sumérjase", "enfrenta": "enfrente", "buscá": "busque", "seguí": "siga", "recordá": "recuerde", "preparate": "prepárese", "consultá": "consulte", "consultanos": "consúltenos", "selecciona": "seleccione", "continúa": "continúe", "completa": "complete", "intenta": "intente",
};
const pattern = new RegExp(`(?<![\\p{L}\\p{N}_])(${Object.keys(forms).join("|")})(?![\\p{L}\\p{N}_])`, "giu");
export function usted(text: string): string {
  return text.replace(pattern, word => {
    const replacement = forms[word.toLocaleLowerCase("es")];
    return word[0] === word[0].toLocaleUpperCase("es") ? replacement[0].toLocaleUpperCase("es") + replacement.slice(1) : replacement;
  });
}

export function withUstedeo<T>(value: T): T {
  if (typeof value === "string") return usted(value) as T;
  if (Array.isArray(value)) return value.map(withUstedeo) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, withUstedeo(item)])) as T;
  return value;
}
