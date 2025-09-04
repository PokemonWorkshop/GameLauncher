import React, { createContext, ReactNode, useContext, useState } from 'react';

import { BinariesUpdateProgress, GameConfiguration, GameInstallProgress, GameUninstallProgress, LauncherError } from '@src/types';

import { useDownloadGameUpdate } from './hooks/useDowloadGameUpdate';
import { useGameConfiguration } from './hooks/useGameConfiguration';
import { useGameInstall } from './hooks/useGameInstall';
import { useGameInstallCheck } from './hooks/useGameInstallCheck';
import { useGameUpdateCheck } from './hooks/useGameUpdateCheck';
import { useCheckLicence } from './hooks/useLicenceCheck';
import { usePlayGame } from './hooks/usePlayGame';
import { useStartGame } from './hooks/useStartGame';
import { voidCleanup } from './hooks/voidCleanup';
import { useBinariesUpdate } from './hooks/useBinariesUpdate';
import { useGameUninstall } from './hooks/useGameUninstall';

const defaultConfiguration: GameConfiguration = {
  gamePath: '',
  gameUrl: '/',
  gameVersion: '0.0.1',
  installPath: '',
  installUrl: '/',
  metadataUrl: '/',
  binariesUrl: '/',
  socialLinks: {
    website: '',
    discord: '',
    instagram: '',
    x: '',
    facebook: '',
    youtube: '',
    tiktok: '',
    bluesky: '',
  },
};

type LauncherContext = {
  state:
    | 'loading'
    | 'install_checking'
    | 'install_waiting'
    | 'installing'
    | 'licence_checking'
    | 'bad_licence'
    | 'checking'
    | 'update_waiting'
    | 'updating'
    | 'binaries_updating'
    | 'play_waiting'
    | 'starting'
    | 'playing'
    | 'editing_options'
    | 'uninstalling';
  configuration: GameConfiguration;
  gameInstallProgress: GameInstallProgress;
  binariesUpdateProgress: BinariesUpdateProgress;
  gameUninstallProgress: GameUninstallProgress;
  progress: number;
  overallProgress: number;
  fileCount: number;
  hasGameInstallCheckError: LauncherError;
  hasGameInstallError: LauncherError;
  hasGameUpdateCheckError: LauncherError;
  hasBinariesUpdateError: LauncherError;
  hasGameUninstallError: LauncherError;
  hasError: LauncherError;
  hasStartError: LauncherError;
  hasPlayError: LauncherError;
  handleDownloadClick: () => void;
  handleStartClick: () => void;
  handleInstallClick: () => void;
  handleEditingOptionsClick: (open: boolean) => void;
  handleUninstallClick: () => void;
};

const LauncherContextHolder = createContext<LauncherContext>({
  state: 'loading',
  configuration: defaultConfiguration,
  gameInstallProgress: { state: 'initializing', progress: 0, rate: 0 },
  binariesUpdateProgress: { state: 'checking', progress: 0, rate: 0 },
  gameUninstallProgress: { state: 'initializing', progress: 0 },
  progress: 0,
  overallProgress: 0,
  fileCount: 0,
  hasGameInstallCheckError: { isError: false },
  hasGameInstallError: { isError: false },
  hasGameUpdateCheckError: { isError: false },
  hasBinariesUpdateError: { isError: false },
  hasGameUninstallError: { isError: false },
  hasError: { isError: false },
  hasStartError: { isError: false },
  hasPlayError: { isError: false },
  handleDownloadClick: voidCleanup,
  handleStartClick: voidCleanup,
  handleInstallClick: voidCleanup,
  handleEditingOptionsClick: (open: boolean) => {
    open;
  },
  handleUninstallClick: voidCleanup,
});

export const useLauncherContext = () => useContext(LauncherContextHolder);

const computeState = (
  isLoading: boolean,
  doneInstallChecking: boolean,
  isGameInstalled: boolean,
  doneLicenceChecking: boolean,
  isValidLicence: boolean,
  doneChecking: boolean,
  filesToDownload: string[],
  shouldDownload: boolean,
  downloadDone: boolean,
  shouldUpdateBinaries: boolean,
  shouldStart: boolean,
  isPlaying: boolean,
  shouldInstall: boolean,
  shouldEditingOptions: boolean,
  shouldUninstall: boolean,
): LauncherContext['state'] => {
  if (isLoading) return 'loading';
  if (!doneInstallChecking) return 'install_checking';
  if (shouldInstall) return 'installing';
  if (doneInstallChecking && !isGameInstalled) return 'install_waiting';
  if (!doneLicenceChecking) return 'licence_checking';
  if (doneLicenceChecking && !isValidLicence) return 'bad_licence';
  if (!doneChecking) return 'checking';
  if (shouldDownload) return 'updating';
  if (shouldEditingOptions) return 'editing_options';
  if (filesToDownload.length !== 0 && !downloadDone) return 'update_waiting';
  if (shouldUpdateBinaries) return 'binaries_updating';
  if (shouldStart) return 'starting';
  if (isPlaying) return 'playing';
  if (shouldUninstall) return 'uninstalling';

  return 'play_waiting';
};

