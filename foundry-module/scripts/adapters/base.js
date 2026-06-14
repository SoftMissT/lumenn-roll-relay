export class SystemAdapter {
  detectRoll(_message) {
    return null;
  }

  isCritical(_rollData) {
    return false;
  }

  isFumble(_rollData) {
    return false;
  }

  extractMetadata(_rollData) {
    return {};
  }
}
