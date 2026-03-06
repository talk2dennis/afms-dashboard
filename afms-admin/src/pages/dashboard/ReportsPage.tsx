import { useEffect, useMemo, useState } from 'react'
import TablePage from './TablePage'
import { type ReportResponse } from '../../api/authApi'
import apiClient from '../../api/client'
import { useUiFeedback } from '../../context/UiFeedbackContext'

function ReportsPage () {
  const { withLoading, notify } = useUiFeedback()
  const [reports, setReports] = useState<ReportResponse[]>([])
  const [reportSearch, setReportSearch] = useState('')
  const [reportStatusFilter, setReportStatusFilter] = useState<
    'All' | ReportResponse['status']
  >('All')
  const [reportStateFilter, setReportStateFilter] = useState<
    'All' | ReportResponse['state']
  >('All')

  const fetchReports = async () => {
    try {
      const response = await withLoading(
        async () => apiClient.get<ReportResponse[]>('reports/'),
        'Fetching flood reports...'
      )
      setReports(response.data)
    } catch (error) {
      console.error('Failed to fetch reports', error)
      notify({
        message: 'Failed to fetch reports',
        tone: 'error'
      })
    }
  }

  useEffect(() => {
    void fetchReports()
  }, [notify, withLoading])

  const handleApproveReport = async (reportId: string, reportTitle: string) => {
    const confirmed = window.confirm(
      `Approve report: "${reportTitle}"?\n\nThis will mark the report as verified and approved.`
    )

    if (!confirmed) {
      return
    }

    try {
      await withLoading(
        async () => apiClient.put(`reports/${reportId}/verify`),
        'Approving report...'
      )

      notify({
        tone: 'success',
        title: 'Report approved',
        message: `Report "${reportTitle}" has been approved.`
      })

      await fetchReports()
    } catch (error) {
      console.error('Failed to approve report', error)
      notify({
        tone: 'error',
        title: 'Approval failed',
        message: 'Unable to approve report at this time.'
      })
    }
  }

  const handleDeleteReport = async (reportId: string, reportTitle: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete report: "${reportTitle}"?\n\nThis action cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    try {
      await withLoading(
        async () => apiClient.delete(`reports/${reportId}`),
        'Deleting report...'
      )

      notify({
        tone: 'success',
        title: 'Report deleted',
        message: `Report "${reportTitle}" has been removed.`
      })

      await fetchReports()
    } catch (error) {
      console.error('Failed to delete report', error)
      notify({
        tone: 'error',
        title: 'Delete failed',
        message: 'Unable to delete report at this time.'
      })
    }
  }

  const filteredReports = useMemo(
    () =>
      reports.filter(report => {
        const searchValue = reportSearch?.toLowerCase()
        const matchesSearch =
          report._id.toLowerCase().includes(searchValue) ||
          report.state.toLowerCase().includes(searchValue) ||
          report.title.toLowerCase().includes(searchValue) ||
          report.user.name?.toLowerCase().includes(searchValue) ||
          report.lga.toLowerCase().includes(searchValue)
        const matchesStatus =
          reportStatusFilter === 'All' || report.status === reportStatusFilter
        const matchesState =
          reportStateFilter === 'All' || report.state === reportStateFilter
        return matchesSearch && matchesStatus && matchesState
      }),
    [reports, reportSearch, reportStatusFilter, reportStateFilter]
  )

  return (
    <TablePage
      title='Flood Reports'
      controls={
        <>
          <input
            type='search'
            placeholder='Search by report ID, reporter, or location'
            value={reportSearch}
            onChange={event => setReportSearch(event.target.value)}
          />
          <select
            value={reportStateFilter}
            onChange={event =>
              setReportStateFilter(
                event.target.value as 'All' | ReportResponse['state']
              )
            }
          >
            <option value='All'>All States</option>
            {Array.from(new Set(reports.map(report => report.state))).map(
              state => (
                <option key={state} value={state}>
                  {state}
                </option>
              )
            )}
          </select>
          <select
            value={reportStatusFilter}
            onChange={event =>
              setReportStatusFilter(
                event.target.value as 'All' | ReportResponse['status']
              )
            }
          >
            <option value='All'>All Status</option>
            <option value='PENDING'>Pending</option>
            <option value='APPROVED'>Approved</option>
            <option value='DELETE'>Delete</option>
          </select>
        </>
      }
      table={
        <table>
          <thead>
            <tr>
              <th>S/No.</th>
              <th>Title</th>
              <th>Reporter</th>
              <th>Location</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Manage</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report, index) => (
              <tr key={report._id}>
                <td>{index + 1}</td>
                <td>{report.title}</td>
                <td>{report.user.name ?? 'Unknown'}</td>
                <td>{`${report.lga}, ${report.state}`}</td>
                <td>{report.severity}</td>
                <td>{report.status}</td>
                <td>
                  <select
                    defaultValue=''
                    onChange={event => {
                      const action = event.target.value
                      event.target.value = ''

                      if (action === 'approve-report') {
                        void handleApproveReport(report._id, report.title)
                      } else if (action === 'delete-report') {
                        void handleDeleteReport(report._id, report.title)
                      }
                    }}
                  >
                    <option value='' disabled>
                      Select action
                    </option>
                    <option value='approve-report'>Approve report</option>
                    <option value='delete-report'>Delete report</option>
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

export default ReportsPage
