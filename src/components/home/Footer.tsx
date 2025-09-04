import styled from 'styled-components';

export const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  z-index: 2;

  .right-button {
    display: flex;
    gap: 16px;
  }
`;

export const FullWidthFooter = styled.div`
  z-index: 2;
`;

export const ErrorText = styled.span`
  ${({ theme }) => theme.fonts.body.medium}
  color: ${({ theme }) => theme.color.text.critical.subtle};
`;
