import { OverlayHandlingClose, useOverlayHandlingClose } from '@hooks/useHandleCloseOverlay';
import React, { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLauncherContext } from '@components/LauncherContext';
import { Content, SettingsBox, Sidebar, SidebarItem } from './SettingsStyles';
import { GeneralTab } from './tabs/GeneralTab';
import { EnvironmentTab } from './tabs/EnvironmentTab';
import { AboutTab } from './tabs/AboutTab';

type Tab = 'general' | 'environment' | 'about';

type SettingsDialogProps = {
  closeDialog: () => void;
};

export const SettingsDialog = forwardRef<OverlayHandlingClose, SettingsDialogProps>((_, ref) => {
  const { t } = useTranslation();
  const { handleEnvironmentClick } = useLauncherContext();
  const [activeTab, setActiveTab] = useState<Tab>('general');

  useOverlayHandlingClose(ref);

  return (
    <SettingsBox>
      <Sidebar>
        <h4>{t('settings_params')}</h4>
        <SidebarItem active={activeTab === 'general'} onClick={() => setActiveTab('general')}>
          {t('settings_general')}
        </SidebarItem>
        <SidebarItem active={activeTab === 'environment'} onClick={() => setActiveTab('environment')}>
          {t('settings_environment')}
        </SidebarItem>
        <SidebarItem active={activeTab === 'about'} onClick={() => setActiveTab('about')}>
          {t('settings_about')}
        </SidebarItem>
      </Sidebar>

      <Content>
        {activeTab === 'general' && <GeneralTab />}
        {activeTab === 'environment' && <EnvironmentTab onEnvChange={handleEnvironmentClick} />}
        {activeTab === 'about' && <AboutTab />}
      </Content>
    </SettingsBox>
  );
});

SettingsDialog.displayName = 'SettingsDialog';
