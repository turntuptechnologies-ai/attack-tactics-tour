// すべての場面を集める。技術の場面は「戦術ID → 技術ID」の順に引く。
// 同じ技術が複数の戦術に載っていることがあり、戦術ごとに別の場面を持てるようにするため。
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

export function createScenes(kit: Kit) {
  /** 戦術ID → その戦術の場面（技術ID → 場面） */
  const byTactic: Record<string, SceneMap> = {
    TA0043: reconnaissance(kit),
    TA0042: resourceDevelopment(kit),
    TA0001: initialAccess(kit),
    TA0002: execution(kit),
    TA0003: persistence(kit),
    TA0004: privilegeEscalation(kit),
    TA0005: stealth(kit),
    TA0112: defenseImpairment(kit),
    TA0006: credentialAccess(kit),
    TA0007: discovery(kit),
    TA0008: lateralMovement(kit),
    TA0009: collection(kit),
    TA0011: commandAndControl(kit),
    TA0010: exfiltration(kit),
    TA0040: impact(kit),
  }
  /** その戦術の、その技術の場面（無ければ undefined） */
  const technique = (tacticId: string, techniqueId: string): SceneDef | undefined =>
    byTactic[tacticId]?.[techniqueId]
  return { ...bookends(kit), byTactic, technique }
}

export type Scenes = ReturnType<typeof createScenes>