const useLauncherContextService = (): LauncherContext => {
  const [flipFlapConfig, setFlipFlapConfig] = useState(false);
  const [shouldCheckInstall, setShouldCheckInstall] = useState(true);
  const [shouldInstall, setShouldInstall] = useState(false);
  const [shouldDownload, setShouldDownload] = useState(false);
  const [shouldUpdateBinaries, setShouldUpdateBinaries] = useState(false);
  const [shouldStart, setShouldStart] = useState(false);
  const [shouldEditingOptions, setShouldEditingOptions] = useState(false);
  const [shouldUninstall, setShouldUninstall] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const onInstallCheckDone = () => {
    setShouldCheckInstall(false);
  };
  const onGameUpdateDoneChecking = (needToUpdateGame: boolean) => {
    setShouldUpdateBinaries(!needToUpdateGame);
  };
  const onDownloadDone = () => {
    setShouldDownload(false);
    setShouldUpdateBinaries(true);
  };
  const onBinariesUpdateDone = () => {
    setShouldUpdateBinaries(false);
    setFlipFlapConfig(!flipFlapConfig);
  };
  const onStartDone = () => {
    setShouldStart(false);
    if (!hasStartError.isError) setIsPlaying(true);
  };
  const onPlayDone = () => {
    setIsPlaying(false);
  };
  const onGameInstallDone = () => {
    setShouldInstall(false);
    setShouldCheckInstall(true);
    setFlipFlapConfig(!flipFlapConfig);
    reset();
  };
  const onGameUninstallDone = () => {
    setShouldUninstall(false);
    setShouldCheckInstall(true);
    setFlipFlapConfig(!flipFlapConfig);
  };

  const { isLoading, configuration } = useGameConfiguration(flipFlapConfig);
  const { doneInstallChecking, isGameInstalled, hasGameInstallCheckError } = useGameInstallCheck(
    shouldCheckInstall,
    onInstallCheckDone,
    configuration,
  );
  const { hasGameInstallError, gameInstallProgress } = useGameInstall(shouldInstall, onGameInstallDone, configuration);
  const { isValidLicence, doneLicenceChecking, resetLicenceCheck } = useCheckLicence(isGameInstalled, configuration);
  const { updateCheckProgress, filesToDownload, doneChecking, hasGameUpdateCheckError, resetGameUpdateCheck } = useGameUpdateCheck(
    isValidLicence,
    onGameUpdateDoneChecking,
    configuration,
  );
  const { overallProgress, downloadProgress, downloadDone, hasError, resetDownloadGameUpdate } = useDownloadGameUpdate(
    shouldDownload,
    filesToDownload,
    onDownloadDone,
    configuration,
  );
  const { binariesUpdateProgress, hasBinariesUpdateError } = useBinariesUpdate(shouldUpdateBinaries, onBinariesUpdateDone, configuration);
  const { startProgress, hasStartError } = useStartGame(shouldStart, onStartDone, configuration);
  const { hasPlayError } = usePlayGame(isPlaying, onPlayDone, configuration);
  const { hasGameUninstallError, gameUninstallProgress } = useGameUninstall(shouldUninstall, onGameUninstallDone, configuration);

  const getProgress = () => {
    if (shouldStart) return startProgress;
    if (shouldDownload) return downloadProgress;

    return updateCheckProgress;
  };

  const reset = () => {
    resetLicenceCheck();
    resetGameUpdateCheck();
    resetDownloadGameUpdate();
  };

  return {
    state: computeState(
      isLoading,
      doneInstallChecking,
      isGameInstalled,
      doneLicenceChecking,
      isValidLicence,
      doneChecking,
      filesToDownload,
      shouldDownload,
      downloadDone,
      shouldUpdateBinaries,
      shouldStart,
      isPlaying,
      shouldInstall,
      shouldEditingOptions,
      shouldUninstall,
    ),
    configuration: configuration ?? defaultConfiguration,
    gameInstallProgress,
    binariesUpdateProgress,
    gameUninstallProgress,
    progress: getProgress(),
    overallProgress,
    fileCount: filesToDownload.length,
    hasGameInstallCheckError,
    hasGameInstallError,
    hasGameUpdateCheckError,
    hasBinariesUpdateError,
    hasGameUninstallError,
    hasError,
    hasStartError,
    hasPlayError,
    handleDownloadClick: () => setShouldDownload(true),
    handleStartClick: () => setShouldStart(true),
    handleInstallClick: () => setShouldInstall(true),
    handleEditingOptionsClick: (open) => setShouldEditingOptions(open),
    handleUninstallClick: () => setShouldUninstall(true),
  };
};

export const LauncherContextProvider = ({ children }: { children: ReactNode }) => {
  const launcherContext = useLauncherContextService();
  return <LauncherContextHolder.Provider value={launcherContext}>{children}</LauncherContextHolder.Provider>;
};
