# Video Downloader

A polished desktop app for downloading public and user-accessible videos from supported websites. Runs on Windows and macOS (Apple silicon).

Video Downloader is built as a local Electron app. The interface handles URLs, folders, quality presets, browser-login options, and queue status; the downloader engine runs locally on your machine.

## Features

- Paste one URL or a batch of URLs.
- Download public videos from supported sites.
- Optional browser-cookie mode for videos you can already access in a supported browser.
- Quality presets: Best (max resolution), 4K, 1440p, 1080p, 720p, 480p, MP3 audio, and original-quality audio.
- Audio-only presets fetch an audio stream directly, so no video data is downloaded.
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

On macOS the build produces a disk image and an app bundle:

```text
release/Video Downloader-0.2.0-arm64.dmg
release/mac-arm64/Video Downloader.app
```

macOS install steps, including the one-time fix for the "app is damaged"
Gatekeeper message, are in [docs/INSTALL-macos.md](docs/INSTALL-macos.md).

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
- Windows or macOS 12+ for the packaged desktop app (each platform builds its own installer)

### Building on macOS

```bash
npm install
npm run dist:mac
```

The build is ad-hoc signed so it launches locally without a developer account. It
is deliberately not notarized, so it is meant for the machine that built it
rather than for distribution.

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

## Max resolution and playback

"Best (max resolution)" sorts available streams by resolution first, so it always
takes the highest pixel count on offer. Above 1080p most sites only publish VP9 or
AV1 video with Opus audio, so the merged result is written to `mp4` when those
streams are legal in that container and to `mkv` when they are not, instead of
forcing an mp4 remux that some players refuse to open. AV1 playback in QuickTime
needs macOS 14 or newer. The 1080p preset stays on H.264/AAC if universal
compatibility matters more than resolution.

The downloader engine needs a JavaScript runtime to solve the signature
challenges some sites use; without one it warns that formats may be missing,
which can quietly cap resolution. Rather than downloading a separate runtime, the
app writes a small shim that re-invokes its own Electron binary with
`ELECTRON_RUN_AS_NODE=1`, which yt-dlp accepts as Node. This requires an Electron
release bundling Node 22 or newer.

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
