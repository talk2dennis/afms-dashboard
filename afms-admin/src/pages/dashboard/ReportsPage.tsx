import { useEffect, useMemo, useState } from 'react'
import TablePage from './TablePage'
import { type ReportResponse } from '../../api/authApi'
import apiClient from '../../api/client'

function ReportsPage () {
  const [reports, setReports] = useState<ReportResponse[]>([])
  const [reportSearch, setReportSearch] = useState('')
  const [reportStatusFilter, setReportStatusFilter] = useState<
    'All' | ReportResponse['status']
  >('All')
  const [reportStateFilter, setReportStateFilter] = useState<
    'All' | ReportResponse['state']
  >('All')

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await apiClient.get<ReportResponse[]>('reports/')
        console.log('Fetched reports:', response.data)
        setReports(response.data)
      } catch (error) {
        console.error('Failed to fetch reports', error)
      }
    }

    void fetchReports()
  }, [])

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
            <option value='REJECTED'>Rejected</option>
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
                  <select defaultValue=''>
                    <option value='' disabled>
                      Select action
                    </option>
                    <option>View report details</option>
                    <option>Approve report</option>
                    <option>Reject report</option>
                    <option>Delete report</option>
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
