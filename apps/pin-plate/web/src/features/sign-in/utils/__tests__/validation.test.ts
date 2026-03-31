import { describe, it, expect } from 'vitest';
import { getAuthErrorMessage, isValidEmail } from '../validation';

describe('getAuthErrorMessage', () => {
  it('null 입력 시 null을 반환한다', () => {
    expect(getAuthErrorMessage(null)).toBeNull();
  });

  it('잘못된 로그인 정보 에러 메시지를 반환한다', () => {
    const error = new Error('Invalid login credentials');
    expect(getAuthErrorMessage(error)).toBe(
      '이메일 또는 비밀번호가 일치하지 않습니다.',
    );
  });

  it('이메일 미인증 에러 메시지를 반환한다', () => {
    const error = new Error('Email not confirmed');
    expect(getAuthErrorMessage(error)).toBe(
      '이메일 인증이 완료되지 않았습니다. 메일함을 확인해주세요.',
    );
  });

  it('Too many requests 에러 메시지를 반환한다', () => {
    const error = new Error('Too many requests');
    expect(getAuthErrorMessage(error)).toBe(
      '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.',
    );
  });

  it('429 에러 코드도 rate limit 메시지를 반환한다', () => {
    const error = new Error('Request failed with status 429');
    expect(getAuthErrorMessage(error)).toBe(
      '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.',
    );
  });

  it('네트워크 에러 메시지를 반환한다', () => {
    const error = new Error('network error occurred');
    expect(getAuthErrorMessage(error)).toBe('네트워크 연결을 확인해주세요.');
  });

  it('알 수 없는 에러는 기본 메시지를 반환한다', () => {
    const error = new Error('something unexpected');
    expect(getAuthErrorMessage(error)).toBe(
      '로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
    );
  });
});

describe('isValidEmail', () => {
  it('유효한 이메일을 통과시킨다', () => {
    expect(isValidEmail('user@domain.com')).toBe(true);
    expect(isValidEmail('a@b.co')).toBe(true);
    expect(isValidEmail('user+tag@sub.domain.org')).toBe(true);
  });

  it('빈 문자열을 거부한다', () => {
    expect(isValidEmail('')).toBe(false);
  });

  it('@ 없는 문자열을 거부한다', () => {
    expect(isValidEmail('no-at-sign')).toBe(false);
  });

  it('로컬 파트가 없는 이메일을 거부한다', () => {
    expect(isValidEmail('@missing-local.com')).toBe(false);
  });

  it('도메인이 없는 이메일을 거부한다', () => {
    expect(isValidEmail('missing-domain@')).toBe(false);
  });

  it('공백이 포함된 이메일을 거부한다', () => {
    expect(isValidEmail('has spaces@x.com')).toBe(false);
  });
});
