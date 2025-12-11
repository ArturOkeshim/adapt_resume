import ruTranslation from '../locales/ru.json'
import enTranslation from '../locales/en.json'

export type Language = 'ru' | 'en'

const translations = {
  ru: ruTranslation,
  en: enTranslation,
}

// Простая функция для получения объекта переводов
export function getTranslations(language: Language) {
  return translations[language]
}