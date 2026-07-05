import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(true)

  const loadProfile = async (userId) => {
    if (!userId) {
      setProfile(null)
      setProfileLoading(false)
      return
    }

    setProfileLoading(true)

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    console.log("Profile Data:", data)
    console.log("Profile Error:", error)

    if (!error) {
      setProfile(data)
    }

    setProfileLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      console.log("Session:", data.session)

      setSession(data.session)

      if (data.session?.user) {
        await loadProfile(data.session.user.id)
      } else {
        setProfileLoading(false)
      }

      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        console.log("Auth Event:", _event)
        console.log("New Session:", newSession)

        setSession(newSession)

        if (newSession?.user) {
          await loadProfile(newSession.user.id)
        } else {
          setProfile(null)
          setProfileLoading(false)
        }
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  const logEvent = async (eventType, extra = {}) => {
    try {
      await supabase.from('visitor_logs').insert({
        user_id: session?.user?.id || null,
        email: session?.user?.email || extra.email || null,
        role: profile?.role || 'guest',
        event_type: eventType,
        business_name: extra.business_name || null,
        location: extra.location || null,
      })
    } catch (e) {
      console.error('log event failed', e)
    }
  }

  const signOut = async () => {
    await logEvent('logout')
    await supabase.auth.signOut()
  }

  const value = {
    session,
    user: session?.user || null,
    profile,
    role: profile?.role || null,
    loading,
    profileLoading,
    logEvent,
    signOut,
    refreshProfile: () => loadProfile(session?.user?.id),
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}