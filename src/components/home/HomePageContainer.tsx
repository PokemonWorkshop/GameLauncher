import styled from 'styled-components';

import { FullWidthFooter } from './Footer';
import { Header } from './Header';

type HomePageContainerProps = {
  socialBar?: boolean;
};

export const HomePageContainer = styled.div.attrs<HomePageContainerProps>((props) => ({
  'data-social-bar': props.socialBar ? true : undefined,
}))<HomePageContainerProps>`
  display: grid;
  grid-template-rows: 120px auto 120px;
  width: 100vw;
  height: calc(100vh - ${({ theme }) => theme.titlebar.height});
  padding: 48px;

  .footer {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-self: flex-end;
  }

  &[data-social-bar] {
    & ${Header} {
      margin-right: 64px;
    }

    & ${FullWidthFooter} {
      margin-right: 64px;
    }

    .footer {
      margin-right: 64px;
    }
  }
`;
