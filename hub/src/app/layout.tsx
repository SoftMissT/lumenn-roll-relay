import type { Metadata } from "next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Lumenn Relay — Suas rolagens épicas, no Discord",
  description: "Retransmita rolagens do Foundry VTT para o Discord com precisão de oráculo e visual de núcleo arcano.",
  keywords: ["foundry vtt", "discord", "dice", "rolagem", "rpg", "bot"],
  openGraph: {
    title: "Lumenn Relay",
    description: "Retransmita suas rolagens do Foundry VTT para o Discord",
    type: "website",
  },
  icons: {
    icon: "/favicon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#0A0A0A] text-[#EEF2FF] antialiased">
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
