import { useEffect, useRef, useState } from 'react'
import { APPLIANCES, DEFAULT_RATE } from '../data/appliances.js'
import './RoomScanner.css'

const MAX_DIMENSION = 1280
const MIN_SCORE = 0.45

// TensorFlow.js and the COCO-SSD weights are large, so load them only on first scan.
let modelPromise = null
function loadModel() {
  if (!modelPromise) {
    modelPromise = (async () => {
      const [tf, cocoSsd] = await Promise.all([import('@tensorflow/tfjs'), import('@tensorflow-models/coco-ssd')])
      await tf.ready()
      return cocoSsd.load({ base: 'mobilenet_v2' })
    })().catch((err) => {
      modelPromise = null
      throw err
    })
  }
  return modelPromise
}

const kwhPerDay = (item) => (item.watts * item.count * item.hours) / 1000

const fmt = (n, digits = 2) => n.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })

function buildChatMessage(items, rate) {
  const totalKwh = items.reduce((sum, i) => sum + kwhPerDay(i), 0)
  const ask =
    'Please review this estimate, point out any other energy-using appliances you can see in the photo, ' +
    'and give me advice on how I could change my energy use to save money and energy.'

  if (items.length === 0) {
    return (
      '**Room scan results** (computer vision)\n\n' +
      'The scanner did not detect any appliances it recognizes in this photo.\n\n' +
      'Please look at the photo, identify any energy-using appliances, estimate their usage, and give me advice on how I could save energy.'
    )
  }

  const rows = items.map((i) => `| ${i.name} | ${i.count} | ${i.hours} | ${fmt(kwhPerDay(i))} |`).join('\n')
  return (
    '**Room scan results** (computer vision)\n\n' +
    '| Appliance | Qty | Hours/day | Est. kWh/day |\n|---|---|---|---|\n' +
    `${rows}\n\n` +
    `Estimated total: **${fmt(totalKwh)} kWh/day**, about **$${fmt(totalKwh * 30 * rate)}/month** at $${rate}/kWh.\n\n` +
    ask
  )
}

