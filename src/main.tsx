
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'
import './index.css'
import emailjs from '@emailjs/browser';
import { initializeReviews } from './services/localReviewService';

// Initialize EmailJS with your public key
emailjs.init('N81FOQih4FIfB5U5l');

// Initialize sample reviews if none exist
initializeReviews();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
