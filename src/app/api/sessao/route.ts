import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const SCRIPT_URL = process.env.NEXT_PUBLIC_SCRIPT_URL || ''

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('acamp_sessao')?.value
  if (!token) return NextResponse.json({ uid: null }, { status: 401 })

  try {
    const url = new URL(SCRIPT_URL)
    url.searchParams.set('action', 'verificarSessao')
    url.searchParams.set('token', token)
    const res = await fetch(url.toString(), { redirect: 'follow', cache: 'no-store' })
    const data = await res.json()
    if (data.status === 'ok' && data.data?.uid) {
      return NextResponse.json(data.data)
    }
    return NextResponse.json({ uid: null }, { status: 401 })
  } catch {
    return NextResponse.json({ uid: null }, { status: 500 })
  }
}
