# Security Policy

## Supported Versions

The `main` branch is the supported development branch until versioned releases are established.

## Reporting a Vulnerability

Please do not post sensitive security details publicly. Open a private security advisory on GitHub if available, or contact the maintainer through the repository owner profile.

Include:

- A clear description of the issue.
- Steps to reproduce.
- Affected platform and version.
- Whether the issue involves URLs, cookies, local files, downloaded binaries, or IPC.

## Security Boundaries

The renderer must not receive direct Node.js, filesystem, or shell access. File operations, downloader execution, settings, and tool installation belong in the Electron main process behind the preload API.

## Out of Scope

Requests to bypass DRM, paywalls, private access controls, platform restrictions, or copyright protections are not accepted.
