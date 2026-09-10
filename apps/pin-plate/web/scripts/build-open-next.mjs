import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  rmSync,
  statSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

const runOpenNextBuild = () => {
  const result = spawnSync(pnpm, ['exec', 'open-next', 'build'], {
    cwd: appRoot,
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const getDirectorySize = (path) => {
  if (!existsSync(path)) {
    return 0;
  }

  const stats = lstatSync(path);

  if (stats.isSymbolicLink()) {
    const target = readlinkSync(path);
    return target.length;
  }

  if (!stats.isDirectory()) {
    return stats.size;
  }

  return readdirSync(path).reduce(
    (totalSize, childName) =>
      totalSize + getDirectorySize(join(path, childName)),
    stats.size,
  );
};

const formatBytes = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const shouldPrunePackage = (packageName) =>
  packageName.startsWith('@swc+core-') ||
  packageName.startsWith('@esbuild+') ||
  packageName.startsWith('esbuild@') ||
  packageName.startsWith('webpack@') ||
  packageName.startsWith('typescript@') ||
  packageName.startsWith('@img+sharp-darwin-') ||
  packageName.startsWith('@img+sharp-libvips-darwin-') ||
  packageName.startsWith('@img+sharp-linux-arm64@') ||
  packageName.startsWith('@img+sharp-linuxmusl-') ||
  packageName.startsWith('@img+sharp-libvips-linux-arm64@') ||
  packageName.startsWith('@img+sharp-libvips-linuxmusl-');

const pruneServerFunction = () => {
  const serverFunctionPath = join(
    appRoot,
    '.open-next',
    'server-functions',
    'default',
  );
  const pnpmStorePath = join(serverFunctionPath, 'node_modules', '.pnpm');

  if (!existsSync(pnpmStorePath)) {
    console.warn(
      '[open-next-prune] server function pnpm store was not found; skipping prune.',
    );
    return;
  }

  const beforeSize = getDirectorySize(serverFunctionPath);
  const removedPackages = [];

  for (const packageName of readdirSync(pnpmStorePath)) {
    if (!shouldPrunePackage(packageName)) {
      continue;
    }

    const packagePath = join(pnpmStorePath, packageName);
    const packageStats = statSync(packagePath);

    if (!packageStats.isDirectory()) {
      continue;
    }

    rmSync(packagePath, { recursive: true, force: true });
    removedPackages.push(packageName);
  }

  const afterSize = getDirectorySize(serverFunctionPath);

  console.log(
    `[open-next-prune] removed ${removedPackages.length} unused build/platform packages.`,
  );
  console.log(
    `[open-next-prune] server function size: ${formatBytes(beforeSize)} -> ${formatBytes(afterSize)}`,
  );
};

const copyInstrumentationChunks = () => {
  const serverPath = join(appRoot, '.next', 'server');
  const tracePath = join(serverPath, 'instrumentation.js.nft.json');
  const outputServerPath = join(
    appRoot,
    '.open-next',
    'server-functions',
    'default',
    'apps',
    'pin-plate',
    'web',
    '.next',
    'server',
  );

  if (!existsSync(tracePath) || !existsSync(outputServerPath)) {
    return;
  }

  const trace = JSON.parse(readFileSync(tracePath, 'utf8'));
  const copiedFiles = [];

  for (const filePath of trace.files ?? []) {
    if (!filePath.startsWith('chunks/')) {
      continue;
    }

    const sourcePath = join(serverPath, filePath);
    const targetPath = join(outputServerPath, filePath);

    if (!existsSync(sourcePath) || existsSync(targetPath)) {
      continue;
    }

    mkdirSync(dirname(targetPath), { recursive: true });
    copyFileSync(sourcePath, targetPath);
    copiedFiles.push(filePath);
  }

  if (copiedFiles.length > 0) {
    console.log(
      `[open-next-prune] copied ${copiedFiles.length} instrumentation chunk files.`,
    );
  }
};

const pruneBrokenSymlinks = (directoryPath) => {
  if (!existsSync(directoryPath)) {
    return 0;
  }

  let removedSymlinkCount = 0;

  for (const childName of readdirSync(directoryPath)) {
    const childPath = join(directoryPath, childName);
    const childStats = lstatSync(childPath);

    if (childStats.isSymbolicLink()) {
      try {
        statSync(childPath);
      } catch {
        rmSync(childPath, { force: true });
        removedSymlinkCount += 1;
      }
      continue;
    }

    if (childStats.isDirectory()) {
      removedSymlinkCount += pruneBrokenSymlinks(childPath);
    }
  }

  return removedSymlinkCount;
};

runOpenNextBuild();
copyInstrumentationChunks();
pruneServerFunction();

const removedSymlinkCount = pruneBrokenSymlinks(
  join(appRoot, '.open-next', 'server-functions', 'default', 'node_modules'),
);

if (removedSymlinkCount > 0) {
  console.log(`[open-next-prune] removed ${removedSymlinkCount} broken symlinks.`);
}
