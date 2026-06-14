# Lumenn Roll Relay

![Foundry Virtual Tabletop Community Content](https://i.imgur.com/9bemAjD.jpeg)

Modulo nao oficial para Foundry VTT que retransmite rolagens de dados para um servidor Discord, com leaderboard de criticos e falhas por jogador.

## O que faz

- Detecta rolagens de dados no chat do Foundry (qualquer sistema; suporte aprimorado para D&D 5e)
- Identifica criticos (resultado maximo no dado) e falhas (resultado 1)
- Envia os dados para o bot **Lumenn Relay** no Discord
- Permite consultar um ranking de criticos/falhas via comando `/leaderboard` no Discord

## Instalacao

1. No Foundry VTT, va em **Configuracoes -> Adicionar Modulo -> Instalar Modulo**
2. Cole esta URL no campo "URL do Manifesto":

   ```text
   https://raw.githubusercontent.com/SoftMissT/lumenn-roll-relay/main/foundry-module/module.json
   ```

3. Clique em Instalar
4. Ative o modulo "Lumenn Roll Relay" no seu mundo

## Configuracao

1. No servidor Discord da sua mesa, adicione o bot **Lumenn Relay** (peca o link de convite ao administrador)
2. No Discord, rode o comando `/setup nome_do_mundo:"Nome da sua campanha"`
3. O bot vai:
   - Criar um canal `#lumenn-relay` no servidor
   - Gerar um **token unico** (mostrado so para voce)
4. No Foundry, va em **Configuracoes do Modulo -> Lumenn Roll Relay**
5. Cole o token no campo **World Token**
6. Salve

Pronto! As rolagens feitas no Foundry agora aparecem no leaderboard do Discord.

## Comandos do Discord

| Comando | Descricao |
|---|---|
| `/setup` | Configura o bot no servidor (apenas administradores) |
| `/registrar` | Jogadores se registram para aparecer no leaderboard |
| `/leaderboard` | Mostra o ranking de criticos e falhas |
| `/leaderboard me` | Mostra suas estatisticas pessoais |
| `/config status` | Mostra o vinculo atual mundo-canal |
| `/config channel` | Muda o canal de destino |
| `/reset` | Zera o leaderboard (requer permissao de gerenciar servidor) |
| `/ping` | Verifica se o bot esta online e mostra latencia |

## Privacidade

Este modulo envia para um servidor externo (Supabase): nome de exibicao do jogador no Foundry, formula da rolagem, resultado, e se foi critico/falha. Nenhuma outra informacao do seu mundo e coletada. Veja a [Politica de Privacidade completa](https://lumenn-roll-relay.vercel.app/privacy).

## Aviso

Este e um modulo de **comunidade, nao oficial**. Nao e afiliado, endossado ou verificado pela Foundry Gaming LLC.

## Suporte

- Issues: <https://github.com/SoftMissT/lumenn-roll-relay/issues>
- Desenvolvido por Lumenn Moovies Produtora
