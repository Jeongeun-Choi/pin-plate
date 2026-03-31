import { describe, it, expect } from 'vitest';
import { postKeys } from '../postKeys';

describe('postKeys', () => {
  it('all은 ["posts"]를 반환한다', () => {
    expect(postKeys.all).toEqual(['posts']);
  });

  it('lists()는 userId 없이 ["posts", "list"]를 반환한다', () => {
    expect(postKeys.lists()).toEqual(['posts', 'list']);
  });

  it('lists(userId)는 userId를 포함한 키를 반환한다', () => {
    expect(postKeys.lists('user-123')).toEqual([
      'posts',
      'list',
      { userId: 'user-123' },
    ]);
  });

  it('detail(id)는 id를 포함한 키를 반환한다', () => {
    expect(postKeys.detail(42)).toEqual(['posts', 'detail', 42]);
  });
});
