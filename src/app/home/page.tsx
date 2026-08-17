'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NavBar from '@/components/layout/NavBar'
import Countdown from '@/components/ui/Countdown'
import { useSessao } from '@/hooks/useSessao'
import { usePush } from '@/hooks/usePush'
import { rpc, formatarData } from '@/lib/api'
import type { Evento, Midia } from '@/types'

export default function HomePage() {
  const router = useRouter()
  const { sessao, carregando: carregandoSessao } = useSessao()
  const { ativarPush } = usePush()
  const [eventos, setEventos] = useState<Evento[]>([])
  const [midias, setMidias] = useState<Midia[]>([])
  const [carregando, setCarregando] = useState(true)
  const [midiaAtiva, setMidiaAtiva] = useState(0)
  const [pushBanner, setPushBanner] = useState(false)

  useEffect(() => {
    if (!carregandoSessao && !sessao) {
      router.replace('/cadastro')
    }
  }, [sessao, carregandoSessao, router])

  useEffect(() => {
    if (!sessao) return
    Promise.all([
      rpc<{ data: Evento[] }>('listarEventos', { soAtivos: true }),
      rpc<{ data: Midia[] }>('listarGaleria'),
    ]).then(([ev, mi]) => {
      setEventos(ev.data || [])
      setMidias(mi.data || [])
    }).finally(() => setCarregando(false))

    // Verifica push
    if ('Notification' in window && Notification.permission === 'default') {
      setPushBanner(true)
    }
  }, [sessao])

  // Auto-rotação da galeria
  useEffect(() => {
    if (midias.length <= 1) return
    const t = setInterval(() => setMidiaAtiva((a) => (a + 1) % midias.length), 4000)
    return () => clearInterval(t)
  }, [midias.length])

  async function handlePush() {
    await ativarPush()
    setPushBanner(false)
  }

  if (carregandoSessao || !sessao) return <LoadingSkeleton />

  const proximoEvento = eventos.find((e) => e.status === 'ativo')
  const isLider = sessao.perfil !== 'jovem'

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg, #0A1628 0%, #0d1f3c 100%)' }}>

      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex items-center justify-between animate-fade-in">
        <div>
          <p className="text-xs text-white/40 font-medium uppercase tracking-widest">Olá 👋</p>
          <h2 className="text-xl font-bold text-white truncate max-w-[200px]">
            {sessao.nome.split(' ')[0]}
          </h2>
        </div>
        {isLider && (
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: 'rgba(37,99,235,0.25)', color: '#38BDF8', border: '1px solid rgba(56,189,248,0.2)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18M7 16l4-5 4 3 4-6"/>
            </svg>
            Painel
          </Link>
        )}
      </div>

      {/* Banner push */}
      {pushBanner && (
        <div className="mx-5 mb-4 animate-slide-up">
          <div className="glass rounded-2xl px-4 py-3 flex items-center justify-between gap-3" style={{ borderColor: 'rgba(56,189,248,0.2)' }}>
            <div>
              <p className="text-xs font-semibold text-white">Ativar notificações</p>
              <p className="text-xs text-white/40 mt-0.5">Avise-nos quando sua parcela vencer</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setPushBanner(false)} className="text-xs text-white/30 px-2">Depois</button>
              <button onClick={handlePush} className="text-xs font-semibold text-brand-sky px-3 py-1.5 rounded-lg" style={{ background: 'rgba(37,99,235,0.25)' }}>
                Ativar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-5 flex flex-col gap-6">

        {/* Countdown do próximo evento */}
        {proximoEvento && (
          <div className="animate-slide-up delay-100">
            <Countdown dataEvento={proximoEvento.data_evento} nomeEvento={proximoEvento.nome} />
          </div>
        )}

        {/* Galeria */}
        {midias.length > 0 && (
          <div className="animate-slide-up delay-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
                Momentos
              </h3>
              <span className="text-xs text-white/30">{midiaAtiva + 1}/{midias.length}</span>
            </div>
            <div className="relative rounded-3xl overflow-hidden" style={{ height: 220 }}>
              {midias.map((m, i) => (
                <div
                  key={m.midia_id}
                  className="absolute inset-0 transition-opacity duration-700"
                  style={{ opacity: i === midiaAtiva ? 1 : 0 }}
                >
                  {m.tipo === 'video' ? (
                    <video src={m.url} className="w-full h-full object-cover" muted playsInline loop autoPlay />
                  ) : (
                    <img src={m.url} alt={m.legenda || ''} className="w-full h-full object-cover" />
                  )}
                  {m.legenda && (
                    <div className="absolute bottom-0 left-0 right-0 p-4" style={{ background: 'linear-gradient(transparent, rgba(10,22,40,0.9))' }}>
                      <p className="text-sm text-white font-medium">{m.legenda}</p>
                    </div>
                  )}
                </div>
              ))}
              {/* Indicadores */}
              <div className="absolute bottom-3 right-3 flex gap-1">
                {midias.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setMidiaAtiva(i)}
                    className="w-1.5 h-1.5 rounded-full transition-all"
                    style={{ background: i === midiaAtiva ? '#38BDF8' : 'rgba(255,255,255,0.3)' }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Eventos disponíveis */}
        <div className="animate-slide-up delay-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
              Eventos
            </h3>
            <Link href="/eventos" className="text-xs text-brand-sky font-medium">
              Ver todos
            </Link>
          </div>

          {carregando ? (
            <div className="flex flex-col gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="glass rounded-2xl h-24 animate-pulse" />
              ))}
            </div>
          ) : eventos.length === 0 ? (
            <div className="glass rounded-2xl px-5 py-8 text-center">
              <p className="text-white/30 text-sm">Nenhum evento ativo no momento</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {eventos.slice(0, 3).map((evento) => (
                <EventoCard key={evento.evento_id} evento={evento} />
              ))}
            </div>
          )}
        </div>

      </div>

      <NavBar perfil={sessao.perfil} />
    </div>
  )
}

function EventoCard({ evento }: { evento: Evento }) {
  const agora = new Date()
  const abertura = new Date(evento.inscricao_abertura + 'T00:00:00')
  const fechamento = new Date(evento.inscricao_fechamento + 'T00:00:00')
  const inscricoesAbertas = agora >= abertura && agora <= fechamento

  return (
    <Link href={`/eventos/${evento.evento_id}`}>
      <div className="glass rounded-2xl px-4 py-4 active:scale-[.98] transition-transform">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-base leading-tight truncate">{evento.nome}</p>
            <p className="text-sm text-white/40 mt-1">{formatarData(evento.data_evento)}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-lg font-extrabold text-brand-gold">
              R$ {evento.valor_total.toLocaleString('pt-BR')}
            </p>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                inscricoesAbertas ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/30'
              }`}
            >
              {inscricoesAbertas ? 'Inscrições abertas' : 'Em breve'}
            </span>
          </div>
        </div>
        {evento.descricao && (
          <p className="text-xs text-white/30 mt-2 line-clamp-2">{evento.descricao}</p>
        )}
      </div>
    </Link>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen px-5 pt-14 animate-pulse" style={{ background: '#0A1628' }}>
      <div className="h-6 w-32 bg-white/10 rounded-lg mb-8" />
      <div className="h-36 bg-white/5 rounded-3xl mb-6" />
      <div className="h-56 bg-white/5 rounded-3xl mb-6" />
      <div className="h-20 bg-white/5 rounded-2xl mb-3" />
      <div className="h-20 bg-white/5 rounded-2xl" />
    </div>
  )
}
