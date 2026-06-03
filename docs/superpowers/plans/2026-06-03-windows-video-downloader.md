# Windows Video Downloader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished Electron Windows desktop app that downloads public and browser-authenticated videos through yt-dlp.

**Architecture:** Electron main process owns process spawning, filesystem access, settings, and tool installation. React renderer owns the polished queue UI and calls a typed preload bridge. Shared TypeScript types keep IPC contracts explicit.

**Tech Stack:** Electron, React, TypeScript, Vite, Vitest, lucide-react, ffmpeg-static, yt-dlp executable downloaded on demand.

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
- `src/main/downloader/args.ts`: yt-dlp argument builder.
- `src/main/downloader/progress.ts`: yt-dlp progress parser.
- `src/main/downloader/tools.ts`: yt-dlp install and ffmpeg path helpers.
- `src/main/downloader/manager.ts`: job queue and child-process lifecycle.
- `src/preload/index.ts`: secure `window.downloader` API.
- `src/renderer/src/App.tsx`: app composition and state orchestration.
- `src/renderer/src/components/*.tsx`: focused UI components.
- `src/renderer/src/lib/queue.ts`: renderer queue helpers.
- `src/renderer/src/styles.css`: polished Windows utility design system.
- `src/**/*.test.ts`: unit tests for downloader behavior and queue helpers.

## Tasks

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

- [ ] Create the Electron/Vite/React package configuration.
- [ ] Write tests that import missing `buildDownloadArgs`, `parseProgressLine`, and `createQueuedJobs`.
- [ ] Run `npm.cmd install`.
- [ ] Run `npm.cmd test` and verify the tests fail because implementation modules are missing.

### Task 2: Downloader Core

**Files:**
- Create: `src/shared/types.ts`
- Create: `src/main/downloader/args.ts`
- Create: `src/main/downloader/progress.ts`
- Create: `src/renderer/src/lib/queue.ts`

- [ ] Implement shared types for quality presets, browser cookies, jobs, and settings.
- [ ] Implement `buildDownloadArgs` to generate safe yt-dlp arguments for public, browser-cookie, playlist, subtitles, and audio-only modes.
- [ ] Implement `parseProgressLine` for percent, size, speed, ETA, and completed lines.
- [ ] Implement `createQueuedJobs` to split URL input and seed queue rows.
- [ ] Run `npm.cmd test` and verify the new tests pass.

### Task 3: Electron Backend

**Files:**
- Create: `src/main/settings.ts`
- Create: `src/main/downloader/tools.ts`
- Create: `src/main/downloader/manager.ts`
- Create: `src/main/ipc.ts`
- Create: `src/main/index.ts`
- Create: `src/preload/index.ts`

- [ ] Implement settings load/save under Electron `userData`.
- [ ] Implement yt-dlp install detection and official latest-release download.
- [ ] Implement ffmpeg path resolution through `ffmpeg-static`.
- [ ] Implement probe/download/cancel/open-folder IPC handlers.
- [ ] Spawn yt-dlp with `--newline` and forward parsed progress events to the renderer.

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

- [ ] Build the primary screen with URL entry, output folder, presets, queue, and advanced settings.
- [ ] Add native folder picker, install/update tools action, download, cancel, retry, and open-folder actions.
- [ ] Keep controls responsive and accessible with native text, icons, disabled states, and clear error messages.
- [ ] Style the app as a dense, polished utility instead of a marketing page.

### Task 5: Build And Verification

**Files:**
- Modify: `package.json`

- [ ] Run `npm.cmd test`.
- [ ] Run `npm.cmd run build`.
- [ ] Start the Electron app with `npm.cmd run dev` or equivalent.
- [ ] Smoke-test adding a URL, settings changes, tool install status, and UI responsiveness.
- [ ] Package or document the Windows app command depending on available build support.
