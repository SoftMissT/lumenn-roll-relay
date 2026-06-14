# Lumenn Roll Relay

Módulo não oficial para Foundry VTT que retransmite rolagens para o Discord por meio do Supabase do projeto Lumenn Roll Relay.

## Instalação manual

1. Copie a pasta `foundry-module/` para `Data/modules/lumenn-roll-relay/` no seu ambiente local do Foundry.
2. Reinicie o Foundry VTT.
3. Ative o módulo "Lumenn Roll Relay" no mundo.
4. Em Module Settings, configure:
   - World Token gerado pelo bot no comando `/setup`
   - Supabase URL
   - Supabase Anon Key
   - filtros de relay

Repo: https://github.com/SoftMissT/lumenn-roll-relay

## Notas

- Não use `service_role` no Foundry. O módulo roda no browser e deve usar apenas a anon key.
- O módulo foi preparado para Foundry VTT v12+ e usa `esmodules`.
- O envio aguarda `diceSoNiceRollComplete` quando Dice So Nice está ativo; caso contrário, processa o hook padrão `createChatMessage`.
