'use client'
import { useState, useEffect } from 'react'

interface CountdownProps {
  dataEvento: string
  nomeEvento: string
}

interface Tempo {
  dias: number
  horas: number
  minutos: number
  segundos: number
}

function calcular(dataEvento: string): Tempo {
  const agora = Date.now()
  const alvo = new Date(dataEvento + 'T00:00:00').getTime()
  const diff = Math.max(0, alvo - agora)
  return {
    dias:     Math.floor(diff / (1000 * 60 * 60 * 24)),
    horas:    Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutos:  Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    segundos: Math.floor((diff % (1000 * 60)) / 1000),
  }
}

function Bloco({ valor, label }: { valor: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white animate-countdown"
        style={{ background: 'rgba(37,99,235,0.3)', border: '1px solid rgba(56,189,248,0.3)' }}
      >
        {String(valor).padStart(2, '0')}
      </div>
      <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest">
        {label}
      </span>
    </div>
  )
}

export default function Countdown({ dataEvento, nomeEvento }: CountdownProps) {
  const [tempo, setTempo] = useState<Tempo>(calcular(dataEvento))
  const [tick, setTick] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setTempo(calcular(dataEvento))
      setTick((t) => !t)
    }, 1000)
    return () => clearInterval(interval)
  }, [dataEvento])

  const chegou = tempo.dias === 0 && tempo.horas === 0 && tempo.minutos === 0 && tempo.segundos === 0

  if (chegou) {
    return (
      <div className="text-center py-6">
        <p className="text-2xl font-bold text-brand-gold animate-pulse">
          🏕️ O acampamento chegou!
        </p>
      </div>
    )
  }

  return (
    <div className="px-4 py-5 rounded-3xl glass">
      <p className="text-xs font-semibold text-white/40 uppercase tracking-widest text-center mb-1">
        Contagem regressiva
      </p>
      <p className="text-sm font-bold text-brand-sky text-center mb-4 truncate">
        {nomeEvento}
      </p>
      <div className="flex items-center justify-center gap-3">
        <Bloco valor={tempo.dias}     label="dias" />
        <span className="text-white/30 text-2xl font-light pb-5">:</span>
        <Bloco valor={tempo.horas}    label="horas" />
        <span className="text-white/30 text-2xl font-light pb-5">:</span>
        <Bloco valor={tempo.minutos}  label="min" />
        <span className="text-white/30 text-2xl font-light pb-5">:</span>
        <Bloco valor={tempo.segundos} label="seg" />
      </div>
    </div>
  )
}
