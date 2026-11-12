/** 字幕: [開始秒, 終了秒, 'a'=攻撃側 / 'd'=防御側 / ''=どちらでもない, 本文] */
export type Caption = [from: number, to: number, side: 'a' | 'd' | '', text: string]

export type Example = {
  /** ATT&CK の技術ID。同じ技術が複数の戦術に載っていることがあるので、戦術の中でだけ一意 */
  id: string
  /** 攻撃側の字幕 */
  attack: string
  /** 防御側の字幕（防御側の打ち手） */
  defense: string
  /** 場面の長さ（秒）。省略時は 7 秒 */
  duration?: number
  /** 字幕を細かく切り替えたいときだけ指定する。省略時は attack → defense の2本 */
  captions?: Caption[]
  /**
   * 専用の場面を持たず、戦術ごとの型の絵（簡易表示）で見せる技術に付ける。
   * 数字は絵の種類（0〜2）。意味は src/scene/scenes/simple.ts の各戦術のコメントを参照。
   * 省略した技術は、src/scene/scenes/ の、その戦術のファイルに、同じ技術IDの専用の場面が必要。
   */
  simple?: number
}

export type Tactic = { id: string; ja: string; en: string; examples: Example[] }
