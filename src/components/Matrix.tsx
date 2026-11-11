import { useEffect, useRef } from 'react'
import { MATRIX } from '../data/matrix'
import { TACTICS } from '../data/tactics'

type Props = {
  /** いま再生している戦術（TACTICS の添字、無ければ -1）と技術ID */
  tactic: number
  techniqueId?: string
  /** 技術の場面へ飛ぶ */
  onPick(techniqueId: string): void
}

/** ATT&CK マトリックス。動画のある技術はボタンになっていて、押すとその場面に飛ぶ */
export function Matrix({ tactic, techniqueId, onPick }: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  const cols = useRef<(HTMLDivElement | null)[]>([])

  // 再生中の戦術の列が見えるように、横に送る
  useEffect(() => {
    const box = wrap.current
    const col = cols.current[tactic]
    if (!box || !col) return
    box.scrollTo({
      left: Math.max(0, col.offsetLeft - (box.clientWidth - col.offsetWidth) / 2),
      behavior: 'smooth',
    })
  }, [tactic])

  return (
    <div className="mxwrap" ref={wrap}>
      <div className="matrix">
        {TACTICS.map((t, k) => (
          <div
            key={t.id}
            className={k === tactic ? 'col on' : 'col'}
            ref={(el) => {
              cols.current[k] = el
            }}
          >
            <button type="button" className="hd" onClick={() => onPick(t.examples[0].id)}>
              <span>{t.id}</span>
              {t.ja}
              <em>
                {t.en}（{MATRIX[k].length}）
              </em>
            </button>
            {MATRIX[k].map((tech) => {
              const j = t.examples.findIndex((e) => e.id === tech.id)
              if (j < 0)
                return (
                  <div key={tech.id} className="te">
                    <span>{tech.id}</span>
                    {tech.name}
                  </div>
                )
              const playing = k === tactic && tech.id === techniqueId
              return (
                <button
                  key={tech.id}
                  type="button"
                  className={`te ex${j === 0 ? ' main' : ''}${playing ? ' on' : ''}`}
                  title="この場面を再生"
                  onClick={() => onPick(tech.id)}
                >
                  <span>{tech.id}</span>
                  {tech.name}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
