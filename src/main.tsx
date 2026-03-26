import { createRoot } from 'react-dom/client'
import './styles.css'
import PageTransition from './components/PageTransition'
import ErrorBoundary from './components/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <PageTransition />
  </ErrorBoundary>
)
