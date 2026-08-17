'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import SplashScreen from '@/components/ui/SplashScreen'

export default function RootPage() {
  const router = useRouter()
  const [splashOk, setSplashOk] = useState(false)

  const verificarSessao = useCallback(async () => {
    try {
      const res = await fetch('/api/sessao')
      const data = await res.json()
      if (data?.uid) {
        router.replace('/home')
      } else {
        router.replace('/cadastro')
      }
    } catch {
      router.replace('/cadastro')
    }
  }, [router])

  const handleSplashDone = useCallback(() => {
    setSplashOk(true)
    verificarSessao()
  }, [verificarSessao])

  return (
    <>
      <SplashScreen onDone={handleSplashDone} />
      {/* Fundo enquanto redireciona */}
      {splashOk && (
        <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #0A1628, #0d1f3c)' }} />
      )}
    </>
  )
}
