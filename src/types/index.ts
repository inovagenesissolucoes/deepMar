export type Perfil = 'jovem' | 'lider' | 'admin'

export interface Usuario {
  uid: string
  nome: string
  whatsapp: string
  perfil: Perfil
  push_endpoint?: string
  push_keys?: { p256dh: string; auth: string }
  criado_em: string
}

export type StatusEvento = 'rascunho' | 'ativo' | 'encerrado'

export interface Evento {
  evento_id: string
  nome: string
  descricao: string
  data_evento: string
  valor_total: number
  chave_pix: string
  inscricao_abertura: string
  inscricao_fechamento: string
  idade_minima_autorizacao: number
  status: StatusEvento
  criado_por: string
  criado_em: string
}

export type StatusInscricao = 'ativa' | 'cancelada'

export interface Inscricao {
  inscricao_id: string
  evento_id: string
  uid: string
  nome: string
  data_nascimento: string
  whatsapp_responsavel?: string
  nome_responsavel?: string
  data_vencimento_escolhida: string
  total_parcelas: number
  excecao_parcelamento?: string
  status: StatusInscricao
  inscrito_em: string
}

export type StatusParcela = 'pendente' | 'paga' | 'vencida'

export interface Parcela {
  parcela_id: string
  inscricao_id: string
  uid: string
  numero: number
  valor: number
  vencimento: string
  status: StatusParcela
  comprovante_url?: string
  pago_em?: string
  notif_3dias_enviada: boolean
  notif_vencimento_enviada: boolean
  notif_vencida_enviada: boolean
}

export interface Midia {
  midia_id: string
  evento_id?: string
  tipo: 'foto' | 'video'
  url: string
  thumb_url?: string
  legenda?: string
  enviado_por: string
  enviado_em: string
  ordem: number
}

export interface Sessao {
  uid: string
  nome: string
  whatsapp: string
  perfil: Perfil
}

export interface InscricaoComParcelas extends Inscricao {
  parcelas: Parcela[]
  evento?: Evento
}

export interface DashboardLider {
  evento: Evento
  total_inscritos: number
  valor_arrecadado: number
  valor_pendente: number
  faixas: {
    crianca: number
    adolescente: number
    adulto: number
  }
  inscritos: Array<Inscricao & {
    nome_usuario: string
    whatsapp: string
    parcelas_pagas: number
    total_parcelas: number
    valor_pendente: number
  }>
}
