import { AxiosError } from 'axios'
import apiClient from './client'
import { type AuthUserData } from './storage'

type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  token: string
  user: {
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
}

type LoginResult = {
  token: string
  userData: AuthUserData
}

export const loginRequest = async ({
  email,
  password
}: LoginPayload): Promise<LoginResult> => {
  try {
    // log the axios url
    console.log(apiClient.getUri(), 'Login request URL')
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password
    })

    const userData: AuthUserData = {
      id: response.data.user.id,
      email: response.data.user.email,
      name: response.data.user.name,
      role: response.data.user.role,
      gsm: response.data.user.gsm,
      createdAt: response.data.user.createdAt,
      updatedAt: response.data.user.updatedAt,
      location: response.data.user.location,
      state: response.data.user.state,
      lga: response.data.user.lga
    }

    return {
      token: response.data.token,
      userData
    }
  } catch (error) {
    console.log('Login error:', error)
    if (error instanceof AxiosError) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ??
        'Invalid login credentials'
      throw new Error(message)
    }

    throw new Error('Unable to login at the moment')
  }
}
