'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Perfil } from '@/types'

interface NavBarProps {
  perfil: Perfil
}

const itensJovem = [
  { href: '/home',     label: 'Início',   icon: HomeIcon },
  { href: '/eventos',  label: 'Eventos',  icon: CalendarIcon },
  { href: '/parcelas', label: 'Parcelas', icon: WalletIcon },
  { href: '/perfil',   label: 'Perfil',   icon: UserIcon },
]

const itensLider = [
  { href: '/home',      label: 'Início',    icon: HomeIcon },
  { href: '/eventos',   label: 'Eventos',   icon: CalendarIcon },
  { href: '/dashboard', label: 'Painel',    icon: ChartIcon },
  { href: '/perfil',    label: 'Perfil',    icon: UserIcon },
]

export default function NavBar({ perfil }: NavBarProps) {
  const pathname = usePathname()
  const itens = perfil === 'jovem' ? itensJovem : itensLider

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
      <div className="mx-3 mb-3 glass-navy rounded-2xl px-2 py-2 flex items-center justify-around">
        {itens.map((item) => {
          const ativo = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                ativo
                  ? 'bg-brand-blue/40 text-brand-sky'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              <Icon size={22} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function HomeIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/>
    </svg>
  )
}
function CalendarIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  )
}
function WalletIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 7H3a1 1 0 00-1 1v12a1 1 0 001 1h18a1 1 0 001-1V8a1 1 0 00-1-1z"/><path d="M16 14a1 1 0 110-2 1 1 0 010 2z" fill="currentColor"/><path d="M3 7V5a2 2 0 012-2h14a2 2 0 012 2v2"/>
    </svg>
  )
}
function UserIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  )
}
function ChartIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18"/><path d="M7 16l4-5 4 3 4-6"/>
    </svg>
  )
}
