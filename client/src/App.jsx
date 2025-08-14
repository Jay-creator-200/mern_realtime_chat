import React, { useEffect, useMemo, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import axios from 'axios'

export default function App() {
  const [name, setName] = useState(localStorage.getItem('name') || '')
  const [room, setRoom] = useState('general')
  const [text, setText] = useState('')
  const [messages, setMessages] = useState([])
  const listRef = useRef(null)

  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'
  const socket = useMemo(() => io(serverUrl, { autoConnect: false }), [serverUrl])

  useEffect(() => {
    (async () => {
      const res = await axios.get(`${serverUrl}/api/messages?room=${encodeURIComponent(room)}&limit=50`)
      setMessages(res.data || [])
    })()
  }, [serverUrl, room])

  useEffect(() => {
    socket.connect()
    socket.emit('chat:join', room)

    socket.on('chat:message', (msg) => {
      setMessages((prev) => [...prev, msg])
    })
    socket.on('chat:system', (note) => {
      setMessages((prev) => [...prev, { _id: `sys-${Date.now()}`, sender: 'system', text: note, createdAt: new Date().toISOString(), room }])
    })

    return () => {
      socket.off('chat:message')
      socket.off('chat:system')
      socket.disconnect()
    }
  }, [socket, room])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const send = () => {
    if (!name.trim() || !text.trim()) return
    localStorage.setItem('name', name.trim())
    socket.emit('chat:message', { sender: name.trim(), text: text.trim(), room })
    setText('')
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, Arial', minHeight: '100vh', display: 'grid', gridTemplateRows: 'auto 1fr auto', gap: 8, padding: 16 }}>
      <header style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>MERN Realtime Chat</h1>
        <input placeholder="Your name" value={name} onChange={(e)=>setName(e.target.value)} style={{ padding: 8, flex: '0 0 200px' }} />
        <select value={room} onChange={(e)=>setRoom(e.target.value)} style={{ padding: 8 }}>
          <option value="general">#general</option>
          <option value="random">#random</option>
          <option value="dev">#dev</option>
        </select>
        <span style={{ marginLeft: 'auto', fontSize: 12 }}>Server: {serverUrl}</span>
      </header>
      <div ref={listRef} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, overflowY: 'auto' }}>
        {messages.map((m) => (
          <div key={m._id} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: '#555' }}>
              <strong>{m.sender}</strong>
              <span> · {new Date(m.createdAt).toLocaleTimeString()}</span>
              {m.room && m.room !== room ? <em> ({m.room})</em> : null}
            </div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <textarea value={text} onChange={(e)=>setText(e.target.value)} onKeyDown={onKeyDown} placeholder="Type a message and hit Enter…" rows={2} style={{ flex: 1, padding: 8 }} />
        <button onClick={send} style={{ padding: '8px 16px' }}>Send</button>
      </div>
    </div>
  )
}
