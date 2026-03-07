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

  // send alert
  const handleSendReport = async (alertid: string, alertTitle: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to send Alert: "${alertTitle}"?\n\nThis action cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    try {
      await withLoading(
        async () => apiClient.post(`alerts/${alertid}/send`),
        'Sending alert...'
      )

      notify({
        tone: 'success',
        title: 'Alert sent',
        message: `Alert "${alertTitle}" has been removed.`
      })

      await fetchAlerts()
    } catch (error) {
      console.error('Failed to send alert', error)
      notify({
        tone: 'error',
        title: 'send failed',
        message: 'Unable to send alert at this time.'
      })
    }
  }

  // delete alert
  const handleDeleteReport = async (alertid: string, alertTitle: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete Alert: "${alertTitle}"?\n\nThis action cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    try {
      await withLoading(
        async () => apiClient.delete(`alerts/${alertid}`),
        'Deleting alert...'
      )

      notify({
        tone: 'success',
        title: 'Alert deleted',
        message: `Alert "${alertTitle}" has been removed.`
      })

      await fetchAlerts()
    } catch (error) {
      console.error('Failed to delete alert', error)
      notify({
        tone: 'error',
        title: 'Delete failed',
        message: 'Unable to delete alert at this time.'
      })
    }
  }

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
                  <select
                    defaultValue=''
                    onChange={event => {
                      const action = event.target.value
                      event.target.value = ''

                      if (action === 'send-alert') {
                        void handleSendReport(alert._id, alert.title)
                      } else if (action === 'delete-alert') {
                        void handleSendReport(alert._id, alert.title)
                      }
                    }}
                  >
                    <option value='' disabled>
                      Select action
                    </option>
                    <option value='edit-alert'>Edit flood alert</option>
                    <option value='create-alert'>Create alert</option>
                    <option value='send-alert'>Send Alert</option>
                    <option value='delete-alert'>Delete alert</option>
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
