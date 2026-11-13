import { useEffect, useState, type FormEvent } from 'react'
import { createRoot } from 'react-dom/client'
import { createClient, type Session } from '@supabase/supabase-js'
import './style.css'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
const supabase = url && key ? createClient(url, key) : null

type Message = {
  id: number
  author: string
  body: string
  created_at: string
}

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!supabase) return

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    async function loadMessages() {
      const { data, error } = await supabase!.from('messages').select('id,author,body,created_at').order('id', { ascending: false })
      if (error) setError('Could not load messages. Refresh to try again.')
      else setMessages(data)
      setLoading(false)
    }

    void loadMessages()
    return () => subscription.unsubscribe()
  }, [])

  async function signIn() {
    if (!supabase) return
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: new URL(import.meta.env.BASE_URL, location.origin).href },
    })
    if (error) setError('GitHub sign-in could not start. Try again.')
  }

  async function signOut() {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) setError('Could not sign out. Try again.')
  }

  async function post(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = body.trim()
    if (!supabase || !session || !text || busy) return

    setBusy(true)
    setError('')
    try {
      const { data, error } = await supabase.rpc('post_guestbook_message', { message_body: text }).single<Message>()
      if (error || !data) {
        setError('Could not save your message. Try again.')
        return
      }
      setMessages(current => [data, ...current])
      setBody('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main>
      <header>
        <h1>Guestbook</h1>
        <p>Leave a message for everyone!</p>
        {session
          ? <button onClick={() => void signOut()}>Sign Out</button>
          : <button disabled={!supabase} onClick={() => void signIn()}>Sign In with GitHub</button>}
      </header>

      {error && <p role="alert">{error}</p>}
      {session ? (
        <form onSubmit={post}>
          <label htmlFor="message">Your message</label>
          <textarea id="message" rows={4} maxLength={500} required value={body} onChange={event => setBody(event.target.value)} />
          <button disabled={busy || !body.trim()}>{busy ? 'Posting…' : 'Post Message'}</button>
        </form>
      ) : <p>{supabase ? 'Sign in with GitHub to leave a message.' : 'GitHub sign-in and message storage are awaiting setup.'}</p>}

      <section aria-labelledby="messages">
        <h2 id="messages">Messages</h2>
        {loading && <p role="status">Loading messages…</p>}
        {supabase && !loading && !error && messages.length === 0 && <p>No messages yet.</p>}
        {messages.map(message => (
          <article key={message.id}>
            <div className="message-header">
              <strong>{message.author}</strong>
              <time dateTime={message.created_at}>{new Date(message.created_at).toLocaleString()}</time>
            </div>
            <p>{message.body}</p>
          </article>
        ))}
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
