export const AUTH_SESSION_KEY = 'afms.auth.session'

export type AuthUserData = {
  id?: string
  email: string
  name?: string
  role?: string
  gsm?: string
  createdAt?: string
  updatedAt?: string
  location?: [number, number]
  state?: string
  lga?: string
}

export type AuthSession = {
  token: string
  userData: AuthUserData
}

export const saveAuthSession = (session: AuthSession): void => {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
}

export const getAuthSession = (): AuthSession | null => {
  const storedSession = localStorage.getItem(AUTH_SESSION_KEY)

  if (!storedSession) {
    return null
  }

  try {
    const parsed = JSON.parse(storedSession) as Partial<AuthSession> & {
      email?: string
    }

    if (typeof parsed.token !== 'string') {
      return null
    }

    if (parsed.userData && typeof parsed.userData.email === 'string') {
      return {
        token: parsed.token,
        userData: parsed.userData
      }
    }

    if (typeof parsed.email === 'string') {
      return {
        token: parsed.token,
        userData: {
          email: parsed.email,
          name: 'Admin User',
          role: 'Admin'
        }
      }
    }

    return null
  } catch {
    return null
  }
}

export const clearAuthSession = (): void => {
  localStorage.removeItem(AUTH_SESSION_KEY)
}
