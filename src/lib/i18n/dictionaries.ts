export type Locale = "de" | "en";

export const dictionaries = {
  de: {
    appName: "MarginType",
    login: "Anmelden",
    register: "Registrieren",
    logout: "Abmelden",
    email: "E-Mail",
    password: "Passwort",
    name: "Name",
    dashboard: "Bücher",
    newBook: "Neues Buch",
    bookTitle: "Buchtitel",
    createBook: "Buch erstellen",
    chapterAdd: "Kapitel hinzufügen",
    projectSettings: "Projekteinstellungen",
    export: "Export",
    noteAdd: "Notiz hinzufügen",
    description: "Beschreibung",
    summary: "Zusammenfassung",
    styleAnalysis: "Stilanalyse",
    repetitions: "Wiederholungen",
    members: "Mitglieder",
    language: "Sprache",
    save: "Speichern",
    manuscriptPlaceholder: "Beginne mit deinem Manuskript …",
    plannedChapter: "Geplantes Kapitel",
    status: "Status",
    targetWords: "Zielwortanzahl",
    notes: "Notizen"
  },
  en: {
    appName: "MarginType"
  }
} as const;

export type TranslationKey = keyof (typeof dictionaries)["de"];

export function getDictionary(locale: Locale = "de") {
  return dictionaries[locale] ?? dictionaries.de;
}
