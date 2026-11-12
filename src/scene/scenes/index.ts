// すべての場面を集める。技術の場面は「戦術ID → 技術ID」の順に引く。
// 同じ技術が複数の戦術に載っていることがあり、戦術ごとに別の場面を持てるようにするため。
import { DEFENSE_AT } from '../../player/timeline'
import type { Kit } from '../kit'
import { bookends } from './bookends'
import initialAccess from './ta0001-initial-access'
import execution from './ta0002-execution'
import persistence from './ta0003-persistence'
import privilegeEscalation from './ta0004-privilege-escalation'
import stealth from './ta0005-stealth'
import credentialAccess from './ta0006-credential-access'
import discovery from './ta0007-discovery'
import lateralMovement from './ta0008-lateral-movement'
import collection from './ta0009-collection'
import exfiltration from './ta0010-exfiltration'
import commandAndControl from './ta0011-command-and-control'
import impact from './ta0040-impact'
import resourceDevelopment from './ta0042-resource-development'
import reconnaissance from './ta0043-reconnaissance'
import defenseImpairment from './ta0112-defense-impairment'
import type { SceneDef, SceneMap } from './types'

/** 成功の合図（ドクロ）を見せておく最短の時間（秒） */
const SUCCESS_SHOWN = 0.8
/** 成功の時刻の上限。これより遅い場面は、下の withVisibleSuccess で早める */
export const LATEST_SUCCESS = DEFENSE_AT - SUCCESS_SHOWN

/**
 * 成功の合図は、攻撃側の番（DEFENSE_AT まで）の間だけ出る。成功が遅い場面では、合図が一瞬で消えてしまう。
 * そういう場面は、成功までを少し早回しにし（最大で 2 割弱）、成功から番の替わり目までを引き延ばして、
 * 合図が SUCCESS_SHOWN 秒は見えるようにする。場面のコードは、自分の時刻のまま書いてよい。
 */
function withVisibleSuccess(def: SceneDef): SceneDef {
  const hit = def.hits[0]
  if (def.hits.length !== 1 || hit <= LATEST_SUCCESS || hit >= DEFENSE_AT) return def
  const sceneTime = (t: number) =>
    t <= LATEST_SUCCESS
      ? (t * hit) / LATEST_SUCCESS
      : t < DEFENSE_AT
        ? hit + ((t - LATEST_SUCCESS) * (DEFENSE_AT - hit)) / SUCCESS_SHOWN
        : t
  return { hits: [LATEST_SUCCESS], run: (t) => def.run(sceneTime(t)) }
}

const adjust = (map: SceneMap): SceneMap =>
  Object.fromEntries(Object.entries(map).map(([id, def]) => [id, withVisibleSuccess(def)]))

export function createScenes(kit: Kit) {
  /** 戦術ID → その戦術の場面（技術ID → 場面） */
  const byTactic: Record<string, SceneMap> = {
    TA0043: adjust(reconnaissance(kit)),
    TA0042: adjust(resourceDevelopment(kit)),
    TA0001: adjust(initialAccess(kit)),
    TA0002: adjust(execution(kit)),
    TA0003: adjust(persistence(kit)),
    TA0004: adjust(privilegeEscalation(kit)),
    TA0005: adjust(stealth(kit)),
    TA0112: adjust(defenseImpairment(kit)),
    TA0006: adjust(credentialAccess(kit)),
    TA0007: adjust(discovery(kit)),
    TA0008: adjust(lateralMovement(kit)),
    TA0009: adjust(collection(kit)),
    TA0011: adjust(commandAndControl(kit)),
    TA0010: adjust(exfiltration(kit)),
    TA0040: adjust(impact(kit)),
  }
  /** その戦術の、その技術の場面（無ければ undefined） */
  const technique = (tacticId: string, techniqueId: string): SceneDef | undefined =>
    byTactic[tacticId]?.[techniqueId]
  return { ...bookends(kit), byTactic, technique }
}

export type Scenes = ReturnType<typeof createScenes>
