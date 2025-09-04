import React, { ReactElement } from 'react';
import styled from 'styled-components';

import DiscordIconSvg from '@assets/discord_icon.svg';
import FacebookIconSvg from '@assets/facebook_icon.svg';
import WebsiteIconSvg from '@assets/website_icon.svg';
import InstagramIconSvg from '@assets/instagram_icon.svg';
import TwitterIconSvg from '@assets/twitter_x_icon.svg';
import YoutubeIconSvg from '@assets/youtube_icon.svg';
import BlueskyIconSvg from '@assets/bluesky_icon.svg';
import TiktokIconSVg from '@assets/tiktok_icon.svg';

import { SoftButton } from './GenericButtons';
import { SocialVariant } from '@src/types';

const SocialButtonStyle = styled(SoftButton)`
  width: 32px;
  height: 32px;
  padding: 0;
`;

type SocialButtonProps = {
  variant: SocialVariant;
  link: string;
  disabled?: boolean;
};

const socialRecord: Record<SocialVariant, ReactElement> = {
  website: <WebsiteIconSvg />,
  discord: <DiscordIconSvg />,
  instagram: <InstagramIconSvg />,
  x: <TwitterIconSvg />,
  facebook: <FacebookIconSvg />,
  youtube: <YoutubeIconSvg />,
  tiktok: <TiktokIconSVg />,
  bluesky: <BlueskyIconSvg />,
};

export const SocialButton = ({ variant, link, disabled }: SocialButtonProps) => {
  const handleSocial = () => {
    window.launcherApi.externalWindow(link);
  };

  return (
    <SocialButtonStyle onClick={handleSocial} disabled={disabled}>
      {socialRecord[variant]}
    </SocialButtonStyle>
  );
};
