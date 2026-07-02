import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { FiMenu, FiX } from 'react-icons/fi'

const Navber = () => {
  const [open, setOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const location = useLocation()

  const items = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ]

  return (
    <>
      <nav className='fixed inset-x-0 top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-slate-700'>
        <div className='max-w-7xl mx-auto flex justify-between items-center p-4'>
          <Link to='/' className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
            Not_AI
          </Link>

          {/* Desktop Menu */}
          <ul className='hidden md:flex gap-8 items-center'>
            {items.map(item => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`hover:text-blue-500 transition ${
                    location.pathname === item.path ? 'text-blue-600 font-bold border-b-2 border-blue-600' : ''
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className='hidden md:flex items-center gap-4'>
            <button onClick={toggleTheme} className='text-2xl'>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            {user ? (
              <button onClick={logout} className='bg-red-500 text-white px-4 py-2 rounded-lg'>Logout</button>
            ) : (
              <button className='bg-blue-600 text-white px-4 py-2 rounded-lg'>Login</button>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button className='md:hidden text-2xl z-50' onClick={() => setOpen(!open)}>
            {open ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-800 z-40 transform transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className='p-6'>
          <h2 className='text-xl font-bold mb-8'>Not_AI</h2>
          <ul className='flex flex-col gap-4'>
            {items.map(item => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={`block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 ${
                    location.pathname === item.path ? 'bg-blue-50 dark:bg-slate-700 font-bold' : ''
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Overlay */}
      {open && <div className='fixed inset-0 bg-black/50 z-30 md:hidden' onClick={() => setOpen(false)} />}
    </>
  )
}

export default Navber