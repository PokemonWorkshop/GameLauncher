import React from 'react';

import { downloadSpeed } from '@components/DownloadSpeed';
import { useLauncherContext } from '@components/LauncherContext';
import { ProgressBar } from '@components/ProgressBar';
import { SocialBar } from '@components/SocialBar';
import { Titlebar } from '@components/Titlebar';
import { UpdateBar } from '@components/UpdateBar';
import { CloseButton, GhostButton, PrimaryButton } from '@components/buttons';
import { ActionContainer, AppContainer, Footer, Header, HomePageContainer } from '@components/home';
import { ErrorText, FullWidthFooter } from '@components/home/Footer';
import { Menu } from '@components/Menu';
import { DialogKeys, DialogOverlay } from '@components/DialogOverlay';
import { useDialogsRef } from '@components/hooks/useDialogsRef';
import { useTranslation } from 'react-i18next';
import { Title } from '@components/home/Title';
import { Background } from '@components/Background';
import LogoSvg from '@assets/logo.svg';
import { useEnvironment } from '@components/context/EnvironmentContext';

export const Home = () => {
  const {
    state,
    configuration,
    gameInstallProgress,
    binariesUpdateProgress,
    gameUninstallProgress,
    progress,
    overallProgress,
    fileCount,
    hasGameInstallCheckError,
    hasGameInstallError,
    hasGameUpdateCheckError,
    hasBinariesUpdateError,
    hasGameUninstallError,
    hasError,
    hasStartError,
    hasPlayError,
    handleDownloadClick,
    handleStartClick,
    handleInstallClick,
    handleEditingOptionsClick,
    handleUninstallClick,
  } = useLauncherContext();
  const dialogsRef = useDialogsRef<DialogKeys>();
  const { t } = useTranslation();

  function EnvironmentSelector() {
    const { environment, setEnvironment } = useEnvironment();

    return (
      <div>
        <h3>Environnement actuel : {environment}</h3>

        <button onClick={() => setEnvironment('stable')}>Stable</button>
        <button onClick={() => setEnvironment('beta')}>Bêta</button>
      </div>
    );
  }

  return (
    <AppContainer>
      <Titlebar />
      <UpdateBar />
      <HomePageContainer socialBar={state !== 'editing_options'}>
        <Background>
          <LogoSvg />
        </Background>

        {state !== 'editing_options' && <SocialBar socialLinks={configuration.socialLinks} />}
        <Header>
          <p>{t('game_made_with_psdk')}</p>
          {state !== 'install_checking' && state !== 'install_waiting' && state !== 'installing' && (
            <p>{state === 'loading' ? t('config_loading') : `${t('version')} ${configuration ?? '0.0.0'}`}</p>
          )}
        </Header>
        <ActionContainer>
          {state !== 'editing_options' && <Title>Pokémon SDK</Title>}
          {/*{state === 'editing_options' && <Settings />}*/}
        </ActionContainer>
        {state !== 'editing_options' &&
          (state === 'checking' ? (
            <FullWidthFooter>
              <ProgressBar label={t('checking_updates')} value={progress} />
            </FullWidthFooter>
          ) : state === 'installing' && gameInstallProgress.state === 'downloading' ? (
            <FullWidthFooter>
              <ProgressBar
                label={`${t('download_game')}${gameInstallProgress.rate !== 0 ? ` (${downloadSpeed(gameInstallProgress.rate, t)})` : ''}`}
                value={gameInstallProgress.progress}
              />
            </FullWidthFooter>
          ) : state === 'installing' && gameInstallProgress.state === 'extracting' ? (
            <FullWidthFooter>
              <ProgressBar label={t('install_game')} value={gameInstallProgress.progress} />
            </FullWidthFooter>
          ) : state === 'updating' ? (
            <FullWidthFooter>
              <ProgressBar label={`${t('downloading_files')} (${overallProgress}/${fileCount})`} value={progress} />
            </FullWidthFooter>
          ) : state === 'binaries_updating' && binariesUpdateProgress.state === 'checking' ? (
            <FullWidthFooter>
              <ProgressBar label={t('checking_binaries_update')} value={10 + Math.floor(Math.random() * 15)} />
            </FullWidthFooter>
          ) : state === 'binaries_updating' && binariesUpdateProgress.state === 'downloading' ? (
            <FullWidthFooter>
              <ProgressBar
                label={`${t('download_binaries')}${binariesUpdateProgress.rate !== 0 ? ` (${downloadSpeed(binariesUpdateProgress.rate, t)})` : ''}`}
                value={binariesUpdateProgress.progress}
              />
            </FullWidthFooter>
          ) : state === 'binaries_updating' && binariesUpdateProgress.state === 'extracting' ? (
            <FullWidthFooter>
              <ProgressBar label={t('install_binaries')} value={binariesUpdateProgress.progress} />
            </FullWidthFooter>
          ) : state === 'starting' ? (
            <FullWidthFooter>
              <ProgressBar label={t('loading')} value={progress} />
            </FullWidthFooter>
          ) : state === 'uninstalling' ? (
            <FullWidthFooter>
              <ProgressBar label={t('uninstall_game')} value={gameUninstallProgress.progress} />
            </FullWidthFooter>
          ) : (
            <div className="footer">
              {hasGameInstallCheckError.isError && (
                <ErrorText>{`${t('unabled_check_game_installed')} ${hasGameInstallCheckError.message ?? ''}`}</ErrorText>
              )}
              {hasGameInstallError.isError && (
                <ErrorText>{`${t('error_install_game')} ${hasGameInstallError.message ? `(${hasGameInstallError.message})` : ''}`}</ErrorText>
              )}
              {hasGameUpdateCheckError.isError && (
                <ErrorText>{`${t('failed_game_update_check')} ${hasGameUpdateCheckError.message ?? ''}`}</ErrorText>
              )}
              {hasBinariesUpdateError.isError && <ErrorText>{`${t('error_update_binaries')} ${hasBinariesUpdateError.message ?? ''}`}</ErrorText>}
              {hasGameUninstallError.isError && <ErrorText>{`${t('error_uninstalling_game')} ${hasGameUninstallError.message ?? ''}`}</ErrorText>}
              {hasError.isError && <ErrorText>{`${t('failed_download')} ${hasError.message ?? ''}`}</ErrorText>}
              {hasStartError.isError && <ErrorText>{`${t('failed_launch')} ${hasStartError.message ?? ''}`}</ErrorText>}
              {hasPlayError.isError && <ErrorText>{`${t('failed_game')} ${hasPlayError.message ?? ''}`}</ErrorText>}
              {state === 'bad_licence' && <ErrorText>{t('bad_licence')}</ErrorText>}
              <Footer>
                {EnvironmentSelector()}
                {/*<SettingsButton onClick={() => handleEditingOptionsClick(true)} disabled={state !== 'update_waiting' && state !== 'play_waiting'} />*/}
                <div />
                <div className="right-button">
                  {(state === 'install_waiting' || state === 'installing') && (
                    <PrimaryButton disabled={state === 'installing'} onClick={handleInstallClick} tabIndex={0}>
                      {t('install')}
                    </PrimaryButton>
                  )}
                  {(state === 'update_waiting' || state === 'bad_licence') && (
                    <PrimaryButton disabled={state !== 'update_waiting'} onClick={handleDownloadClick} tabIndex={0}>
                      {t('download')}
                    </PrimaryButton>
                  )}
                  {(state === 'play_waiting' || state === 'playing') && (
                    <>
                      <PrimaryButton disabled={state === 'playing' || hasBinariesUpdateError.isError} onClick={handleStartClick} tabIndex={0}>
                        {t('play')}
                      </PrimaryButton>
                      <Menu config={configuration} dialogsRef={dialogsRef} />
                    </>
                  )}
                </div>
              </Footer>
            </div>
          ))}
        {state === 'editing_options' && (
          <Footer>
            <CloseButton onClick={() => handleEditingOptionsClick(false)} />
            <div className="right-button">
              <GhostButton tabIndex={0}>{t('by_default')}</GhostButton>
              <PrimaryButton tabIndex={0}>{t('save')}</PrimaryButton>
            </div>
          </Footer>
        )}
      </HomePageContainer>
      <DialogOverlay ref={dialogsRef} handleUninstallClick={handleUninstallClick} />
    </AppContainer>
  );
};
