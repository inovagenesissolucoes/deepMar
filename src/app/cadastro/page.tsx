'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { rpc } from '@/lib/api'

function validarNome(nome: string): string | null {
  if (!nome.trim()) return 'Nome é obrigatório'
  const palavras = nome.trim().split(/\s+/).filter(Boolean)
  if (palavras.length < 2) return 'Digite nome e sobrenome'
  if (!/^[A-Za-zÀ-ú\s'\-]+$/.test(nome)) return 'Use apenas letras'
  return null
}

function validarWhats(whats: string): string | null {
  const nums = whats.replace(/\D/g, '')
  if (nums.length < 10 || nums.length > 11) return 'Número inválido (com DDD)'
  return null
}

function capitalizar(nome: string): string {
  return nome
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default function CadastroPage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [erroNome, setErroNome] = useState('')
  const [erroWhats, setErroWhats] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erroGeral, setErroGeral] = useState('')

  function formatarWhats(v: string) {
    const nums = v.replace(/\D/g, '').slice(0, 11)
    if (nums.length <= 2) return nums
    if (nums.length <= 6) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`
    if (nums.length <= 10) return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`
  }

  async function handleSubmit() {
    const errN = validarNome(nome)
    const errW = validarWhats(whatsapp)
    setErroNome(errN || '')
    setErroWhats(errW || '')
    if (errN || errW) return

    setCarregando(true)
    setErroGeral('')
    try {
      await rpc('cadastrar', {
        nome: capitalizar(nome),
        whatsapp: whatsapp.replace(/\D/g, ''),
      })
      router.replace('/home')
    } catch (e) {
      setErroGeral((e as Error).message || 'Erro ao cadastrar. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #0A1628 0%, #0d1f3c 100%)' }}
    >
      {/* Header visual */}
      <div className="flex-1 flex flex-col justify-end pb-8 px-6 pt-20">
        <div className="animate-fade-in">
          {/* Ícone */}
          <div className="mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: 'linear-gradient(135deg, #1A2F5E, #2563EB)' }}
            >
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                <path d="M17 4L30 26H4L17 4Z" fill="white" fillOpacity="0.15"/>
                <path d="M17 4L30 26H4L17 4Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M11 26L17 16L23 26" stroke="#38BDF8" strokeWidth="1.5" strokeLinejoin="round"/>
                <circle cx="17" cy="12" r="2" fill="#FBBF24"/>
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-white leading-tight">
              Bem-vindo ao<br />
              <span style={{ color: '#38BDF8' }}>Acamp Deep</span>
            </h1>
            <p className="mt-3 text-white/50 text-base leading-relaxed">
              Conta pra gente quem você é para acessar os eventos.
            </p>
          </div>

          {/* Formulário */}
          <div className="flex flex-col gap-5">
            {/* Nome */}
            <div>
              <label className="input-label">Nome completo</label>
              <input
                className="input-field"
                placeholder="Ex: João Silva"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value)
                  if (erroNome) setErroNome('')
                }}
                onBlur={() => setErroNome(validarNome(nome) || '')}
              />
              {erroNome && (
                <p className="text-xs text-red-400 mt-1.5">{erroNome}</p>
              )}
            </div>

            {/* WhatsApp */}
            <div>
              <label className="input-label">WhatsApp (com DDD)</label>
              <input
                className="input-field"
                placeholder="(11) 99999-9999"
                value={whatsapp}
                inputMode="tel"
                onChange={(e) => {
                  setWhatsapp(formatarWhats(e.target.value))
                  if (erroWhats) setErroWhats('')
                }}
                onBlur={() => setErroWhats(validarWhats(whatsapp) || '')}
              />
              {erroWhats && (
                <p className="text-xs text-red-400 mt-1.5">{erroWhats}</p>
              )}
            </div>

            {erroGeral && (
              <div className="glass rounded-xl px-4 py-3 border border-red-500/30">
                <p className="text-sm text-red-400">{erroGeral}</p>
              </div>
            )}

            <button
              className="btn-accent mt-2"
              onClick={handleSubmit}
              disabled={carregando}
            >
              {carregando ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner /> Entrando...
                </span>
              ) : (
                'Entrar no app'
              )}
            </button>

            <p className="text-center text-xs text-white/25 pb-4">
              Seus dados são usados apenas para identificação dentro do app.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
      <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
}
