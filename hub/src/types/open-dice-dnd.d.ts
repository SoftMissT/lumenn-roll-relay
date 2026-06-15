declare module "open-dice-dnd" {
  interface DiceConfig {
    dice: string
    diceColor: number
    textColor: string
    backgroundColor: string
  }

  interface DiceRollerOptions {
    container: HTMLElement
    onRollComplete?: (total: number) => void
  }

  class DiceRoller {
    constructor(options: DiceRollerOptions)
    roll(configs: DiceConfig[]): void
    destroy(): void
  }

  export { DiceRoller, type DiceConfig, type DiceRollerOptions }
}
