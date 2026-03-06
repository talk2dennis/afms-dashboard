type user = {
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

export type LoginResponse = {
  token: string
  user: user
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
  user: user
}
