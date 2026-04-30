import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '~/styles/global.css'
import App from '~/App'
import ProviderGlobal from '~/redux/provider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProviderGlobal>
      <App />
    </ProviderGlobal>
  </StrictMode>,
)
