import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { RoleProvider } from './contexts/RoleContext'
import { ThemeProvider } from './contexts/ThemeContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <RoleProvider>
        <App />
      </RoleProvider>
    </ThemeProvider>
  </StrictMode>,
)
