import { OverlayHandlingClose, useOverlayHandlingClose } from '@hooks/useHandleCloseOverlay';
import { DeleteButton, GhostButton } from './buttons';
import React, { forwardRef } from 'react';
import {
  MessageBoxActionContainer,
  MessageBoxContainer,
  MessageBoxIconErrorContainer,
  MessageBoxTextContainer,
  MessageBoxTitleIconContainer,
} from './MessageBoxContainer';
import DeleteSvg from '@assets/delete_icon.svg';
import { useTranslation } from 'react-i18next';

type UninstallDialogProps = {
  closeDialog: () => void;
  handleUninstallClick: () => void;
};

export const UninstallDialog = forwardRef<OverlayHandlingClose, UninstallDialogProps>(({ closeDialog, handleUninstallClick }, ref) => {
  const { t } = useTranslation();

  const onClickUninstall = () => {
    handleUninstallClick();
    closeDialog();
  };

  useOverlayHandlingClose(ref);

  return (
    <MessageBoxContainer>
      <MessageBoxTitleIconContainer>
        <MessageBoxIconErrorContainer>
          <DeleteSvg />
        </MessageBoxIconErrorContainer>
        <h3>{t('uninstall_dialog_title')}</h3>
      </MessageBoxTitleIconContainer>
      <MessageBoxTextContainer>
        <p>{t('uninstall_dialog_message')}</p>
      </MessageBoxTextContainer>
      <MessageBoxActionContainer>
        <GhostButton onClick={closeDialog}>{t('uninstall_cancel')}</GhostButton>
        <DeleteButton onClick={onClickUninstall}>{t('menu_uninstall')}</DeleteButton>
      </MessageBoxActionContainer>
    </MessageBoxContainer>
  );
});
UninstallDialog.displayName = 'UninstallDialog';
