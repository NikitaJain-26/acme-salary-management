import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en/translation.json'
import es from './locales/es/translation.json'

const storedLanguage = localStorage.getItem('acme-language')
const initialLanguage = storedLanguage === 'es' ? 'es' : 'en'

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  lng: initialLanguage,
  supportedLngs: ['en', 'es'],
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

i18n.on('languageChanged', (language) => {
  document.documentElement.lang = language
})

document.documentElement.lang = initialLanguage

export default i18n
