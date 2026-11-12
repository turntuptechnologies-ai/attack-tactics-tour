import { useMemo, useState } from 'react'
import { tacticUrl, techniqueUrl } from '../data/official'
import { searchTechniques } from '../data/search'
import { TACTICS } from '../data/tactics'
import { techniqueTitle } from '../player/timeline'

const TOTAL = TACTICS.reduce((n, t) => n + t.examples.length, 0)

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
 * 行が多いので、上の入力欄で絞り込める（絞り込みの決まりは data/search.ts）。
 */
export function TechniqueTable({ onPick }: { onPick(tactic: number, techniqueId: string): void }) {
  const [query, setQuery] = useState('')
  const found = useMemo(() => searchTechniques(TACTICS, query, techniqueTitle), [query])
  const shown = found.reduce((n, f) => n + f.examples.length, 0)

  return (
    <>
      <div className="find">
        <label htmlFor="find">一覧を絞り込む</label>
        <input
          id="find"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="例: T1053、phishing、多要素"
          autoComplete="off"
          spellCheck={false}
          aria-describedby="find-count"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')}>
            消す
          </button>
        )}
        <span id="find-count" className="find-count" role="status">
          {query.trim() ? `${TOTAL}件中 ${shown}件` : `${TOTAL}件`}
        </span>
      </div>
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
            {found.map(({ index: k, tactic: t, examples }) =>
              examples.map(({ example: e, j }, row) => (
                <tr key={`${t.id}-${e.id}`}>
                  {row === 0 && (
                    <>
                      <td className="tid" rowSpan={examples.length}>
                        <a
                          href={tacticUrl(t.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`${t.id} の公式ページ（英語）を別のタブで開く`}
                        >
                          {t.id}
                        </a>
                      </td>
                      <td rowSpan={examples.length}>
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
            {shown === 0 && (
              <tr>
                <td colSpan={5} className="none">
                  合う技術がありません。技術のID（T1053）、英語の名前の一部、防御側の打ち手の言葉で探せます。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
