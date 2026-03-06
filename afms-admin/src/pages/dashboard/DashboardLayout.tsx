import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'

const navigationItems = [
  { path: '/dashboard/overview', label: 'Overview' },
  { path: '/dashboard/users', label: 'Manage Users' },
  { path: '/dashboard/reports', label: 'Flood Reports' },
  { path: '/dashboard/alerts', label: 'Flood Alerts' },
  { path: '/dashboard/notifications', label: 'Emergency Notifications' }
]

const pageTitles: Record<string, string> = {
  '/dashboard/overview': 'Overview',
  '/dashboard/users': 'Manage Users',
  '/dashboard/reports': 'Flood Reports',
  '/dashboard/alerts': 'Flood Alerts',
  '/dashboard/notifications': 'Emergency Notifications'
}

function DashboardLayout () {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUserData, signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const pageTitle = pageTitles[location.pathname] ?? 'Overview'
  const displayName = currentUserData?.name ?? currentUserData?.email ?? 'User'
  const firstName = displayName.split(' ')[1] ?? displayName
  const avatarInitial = firstName.charAt(0).toUpperCase()

  const handleLogout = () => {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <main className='dashboard-shell'>
      <aside className='dashboard-sidebar' aria-label='Primary navigation'>
        <h2>AFMS Admin</h2>
        <nav>
          {navigationItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? 'nav-item is-active' : 'nav-item'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <section className='dashboard-main'>
        <header className='dashboard-topbar'>
          <div>
            <h1>{pageTitle}</h1>
            <p>
              Flood reporting operations for local communities and admin review
            </p>
          </div>
          <div className='topbar-actions'>
            <button type='button'>Date Range: Last 30 Days</button>
            {currentUserData ? (
              <div className='user-menu'>
                <button
                  type='button'
                  className='user-menu-trigger'
                  onClick={() => setShowUserMenu(previous => !previous)}
                >
                  <span className='user-avatar'>{avatarInitial}</span>
                  <span>{firstName}</span>
                </button>

                {showUserMenu ? (
                  <div className='user-menu-dropdown'>
                    <p>
                      <strong>Name:</strong> {displayName}
                    </p>
                    <p>
                      <strong>Email:</strong> {currentUserData.email}
                    </p>
                    <p>
                      <strong>Role:</strong> {currentUserData.role ?? 'N/A'}
                    </p>
                    <p>
                      <strong>Phone:</strong> {currentUserData.gsm ?? 'N/A'}
                    </p>
                    <p>
                      <strong>State:</strong> {currentUserData.state ?? 'N/A'}
                    </p>
                    <p>
                      <strong>LGA:</strong> {currentUserData.lga ?? 'N/A'}
                    </p>
                    <button type='button' onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </header>

        <Outlet />
      </section>
    </main>
  )
}

export default DashboardLayout
