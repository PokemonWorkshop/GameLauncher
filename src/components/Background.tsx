import styled from 'styled-components';

export const Background = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1;
  color: ${({ theme }) => theme.color.border.subtle};
`;
