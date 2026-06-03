# Windows Video Downloader Design

## Goal

Build a polished Windows desktop app for downloading videos from public or user-accessible video pages supported by the downloader engine.

## Scope

Version 1 supports public downloads by default and optional browser-login downloads through an Advanced setting that passes cookies from installed browsers to the downloader engine. The app will not bypass DRM, paywalls, or access controls; authenticated mode is only for videos the user can already view in their browser.

## Recommended Approach

Use Electron with React and TypeScript. Electron is available in the current toolchain through Node, gives native Windows folder dialogs and process control, and avoids depending on Rust, .NET, or Python being installed on the PC.

Alternatives considered:

- Tauri: smaller app, but Rust is not installed in this environment.
- Native .NET app: strong Windows integration, but dotnet is not installed here.
- Local web app: lighter runtime, but not as full-power for native file handling and launcher packaging.

## Architecture

The app has a secure Electron main process that owns all filesystem, tool, and process work. The renderer is a React UI exposed only to a typed preload API. The downloader engine spawns the download tool, parses progress from stdout, sends job updates to the renderer, and stores simple settings locally.

## Core UX

The first screen is the usable downloader: URL entry, output folder, quality preset, optional playlist/subtitle toggles, and a queue. Jobs show title, source, status, progress, speed, ETA, and direct actions. An Advanced panel contains browser-login mode, cookie browser choice, update-tool action, and the rights/terms reminder.

## Downloader Behavior

The app can probe URLs before download to show metadata when extraction succeeds. Download presets include best video, capped resolutions, and audio-only MP3. The app uses bundled media tools for merging or audio extraction. The download tool is installed into app user data on demand from its official latest release URL.

## Error Handling

Errors are shown as plain English messages in the queue. Unsupported URLs, missing tools, auth-required pages, network failures, and cancellation should be distinguishable. Cancelled jobs remain cancelled even if late metadata or process events arrive afterward. The app keeps command output available in a compact details drawer for troubleshooting without making the main UI feel technical.

## Testing

Unit tests cover command argument generation, progress parsing, queue state helpers, settings persistence, forced tool refresh, process cancellation semantics, and late metadata handling. Build verification covers TypeScript, Vite/Electron bundling, and a local Electron smoke run where practical.

## Known Follow-Ups

- Track metadata-read subprocesses so cancellation can stop probing work directly.
- Terminate full process trees on Windows cancellation.
- Add strict renderer Content Security Policy.
- Add IPC validation for URL, path, job ID, and settings payloads.
- Add an integration test with a fake local download executable.
