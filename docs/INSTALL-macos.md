# Installing on macOS

## Requirements

- Apple silicon Mac (M1, M2, M3, M4 or newer)
- macOS 12 or newer

The build is Apple silicon only. It will not run on an Intel Mac.

## Install

1. Download `Video-Downloader-0.2.0-arm64.dmg` from the
   [latest release](https://github.com/plpk/videodownloader/releases/latest).
2. Open the `.dmg`.
3. Drag **Video Downloader** into your Applications folder.
4. Launch it from Applications.

The first download takes a moment longer while the app fetches its downloader
engine. That happens once.

## "Video Downloader is damaged and can't be opened"

The app is not damaged. It is signed for local use rather than with a paid Apple
developer account, so macOS refuses to open it once it has been marked as
downloaded from somewhere else.

Run this once, then open the app normally:

```bash
xattr -dr com.apple.quarantine "/Applications/Video Downloader.app"
```

### How long does that last?

It is a one-time fix for that copy of the app. The command strips the "downloaded
from the internet" marker off the app bundle permanently, so the app keeps
opening normally after a restart, after a macOS update, and forever after.

You only need to run it again if you replace the app with a fresh copy, because
the new copy arrives carrying its own marker. So: once per install, not once per
launch.

## Moving the app to another Mac

Whether you need the command above depends only on how the app travels:

| How you copy it                    | Quarantine marker added? |
| ---------------------------------- | ------------------------ |
| USB stick or external drive        | No — opens straight away |
| `scp` / `rsync` over SSH           | No — opens straight away |
| AirDrop                            | Yes — run the command    |
| iCloud Drive, Dropbox, Google Drive| Yes — run the command    |
| Email or Messages attachment       | Yes — run the command    |
| Downloaded from GitHub Releases    | Yes — run the command    |

You can copy either the `.dmg` or the installed
`/Applications/Video Downloader.app` itself. Both give the same result.

## Building it yourself

```bash
npm install
npm run dist:mac
```

Outputs:

```text
release/Video Downloader-0.2.0-arm64.dmg
release/mac-arm64/Video Downloader.app
```

A locally built app is not quarantined, so it opens without the command above.
