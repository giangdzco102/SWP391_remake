"use client";
import { useModalStore } from "@/stores/modalStore";

export function ModalProvider() {
  const { modal: ModalComponent, modalProps, closeModal } = useModalStore();
  if (!ModalComponent) return null;

  return <ModalComponent onClose={closeModal} {...modalProps} />;
}
