'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSessao } from '@/hooks/useSessao'
import { rpc, formatarData, formatarMoeda, calcularIdade, gerarParcelas } from '@/lib/api'
import type { Evento } from '@/types'

export default function EventoDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { sessao } = useSessao()
  const [evento, setEvento] = useState<Evento | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [modoInscricao, setModoInscricao] = useState(false)

  useEffect(() => {
    rpc<{ data: Evento }>('buscarEvento', { evento_id: id }).then((r) => {
      setEvento(r.data)
    }).finally(() => setCarregando(false))
  }, [id])

  if (carregando || !evento || !sessao) return <LoadingTela />

  const agora = new Date()
  const abertura = new Date(evento.inscricao_abertura + 'T00:00:00')
  const fechamento = new Date(evento.inscricao_fechamento + 'T00:00:00')
  const inscricoesAbertas = agora >= abertura && agora <= fechamento

  if (modoInscricao) {
    return <FormInscricao evento={evento} sessao={sessao} onVoltar={() => setModoInscricao(false)} />
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(160deg, #0A1628, #0d1f3c)' }}>
      {/* Header com voltar */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <button onClick={() => router.back()} className="w-10 h-10 glass rounded-xl flex items-center justify-center active:scale-90 transition-transform">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <h1 className="text-lg font-bold text-white flex-1 truncate">{evento.nome}</h1>
      </div>

      <div className="px-5 flex flex-col gap-5">
        {/* Status card */}
        <div className="glass rounded-3xl px-5 py-5 flex flex-col gap-4 animate-scale-in">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              inscricoesAbertas ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/30'
            }`}>
              {inscricoesAbertas ? 'Inscrições abertas' : 'Inscrições fechadas'}
            </span>
            <span className="text-xl font-extrabold text-brand-gold">{formatarMoeda(evento.valor_total)}</span>
          </div>

          <div className="flex flex-col gap-2">
            <InfoRow icon="📅" label="Data do evento" valor={formatarData(evento.data_evento)} />
            <InfoRow icon="🗓️" label="Inscrições" valor={`${formatarData(evento.inscricao_abertura)} – ${formatarData(evento.inscricao_fechamento)}`} />
            <InfoRow icon="👶" label="Autorização dos pais" valor={`Menor de ${evento.idade_minima_autorizacao} anos`} />
          </div>
        </div>

        {/* Descrição */}
        {evento.descricao && (
          <div className="glass rounded-2xl px-4 py-4 animate-slide-up delay-100">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Sobre o evento</h3>
            <p className="text-sm text-white/80 leading-relaxed">{evento.descricao}</p>
          </div>
        )}

        {/* Como funciona o pagamento */}
        <div className="glass rounded-2xl px-4 py-4 animate-slide-up delay-200">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Como funciona o pagamento</h3>
          <div className="flex flex-col gap-2">
            <Step n="1" texto="Você escolhe até quando consegue pagar" />
            <Step n="2" texto="O app divide o valor em parcelas mensais" />
            <Step n="3" texto="Cada parcela tem um QR Code Pix próprio" />
            <Step n="4" texto="Após pagar, você envia o comprovante" />
          </div>
        </div>

        {/* Botão de inscrição */}
        {inscricoesAbertas ? (
          <button className="btn-accent animate-slide-up delay-300" onClick={() => setModoInscricao(true)}>
            Me inscrever agora
          </button>
        ) : (
          <div className="glass rounded-2xl px-5 py-4 text-center animate-slide-up delay-300">
            <p className="text-sm text-white/40">
              {agora < abertura
                ? `Inscrições abrem em ${formatarData(evento.inscricao_abertura)}`
                : 'Período de inscrições encerrado'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ icon, label, valor }: { icon: string; label: string; valor: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-base w-5 text-center shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/40">{label}</p>
        <p className="text-sm font-medium text-white">{valor}</p>
      </div>
    </div>
  )
}

function Step({ n, texto }: { n: string; texto: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'rgba(37,99,235,0.3)', color: '#38BDF8' }}>{n}</div>
      <p className="text-sm text-white/60 pt-0.5">{texto}</p>
    </div>
  )
}

// ────────────────────────────────────────────────────────
// Formulário de Inscrição
// ────────────────────────────────────────────────────────
interface Sessao { uid: string; nome: string; whatsapp: string; perfil: string }

function FormInscricao({ evento, sessao, onVoltar }: { evento: Evento; sessao: Sessao; onVoltar: () => void }) {
  const router = useRouter()
  const [dataNasc, setDataNasc] = useState('')
  const [dataVenc, setDataVenc] = useState('')
  const [nomeResp, setNomeResp] = useState('')
  const [whatsResp, setWhatsResp] = useState('')
  const [erros, setErros] = useState<Record<string, string>>({})
  const [carregando, setCarregando] = useState(false)
  const [preview, setPreview] = useState<ReturnType<typeof gerarParcelas>>([])

  const hoje = new Date().toISOString().split('T')[0]
  const idade = dataNasc ? calcularIdade(dataNasc) : null
  const precisaResponsavel = idade !== null && idade < evento.idade_minima_autorizacao

  useEffect(() => {
    if (dataNasc && dataVenc && evento.valor_total) {
      const parcelas = gerarParcelas(evento.valor_total, hoje, dataVenc)
      setPreview(parcelas)
    } else {
      setPreview([])
    }
  }, [dataNasc, dataVenc, evento.valor_total, hoje])

  function validar(): boolean {
    const e: Record<string, string> = {}
    if (!dataNasc) e.dataNasc = 'Informe sua data de nascimento'
    if (!dataVenc) e.dataVenc = 'Informe até quando consegue pagar'
    if (dataVenc && dataVenc <= hoje) e.dataVenc = 'Escolha uma data futura'
    if (precisaResponsavel && !nomeResp.trim()) e.nomeResp = 'Nome do responsável obrigatório'
    if (precisaResponsavel && whatsResp.replace(/\D/g, '').length < 10) e.whatsResp = 'WhatsApp do responsável inválido'
    setErros(e)
    return Object.keys(e).length === 0
  }

  async function handleInscrever() {
    if (!validar()) return
    setCarregando(true)
    try {
      await rpc('inscrever', {
        evento_id: evento.evento_id,
        data_nascimento: dataNasc,
        data_vencimento_escolhida: dataVenc,
        nome_responsavel: precisaResponsavel ? nomeResp : undefined,
        whatsapp_responsavel: precisaResponsavel ? whatsResp.replace(/\D/g, '') : undefined,
      })
      router.push('/parcelas')
    } catch (e) {
      setErros({ geral: (e as Error).message || 'Erro ao inscrever' })
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(160deg, #0A1628, #0d1f3c)' }}>
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <button onClick={onVoltar} className="w-10 h-10 glass rounded-xl flex items-center justify-center active:scale-90">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <h1 className="text-lg font-bold text-white">Inscrição</h1>
      </div>

      <div className="px-5 flex flex-col gap-5">

        {/* Dados pessoais */}
        <div className="glass rounded-2xl px-4 py-4 flex flex-col gap-4 animate-scale-in">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Seus dados</h3>

          <div className="glass rounded-xl px-4 py-3">
            <p className="text-xs text-white/40">Nome</p>
            <p className="text-sm font-medium text-white">{sessao.nome}</p>
          </div>

          <div>
            <label className="input-label">Data de nascimento</label>
            <input
              type="date"
              className="input-field"
              value={dataNasc}
              max={hoje}
              onChange={(e) => { setDataNasc(e.target.value); setErros((prev) => ({ ...prev, dataNasc: '' })) }}
            />
            {erros.dataNasc && <p className="text-xs text-red-400 mt-1">{erros.dataNasc}</p>}
            {idade !== null && (
              <p className="text-xs text-white/40 mt-1">
                {idade} anos — {precisaResponsavel ? '⚠️ Necessita autorização do responsável' : '✓ Sem restrição de idade'}
              </p>
            )}
          </div>
        </div>

        {/* Responsável (condicional) */}
        {precisaResponsavel && (
          <div className="glass rounded-2xl px-4 py-4 flex flex-col gap-4 animate-scale-in" style={{ borderColor: 'rgba(251,191,36,0.3)' }}>
            <div>
              <h3 className="text-xs font-semibold text-brand-gold uppercase tracking-wider">Responsável</h3>
              <p className="text-xs text-white/40 mt-1">Você tem {idade} anos — precisamos dos dados do seu responsável</p>
            </div>
            <div>
              <label className="input-label">Nome do responsável</label>
              <input className="input-field" placeholder="Ex: Maria Silva" value={nomeResp} onChange={(e) => { setNomeResp(e.target.value); setErros((p) => ({ ...p, nomeResp: '' })) }} />
              {erros.nomeResp && <p className="text-xs text-red-400 mt-1">{erros.nomeResp}</p>}
            </div>
            <div>
              <label className="input-label">WhatsApp do responsável</label>
              <input className="input-field" placeholder="(11) 99999-9999" inputMode="tel" value={whatsResp} onChange={(e) => { setWhatsResp(e.target.value); setErros((p) => ({ ...p, whatsResp: '' })) }} />
              {erros.whatsResp && <p className="text-xs text-red-400 mt-1">{erros.whatsResp}</p>}
            </div>
          </div>
        )}

        {/* Parcelamento */}
        <div className="glass rounded-2xl px-4 py-4 flex flex-col gap-4 animate-slide-up delay-100">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Parcelamento</h3>
          <div>
            <label className="input-label">Até quando você consegue pagar?</label>
            <input
              type="date"
              className="input-field"
              value={dataVenc}
              min={new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]}
              onChange={(e) => { setDataVenc(e.target.value); setErros((p) => ({ ...p, dataVenc: '' })) }}
            />
            {erros.dataVenc && <p className="text-xs text-red-400 mt-1">{erros.dataVenc}</p>}
            <p className="text-xs text-white/30 mt-1">
              O app divide {formatarMoeda(evento.valor_total)} em parcelas mensais até essa data
            </p>
          </div>

          {preview.length > 0 && (
            <div className="flex flex-col gap-2 pt-1">
              <p className="text-xs text-white/50">{preview.length} parcela{preview.length > 1 ? 's' : ''} de {formatarMoeda(preview[0].valor)}</p>
              {preview.map((p) => (
                <div key={p.numero} className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Parcela {p.numero}</span>
                  <span className="text-white font-medium">{formatarMoeda(p.valor)} — {new Date(p.vencimento + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {erros.geral && (
          <div className="glass rounded-xl px-4 py-3 border border-red-500/30">
            <p className="text-sm text-red-400">{erros.geral}</p>
          </div>
        )}

        <button className="btn-accent" onClick={handleInscrever} disabled={carregando}>
          {carregando ? 'Confirmando inscrição...' : `Confirmar inscrição — ${formatarMoeda(evento.valor_total)}`}
        </button>
      </div>
    </div>
  )
}

function LoadingTela() {
  return <div className="min-h-screen animate-pulse" style={{ background: '#0A1628' }} />
}
