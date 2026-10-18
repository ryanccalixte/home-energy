import { useEffect, useRef } from 'react'
import './Home.css'

const VIRTUES = [
  { title: 'Clean', text: 'No fuel, no smoke, and no emissions while the panels run.' },
  { title: 'Renewable', text: 'Sunlight never runs out and never has to be mined or shipped.' },
  { title: 'Safe', text: 'No combustion and no fuel storage, just quiet power from your roof.' },
]

const STATS = [
  { prefix: '~', count: 50, suffix: '%', label: 'of a typical home’s energy use goes to heating and cooling.' },
  { prefix: '5–', count: 10, suffix: '%', label: 'of home electricity is drawn by devices that are “off” but still plugged in.' },
  { prefix: '', count: 75, suffix: '%+', label: 'less energy is used by LED bulbs than by incandescent bulbs.' },
]

const LEAKS = [
  { title: 'Drafty windows & doors', text: 'Heated or cooled air slips out through gaps, so the HVAC system has to run longer.', fix: 'Weatherstrip & caulk' },
  { title: 'Phantom power', text: 'TVs, consoles, and chargers keep drawing power around the clock in standby mode.', fix: 'Smart power strips' },
  { title: 'Old lighting', text: 'Incandescent bulbs turn most of their energy into heat instead of light.', fix: 'Switch to LEDs' },
  { title: 'Outdated appliances', text: 'A fridge or dryer from a decade ago can use far more power than a modern efficient model.', fix: 'ENERGY STAR models' },
  { title: 'Set-and-forget thermostats', text: 'Heating or cooling an empty house all day is one of the biggest hidden costs.', fix: 'Programmable thermostat' },
  { title: 'Lights left on outdoors', text: 'Garden and porch lights on the grid all night add up over a year.', fix: 'Solar garden lights' },
]

const STEPS = [
  { title: 'Snap your room', text: 'Take or upload a photo of any room in your home.' },
  { title: 'Spot the appliances', text: 'Computer vision finds the energy-using appliances and estimates what they cost you.' },
  { title: 'Get a plan', text: 'Our assistant suggests practical swaps, from LED bulbs to solar garden lights.' },
]

const REVEAL_SELECTOR = '.reveal, .reveal-timeline'

function countUp(el, reduceMotion) {
  const target = Number(el.dataset.count)
  const { prefix = '', suffix = '' } = el.dataset
  if (reduceMotion) {
    el.textContent = `${prefix}${target}${suffix}`
    return
  }
  const duration = 1400
  const start = performance.now()
  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration)
    const eased = 1 - Math.pow(1 - t, 3)
    el.textContent = `${prefix}${Math.round(target * eased)}${suffix}`
    if (t < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const els = ref.current?.querySelectorAll(REVEAL_SELECTOR) ?? []
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('visible')
          entry.target.querySelectorAll('[data-count]').forEach((el) => countUp(el, reduceMotion))
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.2 },
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return ref
}

function SolarScene() {
  const wire = 'M262 318 C 300 360, 360 360, 412 332'
  return (
    <svg className="solar-scene" viewBox="0 0 600 420" role="img" aria-label="Animated illustration of the sun powering a house through solar panels">
      <defs>
        <radialGradient id="sunGlow">
          <stop offset="0%" stopColor="#ffe28a" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#ffc94a" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ffc94a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="panelFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a5a9e" />
          <stop offset="100%" stopColor="#173661" />
        </linearGradient>
        <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="50%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id="panelClip">
          <rect x="0" y="0" width="200" height="114" rx="4" />
        </clipPath>
      </defs>

      {/* Clouds */}
      <g className="cloud-a" fill="#ffffff" opacity="0.12">
        <ellipse cx="120" cy="70" rx="46" ry="16" />
        <ellipse cx="150" cy="60" rx="30" ry="16" />
      </g>
      <g className="cloud-b" fill="#ffffff" opacity="0.08">
        <ellipse cx="300" cy="120" rx="40" ry="13" />
        <ellipse cx="324" cy="111" rx="24" ry="13" />
      </g>

      {/* Sun */}
      <circle className="sun-glow" cx="480" cy="90" r="90" fill="url(#sunGlow)" />
      <g className="sun-rays" stroke="#ffc94a" strokeWidth="4" strokeLinecap="round">
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1="480" y1="34" x2="480" y2="18" transform={`rotate(${i * 30} 480 90)`} />
        ))}
      </g>
      <circle cx="480" cy="90" r="38" fill="#ffd25e" />

      {/* Sunbeams hitting the panel */}
      <g className="beams" stroke="#ffd25e" strokeWidth="2" strokeDasharray="6 10" opacity="0.6">
        <line x1="450" y1="120" x2="250" y2="220" />
        <line x1="465" y1="130" x2="210" y2="260" />
        <line x1="440" y1="112" x2="150" y2="230" />
      </g>

      {/* Ground */}
      <path d="M0 360 Q 300 330 600 360 L600 420 L0 420 Z" fill="#163323" />
      <path d="M0 380 Q 300 352 600 384 L600 420 L0 420 Z" fill="#1d4430" />

      {/* Panel stand */}
      <g stroke="#6b7c74" strokeWidth="5" strokeLinecap="round">
        <line x1="120" y1="312" x2="120" y2="362" />
        <line x1="230" y1="312" x2="230" y2="356" />
      </g>

      {/* Solar panel */}
      <g transform="translate(78 200) skewX(-18)">
        <rect x="-4" y="-4" width="208" height="122" rx="6" fill="#c9d3cf" />
        <rect x="0" y="0" width="200" height="114" rx="4" fill="url(#panelFill)" />
        <g stroke="#9fc1ee" strokeOpacity="0.45" strokeWidth="1.5">
          {[50, 100, 150].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="114" />)}
          {[38, 76].map((y) => <line key={y} x1="0" y1={y} x2="200" y2={y} />)}
        </g>
        <g clipPath="url(#panelClip)">
          <rect className="panel-shine" x="-90" y="-10" width="70" height="140" fill="url(#shine)" />
        </g>
      </g>

      {/* Wire + energy pulses */}
      <path className="wire" d={wire} fill="none" stroke="#4da3ff" strokeWidth="3" strokeLinecap="round" />
      {[0, 0.6, 1.2].map((begin) => (
        <circle key={begin} r="5" fill="#b8dcff" className="pulse">
          <animateMotion dur="1.8s" repeatCount="indefinite" begin={`${begin}s`} path={wire} />
        </circle>
      ))}

      {/* House */}
      <rect x="410" y="270" width="130" height="92" fill="#e9e2d0" />
      <polygon points="398,274 475,214 552,274" fill="#b5523b" />
      <rect x="495" y="222" width="16" height="30" fill="#8c3f2d" />
      <rect className="window" x="426" y="290" width="30" height="26" rx="2" />
      <rect className="window window-b" x="494" y="290" width="30" height="26" rx="2" />
      <rect x="462" y="320" width="26" height="42" rx="2" fill="#6b4a33" />

    </svg>
  )
}

