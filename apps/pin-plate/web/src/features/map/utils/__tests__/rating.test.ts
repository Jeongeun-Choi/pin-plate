import { describe, it, expect } from 'vitest';
import { calcAverageRating } from '../rating';

describe('calcAverageRating', () => {
  it('게시물이 1개면 해당 rating을 그대로 반환한다', () => {
    expect(calcAverageRating([4])).toBe(4);
  });

  it('여러 게시물의 평균을 계산한다', () => {
    expect(calcAverageRating([2, 4])).toBe(3);
    expect(calcAverageRating([1, 2, 3, 4, 5])).toBe(3);
  });

  it('소수점 첫째 자리로 반올림한다', () => {
    expect(calcAverageRating([1, 2])).toBe(1.5);
    expect(calcAverageRating([1, 3, 4])).toBe(2.7);
  });

  it('정수로 나누어 떨어지면 소수점을 붙이지 않는다', () => {
    expect(calcAverageRating([3, 5])).toBe(4);
  });
});
