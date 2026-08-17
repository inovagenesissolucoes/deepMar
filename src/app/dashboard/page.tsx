'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NavBar from '@/components/layout/NavBar'
import { useSessao } from '@/hooks/useSessao'
import { rpc, formatarMoeda, formatarData } from '@/lib/api'
import type { Evento, DashboardLider } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const { sessao, carregando: cSessao } = useSessao()
  const [eventos, setEventos] = useState<Evento[]>([])
  const [eventoSel, setEventoSel] = useState<string>('')
  const [dash, setDash] = useState<DashboardLider | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    if (!cSessao && !sessao) router.replace('/cadastro')
    if (!cSessao && sessao && sessao.perfil === 'jovem') router.replace('/home')
  }, [sessao, cSessao, router])

  useEffect(() => {
    if (!sessao || sessao.perfil === 'jovem') return
    rpc<{ data: Evento[] }>('listarEventos', {}).then((r) => {
      const evs = r.data || []
      setEventos(evs)
      if (evs.length > 0) setEventoSel(evs[0].evento_id)
    })
  }, [sessao])

  useEffect(() => {
    if (!eventoSel) return
    setCarregando(true)
    setDash(null)
    rpc<{ data: DashboardLider }>('dashboardEvento', { evento_id: eventoSel })
      .then((r) => setDash(r.data))
      .finally(() => setCarregando(false))
  }, [eventoSel])

  if (cSessao || !sessao || sessao.perfil === 'jovem') return <div className="min-h-screen" style={{ background: '#0A1628' }} />

  const inscritosFiltrados = dash?.inscritos.filter((i) =>
    !busca || i.nome_usuario.toLowerCase().includes(busca.toLowerCase())
  ) || []

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg, #0A1628, #0d1f3c)' }}>

      {/* Header */}
      <div className="px-5 pt-14 pb-2 flex items-center justify-between">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest font-medium">Painel</p>
          <h1 className="text-2xl font-extrabold text-white">Dashboard</h1>
        </div>
        <Link href="/dashboard/criar-evento" className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          style={{ background: 'rgba(249,115,22,0.25)', color: '#F97316', border: '1px solid rgba(249,115,22,0.2)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Novo evento
        </Link>
      </div>

      {/* Seletor de evento */}
      {eventos.length > 0 && (
        <div className="px-5 mt-4">
          <select
            className="input-field text-sm"
            value={eventoSel}
            onChange={(e) => setEventoSel(e.target.value)}
            style={{ appearance: 'none' }}
          >
            {eventos.map((e) => (
              <option key={e.evento_id} value={e.evento_id} style={{ background: '#0d1f3c' }}>
                {e.nome} — {formatarData(e.data_evento)}
              </option>
            ))}
          </select>
        </div>
      )}

      {carregando && (
        <div className="px-5 mt-4 flex flex-col gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="glass rounded-2xl h-16 animate-pulse" />)}
        </div>
      )}

      {dash && !carregando && (
        <div className="px-5 mt-4 flex flex-col gap-4">

          {/* Cards de resumo */}
          <div className="grid grid-cols-3 gap-3 animate-scale-in">
            <ResumoCard label="Inscritos" valor={String(dash.total_inscritos)} cor="#38BDF8" />
            <ResumoCard label="Arrecadado" valor={`R$ ${(dash.valor_arrecadado / 100).toFixed(0)}`} cor="#34d399" />
            <ResumoCard label="Pendente" valor={`R$ ${(dash.valor_pendente / 100).toFixed(0)}`} cor="#FBBF24" />
          </div>

          {/* Faixa etária */}
          <div className="glass rounded-2xl px-4 py-4 animate-slide-up delay-100">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Faixa etária</h3>
            <div className="flex flex-col gap-2">
              <FaixaBar label="Adulto (18+)" valor={dash.faixas.adulto} total={dash.total_inscritos} cor="#38BDF8" />
              <FaixaBar label="Adolescente (13–17)" valor={dash.faixas.adolescente} total={dash.total_inscritos} cor="#FBBF24" />
              <FaixaBar label="Criança (até 12)" valor={dash.faixas.crianca} total={dash.total_inscritos} cor="#F97316" />
            </div>
          </div>

          {/* Lista de inscritos */}
          <div className="animate-slide-up delay-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Inscritos</h3>
              <span className="text-xs text-white/30">{inscritosFiltrados.length} de {dash.total_inscritos}</span>
            </div>

            <div className="glass rounded-xl px-3 py-2 mb-3 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
                placeholder="Buscar por nome..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              {inscritosFiltrados.map((inscrito) => (
                <InscritoCard key={inscrito.inscricao_id} inscrito={inscrito} />
              ))}
              {inscritosFiltrados.length === 0 && (
                <div className="glass rounded-2xl px-5 py-6 text-center">
                  <p className="text-sm text-white/30">Nenhum inscrito encontrado</p>
                </div>
              )}
            </div>
          </div>

          {/* Galeria */}
          <Link href="/dashboard/galeria" className="glass rounded-2xl px-4 py-4 flex items-center justify-between active:scale-[.98] transition-transform animate-slide-up delay-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.2)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Galeria de mídia</p>
                <p className="text-xs text-white/40">Fotos e vídeos dos eventos</p>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </Link>

          {/* Config */}
          <Link href="/dashboard/configuracoes" className="glass rounded-2xl px-4 py-4 flex items-center justify-between active:scale-[.98] transition-transform animate-slide-up delay-400">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.2)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Configurações</p>
                <p className="text-xs text-white/40">Pix, admins, notificações</p>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </Link>

        </div>
      )}

      <NavBar perfil={sessao.perfil} />
    </div>
  )
}

function ResumoCard({ label, valor, cor }: { label: string; valor: string; cor: string }) {
  return (
    <div className="glass rounded-2xl px-3 py-4 text-center">
      <p style={{ color: cor }} className="text-lg font-extrabold truncate">{valor}</p>
      <p className="text-xs text-white/40 mt-1">{label}</p>
    </div>
  )
}

function FaixaBar({ label, valor, total, cor }: { label: string; valor: number; total: number; cor: string }) {
  const pct = total > 0 ? (valor / total) * 100 : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-white/60">{label}</span>
        <span className="text-xs font-semibold text-white">{valor}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: cor }} />
      </div>
    </div>
  )
}

function InscritoCard({ inscrito }: { inscrito: DashboardLider['inscritos'][0] }) {
  const pct = inscrito.total_parcelas > 0 ? (inscrito.parcelas_pagas / inscrito.total_parcelas) * 100 : 0

  function abrirWhats() {
    const num = inscrito.whatsapp.replace(/\D/g, '')
    window.open(`https://wa.me/55${num}?text=Olá ${inscrito.nome_usuario.split(' ')[0]}, tudo bem?`, '_blank')
  }

  return (
    <div className="glass rounded-2xl px-4 py-3">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">{inscrito.nome_usuario}</p>
          <p className="text-xs text-white/40">{inscrito.parcelas_pagas}/{inscrito.total_parcelas} parcelas — {formatarMoeda(inscrito.valor_pendente)} pendente</p>
        </div>
        <button
          onClick={abrirWhats}
          className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: 'rgba(34,197,94,0.2)' }}
          title={`WhatsApp: ${inscrito.whatsapp}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#22c55e">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </button>
      </div>
      {/* Barra de progresso */}
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct === 100 ? '#34d399' : pct > 50 ? '#38BDF8' : '#FBBF24' }} />
      </div>
    </div>
  )
}
