import { useEffect, useState, type FormEvent } from 'react'
import { apiClient } from '../services/employeeApi'
import type { UserRole } from '../auth/context'
import DataTable, { type DataTableColumn } from '../components/ui/DataTable'

interface ManagedUser {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
}

function Users() {
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const columns: DataTableColumn<ManagedUser>[] = [
    {
      key: 'name',
      header: 'Name',
      cellClassName: 'px-5 py-4 font-medium text-slate-900',
      render: (user) => user.name,
    },
    { key: 'email', header: 'Email', render: (user) => user.email },
    {
      key: 'role',
      header: 'Role',
      cellClassName: 'px-5 py-4',
      render: (user) => (
        <select
          aria-label={`Role for ${user.name}`}
          className="rounded-lg border border-slate-300 px-2 py-1"
          onChange={(event) => updateRole(user, event.target.value as UserRole)}
          value={user.role}
        >
          <option value="VIEWER">Viewer</option>
          <option value="ADMIN">Admin</option>
        </select>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cellClassName: 'px-5 py-4',
      render: (user) => (
        <button
          className="text-sm font-medium text-red-700 hover:underline"
          onClick={() => deleteUser(user)}
          type="button"
        >
          Delete
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
      setError('Could not load HR accounts.')
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
          setError('Could not load HR accounts.')
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
  }, [])

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
      setSuccess('HR account created.')
      await loadUsers()
    } catch {
      setError(
        'Could not create account. Check the email, password length, and whether the email is already in use.',
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
      setSuccess(`Updated ${user.name}'s role.`)
      await loadUsers()
    } catch {
      setError('Could not update the account role.')
    }
  }

  async function deleteUser(user: ManagedUser) {
    if (!window.confirm(`Delete the account for ${user.name}?`)) {
      return
    }

    setError('')
    setSuccess('')
    try {
      await apiClient.delete(`/auth/users/${encodeURIComponent(user.id)}`)
      setSuccess(`Deleted ${user.name}'s account.`)
      await loadUsers()
    } catch {
      setError('Could not delete the account. At least one administrator must remain.')
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">HR accounts</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create individual accounts and grant administrator or read-only access.
        </p>
      </div>

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">Add an HR user</h2>
        <form className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={createUser}>
          <label className="text-sm font-medium text-slate-700">
            Full name
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" maxLength={100} name="name" required />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Email
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" name="email" required type="email" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Temporary password
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" minLength={12} maxLength={128} name="password" required type="password" />
            <span className="mt-1 block text-xs font-normal text-slate-500">At least 12 characters. Share it with the user securely.</span>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Access role
            <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" defaultValue="VIEWER" name="role">
              <option value="VIEWER">Viewer — read only</option>
              <option value="ADMIN">Admin — manage data and accounts</option>
            </select>
          </label>
          {error && <p className="text-sm text-red-600 md:col-span-2" role="alert">{error}</p>}
          {success && <p className="text-sm text-green-700 md:col-span-2" role="status">{success}</p>}
          <div className="md:col-span-2">
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50" disabled={saving} type="submit">
              {saving ? 'Creating...' : 'Create account'}
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <h2 className="border-b border-slate-200 px-5 py-4 font-semibold text-slate-900">Accounts</h2>
        {loading ? (
          <p className="p-6 text-sm text-slate-500" role="status">Loading accounts...</p>
        ) : users.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No HR accounts found.</p>
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
