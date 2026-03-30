import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import DropDownArrowSvg from '@assets/drop_down_arrow.svg';

const Wrapper = styled.div`
  position: relative;
  user-select: none;
`;

const Trigger = styled.div<{ open: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px 8px 14px;
  border-radius: 8px;
  border: 2px solid ${({ theme, open }) => (open ? theme.color.background.accent.emphasis.default : theme.color.border.subtle)};
  background: ${({ theme }) => theme.color.surface.overlay};
  color: ${({ theme }) => theme.color.text.subtle};
  ${({ theme }) => theme.fonts.body.medium}
  cursor: pointer;
  outline: none;

  &:hover {
    border-color: ${({ theme, open }) => (open ? theme.color.background.accent.emphasis.default : theme.color.border.subtle)};
    background: ${({ theme }) => theme.color.background.subtle.hover};
  }
`;

const ChevronIcon = styled.span<{ open: boolean }>`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: ${({ theme }) => theme.color.text.subtle};
  transform: rotate(${({ open }) => (open ? '180deg' : '0deg')});
  transition: transform 0.2s ease;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const DropdownList = styled.ul<{ open: boolean }>`
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 4px;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 100;
  margin: 0;
  padding: 6px;
  list-style: none;
  border-radius: 8px;
  border: 2px solid ${({ theme }) => theme.color.border.subtle};
  background: ${({ theme }) => theme.color.surface.overlay};
  backdrop-filter: blur(60px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  overflow: hidden;

  opacity: ${({ open }) => (open ? 1 : 0)};
  transform: ${({ open }) => (open ? 'translateY(0)' : 'translateY(-6px)')};
  pointer-events: ${({ open }) => (open ? 'all' : 'none')};
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
`;

const DropdownItem = styled.li<{ selected: boolean }>`
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  ${({ theme }) => theme.fonts.body.small}
  color: ${({ theme, selected }) => (selected ? theme.color.text.default : theme.color.text.subtle)};
  background: ${({ theme, selected }) => (selected ? theme.color.background.subtle.hover : 'transparent')};
  transition:
    background 0.1s,
    color 0.1s;

  &:hover {
    background: ${({ theme }) => theme.color.background.subtle.hover};
    color: ${({ theme }) => theme.color.text.default};
  }
`;

export type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
};

export const SelectField = ({ value, options, onChange }: SelectFieldProps) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? value;

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Wrapper ref={wrapperRef}>
      <Trigger open={open} onClick={() => setOpen((v) => !v)}>
        <span>{selectedLabel}</span>
        <ChevronIcon open={open}>
          <DropDownArrowSvg />
        </ChevronIcon>
      </Trigger>

      <DropdownList open={open}>
        {options.map((opt) => (
          <DropdownItem key={opt.value} selected={opt.value === value} onClick={() => handleSelect(opt.value)}>
            {opt.label}
          </DropdownItem>
        ))}
      </DropdownList>
    </Wrapper>
  );
};
