import { metrics, quickActions, recentActivities } from './data'

function OverviewPage () {
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
