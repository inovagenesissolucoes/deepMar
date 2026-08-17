'use client'
import { useEffect, useRef, useState } from 'react'
import { gerarPixPayload, formatarMoeda } from '@/lib/api'

interface QRCodePixProps {
  chavePix: string
  valor: number
  nomeRecebedor: string
  descricao: string
}

export default function QRCodePix({ chavePix, valor, nomeRecebedor, descricao }: QRCodePixProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copiado, setCopiado] = useState(false)
  const payload = gerarPixPayload(chavePix, valor, nomeRecebedor)

  useEffect(() => {
    if (!canvasRef.current) return
    import('qrcode').then((QRCode) => {
      QRCode.toCanvas(canvasRef.current!, payload, {
        width: 220,
        margin: 2,
        color: { dark: '#0A1628', light: '#FFFFFF' },
      })
    })
  }, [payload])

  async function copiar() {
    await navigator.clipboard.writeText(payload)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-white rounded-2xl p-3 shadow-lg">
        <canvas ref={canvasRef} />
      </div>

      <div className="text-center">
        <p className="text-2xl font-extrabold text-white">{formatarMoeda(valor)}</p>
        <p className="text-sm text-white/50 mt-0.5">{descricao}</p>
      </div>

      <div className="w-full glass rounded-xl px-4 py-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-white/40 mb-0.5">Chave Pix</p>
          <p className="text-sm text-white font-medium truncate">{chavePix}</p>
        </div>
        <button
          onClick={copiar}
          className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95"
          style={{ background: copiado ? 'rgba(16,185,129,0.2)' : 'rgba(37,99,235,0.3)', color: copiado ? '#34d399' : '#38bdf8' }}
        >
          {copiado ? '✓ Copiado' : 'Copiar'}
        </button>
      </div>

      <button
        onClick={copiar}
        className="btn-primary text-sm"
      >
        {copiado ? '✓ Código copiado!' : 'Copiar código Pix'}
      </button>
    </div>
  )
}
