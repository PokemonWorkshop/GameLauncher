import crypto from 'crypto';
import { IpcMainEvent } from 'electron';
import fs from 'fs/promises';
import log from 'electron-log';
import extract from 'extract-zip';
import path from 'path';
import { downloadFile, fetchResponse } from '@utils/fetch';

import { CheckGameUpdateReturnType, GameChannelConfiguration, GameConfiguration, GameEnvironment, GameRelease } from '@src/types';

const LAUNCHER_PATH = '.launcher';
const UPDATE_PATH = path.join(LAUNCHER_PATH, 'update');
const MANIFEST_PATH = path.join(LAUNCHER_PATH, 'installed-files.json');

type SemanticVersion = {
  major: number;
  minor: number;
  patch: number;
  prerelease: string[];
};

const parseVersion = (value: string): SemanticVersion | undefined => {
  const match = value.trim().match(/^[A-Za-z_-]*(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z.-]+)?$/);
  if (!match) return undefined;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4]?.split('.') || [],
  };
};

const compareVersion = (left: SemanticVersion, right: SemanticVersion): number => {
  for (const key of ['major', 'minor', 'patch'] as const) {
    if (left[key] !== right[key]) return left[key] > right[key] ? 1 : -1;
  }
  if (left.prerelease.length === 0 || right.prerelease.length === 0) {
    if (left.prerelease.length === right.prerelease.length) return 0;
    return left.prerelease.length === 0 ? 1 : -1;
  }
  for (let index = 0; index < Math.max(left.prerelease.length, right.prerelease.length); index++) {
    const leftIdentifier = left.prerelease[index];
    const rightIdentifier = right.prerelease[index];
    if (leftIdentifier === undefined) return -1;
    if (rightIdentifier === undefined) return 1;
    if (leftIdentifier === rightIdentifier) continue;
    const leftNumber = /^\d+$/.test(leftIdentifier);
    const rightNumber = /^\d+$/.test(rightIdentifier);
    if (leftNumber && rightNumber) return Number(leftIdentifier) > Number(rightIdentifier) ? 1 : -1;
    if (leftNumber !== rightNumber) return leftNumber ? -1 : 1;
    return leftIdentifier > rightIdentifier ? 1 : -1;
  }
  return 0;
};

const getGithubRelease = async (repositoryUrl: string): Promise<GameRelease> => {
  const repository = new URL(repositoryUrl).pathname.split('/').filter(Boolean);
  if (repository.length !== 2) throw new Error('githubUrl must identify an owner and repository');
  const response = await fetchResponse(`https://api.github.com/repos/${repository[0]}/${repository[1]}/releases/latest`, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'GameLauncher' },
  });
  const release: { tag_name: string; assets: { name: string; browser_download_url: string }[] } = await response.json();
  const version = String(release.tag_name || '');
  if (!parseVersion(version)) throw new Error('The latest GitHub release tag is not a valid semantic version');
  const zipAssets = release.assets.filter((asset) => asset.name.toLowerCase().endsWith('.zip'));
  if (zipAssets.length !== 1) throw new Error('The latest GitHub release must contain exactly one ZIP asset');
  return { version, downloadUrl: zipAssets[0].browser_download_url };
};

const getServerRelease = async (serverUrl: string): Promise<GameRelease> => {
  const directoryUrl = new URL(serverUrl);
  if (!directoryUrl.pathname.endsWith('/')) directoryUrl.pathname += '/';
  const response = await fetchResponse(new URL('latest.json', directoryUrl).href);
  const metadata: unknown = await response.json();
  if (typeof metadata !== 'object' || metadata === null || !('version' in metadata) || typeof metadata.version !== 'string') {
    throw new Error('The server latest.json must contain a version string');
  }
  const version = metadata.version.trim();
  if (!parseVersion(version)) throw new Error('The server latest.json version is not a valid semantic version');
  return { version, downloadUrl: new URL(`${encodeURIComponent(version)}.zip`, directoryUrl).href };
};

export const getLatestRelease = (channel: GameChannelConfiguration): Promise<GameRelease> => {
  if (channel.updateSource === 'github') {
    if (!channel.githubUrl) return Promise.reject(new Error('githubUrl is required for GitHub updates'));
    return getGithubRelease(channel.githubUrl);
  }
  if (!channel.serverUrl) return Promise.reject(new Error('serverUrl is required for server updates'));
  return getServerRelease(channel.serverUrl);
};

const getInstalledVersion = async (gamePath: string): Promise<{ value: string; parsed: SemanticVersion } | undefined> => {
  try {
    const manifest = JSON.parse(await fs.readFile(path.join(gamePath, MANIFEST_PATH), 'utf-8'));
    const value = String(manifest.version || '');
    const parsed = parseVersion(value);
    if (parsed) return { value, parsed };
  } catch {
    // A missing launcher manifest requires an update to establish version ownership.
  }
  return undefined;
};

