import { useState, type FormEvent } from 'react'
import { apiClient } from '../services/employeeApi'
import { useAuth } from '../auth/useAuth'
import { useTranslation } from 'react-i18next'

function Account() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const form = event.currentTarget
    const currentPassword = String(formData.get('currentPassword') || '')
    const newPassword = String(formData.get('newPassword') || '')
    const confirmPassword = String(formData.get('confirmPassword') || '')

    if (newPassword !== confirmPassword) {
      setError(t('account.passwordMismatch'))
      setSuccess('')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
      })
      form.reset()
      setSuccess(t('account.passwordSuccess'))
    } catch (requestError) {
      const message =
        typeof requestError === 'object' &&
        requestError !== null &&
        'response' in requestError &&
        requestError.response &&
        typeof requestError.response === 'object' &&
        'data' in requestError.response &&
        requestError.response.data &&
        typeof requestError.response.data === 'object' &&
        'message' in requestError.response.data
          ? String(requestError.response.data.message)
          : t('account.passwordError')
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{t('account.title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('account.description')}</p>
      </div>

      <section className="max-w-xl rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">{t('account.details')}</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">{t('account.name')}</dt>
            <dd className="font-medium text-slate-900">{user?.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500">{t('common.email')}</dt>
            <dd className="font-medium text-slate-900">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-slate-500">{t('account.role')}</dt>
            <dd className="font-medium text-slate-900">{user?.role === 'ADMIN' ? t('common.administrator') : t('common.viewer')}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 max-w-xl rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">{t('account.changePassword')}</h2>
        <form className="mt-4 grid gap-4" onSubmit={changePassword}>
          <label className="text-sm font-medium text-slate-700">
            {t('account.currentPassword')}
            <input autoComplete="current-password" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" name="currentPassword" required type="password" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            {t('account.newPassword')}
            <input autoComplete="new-password" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" minLength={12} maxLength={128} name="newPassword" required type="password" />
            <span className="mt-1 block text-xs font-normal text-slate-500">{t('account.passwordHint')}</span>
          </label>
          <label className="text-sm font-medium text-slate-700">
            {t('account.confirmPassword')}
            <input autoComplete="new-password" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" minLength={12} maxLength={128} name="confirmPassword" required type="password" />
          </label>
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          {success && <p className="text-sm text-green-700" role="status">{success}</p>}
          <button className="justify-self-start rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50" disabled={saving} type="submit">
            {saving ? t('common.saving') : t('account.changePassword')}
          </button>
        </form>
      </section>
    </div>
  )
}

export default Account
