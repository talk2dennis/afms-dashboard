export type User = {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Field Officer' | 'Resident'
  status: 'Active' | 'Blocked' | 'Pending Verification'
}

export type Report = {
  id: string
  reporter: string
  location: string
  type: 'Street Flooding' | 'Drain Blockage' | 'River Overflow'
  status: 'Pending Approval' | 'Approved' | 'Rejected'
}

export type Alert = {
  id: string
  title: string
  severity: 'Emergency' | 'Warning' | 'Watch'
  audience: string
  status: 'Draft' | 'Scheduled' | 'Published'
}

export type Notification = {
  id: string
  title: string
  channel: 'Email' | 'Push' | 'SMS' | 'In-App'
  audience: string
  status: 'Draft' | 'Queued' | 'Sent'
}

export const users: User[] = [
  {
    id: 'USR-1001',
    name: 'Amina Yusuf',
    email: 'amina@example.com',
    role: 'Resident',
    status: 'Active'
  },
  {
    id: 'USR-1002',
    name: 'David King',
    email: 'david@example.com',
    role: 'Field Officer',
    status: 'Blocked'
  },
  {
    id: 'USR-1003',
    name: 'Sofia Chen',
    email: 'sofia@example.com',
    role: 'Resident',
    status: 'Active'
  },
  {
    id: 'USR-1004',
    name: 'John Patel',
    email: 'john@example.com',
    role: 'Admin',
    status: 'Pending Verification'
  }
]

export const reports: Report[] = [
  {
    id: 'RPT-2031',
    reporter: 'Liam Musa',
    location: 'Makoko - Zone A',
    type: 'Street Flooding',
    status: 'Pending Approval'
  },
  {
    id: 'RPT-2032',
    reporter: 'Grace Bello',
    location: 'Lekki - Admiralty Way',
    type: 'Drain Blockage',
    status: 'Approved'
  },
  {
    id: 'RPT-2033',
    reporter: 'Noah Brown',
    location: 'Victoria Island - Ahmadu Bello',
    type: 'River Overflow',
    status: 'Rejected'
  },
  {
    id: 'RPT-2034',
    reporter: 'Eva Cruz',
    location: 'Ajah - Badore Road',
    type: 'Street Flooding',
    status: 'Pending Approval'
  }
]

export const alerts: Alert[] = [
  {
    id: 'ALT-311',
    title: 'Heavy Rainfall Warning',
    severity: 'Warning',
    audience: 'Residents in Coastal Zones',
    status: 'Scheduled'
  },
  {
    id: 'ALT-312',
    title: 'Emergency Evacuation Advisory',
    severity: 'Emergency',
    audience: 'Makoko and Ajegunle',
    status: 'Draft'
  },
  {
    id: 'ALT-313',
    title: 'River Water Level Watch',
    severity: 'Watch',
    audience: 'Communities by Lagoon Front',
    status: 'Published'
  },
  {
    id: 'ALT-314',
    title: 'Storm Drain Clearance Notice',
    severity: 'Warning',
    audience: 'Field Officers',
    status: 'Published'
  }
]

export const notifications: Notification[] = [
  {
    id: 'NTF-901',
    title: 'Flood report received in your area',
    channel: 'Email',
    audience: 'Ward 3 Residents',
    status: 'Queued'
  },
  {
    id: 'NTF-902',
    title: 'Evacuation center opened nearby',
    channel: 'Push',
    audience: 'Makoko Residents',
    status: 'Sent'
  },
  {
    id: 'NTF-903',
    title: 'Daily flood risk update',
    channel: 'In-App',
    audience: 'All Registered Residents',
    status: 'Draft'
  },
  {
    id: 'NTF-904',
    title: 'Road closure due to flooding',
    channel: 'SMS',
    audience: 'Local Government Area 5',
    status: 'Queued'
  }
]

export const metrics = [
  { label: 'Total Residents', value: '12,450' },
  { label: 'Pending Reports', value: '128' },
  { label: 'Approved Reports', value: '3,920' },
  { label: 'Active Flood Alerts', value: '7' }
]

export const quickActions = [
  'Review Pending Reports',
  'Create Flood Alert',
  'Send Evacuation Notice',
  'Export Incident Log'
]

export const recentActivities = [
  'Resident report submitted from Lekki Phase 1',
  'Admin approved flood report RPT-2032',
  'Emergency notification sent to Makoko zone',
  'Field officer marked blocked drain as resolved'
]
