'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface DiceSoNiceProps {
  autoRoll?: boolean
  autoRollDelay?: number
  onRoll?: (result: number) => void
  className?: string
}

// Direcao de Arte — "Oraculo de Transmissao"
// D20 de cristal fumê / obsidiana translucida, iluminacao ciano no lado
// esquerdo, crimson no direito, orbita dourada, fundo cosmico escuro.
const LUMENN = {
  diceColor: 0x1a1a30, // cristal fumê escuro
  textColor: '#2a2a3a', // quase invisivel (sem numeros, anti-cassino)
  background: '#000000',
}

export default function DiceSoNice({
  autoRoll = true,
  autoRollDelay = 1000,
  onRoll,
  className = '',
}: DiceSoNiceProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rollerRef = useRef<{ roll: (c: { dice: string; diceColor: number; textColor: string; backgroundColor: string }[]) => void; destroy: () => void } | null>(null)
  const [mounted, setMounted] = useState(false)
  const [hasRolled, setHasRolled] = useState(false)

  const doRoll = useCallback(() => {
    rollerRef.current?.roll([{
      dice: 'd20',
      diceColor: LUMENN.diceColor,
      textColor: LUMENN.textColor,
      backgroundColor: LUMENN.background,
    }])
  }, [])

  // Hydrate: so mount after client-side
  useEffect(() => { setMounted(true) }, [])

  // Init Three.js roller
  useEffect(() => {
    if (!mounted || !containerRef.current) return
    let dead = false

    import('open-dice-dnd').then((mod) => {
      if (dead || !containerRef.current) return
      rollerRef.current = new mod.DiceRoller({
        container: containerRef.current,
        onRollComplete: (total: number) => onRoll?.(total),
      })
      if (autoRoll && !hasRolled) {
        setTimeout(() => { if (!dead) { setHasRolled(true); doRoll() } }, autoRollDelay)
      }
    })

    return () => { dead = true; rollerRef.current?.destroy(); rollerRef.current = null }
  }, [mounted, autoRoll, autoRollDelay, onRoll, hasRolled, doRoll])

  useEffect(() => {
    ;(window as unknown as Record<string, unknown>).lumennRoll = doRoll
    return () => { delete (window as unknown as Record<string, unknown>).lumennRoll }
  }, [doRoll])

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`} style={{ background: '#000000' }}>
      {/* Ambient cosmic glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 30% 50%, rgba(0,212,245,0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(208,20,82,0.05) 0%, transparent 60%)',
      }} />

      {/* 3D Canvas */}
      <div ref={containerRef} className="w-full h-full relative z-10" />

      {/* Orbita dourada overlay */}
      <div className="absolute inset-0 pointer-events-none z-20">
        <svg className="w-full h-full" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice">
          <ellipse
            cx="400" cy="280" rx="280" ry="120"
            fill="none"
            stroke="url(#orbitGrad)"
            strokeWidth="1.5"
            strokeDasharray="8 6"
            style={{ animation: 'orbit-spin 8s linear infinite' }}
            transform="rotate(-15 400 400)"
          />
          <defs>
            <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C8A84B" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#FFD700" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#C8A84B" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* HUD Aro divider — ciano esquerda, crimson direita */}
      <div className="absolute inset-0 pointer-events-none z-20">
        <svg className="w-full h-full" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice">
          <circle cx="400" cy="400" r="290" fill="none" strokeWidth="2" stroke="url(#hudGrad)" opacity="0.25" />
          <circle cx="400" cy="400" r="310" fill="none" strokeWidth="1" stroke="url(#hudGrad)" opacity="0.12" strokeDasharray="12 24" />
          <defs>
            <linearGradient id="hudGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00D4F5" />
              <stop offset="50%" stopColor="#00D4F5" />
              <stop offset="50.1%" stopColor="#D01452" />
              <stop offset="100%" stopColor="#D01452" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Runa diamond marks top and bottom */}
      <div className="absolute inset-0 pointer-events-none z-20 flex flex-col items-center justify-between py-[8%]">
        <RuneMark />
        <RuneMark />
      </div>

      {/* Click to roll prompt */}
      {!hasRolled && mounted && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
          style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}>
          <span className="font-mono-hud text-[10px] tracking-[0.25em] uppercase text-[#7DD8EC] opacity-70">
            Rolar D20
          </span>
        </div>
      )}
    </div>
  )
}

function RuneMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="opacity-40">
      <path d="M12 2L22 12L12 22L2 12Z" stroke="#C8A84B" strokeWidth="1.2" fill="none" />
      <line x1="12" y1="2" x2="12" y2="22" stroke="#C8A84B" strokeWidth="0.8" opacity="0.6" />
      <line x1="7" y1="7" x2="17" y2="17" stroke="#C8A84B" strokeWidth="0.8" opacity="0.4" />
    </svg>
  )
}
