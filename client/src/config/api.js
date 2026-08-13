// Single source of truth for the backend API URL.
//
// In production (Vercel), set VITE_API_URL in the project's Environment
// Variables to your deployed Render backend URL, e.g.
//   VITE_API_URL=https://nyoranix-api.onrender.com
//
// Locally, if VITE_API_URL isn't set, it falls back to your local backend
// so `npm run dev` keeps working exactly as before with no extra setup.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
