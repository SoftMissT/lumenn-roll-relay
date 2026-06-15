'use client'

import { useState, useCallback, useEffect } from 'react'

interface DiceSoNiceProps {
  autoRoll?: boolean
  autoRollDelay?: number
  onRoll?: (result: number) => void
  className?: string
}

const D20_FACES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

function rollD20(): number {
  return D20_FACES[Math.floor(Math.random() * 20)]
}

export default function DiceSoNice({
  autoRoll = true,
  autoRollDelay = 1000,
  onRoll,
  className = '',
}: DiceSoNiceProps) {
  const [result, setResult] = useState<number | null>(null)
  const [rolling, setRolling] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [hasAutoRolled, setHasAutoRolled] = useState(false)

  const doRoll = useCallback(() => {
    if (rolling) return
    setRolling(true)
    setSpinning(true)
    setResult(null)

    const finalResult = rollD20()
    const ticks = 8 + Math.floor(Math.random() * 6)
    let tick = 0

    const interval = setInterval(() => {
      tick++
      setResult(rollD20())
      if (tick >= ticks) {
        clearInterval(interval)
        setResult(finalResult)
        setRolling(false)
        setTimeout(() => setSpinning(false), 200)
        onRoll?.(finalResult)
      }
    }, 60)
  }, [rolling, onRoll])

  useEffect(() => {
    if (autoRoll && !hasAutoRolled) {
      const timer = setTimeout(() => {
        setHasAutoRolled(true)
        doRoll()
      }, autoRollDelay)
      return () => clearTimeout(timer)
    }
  }, [autoRoll, autoRollDelay, hasAutoRolled, doRoll])

  useEffect(() => {
    ;(window as unknown as Record<string, unknown>).lumennRoll = doRoll
    return () => {
      delete (window as unknown as Record<string, unknown>).lumennRoll
    }
  }, [doRoll])

  const isCritical = result === 20
  const isFumble = result === 1

  return (
    <div className={`w-full h-full flex items-center justify-center ${className}`}>
      {/* Ambient glow */}
      <div
        className="absolute inset-0"
        style={{
          background: isCritical
            ? 'radial-gradient(circle at 50% 50%, rgba(200,168,75,0.15) 0%, transparent 60%)'
            : isFumble
              ? 'radial-gradient(circle at 50% 50%, rgba(255,43,74,0.1) 0%, transparent 60%)'
              : 'radial-gradient(circle at 50% 50%, rgba(208,20,82,0.08) 0%, transparent 60%)',
          transition: 'background 0.5s ease',
        }}
      />

      {/* D20 */}
      <div className="relative">
        {/* Diamond shape */}
        <button
          onClick={doRoll}
          className="relative w-32 h-32 md:w-48 md:h-48 cursor-pointer focus:outline-none group"
          style={{
            animation: spinning ? 'dice-spin 0.3s linear infinite' : 'none',
            transition: 'transform 0.2s ease',
          }}
          aria-label="Rolar d20"
        >
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            style={{
              filter: isCritical
                ? 'drop-shadow(0 0 40px rgba(200,168,75,0.6))'
                : isFumble
                  ? 'drop-shadow(0 0 40px rgba(255,43,74,0.4))'
                  : 'drop-shadow(0 0 30px rgba(208,20,82,0.3))',
              transition: 'filter 0.5s ease',
            }}
          >
            {/* Diamond outline */}
            <polygon
              points="100,10 190,100 100,190 10,100"
              fill="none"
              stroke={isCritical ? '#C8A84B' : isFumble ? '#FF2B4A' : '#D01452'}
              strokeWidth="2.5"
              style={{ transition: 'stroke 0.3s ease' }}
            />
            {/* Inner rune lines */}
            <line x1="100" y1="10" x2="100" y2="190" stroke={isCritical ? '#C8A84B' : '#D01452'} strokeWidth="1.5" opacity="0.4" />
            <line x1="40" y1="60" x2="160" y2="140" stroke={isCritical ? '#C8A84B' : '#D01452'} strokeWidth="1.5" opacity="0.3" />
          </svg>

          {/* Result number */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              opacity: result !== null ? 1 : 0,
              transition: 'opacity 0.15s ease',
            }}
          >
            <span
              className="font-display leading-none select-none"
              style={{
                fontSize: 'clamp(48px, 8vw, 80px)',
                color: isCritical ? '#FFD700' : isFumble ? '#FF2B4A' : '#FFD27A',
                textShadow: isCritical
                  ? '0 0 40px rgba(255,215,0,0.5), 0 0 80px rgba(200,168,75,0.3)'
                  : isFumble
                    ? '0 0 30px rgba(255,43,74,0.4)'
                    : '0 0 20px rgba(255,210,122,0.3)',
                transition: 'color 0.3s ease, text-shadow 0.3s ease',
              }}
            >
              {result}
            </span>
          </div>
        </button>

        {/* Rolling indicator */}
        {rolling && (
          <div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2"
            style={{ animation: 'pulse-glow 0.5s ease-in-out infinite' }}
          >
            <span className="font-mono-hud text-[9px] tracking-[0.2em] uppercase text-[var(--accent-holo)]">
              Rolando...
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