function Home() {
  const rootRef = useReveal()
  const nextRef = useRef(null)

  return (
    <main className="home" ref={rootRef}>
      <section className="hero">
        <div className="hero-text">
          <h1>
            <span className="highlight">Home Energy</span>
          </h1>
          <h2>
            Power your home <span className="highlight">efficiently</span>
          </h2>
          <p>
            Sunlight is the cleanest, safest, and most reusable energy source we have. Find out where your home
            wastes power and how a few smart changes can lower your bill.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#/chat">Scan my room</a>
            <button className="btn btn-ghost" onClick={() => nextRef.current?.scrollIntoView({ behavior: 'smooth' })}>
              Learn more ↓
            </button>
          </div>
        </div>
        <div className="hero-art">
          <SolarScene />
        </div>
      </section>

      <section className="sunband" ref={nextRef}>
        <blockquote className="sunband-quote reveal">
          In about an hour and a half, enough sunlight reaches Earth to power the entire world for a year.
          <cite>U.S. Department of Energy</cite>
        </blockquote>
        <div className="virtues">
          {VIRTUES.map((v, i) => (
            <div key={v.title} className="virtue reveal" style={{ '--i': i }}>
              <span className="virtue-word">{v.title}.</span>
              <p>{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="waste">
        <div className="waste-intro">
          <h2 className="reveal">Most homes pay for energy they never use.</h2>
          <p className="reveal" style={{ '--i': 1 }}>
            Energy waste is easy to miss because it doesn’t show up as one big item. It slips away through drafty
            windows, devices sitting in standby, old bulbs, and appliances working harder than they need to. Each
            leak is small, but together they push homeowners’ bills well past what they actually need to pay.
          </p>
        </div>

        <div className="figures">
          {STATS.map((s, i) => (
            <div key={s.label} className="figure reveal" style={{ '--i': i }}>
              <div className="figure-value" data-count={s.count} data-prefix={s.prefix} data-suffix={s.suffix}>
                {s.prefix}0{s.suffix}
              </div>
              <p>{s.label}</p>
            </div>
          ))}
        </div>
        <p className="figures-source">Source: U.S. Department of Energy</p>
      </section>

      <section className="leaks">
        <div className="leaks-head">
          <h2 className="reveal">Where the money goes</h2>
          <p className="reveal" style={{ '--i': 1 }}>Six of the most common leaks, and the simplest way to plug each one.</p>
        </div>
        <ol className="leak-list">
          {LEAKS.map((l, i) => (
            <li key={l.title} className="leak-row reveal">
              <span className="leak-num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{l.title}</h3>
              <p>{l.text}</p>
              <span className="leak-fix">{l.fix} →</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="how">
        <h2 className="reveal">From photo to plan in three steps</h2>
        <div className="timeline reveal-timeline">
          <span className="timeline-line" aria-hidden="true" />
          <ol className="timeline-steps">
            {STEPS.map((s, i) => (
              <li key={s.title} className="timeline-step" style={{ '--i': i }}>
                <span className="timeline-dot">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="cta-band">
        <div className="reveal">
          <h2>See what your home is really using.</h2>
          <p>Snap a photo of any room and get a personalized plan to cut your bill.</p>
          <a className="btn btn-light" href="#/chat">Scan my room →</a>
        </div>
      </section>

      <footer className="home-footer">
        Estimates are for guidance only. Talk to a licensed professional before major upgrades.
      </footer>
    </main>
  )
}

export default Home
