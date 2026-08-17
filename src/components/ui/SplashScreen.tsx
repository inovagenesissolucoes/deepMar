'use client'
import { useEffect, useState } from 'react'

interface SplashScreenProps {
  onDone: () => void
}

export default function SplashScreen({ onDone }: SplashScreenProps) {
  const [saindo, setSaindo] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setSaindo(true)
      setTimeout(onDone, 400)
    }, 2200)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-400 ${
        saindo ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ background: 'linear-gradient(160deg, #0A1628 0%, #0d1f3c 50%, #0a1628 100%)' }}
    >
      {/* Estrelas de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.6 + 0.1,
              animation: `pulse ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: Math.random() * 2 + 's',
            }}
          />
        ))}
      </div>

      {/* Logo central */}
      <div className="animate-splash-logo flex flex-col items-center gap-6">
        {/* Ícone */}
        <div className="relative">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1A2F5E, #2563EB)' }}
          >
            {/* Ícone de montanha/acampamento */}
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
              <path d="M26 8L44 40H8L26 8Z" fill="white" fillOpacity="0.15"/>
              <path d="M26 8L44 40H8L26 8Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M16 40L26 22L36 40" stroke="#38BDF8" strokeWidth="2" strokeLinejoin="round"/>
              <circle cx="26" cy="18" r="3" fill="#FBBF24"/>
              <path d="M20 40h12" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
            </svg>
          </div>
          {/* Brilho ao redor */}
          <div
            className="absolute inset-0 rounded-3xl animate-pulse-slow"
            style={{ boxShadow: '0 0 40px rgba(37, 99, 235, 0.4)', zIndex: -1 }}
          />
        </div>

        {/* Nome */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Acamp{' '}
            <span
              style={{ background: 'linear-gradient(90deg, #38BDF8, #2563EB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Deep
            </span>
          </h1>
          <p className="mt-2 text-sm text-white/40 font-medium tracking-widest uppercase">
            Acampamentos da Igreja
          </p>
        </div>
      </div>

      {/* Loading bar */}
      <div className="absolute bottom-16 left-8 right-8">
        <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #2563EB, #38BDF8)',
              animation: 'loadingBar 2s ease-in-out forwards',
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes loadingBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  )
}
