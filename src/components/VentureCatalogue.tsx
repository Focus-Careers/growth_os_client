import { useState, useEffect } from 'react'

/* ============================================================
   CONSTANTS
   ============================================================ */

const COLORS = {
  bg: '#f6f3ee',
  fg: '#1a1a18',
  muted: '#8a857b',
  accent: '#c44e2b',
  border: '#e2ddd4',
  cream: '#faf8f4',
  ventureGreen: '#00a071',
}

const PRODUCTS = [
  {
    id: 'growth',
    name: 'growthOS',
    accent: '#c44e2b',
    description:
      'Your AI-powered marketing department. Lead generation, outreach campaigns, and pipeline management — 42 specialists, one conversation.',
    icon: 'growth' as const,
    ready: true,
  },
  {
    id: 'deal',
    name: 'dealOS',
    accent: '#2b5ec4',
    description:
      'AI-driven due diligence, automated. Risk assessment, document analysis, and compliance checks — thorough, fast, and always audit-ready.',
    icon: 'deal' as const,
    ready: true,
  },
  {
    id: 'credit',
    name: 'creditOS',
    accent: '#c4912b',
    description:
      'Intelligent credit control that chases so you don\'t have to. Automated follow-ups, risk scoring, and real-time cashflow visibility.',
    icon: 'credit' as const,
    ready: false,
    comingSoon: true,
  },
  {
    id: 'insight',
    name: 'insightOS',
    accent: '#2ba8c4',
    description:
      'Business intelligence that surfaces what matters. AI-curated dashboards, trend detection, and strategic recommendations on demand.',
    icon: 'insight' as const,
    ready: false,
    comingSoon: true,
  },
]

type IconType = 'growth' | 'deal' | 'credit' | 'insight'

/* ============================================================
   PRODUCT ICON
   ============================================================ */

function ProductIcon({ type, hovered, accent }: { type: IconType; hovered: boolean; accent: string }) {
  const color = hovered ? '#fff' : accent
  const style: React.CSSProperties = {
    transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
    transform: hovered
      ? type === 'growth'
        ? 'rotate(15deg) scale(1.1)'
        : type === 'deal'
        ? 'scale(1.15)'
        : type === 'credit'
        ? 'translateY(-3px) scale(1.1)'
        : 'rotate(-10deg) scale(1.1)'
      : 'none',
  }

  if (type === 'growth') {
    return (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={style}>
        <path d="M6 28L14 18L20 22L30 8" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M24 8H30V14" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="14" cy="18" r="2" fill={color} opacity={hovered ? 1 : 0.4} style={{ transition: 'opacity 0.3s ease' }} />
        <circle cx="20" cy="22" r="2" fill={color} opacity={hovered ? 1 : 0.4} style={{ transition: 'opacity 0.3s ease' }} />
      </svg>
    )
  }
  if (type === 'deal') {
    return (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={style}>
        <rect x="6" y="8" width="24" height="20" rx="2" stroke={color} strokeWidth="2.5" />
        <path d="M6 14H30" stroke={color} strokeWidth="2.5" />
        <path d="M12 20H20" stroke={color} strokeWidth="2" strokeLinecap="round" opacity={hovered ? 1 : 0.5} style={{ transition: 'opacity 0.3s ease' }} />
        <path d="M12 24H17" stroke={color} strokeWidth="2" strokeLinecap="round" opacity={hovered ? 1 : 0.5} style={{ transition: 'opacity 0.3s ease' }} />
        <circle cx="25" cy="22" r="3" stroke={color} strokeWidth="2" />
        <path d="M27 24L29 26" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }
  if (type === 'credit') {
    return (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={style}>
        <path d="M18 6V10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M18 26V30" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M13 12C13 9.8 15.2 8 18 8C20.8 8 23 9.8 23 12C23 14.2 20.8 16 18 16" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M23 24C23 26.2 20.8 28 18 28C15.2 28 13 26.2 13 24C13 21.8 15.2 20 18 20" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    )
  }
  // insight
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={style}>
      <circle cx="18" cy="16" r="8" stroke={color} strokeWidth="2.5" />
      <path d="M14 27H22" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M15 30H21" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M18 8V5" stroke={color} strokeWidth="2" strokeLinecap="round" opacity={hovered ? 1 : 0.4} style={{ transition: 'opacity 0.3s ease' }} />
      <path d="M24 10L26 8" stroke={color} strokeWidth="2" strokeLinecap="round" opacity={hovered ? 1 : 0.4} style={{ transition: 'opacity 0.3s ease' }} />
      <path d="M12 10L10 8" stroke={color} strokeWidth="2" strokeLinecap="round" opacity={hovered ? 1 : 0.4} style={{ transition: 'opacity 0.3s ease' }} />
    </svg>
  )
}

/* ============================================================
   PRODUCT CARD
   ============================================================ */

interface Product {
  id: string
  name: string
  accent: string
  description: string
  icon: IconType
  ready: boolean
  comingSoon?: boolean
}

