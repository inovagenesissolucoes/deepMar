const SCRIPT_URL = process.env.NEXT_PUBLIC_SCRIPT_URL || ''

export async function rpc<T = unknown>(
  action: string,
  payload: Record<string, unknown> = {}
): Promise<T> {
  const res = await fetch('/api/rpc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message || 'Erro na requisição')
  }
  return res.json()
}

export async function rpcDirect<T = unknown>(
  action: string,
  payload: Record<string, unknown> = {}
): Promise<T> {
  if (!SCRIPT_URL) throw new Error('SCRIPT_URL não configurado')
  const url = new URL(SCRIPT_URL)
  url.searchParams.set('action', action)
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    redirect: 'follow',
  })
  const data = await res.json()
  if (data.status === 'erro') throw new Error(data.message || 'Erro no servidor')
  return data.data as T
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export function formatarData(data: string): string {
  return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')
}

export function calcularIdade(dataNascimento: string): number {
  const hoje = new Date()
  const nasc = new Date(dataNascimento + 'T00:00:00')
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const m = hoje.getMonth() - nasc.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--
  return idade
}

export function calcularFaixaEtaria(
  idade: number
): 'crianca' | 'adolescente' | 'adulto' {
  if (idade < 13) return 'crianca'
  if (idade < 18) return 'adolescente'
  return 'adulto'
}

export function gerarParcelas(
  valorTotal: number,
  dataInscricao: string,
  dataVencimento: string
): { numero: number; valor: number; vencimento: string }[] {
  const inicio = new Date(dataInscricao + 'T00:00:00')
  const fim = new Date(dataVencimento + 'T00:00:00')
  const meses = Math.max(
    1,
    (fim.getFullYear() - inicio.getFullYear()) * 12 +
      (fim.getMonth() - inicio.getMonth())
  )
  const valorParcela = Math.round((valorTotal / meses) * 100) / 100
  const parcelas = []
  for (let i = 1; i <= meses; i++) {
    const venc = new Date(inicio)
    venc.setMonth(venc.getMonth() + i)
    parcelas.push({
      numero: i,
      valor: i === meses ? valorTotal - valorParcela * (meses - 1) : valorParcela,
      vencimento: venc.toISOString().split('T')[0],
    })
  }
  return parcelas
}

export function diasParaVencimento(vencimento: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const venc = new Date(vencimento + 'T00:00:00')
  return Math.ceil((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

export function statusVencimento(vencimento: string): 'ok' | 'alerta' | 'vencendo' | 'vencida' {
  const dias = diasParaVencimento(vencimento)
  if (dias < 0) return 'vencida'
  if (dias === 0) return 'vencendo'
  if (dias <= 3) return 'alerta'
  return 'ok'
}

export function gerarPixPayload(chave: string, valor: number, nome: string): string {
  function campo(id: string, v: string) {
    const len = v.length.toString().padStart(2, '0')
    return `${id}${len}${v}`
  }
  const pixKey = campo('01', '12') + campo('26', campo('00', 'BR.GOV.BCB.PIX') + campo('01', chave))
  const valorStr = valor.toFixed(2)
  const payload =
    campo('00', '01') +
    pixKey +
    campo('52', '0000') +
    campo('53', '986') +
    campo('54', valorStr) +
    campo('58', 'BR') +
    campo('59', nome.substring(0, 25).toUpperCase()) +
    campo('60', 'SAO PAULO') +
    campo('62', campo('05', '***')) +
    '6304'
  const crc = calcularCRC16(payload)
  return payload + crc
}

function calcularCRC16(str: string): string {
  let crc = 0xffff
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
    }
  }
  return ((crc & 0xffff).toString(16).toUpperCase().padStart(4, '0'))
}
