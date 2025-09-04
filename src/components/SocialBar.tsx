import React, { useMemo } from 'react';
import styled from 'styled-components';

import { SocialButton } from './buttons';
import { SocialLinks, SocialVariant } from '@src/types';

export const SocialBarContainer = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.titlebar.height};
  right: 0;
  display: flex;
  height: calc(100vh - ${({ theme }) => theme.titlebar.height});
  flex-direction: column;
  padding: 48px 16px;
  gap: 24px;
  background-color: ${({ theme }) => theme.color.static.black['250']};
  z-index: 1;
`;

type SocialBarProps = {
  socialLinks: SocialLinks;
};

export const SocialBar = ({ socialLinks }: SocialBarProps) => {
  const links = useMemo(() => Object.entries(socialLinks) as [SocialVariant, string][], [socialLinks]);
  return (
    <SocialBarContainer>
      {links.map(([variant, link]) => {
        if (!link) return;

        return <SocialButton link={link} variant={variant} key={`social-${variant}`} />;
      })}
    </SocialBarContainer>
  );
};
