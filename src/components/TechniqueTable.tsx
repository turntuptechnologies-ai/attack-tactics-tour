import { tacticUrl, techniqueUrl } from '../data/official'
import { TACTICS } from '../data/tactics'
import { techniqueTitle } from '../player/timeline'

/** 技術の公式ページへのリンク。別のタブで開く */
function OfficialLink({ id, label, className }: { id: string; label: string; className?: string }) {
  return (
    <a
      className={className}
      href={techniqueUrl(id)}
      target="_blank"
      rel="noopener noreferrer"
      title={`${id} の公式ページ（英語）を別のタブで開く`}
      aria-label={`${id} の公式ページ（英語、別のタブで開く）`}
    >
      {label}
      {/* 別のタブで開くしるし。記号の「↗」は書体によって出ないことがあるので、絵で描く */}
      <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true">
        <path d="M4 1H1v8h8V6M6 1h3v3M9 1 4.5 5.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    </a>
  )
}

/**
 * 戦術ごとに、動画で描いた技術と防御側の打ち手を並べた一覧表。原文をたどれるよう、公式ページへのリンクも出す。
 * リンクは、広い画面では右端の「公式」の列に、狭い画面では技術名のすぐ下に出す（出し分けは index.css）。
 * 狭い画面では表を横に送って読むので、右端の列だと送らないと見えないため。
 */
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
            <th className="src">公式</th>
          </tr>
        </thead>
        <tbody>
          {TACTICS.map((t, k) =>
            t.examples.map((e, j) => (
              <tr key={`${t.id}-${e.id}`}>
                {j === 0 && (
                  <>
                    <td className="tid" rowSpan={t.examples.length}>
                      <a
                        href={tacticUrl(t.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`${t.id} の公式ページ（英語）を別のタブで開く`}
                      >
                        {t.id}
                      </a>
                    </td>
                    <td rowSpan={t.examples.length}>
                      {t.ja}
                      <small>{t.en}</small>
                    </td>
                  </>
                )}
                <td>
                  <button type="button" className={j === 0 ? 'lk main' : 'lk'} onClick={() => onPick(k, e.id)}>
                    {techniqueTitle(k, e.id)}
                  </button>
                  <OfficialLink id={e.id} label="公式ページ" className="src-inline" />
                </td>
                <td>{e.defense}</td>
                <td className="src">
                  <OfficialLink id={e.id} label={e.id} />
                </td>
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
  )
}
