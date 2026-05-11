-- Migration: places 테이블 생성 및 기존 posts 연결
-- 실행 순서: Supabase SQL Editor에서 순서대로 실행

-- ============================================================
-- 1. places 테이블 생성
-- ============================================================
CREATE TABLE IF NOT EXISTS places (
  id             UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kakao_place_id TEXT          NOT NULL,
  place_name     TEXT          NOT NULL,
  address        TEXT          NOT NULL,
  lat            NUMERIC(10,7) NOT NULL,
  lng            NUMERIC(10,7) NOT NULL,
  status         TEXT          NOT NULL DEFAULT 'wish'
                   CHECK (status IN ('wish', 'visited', 'want_to_revisit', 'recommend')),
  tags           TEXT[]        DEFAULT '{}',
  created_at     TIMESTAMPTZ   DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   DEFAULT NOW(),
  UNIQUE(user_id, kakao_place_id)
);

-- ============================================================
-- 2. posts 테이블에 place_id 추가
-- ============================================================
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS place_id UUID REFERENCES places(id) ON DELETE CASCADE;

-- ============================================================
-- 3. wish → visited 자동 전환 트리거
--    post INSERT 시 연결된 place status가 'wish'면 'visited'로 변경
-- ============================================================
CREATE OR REPLACE FUNCTION update_place_status_on_post_insert()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE places
  SET status = 'visited', updated_at = NOW()
  WHERE id = NEW.place_id AND status = 'wish';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_post_insert_update_place_status ON posts;
CREATE TRIGGER on_post_insert_update_place_status
  AFTER INSERT ON posts
  FOR EACH ROW
  WHEN (NEW.place_id IS NOT NULL)
  EXECUTE FUNCTION update_place_status_on_post_insert();

-- ============================================================
-- 4. 기존 posts에서 places 데이터 마이그레이션
--    (user_id + kakao_place_id 기준 dedup, 기존 포스트는 visited 처리)
-- ============================================================
INSERT INTO places (user_id, kakao_place_id, place_name, address, lat, lng, status, tags, created_at)
SELECT DISTINCT ON (user_id, kakao_place_id)
  user_id,
  kakao_place_id,
  place_name,
  address,
  lat,
  lng,
  'visited'::text AS status,
  tags,
  created_at
FROM posts
WHERE kakao_place_id IS NOT NULL
  AND place_name IS NOT NULL
ORDER BY user_id, kakao_place_id, created_at ASC
ON CONFLICT (user_id, kakao_place_id) DO NOTHING;

-- ============================================================
-- 5. 기존 posts에 place_id 연결
-- ============================================================
UPDATE posts p
SET place_id = pl.id
FROM places pl
WHERE p.user_id = pl.user_id
  AND p.kakao_place_id = pl.kakao_place_id;

-- ============================================================
-- 6. RLS (Row Level Security) 활성화
-- ============================================================

-- places RLS
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "places_user_isolation" ON places;
CREATE POLICY "places_user_isolation" ON places
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- posts RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "posts_user_isolation" ON posts;
CREATE POLICY "posts_user_isolation" ON posts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
-- 회원가입 시 admin client INSERT는 RLS 우회하므로 INSERT policy 불필요
