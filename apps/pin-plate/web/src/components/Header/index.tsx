'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSetAtom, useAtom } from 'jotai';
import { Input } from '@pin-plate/ui';
import {
  IcSearch,
  IcMap,
  IcPlus,
  IcUser,
  IcList,
  IcDismiss,
  IcShare,
} from '@pin-plate/ui/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { viewModeAtom, searchQueryAtom } from '@/app/atoms';
import * as styles from './Header.css';
import { isPostModalOpenAtom } from '@/features/post/atoms';
import { AccountPopover } from './AccountPopover';
import { myPageKeys, getMyProfile } from '@/features/my-page';
import { useSearchPlaces } from '@/features/map/hooks/useSearchPlaces';
import { usePlaces } from '@/features/place/hooks/usePlaces';
import { ShareMapDialog } from '@/features/shared-map/components/ShareMapDialog';
import { getCurrentUser } from '@/utils/supabase/getCurrentUser';

export const Header = () => {
  const [searchInputValue, setSearchInputValue] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isShareMapDialogOpen, setIsShareMapDialogOpen] = useState(false);

  const [viewMode, setViewMode] = useAtom(viewModeAtom);
  const setSearchQuery = useSetAtom(searchQueryAtom);
  const router = useRouter();
  const setIsPostModalOpen = useSetAtom(isPostModalOpenAtom);
  const queryClient = useQueryClient();
  const { searchPlaces, clearSearchPlaces } = useSearchPlaces();
  const { data: currentUser } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: getCurrentUser,
  });

  const isShareButtonDisabled = !currentUser;
  const shareButtonTitle = isShareButtonDisabled
    ? '로그인하면 내 장소 지도를 공유할 수 있어요.'
    : '내 장소 지도를 공유해요.';

  const handleSearch = () => {
    const query = searchInputValue.trim();
    setSearchQuery(query);
    searchPlaces(query);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchInputValue('');
    setSearchQuery('');
    clearSearchPlaces();
  };

  const handleProfileHover = () => {
    queryClient.prefetchQuery({
      queryKey: myPageKeys.profile(),
      queryFn: getMyProfile,
    });
  };

  const togglePopover = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    if (isPopoverOpen) {
      setIsPopoverOpen(false);
      setAnchorEl(null);
    } else {
      setIsPopoverOpen(true);
      setAnchorEl(e.currentTarget);
    }
  };

  const handlePopoverClose = () => {
    setIsPopoverOpen(false);
    setAnchorEl(null);
  };

  const handleShareMapOpen = () => {
    if (!currentUser) {
      return;
    }
    setIsShareMapDialogOpen(true);
  };

  const handleShareMapClose = () => {
    setIsShareMapDialogOpen(false);
  };

  return (
    <>
      <header className={styles.container}>
        {/* Left: Logo & Search */}
        <div className={styles.leftSection}>
          <div
            className={styles.logoContainer}
            onClick={() => router.push('/')}
          >
            <span className={styles.logoText}>Pin-plate</span>
          </div>

          <div className={styles.searchContainer}>
            <button
              type="button"
              className={styles.searchButton}
              onClick={handleSearch}
              aria-label="검색"
            >
              <IcSearch width={16} height={16} />
            </button>
            <Input
              type="search"
              enterKeyHint="search"
              className={styles.searchInput}
              placeholder="음식점 이름으로 검색"
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            {searchInputValue && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={handleClearSearch}
                aria-label="검색어 초기화"
              >
                <IcDismiss width={14} height={14} />
              </button>
            )}
          </div>
        </div>

        <div className={styles.rightSection}>
          {/* Toggle */}
          <div className={styles.toggleContainer}>
            <button
              className={`${styles.toggleButton} ${viewMode === 'map' ? styles.activeToggleButton : ''}`}
              onClick={() => setViewMode('map')}
            >
              <IcMap width={14} height={14} color="currentColor" />
              <span>지도</span>
            </button>
            <button
              className={`${styles.toggleButton} ${viewMode === 'list' ? styles.activeToggleButton : ''}`}
              onClick={() => setViewMode('list')}
            >
              <IcList width={14} height={14} color="currentColor" />
              <span>리스트</span>
            </button>
          </div>

          {/* Write Button */}
          <button
            className={styles.writeButton}
            onClick={() => setIsPostModalOpen(true)}
          >
            <IcPlus width={16} height={16} color="currentColor" />
            <span className={styles.writeButtonText}>작성하기</span>
          </button>

          {/* Share Button */}
          <button
            type="button"
            className={styles.shareButton}
            onClick={handleShareMapOpen}
            disabled={isShareButtonDisabled}
            title={shareButtonTitle}
          >
            <IcShare width={16} height={16} color="currentColor" />
            <span className={styles.shareButtonText}>공유하기</span>
          </button>

          {/* Profile Icon */}
          <div className={styles.profileWrapper}>
            <div
              className={styles.profileIcon}
              onClick={togglePopover}
              onMouseEnter={handleProfileHover}
            >
              <IcUser width={20} height={20} color="currentColor" />
            </div>
            {isPopoverOpen && (
              <AccountPopover
                onClose={handlePopoverClose}
                anchorElement={anchorEl}
              />
            )}
          </div>
        </div>
      </header>
      {currentUser && isShareMapDialogOpen && (
        <ShareMapDialogLoader
          ownerId={currentUser.id}
          onClose={handleShareMapClose}
        />
      )}
    </>
  );
};

interface ShareMapDialogLoaderProps {
  ownerId: string;
  onClose: () => void;
}

const ShareMapDialogLoader = ({
  ownerId,
  onClose,
}: ShareMapDialogLoaderProps) => {
  const { data: savedPlaces = [] } = usePlaces();

  return (
    <ShareMapDialog
      isOpen={true}
      places={savedPlaces}
      ownerId={ownerId}
      onClose={onClose}
    />
  );
};