export const checkGameUpdate = async (payload: {
  gamePath: GameConfiguration['gamePath'];
  environment: GameEnvironment;
  channel: GameChannelConfiguration;
}): Promise<CheckGameUpdateReturnType> => {
  log.info('check-game-update', { environment: payload.environment, source: payload.channel.updateSource });
  const installedVersion = await getInstalledVersion(payload.gamePath.replace('<channel>', payload.environment));
  try {
    const release = await getLatestRelease(payload.channel);
    return {
      needsUpdate: !installedVersion || compareVersion(parseVersion(release.version)!, installedVersion.parsed) > 0,
      installedVersion: installedVersion?.value,
      release,
      error: { isError: false },
    };
  } catch (error) {
    log.error('Failed to check for game updates', error);
    return {
      needsUpdate: false,
      installedVersion: installedVersion?.value,
      error: { isError: true, message: error instanceof Error ? error.message : 'Failed to check for game updates' },
    };
  }
};

const getFiles = async (directory: string, relativePath = ''): Promise<string[]> => {
  const entries = await fs.readdir(path.join(directory, relativePath), { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const entryPath = path.join(relativePath, entry.name);
    if (entry.isDirectory()) files.push(...await getFiles(directory, entryPath));
    else if (entry.isFile()) files.push(entryPath.replaceAll('\\', '/'));
  }
  return files;
};

const sha1 = async (filename: string) => crypto.createHash('sha1').update(await fs.readFile(filename)).digest('hex');

const isProtected = (filename: string, protectedPaths: string[]) => {
  if (filename === LAUNCHER_PATH || filename.startsWith(`${LAUNCHER_PATH}/`)) return true;
  return protectedPaths.some((protectedPath) => {
    const normalized = protectedPath.replaceAll('\\', '/').replace(/^\.\//, '');
    const prefix = normalized.endsWith('/**') ? normalized.slice(0, -3) : normalized;
    return filename === prefix || filename.startsWith(`${prefix}/`);
  });
};

const loadManifestFiles = async (gamePath: string): Promise<string[]> => {
  try {
    const manifest = JSON.parse(await fs.readFile(path.join(gamePath, MANIFEST_PATH), 'utf-8'));
    return Array.isArray(manifest.files) ? manifest.files : [];
  } catch {
    return [];
  }
};

export const requestGameUpdate = async (
  event: IpcMainEvent,
  payload: {
    gamePath: GameConfiguration['gamePath'];
    environment: GameEnvironment;
    channel: GameChannelConfiguration;
    release: GameRelease;
    protectedPaths: string[];
  },
) => {
  const gamePath = payload.gamePath.replace('<channel>', payload.environment);
  const updatePath = path.join(gamePath, UPDATE_PATH);
  const archivePath = path.join(updatePath, 'game.zip');
  const stagingPath = path.join(updatePath, 'files');
  try {
    await fs.rm(updatePath, { recursive: true, force: true });
    await fs.mkdir(updatePath, { recursive: true });
    await downloadFile(payload.release.downloadUrl, archivePath, ({ progress, rate }) =>
      event.sender.send('game-update/progress', {
        state: 'downloading', progress, rate,
      }),
    );
    event.sender.send('game-update/progress', { state: 'extracting', progress: 0, rate: 0 });
    await extract(archivePath, { dir: stagingPath });
    const newFiles = (await getFiles(stagingPath)).filter((file) => !isProtected(file, payload.protectedPaths));
    const previousFiles = await loadManifestFiles(gamePath);
    for (let index = 0; index < newFiles.length; index++) {
      const file = newFiles[index];
      const source = path.join(stagingPath, file);
      const target = path.join(gamePath, file);
      let changed = true;
      try {
        changed = await sha1(source) !== await sha1(target);
      } catch {
        // The target file does not exist yet.
      }
      if (changed) {
        await fs.mkdir(path.dirname(target), { recursive: true });
        await fs.copyFile(source, target);
      }
      event.sender.send('game-update/progress', { state: 'applying', progress: ((index + 1) / newFiles.length) * 100, rate: 0 });
    }
    for (const file of previousFiles) {
      if (!newFiles.includes(file) && !isProtected(file, payload.protectedPaths)) {
        await fs.rm(path.join(gamePath, file), { force: true });
      }
    }
    await fs.mkdir(path.join(gamePath, LAUNCHER_PATH), { recursive: true });
    await fs.writeFile(path.join(gamePath, MANIFEST_PATH), JSON.stringify({ version: payload.release.version, files: newFiles }, null, 2));
    await fs.rm(updatePath, { recursive: true, force: true });
    event.sender.send('game-update/progress', { state: 'done', progress: 100, rate: 0 });
    event.sender.send('game-update/done');
  } catch (error) {
    log.error('Failed to apply game update', error);
    await fs.rm(updatePath, { recursive: true, force: true });
    event.sender.send('game-update/failure', error instanceof Error ? error.message : 'Failed to apply game update');
  }
};