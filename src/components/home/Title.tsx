import styled from 'styled-components';

export const Title = styled.div`
  display: flex;
  justify-content: space-between;
  ${({ theme }) => theme.fonts.body.large}
  font-size: 72px;
  color: ${({ theme }) => theme.color.text.default};
  z-index: 2;
`;
