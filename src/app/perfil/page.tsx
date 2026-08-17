'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NavBar from '@/components/layout/NavBar'
import { useSessao } from '@/hooks/useSessao'
import { usePush } from '@/hooks/usePush'
import { rpc } from '@/lib/api'

export default function PerfilPage() {
  const router = useRouter()
  const { sessao, setSessao } = useSessao()
  const { ativo: pushAtivo, ativarPush } = usePush()
  const [editando, setEditando] = useState(false)
  const [nome, setNome] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  if (!sessao) return <div className="min-h-screen" style={{ background: '#0A1628' }} />

  function iniciarEdicao() {
    setNome(sessao!.nome)
    setWhatsapp(sessao!.whatsapp)
    setEditando(true)
    setErro('')
  }

  async function salvar() {
    setSalvando(true)
    setErro('')
    try {
      await rpc('editarPerfil', {
        nome: nome.trim(),
        whatsapp: whatsapp.replace(/\D/g, ''),
      })
      setSessao({ ...sessao!, nome: nome.trim(), whatsapp: whatsapp.replace(/\D/g, '') })
      setEditando(false)
    } catch (e) {
      setErro((e as Error).message || 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  async function sair() {
    await fetch('/api/logout', { method: 'POST' })
    setSessao(null)
    router.replace('/cadastro')
  }

  const labelPerfil: Record<string, string> = {
    jovem: 'Participante',
    lider: 'Líder',
    admin: 'Administrador',
  }
  const corPerfil: Record<string, string> = {
    jovem: 'rgba(56,189,248,0.2)',
    lider: 'rgba(249,115,22,0.2)',
    admin: 'rgba(168,85,247,0.2)',
  }
  const texCor: Record<string, string> = {
    jovem: '#38BDF8',
    lider: '#F97316',
    admin: '#c084fc',
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg, #0A1628, #0d1f3c)' }}>
      <div className="px-5 pt-14 pb-4">
        <p className="text-xs text-white/40 uppercase tracking-widest font-medium">Minha conta</p>
        <h1 className="text-2xl font-extrabold text-white">Perfil</h1>
      </div>

      <div className="px-5 flex flex-col gap-4">

        {/* Avatar + nome */}
        <div className="glass rounded-3xl px-5 py-6 flex flex-col items-center gap-3 text-center animate-scale-in">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-extrabold text-white"
            style={{ background: 'linear-gradient(135deg, #1A2F5E, #2563EB)' }}
          >
            {sessao.nome.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xl font-bold text-white">{sessao.nome}</p>
            <p className="text-sm text-white/40 mt-0.5">+55 {sessao.whatsapp}</p>
          </div>
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{ background: corPerfil[sessao.perfil], color: texCor[sessao.perfil] }}
          >
            {labelPerfil[sessao.perfil]}
          </span>
        </div>

        {/* Editar */}
        {!editando ? (
          <button className="btn-ghost animate-slide-up delay-100 text-sm" onClick={iniciarEdicao}>
            Editar dados
          </button>
        ) : (
          <div className="glass rounded-2xl px-4 py-5 flex flex-col gap-4 animate-scale-in">
            <h3 className="text-sm font-semibold text-white/70">Editar dados</h3>
            <div>
              <label className="input-label">Nome completo</label>
              <input className="input-field" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div>
              <label className="input-label">WhatsApp</label>
              <input className="input-field" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} inputMode="tel" />
              <p className="text-xs text-white/30 mt-1">Se esse número já estiver em uso, não será possível trocar.</p>
            </div>
            {erro && <p className="text-xs text-red-400">{erro}</p>}
            <div className="flex gap-3">
              <button className="btn-ghost flex-1 text-sm" onClick={() => setEditando(false)}>Cancelar</button>
              <button className="btn-primary flex-1 text-sm" onClick={salvar} disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        )}

        {/* Notificações */}
        <div className="glass rounded-2xl px-4 py-4 flex items-center justify-between animate-slide-up delay-200">
          <div>
            <p className="text-sm font-semibold text-white">Notificações</p>
            <p className="text-xs text-white/40 mt-0.5">Avisos de vencimento de parcelas</p>
          </div>
          {pushAtivo ? (
            <span className="text-xs font-semibold text-emerald-400 px-3 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.15)' }}>Ativo</span>
          ) : (
            <button
              onClick={ativarPush}
              className="text-xs font-semibold text-brand-sky px-3 py-1.5 rounded-xl active:scale-95 transition-transform"
              style={{ background: 'rgba(37,99,235,0.25)' }}
            >
              Ativar
            </button>
          )}
        </div>

        {/* Sair */}
        <button
          className="animate-slide-up delay-300 w-full py-4 rounded-2xl text-sm font-semibold transition-all active:scale-95 border border-red-500/30 text-red-400"
          style={{ background: 'rgba(239,68,68,0.08)' }}
          onClick={sair}
        >
          Sair do app
        </button>

      </div>

      <NavBar perfil={sessao.perfil} />
    </div>
  )
}
