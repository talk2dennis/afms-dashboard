import { useMemo, useState, useEffect } from 'react'
import TablePage from './TablePage'
import { type alertResponse } from '../../api/authApi'
import { useUiFeedback } from '../../context/UiFeedbackContext'
import apiClient from '../../api/client'
import statesLGAs from './ng_st_lga'

type CreateAlertPayload = Pick<
  alertResponse,
  'title' | 'message' | 'severity' | 'target' | 'channels'
>

const ALERT_SEVERITIES: alertResponse['severity'][] = [
  'INFO',
  'WARNING',
  'CRITICAL'
]
const ALERT_STATUSES: alertResponse['status'][] = ['DRAFT', 'SENT']

const defaultCreateAlertPayload = (): CreateAlertPayload => ({
  title: '',
  message: '',
  severity: 'WARNING',
  target: { state: '', lga: '' },
  channels: {
    email: true,
    sms: false,
    push: true
  }
})

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [alertModalMode, setAlertModalMode] = useState<'create' | 'edit'>(
    'create'
  )
  const [editingAlertId, setEditingAlertId] = useState<string | null>(null)
  const [createAlertPayload, setCreateAlertPayload] =
    useState<CreateAlertPayload>(defaultCreateAlertPayload)

  const stateOptions = useMemo(() => statesLGAs.map(entry => entry.state), [])

  const lgaOptions = useMemo(() => {
    const selectedState = statesLGAs.find(
      entry => entry.state === createAlertPayload.target.state
    )
    return selectedState?.lgas ?? []
  }, [createAlertPayload.target.state])

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
    [alerts, alertSearch, alertSeverityFilter, alertStatusFilter]
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

  const openCreateAlertModal = () => {
    setAlertModalMode('create')
    setEditingAlertId(null)
    setCreateAlertPayload(defaultCreateAlertPayload())
    setIsCreateModalOpen(true)
  }

  const openEditAlertModal = (alert: alertResponse) => {
    setAlertModalMode('edit')
    setEditingAlertId(alert._id)
    setCreateAlertPayload({
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      target: {
        state: alert.target.state,
        lga: alert.target.lga
      },
      channels: {
        email: alert.channels.email,
        sms: alert.channels.sms,
        push: alert.channels.push
      }
    })
    setIsCreateModalOpen(true)
  }

  const closeAlertModal = () => {
    setIsCreateModalOpen(false)
    setAlertModalMode('create')
    setEditingAlertId(null)
    setCreateAlertPayload(defaultCreateAlertPayload())
  }

  const handleSubmitAlert = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const payload: CreateAlertPayload = {
      ...createAlertPayload,
      title: createAlertPayload.title.trim(),
      message: createAlertPayload.message.trim(),
      target: {
        state: createAlertPayload.target.state.trim(),
        lga: createAlertPayload.target.lga.trim()
      }
    }

    if (
      payload.title.length === 0 ||
      payload.message.length === 0 ||
      payload.target.state.length === 0 ||
      payload.target.lga.length === 0
    ) {
      notify({
        tone: 'error',
        title: 'Missing details',
        message: 'Please complete all required fields before creating an alert.'
      })
      return
    }

    try {
      const response =
        alertModalMode === 'edit' && editingAlertId != null
          ? await withLoading(
              async () =>
                apiClient.put<alertResponse>(
                  `alerts/${editingAlertId}`,
                  payload
                ),
              'Updating alert...'
            )
          : await withLoading(
              async () => apiClient.post<alertResponse>('alerts/', payload),
              'Creating alert...'
            )

      notify({
        tone: 'success',
        title: alertModalMode === 'edit' ? 'Alert updated' : 'Alert created',
        message:
          alertModalMode === 'edit'
            ? `Alert "${response.data.title}" was updated successfully.`
            : `Alert "${response.data.title}" was created successfully.`
      })

      closeAlertModal()
      await fetchAlerts()
    } catch (error) {
      console.error('Failed to submit alert', error)
      notify({
        tone: 'error',
        title: alertModalMode === 'edit' ? 'Update failed' : 'Create failed',
        message:
          alertModalMode === 'edit'
            ? 'Unable to update alert at this time.'
            : 'Unable to create alert at this time.'
      })
    }
  }

  // send alert
  const handleSendAlert = async (alertid: string, alertTitle: string) => {
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
  const handleDeleteAlert = async (alertid: string, alertTitle: string) => {
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
    <>
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
              {ALERT_SEVERITIES.map(severity => (
                <option key={severity} value={severity}>
                  {severity}
                </option>
              ))}
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
              {ALERT_STATUSES.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button
              type='button'
              className='create-alert-button'
              onClick={() => {
                openCreateAlertModal()
              }}
            >
              Create Alert
            </button>
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
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{alert.title}</td>
                  <td>{alert.target.state}</td>
                  <td>{alert.target.lga}</td>
                  <td>{alert.severity}</td>
                  <td>
                    {alert.channels.email && 'Email'}
                    {alert.channels.sms && ', SMS '}
                    {alert.channels.push && ', Push'}
                  </td>
                  <td>{alert.status}</td>
                  <td>
                    <select
                      defaultValue=''
                      onChange={event => {
                        const action = event.target.value
                        event.target.value = ''

                        if (action === 'send-alert') {
                          void handleSendAlert(alert._id, alert.title)
                        } else if (action === 'delete-alert') {
                          void handleDeleteAlert(alert._id, alert.title)
                        } else if (action === 'edit-alert') {
                          openEditAlertModal(alert)
                        } else if (action === 'create-alert') {
                          openCreateAlertModal()
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

      {isCreateModalOpen && (
        <div
          className='alert-modal-overlay'
          role='presentation'
          onClick={() => {
            closeAlertModal()
          }}
        >
          <div
            className='alert-modal'
            role='dialog'
            aria-modal='true'
            aria-label={
              alertModalMode === 'edit'
                ? 'Edit flood alert'
                : 'Create flood alert'
            }
            onClick={event => {
              event.stopPropagation()
            }}
          >
            <h3>
              {alertModalMode === 'edit'
                ? 'Edit Flood Alert'
                : 'Create Flood Alert'}
            </h3>
            <form onSubmit={event => void handleSubmitAlert(event)}>
              <label htmlFor='alert-title'>Title</label>
              <input
                id='alert-title'
                type='text'
                value={createAlertPayload.title}
                onChange={event =>
                  setCreateAlertPayload(previous => ({
                    ...previous,
                    title: event.target.value
                  }))
                }
                required
              />

              <label htmlFor='alert-message'>Message</label>
              <textarea
                id='alert-message'
                value={createAlertPayload.message}
                onChange={event =>
                  setCreateAlertPayload(previous => ({
                    ...previous,
                    message: event.target.value
                  }))
                }
                rows={4}
                required
              />

              <div className='alert-modal-grid'>
                <div>
                  <label htmlFor='alert-state'>State</label>
                  <select
                    id='alert-state'
                    value={createAlertPayload.target.state}
                    onChange={event =>
                      setCreateAlertPayload(previous => ({
                        ...previous,
                        target: {
                          ...previous.target,
                          state: event.target.value,
                          lga: ''
                        }
                      }))
                    }
                    required
                  >
                    <option value=''>Select a state</option>
                    {stateOptions.map(stateName => (
                      <option key={stateName} value={stateName}>
                        {stateName}
                      </option>
                    ))}
                  </select>
                  <small className='field-help-text'>
                    Choose the affected state first.
                  </small>
                </div>

                <div>
                  <label htmlFor='alert-lga'>LGA</label>
                  <select
                    id='alert-lga'
                    value={createAlertPayload.target.lga}
                    onChange={event =>
                      setCreateAlertPayload(previous => ({
                        ...previous,
                        target: {
                          ...previous.target,
                          lga: event.target.value
                        }
                      }))
                    }
                    disabled={createAlertPayload.target.state.length === 0}
                    required
                  >
                    <option value=''>
                      {createAlertPayload.target.state.length === 0
                        ? 'Select a state first'
                        : 'Select an LGA'}
                    </option>
                    {lgaOptions.map(lgaName => (
                      <option key={lgaName} value={lgaName}>
                        {lgaName}
                      </option>
                    ))}
                  </select>
                  <small className='field-help-text'>
                    LGA options are filtered by the selected state.
                  </small>
                </div>
              </div>

              <label htmlFor='alert-severity'>Severity</label>
              <select
                id='alert-severity'
                value={createAlertPayload.severity}
                onChange={event =>
                  setCreateAlertPayload(previous => ({
                    ...previous,
                    severity: event.target.value as alertResponse['severity']
                  }))
                }
              >
                {ALERT_SEVERITIES.map(severity => (
                  <option key={severity} value={severity}>
                    {severity}
                  </option>
                ))}
              </select>
              <small className='field-help-text'>
                Use INFO for updates, WARNING for rising risk, and CRITICAL for
                urgent flood danger.
              </small>

              <fieldset className='alert-modal-channels'>
                <legend>Channels</legend>
                <label>
                  <input
                    type='checkbox'
                    checked={createAlertPayload.channels.email}
                    onChange={event =>
                      setCreateAlertPayload(previous => ({
                        ...previous,
                        channels: {
                          ...previous.channels,
                          email: event.target.checked
                        }
                      }))
                    }
                  />
                  Email
                </label>
                <label>
                  <input
                    type='checkbox'
                    checked={createAlertPayload.channels.sms}
                    onChange={event =>
                      setCreateAlertPayload(previous => ({
                        ...previous,
                        channels: {
                          ...previous.channels,
                          sms: event.target.checked
                        }
                      }))
                    }
                  />
                  SMS
                </label>
                <label>
                  <input
                    type='checkbox'
                    checked={createAlertPayload.channels.push}
                    onChange={event =>
                      setCreateAlertPayload(previous => ({
                        ...previous,
                        channels: {
                          ...previous.channels,
                          push: event.target.checked
                        }
                      }))
                    }
                  />
                  Push
                </label>
              </fieldset>

              <div className='alert-modal-actions'>
                <button
                  type='button'
                  onClick={() => {
                    closeAlertModal()
                  }}
                >
                  Cancel
                </button>
                <button type='submit'>
                  {alertModalMode === 'edit' ? 'Save Changes' : 'Create Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default AlertsPage
