import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './app/App.tsx'
import { GameProvider } from "./app/context/GameContext";
import { redirectHomeOnGameReload } from "./app/hooks/reload.ts";
import './styles/index.css'

// Doit tourner avant que BrowserRouter ne lise l'URL courante.
redirectHomeOnGameReload();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
  	<GameProvider>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</GameProvider>
  </React.StrictMode>,
)
