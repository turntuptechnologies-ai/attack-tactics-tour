// MITRE ATT&CK 公式サイトの、戦術・技術のページの場所。
// 字幕や一覧表の文面は公式ページをもとにした要約なので、原文をたどれるようにリンクを出す。
const BASE = 'https://attack.mitre.org'

/** 戦術の公式ページ（例: TA0001） */
export const tacticUrl = (tacticId: string) => `${BASE}/tactics/${tacticId}/`

/** 攻撃グループの公式ページ（例: G0007） */
export const groupUrl = (groupId: string) => `${BASE}/groups/${groupId}/`

/** 技術の公式ページ（例: T1190）。緩和策（Mitigations）と検知（Detection）もここに載っている */
export const techniqueUrl = (techniqueId: string) => `${BASE}/techniques/${techniqueId}/`
