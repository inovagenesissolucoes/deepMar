'use client'
import { useState, useCallback } from 'react'
import { rpc } from '@/lib/api'

export function usePush() {
  const [ativo, setAtivo] = useState(false)
  const [carregando, setCarregando] = useState(false)

  const ativarPush = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false
    try {
      setCarregando(true)
      const sw = await navigator.serviceWorker.register('/sw.js')
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') return false

      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
      const padding = '='.repeat((4 - (key.length % 4)) % 4)
      const base64 = (key + padding).replace(/-/g, '+').replace(/_/g, '/')
      const rawData = window.atob(base64)
      const buffer = new ArrayBuffer(rawData.length)
      const view = new Uint8Array(buffer)
      for (let i = 0; i < rawData.length; i++) {
        view[i] = rawData.charCodeAt(i)
      }

      const sub = await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: buffer,
      })

      const json = sub.toJSON()
      await rpc('salvarPush', {
        endpoint: json.endpoint,
        p256dh: (json.keys as Record<string, string>)?.p256dh,
        auth: (json.keys as Record<string, string>)?.auth,
      })
      setAtivo(true)
      return true
    } catch {
      return false
    } finally {
      setCarregando(false)
    }
  }, [])

  return { ativo, carregando, ativarPush }
}
