import { DialogRefData } from '@hooks/useDialogsRef';
import { defineOverlay } from './Overlay';
import { assertUnreachable } from '@utils/assertUnreachable';
import { UninstallDialog } from './UninstallDialog';
import React from 'react';

export type DialogKeys = 'uninstall';
export type DialogRef = React.RefObject<DialogRefData<DialogKeys>>;

export const DialogOverlay = defineOverlay<
  DialogKeys,
  {
    handleUninstallClick: () => void;
  }
>('PokemonEditorOverlay', (dialogToShow, handleCloseRef, closeDialog, props) => {
  switch (dialogToShow) {
    case 'uninstall':
      return <UninstallDialog ref={handleCloseRef} closeDialog={closeDialog} handleUninstallClick={props.handleUninstallClick} />;
    default:
      return assertUnreachable(dialogToShow);
  }
});
