import React, { ProgressHTMLAttributes } from 'react';
import styled from 'styled-components';

type ProgressBarStyleProps = {
  hasError?: boolean;
};

const ProgressBarStyle = styled.progress<ProgressBarStyleProps>`
  appearance: none;
  width: auto;
  height: 12px;

  ::-webkit-progress-bar {
    border-radius: 8px;
    background: ${({ theme }) => theme.color.slider.background};
  }

  ::-webkit-progress-value {
    border-radius: 8px 0px 0px 8px;
    background: ${({ theme, hasError }) =>
      hasError ? theme.color.background.critical.emphasis.default : theme.color.background.accent.emphasis.default};
  }
`;

const ProgressBarContainer = styled.div<ProgressBarStyleProps>`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .label {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    color: ${({ theme, hasError }) => (hasError ? theme.color.text.critical.subtle : theme.color.text.muted)};
    ${({ theme }) => theme.fonts.body.medium}
  }
`;

type ProgressBarProps = {
  label: string;
  value: number;
  hasError?: boolean;
} & ProgressHTMLAttributes<HTMLProgressElement>;

export const ProgressBar = ({ label, value, hasError, ...props }: ProgressBarProps) => {
  return (
    <ProgressBarContainer hasError={hasError}>
      <div className="label">
        <span>{label}</span>
        <span>{`${value.toFixed(0)}%`}</span>
      </div>
      <ProgressBarStyle max="100" value={value} hasError={hasError} {...props} />
    </ProgressBarContainer>
  );
};
