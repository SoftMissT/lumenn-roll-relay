'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import DiceSoNice from '@/components/DiceSoNice'
import DiscordLoginButton from '@/components/DiscordLoginButton'

declare global {
  interface Window {
    lumennRoll?: () => void
  }
}

/* ═══════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════ */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(10, 10, 10, 0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0, 212, 245, 0.08)' : '1px solid transparent',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-8 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8">
            <div
              className="absolute inset-0 rounded-full transition-transform duration-300 group-hover:scale-110"
              style={{ background: 'linear-gradient(135deg, #00D4F5 0%, #D01452 100%)' }}
            />
            <svg className="relative w-8 h-8 p-1.5" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L22 12L12 22L2 12Z" stroke="white" strokeWidth="1.5" fill="none" />
              <line x1="12" y1="2" x2="12" y2="22" stroke="white" strokeWidth="1.5" />
              <line x1="7" y1="7" x2="17" y2="17" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="leading-none">
            <span className="font-display text-lg tracking-[0.15em] text-white">LUMENN</span>
            <span className="font-mono-hud text-[9px] tracking-[0.2em] text-[#4A6880] block -mt-0.5">RELAY</span>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: 'Funcionalidades', href: '#features' },
            { label: 'Status', href: '#status' },
            { label: 'Acesso', href: '#cta' },
            { label: 'Dashboard', href: '/dashboard' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[13px] font-medium text-[#8BA8C4] hover:text-[#00D4F5] transition-colors duration-200 tracking-wide"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="btn-glass text-sm py-2 px-5">
            Dashboard
          </Link>
          <DiscordLoginButton className="btn-crimson text-sm py-2 px-5">
            Entrar
          </DiscordLoginButton>
        </div>
      </div>
    </header>
  )
}

/* ═══════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════ */
function Hero() {
  const [rollResult, setRollResult] = useState<number | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const triggerRoll = useCallback(() => {
    if (window.lumennRoll) {
      window.lumennRoll()
    }
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background: DiceSoNice */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full" style={{ minHeight: '100vh' }}>
          <DiceSoNice
            autoRoll
            autoRollDelay={1000}
            onRoll={(result) => setRollResult(result)}
          />
        </div>
      </div>

      {/* Overlays for readability */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: `
            linear-gradient(to bottom, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0.2) 30%, transparent 50%),
            linear-gradient(to top, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.6) 40%, transparent 65%),
            radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(10,10,10,0.5) 100%)
          `,
        }}
      />

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 z-10 opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle, #00D4F5 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Content */}
      <div className="relative z-20 mx-auto max-w-5xl px-6 text-center">
        {/* Eyebrow */}
        <div
          className="mb-8"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono-hud text-[10px] tracking-[0.25em] uppercase"
            style={{
              border: '1px solid rgba(0, 212, 245, 0.25)',
              background: 'rgba(0, 212, 245, 0.05)',
              color: '#00D4F5',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4F5] animate-pulse" />
            Oráculo de Transmissão
          </span>
        </div>

        {/* Main Title */}
        <h1
          className="font-display text-white mb-2"
          style={{
            fontSize: 'clamp(80px, 16vw, 160px)',
            lineHeight: 0.9,
            letterSpacing: '-0.02em',
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(30px)',
            filter: loaded ? 'blur(0)' : 'blur(10px)',
            transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.15s',
            textShadow: '0 0 80px rgba(0, 212, 245, 0.15), 0 0 160px rgba(208, 20, 82, 0.08)',
          }}
        >
          LUMENN
        </h1>
        <h2
          className="font-display mb-8"
          style={{
            fontSize: 'clamp(60px, 12vw, 120px)',
            lineHeight: 0.9,
            letterSpacing: '0.05em',
            color: '#C8A84B',
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(30px)',
            filter: loaded ? 'blur(0)' : 'blur(10px)',
            transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
            textShadow: '0 0 60px rgba(200, 168, 75, 0.3), 0 0 120px rgba(200, 168, 75, 0.1)',
          }}
        >
          RELAY
        </h2>

        {/* Tagline */}
        <p
          className="text-lg md:text-xl text-[#8BA8C4] max-w-md mx-auto mb-12 font-light tracking-wide"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s',
          }}
        >
          Suas rolagens épicas, do Foundry VTT direto para o Discord
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.7s',
          }}
        >
          <button className="btn-crimson text-lg py-4 px-10">
            Iniciar Transmissão
          </button>
          <button className="btn-glass text-lg py-4 px-10" onClick={triggerRoll}>
            Ver o D20 rolar
          </button>
        </div>

        {/* Roll Result */}
        {rollResult && (
          <div
            className="mt-12"
            style={{
              animation: 'fade-up 0.5s ease-out forwards',
            }}
          >
            <div className="font-mono-hud text-xs text-[#4A6880] tracking-[0.2em] uppercase mb-2">
              Resultado
            </div>
            <div
              className="font-display text-[100px] leading-none"
              style={{
                color: '#FFD27A',
                filter: 'drop-shadow(0 0 30px rgba(255, 210, 122, 0.5))',
              }}
            >
              {rollResult}
            </div>
          </div>
        )}
      </div>

      {/* Scroll Indicator */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.8s ease 1.2s',
        }}
      >
        <span className="font-mono-hud text-[10px] tracking-[0.2em] text-[#4A6880] uppercase">
          Scroll
        </span>
        <div className="w-px h-10 bg-gradient-to-b from-[#00D4F5] to-transparent" />
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════
   FEATURES SECTION
   ═══════════════════════════════════════ */
