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

  game.settings.register("lumenn-roll-relay", "supabaseUrl", {
    name: "Supabase URL",
    hint: "URL do projeto Supabase (ex: https://xxxxx.supabase.co). Fornecido pelo administrador.",
    scope: "world",
    config: true,
    type: String,
    default: "",
    requiresReload: false,
  });

  game.settings.register("lumenn-roll-relay", "supabaseAnonKey", {
    name: "Supabase Anon Key",
    hint: "Chave pública (anon) do Supabase. NÃO é a service_role.",
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
