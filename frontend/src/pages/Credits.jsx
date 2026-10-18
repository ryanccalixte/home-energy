import './Credits.css'

// Fill in your team's details here.
const CONTRIBUTORS = [
  {
    name: 'Contributor One',
    role: 'Role (e.g. Frontend Developer)',
    contribution: 'Short description of what this person built or worked on.',
    github: 'https://github.com/',
  },
  {
    name: 'Contributor Two',
    role: 'Role (e.g. Backend & AI Developer)',
    contribution: 'Short description of what this person built or worked on.',
    github: 'https://github.com/',
  },
]

const initials = (name) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

function Credits() {
  return (
    <main className="credits">
      <h1>Credits</h1>
      <p className="credits-intro">The people behind Home Energy.</p>

      <div className="contributors">
        {CONTRIBUTORS.map((c) => (
          <article key={c.name} className="contributor">
            <div className="avatar" aria-hidden="true">{initials(c.name)}</div>
            <h2>{c.name}</h2>
            <p className="role">{c.role}</p>
            <p>{c.contribution}</p>
            {c.github && <a href={c.github} target="_blank" rel="noreferrer">GitHub</a>}
          </article>
        ))}
      </div>

      <p className="built-with">
        Built with React, Vite, Flask, Ollama, and TensorFlow.js (COCO-SSD).
      </p>
    </main>
  )
}

export default Credits
