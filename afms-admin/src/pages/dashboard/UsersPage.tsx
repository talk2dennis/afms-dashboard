import { useMemo, useState } from 'react'
import TablePage from './TablePage'
import { users, type User } from './data'

function UsersPage () {
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState<'All' | User['role']>(
    'All'
  )
  const [userStatusFilter, setUserStatusFilter] = useState<
    'All' | User['status']
  >('All')

  const filteredUsers = useMemo(
    () =>
      users.filter(user => {
        const searchValue = userSearch.toLowerCase()
        const matchesSearch =
          user.id.toLowerCase().includes(searchValue) ||
          user.name.toLowerCase().includes(searchValue) ||
          user.email.toLowerCase().includes(searchValue)
        const matchesRole =
          userRoleFilter === 'All' || user.role === userRoleFilter
        const matchesStatus =
          userStatusFilter === 'All' || user.status === userStatusFilter
        return matchesSearch && matchesRole && matchesStatus
      }),
    [userSearch, userRoleFilter, userStatusFilter]
  )

  return (
    <TablePage
      title='Manage Residents'
      controls={
        <>
          <input
            type='search'
            placeholder='Search by ID, name or email'
            value={userSearch}
            onChange={event => setUserSearch(event.target.value)}
          />
          <select
            value={userRoleFilter}
            onChange={event =>
              setUserRoleFilter(event.target.value as 'All' | User['role'])
            }
          >
            <option value='All'>All Roles</option>
            <option value='Admin'>Admin</option>
            <option value='Field Officer'>Field Officer</option>
            <option value='Resident'>Resident</option>
          </select>
          <select
            value={userStatusFilter}
            onChange={event =>
              setUserStatusFilter(event.target.value as 'All' | User['status'])
            }
          >
            <option value='All'>All Status</option>
            <option value='Active'>Active</option>
            <option value='Blocked'>Blocked</option>
            <option value='Pending Verification'>Pending Verification</option>
          </select>
        </>
      }
      table={
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Manage</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.status}</td>
                <td>
                  <select defaultValue=''>
                    <option value='' disabled>
                      Select action
                    </option>
                    <option>View resident profile</option>
                    <option>Approve account</option>
                    <option>Block account</option>
                    <option>Delete account</option>
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
