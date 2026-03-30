import { GameConfiguration } from '@src/types';
import { MenuButton } from './buttons';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { DialogRef } from './DialogOverlay';
import { useEnvironment } from './context/EnvironmentContext';

const MenuContainer = styled.div`
  position: fixed;
  cursor: default;

  & .menu {
    position: relative;
    right: calc(100% - 48px);
    width: max-content;
    transform: translateY(calc(-100% - 40px - 8px));
    display: flex;
    flex-direction: column;
    gap: 4px;
    box-sizing: border-box;
    padding: 8px;
    background: ${({ theme }) => theme.color.surface.overlay};
    backdrop-filter: blur(60px);
    border: 1px solid ${({ theme }) => theme.color.border.subtle};
    border-radius: 8px;
    ${({ theme }) => theme.fonts.body.medium}

    & span {
      display: flex;
      align-items: center;
      padding: 8px 16px 8px 16px;
      border-radius: 8px;
      color: ${({ theme }) => theme.color.text.default};
      user-select: none;
      cursor: pointer;

      &:hover {
        background: ${({ theme }) => theme.color.background.subtle.translucent.hover};
      }

      &[data-disabled] {
        color: ${({ theme }) => theme.color.text.disabled};
        background: unset;
        cursor: not-allowed;
      }
    }
  }
`;

const MenuButtonContainer = styled.div`
  &.open,
  &.open:hover {
    ${MenuContainer} {
      visibility: visible;
    }
  }

  ${MenuContainer} {
    visibility: hidden;
  }
`;

type MenuProps = {
  config: GameConfiguration;
  dialogsRef: DialogRef;
};

export const Menu = ({ config, dialogsRef }: MenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { environment } = useEnvironment();
  const className = isOpen ? 'open' : undefined;
  const isWindows = window.launcherApi.platform() === 'win32';

  const openMenu = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
    setIsOpen(true);
  };

  const closeMenu = (event: MouseEvent | React.MouseEvent<HTMLSpanElement>, action?: () => void) => {
    if (!isOpen) return;
    if (!menuRef.current?.contains(event.target as HTMLElement)) {
      return setIsOpen(false);
    }

    if (action) action();
    setIsOpen(false);
  };

  useEffect(() => {
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [isOpen]);

  return (
    <MenuButtonContainer className={className}>
      <MenuButton onClick={(e) => (isOpen ? closeMenu(e) : openMenu(e))} className={className} />
      <MenuContainer>
        <div className="menu" ref={menuRef}>
          {isWindows && (
            <span onClick={(event) => closeMenu(event, () => window.launcherApi.createDesktopShortcut())}>{t('menu_create_desktop_shortcut')}</span>
          )}
          <span onClick={(event) => closeMenu(event, () => window.launcherApi.openGameFolder(config.gamePath, environment))}>
            {t('menu_open_game_folder')}
          </span>
          <span data-disabled>{t('menu_choose_save_location')}</span>
          <span onClick={(event) => closeMenu(event, () => dialogsRef.current?.openDialog('uninstall', true))}>{t('menu_uninstall')}</span>
        </div>
      </MenuContainer>
    </MenuButtonContainer>
  );
};
