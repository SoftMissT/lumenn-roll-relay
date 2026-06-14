import { GenericAdapter } from "./generic.js";

export class DnD5eAdapter extends GenericAdapter {
  detectRoll(message) {
    const base = super.detectRoll(message);
    if (!base) return base;

    base.rollType = message.flags?.dnd5e?.roll?.type || message.flags?.dnd5e?.messageType || "unknown";
    return base;
  }

  extractMetadata(rollData) {
    return {
      ...super.extractMetadata(rollData),
      rollType: rollData.rollType,
    };
  }
}
