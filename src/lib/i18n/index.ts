import { getDictionary, type Locale } from "./dictionaries";

export function t(key: keyof ReturnType<typeof getDictionary>, locale: Locale = "de") {
  return getDictionary(locale)[key] ?? key;
}
