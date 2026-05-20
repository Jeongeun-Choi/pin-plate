import { useState } from 'react';

export const useShareMapPickerState = () => {
  const [isPlacePickerOpen, setIsPlacePickerOpen] = useState(false);
  const [isTagPickerOpen, setIsTagPickerOpen] = useState(false);
  const [isRegionPickerOpen, setIsRegionPickerOpen] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [regionSearchQuery, setRegionSearchQuery] = useState('');

  const closeAllPickers = () => {
    setIsPlacePickerOpen(false);
    setIsTagPickerOpen(false);
    setIsRegionPickerOpen(false);
  };

  const resetPickerState = () => {
    closeAllPickers();
    setTagSearchQuery('');
    setRegionSearchQuery('');
  };

  const handlePlacePickerOpen = () => {
    setIsTagPickerOpen(false);
    setIsRegionPickerOpen(false);
    setIsPlacePickerOpen(true);
  };

  const handlePlacePickerClose = () => {
    setIsPlacePickerOpen(false);
  };

  const handleTagPickerOpen = () => {
    setIsPlacePickerOpen(false);
    setIsRegionPickerOpen(false);
    setTagSearchQuery('');
    setIsTagPickerOpen(true);
  };

  const handleTagPickerClose = () => {
    setIsTagPickerOpen(false);
    setTagSearchQuery('');
  };

  const handleRegionPickerOpen = () => {
    setIsPlacePickerOpen(false);
    setIsTagPickerOpen(false);
    setRegionSearchQuery('');
    setIsRegionPickerOpen(true);
  };

  const handleRegionPickerClose = () => {
    setIsRegionPickerOpen(false);
    setRegionSearchQuery('');
  };

  const handleTagSearchQueryChange = (nextSearchQuery: string) => {
    setTagSearchQuery(nextSearchQuery);
  };

  const handleRegionSearchQueryChange = (nextSearchQuery: string) => {
    setRegionSearchQuery(nextSearchQuery);
  };

  return {
    closeAllPickers,
    handlePlacePickerClose,
    handlePlacePickerOpen,
    handleRegionPickerClose,
    handleRegionPickerOpen,
    handleRegionSearchQueryChange,
    handleTagPickerClose,
    handleTagPickerOpen,
    handleTagSearchQueryChange,
    isPlacePickerOpen,
    isRegionPickerOpen,
    isTagPickerOpen,
    regionSearchQuery,
    resetPickerState,
    tagSearchQuery,
  };
};
