import { useEffect, useMemo, useState } from 'react'
import TablePage from './TablePage'
import apiClient from '../../api/client'
import { type UserResponse } from '../../api/authApi'
import { useUiFeedback } from '../../context/UiFeedbackContext'

type UserListResponse =
  | UserResponse[]
  | {
      users?: UserResponse[]
      data?: UserResponse[]
    }

const getUsersFromPayload = (payload: UserListResponse): UserResponse[] => {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload.users)) {
    return payload.users
  }

  if (Array.isArray(payload.data)) {
    return payload.data
  }

  return []
}

const formatLocation = (location: UserResponse['location']): string => {
  if (!location) {
    return 'N/A'
  }

  if (Array.isArray(location)) {
    return `${location[0]}, ${location[1]}`
  }

  return String(location)
}

function UsersPage () {
  const { withLoading, notify } = useUiFeedback()
  const [users, setUsers] = useState<UserResponse[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState<
    'All' | UserResponse['role']
  >('All')
  const [userStateFilter, setUserStateFilter] = useState<
    'All' | UserResponse['state']
  >('All')

  const fetchUsers = async () => {
    try {
      const response = await withLoading(
        async () => apiClient.get<UserListResponse>('auth/admin/users'),
        'Loading users...'
      )

      setUsers(getUsersFromPayload(response.data))
    } catch (error) {
      console.error('Failed to fetch users', error)
      notify({
        title: 'Users load failed',
        message: 'Unable to load users at the moment.',
        tone: 'error'
      })
    }
  }

  useEffect(() => {
    void fetchUsers()
  }, [notify, withLoading])

  const handleChangeRole = async (userId: string, currentRole: string) => {
    // check if current user is the same as the one being updated
    const currentUserId = localStorage.getItem('afms_admin_user_id')
    if (currentUserId === userId) {
      notify({
        tone: 'error',
        title: 'Role change not allowed',
        message: 'You cannot change your own role.'
      })
      return
    }

    // Confirm action with the admin before proceeding
    const confirmed = window.confirm(
      `Are you sure you want to change the role from "${currentRole}" to "${
        currentRole === 'ADMIN' ? 'USER' : 'ADMIN'
      }"?`
    )
    if (!confirmed) {
      return
    }
    // Toggle between 'ADMIN' and 'USER'
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN'

    try {
      await withLoading(
        async () =>
          apiClient.put(`auth/admin/users/${userId}/role`, {
            role: newRole
          }),
        'Updating user role...'
      )

      notify({
        tone: 'success',
        title: 'Role updated',
        message: `User role changed to ${newRole}`
      })

      await fetchUsers()
    } catch (error) {
      console.error('Failed to change user role', error)
      notify({
        tone: 'error',
        title: 'Role update failed',
        message: 'Unable to update user role at this time.'
      })
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete user "${userName}"?\n\nThis action cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    try {
      await withLoading(
        async () => apiClient.delete(`auth/admin/users/${userId}`),
        'Deleting user...'
      )

      notify({
        tone: 'success',
        title: 'User deleted',
        message: `User "${userName}" has been deleted successfully.`
      })

      await fetchUsers()
    } catch (error) {
      console.error('Failed to delete user', error)
      notify({
        tone: 'error',
        title: 'Delete failed',
        message: 'Unable to delete user at this time.'
      })
    }
  }

  const filteredUsers = useMemo(
    () =>
      users.filter(user => {
        const searchValue = userSearch.toLowerCase()
        const userId = (user._id ?? '').toLowerCase()
        const userName = (user.name ?? '').toLowerCase()
        const userEmail = (user.email ?? '').toLowerCase()
        const userPhone = (user.phone ?? '').toLowerCase()
        const userState = (user.state ?? '').toLowerCase()
        const userLga = (user.lga ?? '').toLowerCase()
        const matchesSearch =
          userId.includes(searchValue) ||
          userName.includes(searchValue) ||
          userEmail.includes(searchValue) ||
          userPhone.includes(searchValue) ||
          userState.includes(searchValue) ||
          userLga.includes(searchValue)
        const matchesRole =
          userRoleFilter === 'All' || user.role === userRoleFilter
        const matchesState =
          userStateFilter === 'All' || user.state === userStateFilter
        return matchesSearch && matchesRole && matchesState
      }),
    [users, userSearch, userRoleFilter, userStateFilter]
  )

  const uniqueStates = useMemo(
    () =>
      Array.from(
        new Set(
          users
            .map(user => user.state)
            .filter((state): state is string =>
              Boolean(state && state !== 'N/A')
            )
        )
      ),
    [users]
  )

  return (
    <TablePage
      title='Manage Users'
      controls={
        <>
          <input
            type='search'
            placeholder='name, email, phone, state or LGA'
            value={userSearch}
            onChange={event => setUserSearch(event.target.value)}
          />
          <select
            value={userRoleFilter}
            onChange={event =>
              setUserRoleFilter(
                event.target.value as 'All' | UserResponse['role']
              )
            }
          >
            <option value='All'>All Roles</option>
            <option value='Admin'>Admin</option>
            <option value='USER'>User</option>
          </select>
          <select
            value={userStateFilter}
            onChange={event =>
              setUserStateFilter(
                event.target.value as 'All' | UserResponse['state']
              )
            }
          >
            <option value='All'>All States</option>
            {uniqueStates.map(state => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </>
      }
      table={
        <table>
          <thead>
            <tr>
              <th>S/N</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>State</th>
              <th>LGA</th>
              <th>Location</th>
              <th>Role</th>
              <th>Manage</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={user._id ?? user.email}>
                <td>{index + 1}</td>
                <td>{user.name ?? 'Unknown'}</td>
                <td>{user.email}</td>
                <td>{user.phone ?? ''}</td>
                <td>{user.state}</td>
                <td>{user.lga}</td>
                <td>{formatLocation(user.location)}</td>
                <td>{user.role}</td>
                <td>
                  <select
                    defaultValue=''
                    onChange={event => {
                      const action = event.target.value
                      event.target.value = ''

                      if (action === 'change-role') {
                        void handleChangeRole(
                          user._id ?? '',
                          user.role ?? 'USER'
                        )
                      } else if (action === 'delete-user') {
                        void handleDeleteUser(
                          user._id ?? '',
                          user.name ?? user.email
                        )
                      }
                    }}
                  >
                    <option value='' disabled>
                      Select action
                    </option>
                    <option value='change-role'>Change Role</option>
                    <option value='delete-user'>Delete User</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    />
  )
}

export default UsersPage
