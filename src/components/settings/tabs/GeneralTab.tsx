import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import styled from 'styled-components';
import { ContentTitle, FieldDesc, FieldGroup, FieldLabel } from '../SettingsStyles';
import { SelectField } from '../SelectField';

const ToggleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
`;

const ToggleLabels = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 52px;
  height: 30px;
  flex-shrink: 0;
  margin-top: 2px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background: ${({ theme }) => theme.color.background.subtle.default};
    border-radius: 30px;
    transition: 0.2s;
    border: 1px solid ${({ theme }) => theme.color.border.subtle};

    &::before {
      content: '';
      position: absolute;
      height: 22px;
      width: 22px;
      left: 3px;
      top: 50%;
      transform: translateY(-50%);
      background: ${({ theme }) => theme.color.text.disabled};
      border-radius: 50%;
      transition: 0.2s;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }
  }

  input:checked + span {
    background: ${({ theme }) => theme.color.background.accent.emphasis.default};
    border-color: ${({ theme }) => theme.color.background.accent.emphasis.default};

    &::before {
      transform: translateY(-50%) translateX(22px);
      background: white;
    }
  }
`;

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English (Anglais)' },
  { value: 'fr', label: 'Français' },
];

export const GeneralTab = () => {
  const { t, i18n } = useTranslation();
  const [autoUpdate, setAutoUpdate] = useState(true);

  const currentLang = i18n.language.startsWith('fr') ? 'fr' : 'en';

  return (
    <>
      <ContentTitle>{t('settings_general')}</ContentTitle>

      <FieldGroup>
        <FieldLabel>{t('settings_launcher_language')}</FieldLabel>
        <SelectField value={currentLang} options={LANGUAGE_OPTIONS} onChange={(val) => i18next.changeLanguage(val)} />
        <FieldDesc>{t('settings_language_desc')}</FieldDesc>
      </FieldGroup>

      <ToggleRow>
        <ToggleLabels>
          <FieldLabel>{t('settings_launcher_update')}</FieldLabel>
          <FieldDesc>{t('settings_launcher_update_desc')}</FieldDesc>
        </ToggleLabels>
        <ToggleSwitch>
          <input type="checkbox" checked={autoUpdate} onChange={(e) => setAutoUpdate(e.target.checked)} />
          <span />
        </ToggleSwitch>
      </ToggleRow>
    </>
  );
};
