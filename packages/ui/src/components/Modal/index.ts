import ModalMain from './Modal';
import ModalBody from './ModalBody';
import ModalClose from './ModalClose';
import ModalContainer from './ModalContainer';
import ModalFooter from './ModalFooter';
import ModalHeader from './ModalHeader';
import ModalTitle from './ModalTitle';

export const Modal = Object.assign(ModalMain, {
  Container: ModalContainer, // This renders the Overlay + Container wrapper
  Header: ModalHeader,
  Title: ModalTitle,
  Body: ModalBody,
  Footer: ModalFooter,
  Close: ModalClose,
});

export type { ModalProps } from './Modal';
