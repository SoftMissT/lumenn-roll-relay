export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
          Lumenn Relay
        </h1>
        <p className="max-w-md text-lg text-slate-400">
          Retransmita suas rolagens do Foundry VTT para o Discord
        </p>
        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-400">
          Status: Alfa - acesso restrito
        </span>
      </div>
    </div>
  )
}
