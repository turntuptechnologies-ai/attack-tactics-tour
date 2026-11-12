# ATT&CK Tactics Tour

[![CI](https://github.com/turntuptechnologies-ai/attack-tactics-tour/actions/workflows/ci.yml/badge.svg)](https://github.com/turntuptechnologies-ai/attack-tactics-tour/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/turntuptechnologies-ai/attack-tactics-tour/actions/workflows/deploy.yml/badge.svg)](https://github.com/turntuptechnologies-ai/attack-tactics-tour/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://turntuptechnologies-ai.github.io/attack-tactics-tour/)

MITRE ATT&CK（Enterprise v20）の15の戦術と、マトリックスに載っているすべての技術（227種類、サブテクニックを除く）を、ボクセル調のアニメーションで見て回れる図解サイトです。

公開先: https://turntuptechnologies-ai.github.io/attack-tactics-tour/

- **本編**は、ひとつの侵入を偵察から影響まで追う約2分のループです（各戦術から技術を1つずつ）。
- **ほかの例**（76場面）は、同じ戦術を別の手口で進めた場合を、技術ごとに専用の場面で描いたものです。
- **簡易表示**（168場面）は、残りの技術です。絵は戦術ごとに共通の「型」（各3種類）で、技術ごとの違いは字幕の説明で伝えます。
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
    tactics.ts        戦術と、専用の場面で描く技術（字幕の文面もここ）
    more-techniques.ts  簡易表示で見せる残りの技術（説明文と、絵の種類）
    matrix.ts         ATT&CK マトリックスの技術一覧
    types.ts          データの型
  scene/
    world.ts          舞台と小道具（建物・人物・マルウェアなど、箱の組み合わせ）
    motion.ts         動きの計算（補間、跳ねて歩く経路、山なりの軌道）
    kit.ts            場面を書くための道具（置く・飛ばす・現れる、毎フレームの初期化）
    scenes/           戦術ごとの専用の場面（技術IDをキーにして並べる）と、
                      簡易表示の型（simple.ts。戦術ごとに1つ、絵の種類が3つ）
  player/
    timeline.ts       再生の順番（本編だけ／例も含める、# の直リンク）
    player.ts         再生機（時間を進めて描く、字幕の切り替えを画面に伝える）
  components/         画面の部品（舞台、マトリックス、一覧表）
  App.tsx             ページ全体
```

描画の考え方は一つだけです。毎フレーム、`kit.reset()` で舞台をまるごと初期状態に戻し、
いまの場面の `run(t)` が「時刻 t のときの状態」をゼロから組み立てます。
場面は前のフレームを引きずらないので、好きな時刻に飛んでも同じ絵になります。

## 技術の場面を直す・足す

マトリックスの技術はすべてデータに入っています（入っていないとテストが落ちます）。
技術ごとに、**専用の場面**で描くか、**簡易表示**（戦術ごとの型の絵）で見せるかを選びます。

### 簡易表示の説明文や絵の種類を直す

`src/data/more-techniques.ts` の該当する行を直します。

```ts
x('T1592', 0, '攻撃側の説明。', '防御側の打ち手。'),
//         ^ 絵の種類（0〜2）。意味は戦術ごとに違い、simple.ts の各戦術のコメントにある
```

### 簡易表示の技術を、専用の場面に格上げする

1. `src/data/more-techniques.ts` からその技術の行を消し、`src/data/tactics.ts` の該当する戦術の
   `examples` に、技術ID・攻撃側の字幕・防御側の字幕を足す。
   専用の場面は技術IDで引くので、専用の場面を持てるのは、ひとつの技術につき1つの戦術だけです。
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

新しい小道具が要るときは `world.ts` に足し、場面が動かした物は `kit.ts` の `reset()` で
必ず元に戻してください（戻し忘れは「舞台を同じ初期状態に戻す」のテストで見つかります）。

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
- 専用の場面で描くと決めた技術すべてに場面があること、型の場面がすべての戦術にそろっていること
- すべての場面が、最初から最後までエラーなく動くこと
- どの場面のあとでも、`reset()` で舞台が同じ初期状態に戻ること
- 再生の順番（本編だけをたどる、例も含める）と、`#` の直リンクの解釈

three.js は r128 に固定しています。新しい版は光と色の扱いが変わり、絵の見た目が変わるためです。
上げるときは、見た目を確認しながら行ってください。

## Deploy

`main` に push すると、GitHub Actions がビルドして GitHub Pages に公開します（`.github/workflows/deploy.yml`）。

## 帰属

© The MITRE Corporation. This work is reproduced and distributed with the permission of The MITRE Corporation.
MITRE ATT&CK® は The MITRE Corporation の登録商標です。本サイトは MITRE とは無関係の非公式な解説です。
