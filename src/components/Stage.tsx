import { useEffect, useRef } from 'react'
import { TACTICS } from '../data/tactics'
import { Player, type NowPlaying, type PlayerHooks } from '../player/player'

const LABEL: Partial<Record<NowPlaying['scene']['kind'], string>> = {
  extra: 'ほかの例　',
}

type Props = {
  now: NowPlaying | null
  /** 再生機ができたとき（片付けるときは null） */
  onPlayer(player: Player | null): void
  onChange: PlayerHooks['onChange']
  onPlaying: PlayerHooks['onPlaying']
  /** 3D を表示できないとき */
  onError(message: string): void
}

/** アニメーションの舞台。3D の画面と、その上に重ねる場面名・番の表示・ラベル */
export function Stage({ now, onPlayer, onChange, onPlaying, onError }: Props) {
  const stage = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const attacker = useRef<HTMLDivElement>(null)
  const defender = useRef<HTMLDivElement>(null)
  const malware = useRef<HTMLDivElement>(null)
  const fade = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let player: Player
    try {
      player = new Player(
        canvas.current!,
        {
          stage: stage.current!,
          attacker: attacker.current!,
          defender: defender.current!,
          malware: malware.current!,
          fade: fade.current!,
        },
        { onChange, onPlaying },
      )
    } catch {
      onError('この環境ではWebGLが使えないため、アニメーションを表示できません。')
      return
    }
    player.start()
    onPlayer(player)
    return () => {
      onPlayer(null)
      player.dispose()
    }
  }, [onPlayer, onChange, onPlaying, onError])

  const side = now?.caption[2] ?? ''
  const tactic = now && now.scene.tactic >= 0 ? TACTICS[now.scene.tactic] : null
  const current = now?.scene.tactic ?? -1
  // まとめの場面では、全部の戦術を「済み」にする
  const done = now?.scene.kind === 'outro' ? TACTICS.length : current

  // 場面名とターンの表示（hud）は、広い画面では舞台の上に重ね、狭い画面では舞台のすぐ上に出す。
  // 狭い画面で重ねると、舞台が小さいぶん文字どうしが被り、アニメーションも隠れるため。
  return (
    <div className="theater">
      <div className="hud">
        <div className="chips">
          <div className="scene">
            {tactic ? (
              <>
                <b>{tactic.id}</b>
                {tactic.ja}
                <small>{tactic.en}</small>
              </>
            ) : (
              'MITRE ATT&CK'
            )}
          </div>
          {tactic && now?.scene.title && (
            <div className="tech">
              {LABEL[now.scene.kind] ?? '技術の例　'}
              {now.scene.title}
            </div>
          )}
        </div>
        {side && <div className={`turn ${side}`}>{side === 'a' ? '攻撃側のターン' : '防御側のターン'}</div>}
      </div>
      <div className={`stage ${side}`} ref={stage}>
        <canvas
          ref={canvas}
          aria-label="ボクセル調のアニメーション。攻撃者が偵察から影響まで、ATT&CKの15の戦術を順に進め、防御側が各段階で対抗する。"
        />
        <div className="tagl a" ref={attacker}>
          攻撃側
        </div>
        <div className="tagl d" ref={defender}>
          防御側
        </div>
        <div className="tagl a" ref={malware} hidden>
          マルウェア
        </div>
        <div className="strip">
          {TACTICS.map((t, i) => (
            <i key={t.id} className={i === current ? 'on' : i < done ? 'done' : ''} />
          ))}
        </div>
        {/* 番が替わったことを、舞台の縁の色と、中央に一瞬出る札で知らせる。key を変えて、替わるたびに動きをやり直す */}
        {now && side && <div key={`rim-${now.index}-${side}`} className={`rim ${side}`} />}
        {now && side === 'd' && (
          <div key={`flash-${now.index}`} className="turnflash" aria-hidden="true">
            防御側のターン
          </div>
        )}
        <div className="fade" ref={fade} />
        {/* 次の場面に入る前の「間」に、暗転の上へ出す名前。出し入れは再生機が .stage の lead で切り替える */}
        <div className="card" aria-hidden="true">
          {tactic && now?.scene.title && (
            <>
              <span>
                <b>{tactic.id}</b>
                {tactic.ja}
              </span>
              <strong>{now.scene.title}</strong>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
