# Sitewide release checkpoint

- Command ID reserved: `df-sitewide-brand-20261025-v1`.
- Base main: `690521e8872d0af1018f12218a767102887b7fc5`.
- Branch: `redesign/sitewide-brand-20261024` (local phased history; the existing mail bridge creates one production commit on main).
- Phase history: b4c997c audit; dbce5e0 design; 385fb7e implementation; 6bb3ea6 review directory/mobile fixes; d9de31b reconciles the latest published Finder patch; following validation commit records final QA.
- Status at packaging: validated, not yet sent or published. Consult later WORK_PROGRESS entries, Gmail Sent and remote bridge state for the actual send/application status; the payload cannot contain its own future mail ID or production commit.
- Attachment must be named exactly `detailerfit-deploy.zip`; root manifest `detailerfit-command.json`, replaced files under `payload/`; zero deletions, at most 250 operations/20 MiB uncompressed. No workflow, authentication, security, hosting, analytics, price or scoring-rule changes.
- Existing verified recipient/sender: DetailerFit's own `hello.detailerfit@gmail.com`. No other recipient authorized. Subject `[DETAILERFIT-DEPLOY] df-sitewide-brand-20261025-v1`.
- Before sending: fetch main, reject/reconcile stale base; inspect Sent for this exact command; validate the exact ZIP in a clean-base worktree with all sitewide/release/home/pricing gates. Do not resend blindly.
- After sending: read back attachment name/size; record mail ID, archive SHA-256, source commit. After bridge completion inspect `.detailerfit-bridge-state.json`, compare every replaced file to the validated payload and inspect the live Home/Finder/Compare/Cost/Reviews and brand assets.
- Previous commands `df-home-discovery-20261024-verified` and `df-finder-contrast-conversion-v1-20261025` are already applied; do not send them again.
- Existing scheduler is observed running less often than its five-minute cron. A sent email is not proof of publication. Never modify scheduler/settings to accelerate this task.
