import styled from 'styled-components';

export const MessageBoxContainer = styled.div`
  width: 512px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  padding: 24px;
  background: ${({ theme }) => theme.color.surface.overlay};
  backdrop-filter: blur(60px);
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: 8px;
  user-select: none;
`;

export const MessageBoxTitleIconContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  padding-top: 8px;

  & > h3 {
    ${({ theme }) => theme.fonts.body.large}
    color: ${({ theme }) => theme.color.text.default};
    margin: 0;
    text-align: center;
  }
`;

const MessageBoxIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 100%;

  svg {
    align-items: center;
    justify-content: center;
  }
`;

export const MessageBoxIconErrorContainer = styled(MessageBoxIconContainer)`
  background: ${({ theme }) => theme.color.background.critical.subtle.default};
  color: ${({ theme }) => theme.color.icon.critical};
`;

export const MessageBoxTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  ${({ theme }) => theme.fonts.body.small}
  color: ${({ theme }) => theme.color.text.subtle};

  & > p {
    margin: 0;
    text-align: center;
    white-space: pre-line;
  }

  .red {
    color: ${({ theme }) => theme.color.text.critical.subtle};
  }
`;

export const MessageBoxActionContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-self: flex-end;
  align-items: center;
  gap: 16px;
  padding-top: 8px;
`;

export const MessageBoxActionContainerSpaceBetween = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 8px;
`;
