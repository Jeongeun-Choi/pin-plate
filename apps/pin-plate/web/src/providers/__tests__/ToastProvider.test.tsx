import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ToastProvider, useToast } from '../ToastProvider';

const ToastHarness = () => {
  const { showSuccessToast } = useToast();

  const handleShowToast = () => {
    showSuccessToast({
      title: '게시글이 저장됐어요',
      description: '내 지도에서 바로 확인할 수 있어요.',
    });
  };

  return (
    <button type="button" onClick={handleShowToast}>
      토스트 열기
    </button>
  );
};

const DismissibleToastHarness = () => {
  const { showSuccessToast } = useToast();

  const handleShowToast = () => {
    showSuccessToast({
      title: '게시글이 저장됐어요',
      description: '내 지도에서 바로 확인할 수 있어요.',
      isDismissible: true,
    });
  };

  return (
    <button type="button" onClick={handleShowToast}>
      닫기 토스트 열기
    </button>
  );
};

describe('ToastProvider', () => {
  it('shows a toast message without a dismiss button by default', () => {
    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: '토스트 열기' }));

    expect(screen.getByText('게시글이 저장됐어요')).toBeInTheDocument();
    expect(
      screen.getByText('내 지도에서 바로 확인할 수 있어요.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '알림 닫기' }),
    ).not.toBeInTheDocument();
  });

  it('shows and dismisses a dismissible toast message', () => {
    render(
      <ToastProvider>
        <DismissibleToastHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: '닫기 토스트 열기' }));

    fireEvent.click(screen.getByRole('button', { name: '알림 닫기' }));

    expect(screen.queryByText('게시글이 저장됐어요')).not.toBeInTheDocument();
  });

  it('does not stack duplicate toast messages', () => {
    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    );

    const triggerButton = screen.getByRole('button', { name: '토스트 열기' });

    fireEvent.click(triggerButton);
    fireEvent.click(triggerButton);

    expect(screen.getAllByText('게시글이 저장됐어요')).toHaveLength(1);
  });

  it('removes a toast after its duration', () => {
    vi.useFakeTimers();

    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: '토스트 열기' }));

    expect(screen.getByText('게시글이 저장됐어요')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3200);
    });

    expect(screen.queryByText('게시글이 저장됐어요')).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it('accepts an explicit toast position', () => {
    render(
      <ToastProvider position="top-center">
        <ToastHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: '토스트 열기' }));

    expect(screen.getByText('게시글이 저장됐어요')).toBeInTheDocument();
  });
});
