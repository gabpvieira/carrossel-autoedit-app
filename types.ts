export type Resolution = 'standard' | 'high';

export interface EditParams {
  zoom: number;
  x: number;
  y: number;
  brightness: number;
  contrast: number;
  saturation: number;
  highlights: number;
  sharpness: number;
}

export const DEFAULT_EDIT_PARAMS: EditParams = {
  zoom: 1,
  x: 0,
  y: 0,
  brightness: 0,
  contrast: 0,
  saturation: 0,
  highlights: 0,
  sharpness: 0,
};

export interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  editParams: EditParams;
}

export type CoverSlotKey = 'top' | 'bottomLeft' | 'bottomRight';

export interface CoverSlots {
  top: string | null;
  bottomLeft: string | null;
  bottomRight: string | null;
}

export const DEFAULT_COVER_SLOTS: CoverSlots = {
  top: null,
  bottomLeft: null,
  bottomRight: null,
};

// Instagram Layout Types
export type InstagramSlotKey = 'main' | 'topRight' | 'bottomRight';

export interface InstagramSlots {
  main: string | null;
  topRight: string | null;
  bottomRight: string | null;
}

export const DEFAULT_INSTAGRAM_SLOTS: InstagramSlots = {
  main: null,
  topRight: null,
  bottomRight: null,
};

export interface ImageSelectionModalState {
    isOpen: boolean;
    targetSlot: CoverSlotKey | null;
    targetImageId: string | null;
}

export interface ConfirmationModalState {
  isOpen: boolean;
  title: string;
  message: string;
  itemName?: string;
  onConfirm: () => void;
}

export const DEFAULT_CONFIRMATION_MODAL_STATE: ConfirmationModalState = {
  isOpen: false,
  title: '',
  message: '',
  onConfirm: () => {},
};

export const MAX_FILES = 20;