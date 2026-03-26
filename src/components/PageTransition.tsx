import { useState } from 'react'
import VentureCatalogue from './VentureCatalogue'
import App from '../App'

const PRODUCTS_ACCENT: Record<string, string> = {
  growth: '#c44e2b',
  deal: '#2b5ec4',
  credit: '#c4912b',
  insight: '#2ba8c4',
}

type ViewType = 'catalogue' | 'growth'
type Phase = 'idle' | 'wipe-in' | 'covered' | 'wipe-out'

export default function PageTransition() {
  const [currentView, setCurrentView] = useState<ViewType>('catalogue')
  const [transitionPhase, setTransitionPhase] = useState<Phase>('idle')
  const [transitionAccent, setTransitionAccent] = useState('#c44e2b')

  const navigate = (view: ViewType, accent?: string) => {
    if (transitionPhase !== 'idle') return

    setTransitionAccent(accent || '#c44e2b')
    setTransitionPhase('wipe-in')

    setTimeout(() => {
      setCurrentView(view)
      setTransitionPhase('covered')

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTransitionPhase('wipe-out')
          setTimeout(() => {
            setTransitionPhase('idle')
          }, 1000)
        })
      })
    }, 600)
  }

  const contentStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: transitionPhase === 'idle' ? 'relative' : 'absolute',
    inset: 0,
    zIndex: transitionPhase === 'wipe-out' ? 100 : 2,
    clipPath:
      transitionPhase === 'wipe-out'
        ? 'circle(150% at 50% 50%)'
        : transitionPhase === 'covered'
        ? 'circle(0% at 50% 50%)'
        : transitionPhase === 'wipe-in'
        ? 'circle(150% at 50% 50%)'
        : 'none',
    transition:
      transitionPhase === 'wipe-out'
        ? 'clip-path 0.9s cubic-bezier(0.16, 1, 0.3, 1)'
        : 'none',
  }

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: transitionPhase === 'wipe-in' ? 100 : 50,
    background: transitionAccent,
    opacity: transitionPhase === 'idle' ? 0 : 1,
    clipPath:
      transitionPhase === 'wipe-in' || transitionPhase === 'covered' || transitionPhase === 'wipe-out'
        ? 'circle(150% at 50% 50%)'
        : 'circle(0% at 50% 50%)',
    transition:
      transitionPhase === 'wipe-in'
        ? 'clip-path 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0s'
        : transitionPhase === 'idle'
        ? 'opacity 0s ease 0s, clip-path 0s ease 0s'
        : 'none',
  }

  return (
    <div className="page-transition-root">
      <div style={contentStyle}>
        {currentView === 'catalogue' && (
          <VentureCatalogue
            onLaunch={(id) => {
              const accent = PRODUCTS_ACCENT[id]
              if (id === 'growth') {
                navigate('growth', accent)
              }
            }}
          />
        )}
        {currentView === 'growth' && (
          <App onBack={() => navigate('catalogue', '#00a071')} />
        )}
      </div>

      <div style={overlayStyle} />
    </div>
  )
}
