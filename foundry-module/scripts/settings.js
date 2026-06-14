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
});
