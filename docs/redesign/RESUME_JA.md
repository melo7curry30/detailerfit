# DetailerFit 再開手順

## 現在の状態

- ホーム改修と利用可能なローカル検証まで完了。**未公開**。
- ブランチ: `redesign/home-discovery-20261023`（ローカルのみ）
- ベースmain: `39216335257b2cebc87959302708e0f781acc919`
- 2026-10-24 JSTの最終読み取り確認でもremote mainは同じSHA。
- リモートブランチ、PR、マージ、本番デプロイは未実施。
- GitHub連携の書き込みは403、通常のgit pushには認証情報がない。認証・セキュリティ設定は変更していない。
- 外部メールは禁止されているため、既存mail bridgeは利用していない。Cloudflareのデプロイ設定を推測で変更しない。

## ZIPから復元

ZIPを展開した場所で次を実行する。既存チェックアウトの上に直接上書きしない。

```sh
git clone --branch redesign/home-discovery-20261023 ./detailerfit-redesign.bundle detailerfit-resume
cd detailerfit-resume
git remote set-url origin https://github.com/melo7curry30/detailerfit.git
git status --short
git log -6 --oneline
python3 tools/check-home.py
node --check home.js
git diff --check
```

bundleにはコミット履歴が含まれる。`source/`は最終ソースの参照用コピー、`detailerfit-redesign.patch`はベースとの差分。復元時にbundleとpatchを二重適用しない。

## 次の作業

1. `WORK_PROGRESS.md`と`docs/redesign/VALIDATION.md`を読む。以前の作業をやり直さない。
2. 新しい作業環境でGitHubの既存アクセス状態を確認する。権限がなければ、認証設定や権限を勝手に変更せず、書き込み可能な環境で再開する。
3. リモートの更新を読み取る。

   ```sh
   git fetch origin main
   git log --oneline 39216335257b2cebc87959302708e0f781acc919..origin/main
   git diff --stat 39216335257b2cebc87959302708e0f781acc919..origin/main
   ```

4. mainが更新されていたら差分を確認し、既存作業を保護して取り込む。force pushや本番ブランチの強制上書きは行わない。
5. 既存Finder/料金データのDetailPilotとQuoteIQを公式情報で更新し、料金計算・ランキング入力・関連記事を整合させる。今回のホーム6製品にはその古い料金を追加していない。商業提携によって評価を変更しない。
6. 実機またはSafari/Androidブラウザ、必要なアクセシビリティ検証を追加する。`qa-harness/`はローカル専用。sourceをpublicに配置して利用できるが、本番へ追加しない。
7. 書き込み権限が確認できた場合のみブランチをpushし、変更内容と検証結果を添えたPRを作る。

   ```sh
   git push -u origin redesign/home-discovery-20261023
   ```

8. 既存の正規デプロイ手順を確認する。ユーザーは通常のマージ・公開を許可しているが、未検証の重大な不具合を残したまま公開しない。料金整合性と必要な検証を解決してから進める。
9. 公開後にgetdetailerfit.comでメニュー、フィルター、比較、主要CTA、アフィリエイトIDと導線別計測を再確認する。通常QAは`?df_qa=1`を使い、本番の実ユーザーによるイベント受信と成果報酬を別々に確認する。

## 正式な検証範囲

今回のモバイル検証はChrome内のCSSビューポート再現。実機検証やSafariでの検証済みとは扱わない。HTML/CSS/JSの初期容量は19.9%削減したが、実測の速度改善率やCore Web Vitals改善とは区別する。売上・初回成果は未確認。

最終スクリーンショットは`evidence/`。作業履歴は`commits.txt`。元のURL、内部リンク41件、既存アフィリエイトID、共通計測コード、sitemap、redirectsは保護している。
