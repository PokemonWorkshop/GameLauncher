import React from 'react';
import styled from 'styled-components';

import CloseIconSvg from '@assets/close_button_icon.svg';
import SettingsIconSvg from '@assets/settings_button_icon.svg';

import { NeutralButton } from './GenericButtons';

export const IconButton = styled(NeutralButton)`
  width: 40px;
  height: 40px;
  padding: 0;
`;

type CloseButtonProps = {
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

export const CloseButton = ({ disabled, onClick }: CloseButtonProps) => {
  return (
    <IconButton tabIndex={0} onClick={onClick} disabled={disabled}>
      <CloseIconSvg />
    </IconButton>
  );
};

type SettingsButtonProps = {
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

export const SettingsButton = ({ disabled, onClick }: SettingsButtonProps) => {
  return (
    <IconButton tabIndex={0} onClick={onClick} disabled={disabled}>
      <SettingsIconSvg />
    </IconButton>
  );
};
