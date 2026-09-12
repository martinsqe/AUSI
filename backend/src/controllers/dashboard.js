import { query } from '../db/index.js'

export async function repDashboard(req, res, next) {
  try {
    // Fetch rep's own university_id first
    const selfRes = await query(
      'SELECT university_id FROM members WHERE id = $1',
      [req.user.id]
    )
    const uniId = selfRes.rows[0]?.university_id
    if (!uniId) {
      return res.status(400).json({ error: 'No university assigned to your account. Ask an admin to set your university.' })
    }

    const [uniRes, membersRes, eventsRes, appsRes] = await Promise.all([
      query('SELECT * FROM universities WHERE id = $1', [uniId]),
      query(`
        SELECT m.id, m.full_name, m.email, m.role, m.field_of_study,
               m.year_of_study, m.phone, m.is_verified, m.arrival_date, m.joined_at,
               COALESCE(u.name, m.university_name) AS university_name
        FROM members m LEFT JOIN universities u ON m.university_id = u.id
        WHERE m.university_id = $1
        ORDER BY m.joined_at DESC
      `, [uniId]),
      query(`
        SELECT e.id, e.title, e.event_date, e.location_city, e.type, e.image_url, e.cost_inr, e.is_published
        FROM events e
        WHERE e.university_id = $1
        ORDER BY e.event_date DESC
      `, [uniId]),
      query(`
        SELECT a.id, a.full_name, a.email, a.course, a.level, a.universities, a.status, a.created_at
        FROM applications a
        JOIN universities u ON u.id = $1
        WHERE u.name = ANY(a.universities)
        ORDER BY a.created_at DESC
      `, [uniId]),
    ])

    res.json({
      university: uniRes.rows[0],
      members:    membersRes.rows,
      events:     eventsRes.rows,
      applications: appsRes.rows,
    })
  } catch (err) { next(err) }
}

export async function memberDashboard(req, res, next) {
  try {
    const [profileRes, eventsRes, regsRes] = await Promise.all([
      query(`
        SELECT m.id, m.email, m.full_name, m.role, m.year_of_study,
               m.field_of_study, m.phone, m.avatar_url, m.bio,
               m.is_verified, m.joined_at,
               COALESCE(u.name, m.university_name) AS university_name, u.city, u.state
        FROM members m LEFT JOIN universities u ON m.university_id = u.id
        WHERE m.id = $1
      `, [req.user.id]),
      query(`
        SELECT e.id, e.title, e.event_date, e.location_city, e.type, e.image_url, e.cost_inr
        FROM events e
        WHERE e.is_published = true AND e.event_date >= CURRENT_DATE
        ORDER BY e.event_date ASC LIMIT 5
      `),
      query(`
        SELECT COUNT(*)::int AS count FROM event_registrations WHERE member_id = $1
      `, [req.user.id]),
    ])
    res.json({
      profile: profileRes.rows[0],
      upcomingEvents: eventsRes.rows,
      eventRegistrations: regsRes.rows[0].count,
    })
  } catch (err) { next(err) }
}

export async function adminDashboard(req, res, next) {
  try {
    const [statsRes, membersRes, appsRes] = await Promise.all([
      query(`
        SELECT
          (SELECT COUNT(*)::int FROM members)                                          AS total_members,
          (SELECT COUNT(*)::int FROM members WHERE is_verified = false)                AS pending_verifications,
          (SELECT COUNT(*)::int FROM events WHERE is_published = true)                 AS total_events,
          (SELECT COUNT(*)::int FROM applications)                                     AS total_applications,
          (SELECT COUNT(*)::int FROM applications WHERE status = 'pending')            AS pending_applications
      `),
      query(`
        SELECT m.id, m.full_name, m.email, m.phone, m.role, m.field_of_study,
               m.year_of_study, m.is_verified, m.joined_at, m.arrival_date,
               COALESCE(u.name, m.university_name) AS university_name, u.city, u.state
        FROM members m LEFT JOIN universities u ON m.university_id = u.id
        ORDER BY m.joined_at DESC
      `),
      query(`
        SELECT id, full_name, email, course, level, universities, status, created_at
        FROM applications ORDER BY created_at DESC LIMIT 50
      `),
    ])
    res.json({
      stats: statsRes.rows[0],
      members: membersRes.rows,
      applications: appsRes.rows,
    })
  } catch (err) { next(err) }
}

export async function presidentDashboard(req, res, next) {
  try {
    const [statsRes, membersRes, appsRes, leadershipRes, byRoleRes] = await Promise.all([
      query(`
        SELECT
          (SELECT COUNT(*)::int FROM members)                                          AS total_members,
          (SELECT COUNT(*)::int FROM members WHERE is_verified = false)                AS pending_verifications,
          (SELECT COUNT(*)::int FROM events WHERE is_published = true)                 AS total_events,
          (SELECT COUNT(*)::int FROM applications)                                     AS total_applications,
          (SELECT COUNT(*)::int FROM applications WHERE status = 'pending')            AS pending_applications,
          (SELECT COUNT(*)::int FROM universities)                                     AS total_universities
      `),
      // President sees only basic student info (name, university, email, course) —
      // full member detail (phone, role, verification status, etc.) is admin-only.
      query(`
        SELECT m.id, m.full_name, m.email, m.field_of_study,
               COALESCE(u.name, m.university_name) AS university_name
        FROM members m LEFT JOIN universities u ON m.university_id = u.id
        ORDER BY m.joined_at DESC
      `),
      query(`
        SELECT id, full_name, email, course, level, universities, status, notes, created_at
        FROM applications ORDER BY created_at DESC
      `),
      query(`
        SELECT l.id, l.position, l.scope, l.term_start, l.term_end, l.email, l.phone,
               m.full_name, m.avatar_url, m.id AS member_id,
               COALESCE(u.name, m.university_name) AS university_name
        FROM leadership l
        JOIN members m ON l.member_id = m.id
        LEFT JOIN universities u ON m.university_id = u.id
        WHERE l.is_current = true
        ORDER BY CASE l.scope WHEN 'national' THEN 0 ELSE 1 END, l.position
      `),
      query(`
        SELECT role, COUNT(*)::int AS count FROM members GROUP BY role ORDER BY count DESC
      `),
    ])
    res.json({
      stats: statsRes.rows[0],
      members: membersRes.rows,
      applications: appsRes.rows,
      leadership: leadershipRes.rows,
      membersByRole: byRoleRes.rows,
    })
  } catch (err) { next(err) }
}
