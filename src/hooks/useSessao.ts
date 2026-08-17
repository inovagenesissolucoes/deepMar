'use client'
import { useState, useEffect } from 'react'
import type { Sessao } from '@/types'

export function useSessao() {
  const [sessao, setSessao] = useState<Sessao | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    fetch('/api/sessao')
      .then((r) => r.json())
      .then((data) => {
        if (data?.uid) setSessao(data as Sessao)
        else setSessao(null)
      })
      .catch(() => setSessao(null))
      .finally(() => setCarregando(false))
  }, [])

  return { sessao, carregando, setSessao }
}
