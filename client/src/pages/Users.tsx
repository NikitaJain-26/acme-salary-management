import { useEffect, useState, type FormEvent } from 'react'
import { apiClient } from '../services/employeeApi'
import type { UserRole } from '../auth/context'
import DataTable, { type DataTableColumn } from '../components/ui/DataTable'
import { useTranslation } from 'react-i18next'

interface ManagedUser {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
}

function Users() {
  const { t } = useTranslation()
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const columns: DataTableColumn<ManagedUser>[] = [
    {
      key: 'name',
      header: t('common.name'),
      cellClassName: 'px-5 py-4 font-medium text-slate-900',
      render: (user) => user.name,
    },
    { key: 'email', header: t('common.email'), render: (user) => user.email },
    {
      key: 'role',
      header: t('common.role'),
      cellClassName: 'px-5 py-4',
      render: (user) => (
        <select
          aria-label={t('users.roleFor', { name: user.name })}
          className="rounded-lg border border-slate-300 px-2 py-1"
          onChange={(event) => updateRole(user, event.target.value as UserRole)}
          value={user.role}
        >
          <option value="VIEWER">{t('common.viewer')}</option>
          <option value="ADMIN">{t('common.admin')}</option>
        </select>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      cellClassName: 'px-5 py-4',
      render: (user) => (
        <button
          className="text-sm font-medium text-red-700 hover:underline"
          onClick={() => deleteUser(user)}
          type="button"
        >
          {t('users.delete')}
        </button>
      ),
    },
  ]

  async function loadUsers() {
    setLoading(true)
    try {
      const response = await apiClient.get<{ users: ManagedUser[] }>('/auth/users')
      setUsers(response.data.users)
      setError('')
    } catch {
      setError(t('users.loadError'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    apiClient.get<{ users: ManagedUser[] }>('/auth/users')
      .then(({ data }) => {
        if (active) {
          setUsers(data.users)
        }
      })
      .catch(() => {
        if (active) {
          setError(t('users.loadError'))
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [t])

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await apiClient.post('/auth/users', {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role'),
      })
      form.reset()
      setSuccess(t('users.createSuccess'))
      await loadUsers()
    } catch {
      setError(
        t('users.createError'),
      )
    } finally {
      setSaving(false)
    }
  }

  async function updateRole(user: ManagedUser, role: UserRole) {
    setError('')
    setSuccess('')
    try {
      await apiClient.patch(`/auth/users/${encodeURIComponent(user.id)}/role`, { role })
      setSuccess(t('users.roleUpdated', { name: user.name }))
      await loadUsers()
    } catch {
      setError(t('users.roleUpdateError'))
    }
  }

  async function deleteUser(user: ManagedUser) {
    if (!window.confirm(t('users.deleteConfirm', { name: user.name }))) {
      return
    }

    setError('')
    setSuccess('')
    try {
      await apiClient.delete(`/auth/users/${encodeURIComponent(user.id)}`)
      setSuccess(t('users.deleteSuccess', { name: user.name }))
      await loadUsers()
    } catch {
      setError(t('users.deleteError'))
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{t('users.title')}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {t('users.description')}
        </p>
      </div>

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">{t('users.addUser')}</h2>
        <form className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={createUser}>
          <label className="text-sm font-medium text-slate-700">
            {t('users.fullName')}
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" maxLength={100} name="name" required />
          </label>
          <label className="text-sm font-medium text-slate-700">
            {t('common.email')}
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" name="email" required type="email" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            {t('users.temporaryPassword')}
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" minLength={12} maxLength={128} name="password" required type="password" />
            <span className="mt-1 block text-xs font-normal text-slate-500">{t('users.passwordHint')}</span>
          </label>
          <label className="text-sm font-medium text-slate-700">
            {t('users.accessRole')}
            <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" defaultValue="VIEWER" name="role">
              <option value="VIEWER">{t('users.viewerRole')}</option>
              <option value="ADMIN">{t('users.adminRole')}</option>
            </select>
          </label>
          {error && <p className="text-sm text-red-600 md:col-span-2" role="alert">{error}</p>}
          {success && <p className="text-sm text-green-700 md:col-span-2" role="status">{success}</p>}
          <div className="md:col-span-2">
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50" disabled={saving} type="submit">
              {saving ? t('users.creating') : t('users.create')}
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <h2 className="border-b border-slate-200 px-5 py-4 font-semibold text-slate-900">{t('users.accounts')}</h2>
        {loading ? (
          <p className="p-6 text-sm text-slate-500" role="status">{t('users.loading')}</p>
        ) : users.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">{t('users.empty')}</p>
        ) : (
          <DataTable
            columns={columns}
            getRowKey={(user) => user.id}
            rows={users}
          />
        )}
      </section>
    </div>
  )
}

export default Users
