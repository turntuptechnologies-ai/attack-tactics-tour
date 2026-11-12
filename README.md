# ATT&CK Tactics Tour

[![CI](https://github.com/turntuptechnologies-ai/attack-tactics-tour/actions/workflows/ci.yml/badge.svg)](https://github.com/turntuptechnologies-ai/attack-tactics-tour/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/turntuptechnologies-ai/attack-tactics-tour/actions/workflows/deploy.yml/badge.svg)](https://github.com/turntuptechnologies-ai/attack-tactics-tour/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://turntuptechnologies-ai.github.io/attack-tactics-tour/)

MITRE ATT&CK（Enterprise v20）の15の戦術と、マトリックスに載っているすべての技術（227種類、サブテクニックを除く）を、ボクセル調のアニメーションで見て回れる図解サイトです。

公開先: https://turntuptechnologies-ai.github.io/attack-tactics-tour/

- **本編**は、ひとつの侵入を偵察から影響まで追う約2分15秒のループです（各戦術から技術を1つずつ）。
- **ほかの例**（244場面）は、同じ戦術を別の手口で進めた場合を、技術ごとに専用の場面で描いたものです。
  本編と合わせて、マトリックスの259マスすべてに専用の場面があります。
- マトリックスの技術を押すと、その場面に飛べます。URL の末尾に技術IDを付けると、その場面から開きます（例: `…/attack-tactics-tour/#T1190`）。
  同じ技術が複数の戦術に載っている場合は、`#TA0003-T1078` のように戦術IDを前に付けると、その戦術での場面が開きます。

## Stack

- [Vite](https://vite.dev/) + [React](https://react.dev/) + TypeScript
- [three.js](https://threejs.org/) r128（3D の描画）
- [Vitest](https://vitest.dev/)（テスト）、[oxlint](https://oxc.rs/docs/guide/usage/linter)（lint）
- フォントは [Fontsource](https://fontsource.org/) で同梱（DotGothic16 / Press Start 2P / Zen Kaku Gothic New）。外部への読み込みはありません

## Quick start

```sh
npm install
npm run dev      # 開発サーバー（http://localhost:5173/attack-tactics-tour/）
```

## Layout

```
src/
  data/
    tactics.ts        戦術と技術（字幕の文面もここ）
    matrix.ts         ATT&CK マトリックスの技術一覧
    types.ts          データの型
  scene/
    world.ts          舞台と小道具（建物・人物・マルウェアなど、箱の組み合わせ）
    motion.ts         動きの計算（補間、跳ねて歩く経路、山なりの軌道）
    kit.ts            場面を書くための道具（置く・飛ばす・現れる、毎フレームの初期化）
    scenes/           戦術ごとの場面（技術IDをキーにして並べる）
  player/
    timeline.ts       再生の順番（本編だけ／例も含める、# の直リンク）
    player.ts         再生機（時間を進めて描く、字幕の切り替えを画面に伝える）
  components/         画面の部品（舞台、マトリックス、一覧表）
  App.tsx             ページ全体
  og.ts               OGP 画像の元になる絵（og.html から読み込む。公開はされない）
```

`scripts/attack-diff.mjs` は、公式データと手元のマトリックスを比べる道具です（下の「ATT&CK の版が上がったとき」）。

描画の考え方は一つだけです。毎フレーム、`kit.reset()` で舞台をまるごと初期状態に戻し、
いまの場面の `run(t)` が「時刻 t のときの状態」をゼロから組み立てます。
場面は前のフレームを引きずらないので、好きな時刻に飛んでも同じ絵になります。

## 技術の場面を直す・足す

マトリックスの技術はすべてデータに入っていて（入っていないとテストが落ちます）、どの技術にも専用の場面があります。

### 字幕を直す

`src/data/tactics.ts` の該当する技術の、攻撃側・防御側の文面を直します。

### ATT&CK の版が上がったとき

まず、公式データ（STIX）と手元のマトリックスの違いを一覧にして、作業量を見ます。

```sh
npm run attack:diff                                # 最新の公式データと比べる
npm run attack:diff -- --mitigations T1190 T1566   # その技術の、公式の緩和策を見る
```

増えた技術・消えた技術・名前が変わった技術・戦術の増減が、戦術ごとに出ます。違いが無ければ、そう表示して終わります。
増えた技術には、公式の緩和策の名前も付きます（防御側の字幕を書くときの手がかりになります）。

- **増えた技術**: 下の「技術を足す」の手順で、データと場面を足します。場面を書くまで、テストは落ちます。
- **消えた技術**: `matrix.ts`・`tactics.ts`・場面のファイルから、その技術を消します。
- **名前が変わった技術**: `matrix.ts` の名前を直します。
- 終わったら、`matrix.ts` の先頭のコメントと、画面・README の版の表記（v20）を直します。

ネットワークを使うので、CI では動かしていません。

### 技術を足す

1. `src/data/matrix.ts` に技術を足し、`src/data/tactics.ts` の該当する戦術の `examples` に、
   技術ID・攻撃側の字幕・防御側の字幕を足す。
   専用の場面は「戦術＋技術」で引くので、同じ技術が複数の戦術に載っていても、戦術ごとに別の場面を持てます。
2. `src/scene/scenes/` の該当する戦術のファイルに、同じ技術IDで場面を足す。

   ```ts
   T1234: {
     hits: [3.2],            // 攻撃が成功する時刻（秒）。ここで赤いドクロが出る
     run(t) {
       view.target = [1.5, 3.8] // カメラが見る地点 [x, z]
       view.height = 10         // 画面に収める高さ（小さいほど寄る）
       storyState(3)            // 本編でその戦術に入った時点の状況から始める
       // 0〜4.6 秒が攻撃側、4.6〜7 秒が防御側の番
     },
   },
   ```

3. `npm run test` を通す。データと場面の対応が取れていないと、ここで落ちます。

防御側の番（4.6 秒から）の絵は、防御側の字幕が言っていることを、その場面でねらわれている物に対して描きます。
よく使う形は `kit.ts` にあります。相手は、座標でも、舞台の物そのもの（`trustedProcess` など）でも渡せます。

| 関数 | 絵 | 字幕の言い方の例 |
|---|---|---|
| `defenderNotices(t, 相手)` | 防御者が気づいて（「！」）、相手へ目を向ける | 検知する |
| `defenderSendsSensor(t, 相手)` | 見張りが相手の真上まで来て、下を照らす | 振る舞いを監視する |
| `defenderScans(t, 端, 端)` | 水色の光の板が、相手の上を走る | 点検する、監査する、検証する |
| `defenderCollectsLogs(t, 相手)` | 相手の所から、記録の紙が防御者の手もとへ飛ぶ | 記録する、照会を監視する |
| `defenderLocks(t, 相手)` | 相手に錠が降りてくる | 権限を絞る、書き込めなくする、守る |
| `defenderBlocks(t, 相手)` | 気づいたうえで、相手の上に × を出す | 制限する、遮断する |
| `defenderCutsLink(t, 端, 端)` | 2 つの場所を結ぶ道のまん中に × を出す | 通信を断つ、つながりを減らす |
| `defenderRemoves(t, 物)` | 物が × とともに消える | 取り除く、無効にする、閉じる |
| `defenderApproves(t, 相手)` | 相手の上に緑のチェックが出る | 更新する、守りの機能を有効にする |
| `defenderWarnsStaff(t, 従業員の番号)` | 従業員が気づき、確かめてから進める | 訓練する、別の経路で確かめる |
| `defenderHardens(t)` | 入口に守りの盾が降りてくる | 備えを固める（攻撃側の動きが見えない段階） |
| `defenderHidesExposure(t)` | 外壁に出ている物が小さくなる | 公開する情報を絞る |
| `defenderWatchesOutside(t, 相手)` | 外の相手へ目を向け、分かったことを手もとに集める | 脅威情報で監視する |

間合いについて、決まりが 2 つあります（どちらもテストで確かめます）。

- **成功の合図は、3.8 秒までに出す。** 合図（ドクロ）は攻撃側の番の間だけ出るので、遅いと一瞬で消えます。
  `hits` がこれより遅い場面は、成功までが自動で少し早回しになります（`scenes/index.ts` の `withVisibleSuccess`）。
- **防御側の番（4.6 秒から）には、絵のどこかを変える。** 字幕だけが防御の話をしている場面を作らないためです。
  場面に固有の防御の絵を描くか、上の表から、防御側の字幕の中身に合うものを選んでください。

よく使う見せ方は、`kit.ts` に関数としてまとめてあります。場面の中に同じ計算を書き写さず、これを使ってください。

| 関数 | 見せ方 |
|---|---|
| `showSparks` | コードが動いているしるし（らせんを描いて上がるピンクの粒） |
| `showRipples` | 床に広がる波紋（起動の合図、まわりを調べる、など） |
| `flyPaper` | 紙を、ぽんと出して山なりに飛ばす |
| `flowAlong` | ピンクの粒を、折れ線に沿って流す（通信が流れている様子） |
| `aroundHost` | 侵入した端末を中心にした円の上の点（集めた鍵をまわりに回す） |
| `probeFromHost` / `takeNote` | 探索: マルウェアから調べる線を伸ばす／分かったことを紙にして持ち帰る |
| `sensorVisits` | ステルス: 見張りが調べに来て、何も見つけずに戻る |
| `wipeThenReturn` | 永続化: 見張りに消されても、残した仕掛けから戻ってくる |

新しい小道具が要るときは `world.ts` に足し、場面が動かした物は `kit.ts` の `reset()` で
必ず元に戻してください（戻し忘れは「舞台を同じ初期状態に戻す」のテストで見つかります）。

事務室の中で、正門や手前の壁に近い場所（床なら z が 3.9 より大きい所、立っている人でも 5 より大きい所）は、
カメラから見て壁や正門のアーチの陰になります。小道具や人はそれより奥に置いてください。
防御者のふだんの立ち位置（`DEFENDER_SPOT`）は、陰にならない事務室の右奥です。

場面を作るときは、URL に `#T1234-t32` のように `-t` を付けると、3.2 秒の位置で止めた状態で開けます。

## Development

```sh
npm run build    # 型チェック + 本番ビルド（dist/）
npm run lint     # oxlint
npm run test     # Vitest
npm run preview  # ビルド結果の確認
```

テストは、次のことを確かめます。

- マトリックスのすべての技術がデータに入っていること（網羅）
- データにあるすべての技術に場面があること、データに無い技術の場面が残っていないこと
- すべての場面が、最初から最後までエラーなく動くこと
- どの場面のあとでも、`reset()` で舞台が同じ初期状態に戻ること
- 再生の順番（本編だけをたどる、例も含める）と、`#` の直リンクの解釈

three.js は r128 に固定しています。新しい版は光と色の扱いが変わり、絵の見た目が変わるためです。
上げるときは、見た目を確認しながら行ってください。

## OGP 画像

SNS などにリンクを貼ったときに出る画像は `public/og.jpg`（1200×630）です。`index.html` の `og:image` が指しています。

画像は、サイトと同じ舞台と書体で描いた `og.html`（中身は `src/og.ts`）を、そのまま画像にしたものです。
`og.html` は開発用のページで、公開はされません（ビルドの対象は `index.html` だけです）。

舞台の見た目やタイトルを変えたときは、次の手順で作り直します。

1. `npm run dev` で開発サーバーを立て、`http://localhost:5173/attack-tactics-tour/og.html` を開く。
2. ブラウザの開発者ツールで、`#og` の要素（1200×630）をスクリーンショットにする
   （Chrome なら、要素を選んで「ノードのスクリーンショットをキャプチャ」）。
3. JPEG にして `public/og.jpg` に置く。

絵にする場面や時刻、文言は `src/og.ts` の先頭で変えられます。

## Deploy

`main` に push すると、GitHub Actions がビルドして GitHub Pages に公開します（`.github/workflows/deploy.yml`）。

## 帰属

© The MITRE Corporation. This work is reproduced and distributed with the permission of The MITRE Corporation.
MITRE ATT&CK® は The MITRE Corporation の登録商標です。本サイトは MITRE とは無関係の非公式な解説です。
