import { useMemo, useState, useEffect } from 'react'
import TablePage from './TablePage'
import { type alertResponse } from '../../api/authApi'
import { useUiFeedback } from '../../context/UiFeedbackContext'
import apiClient from '../../api/client'

function AlertsPage () {
  const { withLoading, notify } = useUiFeedback()
  const [alerts, setAlerts] = useState<alertResponse[]>([])
  const [alertSearch, setAlertSearch] = useState('')
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<
    'All' | alertResponse['severity']
  >('All')
  const [alertStatusFilter, setAlertStatusFilter] = useState<
    'All' | alertResponse['status']
  >('All')

  const filteredAlerts = useMemo(
    () =>
      alerts.filter(alert => {
        const searchValue = alertSearch.toLowerCase()
        const matchesSearch =
          alert.message.toLowerCase().includes(searchValue) ||
          alert.title.toLowerCase().includes(searchValue) ||
          alert.target.state.toLowerCase().includes(searchValue) ||
          alert.target.lga.toLowerCase().includes(searchValue)
        const matchesSeverity =
          alertSeverityFilter === 'All' ||
          alert.severity === alertSeverityFilter
        const matchesStatus =
          alertStatusFilter === 'All' || alert.status === alertStatusFilter
        return matchesSearch && matchesSeverity && matchesStatus
      }),
    [alertSearch, alertSeverityFilter, alertStatusFilter]
  )

  // fetch data from backend
  const fetchAlerts = async () => {
    try {
      const response = await withLoading(
        async () => apiClient.get<alertResponse[]>('alerts/'),
        'Fetching flood alerts...'
      )
      setAlerts(response.data)
    } catch (error) {
      console.error('Failed to fetch reports', error)
      notify({
        message: 'Failed to fetch reports',
        tone: 'error'
      })
    }
  }
  useEffect(() => {
    fetchAlerts()
  }, [notify, withLoading])

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
                event.target.value as 'All' | alertResponse['severity']
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
                event.target.value as 'All' | alertResponse['status']
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
              <th>S/No</th>
              <th>Title</th>
              <th>State</th>
              <th>LGA</th>
              <th>Severity</th>
              <th>Channel</th>
              <th>Status</th>
              <th>Manage</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.map((alert, index) => (
              <tr key={index + 1}>
                <td>{alert.title}</td>
                <td>{alert.target.state}</td>
                <td>{alert.target.lga}</td>
                <td>{alert.severity}</td>
                <td>
                  <td>{alert.channels.email ? 'EMAIL' : 'N/A'}</td>
                  <td>{alert.channels.sms ? 'SMS' : 'N/A'}</td>
                  <td>{alert.channels.push ? 'PUSH' : 'N/A'}</td>
                </td>
                <td>{alert.status}</td>
                <td>
                  <select defaultValue=''>
                    <option value='' disabled>
                      Select action
                    </option>
                    <option>Edit flood alert</option>
                    <option>Create alert</option>
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
