import ModalComponent from './Modal';
import ModalContainer from './ModalContainer';
import FullScreenModalContainer from './FullScreenModalContainer';
import ModalHeader from './ModalHeader';
import ModalBody from './ModalBody';
import ModalFooter from './ModalFooter';
import ModalTitle from './ModalTitle';
import ModalClose from './ModalClose';

export const Modal = Object.assign(ModalComponent, {
  Container: ModalContainer,
  FullScreenContainer: FullScreenModalContainer,
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
  Title: ModalTitle,
  Close: ModalClose,
});

export type { ModalProps } from './Modal';
