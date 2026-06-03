# Windows Video Downloader Design

## Goal

Build a polished Windows desktop app for downloading videos from YouTube and other public or user-accessible video pages supported by yt-dlp, including LinkedIn where yt-dlp supports the URL.

## Scope

Version 1 supports public downloads by default and optional browser-login downloads through an Advanced setting that passes cookies from Chrome, Edge, or Firefox to yt-dlp. The app will not bypass DRM, paywalls, or access controls; authenticated mode is only for videos the user can already view in their browser.

## Recommended Approach

Use Electron with React and TypeScript. Electron is available in the current toolchain through Node, gives native Windows folder dialogs and process control, and avoids depending on Rust, .NET, or Python being installed on the PC.

Alternatives considered:

- Tauri: smaller app, but Rust is not installed in this environment.
- Native .NET app: strong Windows integration, but dotnet is not installed here.
- Local web app: lighter runtime, but not as full-power for native file handling and launcher packaging.

## Architecture

The app has a secure Electron main process that owns all filesystem, tool, and process work. The renderer is a React UI exposed only to a typed preload API. The downloader engine spawns yt-dlp, parses progress from stdout, sends job updates to the renderer, and stores simple settings locally.

## Core UX

The first screen is the usable downloader: URL entry, output folder, quality preset, optional playlist/subtitle toggles, and a queue. Jobs show title, source, status, progress, speed, ETA, and direct actions. An Advanced panel contains browser-login mode, cookie browser choice, update-tool action, and the rights/terms reminder.

## Downloader Behavior

The app can probe URLs before download to show metadata when extraction succeeds. Download presets include best video, capped resolutions, and audio-only MP3. The app uses ffmpeg for merging or audio extraction. yt-dlp is installed into app user data on demand from the official latest release URL; ffmpeg is supplied by the ffmpeg-static package.

## Error Handling

Errors are shown as plain English messages in the queue. Unsupported URLs, missing tools, auth-required pages, and network failures should be distinguishable. The app keeps the command output available in a compact details drawer for troubleshooting without making the main UI feel technical.

## Testing

Unit tests cover command argument generation, progress parsing, and queue state helpers. Build verification covers TypeScript, Vite/Electron bundling, and a local Electron smoke run where practical.
