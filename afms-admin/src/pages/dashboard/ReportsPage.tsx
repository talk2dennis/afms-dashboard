import { useMemo, useState } from 'react'
import TablePage from './TablePage'
import { reports, type Report } from './data'

function ReportsPage () {
  const [reportSearch, setReportSearch] = useState('')
  const [reportTypeFilter, setReportTypeFilter] = useState<
    'All' | Report['type']
  >('All')
  const [reportStatusFilter, setReportStatusFilter] = useState<
    'All' | Report['status']
  >('All')

  const filteredReports = useMemo(
    () =>
      reports.filter(report => {
        const searchValue = reportSearch.toLowerCase()
        const matchesSearch =
          report.id.toLowerCase().includes(searchValue) ||
          report.reporter.toLowerCase().includes(searchValue) ||
          report.location.toLowerCase().includes(searchValue)
        const matchesType =
          reportTypeFilter === 'All' || report.type === reportTypeFilter
        const matchesStatus =
          reportStatusFilter === 'All' || report.status === reportStatusFilter
        return matchesSearch && matchesType && matchesStatus
      }),
    [reportSearch, reportTypeFilter, reportStatusFilter]
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
            value={reportTypeFilter}
            onChange={event =>
              setReportTypeFilter(event.target.value as 'All' | Report['type'])
            }
          >
            <option value='All'>All Types</option>
            <option value='Street Flooding'>Street Flooding</option>
            <option value='Drain Blockage'>Drain Blockage</option>
            <option value='River Overflow'>River Overflow</option>
          </select>
          <select
            value={reportStatusFilter}
            onChange={event =>
              setReportStatusFilter(
                event.target.value as 'All' | Report['status']
              )
            }
          >
            <option value='All'>All Status</option>
            <option value='Pending Approval'>Pending Approval</option>
            <option value='Approved'>Approved</option>
            <option value='Rejected'>Rejected</option>
          </select>
        </>
      }
      table={
        <table>
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Reporter</th>
              <th>Location</th>
              <th>Type</th>
              <th>Status</th>
              <th>Manage</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map(report => (
              <tr key={report.id}>
                <td>{report.id}</td>
                <td>{report.reporter}</td>
                <td>{report.location}</td>
                <td>{report.type}</td>
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
