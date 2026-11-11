# ATT&CK 戦術めぐり

ひとつの侵入を例に、MITRE ATT&CK（Enterprise v20）の15の戦術を順にたどる、ボクセル調アニメーションの図解サイトです。

マトリックスの赤枠の技術（46個）を押すと、その場面に飛べます。URL の末尾に技術IDを付けると、その場面から開きます（例: `…/attack-tactics-tour/#T1190`）。

公開先: https://turntuptechnologies-ai.github.io/attack-tactics-tour/

## 構成

- `index.html` — サイト本体（HTML / CSS / JavaScript を1ファイルに収録）
- 外部読み込みは three.js r128（cdnjs、SRI 付き）と Google Fonts のみ
- ビルド不要。GitHub Pages が `gh-pages` ブランチのルートをそのまま配信します

## ローカルで確認

```sh
python3 -m http.server 8000
# http://localhost:8000/ を開く
```

## 帰属

© The MITRE Corporation. This work is reproduced and distributed with the permission of The MITRE Corporation.
MITRE ATT&CK® は The MITRE Corporation の登録商標です。本サイトは MITRE とは無関係の非公式な解説です。
