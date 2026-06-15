/**
 * PlayerConfigForm — Formulario Foundry VTT para o jogador configurar
 * seu Discord ID e link de imagem do personagem (9:16).
 *
 * Aberto automaticamente ao entrar no mundo se nao configurado,
 * ou via Module Settings > "Configurar Jogador".
 */
export class PlayerConfigForm extends FormApplication {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "lumenn-player-config",
      title: game.i18n.localize("LUMENN.PlayerConfigTitle"),
      template: "modules/lumenn-roll-relay/templates/player-config.html",
      width: 420,
      height: "auto",
      closeOnSubmit: true,
    });
  }

  /** @override */
  getData() {
    const flags = game.user.getFlag("lumenn-roll-relay", "playerConfig") || {};
    return {
      discordId: flags.discordId || "",
      imageUrl: flags.imageUrl || "",
      displayName: game.user.name || "Jogador",
    };
  }

  /** @override */
  async _updateObject(_event, formData) {
    const data = foundry.utils.expandObject(formData);
    const discordId = String(data.discordId || "").trim();
    const imageUrl = String(data.imageUrl || "").trim();

    // Valida: Discord ID (17-20 digitos)
    if (discordId && !/^\d{17,20}$/.test(discordId)) {
      ui.notifications.error(game.i18n.localize("LUMENN.PlayerConfigInvalidDiscordId"));
      return;
    }

    // Valida: URL basica
    if (imageUrl && !/^https?:\/\/.+/.test(imageUrl)) {
      ui.notifications.error(game.i18n.localize("LUMENN.PlayerConfigInvalidImageUrl"));
      return;
    }

    await game.user.setFlag("lumenn-roll-relay", "playerConfig", {
      discordId: discordId || null,
      imageUrl: imageUrl || null,
      configuredAt: Date.now(),
    });

    ui.notifications.info(game.i18n.localize("LUMENN.PlayerConfigSaved"));
  }
}

/**
 * Verifica se o jogador atual precisa configurar.
 * @returns {boolean}
 */
export function needsPlayerConfig() {
  if (game.user.isGM) return false;
  const flags = game.user.getFlag("lumenn-roll-relay", "playerConfig");
  return !flags || !flags.discordId;
}

/**
 * Obtem o Discord ID e imagem do jogador das flags.
 * @returns {{ discordId: string|null, imageUrl: string|null }}
 */
export function getPlayerConfig() {
  const flags = game.user.getFlag("lumenn-roll-relay", "playerConfig") || {};
  return {
    discordId: flags.discordId || null,
    imageUrl: flags.imageUrl || null,
  };
}
