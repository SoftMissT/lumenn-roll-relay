import "./settings.js";
import { GenericAdapter } from "./adapters/generic.js";
import { DnD5eAdapter } from "./adapters/dnd5e.js";
import { RelayQueue } from "./relay.js";

let adapter;
let relay;

Hooks.once("ready", () => {
  const systemId = game.system.id;
  adapter = systemId === "dnd5e" ? new DnD5eAdapter() : new GenericAdapter();
  console.log(`Lumenn Roll Relay | Adapter: ${adapter.constructor.name} (sistema: ${systemId})`);

  const token = game.settings.get("lumenn-roll-relay", "worldToken");
  const supabaseUrl = game.settings.get("lumenn-roll-relay", "supabaseUrl");
  const supabaseAnonKey = game.settings.get("lumenn-roll-relay", "supabaseAnonKey");

  if (!token || !supabaseUrl || !supabaseAnonKey) {
    console.warn("Lumenn Roll Relay | Token ou credenciais Supabase não configurados. Relay desativado.");
    return;
  }

  relay = new RelayQueue(supabaseUrl, supabaseAnonKey, token);
  console.log("Lumenn Roll Relay | Relay ativado.");
});

Hooks.on("createChatMessage", (message, _options, userId) => {
  if (!relay || !adapter) return;
  if (game.user.id !== userId) return;
  if (!game.settings.get("lumenn-roll-relay", "enableRelay")) return;

  if (game.settings.get("lumenn-roll-relay", "hideBlindRolls")) {
    if (message.blind || message.whisper?.length > 0 || !message.visible) return;
  }

  if (game.modules.get("dice-so-nice")?.active) {
    Hooks.once("diceSoNiceRollComplete", (messageId) => {
      if (messageId === message.id) {
        processRoll(message, userId);
      }
    });
  } else {
    processRoll(message, userId);
  }
});

function processRoll(message, userId) {
  const rollData = adapter.detectRoll(message);
  if (!rollData) return;

  const isCritical = adapter.isCritical(rollData);
  const isFumble = adapter.isFumble(rollData);

  const payload = {
    foundry_user_id: userId,
    display_name: game.users.get(userId)?.name || "Desconhecido",
    formula: rollData.formula,
    result: rollData.total,
    is_critical: isCritical,
    is_fumble: isFumble,
    roll_type: rollData.rollType || null,
    system_data: adapter.extractMetadata(rollData),
  };

  relay.enqueue(payload);
}
