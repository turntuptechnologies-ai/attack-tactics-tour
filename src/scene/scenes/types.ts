/** ひとつの場面 */
export type SceneDef = {
  /** 攻撃が成功する時刻（秒）。攻撃側の字幕が出ているあいだ、この時刻から赤いドクロを出す */
  hits: number[]
  /** 時刻 t（場面の先頭からの秒）の状態を作る。毎フレーム、全部が初期状態に戻された直後に呼ばれる */
  run(t: number): void
}

/** 技術ID → 場面 */
export type SceneMap = Record<string, SceneDef>
