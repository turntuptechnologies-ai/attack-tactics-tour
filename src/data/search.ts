// 一覧表の絞り込み。画面に触れないので、ここだけで試験できる。
import type { Example, Tactic } from './types'

export type FoundTactic = {
  /** TACTICS の添字 */
  index: number
  tactic: Tactic
  /** 条件に合った技術。j は tactic.examples の中での添字（0 が本編） */
  examples: { example: Example; j: number }[]
}

/** 全角の英数字を半角にそろえ、大文字と小文字の違いを無くす */
const fold = (text: string) =>
  text.replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).toLowerCase()

/**
 * 語で技術を絞り込む。空白で区切った語を、すべて含むものだけを残す。
 * 見る場所は、戦術のIDと名前、技術の表示名（ID と英語名）、攻撃側の説明、防御側の打ち手。
 * 語が空なら、すべてを返す。合う技術がひとつも無い戦術は、結果に含めない。
 */
export function searchTechniques(
  tactics: Tactic[],
  query: string,
  titleOf: (tactic: number, techniqueId: string) => string,
): FoundTactic[] {
  const words = fold(query).split(/\s+/).filter(Boolean)
  return tactics
    .map((tactic, index) => ({
      index,
      tactic,
      examples: tactic.examples
        .map((example, j) => ({ example, j }))
        .filter(({ example }) => {
          if (!words.length) return true
          const text = fold(
            [
              tactic.id,
              tactic.ja,
              tactic.en,
              titleOf(index, example.id),
              example.attack,
              example.defense,
            ].join(' '),
          )
          return words.every((word) => text.includes(word))
        }),
    }))
    .filter((found) => found.examples.length > 0)
}
