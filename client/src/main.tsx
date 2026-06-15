import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// disable right click
document.oncontextmenu = function (e) {
  if (window.location.hostname !== 'localhost') {
    return;
  }
  e.preventDefault();
  return false;
}

// disable Ctrl+Shift+I
document.onkeydown = function (e) {
  if (window.location.hostname !== 'localhost') {
    return;
  }
  if (e.key === 'F12') {
    e.preventDefault();
    return false;
  }
  if (e.ctrlKey && e.shiftKey && e.key === 'I') {
    e.preventDefault();
    return false;
  }
}

// Security Warning
console.warn('%cHOLD ON! STOPPP!! ', 'color: #ff0000; font-weight: bold; font-size: 60px;');
console.warn('%cThis is a browser feature intended for developers. If someone told you to copy-paste something here to enable a feature or "hack" someone\'s account, it is a scam and will give them access to your account.', 'font-size: 20px;');