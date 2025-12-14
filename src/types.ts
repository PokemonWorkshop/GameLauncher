import { ipcRenderer } from 'electron';

import type { LogRendererType } from '@ipcRenderer/logRenderer';

export type ValidChannels<C extends GameConfiguration> = keyof C['channels'];

export type DefaultChannels = 'stable';

export type GameChannelConfiguration = {
  gameUrl: string;
  gameMetaUrl: string;
};

export type GameConfiguration = {
  gameName: string;
  gamePath: string;

  channels: Record<string, GameChannelConfiguration> & {
    stable: GameChannelConfiguration;
  };

  licenseUrl?: string;
  socialLinks: SocialLinks;
};

export type SocialLinks = {
  website: string;
  discord: string;
  instagram: string;
  x: string;
  facebook: string;
  youtube: string;
  tiktok: string;
  bluesky: string;
};

export type SocialVariant = keyof SocialLinks;

export type RequestStateReport = {
  success: boolean;
  done: boolean;
  progress: number;
  size: number;
  status: {
    code: number;
    message: string;
  };
};

export type LauncherError = {
  isError: boolean;
  message?: string;
};

export type Licence = {
  key: string;
  user: string;
};

export type CheckGameInstallReturnType = {
  result: boolean;
  error: LauncherError;
};

export type GameInstallProgress = {
  state: 'initializing' | 'downloading' | 'extracting' | 'cleaning' | 'done';
  progress: number;
  rate: number;
};

export type GameInstallMetadata = {
  version: string;
  length: number;
  hash: string;
};

export type BinariesVersion = {
  windows: string;
  linux: string;
  macos: string;
  version: string;
};

export type CheckNeedToUpdateBinariesReturnType = {
  needToUpdate: boolean;
  error: LauncherError;
};

export type BinariesUpdateProgress = {
  state: 'checking' | 'initializing' | 'downloading' | 'extracting' | 'cleaning' | 'done';
  progress: number;
  rate: number;
};

export type GameUninstallProgress = {
  state: 'initializing' | 'uninstalling' | 'done';
  progress: number;
};

type Filename = string;
type Sha1Hash = string;
export type FileHashes = Record<Filename, Sha1Hash>;

interface IRequestFile {
  getRequestStateReport: () => Promise<RequestStateReport>;
  getRequestData: (encoding?: BufferEncoding) => Promise<string>;
  // Note: Preload does not support object like URL, please make sure everything is all right before calling
  requestFile: (url: string) => Promise<boolean>;
  onRequestProgress: (callback: (progress: number) => void) => void;
  onRequestDone: (callback: () => void) => void;
  removeEventListeners: () => void;
}

interface IStartGame {
  startGame: (gamePath: GameConfiguration['gamePath']) => void;
  a: (f: NonNullable<GameConfiguration['channels']['stable']>['gameUrl']) => void;
  onResult: (callback: (result: boolean) => void) => void;
  onProgress: (callback: (progress: number) => void) => void;
  onExit: (callback: (exitCode: number) => void) => void;
  removeEventListeners: () => void;
}

interface IGameInstall {
  checkGameInstall: (installPath: GameConfiguration['gamePath']) => Promise<CheckGameInstallReturnType>;
  initGameInstall: (installPath: GameConfiguration['gamePath']) => Promise<LauncherError>;
  cleanGameInstall: (installPath: GameConfiguration['gamePath'], removeGame: boolean) => Promise<LauncherError>;
  extractGame: (installPath: GameConfiguration['gamePath']) => void;
  onExtractDone: (callback: () => void) => void;
  onExtractProgress: (callback: (progress: number) => void) => void;
  onExtractFailure: (callback: (errorMessage: string) => void) => void;
  requestGameFile: (payload: {
    channel: keyof GameConfiguration['channels'];
    installUrl: string;
    metadataUrl: string;
    installPath: GameConfiguration['gamePath'];
  }) => void;
  onRequestGameFileDone: (callback: () => void) => void;
  onRequestGameFileProgress: (callback: (progress: number, rate: number) => void) => void;
  onRequestGameFileFailure: (callback: (errorMessage: string) => void) => void;
  removeEventListeners: () => void;
}

interface IBinariesUpdate {
  checkNeedToUpdateBinaries: (gamePath: GameConfiguration['gamePath']) => Promise<CheckNeedToUpdateBinariesReturnType>;
  initBinariesUpdate: (installPath: GameConfiguration['gamePath'], gamePath: GameConfiguration['gamePath']) => Promise<LauncherError>;
  cleanBinariesUpdate: (
    installPath: GameConfiguration['gamePath'],
    gamePath: GameConfiguration['gamePath'],
    removeBinaries: boolean,
  ) => Promise<LauncherError>;
  requestBinariesFile: (payload: {
    binariesUrl: string;
    installPath: GameConfiguration['gamePath'];
    gamePath: GameConfiguration['gamePath'];
  }) => void;
  onRequestBinariesFileDone: (callback: () => void) => void;
  onRequestBinariesFileProgress: (callback: (progress: number, rate: number) => void) => void;
  onRequestBinariesFileFailure: (callback: (errorMessage: string) => void) => void;
  extractBinaries: (installPath: GameConfiguration['gamePath'], gamePath: GameConfiguration['gamePath']) => void;
  onExtractBinariesDone: (callback: () => void) => void;
  onExtractBinariesProgress: (callback: (progress: number) => void) => void;
  onExtractBinariesFailure: (callback: (errorMessage: string) => void) => void;
  removeEventListeners: () => void;
}

interface IGameUninstall {
  gameUninstall: (installPath: GameConfiguration['gamePath']) => void;
  onGameUninstallDone: (callback: () => void) => void;
  onGameUninstallProgress: (callback: (progress: number) => void) => void;
  onGameUninstallFailure: (callback: (errorMessage: string) => void) => void;
  removeEventListeners: () => void;
}

export interface ILauncherAPI {
  testMessage: (message: unknown) => void;
  loadConfig: () => Promise<GameConfiguration>;
  estimateFileSize: (path: string) => Promise<number>;
  checkFiles: (projectPath: string, filesToCheck: FileHashes, files: string[]) => Promise<string[]>;
  externalWindow: (link: string) => void;
  saveFile: (path: string, data: string) => Promise<void>;
  closeLauncher: () => void;
  minimizeLauncher: () => void;
  platform: () => string;
  readLicence: (currentConfig: GameConfiguration) => Promise<Licence>;
  version: () => Promise<string>;
  quitAndInstall: () => Promise<void>;
  openGameFolder: (gamePath: GameConfiguration['gamePath']) => void;
  createDesktopShortcut: () => void;
  checkUpdate: () => void;
  requestUpdateDownloaded: {
    on: (cb: Parameters<typeof ipcRenderer.on>[1]) => ReturnType<typeof ipcRenderer.on>;
    removeListener: (cb: Parameters<typeof ipcRenderer.on>[1]) => void;
  };
  requestFile: IRequestFile;
  startGame: IStartGame;
  gameInstall: IGameInstall;
  binariesUpdate: IBinariesUpdate;
  gameUninstall: IGameUninstall;
  log: LogRendererType;
}
