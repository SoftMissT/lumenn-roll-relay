declare module 'open-dice-dnd' {
  export interface DiceRollerOptions {
    container: HTMLElement
    width?: number
    height?: number
    throwSpeed?: number
    throwSpin?: number
    onRollComplete?: (total: number, result?: any) => void
    onBatchSettled?: (batch?: any, result?: any, roller?: any) => void
    sounds?: string[]
    soundVolume?: number
    effects?: any[]
  }

  export interface DiceConfig {
    dice: string
    rolled?: number
    color?: string
    foreground?: string
    background?: string
  }

  export class DiceRoller {
    constructor(options: DiceRollerOptions)
    roll(diceConfig: DiceConfig[]): Promise<number>
    addDice(diceConfig: DiceConfig[]): Promise<{ total: number; variances: any; results: any }>
    reset(): Promise<void>
    getCurrentResults(): { total: number; variances: any; results: any }
    destroy(): void
  }
}