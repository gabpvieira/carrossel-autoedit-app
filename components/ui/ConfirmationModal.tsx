import React, { useEffect, useRef } from 'react';
import { ConfirmationModalState } from '../../types';
import { Button } from '../Button';
import { IconX, IconAlertTriangle } from '../icons';
import { ptBR } from '../../locales/pt-BR';

interface ConfirmationModalProps {
  modalState: ConfirmationModalState;
  onClose: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ modalState, onClose }) => {
  const { isOpen, title, message, itemName, onConfirm } = modalState;
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      cancelButtonRef.current?.focus();
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="glassmorphism rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden border border-red-500/30"
        onClick={(e) => e.stopPropagation()}
      >
        <main className="p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20 mb-4">
                <IconAlertTriangle className="h-7 w-7 text-red-400" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <div className="mt-2 text-sm text-gray-300">
                <p>{message}</p>
                {itemName && <p className="font-semibold text-purple-300 mt-2 truncate">{itemName}</p>}
            </div>
        </main>
        
        <footer className="p-4 bg-black/20 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button onClick={handleConfirm} variant="danger" className="w-full sm:w-auto">
            {ptBR.confirmButton}
          </Button>
          <Button ref={cancelButtonRef} onClick={onClose} variant="secondary" className="w-full sm:w-auto">
            {ptBR.cancelButton}
          </Button>
        </footer>
      </div>
    </div>
  );
};