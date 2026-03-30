import styled from 'styled-components';
import { MessageBoxContainer } from '@components/MessageBoxContainer';

export const SettingsBox = styled(MessageBoxContainer)`
  width: calc(100vw - 96px);
  max-width: 900px;
  height: calc(100vh - 120px);
  max-height: 600px;
  flex-direction: row;
  padding: 0;
  gap: 0;
  overflow: hidden;
`;

export const Sidebar = styled.nav`
  width: 200px;
  flex-shrink: 0;
  background-color: rgba(28, 29, 32, 1);
  padding: 32px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  & > h4 {
    ${({ theme }) => theme.fonts.body.medium}
    color: ${({ theme }) => theme.color.text.subtle};
    margin: 0 8px 16px;
    padding: 0;
    font-weight: 500;
    letter-spacing: 0.05em;
  }
`;

type SidebarItemProps = { active?: boolean };
export const SidebarItem = styled.a<SidebarItemProps>`
  display: block;
  padding: 9px 9px;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  ${({ theme }) => theme.fonts.body.small}
  color: ${({ theme, active }) => (active ? theme.color.text.default : theme.color.text.subtle)};
  background: ${({ theme, active }) => (active ? theme.color.background.subtle.hover : 'transparent')};
  transition:
    background 0.1s,
    color 0.1s;

  &:hover {
    background: ${({ theme }) => theme.color.background.subtle.hover};
    color: ${({ theme }) => theme.color.text.default};
  }
`;

export const Content = styled.div`
  flex: 1;
  padding: 34px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
`;

export const ContentTitle = styled.h2`
  ${({ theme }) => theme.fonts.body.large}
  color: ${({ theme }) => theme.color.text.default};
  margin: 0;
  padding: 0;
`;

export const SettingsFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
  margin-top: auto;
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const FieldLabel = styled.label`
  ${({ theme }) => theme.fonts.body.medium}
  color: ${({ theme }) => theme.color.text.muted};
`;

export const FieldDesc = styled.p`
  ${({ theme }) => theme.fonts.body.small}
  color: ${({ theme }) => theme.color.text.subtle};
  margin: 0;
  line-height: 1.5;
`;

export const SelectContainer = styled.div`
  position: relative;

  & select {
    width: 100%;
    padding: 8px 40px 8px 14px;
    border-radius: 8px;
    border: 2px solid ${({ theme }) => theme.color.border.subtle};
    background: ${({ theme }) => theme.color.surface.overlay};
    color: ${({ theme }) => theme.color.text.subtle};
    ${({ theme }) => theme.fonts.body.medium}
    appearance: none;
    cursor: pointer;
    outline: none;

    option {
      background: ${({ theme }) => theme.color.surface.overlay};
      color: ${({ theme }) => theme.color.text.default};
    }
  }
`;

export const ChevronWrapper = styled.span`
  pointer-events: none;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.color.text.subtle};

  svg {
    width: 20px;
    height: 20px;
  }
`;
