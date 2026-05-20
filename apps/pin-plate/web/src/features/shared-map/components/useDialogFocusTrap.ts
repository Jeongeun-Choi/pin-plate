import { RefObject, useEffect, useRef } from 'react';

const FOCUSABLE_DIALOG_SELECTOR =
  'button, [href], input, textarea, [tabindex]:not([tabindex="-1"])';

const isDisabledFocusableElement = (element: HTMLElement) =>
  element.hasAttribute('disabled') ||
  ('disabled' in element && Boolean(element.disabled));

const getFocusableDialogElements = (dialogElement: HTMLElement | null) => {
  const focusableElements = dialogElement?.querySelectorAll<HTMLElement>(
    FOCUSABLE_DIALOG_SELECTOR,
  );

  return Array.from(focusableElements ?? []).filter(
    (focusableElement) => !isDisabledFocusableElement(focusableElement),
  );
};

interface Props {
  isOpen: boolean;
  dialogRef: RefObject<HTMLElement | null>;
  onClose: () => void;
}

export const useDialogFocusTrap = ({ isOpen, dialogRef, onClose }: Props) => {
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previouslyFocusedElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const focusableElements = getFocusableDialogElements(dialogRef.current);
    focusableElements?.[0]?.focus();

    const handleDialogKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const currentFocusableElements = getFocusableDialogElements(
        dialogRef.current,
      );
      const firstFocusableElement = currentFocusableElements[0];
      const lastFocusableElement =
        currentFocusableElements[currentFocusableElements.length - 1];
      const currentFocusedElement =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;

      if (!firstFocusableElement || !lastFocusableElement) {
        event.preventDefault();
        return;
      }

      if (event.shiftKey && currentFocusedElement === firstFocusableElement) {
        event.preventDefault();
        lastFocusableElement.focus();
      }

      if (!event.shiftKey && currentFocusedElement === lastFocusableElement) {
        event.preventDefault();
        firstFocusableElement.focus();
      }
    };

    window.addEventListener('keydown', handleDialogKeyDown);

    return () => {
      window.removeEventListener('keydown', handleDialogKeyDown);
      previouslyFocusedElementRef.current?.focus();
    };
  }, [dialogRef, isOpen]);
};
