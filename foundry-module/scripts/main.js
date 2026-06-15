import "./settings.js";
import { GenericAdapter } from "./adapters/generic.js";
import { DnD5eAdapter } from "./adapters/dnd5e.js";
import { RelayQueue } from "./relay.js";
import { PlayerConfigForm, needsPlayerConfig, getPlayerConfig } from "./player-config.js";

let adapter;
let relay;

Hooks.once("ready", () => {
  const systemId = game.system.id;
  adapter = systemId === "dnd5e" ? new DnD5eAdapter() : new GenericAdapter();
  console.log(`Lumenn Roll Relay | Adapter: ${adapter.constructor.name} (sistema: ${systemId})`);

  const token = game.settings.get("lumenn-roll-relay", "worldToken");

  if (!token) {
    console.warn("Lumenn Roll Relay | World Token não configurado. Relay desativado.");
    return;
  }

  relay = new RelayQueue(token);
  console.log("Lumenn Roll Relay | Relay ativado.");

  if (needsPlayerConfig()) {
    new PlayerConfigForm().render(true);
  }
});

// Botao de config do jogador na sidebar
Hooks.on("getSceneControlButtons", (controls) => {
  if (game.user.isGM) return;
  const tokenBar = controls.find((c) => c.name === "token");
  if (!tokenBar) return;
  tokenBar.tools.push({
    name: "lumenn-player-config",
    title: game.i18n.localize("LUMENN.PlayerConfigButton"),
    icon: "fas fa-user-gear",
    button: true,
    onClick: () => new PlayerConfigForm().render(true),
  });
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
  const user = game.users.get(userId);
  if (!user) return;
  if (user.isGM && game.settings.get("lumenn-roll-relay", "hideGMRolls")) return;

  const rollData = adapter.detectRoll(message);
  if (!rollData) return;

  // Filtro: apenas rolagens que envolvem 1d20.
  if (game.settings.get("lumenn-roll-relay", "onlyD20")) {
    if (!/d20/i.test(rollData.formula || "")) return;
  }

  // Filtro: valor minimo do resultado total (0 = sem filtro).
  const minRollValue = Number(game.settings.get("lumenn-roll-relay", "minRollValue")) || 0;
  if (minRollValue > 0 && Number(rollData.total) < minRollValue) return;

  const isCritical = adapter.isCritical(rollData);
  const isFumble = adapter.isFumble(rollData);

  const playerConfig = getPlayerConfig();

  // Nome de exibicao: o GM pode usar um nome customizado no leaderboard.
  let displayName = user.name || "Desconhecido";
  if (user.isGM) {
    const gmDisplayName = String(game.settings.get("lumenn-roll-relay", "gmDisplayName") || "").trim();
    if (gmDisplayName) displayName = gmDisplayName;
  }

  const payload = {
    foundry_user_id: userId,
    display_name: displayName,
    discord_id: playerConfig.discordId || null,
    image_url: playerConfig.imageUrl || null,
    character_name: playerConfig.characterName || null,
    formula: rollData.formula,
    result: rollData.total,
    is_critical: isCritical,
    is_fumble: isFumble,
    roll_type: rollData.rollType || null,
    system_data: adapter.extractMetadata(rollData),
  };

  relay.enqueue(payload);
}
