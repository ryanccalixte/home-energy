import { useEffect, useState } from 'react'
import NavBar from './components/NavBar.jsx'
import Home from './pages/Home.jsx'
import Chat from './pages/Chat.jsx'
import Credits from './pages/Credits.jsx'

const ROUTES = {
  '/': Home,
  '/chat': Chat,
  '/credits': Credits,
}

const currentPath = () => window.location.hash.replace(/^#/, '') || '/'

function App() {
  const [path, setPath] = useState(currentPath)

  useEffect(() => {
    const onHashChange = () => {
      setPath(currentPath())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const Page = ROUTES[path] ?? Home

  return (
    <div className="app-shell">
      <NavBar path={ROUTES[path] ? path : '/'} />
      <Page />
    </div>
  )
}

export default App
