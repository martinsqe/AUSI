export const ROLE_LABELS = {
  student:           'Student',
  alumni:            'Alumni',
  exec:              'Executive Member',
  chapter_president: 'Chapter President',
  patron:            'Patron',
  admin:             'Admin',
  university_rep:    'University Representative',
}

export const ROLE_COLORS = {
  student:           '#2563eb',
  alumni:            '#7c3aed',
  exec:              '#d97706',
  chapter_president: '#dc2626',
  patron:            '#059669',
  admin:             '#111118',
  university_rep:    '#0891b2',
}

export function dashboardFor(role) {
  if (role === 'chapter_president') return '/dashboard/president'
  if (role === 'exec' || role === 'admin') return '/dashboard/admin'
  if (role === 'university_rep') return '/dashboard/rep'
  return '/dashboard/home'
}

export function canAccessAdmin(role) {
  return ['exec', 'admin', 'chapter_president'].includes(role)
}
