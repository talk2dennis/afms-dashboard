import { useEffect, useMemo, useState } from 'react'
import apiClient from '../../api/client'
import { type StatisticsResponse } from '../../api/authApi'
import { useUiFeedback } from '../../context/UiFeedbackContext'
import { quickActions, recentActivities } from './data'

const numberFormatter = new Intl.NumberFormat('en-US')

function OverviewPage () {
  const { withLoading, notify } = useUiFeedback()
  const [stats, setStats] = useState<StatisticsResponse>()

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await withLoading(
          async () =>
            apiClient.get<StatisticsResponse>('auth/admin/statistics'),
          'Loading dashboard statistics...'
        )
        setStats(response.data)
      } catch (error) {
        console.error('Failed to fetch overview statistics', error)
        notify({
          tone: 'error',
          title: 'Statistics load failed',
          message: 'Unable to load dashboard statistics right now.'
        })
      }
    }

    void fetchStatistics()
  }, [notify, withLoading])

  const metrics = useMemo(
    () => [
      {
        label: 'Total Users',
        value: numberFormatter.format(stats?.users ?? 0)
      },
      {
        label: 'Total Flood Reports',
        value: numberFormatter.format(stats?.floodReports ?? 0)
      },
      {
        label: 'Total Alerts',
        value: numberFormatter.format(stats?.alerts ?? 0)
      }
    ],
    [stats?.alerts, stats?.floodReports, stats?.users]
  )

  return (
    <>
      <section className='metric-grid' aria-label='Summary metrics'>
        {metrics.map(item => (
          <article key={item.label} className='metric-card'>
            <p>{item.label}</p>
            <h2>{item.value}</h2>
          </article>
        ))}
      </section>

      <section className='content-grid' aria-label='Overview content'>
        <article className='panel' aria-label='Traffic chart placeholder'>
          <h3>Traffic Overview</h3>
          <div className='placeholder-box'>Chart Placeholder</div>
        </article>

        <article className='panel table-panel' aria-label='Recent activity'>
          <h3>Recent Activity</h3>
          <ul>
            {recentActivities.map(activity => (
              <li key={activity}>{activity}</li>
            ))}
          </ul>
        </article>

        <article className='panel actions-panel' aria-label='Quick actions'>
          <h3>Quick Actions</h3>
          <div className='action-grid'>
            {quickActions.map(action => (
              <button key={action} type='button'>
                {action}
              </button>
            ))}
          </div>
        </article>
      </section>
    </>
  )
}

export default OverviewPage