const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D4F5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 17L17 7M17 7H7M17 7V17" />
      </svg>
    ),
    title: 'Relay de Rolagens',
    description: 'Transmissão em tempo real de todos os dados do Foundry VTT para o seu canal do Discord, com precisão de milissegundos.',
    metric: '< 100ms',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D01452" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
    ),
    title: 'Leaderboard Épico',
    description: 'Contadores de nat 20 e nat 1 por jogador. Ranking de críticos e falhas críticas. Quem é o mais azarado da mesa?',
    metric: '20 · 1',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8A84B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    title: 'Multi-Sistema',
    description: 'D&D 5e, Pathfinder, Call of Cthulhu e qualquer sistema no Foundry VTT. Plug & play, sem configuração.',
    metric: '5+',
  },
]

function Features() {
  return (
    <section id="features" className="relative py-24 px-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-16">
          <h2 className="font-display text-[40px] md:text-[56px] text-white tracking-[0.02em] leading-none mb-4">
            O QUE FAZ
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-px bg-[#D01452]" />
            <span className="font-mono-hud text-[11px] tracking-[0.2em] text-[#4A6880] uppercase">
              Sistema de Retransmissão
            </span>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="glass-panel glass-panel-hover p-8 relative group"
              style={{
                opacity: 0,
                animation: `fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + i * 0.15}s forwards`,
              }}
            >
              {/* Icon */}
              <div className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[rgba(0,212,245,0.06)]">
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="font-display text-[24px] text-white tracking-[0.02em] mb-3">
                {feature.title}
              </h3>
              <p className="text-[14px] text-[#8BA8C4] leading-relaxed mb-6">
                {feature.description}
              </p>

              {/* Metric */}
              <div className="flex items-center gap-3 pt-4 border-t border-[rgba(0,212,245,0.08)]">
                <span className="font-mono-hud text-[10px] text-[#4A6880] tracking-[0.15em] uppercase">
                  Metric
                </span>
                <span className="font-mono-hud text-base text-[#00D4F5] font-bold">
                  {feature.metric}
                </span>
              </div>

              {/* Hover Glow Border */}
              <div
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: 'inset 0 0 0 1px rgba(0, 212, 245, 0.3), 0 0 30px rgba(208, 20, 82, 0.1)' }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════
   STATUS SECTION
   ═══════════════════════════════════════ */
function Status() {
  return (
    <section id="status" className="relative py-20 px-6">
      <div className="mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-3 mb-10">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className="absolute inline-flex h-full w-full rounded-full bg-[#D01452] opacity-75"
              style={{ animation: 'ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite' }}
            />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D01452]" />
          </span>
          <span
            className="rounded-full px-5 py-2 font-mono-hud text-[10px] tracking-[0.2em] uppercase"
            style={{
              border: '1px solid rgba(208, 20, 82, 0.3)',
              background: 'rgba(208, 20, 82, 0.06)',
              color: '#D01452',
            }}
          >
            Alfa — Acesso Restrito
          </span>
        </div>

        {/* Title */}
        <h2 className="font-display text-[36px] md:text-[48px] text-white tracking-[0.02em] leading-none mb-5">
          FASE ALFA
        </h2>

        {/* Description */}
        <p className="text-[15px] text-[#8BA8C4] max-w-md mx-auto leading-relaxed">
          O Lumenn Relay está em fase de testes com acesso limitado.
          Solicite entrada na lista de autorizados.
        </p>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════
   CTA SECTION
   ═══════════════════════════════════════ */
function CTA() {
  return (
    <section id="cta" className="relative py-24 px-6">
      <div className="mx-auto max-w-3xl">
        <div className="glass-panel p-10 md:p-16 text-center relative overflow-hidden">
          {/* Subtle background glow */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{ background: 'radial-gradient(circle at 50% 50%, #D01452, transparent 70%)' }}
          />

          <div className="relative z-10">
            <h2 className="font-display text-[36px] md:text-[56px] text-white tracking-[0.02em] leading-none mb-5">
              QUER ACESSO?
            </h2>
            <p className="text-[15px] text-[#8BA8C4] mb-10 max-w-md mx-auto leading-relaxed">
              Entre no Discord da Lumenn e solicite acesso à fase Alfa.
              Vagas limitadas.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="btn-crimson text-lg py-4 px-10">
                Pedir Acesso
              </button>
              <DiscordLoginButton>
                Login com Discord
              </DiscordLoginButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════ */
function Footer() {
  return (
    <footer className="relative border-t border-[rgba(0,212,245,0.06)] py-10 px-6">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00D4F5, #D01452)' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L22 12L12 22L2 12Z" stroke="white" strokeWidth="2" fill="none" />
            </svg>
          </div>
          <span className="font-mono-hud text-[11px] text-[#4A6880] tracking-wider">
            © 2026 LUMENN RELAY
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-8 text-[13px] text-[#8BA8C4]">
          <Link href="/terms" className="hover:text-[#00D4F5] transition-colors duration-200">Termos</Link>
          <Link href="/privacy" className="hover:text-[#00D4F5] transition-colors duration-200">Privacidade</Link>
          <a href="https://github.com/SoftMissT/lumenn-roll-relay" target="_blank" rel="noopener noreferrer" className="hover:text-[#00D4F5] transition-colors duration-200">GitHub</a>
        </div>

        {/* Version */}
        <div className="font-mono-hud text-[10px] tracking-wider text-[#4A6880] uppercase">
          v0.1.0-alpha
        </div>
      </div>
    </footer>
  )
}

/* ═══════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════ */
export default function LumennRelayLanding() {
  return (
    <main className="relative bg-[#0A0A0A]">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute top-0 left-1/4 w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0, 212, 245, 0.03) 0%, transparent 70%)',
            filter: 'blur(120px)',
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(208, 20, 82, 0.02) 0%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />
      </div>

      <div className="relative z-10">
        <Navbar />
        <Hero />
        <Features />
        <Status />
        <CTA />
        <Footer />
      </div>
    </main>
  )
}
