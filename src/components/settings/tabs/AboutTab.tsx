import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useLauncherContext } from '@components/LauncherContext';
import { ContentTitle, FieldDesc, FieldLabel } from '../SettingsStyles';

const AboutRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  h3 {
    ${({ theme }) => theme.fonts.body.medium}
    color: ${({ theme }) => theme.color.text.default};
    margin: 0;
  }

  .separator {
    color: ${({ theme }) => theme.color.border.subtle};
  }

  span.version {
    ${({ theme }) => theme.fonts.body.small}
    color: ${({ theme }) => theme.color.text.subtle};
  }
`;

const AboutActionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
`;

const AboutActionLabels = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ActionBtn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 2px solid ${({ theme }) => theme.color.border.subtle};
  background: ${({ theme }) => theme.color.surface.overlay};
  color: ${({ theme }) => theme.color.text.muted};
  ${({ theme }) => theme.fonts.body.small}
  cursor: pointer;
  user-select: none;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  align-self: center;

  &:hover {
    background: ${({ theme }) => theme.color.background.subtle.hover};
    color: ${({ theme }) => theme.color.text.default};
  }
`;

export const AboutTab = () => {
  const { t } = useTranslation();
  const { configuration, environment } = useLauncherContext();
  const [launcherVersion, setLauncherVersion] = useState('...');

  React.useEffect(() => {
    window.launcherApi
      .version()
      .then(setLauncherVersion)
      .catch(() => setLauncherVersion('1.0.5'));
  }, []);

  return (
    <>
      <ContentTitle>{t('settings_about')}</ContentTitle>

      <AboutRow>
        <h3>{t('settings_launcher_title')}</h3>
        <span className="separator">|</span>
        <span className="version">{launcherVersion}</span>
      </AboutRow>

      <AboutActionRow>
        <AboutActionLabels>
          <FieldLabel>{t('settings_changelog')}</FieldLabel>
          <FieldDesc>{t('settings_changelog_desc')}</FieldDesc>
        </AboutActionLabels>
        <ActionBtn onClick={() => window.launcherApi.openLogsFolder(configuration.gamePath, environment)}>{t('settings_open_changelog')}</ActionBtn>
      </AboutActionRow>

      <AboutActionRow>
        <FieldLabel>{t('settings_check_launcher_update')}</FieldLabel>
        <ActionBtn onClick={() => window.launcherApi.checkUpdate()}>{t('settings_check')}</ActionBtn>
      </AboutActionRow>
    </>
  );
};
