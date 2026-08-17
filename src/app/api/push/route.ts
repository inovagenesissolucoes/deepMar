import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL || 'app@acampdeep.com'}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
)

export async function POST(req: NextRequest) {
  const { subscription, title, body, url } = await req.json()

  if (!subscription?.endpoint) {
    return NextResponse.json({ error: 'Sem subscription' }, { status: 400 })
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title, body, url: url || '/' })
    )
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
