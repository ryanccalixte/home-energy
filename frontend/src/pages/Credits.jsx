import './Credits.css'
import ryanImage from '../assets/ryan.png'

const CONTRIBUTORS = [
  {
    name: 'Ryan Calixte',
    role: 'Computer Vision & Machine Learning Developer',
    contribution: 'Designed and implemented computer vision algorithms; Designed AI agent prompt architecture.',
    github: 'https://github.com/ryanccalixte',
    image: ryanImage,
  },
  {
    name: 'Adrian Garcia',
    role: 'Computer Vision & Data Analyst',
    contribution: 'Compared and tested different computer vision models for object detection and tracking; Implemented data analysis pipelines for the AI Agent',
    github: 'https://github.com/',
    image: ''
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

      <div className="contributors">
        {CONTRIBUTORS.map((c) => (
          <article key={c.name} className="contributor">
            <img className="avatar" src={c.image} alt={c.name} />
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
