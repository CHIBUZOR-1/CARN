import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router-dom';
import { AuthContextProvider } from './Context/AuthContext.jsx'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { persistor, store } from './Redux/store.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <BrowserRouter>
            <AuthContextProvider>
              <App />
            </AuthContextProvider>
          </BrowserRouter>
        </PersistGate>
      </Provider>
    </HelmetProvider>
  </StrictMode>,
)
