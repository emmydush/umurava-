'use client';

import React from 'react';
import { ConfirmDialog as ModernConfirmDialog } from './Dialog';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'destructive';
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  loading = false
}) => {
  return (
    <ModernConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={message}
      onConfirm={onConfirm}
      confirmLabel={confirmText}
      cancelLabel={cancelText}
      confirmVariant={variant}
      loading={loading}
    />
  );
};

export default ConfirmDialog;
