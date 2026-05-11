'use client';

import { useState } from 'react';
import { Modal, Button, TagChip } from '@pin-plate/ui';
import { TAG_GROUPS } from '../constants/tags';
import * as s from './styles/TagPickerSheet.styles.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedTags: string[];
  onConfirm: (tags: string[]) => void;
}

const TagPickerSheet = ({
  isOpen,
  onClose,
  selectedTags,
  onConfirm,
}: Props) => {
  const [localTags, setLocalTags] = useState<string[]>(selectedTags);

  const toggleTag = (id: string) => {
    setLocalTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const handleConfirm = () => {
    onConfirm(localTags);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Container>
        <Modal.Header>
          <Modal.Title>태그 선택</Modal.Title>
          <Modal.Close />
        </Modal.Header>
        <Modal.Body>
          <div className={s.body}>
            {(
              Object.entries(TAG_GROUPS) as [
                string,
                { label: string; tags: { id: string; label: string }[] },
              ][]
            ).map(([group, { label, tags }]) => (
              <div key={group} className={s.group}>
                <span className={s.groupLabel}>{label}</span>
                <div className={s.chipList}>
                  {tags.map((tag) => (
                    <TagChip
                      key={tag.id}
                      label={tag.label}
                      selected={localTags.includes(tag.id)}
                      onClick={() => toggleTag(tag.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Modal.Body>
        <div className={s.footer}>
          <Button variant="solid" size="full" onClick={handleConfirm}>
            {localTags.length > 0
              ? `완료 (${localTags.length}개 선택)`
              : '완료'}
          </Button>
        </div>
      </Modal.Container>
    </Modal>
  );
};

export default TagPickerSheet;
