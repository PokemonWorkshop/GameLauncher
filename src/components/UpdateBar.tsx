import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import CloseIcon from '@assets/close_icon_notification.svg';

import { useTranslation } from 'react-i18next';
import { GhostButton, LinkButton } from './buttons';

const UpdateBarComponent = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.titlebar.height};
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  padding: 8px 8px 8px 12px;
  height: 40px;
  margin-top: 16px;
  left: 196px;
  width: calc(100vw - 392px);
  box-sizing: border-box;
  background: ${({ theme }) => theme.color.background.accent.subtle.default};
  box-shadow:
    0px 1px 1px -0.5px rgba(0, 0, 0, 0.05),
    0px 6px 6px -3px rgba(0, 0, 0, 0.05);
  border: 1px solid ${({ theme }) => theme.color.border.accent.subtle};
  border-radius: 8px;
  z-index: 1000;

  & .actions {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    ${({ theme }) => theme.fonts.label.small}
    color: ${({ theme }) => theme.color.text.default};
    width: 100%;
  }

  ${LinkButton} {
    ${({ theme }) => theme.fonts.label.small}
    color: ${({ theme }) => theme.color.text.link.default};

    &:active {
      color: ${({ theme }) => theme.color.text.accent.muted};
    }
  }

  ${GhostButton} {
    padding: 0;
    min-width: 24px;
    max-height: 24px;
    color: ${({ theme }) => theme.color.text.link.default};
  }
`;

export const UpdateBar = () => {
  const [showUpdateBar, setShowUpdateBar] = useState<boolean>(false);
  const { t } = useTranslation();

  const listener: Parameters<typeof window.launcherApi.requestUpdateDownloaded.on>[0] = async () => {
    setShowUpdateBar(true);
  };

  useEffect(() => {
    window.launcherApi.checkUpdate();
    window.launcherApi.requestUpdateDownloaded.on(listener);

    return () => window.launcherApi.requestUpdateDownloaded.removeListener(listener);
  }, []);

  return showUpdateBar ? (
    <UpdateBarComponent>
      <div className="actions">
        <span>{t('new_version_downloaded')}</span>
        <LinkButton onClick={async () => await window.launcherApi.quitAndInstall()}>{t('restart_app')}</LinkButton>
      </div>
      <GhostButton onClick={() => setShowUpdateBar(false)}>
        <CloseIcon />
      </GhostButton>
    </UpdateBarComponent>
  ) : (
    <></>
  );
};
