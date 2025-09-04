import styled from 'styled-components';

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  ${({ theme }) => theme.fonts.body.medium}
  color: ${({ theme }) => theme.color.text.subtle};
  z-index: 2;

  p {
    margin: 0;
  }
`;
