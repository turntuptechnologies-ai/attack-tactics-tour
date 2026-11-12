import { TACTICS } from '../data/tactics'
import { techniqueTitle } from '../player/timeline'

/** 戦術ごとに、動画で描いた技術と防御側の打ち手を並べた一覧表 */
export function TechniqueTable({ onPick }: { onPick(tactic: number, techniqueId: string): void }) {
  return (
    <div className="tw">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>戦術</th>
            <th>技術（押すと再生）</th>
            <th>防御側の打ち手</th>
          </tr>
        </thead>
        <tbody>
          {TACTICS.map((t, k) =>
            t.examples.map((e, j) => (
              <tr key={`${t.id}-${e.id}`}>
                {j === 0 && (
                  <>
                    <td className="tid" rowSpan={t.examples.length}>
                      {t.id}
                    </td>
                    <td rowSpan={t.examples.length}>
                      {t.ja}
                      <small>{t.en}</small>
                    </td>
                  </>
                )}
                <td>
                  <button
                    type="button"
                    className={j === 0 ? 'lk main' : 'lk'}
                    onClick={() => onPick(k, e.id)}
                  >
                    {techniqueTitle(k, e.id)}
                  </button>
                </td>
                <td>{e.defense}</td>
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
  )
}
