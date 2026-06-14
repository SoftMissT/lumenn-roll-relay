import { SystemAdapter } from "./base.js";

export class GenericAdapter extends SystemAdapter {
  detectRoll(message) {
    const roll = message.rolls?.[0];
    if (!roll) return null;

    const dice = roll.dice?.length ? roll.dice : roll.terms?.filter((term) => term?.faces);
    const die = dice?.find((term) => term?.faces);
    if (!die) return null;

    const activeResults = (die.results ?? []).filter((result) => result.active !== false);
    const naturalResult = activeResults[0]?.result ?? die.results?.[0]?.result ?? null;
    if (naturalResult === null || naturalResult === undefined) return null;

    return {
      formula: roll.formula,
      total: roll.total,
      naturalResult,
      dieMax: die.faces,
      dieCount: activeResults.length || die.number || 1,
      activeResults: activeResults.map((result) => result.result),
    };
  }

  isCritical(rollData) {
    return rollData.dieCount === 1 && rollData.naturalResult === rollData.dieMax;
  }

  isFumble(rollData) {
    return rollData.dieCount === 1 && rollData.naturalResult === 1;
  }

  extractMetadata(rollData) {
    return {
      naturalResult: rollData.naturalResult,
      dieMax: rollData.dieMax,
      dieCount: rollData.dieCount,
      activeResults: rollData.activeResults,
    };
  }
}
