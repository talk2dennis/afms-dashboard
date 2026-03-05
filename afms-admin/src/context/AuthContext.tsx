import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState
} from 'react'
import {
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
  type AuthUserData
} from '../api/storage'

type AuthContextValue = {
  isAuthenticated: boolean
  currentUserData: AuthUserData | null
  signIn: (userData: AuthUserData, token?: string) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

type AuthProviderProps = {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const existingSession = getAuthSession()

  const [isAuthenticated, setIsAuthenticated] = useState(
    existingSession !== null
  )
  const [currentUserData, setCurrentUserData] = useState<AuthUserData | null>(
    existingSession?.userData ?? null
  )

  const signIn = (userData: AuthUserData, token = 'local-session-token') => {
    saveAuthSession({ token, userData })
    setIsAuthenticated(true)
    setCurrentUserData(userData)
  }

  const signOut = () => {
    clearAuthSession()
    setIsAuthenticated(false)
    setCurrentUserData(null)
  }

  const value = useMemo(
    () => ({
      isAuthenticated,
      currentUserData,
      signIn,
      signOut
    }),
    [isAuthenticated, currentUserData]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
