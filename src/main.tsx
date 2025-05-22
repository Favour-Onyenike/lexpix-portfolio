
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import App from './App.tsx';
import './index.css';
import emailjs from '@emailjs/browser';

// Initialize EmailJS with your public key
emailjs.init('N81FOQih4FIfB5U5l');

// Get the root element and ensure it exists
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
