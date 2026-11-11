// すべての場面を集める。技術の場面は ATT&CK の技術ID をキーにして引く。
import type { Kit } from '../kit'
import { bookends } from './bookends'
import { createSimpleScenes } from './simple'
import reconnaissance from './ta0043-reconnaissance'
import resourceDevelopment from './ta0042-resource-development'
import initialAccess from './ta0001-initial-access'
import execution from './ta0002-execution'
import persistence from './ta0003-persistence'
import privilegeEscalation from './ta0004-privilege-escalation'
import stealth from './ta0005-stealth'
import defenseImpairment from './ta0112-defense-impairment'
import credentialAccess from './ta0006-credential-access'
import discovery from './ta0007-discovery'
import lateralMovement from './ta0008-lateral-movement'
import collection from './ta0009-collection'
import commandAndControl from './ta0011-command-and-control'
import exfiltration from './ta0010-exfiltration'
import impact from './ta0040-impact'
import type { SceneMap } from './types'

export function createScenes(kit: Kit) {
  const techniques: SceneMap = {
    ...reconnaissance(kit),
    ...resourceDevelopment(kit),
    ...initialAccess(kit),
    ...execution(kit),
    ...persistence(kit),
    ...privilegeEscalation(kit),
    ...stealth(kit),
    ...defenseImpairment(kit),
    ...credentialAccess(kit),
    ...discovery(kit),
    ...lateralMovement(kit),
    ...collection(kit),
    ...commandAndControl(kit),
    ...exfiltration(kit),
    ...impact(kit),
  }
  return { ...bookends(kit), techniques, simple: createSimpleScenes(kit) }
}

export type Scenes = ReturnType<typeof createScenes>