function RoomScanner({ onSend, onClose, busy }) {
  const [stage, setStage] = useState('idle') // idle | camera | analyzing | results
  const [error, setError] = useState(null)
  const [items, setItems] = useState([])
  const [annotated, setAnnotated] = useState(null)
  const [rate, setRate] = useState(DEFAULT_RATE)
  const cleanImageRef = useRef(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  useEffect(() => stopCamera, [])

  useEffect(() => {
    if (stage === 'camera' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [stage])

  const startCamera = async () => {
    setError(null)
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera access is not supported in this browser. Try uploading a photo instead.')
      return
    }
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      setStage('camera')
    } catch {
      setError('Could not access the camera. Check your browser permissions, or upload a photo instead.')
    }
  }

  const analyze = async (source, width, height) => {
    setStage('analyzing')
    setError(null)
    try {
      const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(width * scale)
      canvas.height = Math.round(height * scale)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(source, 0, 0, canvas.width, canvas.height)

      // Keep an unmarked copy to send to the assistant.
      cleanImageRef.current = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))

      const model = await loadModel()
      const predictions = await model.detect(canvas, 30, MIN_SCORE)
      const found = predictions.filter((p) => APPLIANCES[p.class])

      const lineWidth = Math.max(2, canvas.width / 320)
      const fontSize = Math.max(14, Math.round(canvas.width / 45))
      ctx.font = `600 ${fontSize}px system-ui, sans-serif`
      ctx.textBaseline = 'top'
      for (const p of found) {
        const [x, y, w, h] = p.bbox
        const label = `${APPLIANCES[p.class].name} ${Math.round(p.score * 100)}%`
        ctx.strokeStyle = '#4da3ff'
        ctx.lineWidth = lineWidth
        ctx.strokeRect(x, y, w, h)
        const textW = ctx.measureText(label).width + 10
        const labelY = y > fontSize + 8 ? y - fontSize - 8 : y
        ctx.fillStyle = '#4da3ff'
        ctx.fillRect(x - lineWidth / 2, labelY, textW, fontSize + 8)
        ctx.fillStyle = '#05111f'
        ctx.fillText(label, x + 5, labelY + 4)
      }
      setAnnotated(canvas.toDataURL('image/jpeg', 0.85))

      const grouped = {}
      for (const p of found) {
        grouped[p.class] ??= { key: p.class, ...APPLIANCES[p.class], hours: APPLIANCES[p.class].hoursPerDay, count: 0 }
        grouped[p.class].count += 1
      }
      setItems(Object.values(grouped))
      setStage('results')
    } catch (err) {
      console.error(err)
      setError('The appliance detector could not run. Make sure you are online the first time so the model can download.')
      setStage('idle')
    }
  }

  const capturePhoto = () => {
    const video = videoRef.current
    if (!video?.videoWidth) return
    const { videoWidth, videoHeight } = video
    const frame = document.createElement('canvas')
    frame.width = videoWidth
    frame.height = videoHeight
    frame.getContext('2d').drawImage(video, 0, 0)
    stopCamera()
    analyze(frame, videoWidth, videoHeight)
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const url = URL.createObjectURL(file)
    try {
      const img = new Image()
      img.src = url
      await img.decode()
      await analyze(img, img.naturalWidth, img.naturalHeight)
    } catch {
      setError('That file could not be read as an image.')
      setStage('idle')
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  const updateItem = (key, field, value) => {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, [field]: Math.max(0, Number(value) || 0) } : i)))
  }

  const removeItem = (key) => setItems((prev) => prev.filter((i) => i.key !== key))

  const reset = () => {
    stopCamera()
    setItems([])
    setAnnotated(null)
    cleanImageRef.current = null
    setError(null)
    setStage('idle')
  }

  const sendToChat = () => {
    const active = items.filter((i) => i.count > 0)
    onSend({ text: buildChatMessage(active, rate), image: cleanImageRef.current, preview: annotated })
    reset()
  }

  const totalKwh = items.reduce((sum, i) => sum + kwhPerDay(i), 0)

  return (
    <section className="scanner" aria-label="Room scanner">
      <div className="scanner-head">
        <div>
          <h2>Room scanner</h2>
          <p>Take a photo of a room and computer vision will spot common appliances and estimate their energy use.</p>
        </div>
        <button className="scanner-close" onClick={() => { reset(); onClose() }} aria-label="Close scanner">×</button>
      </div>

      {error && <div className="scanner-error">{error}</div>}

      {stage === 'idle' && (
        <div className="scanner-actions">
          <button className="btn btn-primary" onClick={startCamera}>📷 Use camera</button>
          <button className="btn btn-ghost" onClick={() => fileInputRef.current?.click()}>🖼 Upload photo</button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFile}
            hidden
          />
        </div>
      )}

      {stage === 'camera' && (
        <div className="camera">
          <video ref={videoRef} autoPlay playsInline muted />
          <div className="scanner-actions">
            <button className="btn btn-primary" onClick={capturePhoto}>Capture</button>
            <button className="btn btn-ghost" onClick={reset}>Cancel</button>
          </div>
        </div>
      )}

      {stage === 'analyzing' && (
        <div className="analyzing">
          <span className="spinner" aria-hidden="true" />
          Scanning for appliances… (the first scan downloads the detection model)
        </div>
      )}

      {stage === 'results' && (
        <div className="results">
          <img className="annotated" src={annotated} alt="Room photo with detected appliances outlined" />

          {items.length === 0 ? (
            <p className="muted">
              No common appliances were detected. You can still send the photo, and the assistant will look for
              anything the scanner missed.
            </p>
          ) : (
            <div className="table-wrap">
              <table className="estimate-table">
                <thead>
                  <tr>
                    <th>Appliance</th>
                    <th>Qty</th>
                    <th>Hours/day</th>
                    <th>kWh/day</th>
                    <th>$/month</th>
                    <th aria-label="Remove" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={i.key}>
                      <td>
                        {i.name}
                        <span className="range">{i.range}</span>
                      </td>
                      <td>
                        <input type="number" min="0" value={i.count} onChange={(e) => updateItem(i.key, 'count', e.target.value)} />
                      </td>
                      <td>
                        <input type="number" min="0" max="24" step="0.25" value={i.hours} onChange={(e) => updateItem(i.key, 'hours', e.target.value)} />
                      </td>
                      <td>{fmt(kwhPerDay(i))}</td>
                      <td>${fmt(kwhPerDay(i) * 30 * rate)}</td>
                      <td>
                        <button className="remove-row" onClick={() => removeItem(i.key)} aria-label={`Remove ${i.name}`}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="totals">
            <label>
              Electricity rate ($/kWh)
              <input type="number" min="0" step="0.01" value={rate} onChange={(e) => setRate(Math.max(0, Number(e.target.value) || 0))} />
            </label>
            <div>
              <strong>{fmt(totalKwh)} kWh/day</strong> · about <strong>${fmt(totalKwh * 30 * rate)}/month</strong>
            </div>
          </div>
          <p className="muted small">
            These are rough estimates from typical wattages. The scanner recognizes TVs, laptops, microwaves, ovens,
            toasters, refrigerators, hair dryers, and phones. Remove any wrong detections or adjust the hours before sending.
          </p>

          <div className="scanner-actions">
            <button className="btn btn-primary" onClick={sendToChat} disabled={busy}>Ask the assistant for advice</button>
            <button className="btn btn-ghost" onClick={reset}>Scan another</button>
          </div>
        </div>
      )}
    </section>
  )
}

export default RoomScanner
