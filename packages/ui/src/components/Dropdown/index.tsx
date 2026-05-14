'use client';

import {
  KeyboardEvent,
  MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { IcCheck, IcChevronDown } from '../../icons';
import * as s from './styles.css';

export interface DropdownOption {
  value: string;
  label: string;
}

interface Props {
  id: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
}

export const Dropdown = ({
  id,
  value,
  options,
  onChange,
  placeholder = '선택해 주세요',
  disabled = false,
  className,
  buttonClassName,
  menuClassName,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const generatedListboxId = useId();

  const selectedIndex = useMemo(
    () => options.findIndex((option) => option.value === value),
    [options, value],
  );
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null;
  const listboxId = `${id}-${generatedListboxId}-listbox`;

  const openMenu = useCallback(() => {
    if (disabled || options.length === 0) {
      return;
    }
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setIsOpen(true);
  }, [disabled, options.length, selectedIndex]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const selectOption = useCallback(
    (option: DropdownOption) => {
      onChange(option.value);
      closeMenu();
    },
    [closeMenu, onChange],
  );

  const handleTriggerClick = () => {
    if (isOpen) {
      closeMenu();
      return;
    }
    openMenu();
  };

  const handleOptionClick = (
    event: ReactMouseEvent<HTMLButtonElement>,
    option: DropdownOption,
  ) => {
    event.preventDefault();
    selectOption(option);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || options.length === 0) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isOpen) {
        openMenu();
        return;
      }
      setActiveIndex((currentIndex) => (currentIndex + 1) % options.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) {
        openMenu();
        return;
      }
      setActiveIndex(
        (currentIndex) => (currentIndex - 1 + options.length) % options.length,
      );
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      openMenu();
      setActiveIndex(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      openMenu();
      setActiveIndex(options.length - 1);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!isOpen) {
        openMenu();
        return;
      }
      const activeOption = options[activeIndex];
      if (activeOption) {
        selectOption(activeOption);
      }
    }
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [closeMenu, isOpen]);

  return (
    <div className={`${s.container} ${className || ''}`} ref={containerRef}>
      <button
        id={id}
        type="button"
        className={`${s.trigger} ${buttonClassName || ''}`}
        aria-label={selectedOption?.label ?? placeholder}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        disabled={disabled}
        onClick={handleTriggerClick}
        onKeyDown={handleKeyDown}
      >
        <span
          className={`${s.triggerLabel} ${selectedOption ? '' : s.placeholder}`}
        >
          {selectedOption?.label ?? placeholder}
        </span>
        <span
          className={`${s.chevron} ${isOpen ? s.chevronOpen : ''}`}
          aria-hidden="true"
        >
          <IcChevronDown width={16} height={16} />
        </span>
      </button>
      {isOpen && (
        <div
          id={listboxId}
          className={`${s.menu} ${menuClassName || ''}`}
          role="listbox"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;

            return (
              <button
                key={option.value}
                type="button"
                className={`${s.option} ${isActive ? s.activeOption : ''} ${
                  isSelected ? s.selectedOption : ''
                }`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={(event) => handleOptionClick(event, option)}
              >
                <span>{option.label}</span>
                {isSelected && (
                  <span className={s.checkMark} aria-hidden="true">
                    <IcCheck width={16} height={16} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
