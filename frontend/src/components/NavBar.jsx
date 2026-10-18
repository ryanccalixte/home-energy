import './NavBar.css'

const LINKS = [
  { path: '/', label: 'Home' },
  { path: '/chat', label: 'Chat' },
  { path: '/credits', label: 'Credits' },
]

function NavBar({ path }) {
  return (
    <nav className="navbar">
      <a className="brand" href="#/">
        <span className="brand-icon" aria-hidden="true">☀</span>
        Home Energy
      </a>
      <div className="nav-links">
        {LINKS.map((link) => (
          <a
            key={link.path}
            href={`#${link.path}`}
            className={`nav-link ${path === link.path ? 'active' : ''}`}
            aria-current={path === link.path ? 'page' : undefined}
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  )
}

export default NavBar
