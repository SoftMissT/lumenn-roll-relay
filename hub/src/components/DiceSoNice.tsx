'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface DiceSoNiceProps {
  diceType?: 'd20' | 'd6' | 'd8' | 'd10' | 'd12' | 'd100' | 'd4'
  diceColor?: number
  textColor?: string
  backgroundColor?: string
  autoRoll?: boolean
  autoRollDelay?: number
  onRoll?: (result: number) => void
  className?: string
}

const LUMENN_DICE = {
  diceColor: 0xb1121a,
  textColor: '#FFD27A',
  backgroundColor: '#5A0A0A',
}

export default function DiceSoNice({
  diceType = 'd20',
  diceColor = LUMENN_DICE.diceColor,
  textColor = LUMENN_DICE.textColor,
  backgroundColor = LUMENN_DICE.backgroundColor,
  autoRoll = true,
  autoRollDelay = 1200,
  onRoll,
  className = '',
}: DiceSoNiceProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rollerRef = useRef<any>(null)
  const [mounted, setMounted] = useState(false)

  const roll = useCallback(() => {
    rollerRef.current?.roll([{
      dice: diceType,
      diceColor,
      textColor,
      backgroundColor,
    }])
  }, [diceType, diceColor, textColor, backgroundColor])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !containerRef.current) return

    let destroyed = false

    import('open-dice-dnd').then((mod) => {
      if (destroyed || !containerRef.current) return

      rollerRef.current = new mod.DiceRoller({
        container: containerRef.current,
        onRollComplete: (total: number) => {
          onRoll?.(total)
        },
      })

      if (autoRoll) {
        setTimeout(() => {
          if (!destroyed) roll()
        }, autoRollDelay)
      }
    })

    return () => {
      destroyed = true
      rollerRef.current?.destroy()
      rollerRef.current = null
    }
  }, [mounted, onRoll, autoRoll, autoRollDelay, roll])

  useEffect(() => {
    if (mounted) {
      ;(window as any).lumennRoll = roll
    }
    return () => {
      if (mounted) {
        delete (window as any).lumennRoll
      }
    }
  }, [mounted, roll])

  if (!mounted) {
    return (
      <div
        className={`w-full h-full ${className}`}
        style={{ background: '#000000' }}
      />
    )
  }

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className}`}
      style={{ background: '#000000' }}
    />
  )
}