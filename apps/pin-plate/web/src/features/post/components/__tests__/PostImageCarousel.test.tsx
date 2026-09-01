import { createElement } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PostImageCarousel } from '../PostImageCarousel';

vi.mock('next/image', () => ({
  default: ({
    alt,
    src,
  }: {
    alt: string;
    src: string;
    fill?: boolean;
    sizes?: string;
    className?: string;
    priority?: boolean;
  }) => createElement('img', { alt, src }),
}));

vi.mock('embla-carousel-react', () => ({
  default: () => [
    vi.fn(),
    {
      off: vi.fn(),
      on: vi.fn(),
      reInit: vi.fn(),
      scrollNext: vi.fn(),
      scrollPrev: vi.fn(),
      scrollSnapList: () => [0, 1, 2],
      scrollTo: vi.fn(),
      selectedScrollSnap: () => 0,
    },
  ],
}));

describe('PostImageCarousel', () => {
  it('사진이 없으면 placeholder를 보여준다', () => {
    render(<PostImageCarousel imageUrls={[]} placeName="테스트 식당" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('사진이 1장이면 단일 이미지만 보여준다', () => {
    render(
      <PostImageCarousel
        imageUrls={['https://example.com/photo-1.webp']}
        placeName="테스트 식당"
      />,
    );

    expect(
      screen.getByRole('img', { name: '테스트 식당 사진' }),
    ).toHaveAttribute('src', 'https://example.com/photo-1.webp');
    expect(
      screen.queryByRole('button', { name: '이전 사진 보기' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '다음 사진 보기' }),
    ).not.toBeInTheDocument();
  });

  it('사진이 여러 장이면 슬라이더 컨트롤과 현재 위치를 보여준다', () => {
    render(
      <PostImageCarousel
        imageUrls={[
          'https://example.com/photo-1.webp',
          'https://example.com/photo-2.webp',
          'https://example.com/photo-3.webp',
        ]}
        placeName="테스트 식당"
      />,
    );

    expect(
      screen.getByRole('region', { name: '테스트 식당 사진 슬라이더' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: '테스트 식당 사진 1' }),
    ).toHaveAttribute('src', 'https://example.com/photo-1.webp');
    expect(
      screen.getByRole('button', { name: '이전 사진 보기' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: '다음 사진 보기' }),
    ).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '2번째 사진 보기' }),
    ).toBeInTheDocument();
  });
});
