DetailerFit ShopHawk Review — iPhone upload steps

1. Unzip this file in the iPhone Files app.
2. Open your DetailerFit repository in GitHub.
3. Go to:
   .github / workflows
4. Add/upload:
   detailerfit-shophawk-review.yml
5. Commit the file to the default branch.
6. GitHub Actions should start automatically.
7. When the run succeeds, the workflow deletes itself after publishing the changes.
8. Cloudflare should then deploy the repository normally.

Expected public page:
https://getdetailerfit.com/shophawk-review

This workflow:
- creates the ShopHawk review from the CURRENT repository shell
- does not overwrite styles.css or app.js
- adds Reviews/internal discovery links when the relevant pages exist
- adds the extensionless canonical sitemap URL
- does NOT mark ShopHawk links as sponsored because there is no confirmed affiliate relationship yet
- validates the page before committing

After GitHub Actions shows green, return to ChatGPT and say:
「できた🔥」
Then we can verify the live URL, mobile rendering, canonical, sitemap and internal links.
