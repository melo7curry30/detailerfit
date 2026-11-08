# DET-57 — Homepage integration review

検証日: 2026-11-08 JST。**実装・ローカル検証済み／未公開／PR未作成。公開承認ではありません。**

## 対象と実装

- Repository: https://github.com/melo7curry30/detailerfit
- Linear: https://linear.app/detailerfit/issue/DET-57/homepage-ux-refresh-finder-first-mobile-first-conversion-path
- Integration base: `6ec4c63a49f2763036eff223ecc2b061f6decb0b`（DET-54修正を含むmain）。2026-11-08の再取得でも同じSHA。
- Local branch: `det-57-finder-first-integrated-20261108`。
- 本番用の変更: `index.html`、`home.css`、`assets/brand/detailerfit-hero-car.webp`。追加: 回帰チェック `tools/check-det57.py` と本記録。
- `home.js`、`app.js`、Finder、比較・料金ロジック、全レビュー、共通スタイル・ナビゲーションスクリプト、分析スキーマ、ブリッジ・ワークフローは基準SHAと同一。
- 既存のV3デザイン案を実際のリポジトリへ統合し、H1の復元、CTAの優先順位、可読性、比較データとの接続、スマホ表示を調整。単体のイメージ用モックではなく、既存のスクリプト・ページを使う実装。

## 経営判断と改善前後

目的はFinder利用から適切な比較・送客へ進む障壁を下げること。デザインの好みやクリック増だけを成功とは扱わない。

| 項目 | 改善前の観察 | 実装した変更・狙い |
| --- | --- | --- |
| ファーストビュー | Finder CTAは既に存在するが、結果を得るための入力負担が不明。右側の濃い業務別パネルも強く目立つ | 「3問」「チーム・仕事量・予算」「プラン料金と注意点」を具体化。Finderを主CTA、一覧と無料診断は副導線に |
| 視覚的な階層 | グリーンの強いパネルと複数の導線が並ぶ | 白・黒・グレー、余白と大きいタイポグラフィ。小容量のシルバー車画像を装飾として使用 |
| スマホCTA | 375px幅で200.4×50px、上端344.9px | 内容幅いっぱいの316×52px、上端327.5px。スクロールなしで操作可能 |
| 業務別選択 | ヒーロー内の3ショートカットと一覧の4フィルターが重複 | JS動作時は一覧フィルターに集約。JSなしでは3ショートカットを残す |
| 製品カード | 注意点がdetails内にあり、開くまで読めない | 6製品それぞれの既存の注意点を「Consider」として常時表示。料金・適性・制約・レビュー・送客先を順に読める配置 |
| 比較 | 2〜3製品選択、フィルター間の選択保持は既存機能 | 選択チップ、選択状態、説明、比較トレイを見やすく調整。ロジックは維持 |
| 信頼・中立性 | 既存の開示・研究方針がある | 方法論と開示を上部にも配置。6製品A–Z、価格確認日、非提携製品も含む構成を維持 |
| SEO | 既存の検索用情報・内部導線 | title・H1・meta・canonical・JSON-LD・既存リンク先を保持 |

価格の再調査は本タスクの実施範囲外。既存の確認日（Oct 23, 2026）を表示し、今回価格を再検証したようには見せていない。車画像は装飾のため空altとaria-hidden、寸法を指定。

## PC・スマホ検証

本番ホームを改善前として閲覧し、実装版をローカルHTTPで検証。Chromium内のiframeを各CSS幅に固定したレスポンシブ確認であり、実機iPhone/Safari・モバイルUAの確認ではない。1440pxの画像は画面に収めるため5/6倍で撮影。スクロールバーの15pxを除いたコンテンツ幅とscrollWidthを比較した。

| 実装版の幅 | コンテンツ幅 / scrollWidth | 横はみ出し | Finder CTA 上端 / 高さ |
| --- | --- | --- | --- |
| 320px | 305 / 305px | なし | 388.5 / 52px |
| 375px | 360 / 360px | なし | 327.5 / 52px |
| 768px | 753 / 753px | なし | 409.3 / 58px |
| 1440px | 1425 / 1425px | なし | 489.1 / 58px |

改善前の375px・1440pxでも横はみ出しはなかった。これは新たに解消した不具合ではなく、維持できた特性。

実際のブラウザー操作で確認した内容:

