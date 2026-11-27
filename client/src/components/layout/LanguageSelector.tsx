import { useTranslation } from 'react-i18next'
import i18n from '../../i18n'

function LanguageSelector() {
  const { t, i18n: translation } = useTranslation()

  return (
    <label className="flex items-center gap-2 text-sm text-slate-600">
      <select
        aria-label={t('common.language')}
        className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-700"
        onChange={(event) => {
          const language = event.target.value
          localStorage.setItem('acme-language', language)
          void i18n.changeLanguage(language)
        }}
        value={translation.resolvedLanguage ?? 'en'}
      >
        <option value="en">{t('common.english')}</option>
        <option value="es">{t('common.spanish')}</option>
      </select>
    </label>
  )
}

export default LanguageSelector
