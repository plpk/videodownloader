'use strict';

const { execFileSync } = require('node:child_process');
const { join } = require('node:path');

/**
 * electron-builder skips signing entirely when `mac.identity` is null, which
 * leaves the app carrying Electron's original ad-hoc signature even though we
 * changed the bundle contents. macOS then sees a signature whose sealed
 * resources do not match, which can block launch on Apple silicon.
 *
 * Re-signing ad-hoc (`--sign -`) costs nothing, needs no developer account, and
 * produces a bundle that validates locally. It does not make the app
 * distributable: other Macs will still quarantine it.
 */
exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'darwin') {
    return;
  }

  const appPath = join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`);

  execFileSync('codesign', ['--force', '--deep', '--sign', '-', '--timestamp=none', appPath], {
    stdio: 'inherit'
  });

  execFileSync('codesign', ['--verify', '--deep', '--strict', appPath], { stdio: 'inherit' });
  console.log(`  • ad-hoc signed  file=${appPath}`);
};
