/** 字幕: [開始秒, 終了秒, 'a'=攻撃側 / 'd'=防御側 / ''=どちらでもない, 本文] */
export type Caption = [from: number, to: number, side: 'a' | 'd' | '', text: string]

export type Example = {
  /**
   * ATT&CK の技術ID。同じ技術が複数の戦術に載っていることがあるので、戦術の中でだけ一意。
   * src/scene/scenes/ の、その戦術のファイルに、同じ技術IDの場面が必要。
   */
  id: string
  /** 攻撃側の字幕 */
  attack: string
  /** 防御側の字幕（防御側の打ち手） */
  defense: string
  /** 場面の長さ（秒）。省略時は 7 秒 */
  duration?: number
  /** 字幕を細かく切り替えたいときだけ指定する。省略時は attack → defense の2本 */
  captions?: Caption[]
}

export type Tactic = { id: string; ja: string; en: string; examples: Example[] }
