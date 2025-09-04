import styled from 'styled-components';

type ButtonProps = {
  disabled?: boolean;
};

export const BaseButtonStyle = styled.a.attrs<ButtonProps>((props) => ({
  'data-disabled': props.disabled ? true : undefined,
}))<ButtonProps>`
  pointer-events: ${(props) => (props.disabled ? 'none' : 'initial')};
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 8px 16px 8px 16px;
  border-radius: 8px;
  box-sizing: border-box;
  ${({ theme }) => theme.fonts.label.medium}

  &[data-disabled] {
    pointer-events: none;
    color: ${({ theme }) => theme.color.text.disabled};
    background: ${({ theme }) => theme.color.background.disabled};
    background-blend-mode: none;
    box-shadow: none;
    border: none;
  }

  &:visited {
    text-decoration: none;
  }

  &:hover {
    cursor: pointer;
  }
`;

export const DeleteButton = styled(BaseButtonStyle)`
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 50%), ${({ theme }) => theme.color.background.critical.emphasis.default};
  background-blend-mode: color-burn, normal;
  box-shadow:
    0px 1px 1px -0.5px rgba(0, 0, 0, 0.05),
    0px 3px 3px -1.5px rgba(0, 0, 0, 0.05),
    0px 6px 6px -3px rgba(0, 0, 0, 0.05),
    inset 0px 1px 0px 1px rgba(255, 255, 255, 0.4);
  color: ${({ theme }) => theme.color.text.static.white};
  border: 1px solid ${({ theme }) => theme.button.solid.color.critical.border};

  &:hover {
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 50%), ${({ theme }) => theme.color.background.critical.emphasis.hover};
  }

  &:active {
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 50%),
      ${({ theme }) => theme.color.background.critical.emphasis.active};
  }
`;

export const GhostButton = styled(BaseButtonStyle)`
  color: ${({ theme }) => theme.color.text.muted};

  &:hover {
    background: ${({ theme }) => theme.color.background.subtle.hover};
  }

  &:active {
    background: ${({ theme }) => theme.color.background.subtle.active};
  }
`;

export const LinkButton = styled(BaseButtonStyle)`
  padding: 0;
  color: ${({ theme }) => theme.color.text.muted};

  &:active {
    color: ${({ theme }) => theme.color.text.default};
  }
`;

export const NeutralButton = styled(BaseButtonStyle)`
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0.05) 100%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0) 50%), ${({ theme }) => theme.color.background.subtle.default};
  background-blend-mode: overlay, color-burn, normal;
  box-shadow:
    inset 0px 2px 0px rgba(255, 255, 255, 0.0001),
    inset 0px -2px 0px rgba(0, 0, 0, 0.5);
  color: ${({ theme }) => theme.color.icon.default.default};
  border: 1px ${({ theme }) => theme.color.border.subtle} solid;

  &:hover {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0.05) 100%),
      linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0) 50%), ${({ theme }) => theme.color.background.subtle.hover};
  }

  &:active {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0.05) 100%),
      linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0) 50%), ${({ theme }) => theme.color.background.subtle.active};
    box-shadow: none;
  }
`;

export const PrimaryButton = styled(BaseButtonStyle)`
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 50%), ${({ theme }) => theme.color.background.accent.emphasis.default};
  background-blend-mode: color-burn, normal;
  box-shadow:
    0px 1px 1px -0.5px rgba(0, 0, 0, 0.05),
    0px 3px 3px -1.5px rgba(0, 0, 0, 0.05),
    0px 6px 6px -3px rgba(0, 0, 0, 0.05),
    inset 0px 1px 0px 1px rgba(255, 255, 255, 0.4);
  color: ${({ theme }) => theme.color.text.static.white};
  border: 1px ${({ theme }) => theme.button.solid.color.border} solid;

  &:hover {
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 50%), ${({ theme }) => theme.color.background.accent.emphasis.hover};
  }

  &:active {
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 50%), ${({ theme }) => theme.color.background.accent.emphasis.active};
  }
`;

export const SoftButton = styled(BaseButtonStyle)`
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0.1) 100%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0) 50%), ${({ theme }) => theme.color.background.accent.muted.default};
  background-blend-mode: overlay, color-burn, normal;
  box-shadow:
    inset 0px 2px 0px rgba(255, 255, 255, 0.0001),
    inset 0px -2px 0px rgba(0, 0, 0, 0.5);
  color: ${({ theme }) => theme.color.icon.accent};
  border: 1px ${({ theme }) => theme.color.border.accent.default} solid;

  &:hover {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0.1) 100%),
      linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0) 50%), ${({ theme }) => theme.color.background.accent.muted.hover};
  }

  &:active {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0.1) 100%),
      linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0) 50%), ${({ theme }) => theme.color.background.accent.muted.active};
    box-shadow: none;
  }
`;
