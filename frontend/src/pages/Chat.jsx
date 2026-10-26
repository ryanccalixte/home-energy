import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import RoomScanner from '../components/RoomScanner.jsx'
import './Chat.css'

const API_URL = '/api/chat'

function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  const fileInputRef = useRef(null)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const clearImage = () => {
    setImage(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const sendMessage = async ({ text, image: imageToSend, preview }) => {
    const history = messages
      .filter((m) => !m.isError && m.text)
      .map((m) => ({ role: m.role, content: m.text }))

    setMessages((prev) => [...prev, { role: 'user', text, imagePreview: preview }])
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('message', text)
      formData.append('history', JSON.stringify(history))
      if (imageToSend) formData.append('image', imageToSend)

      const res = await fetch(API_URL, { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Request failed')

      setMessages((prev) => [...prev, { role: 'assistant', text: data.response }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `Error: ${err.message}`, isError: true },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() && !image) return
    sendMessage({ text: input.trim(), image, preview: imagePreview })
    setInput('')
    clearImage()
  }

  const handleScan = (scan) => {
    setScannerOpen(false)
    sendMessage(scan)
  }

  return (
    <div className="chat-page">
      <header className="chat-header">
        <div>
          <h1>Home Energy Assistant</h1>
          <p>Ask about appliance energy usage, or scan a room to get savings advice.</p>
        </div>
        {!scannerOpen && (
          <button className="btn btn-ghost scan-toggle" onClick={() => setScannerOpen(true)}>
            📷 Scan a room
          </button>
        )}
      </header>

      {scannerOpen && <RoomScanner onSend={handleScan} onClose={() => setScannerOpen(false)} busy={loading} />}

      <main className="chat-window">
        {messages.length === 0 && (
          <div className="empty-state">
            Describe your appliances (e.g. "2 LED bulbs and a refrigerator"), attach a photo, or use{' '}
            <strong>Scan a room</strong> to detect appliances automatically.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role} ${m.isError ? 'error' : ''}`}>
            {m.imagePreview && <img className="message-image" src={m.imagePreview} alt="uploaded" />}
            {m.text && (
              <div className="message-text">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <div className="message-text loading-dots">Thinking…</div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      <form className="composer" onSubmit={handleSubmit}>
        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="preview" />
            <button type="button" className="remove-image" onClick={clearImage}>×</button>
          </div>
        )}
        <div className="composer-row">
          <button
            type="button"
            className="attach-button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach image"
          >
            📎
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
          <input
            type="text"
            className="text-input"
            placeholder="Ask about your energy usage..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="send-button" disabled={loading || (!input.trim() && !image)}>
            Send
          </button>
        </div>
      </form>
    </div>
  )
}

export default Chat
