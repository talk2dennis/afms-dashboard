import { useMemo, useState } from 'react'
import TablePage from './TablePage'
import { notifications, type Notification } from './data'

function NotificationsPage () {
  const [notificationSearch, setNotificationSearch] = useState('')
  const [notificationChannelFilter, setNotificationChannelFilter] = useState<
    'All' | Notification['channel']
  >('All')
  const [notificationStatusFilter, setNotificationStatusFilter] = useState<
    'All' | Notification['status']
  >('All')

  const filteredNotifications = useMemo(
    () =>
      notifications.filter(notification => {
        const searchValue = notificationSearch.toLowerCase()
        const matchesSearch =
          notification.id.toLowerCase().includes(searchValue) ||
          notification.title.toLowerCase().includes(searchValue)
        const matchesChannel =
          notificationChannelFilter === 'All' ||
          notification.channel === notificationChannelFilter
        const matchesStatus =
          notificationStatusFilter === 'All' ||
          notification.status === notificationStatusFilter
        return matchesSearch && matchesChannel && matchesStatus
      }),
    [notificationSearch, notificationChannelFilter, notificationStatusFilter]
  )

  return (
    <TablePage
      title='Emergency Notifications'
      controls={
        <>
          <input
            type='search'
            placeholder='Search by notification ID or title'
            value={notificationSearch}
            onChange={event => setNotificationSearch(event.target.value)}
          />
          <select
            value={notificationChannelFilter}
            onChange={event =>
              setNotificationChannelFilter(
                event.target.value as 'All' | Notification['channel']
              )
            }
          >
            <option value='All'>All Channels</option>
            <option value='Email'>Email</option>
            <option value='Push'>Push</option>
            <option value='SMS'>SMS</option>
            <option value='In-App'>In-App</option>
          </select>
          <select
            value={notificationStatusFilter}
            onChange={event =>
              setNotificationStatusFilter(
                event.target.value as 'All' | Notification['status']
              )
            }
          >
            <option value='All'>All Status</option>
            <option value='Draft'>Draft</option>
            <option value='Queued'>Queued</option>
            <option value='Sent'>Sent</option>
          </select>
        </>
      }
      table={
        <table>
          <thead>
            <tr>
              <th>Notification ID</th>
              <th>Title</th>
              <th>Channel</th>
              <th>Audience</th>
              <th>Status</th>
              <th>Manage</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotifications.map(notification => (
              <tr key={notification.id}>
                <td>{notification.id}</td>
                <td>{notification.title}</td>
                <td>{notification.channel}</td>
                <td>{notification.audience}</td>
                <td>{notification.status}</td>
                <td>
                  <select defaultValue=''>
                    <option value='' disabled>
                      Select action
                    </option>
                    <option>Edit notification</option>
                    <option>Send now</option>
                    <option>Queue campaign</option>
                    <option>Delete notification</option>
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

export default NotificationsPage