function ProductCard({ product, onLaunch }: { product: Product; onLaunch?: (id: string) => void }) {
  const [hovered, setHovered] = useState(false)
  const { fg, muted, border, cream } = COLORS

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => product.ready && onLaunch && onLaunch(product.id)}
      style={{
        position: 'relative',
        padding: '36px 32px',
        borderRadius: 6,
        border: `1px solid ${hovered ? product.accent : border}`,
        background: hovered ? product.accent : cream,
        cursor: product.ready ? 'pointer' : 'default',
        transition: 'all 0.45s cubic-bezier(0.16,1,0.3,1)',
        transform: hovered ? 'scale(1.03) translateZ(0)' : 'scale(1) translateZ(0)',
        willChange: 'transform, background, border-color, box-shadow',
        backfaceVisibility: 'hidden',
        WebkitFontSmoothing: 'antialiased',
        boxShadow: hovered
          ? `0 8px 30px ${product.accent}25, 0 2px 8px ${product.accent}15`
          : '0 1px 3px rgba(0,0,0,0.04)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Radial gradient overlay */}
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: `radial-gradient(circle at 30% 30%, ${product.accent}15, transparent 60%)`,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.5s ease',
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 1 }}>
        <ProductIcon type={product.icon} hovered={hovered} accent={product.accent} />
        <div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: hovered ? '#fff' : fg,
              transition: 'color 0.35s ease',
            }}
          >
            {product.name.replace('OS', '')}
            <span style={{ color: hovered ? 'rgba(255,255,255,0.7)' : product.accent, transition: 'color 0.35s ease' }}>
              OS
            </span>
          </div>
          {product.comingSoon && (
            <div
              style={{
                fontSize: 9,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginTop: 3,
                color: hovered ? 'rgba(255,255,255,0.6)' : muted,
                fontFamily: "'DM Mono', monospace",
                transition: 'color 0.35s ease',
              }}
            >
              Coming Soon
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          fontSize: 13,
          lineHeight: 1.65,
          color: hovered ? 'rgba(255,255,255,0.85)' : muted,
          transition: 'color 0.35s ease',
          position: 'relative',
          zIndex: 1,
          flex: 1,
        }}
      >
        {product.description}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {product.ready ? (
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: hovered ? '#fff' : product.accent,
              transition: 'all 0.35s ease',
              fontFamily: "'DM Mono', monospace",
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            Launch
            <span
              style={{
                display: 'inline-block',
                transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1)',
                transform: hovered ? 'translateX(4px)' : 'translateX(0)',
              }}
            >
              →
            </span>
          </div>
        ) : (
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: hovered ? 'rgba(255,255,255,0.7)' : muted,
              transition: 'all 0.35s ease',
              fontFamily: "'DM Mono', monospace",
              padding: '6px 14px',
              borderRadius: 4,
              border: `1px solid ${hovered ? 'rgba(255,255,255,0.3)' : border}`,
              display: 'inline-block',
            }}
          >
            Notify me →
          </div>
        )}
      </div>
    </div>
  )
}

/* ============================================================
   VENTURE CATALOGUE
   ============================================================ */

interface VentureCatalogueProps {
  onLaunch: (productId: string) => void
}

export default function VentureCatalogue({ onLaunch }: VentureCatalogueProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setTimeout(() => setMounted(true), 100)
  }, [])
  const { ventureGreen } = COLORS

  return (
    <div className="catalogue-root">
      <div className="catalogue-grid-bg" />

      <div className="catalogue-inner">
        <div
          style={{
            textAlign: 'center',
            marginBottom: 12,
            opacity: mounted ? 1 : 0,
            animation: mounted ? 'fade-up 0.6s ease 0.1s both' : 'none',
          }}
        >
          <div className="catalogue-title">
            VENTURE<span style={{ color: ventureGreen }}>OS</span>
          </div>
        </div>

        <div
          style={{
            textAlign: 'center',
            marginBottom: 72,
            opacity: mounted ? 1 : 0,
            animation: mounted ? 'fade-up 0.6s ease 0.3s both' : 'none',
          }}
        >
          <div className="catalogue-subtitle">Your suite of AI-powered business tools.</div>
        </div>

        <div className="catalogue-product-grid">
          {PRODUCTS.map((product, i) => (
            <div
              key={product.id}
              style={{
                opacity: mounted ? 1 : 0,
                animation: mounted ? `fade-up 0.5s ease ${0.4 + i * 0.1}s both` : 'none',
              }}
            >
              <ProductCard product={product} onLaunch={onLaunch} />
            </div>
          ))}
        </div>

        <div
          style={{
            textAlign: 'center',
            marginTop: 56,
            opacity: mounted ? 1 : 0,
            animation: mounted ? 'fade-in 0.5s ease 1s both' : 'none',
          }}
        >
          <span className="catalogue-footer">Built by Venture Labs</span>
        </div>
      </div>
    </div>
  )
}
