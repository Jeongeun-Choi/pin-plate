'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSetAtom } from 'jotai';
import { Input } from '@pin-plate/ui';
import {
  IcSearch,
  IcPlus,
  IcUser,
  IcDismiss,
  IcShare,
} from '@pin-plate/ui/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { searchQueryAtom } from '@/app/atoms';
import {
  clearButton,
  container,
  leftSection,
  logoContainer,
  logoText,
  profileIcon,
  profileWrapper,
  rightSection,
  searchButton,
  searchContainer,
  searchInput,
  shareButton,
  shareButtonText,
  writeButton,
  writeButtonText,
} from './Header.css';
import { isPostModalOpenAtom } from '@/features/post/atoms';
import { AccountPopover } from './AccountPopover';
import { getMyProfile } from '@/features/profile/api/getMyProfile';
import { profileKeys } from '@/features/profile/profileKeys';
import { useSearchPlaces } from '@/features/map/hooks/useSearchPlaces';
import { usePlaces } from '@/features/place/hooks/usePlaces';
import { getCurrentUser } from '@/utils/supabase/getCurrentUser';
import { ViewModeToggle } from '@/components/ViewModeToggle';
import dynamic from 'next/dynamic';

const ShareMapDialog = dynamic(
  () => import('@/features/shared-map/components/ShareMapDialog'),
  {
    ssr: false,
  },
);

export const Header = () => {
  const [searchInputValue, setSearchInputValue] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isShareMapDialogOpen, setIsShareMapDialogOpen] = useState(false);

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
      queryKey: profileKeys.me(),
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
      <header className={container}>
        {/* Left: Logo & Search */}
        <div className={leftSection}>
          <div className={logoContainer} onClick={() => router.push('/')}>
            <span className={logoText}>Pin-plate</span>
          </div>

          <div className={searchContainer}>
            <button
              type="button"
              className={searchButton}
              onClick={handleSearch}
              aria-label="검색"
            >
              <IcSearch width={16} height={16} />
            </button>
            <Input
              type="search"
              enterKeyHint="search"
              className={searchInput}
              placeholder="음식점 이름으로 검색"
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            {searchInputValue && (
              <button
                type="button"
                className={clearButton}
                onClick={handleClearSearch}
                aria-label="검색어 초기화"
              >
                <IcDismiss width={14} height={14} />
              </button>
            )}
          </div>
        </div>

        <div className={rightSection}>
          {/* Toggle */}
          <ViewModeToggle tone="header" />

          {/* Write Button */}
          <button
            className={writeButton}
            onClick={() => setIsPostModalOpen(true)}
          >
            <IcPlus width={16} height={16} color="currentColor" />
            <span className={writeButtonText}>작성하기</span>
          </button>

          {/* Share Button */}
          <button
            type="button"
            className={shareButton}
            onClick={handleShareMapOpen}
            disabled={isShareButtonDisabled}
            title={shareButtonTitle}
          >
            <IcShare width={16} height={16} color="currentColor" />
            <span className={shareButtonText}>공유하기</span>
          </button>

          {/* Profile Icon */}
          <div className={profileWrapper}>
            <div
              className={profileIcon}
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
