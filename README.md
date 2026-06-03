# Video Downloader

A polished Windows desktop app for downloading public and user-accessible videos from supported websites.

Video Downloader is built as a local Electron app. The interface handles URLs, folders, quality presets, browser-login options, and queue status; the downloader engine runs locally on your PC.

## Features

- Paste one URL or a batch of URLs.
- Download public videos from supported sites.
- Optional browser-cookie mode for videos you can already access in a supported browser.
- Quality presets: Best, 4K, 1440p, 1080p, 720p, 480p, and MP3 audio.
- Queue view with status, progress, speed, ETA, cancel, retry, and open-folder actions.
- On-demand download-tool install and refresh from the official release URL.
- Bundled media conversion support.
- Local settings storage for output folder, quality, playlist, subtitles, and browser-login preference.

## Current Status

The app is functional as a local Windows desktop downloader:

- Core Electron, preload, IPC, renderer, settings, queue, and downloader modules are implemented.
- Cancel, retry, open-folder, install/update, settings, and queue selection paths are covered by automated checks.
- Tool install/update refreshes the local download executable on demand.
- Cancelled jobs stay cancelled even if late process events or metadata arrive afterward.

## Known Limits

- Cancellation during the initial metadata read is handled in the UI, but the metadata subprocess itself is not yet tracked as a cancellable process.
- Process cancellation currently targets the immediate child process.
- Real external downloads and browser-cookie extraction still depend on the supported website, network state, and local browser profile access.
- The development build may show an Electron Content Security Policy warning until a stricter CSP is added.

## Important Use Notice

This project is for downloading content you own, have permission to save, or are otherwise allowed to download. It is not intended to bypass DRM, paywalls, private access controls, site restrictions, copyright law, or service terms.

You are responsible for how you use the software.

## Download

For local builds, the portable Windows app is generated at:

```text
release/win-unpacked/Video Downloader.exe
```

A portable ZIP can be generated with:

```powershell
npm.cmd run build
node_modules\.bin\electron-builder.cmd --win dir
Compress-Archive -LiteralPath release\win-unpacked -DestinationPath "release\Video Downloader Portable 0.1.0.zip" -Force
```

## Development

Requirements:

- Node.js 20 or newer
- npm
- Windows for the packaged desktop app

Install dependencies:

```powershell
npm.cmd install
```

Run the app in development:

```powershell
npm.cmd run dev
```

Run tests:

```powershell
npm.cmd test
```

Build:

```powershell
npm.cmd run build
```

Build the portable Windows folder:

```powershell
node_modules\.bin\electron-builder.cmd --win dir
```

Verification used for the current branch:

```powershell
npm.cmd test
npm.cmd run build
```

## Architecture

- `src/main`: Electron main process, settings, IPC, tool installation, and download process management.
- `src/preload`: secure renderer bridge.
- `src/renderer`: React UI.
- `src/shared`: shared TypeScript types.

The renderer has no direct filesystem or shell access. Native capabilities are exposed through a typed preload API.

## Sanitization

Public project copy avoids naming specific video or social websites. Dependency and executable identifiers may still appear in source code, package metadata, lockfiles, and third-party notices where they are required for installation, runtime behavior, or license attribution.

## License

This project is licensed under `GPL-3.0-or-later`. See [LICENSE](LICENSE).

The project uses third-party software with its own licenses. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Disclaimer

This software is provided as-is, without warranty of any kind. See [TERMS.md](TERMS.md) and [LICENSE](LICENSE) for the full terms, limitations, and warranty/liability disclaimer.
