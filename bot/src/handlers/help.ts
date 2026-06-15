import { ephemeral } from "../embeds.ts"
import type { Interaction } from "../types.ts"

const HELP_DATA = [
  { name: "/ping", desc: "Verifica se o Lumenn Relay esta online." },
  { name: "/setup <nome_do_mundo> [categoria_id]", desc: "Configura o bot: gera token, cria canal #lumenn-relay e vincula ao mundo Foundry." },
  { name: "/registrar", desc: "Registra voce no mundo vinculado para rastrear suas rolagens no leaderboard." },
  { name: "/config status", desc: "Mostra o vinculo atual mundo↔canal." },
  { name: "/config channel", desc: "Define este canal como destino das rolagens." },
  { name: "/config unlink confirm:True", desc: "Desvincula o servidor do mundo (requer Manage Guild)." },
  { name: "/leaderboard", desc: "Ranking top-10 de criticos e fumbles do mundo vinculado." },
  { name: "/leaderboard me:True", desc: "Seus proprios stats (criticos e fumbles)." },
  { name: "/reset leaderboard confirm:True", desc: "Zera todas as rolagens do leaderboard (requer Manage Guild)." },
  { name: "/reset token", desc: "Gera um novo World Token. O anterior para de funcionar." },
  { name: "/help", desc: "Mostra esta lista de comandos." },
]

export function handleHelp(_interaction: Interaction): Response {
  const fields = HELP_DATA.map((cmd) => ({
    name: cmd.name,
    value: cmd.desc,
    inline: false,
  }))

  const embed = {
    title: "Lumenn Relay — Comandos",
    description: "Retransmite rolagens do Foundry VTT para o Discord com leaderboard de criticos e fumbles.",
    color: 0xd01452,
    fields,
    footer: { text: "Lumenn Relay • Oráculo dos Dados" },
  }

  return ephemeral(embed)
}
