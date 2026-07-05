import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { T, fontDisplay, fontMono, fontBody, GlobalStyle, panelStyle, PanelLabel } from '../lib/theme'
import Navbar from '../components/Navbar'

const eventLabels = {
  login: 'User Login',
  logout: 'User Logout',
  admin_login: 'Admin Login',
  public_scan: 'Public Scan',
  dashboard_view: 'Dashboard View',
}

const eventColor = {
  login: T.green,
  logout: T.mutedDim,
  admin_login: T.amber,
  public_scan: T.orange,
  dashboard_view: T.green,
}

export default function AdminDashboard() {
  const [logs, setLogs] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [view, setView] = useState('activity') // 'activity' | 'users'

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      const [logsRes, usersRes] = await Promise.all([
        supabase.from('visitor_logs').select('*').order('created_at', { ascending: false }).limit(500),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      ])
      if (logsRes.data) setLogs(logsRes.data)
      if (logsRes.error) console.error(logsRes.error)
      if (usersRes.data) setUsers(usersRes.data)
      if (usersRes.error) console.error(usersRes.error)
      setLoading(false)
    }
    fetchAll()

    const channel = supabase
      .channel('visitor_logs_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'visitor_logs' }, (payload) => {
        setLogs(prev => [payload.new, ...prev])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const filtered = useMemo(() => {
    return logs.filter(l => {
      if (filter !== 'all' && l.event_type !== filter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return (l.email || '').toLowerCase().includes(q) || (l.business_name || '').toLowerCase().includes(q)
      }
      return true
    })
  }, [logs, filter, search])

  const stats = useMemo(() => {
    const today = new Date().toDateString()
    const todayCount = logs.filter(l => new Date(l.created_at).toDateString() === today).length
    const uniqueUsers = new Set(logs.map(l => l.email).filter(Boolean)).size
    const scans = logs.filter(l => l.event_type === 'public_scan' || l.event_type === 'dashboard_view').length
    return { total: logs.length, today: todayCount, uniqueUsers, scans }
  }, [logs])

  const statCard = (label, value) => (
    <div style={{ ...panelStyle(), flex: 1, minWidth: 120, textAlign: 'center', padding: '18px 12px' }}>
      <p style={{ fontFamily: fontMono, fontSize: 22, fontWeight: 700, color: T.amber }}>{value}</p>
      <p style={{ fontFamily: fontMono, fontSize: 10, color: T.muted, letterSpacing: 1, marginTop: 4 }}>{label}</p>
    </div>
  )

  return (
    <div style={{ fontFamily: fontBody, background: T.bg, backgroundImage: T.bgGrad, minHeight: '100vh', color: T.ink }}>
      <GlobalStyle />
      <Navbar />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '10px 16px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <p style={{ fontFamily: fontMono, fontSize: 10.5, color: T.amber, letterSpacing: 2 }}>ADMIN DASHBOARD</p>
          <h1 style={{ fontFamily: fontDisplay, fontSize: 24, fontWeight: 700, marginTop: 6 }}>Visitor Activity</h1>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
          {statCard('TOTAL EVENTS', stats.total)}
          {statCard('TODAY', stats.today)}
          {statCard('UNIQUE VISITORS', stats.uniqueUsers)}
          {statCard('SCANS RUN', stats.scans)}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
          <button
            onClick={() => setView('activity')}
            className="a4n-btn-ghost"
            style={{
              flex: 1, background: view === 'activity' ? T.amberDim : 'none',
              border: `1px solid ${view === 'activity' ? T.amber : T.border}`,
              color: view === 'activity' ? T.amber : T.muted, borderRadius: 8, padding: '10px',
              fontFamily: fontMono, fontSize: 11.5, fontWeight: 600, cursor: 'pointer'
            }}
          >
            ACTIVITY LOG
          </button>
          <button
            onClick={() => setView('users')}
            className="a4n-btn-ghost"
            style={{
              flex: 1, background: view === 'users' ? T.amberDim : 'none',
              border: `1px solid ${view === 'users' ? T.amber : T.border}`,
              color: view === 'users' ? T.amber : T.muted, borderRadius: 8, padding: '10px',
              fontFamily: fontMono, fontSize: 11.5, fontWeight: 600, cursor: 'pointer'
            }}
          >
            REGISTERED USERS ({users.length})
          </button>
        </div>

        {view === 'activity' && (
        <div style={panelStyle()}>
          <PanelLabel>Filters</PanelLabel>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="a4n-select"
              style={{ background: '#F1F4F9', border: `1.5px solid ${T.border}`, borderRadius: 8, padding: '9px 12px', color: T.ink, fontFamily: fontMono, fontSize: 12.5, outline: 'none' }}
            >
              <option value="all">All events</option>
              <option value="login">User logins</option>
              <option value="admin_login">Admin logins</option>
              <option value="public_scan">Public scans</option>
              <option value="dashboard_view">Dashboard views</option>
              <option value="logout">Logouts</option>
            </select>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by email or business…"
              style={{ flex: 1, minWidth: 180, background: '#F1F4F9', border: `1.5px solid ${T.border}`, borderRadius: 8, padding: '9px 12px', color: T.ink, fontFamily: fontMono, fontSize: 12.5, outline: 'none' }}
            />
          </div>
        </div>
        )}

        {view === 'activity' && (
        <div style={panelStyle({ padding: 0, overflow: 'hidden' })}>
          <div style={{ padding: '18px 20px 0' }}>
            <PanelLabel>Activity Log ({filtered.length})</PanelLabel>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: fontMono, fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                  {['TIME', 'EVENT', 'EMAIL', 'ROLE', 'BUSINESS / LOCATION'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 16px', color: T.mutedDim, fontWeight: 600, letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={5} style={{ padding: 20, color: T.muted, textAlign: 'center' }}>Loading…</td></tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: 20, color: T.muted, textAlign: 'center' }}>No activity yet.</td></tr>
                )}
                {filtered.map(l => (
                  <tr key={l.id} className="a4n-row" style={{ borderBottom: `1px solid ${T.border}` }}>
                    <td style={{ padding: '10px 16px', color: T.muted, whiteSpace: 'nowrap' }}>
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ color: eventColor[l.event_type] || T.muted }}>
                        {eventLabels[l.event_type] || l.event_type}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', color: T.ink }}>{l.email || '—'}</td>
                    <td style={{ padding: '10px 16px', color: T.muted, textTransform: 'uppercase' }}>{l.role || '—'}</td>
                    <td style={{ padding: '10px 16px', color: T.muted }}>
                      {l.business_name ? `${l.business_name}${l.location ? ` · ${l.location}` : ''}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {view === 'users' && (
        <div style={panelStyle({ padding: 0, overflow: 'hidden' })}>
          <div style={{ padding: '18px 20px 0' }}>
            <PanelLabel>Registered Users ({users.length})</PanelLabel>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: fontMono, fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                  {['SIGNED UP', 'EMAIL', 'ROLE', 'BUSINESS NAME'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 16px', color: T.mutedDim, fontWeight: 600, letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={4} style={{ padding: 20, color: T.muted, textAlign: 'center' }}>Loading…</td></tr>
                )}
                {!loading && users.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: 20, color: T.muted, textAlign: 'center' }}>No users yet.</td></tr>
                )}
                {users.map(u => (
                  <tr key={u.id} className="a4n-row" style={{ borderBottom: `1px solid ${T.border}` }}>
                    <td style={{ padding: '10px 16px', color: T.muted, whiteSpace: 'nowrap' }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '10px 16px', color: T.ink }}>{u.email || '—'}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ color: u.role === 'admin' ? T.amber : T.green, textTransform: 'uppercase' }}>{u.role}</span>
                    </td>
                    <td style={{ padding: '10px 16px', color: T.muted }}>{u.business_name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
