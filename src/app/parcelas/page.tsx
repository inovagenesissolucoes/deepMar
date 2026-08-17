'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import NavBar from '@/components/layout/NavBar'
import QRCodePix from '@/components/ui/QRCodePix'
import { useSessao } from '@/hooks/useSessao'
import { rpc, formatarMoeda, formatarData, statusVencimento, diasParaVencimento } from '@/lib/api'
import type { Parcela, Evento, Inscricao } from '@/types'

interface ParcComEvento extends Parcela {
  evento_nome: string
  chave_pix: string
  evento_id: string
}

export default function ParcelasPage() {
  const router = useRouter()
  const { sessao, carregando: carregandoSessao } = useSessao()
  const [parcelas, setParcelas] = useState<ParcComEvento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [parcelaAtiva, setParcelaAtiva] = useState<ParcComEvento | null>(null)
  const [abaAtiva, setAbaAtiva] = useState<'pendente' | 'paga'>('pendente')

  useEffect(() => {
    if (!carregandoSessao && !sessao) router.replace('/cadastro')
  }, [sessao, carregandoSessao, router])

  useEffect(() => {
    if (!sessao) return
    rpc<{ data: ParcComEvento[] }>('minhasParcelas').then((r) => {
      setParcelas(r.data || [])
    }).finally(() => setCarregando(false))
  }, [sessao])

  const pendentes = parcelas.filter((p) => p.status !== 'paga')
  const pagas     = parcelas.filter((p) => p.status === 'paga')
  const listaAtiva = abaAtiva === 'pendente' ? pendentes : pagas

  const totalPendente = pendentes.reduce((acc, p) => acc + p.valor, 0)

  if (carregandoSessao || !sessao) return <div className="min-h-screen" style={{ background: '#0A1628' }} />

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg, #0A1628, #0d1f3c)' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-2">
        <p className="text-xs text-white/40 uppercase tracking-widest font-medium">Minhas</p>
        <h1 className="text-2xl font-extrabold text-white">Parcelas</h1>
      </div>

      {/* Resumo */}
      {totalPendente > 0 && (
        <div className="mx-5 mt-4 mb-2 glass-navy rounded-2xl px-4 py-4 flex items-center justify-between animate-scale-in">
          <div>
            <p className="text-xs text-white/40">Total pendente</p>
            <p className="text-2xl font-extrabold text-brand-gold">{formatarMoeda(totalPendente)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/40">Parcelas</p>
            <p className="text-xl font-bold text-white">{pendentes.length}</p>
          </div>
        </div>
      )}

      {/* Abas */}
      <div className="flex gap-1 mx-5 mt-4 mb-2 bg-white/5 rounded-xl p-1">
        {(['pendente', 'paga'] as const).map((aba) => (
          <button
            key={aba}
            onClick={() => setAbaAtiva(aba)}
            className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
            style={abaAtiva === aba ? { background: 'rgba(37,99,235,0.5)', color: '#fff' } : { color: 'rgba(255,255,255,0.4)' }}
          >
            {aba === 'pendente' ? `A pagar (${pendentes.length})` : `Pagas (${pagas.length})`}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="px-5 flex flex-col gap-3 mt-2">
        {carregando ? (
          [...Array(3)].map((_, i) => <div key={i} className="glass rounded-2xl h-20 animate-pulse" />)
        ) : listaAtiva.length === 0 ? (
          <div className="glass rounded-2xl px-5 py-8 text-center mt-4">
            <p className="text-white/30 text-sm">
              {abaAtiva === 'pendente' ? 'Nenhuma parcela pendente' : 'Nenhuma parcela paga ainda'}
            </p>
          </div>
        ) : (
          listaAtiva.map((p) => (
            <ParcelaCard
              key={p.parcela_id}
              parcela={p}
              onPagar={() => setParcelaAtiva(p)}
            />
          ))
        )}
      </div>

      {/* Modal de pagamento */}
      {parcelaAtiva && (
        <ModalPagamento
          parcela={parcelaAtiva}
          nomeUsuario={sessao.nome}
          onFechar={() => setParcelaAtiva(null)}
          onPago={() => {
            setParcelas((prev) =>
              prev.map((p) =>
                p.parcela_id === parcelaAtiva.parcela_id
                  ? { ...p, status: 'paga', pago_em: new Date().toISOString() }
                  : p
              )
            )
            setParcelaAtiva(null)
          }}
        />
      )}

      <NavBar perfil={sessao.perfil} />
    </div>
  )
}

function ParcelaCard({ parcela, onPagar }: { parcela: ParcComEvento; onPagar: () => void }) {
  const status = statusVencimento(parcela.vencimento)
  const dias   = diasParaVencimento(parcela.vencimento)
  const pago   = parcela.status === 'paga'

  const corStatus = pago ? 'emerald' : status === 'vencida' ? 'red' : status === 'vencendo' ? 'red' : status === 'alerta' ? 'orange' : 'white'
  const labelStatus = pago ? 'Pago' : status === 'vencida' ? `Venceu há ${Math.abs(dias)} dia${Math.abs(dias) !== 1 ? 's' : ''}` : status === 'vencendo' ? 'Vence hoje!' : status === 'alerta' ? `Vence em ${dias} dias` : `Vence em ${dias} dias`

  return (
    <div className={`glass rounded-2xl px-4 py-4 transition-all ${!pago ? 'active:scale-[.98]' : ''}`}
      style={{ borderColor: status === 'vencida' || status === 'vencendo' ? 'rgba(239,68,68,0.3)' : status === 'alerta' ? 'rgba(249,115,22,0.3)' : undefined }}
      onClick={pago ? undefined : onPagar}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white/40 truncate">{parcela.evento_nome}</p>
          <p className="font-bold text-white text-base mt-0.5">Parcela {parcela.numero}</p>
          <p className="text-xs mt-1" style={{ color: pago ? '#34d399' : status === 'vencida' || status === 'vencendo' ? '#f87171' : status === 'alerta' ? '#fb923c' : 'rgba(255,255,255,0.4)' }}>
            {labelStatus}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-extrabold text-brand-gold">{formatarMoeda(parcela.valor)}</p>
          <p className="text-xs text-white/30 mt-0.5">{formatarData(parcela.vencimento)}</p>
          {!pago && (
            <span className="text-xs text-brand-sky font-semibold mt-1 block">Pagar →</span>
          )}
          {pago && (
            <span className="text-xs text-emerald-400 font-semibold mt-1 block">✓ Pago</span>
          )}
        </div>
      </div>
    </div>
  )
}

function ModalPagamento({ parcela, nomeUsuario, onFechar, onPago }: {
  parcela: ParcComEvento
  nomeUsuario: string
  onFechar: () => void
  onPago: () => void
}) {
  const [etapa, setEtapa] = useState<'qr' | 'comprovante'>('qr')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleEnviarComprovante() {
    if (!arquivo) { setErro('Selecione o comprovante antes de confirmar'); return }
    setEnviando(true)
    setErro('')
    try {
      const reader = new FileReader()
      reader.readAsDataURL(arquivo)
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1]
        await rpc('enviarComprovante', {
          parcela_id: parcela.parcela_id,
          arquivo_base64: base64,
          arquivo_tipo: arquivo.type,
          arquivo_nome: arquivo.name,
        })
        onPago()
      }
    } catch (e) {
      setErro((e as Error).message || 'Erro ao enviar. Tente novamente.')
      setEnviando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(10,22,40,0.8)', backdropFilter: 'blur(8px)' }}>
      <div className="bg-brand-navy rounded-t-3xl max-h-[92vh] overflow-y-auto" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="px-5 pb-8">
          {/* Abas QR / Comprovante */}
          <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6">
            {(['qr', 'comprovante'] as const).map((e) => (
              <button
                key={e}
                onClick={() => setEtapa(e)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={etapa === e ? { background: 'rgba(37,99,235,0.5)', color: '#fff' } : { color: 'rgba(255,255,255,0.4)' }}
              >
                {e === 'qr' ? 'QR Code Pix' : 'Comprovante'}
              </button>
            ))}
          </div>

          {etapa === 'qr' && (
            <div className="flex flex-col gap-5">
              <QRCodePix
                chavePix={parcela.chave_pix}
                valor={parcela.valor}
                nomeRecebedor="IGREJA ACAMP DEEP"
                descricao={`Parcela ${parcela.numero} — ${parcela.evento_nome}`}
              />
              <button className="btn-accent" onClick={() => setEtapa('comprovante')}>
                Já paguei — enviar comprovante
              </button>
              <button className="btn-ghost text-sm" onClick={onFechar}>Fechar</button>
            </div>
          )}

          {etapa === 'comprovante' && (
            <div className="flex flex-col gap-4">
              <div className="text-center mb-2">
                <p className="text-sm text-white/60">Após realizar o pagamento, envie o comprovante para confirmar a parcela</p>
              </div>

              {/* Área de upload */}
              <div
                className="glass rounded-2xl px-4 py-8 flex flex-col items-center gap-3 text-center cursor-pointer active:scale-[.98] transition-transform"
                onClick={() => inputRef.current?.click()}
                style={{ borderStyle: arquivo ? 'solid' : 'dashed', borderColor: arquivo ? 'rgba(56,189,248,0.5)' : 'rgba(255,255,255,0.15)' }}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) { setArquivo(f); setErro('') }
                  }}
                />
                {arquivo ? (
                  <>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(56,189,248,0.2)' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round">
                        <path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/>
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-brand-sky">{arquivo.name}</p>
                    <p className="text-xs text-white/30">Toque para trocar</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-white/60">Toque para selecionar</p>
                    <p className="text-xs text-white/30">Foto ou PDF do comprovante</p>
                  </>
                )}
              </div>

              {erro && <p className="text-xs text-red-400 text-center">{erro}</p>}

              <button
                className="btn-accent"
                onClick={handleEnviarComprovante}
                disabled={enviando || !arquivo}
                style={{ opacity: !arquivo ? 0.5 : 1 }}
              >
                {enviando ? 'Enviando...' : 'Confirmar pagamento'}
              </button>

              <button className="btn-ghost text-sm" onClick={() => setEtapa('qr')}>
                Voltar ao QR Code
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
