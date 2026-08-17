import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const SCRIPT_URL = process.env.NEXT_PUBLIC_SCRIPT_URL || ''

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('acamp_sessao')?.value

  const body = await req.json()
  const { action, ...payload } = body

  if (!SCRIPT_URL) return NextResponse.json({ message: 'SCRIPT_URL não configurado' }, { status: 500 })

  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, token, ...payload }),
      redirect: 'follow',
    })

    const data = await res.json()

    if (action === 'cadastrar' && data.status === 'ok' && data.token) {
      const response = NextResponse.json(data)
      response.cookies.set('acamp_sessao', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 90,
        path: '/',
      })
      return response
    }

    if (data.status === 'erro') {
      return NextResponse.json({ message: data.message || 'Erro no servidor' }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ message: 'Falha na comunicação com o servidor' }, { status: 500 })
  }
}
