import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import { useLauncherContext } from '@components/LauncherContext';
import { GameEnvironment } from '@src/types';
import { ContentTitle, FieldDesc, FieldGroup, FieldLabel } from '../SettingsStyles';
import { SelectField, SelectOption } from '../SelectField';

const LicenceLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  ${({ theme }) => theme.fonts.body.medium}
  color: ${({ theme }) => theme.color.text.default};

  span.required {
    color: #e05252;
  }
`;

const LicenceInputRow = styled.div`
  display: flex;
  align-items: center;
  border-radius: 8px;
  border: 2px solid ${({ theme }) => theme.color.border.subtle};
  background: ${({ theme }) => theme.color.surface.overlay};
  overflow: hidden;

  .circle-icon {
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    svg {
      width: 22px;
      height: 22px;
    }
  }

  input {
    flex: 1;
    padding: 6px 4px;
    border: none;
    background: transparent;
    color: ${({ theme }) => theme.color.text.subtle};
    ${({ theme }) => theme.fonts.body.medium}
    outline: none;
    letter-spacing: 0.05em;

    &::placeholder {
      color: ${({ theme }) => theme.color.text.disabled};
    }
  }

  .check-icon {
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const LicenceValidText = styled.span`
  ${({ theme }) => theme.fonts.body.small}
  color: rgba(55, 165, 133, 1);
`;

const KeyIcon = () => {
  const theme = useTheme();
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8.5" cy="15.5" r="3.5" stroke={theme.color.text.subtle} strokeWidth="1.8" />
      <line x1="11.5" y1="12.5" x2="20" y2="4" stroke={theme.color.text.subtle} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="17.5" y1="6.5" x2="20" y2="9" stroke={theme.color.text.subtle} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="15" y1="9" x2="17" y2="11" stroke={theme.color.text.subtle} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
};

const CheckIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="9" stroke="rgba(20, 134, 105, 1)" strokeWidth="1.5" />
    <path d="M6.5 10.5L8.5 12.5L13.5 7.5" stroke="rgba(20, 134, 105, 1)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type EnvironmentTabProps = {
  onEnvChange: (env: GameEnvironment) => void;
};

export const EnvironmentTab = ({ onEnvChange }: EnvironmentTabProps) => {
  const { t } = useTranslation();
  const { environment, configuration } = useLauncherContext();
  const [selected, setSelected] = useState<GameEnvironment>(environment);
  const [licence, setLicence] = useState('');

  const channelLabels: Record<string, string> = {
    stable: t('settings_channel_stable'),
    beta: t('settings_channel_beta'),
  };

  const channelOptions: SelectOption[] = Object.keys(configuration.channels).map((channel) => ({
    value: channel,
    label: channelLabels[channel] ?? channel,
  }));

  const needsKey = !!configuration.channels[selected]?.tokenRequired;
  const licenceValid = licence.trim().length > 0;

  const handleChange = (env: string) => {
    setSelected(env as GameEnvironment);
    onEnvChange(env as GameEnvironment);
  };

  return (
    <>
      <ContentTitle>{t('settings_environment')}</ContentTitle>

      <FieldGroup>
        <FieldLabel>{t('settings_game_version')}</FieldLabel>
        <SelectField value={selected} options={channelOptions} onChange={handleChange} />
        <FieldDesc>{t('settings_game_version_desc')}</FieldDesc>
      </FieldGroup>

      {needsKey && (
        <FieldGroup>
          <LicenceLabel>
            {t('settings_access_key')} <span className="required">*</span>
          </LicenceLabel>
          <LicenceInputRow>
            <span className="circle-icon">
              <KeyIcon />
            </span>
            <input type="text" placeholder="xxxx-xxxx-xxxx-xxxx" value={licence} onChange={(e) => setLicence(e.target.value)} />
            {licenceValid && (
              <span className="check-icon">
                <CheckIcon />
              </span>
            )}
          </LicenceInputRow>
          {licenceValid && <LicenceValidText>{t('settings_key_activated')}</LicenceValidText>}
        </FieldGroup>
      )}
    </>
  );
};
