import { DependencyList, Ref, useImperativeHandle, useRef } from 'react';

const voidOnClose = () => {};
const alwaysCanClose = () => true;

export type OverlayHandlingClose = { onClose: () => void; canClose: () => boolean };
export const useOverlayHandlingCloseRef = () => useRef<OverlayHandlingClose>(null);
/**
 * Define the ref content of the overlay handling close
 *
 * If canClose is not defined, then it can always close
 * If onClose is not defined it won't do anything when closing
 */
export const useOverlayHandlingClose = (ref: Ref<OverlayHandlingClose>, onClose?: () => void, canClose?: () => boolean, deps?: DependencyList) =>
  useImperativeHandle(ref, () => ({ onClose: onClose || voidOnClose, canClose: canClose || alwaysCanClose }), deps);
