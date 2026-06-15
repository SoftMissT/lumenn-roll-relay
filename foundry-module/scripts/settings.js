Hooks.once("init", () => {
  game.settings.register("lumenn-roll-relay", "worldToken", {
    name: "World Token",
    hint: "Token gerado pelo bot Lumenn Relay no Discord (comando /setup). Cole aqui.",
    scope: "world",
    config: true,
    type: String,
    default: "",
    requiresReload: false,
  });

  game.settings.register("lumenn-roll-relay", "enableRelay", {
    name: "Ativar Relay",
    hint: "Ativa/desativa o envio de rolagens ao Discord.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register("lumenn-roll-relay", "hideBlindRolls", {
    name: "Ocultar Rolagens Secretas",
    hint: "Se ativado, rolagens blind/secret do GM não são enviadas ao Discord.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register("lumenn-roll-relay", "hideGMRolls", {
    name: "Ocultar Rolagens do GM",
    hint: "Se ativado, rolagens do GM (mestre) não são enviadas ao Discord. Apenas rolagens de jogadores.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register("lumenn-roll-relay", "minRollValue", {
    name: game.i18n.localize("LUMENN_ROLL_RELAY.settings.minRollValue.name"),
    hint: game.i18n.localize("LUMENN_ROLL_RELAY.settings.minRollValue.hint"),
    scope: "world",
    config: true,
    type: Number,
    default: 0,
  });

  game.settings.register("lumenn-roll-relay", "onlyD20", {
    name: game.i18n.localize("LUMENN_ROLL_RELAY.settings.onlyD20.name"),
    hint: game.i18n.localize("LUMENN_ROLL_RELAY.settings.onlyD20.hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register("lumenn-roll-relay", "gmDisplayName", {
    name: game.i18n.localize("LUMENN_ROLL_RELAY.settings.gmDisplayName.name"),
    hint: game.i18n.localize("LUMENN_ROLL_RELAY.settings.gmDisplayName.hint"),
    scope: "world",
    config: true,
    type: String,
    default: "",
  });
});
