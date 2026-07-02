import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Naime } from './context/UserContext'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Naime>
        <GoogleOAuthProvider clientId="887887057713-kk7tqihg8lg7fftd0fvffpdoipqh9ir2.apps.googleusercontent.com">
        <App />
        </GoogleOAuthProvider>
      </Naime>
    </BrowserRouter>
  </StrictMode>
)