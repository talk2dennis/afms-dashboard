import { useMemo, useState } from 'react'
import TablePage from './TablePage'
import { alerts, type Alert } from './data'

function AlertsPage () {
  const [alertSearch, setAlertSearch] = useState('')
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<
    'All' | Alert['severity']
  >('All')
  const [alertStatusFilter, setAlertStatusFilter] = useState<
    'All' | Alert['status']
  >('All')

  const filteredAlerts = useMemo(
    () =>
      alerts.filter(alert => {
        const searchValue = alertSearch.toLowerCase()
        const matchesSearch =
          alert.id.toLowerCase().includes(searchValue) ||
          alert.title.toLowerCase().includes(searchValue)
        const matchesSeverity =
          alertSeverityFilter === 'All' ||
          alert.severity === alertSeverityFilter
        const matchesStatus =
          alertStatusFilter === 'All' || alert.status === alertStatusFilter
        return matchesSearch && matchesSeverity && matchesStatus
      }),
    [alertSearch, alertSeverityFilter, alertStatusFilter]
  )

  return (
    <TablePage
      title='Flood Alerts'
      controls={
        <>
          <input
            type='search'
            placeholder='Search by alert ID or title'
            value={alertSearch}
            onChange={event => setAlertSearch(event.target.value)}
          />
          <select
            value={alertSeverityFilter}
            onChange={event =>
              setAlertSeverityFilter(
                event.target.value as 'All' | Alert['severity']
              )
            }
          >
            <option value='All'>All Severities</option>
            <option value='Emergency'>Emergency</option>
            <option value='Warning'>Warning</option>
            <option value='Watch'>Watch</option>
          </select>
          <select
            value={alertStatusFilter}
            onChange={event =>
              setAlertStatusFilter(
                event.target.value as 'All' | Alert['status']
              )
            }
          >
            <option value='All'>All Status</option>
            <option value='Draft'>Draft</option>
            <option value='Scheduled'>Scheduled</option>
            <option value='Published'>Published</option>
          </select>
        </>
      }
      table={
        <table>
          <thead>
            <tr>
              <th>Alert ID</th>
              <th>Title</th>
              <th>Severity</th>
              <th>Audience</th>
              <th>Status</th>
              <th>Manage</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.map(alert => (
              <tr key={alert.id}>
                <td>{alert.id}</td>
                <td>{alert.title}</td>
                <td>{alert.severity}</td>
                <td>{alert.audience}</td>
                <td>{alert.status}</td>
                <td>
                  <select defaultValue=''>
                    <option value='' disabled>
                      Select action
                    </option>
                    <option>Edit flood alert</option>
                    <option>Schedule alert</option>
                    <option>Publish now</option>
                    <option>Delete alert</option>
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

export default AlertsPage
