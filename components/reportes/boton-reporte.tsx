'use client'

import { FileDown, Printer } from 'lucide-react'

interface BotonReporteProps {
  titulo: string
  onGenerar: () => void
  tipo?: 'pdf' | 'imprimir'
}

export default function BotonReporte({ titulo, onGenerar, tipo = 'imprimir' }: BotonReporteProps) {
  const Icon = tipo === 'pdf' ? FileDown : Printer

  return (
    <button
      onClick={onGenerar}
      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
    >
      <Icon className="w-4 h-4" />
      {titulo}
    </button>
  )
}
