import { useOverlayHandlingCloseRef } from '@components/hooks/useHandleCloseOverlay';
import { DialogRefData } from '@hooks/useDialogsRef';
import React, { forwardRef, ReactNode, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { Titlebar } from './Titlebar';
import { MessageBoxContainer } from './MessageBoxContainer';

type DialogContainerProps = {
  isCenter: boolean;
};

export const DialogContainer = styled.dialog<DialogContainerProps>`
  overflow: visible;
  padding: 0;
  border: 0;
  background-color: transparent;
  margin: 0;
  display: grid;
  grid-template-rows: ${({ theme }) => theme.titlebar.height} auto;
  min-width: 100vw;
  min-height: 100%;
  opacity: 0;

  ${MessageBoxContainer} {
    margin: ${({ isCenter }) => (isCenter ? 'auto' : '0')};
  }

  &::backdrop {
    background-color: rgba(9, 11, 10, 0.3);
    top: ${({ theme }) => theme.titlebar.height};
  }

  &[open] {
    opacity: 1;
  }

  &:focus {
    outline: 0;
  }
`;

const onDialogCancel = (e: Event) => e.preventDefault();

const animationKeys = {
  open: [
    { offset: 0, opacity: 0 },
    { offset: 0.25, opacity: 0 },
    { offset: 1, opacity: 1 },
  ],
  close: [
    { offset: 0, opacity: 1 },
    { offset: 0.25, opacity: 1 },
    { offset: 1, opacity: 0 },
  ],
};

const animationOption = {
  duration: 200,
  easing: 'ease-in',
} as const;

const closeDialogWithAnimation = (dialog: HTMLDialogElement, onFinish: () => void) => {
  const animation = dialog.animate(animationKeys.close, animationOption);
  animation.onfinish = () => {
    onFinish();
    dialog.close();
    dialog.removeEventListener('cancel', onDialogCancel);
  };
};

const openDialogWithAnimation = (dialog: HTMLDialogElement) => {
  dialog.addEventListener('cancel', onDialogCancel);
  dialog.showModal();
  dialog.animate(animationKeys.open, animationOption);
};

/**
 * Generic editor overlay to extend with a proper rendering definition.
 *
 * This generic overlay assign a DialogsRef allow other components to open/close dialogs.
 * The possible dialogs are defined with the template Keys parameter.
 * The dialogsRef is set by this component but needs to be created using useRef in the component rendering the overlay (see example).
 * @example
 * // In definition file
 * export const DialogOverlay = defineEditorOverlay<DialogKeys, Props>(
 *   'DialogOverlay',
 *   (dialogToShow, handleCloseRef, closeDialog, { onTranslationClose }) => {
 *     switch (dialogToShow) {
 *       case 'uninstall':
 *         return <UninstallDialog closeDialog={closeDialog} ref={handleCloseRef} />;
 *       case 'options':
 *         return <OptionsDialog onTranslationClose={onTranslationClose} ref={handleCloseRef} />; *
 *       default:
 *         return assertUnreachable(dialogToShow);
 *     }
 *   }
 * );
 * // In Page File
 * const dialogsRef = useDialogsRef<DialogKeys>();
 * // [...]
 *   <DialogOverlay onTranslationClose={doSomething} ref={dialogsRef} />
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const defineOverlay = <Keys extends string, Props extends Record<string, unknown> = {}>(
  displayName: string,
  renderInnerDialog: (
    dialogToShow: Keys,
    handleCloseRef: ReturnType<typeof useOverlayHandlingCloseRef>,
    closeDialog: () => void,
    props: Props,
  ) => ReactNode,
) => {
  const reactComponent = forwardRef<DialogRefData<Keys>, Props>((props, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const handleCloseRef = useOverlayHandlingCloseRef();
    const [currentDialog, setCurrentDialog] = useState<Keys | undefined>(undefined);
    const [isCenter, setIsCenter] = useState(false);

    const closeDialog = () => {
      handleCloseRef.current?.onClose();
      if (dialogRef.current) closeDialogWithAnimation(dialogRef.current, () => setCurrentDialog(undefined));
    };

    const currentlyRenderedDialog = useMemo(() => {
      if (!currentDialog) return null;

      return renderInnerDialog(currentDialog, handleCloseRef, closeDialog, props);
    }, [currentDialog, props]);

    const onEscape = () => {
      if (handleCloseRef.current?.canClose()) closeDialog();
    };

    const onClickOutside = (e: React.MouseEvent<HTMLDialogElement, MouseEvent>) => {
      if (e.currentTarget === e.target) onEscape();
    };

    const openDialog = (name: Keys, isCenterDialog?: boolean) => {
      setIsCenter(isCenterDialog || false);
      setCurrentDialog(name);
      if (dialogRef.current) openDialogWithAnimation(dialogRef.current);
    };

    useImperativeHandle(ref, () => ({ closeDialog, openDialog: openDialog, currentDialog }), [currentDialog]);

    // Handle user pressing the escape key
    useEffect(() => {
      const handleKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && currentDialog) {
          event.preventDefault();
          onEscape();
        }
      };
      window.addEventListener('keydown', handleKey);

      return () => window.removeEventListener('keydown', handleKey);
    }, [currentDialog]);

    return createPortal(
      <DialogContainer ref={dialogRef} onMouseDown={onClickOutside} isCenter={isCenter}>
        <Titlebar />
        {currentlyRenderedDialog}
      </DialogContainer>,
      document.querySelector('#dialogs') || document.createElement('div'),
    );
  });
  reactComponent.displayName = displayName;
  return reactComponent;
};

export const overlayHidden = (hidden: boolean) => {
  const dialog = document.getElementById('dialogs');
  if (dialog) dialog.hidden = hidden;
};
