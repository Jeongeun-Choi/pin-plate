import { useCallback, useState } from 'react';
import type { PlaceWithStats } from '@/features/place/types/place';
import { getShareMapTitleSuggestion } from './shareMapDialogLogic';
import { useShareMapSelection } from './useShareMapSelection';

interface Props {
  places: PlaceWithStats[];
  onClose: () => void;
}

export const useShareMapDialogState = ({ places, onClose }: Props) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [shareFeedbackMessage, setShareFeedbackMessage] = useState('');

  const resetShareResult = () => {
    setShareUrl('');
    setErrorMessage('');
    setShareFeedbackMessage('');
  };

  const selection = useShareMapSelection({
    places,
    onSelectionChange: resetShareResult,
  });

  const titleSuggestion = getShareMapTitleSuggestion(
    selection.criteriaType,
    selection.criteriaValue,
  );
  const shareMapTitle = title.trim() || titleSuggestion;
  const { resetPickerState } = selection;

  const handleTitleChange = useCallback((nextTitle: string) => {
    setTitle(nextTitle);
    setShareUrl('');
    setErrorMessage('');
    setShareFeedbackMessage('');
  }, []);

  const handleDescriptionChange = useCallback((nextDescription: string) => {
    setDescription(nextDescription);
    setShareUrl('');
    setErrorMessage('');
    setShareFeedbackMessage('');
  }, []);

  const handleShareUrlCreated = useCallback((nextShareUrl: string) => {
    setShareUrl(nextShareUrl);
  }, []);

  const handleShareFeedbackMessageChange = useCallback(
    (nextFeedbackMessage: string) => {
      setShareFeedbackMessage(nextFeedbackMessage);
    },
    [],
  );

  const handleErrorMessageChange = useCallback((nextErrorMessage: string) => {
    setErrorMessage(nextErrorMessage);
  }, []);

  const handleDialogClose = useCallback(() => {
    resetPickerState();
    setShareUrl('');
    setErrorMessage('');
    setShareFeedbackMessage('');
    onClose();
  }, [onClose, resetPickerState]);

  return {
    ...selection,
    description,
    errorMessage,
    handleDescriptionChange,
    handleDialogClose,
    handleErrorMessageChange,
    handleShareFeedbackMessageChange,
    handleShareUrlCreated,
    handleTitleChange,
    shareFeedbackMessage,
    shareMapTitle,
    shareUrl,
    title,
    titleSuggestion,
  };
};

export type ShareMapDialogState = ReturnType<typeof useShareMapDialogState>;
