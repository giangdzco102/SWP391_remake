/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import React from "react";

type ModalComponent = React.ComponentType<any>;

interface ModalStore {
  modal: ModalComponent | null;
  modalProps: Record<string, any>;
  openModal: (m: ModalComponent, props?: Record<string, any>) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  modal: null,
  modalProps: {},
  openModal: (m, props = {}) => set({ modal: m, modalProps: props }),
  closeModal: () => set({ modal: null, modalProps: {} }),
}));
