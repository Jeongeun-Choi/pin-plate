import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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

const ShortDurationToastHarness = () => {
  const { showSuccessToast } = useToast();

  const handleShowToast = () => {
    showSuccessToast({
      title: '곧 사라지는 토스트',
      duration: 40,
    });
  };

  return (
    <button type="button" onClick={handleShowToast}>
      짧은 토스트 열기
    </button>
  );
};

describe('ToastProvider', () => {
  it('shows a toast message without a dismiss button by default', async () => {
    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: '토스트 열기' }));

    expect(await screen.findByText('게시글이 저장됐어요')).toBeInTheDocument();
    expect(
      screen.getByText('내 지도에서 바로 확인할 수 있어요.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '알림 닫기' }),
    ).not.toBeInTheDocument();
  });

  it('shows and dismisses a dismissible toast message', async () => {
    render(
      <ToastProvider>
        <DismissibleToastHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: '닫기 토스트 열기' }));

    fireEvent.click(await screen.findByRole('button', { name: '알림 닫기' }));

    expect(screen.queryByText('게시글이 저장됐어요')).not.toBeInTheDocument();
  });

  it('does not stack duplicate toast messages', async () => {
    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    );

    const triggerButton = screen.getByRole('button', { name: '토스트 열기' });

    fireEvent.click(triggerButton);
    fireEvent.click(triggerButton);

    expect(await screen.findAllByText('게시글이 저장됐어요')).toHaveLength(1);
  });

  it('removes a toast after its duration', async () => {
    render(
      <ToastProvider>
        <ShortDurationToastHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: '짧은 토스트 열기' }));

    expect(await screen.findByText('곧 사라지는 토스트')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('곧 사라지는 토스트')).not.toBeInTheDocument();
    });
  });

  it('accepts an explicit toast position', async () => {
    render(
      <ToastProvider position="top-center">
        <ToastHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: '토스트 열기' }));

    expect(await screen.findByText('게시글이 저장됐어요')).toBeInTheDocument();
  });
});
