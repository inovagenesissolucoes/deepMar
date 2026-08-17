# 🏕️ Acamp Deep

PWA de inscrições e pagamentos para acampamentos da igreja.

---

## Stack

- **Frontend:** Next.js 14 + Tailwind CSS — hospedado na Vercel
- **Backend:** Google Apps Script
- **Banco de dados:** Google Sheets
- **Mídia:** Google Drive
- **Push:** Web Push API (VAPID)

---

## Deploy passo a passo

### 1. Criar a Planilha Google

1. Acesse [sheets.google.com](https://sheets.google.com) e crie uma planilha nova
2. Copie o **ID** da planilha (na URL: `https://docs.google.com/spreadsheets/d/**SEU_ID**/`)

### 2. Configurar o Apps Script

1. No Google Sheets: **Extensões → Apps Script**
2. Copie cada arquivo da pasta `apps-script/` para o editor (um `.gs` por arquivo)
3. Em `00-main.gs`, atualize:
   ```js
   SHEET_ID_PROD: 'SEU_GOOGLE_SHEET_ID',
   VERCEL_URL: 'https://acamp-deep.vercel.app', // sua URL da Vercel
   ```
4. Execute `inicializarPlanilha()` (aba `04-galeria-config.gs`) — isso cria todos os headers
5. Execute `configurarTriggerDiario()` (aba `03-pagamentos.gs`) — ativa o cron de notificações
6. **Publicar → Implantar como app da Web:**
   - Executar como: **Eu (sua conta)**
   - Quem tem acesso: **Qualquer pessoa**
   - Copie a URL gerada → é o seu `NEXT_PUBLIC_SCRIPT_URL`

### 3. Gerar chaves VAPID para push

Execute no terminal (ou use https://web-push-codelab.glitch.me/):
```bash
npx web-push generate-vapid-keys
```
Guarde a chave pública e privada.

### 4. Deploy na Vercel

1. Suba o projeto para um repositório GitHub
2. Acesse [vercel.com](https://vercel.com) e importe o projeto
3. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SCRIPT_URL` → URL do Apps Script
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` → chave pública VAPID
   - `VAPID_PRIVATE_KEY` → chave privada VAPID
   - `VAPID_EMAIL` → e-mail de contato (ex: app@suaigreja.com)
4. Deploy! A URL gerada é a `VERCEL_URL` que você coloca no `00-main.gs`

### 5. Criar o primeiro admin

1. Acesse o app e faça o cadastro com seu WhatsApp
2. Na planilha, aba **Usuarios**, mude sua coluna `perfil` de `jovem` para `admin`
3. A partir daí você pode promover outros admins pelo app

---

## Estrutura de pastas

```
src/
├── app/
│   ├── page.tsx              # Splash + roteador de sessão
│   ├── cadastro/page.tsx     # Primeiro acesso
│   ├── home/page.tsx         # Home com countdown e galeria
│   ├── eventos/[id]/page.tsx # Detalhe + inscrição
│   ├── parcelas/page.tsx     # Minhas parcelas + pagamento Pix
│   ├── dashboard/page.tsx    # Painel do líder
│   ├── perfil/page.tsx       # Perfil do usuário
│   └── api/
│       ├── sessao/           # Verifica cookie de sessão
│       ├── rpc/              # Proxy para Apps Script
│       ├── logout/           # Apaga cookie
│       └── push/             # Envia notificação push
├── components/
│   ├── layout/NavBar.tsx     # Barra de navegação inferior
│   └── ui/
│       ├── SplashScreen.tsx  # Tela de abertura animada
│       ├── Countdown.tsx     # Contador regressivo
│       └── QRCodePix.tsx     # QR Code + cópia do Pix
├── hooks/
│   ├── useSessao.ts          # Hook de sessão do usuário
│   └── usePush.ts            # Hook de push notifications
├── lib/api.ts                # Helpers: rpc, formatação, cálculos
└── types/index.ts            # Tipos TypeScript

apps-script/
├── 00-main.gs                # Roteador + helpers
├── 01-usuarios.gs            # Cadastro, login, push
├── 02-eventos.gs             # Eventos, inscrições, parcelas, dashboard
├── 03-pagamentos.gs          # Comprovantes + cron de notificações
└── 04-galeria-config.gs      # Galeria, config, inicializar planilha

public/
├── sw.js                     # Service Worker (push + cache)
└── manifest.json             # PWA manifest
```

---

## Fluxo de notificações (cron)

O trigger `cronNotificacoes()` roda todo dia às 8h e:
1. Varre todas as parcelas com status ≠ `paga`
2. Se vence em `N` dias (configurável em Config) → push "vencendo em breve"
3. Se vence hoje → push urgente
4. Se vencida → push "clique para pagar" (sem bloquear o pagamento)
5. Marca flag na planilha para não reenviar no dia seguinte

---

## Perfis de acesso

| Perfil | Cadastro | O que pode fazer |
|--------|----------|-----------------|
| `jovem` | Primeiro acesso (nome + WhatsApp) | Ver eventos, se inscrever, pagar parcelas |
| `lider` | Promovido por admin | Tudo do jovem + criar eventos, ver inscritos, galeria |
| `admin` | Promovido por outro admin | Tudo + configurações, cadastrar admins |
