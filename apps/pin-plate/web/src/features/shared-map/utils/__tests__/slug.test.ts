import { describe, expect, it, vi } from 'vitest';
import { createShareSlug } from '../slug';

describe('createShareSlug', () => {
  it('creates a url-safe slug with a readable latin prefix and random suffix', () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(
      '12345678-1234-4234-9234-123456789abc',
    );

    expect(createShareSlug('Seongsu Cafe Picks')).toBe(
      'seongsu-cafe-picks-12345678123442349234123456789abc',
    );
  });

  it('creates a url-safe slug with a readable Korean prefix and random suffix', () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(
      '12345678-1234-4234-9234-123456789abc',
    );

    expect(createShareSlug('성수 카페 추천')).toBe(
      'seongsu-kape-cuceon-12345678123442349234123456789abc',
    );
  });

  it('falls back to map when the title has no url-safe characters', () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(
      'abcdef12-1234-4234-9234-123456789abc',
    );

    expect(createShareSlug('!!!')).toBe('map-abcdef12123442349234123456789abc');
  });
});
