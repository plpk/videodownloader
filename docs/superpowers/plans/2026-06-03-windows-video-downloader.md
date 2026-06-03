# Windows Video Downloader Implementation Status

**Goal:** Build a polished Electron Windows desktop app that downloads public and browser-authenticated videos through a local download engine.

**Architecture:** Electron main process owns process spawning, filesystem access, settings, and tool installation. React renderer owns the polished queue UI and calls a typed preload bridge. Shared TypeScript types keep IPC contracts explicit.

**Tech Stack:** Electron, React, TypeScript, Vite, Vitest, lucide-react, bundled media tooling, and a download executable installed on demand.

**Status:** Implemented and verified locally with unit tests, production build, and an Electron button-path smoke harness.

---

## File Structure

- `package.json`: scripts, runtime dependencies, build config.
- `electron.vite.config.ts`: Electron/Vite build setup.
- `tsconfig*.json`: TypeScript compiler settings.
- `index.html`: renderer mount point.
- `src/shared/types.ts`: shared IPC and downloader types.
- `src/main/index.ts`: Electron app lifecycle, window creation, IPC wiring.
- `src/main/ipc.ts`: preload-facing handlers and event forwarding.
- `src/main/settings.ts`: local JSON settings load/save.
- `src/main/downloader/args.ts`: download-tool argument builder.
- `src/main/downloader/progress.ts`: download-tool progress parser.
- `src/main/downloader/tools.ts`: download-tool install and media-tool path helpers.
- `src/main/downloader/manager.ts`: job queue and child-process lifecycle.
- `src/preload/index.ts`: secure `window.downloader` API.
- `src/renderer/src/App.tsx`: app composition and state orchestration.
- `src/renderer/src/components/*.tsx`: focused UI components.
- `src/renderer/src/lib/queue.ts`: renderer queue helpers.
- `src/renderer/src/styles.css`: polished Windows utility design system.
- `src/**/*.test.ts`: unit tests for downloader behavior and queue helpers.

## Completed Work

### Task 1: Project Scaffold And Failing Tests

**Files:**
- Create: `package.json`
- Create: `electron.vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `tsconfig.web.json`
- Create: `index.html`
- Create: `src/main/downloader/args.test.ts`
- Create: `src/main/downloader/progress.test.ts`
- Create: `src/renderer/src/lib/queue.test.ts`

- [x] Create the Electron/Vite/React package configuration.
- [x] Write tests that import missing `buildDownloadArgs`, `parseProgressLine`, and `createQueuedJobs`.
- [x] Run `npm.cmd install`.
- [x] Run `npm.cmd test` and verify the tests fail because implementation modules are missing.

### Task 2: Downloader Core

**Files:**
- Create: `src/shared/types.ts`
- Create: `src/main/downloader/args.ts`
- Create: `src/main/downloader/progress.ts`
- Create: `src/renderer/src/lib/queue.ts`

- [x] Implement shared types for quality presets, browser cookies, jobs, and settings.
- [x] Implement `buildDownloadArgs` to generate safe download-tool arguments for public, browser-cookie, playlist, subtitles, and audio-only modes.
- [x] Implement `parseProgressLine` for percent, size, speed, ETA, and completed lines.
- [x] Implement `createQueuedJobs` to split URL input and seed queue rows.
- [x] Run `npm.cmd test` and verify the new tests pass.

### Task 3: Electron Backend

**Files:**
- Create: `src/main/settings.ts`
- Create: `src/main/downloader/tools.ts`
- Create: `src/main/downloader/manager.ts`
- Create: `src/main/ipc.ts`
- Create: `src/main/index.ts`
- Create: `src/preload/index.ts`

- [x] Implement settings load/save under Electron `userData`.
- [x] Implement download-tool install detection and official latest-release download.
- [x] Implement forced tool refresh for the update action.
- [x] Implement bundled media-tool path resolution.
- [x] Implement probe/download/cancel/open-folder IPC handlers.
- [x] Spawn the download tool with newline progress output and forward parsed progress events to the renderer.
- [x] Preserve cancelled status when a killed process closes non-zero.

### Task 4: Renderer UI

**Files:**
- Create: `src/renderer/src/main.tsx`
- Create: `src/renderer/src/App.tsx`
- Create: `src/renderer/src/components/Header.tsx`
- Create: `src/renderer/src/components/UrlPanel.tsx`
- Create: `src/renderer/src/components/QueueList.tsx`
- Create: `src/renderer/src/components/SettingsPanel.tsx`
- Create: `src/renderer/src/components/StatusStrip.tsx`
- Create: `src/renderer/src/global.d.ts`
- Create: `src/renderer/src/styles.css`

- [x] Build the primary screen with URL entry, output folder, presets, queue, and advanced settings.
- [x] Add native folder picker, install/update tools action, download, cancel, retry, and open-folder actions.
- [x] Keep controls responsive and accessible with native text, icons, disabled states, and clear error messages.
- [x] Style the app as a dense, polished utility instead of a marketing page.
- [x] Ignore late metadata and process events that would revive a cancelled job.

### Task 5: Build And Verification

**Files:**
- Modify: `package.json`

- [x] Run `npm.cmd test`.
- [x] Run `npm.cmd run build`.
- [x] Start the Electron app with `npm.cmd run dev` or equivalent.
- [x] Smoke-test adding a URL, settings changes, tool install status, and UI responsiveness.
- [x] Package or document the Windows app command depending on available build support.

## Current Verification

- `npm.cmd test`: 7 test files, 12 tests passing.
- `npm.cmd run build`: TypeScript and Electron/Vite production build passing.
- Electron button-path harness: Browse, settings, install/update, download, cancel, retry, open-folder, and row selection paths exercised.

## Remaining Follow-Ups

- Track metadata-read subprocesses so cancellation can stop probing directly.
- Kill full process trees on Windows cancellation.
- Add strict renderer Content Security Policy.
- Add IPC input validation for URL, output path, job ID, and settings payloads.
- Add an integration test with a fake local download executable.
