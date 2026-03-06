export type UserResponse = {
  _id: string
  email: string
  name: string
  phone: string
  role: string
  status?: string
  createdAt: string
  updatedAt: string
  location: [number, number] | string | null
  state: string
  lga: string
}

export type LoginResponse = {
  token: string
  user: UserResponse
}

export type ReportResponse = {
  _id: string
  title: string
  description: string
  state: string
  lga: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  location: [number, number]
  user: UserResponse
}

export type StatisticsResponse = {
  users: number
  floodReports: number
  alerts: number
}
