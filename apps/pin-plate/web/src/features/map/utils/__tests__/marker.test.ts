import { describe, it, expect } from 'vitest';
import {
  getPinColor,
  getMarkerIcon,
  getPinIcon,
  getCurrentLocationIcon,
} from '../marker';

describe('getPinColor', () => {
  it('rating에 따라 서로 다른 색상을 반환한다', () => {
    const color1 = getPinColor(1);
    const color2 = getPinColor(2);
    const color3 = getPinColor(3);
    const color4 = getPinColor(4);
    const color5 = getPinColor(5);

    const uniqueColors = new Set([color1, color2, color3, color4, color5]);
    expect(uniqueColors.size).toBe(5);
  });

  it('같은 등급 범위는 동일한 색상을 반환한다', () => {
    expect(getPinColor(0)).toBe(getPinColor(1));
    expect(getPinColor(1.5)).toBe(getPinColor(2));
    expect(getPinColor(2.5)).toBe(getPinColor(3));
    expect(getPinColor(3.5)).toBe(getPinColor(4));
    expect(getPinColor(4.5)).toBe(getPinColor(5));
  });

  it('rating 5 초과(default)는 rating 5와 동일한 색상을 반환한다', () => {
    expect(getPinColor(6)).toBe(getPinColor(5));
  });
});

describe('getMarkerIcon', () => {
  it('SVG를 포함한 HTML 문자열을 반환한다', () => {
    const result = getMarkerIcon();
    expect(result).toContain('<svg');
    expect(result).toContain('</svg>');
  });

  it('기본 색상은 #FF0000이다', () => {
    const result = getMarkerIcon();
    expect(result).toContain('#FF0000');
  });

  it('커스텀 색상이 적용된다', () => {
    const result = getMarkerIcon('#00FF00');
    expect(result).toContain('#00FF00');
    expect(result).not.toContain('#FF0000');
  });
});

describe('getPinIcon', () => {
  it('SVG를 포함한 HTML 문자열을 반환한다', () => {
    const result = getPinIcon();
    expect(result).toContain('<svg');
  });

  it('width와 height가 컨테이너에 적용된다', () => {
    const result = getPinIcon('#FF6B00', 32, 100);
    expect(result).toContain('width: 32px');
    expect(result).toContain('height: 100px');
  });

  it('rating이 있으면 text 요소가 포함된다', () => {
    const result = getPinIcon('#FF6B00', 16, 80, 4);
    expect(result).toContain('<text');
    expect(result).toContain('>4</text>');
  });

  it('rating이 없으면 text 요소가 포함되지 않는다', () => {
    const result = getPinIcon('#FF6B00', 16, 80);
    expect(result).not.toContain('<text');
  });
});

describe('getCurrentLocationIcon', () => {
  it('파란 점 색상 #4285F4를 포함한다', () => {
    const result = getCurrentLocationIcon();
    expect(result).toContain('#4285F4');
  });

  it('pulse 애니메이션을 포함한다', () => {
    const result = getCurrentLocationIcon();
    expect(result).toContain('currentLocationPulse');
    expect(result).toContain('@keyframes');
  });
});
