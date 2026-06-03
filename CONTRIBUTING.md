# Contributing

Thanks for considering a contribution.

## Ground Rules

- Keep the app focused on legitimate downloads of content the user owns, has permission to save, or is otherwise allowed to download.
- Do not add DRM bypass, paywall bypass, credential theft, scraping abuse, or access-control circumvention features.
- Keep renderer code isolated from filesystem and shell access; use typed IPC through the preload bridge.
- Add or update tests for downloader argument generation, progress parsing, settings, and queue behavior when changing those areas.

## Local Setup

```powershell
npm.cmd install
npm.cmd test
npm.cmd run build
```

## Pull Requests

Before opening a PR:

- Run `npm.cmd test`.
- Run `npm.cmd run build`.
- Keep changes scoped and explain the user impact.
- Update README, TERMS, or notices when behavior or legal surface changes.

## Reporting Issues

Please include:

- App version or commit.
- Windows version.
- URL source type, without sharing private or sensitive links.
- Whether browser-login mode was enabled.
- Error text from the job details panel.