- スマホMenuの開閉、Escapeで閉じる操作。業務フィルター: Simple bookings 2件、Solo operators 4件、Growing teams 3件、All workflows 6件。
- 1製品では比較ボタン無効、2〜3製品で比較、4製品目の追加を防止、フィルター変更時の選択保持、個別削除・全解除。
- 375pxでHousecall Pro・ServiceLink・Zenbookerの3製品比較、1440pxでJobber・Urableの2製品比較。注意点を含む5項目が表示される。
- 6製品すべての「Read review」から実レビューへ遷移。各ページ固有のH1を確認。
- Finder CTA → Solo / 1–25 jobs / Up to $50 → QuoteIQ $29.99、DetailPilot $29、Mobile Tech RX $39。予算制約と推薦理由を確認し、ブラウザーの戻る操作でホームへ戻れる。
- 料金CTA → 実際の料金計算ページ → 1人 / 25件で結果表示。最低既知料金としてServiceM8 Freeが表示される（前回継続セッションで実施）。
- 製品detailsの開閉、PCでEnterキーによる展開。新しいホームのフォーカス表示、既存のreduced-motion/forced-colorsルールは保持。完全なアクセシビリティ監査ではない。
- スクリプトを除いた検証用コピーでも、6カード、ナビ、3ショートカットを閲覧可能。375pxで横はみ出しなし。Finderや比較のJS機能まで動くという意味ではない。

## 計測・送客検証

`df_qa=1` の検証環境でイベントをローカルDOMに記録し、外部リンクの既定遷移だけを抑止して元のクリックハンドラーを実行。実際の提携先へのクリック・申込・課金を発生させるテストではない。GA4/PostHogサーバーでの受信確認でもない。

- 既存 `software_compare_select`、`software_comparison_view`、`software_compare_clear`、`tool_click`、`finder_first_interaction`、`tool_start`、`tool_result_view` を観測。
- 比較内のHousecall Pro: 公式 `/pricing/`、`rel=noopener`、`vendor_outbound_click`、`monetized="false"`。
- 比較内のServiceLink・Zenbooker: `rel=sponsored noopener`、`affiliate_click`、`monetized="true"`。`cta_position=home_comparison`と既存sub-ID付与を確認。
- 推薦の採点、ベンダーの順序、提携属性を本デザインで変更していない。

公開後の評価は、QA・内部アクセスを除外し、流入元/端末/曜日を揃えた期間で行う。ホームからのFinderクリック率、Finder初回答率、結果表示率、比較表示率、研究を経た提携先送客を分けて見る。現行`tool_start`は結果生成時に発火するため、初回答には`finder_first_interaction`を使う。セッション経路でホーム流入と結び、クリック数だけを成果にしない。最終評価は提携先確認済み有料CV・承認済み報酬。今回、利用率向上・売上増加は未検証。

## ソース検証

| チェック | 結果 |
| --- | --- |
| `python3 tools/check-det57.py` | PASS。SEO情報、全既存リンク、6製品A–Z、30個の比較データ、送客属性、他の既存ファイルが不変であること |
| `node --check home.js` | PASS |
| `node tools/check-pricing.cjs` | PASS。料金・機能条件・追加人数境界・年間料金・Finder予算条件・既存送客先 |
| `git diff --check` | PASS |
| `python3 tools/check-home.py` | FAIL。47行目がHousecall Proにもsponsoredを要求する古い期待値。未変更の基準SHAでも同じ失敗を再現 |

旧チェックを通すために提携リンクへ戻すことはしていない。旧チェックの更新と、その先の全スイート通過は公開前に必要。全CI合格とは扱わない。

追加転送量の目安: index.html gzip 6,394→6,614 bytes、home.css gzip 5,136→8,113 bytes、WebP 18,734 bytes。合計増分約21.9KB（ヘッダー・実際の圧縮設定を除く）。新規JS/外部フォントなし。**これは速度測定ではなく、Lighthouse/CWVの合格証明ではない。**

## 公開前に残る課題

1. GitHubのブランチ作成は403 `Resource not accessible by integration`。リモートブランチ・PRは未作成。ローカルcommitと適用可能なpatch、PR説明案を成果物に含める。権限変更や別経路のpushは行っていない。
2. DET-54はLinear上In Progress。mainには修正が入り、本番ホームでもHousecall Proの公式・非提携リンクを確認したが、全体の公開受入完了とは扱わない。ブリッジは `df-hcp-nonaffiliate-correction-20261107-v1`、適用2026-11-07 06:57:52 UTC、base `9ba3a90…`。既存指令を再送せず、公開はAI COOのリリース判断に残す。
3. Safari実機、支援技術を使う完全なアクセシビリティ検証、Lighthouseの同条件比較、フィールドCWV、全CI、分析サービスの受信、実CVは未検証。
4. 取り込み時に最新mainとの差分を再確認し、レビュー済みブランチ経由で扱う。今回のパッケージをそのまま本番へ送る指令ではない。

ローカルプレビューは一時的な検証用。画像・イベント記録・パッチを提出物として保存し、本番URLの変更や新しい公開サイトの作成は行っていない。
