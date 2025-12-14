import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import CloseIconAppSvg from '@assets/close_icon_app.svg';
import MenuIconSvg from '@assets/menu_icon.svg';
import MinimizeIconSvg from '@assets/minimize_icon.svg';

import { useTranslation } from 'react-i18next';
import { useEnvironment } from './context/EnvironmentContext';

type TitlebarContainerProps = {
  isOpen: boolean;
};

const TitlebarContainer = styled.div<TitlebarContainerProps>`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: ${({ theme }) => theme.titlebar.height};
  background: ${({ theme }) => theme.color.background.static.dark.default};
  color: ${({ theme }) => theme.color.text.subtle};
  z-index: 9999;
  -webkit-app-region: drag;

  .title {
    ${({ theme }) => theme.fonts.label.small}
    font-size: 14px;
    margin-left: 8px;
  }

  .subtitle {
    ${({ theme }) => theme.fonts.label.small};
    color: ${({ theme }) => theme.color.text.disabled};
    cursor: pointer;
    -webkit-app-region: no-drag;
  }

  .action-container {
    display: flex;
    flex-direction: row;
    height: ${({ theme }) => theme.titlebar.height};
    -webkit-app-region: no-drag;

    .minimize,
    .menu-icon {
      display: flex;
      width: 40px;
      justify-content: center;

      &:hover {
        background: ${({ theme }) => theme.color.background.subtle.hover};
      }
      &:active {
        background: ${({ theme }) => theme.color.background.subtle.active};
      }
    }

    .minimize {
      & svg {
        margin-top: -7px;
      }
    }

    .menu-icon {
      ${({ theme, isOpen }) => isOpen && `background: ${theme.color.background.subtle.active};`};
      &:hover {
        ${({ theme, isOpen }) => isOpen && `background: ${theme.color.background.subtle.active};`};
      }
      & svg {
        margin-top: 1px;
      }
    }

    .close {
      display: flex;
      width: 40px;
      align-items: center;
      justify-content: center;

      &:hover {
        background: ${({ theme }) => theme.color.background.critical.emphasis.hover};
        color: ${({ theme }) => theme.color.text.static.white};
      }
      &:active {
        background: ${({ theme }) => theme.color.background.critical.emphasis.active};
        color: ${({ theme }) => theme.color.text.static.white};
      }
    }
  }

  .menu {
    position: absolute;
    top: 26px;
    right: 80px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: ${({ theme }) => theme.color.surface.overlay};
    backdrop-filter: blur(60px);
    border: 1px solid ${({ theme }) => theme.color.border.subtle};
    border-radius: 8px;
    padding: 8px 16px;
    margin-top: 2px;

    .menu-title {
      ${({ theme }) => theme.fonts.label.medium}
      color: ${({ theme }) => theme.color.text.default};
    }

    .sub-menu {
      display: flex;
      flex-direction: column;
      gap: 4px;
      ${({ theme }) => theme.fonts.body.small}
      color: ${({ theme }) => theme.color.text.subtle};
    }
  }
`;

export const Titlebar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [version, setVersion] = useState('');
  const { t } = useTranslation();
  const { environment } = useEnvironment();

  useEffect(() => {
    window.launcherApi.version().then((version) => setVersion(version));
  }, []);

  useEffect(() => {
    const listener = () => isOpen && setIsOpen(false);
    window.addEventListener('click', listener);

    return () => window.removeEventListener('click', listener);
  }, [isOpen]);

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return window.launcherApi.platform() === 'win32' ? (
    <TitlebarContainer isOpen={isOpen}>
      <div>
        <span className="title">Game Launcher</span>
        <a onClick={() => window.launcherApi.externalWindow('https://www.google.com/')} target="_blank" className="subtitle">
          {' '}
          • {environment}
        </a>
      </div>
      <div className="action-container">
        <div className="menu-icon" onClick={onClick}>
          <MenuIconSvg />
        </div>
        <div className="minimize" onClick={window.launcherApi.minimizeLauncher} tabIndex={0}>
          <MinimizeIconSvg />
        </div>
        <div className="close" onClick={window.launcherApi.closeLauncher} tabIndex={0}>
          <CloseIconAppSvg />
        </div>
      </div>
      {isOpen && (
        <div className="menu">
          <span className="menu-title">Game Launcher</span>
          <div className="sub-menu">
            <span>{`${t('editor')} Pokémon Workshop`}</span>
            <span>{`Version ${version}`}</span>
          </div>
        </div>
      )}
    </TitlebarContainer>
  ) : (
    <></>
  );
};
