import { useRef, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:5000/api/chat'

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() && !image) return

    const userMessage = {
      role: 'user',
      text: input.trim(),
      imagePreview,
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    const imageToSend = image
    clearImage()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('message', userMessage.text)
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>Home Energy Assistant</h1>
        <p>Ask about appliance energy usage, or upload a photo of a room.</p>
      </header>

      <main className="chat-window">
        {messages.length === 0 && (
          <div className="empty-state">
            Describe your appliances (e.g. "2 LED bulbs and a refrigerator") or attach a photo to get started.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role} ${m.isError ? 'error' : ''}`}>
            {m.imagePreview && <img className="message-image" src={m.imagePreview} alt="uploaded" />}
            {m.text && <div className="message-text">{m.text}</div>}
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <div className="message-text loading-dots">Thinking…</div>
          </div>
        )}
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

export default App
