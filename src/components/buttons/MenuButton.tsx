import { IconButton } from './IconButton';
import MenuIconSvg from '@assets/menu_button_icon.svg';
import styled from 'styled-components';
import React from 'react';

const MenuButtonContainer = styled(IconButton)`
  &.open {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0.05) 100%),
      linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0) 50%), ${({ theme }) => theme.color.background.subtle.active};
    box-shadow: none;
  }
`;

type MenuButtonProps = {
  disabled?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

export const MenuButton = ({ ...props }: MenuButtonProps) => {
  return (
    <MenuButtonContainer {...props}>
      <MenuIconSvg />
    </MenuButtonContainer>
  );
};
