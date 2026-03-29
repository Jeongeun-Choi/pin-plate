'use client';

import { useState, useTransition } from 'react';
import { Button, Modal } from '@pin-plate/ui';
import { deleteAccount } from '../actions/deleteAccount';
import * as s from './WithdrawalModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const WithdrawalModal = ({ isOpen, onClose }: Props) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await deleteAccount();
      if (result?.error) {
        setErrorMessage(result.error);
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Container>
        <Modal.Header>
          <Modal.Title>회원 탈퇴</Modal.Title>
          <Modal.Close />
        </Modal.Header>
        <Modal.Body>
          <div className={s.body}>
            <p className={s.description}>
              탈퇴하면 저장된 핀과 플레이트가 모두 삭제되며 복구할 수 없습니다.
              <br />
              정말 탈퇴하시겠습니까?
            </p>
            {errorMessage && <p className={s.errorMessage}>{errorMessage}</p>}
          </div>
        </Modal.Body>
        <div className={s.footer}>
          <Button
            variant="danger"
            size="full"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? '탈퇴 처리 중...' : '탈퇴하기'}
          </Button>
          <Button
            variant="secondary"
            size="full"
            onClick={onClose}
            disabled={isPending}
          >
            취소
          </Button>
        </div>
      </Modal.Container>
    </Modal>
  );
};
