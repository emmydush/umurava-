'use client';

import React, { useEffect, useRef } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'alert' | 'confirm' | 'destructive';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

export interface DialogAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'destructive' | 'outline';
  disabled?: boolean;
  loading?: boolean;
}

export interface DialogContentProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: DialogAction[];
  children?: React.ReactNode;
  variant?: 'default' | 'alert' | 'confirm' | 'destructive';
}

const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = '',
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store previous focus
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the dialog
      if (dialogRef.current) {
        dialogRef.current.focus();
      }
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Restore focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeOnEscape, onClose]);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'lg':
        return 'max-w-3xl';
      case 'xl':
        return 'max-w-5xl';
      case 'full':
        return 'max-w-[95vw] h-[90vh]';
      default:
        return 'max-w-lg';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'alert':
        return 'border-blue-200 bg-blue-50';
      case 'confirm':
        return 'border-green-200 bg-green-50';
      case 'destructive':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-slate-200 bg-white';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      
      {/* Dialog */}
      <div
        ref={dialogRef}
        className={`
          relative w-full ${getSizeClasses()} ${getVariantClasses()}
          rounded-2xl border shadow-2xl transition-all
          ${size === 'full' ? 'flex flex-col' : ''}
          ${className}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
        aria-describedby={description ? 'dialog-description' : undefined}
        tabIndex={-1}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 pb-0">
            <div className="flex-1">
              {title && (
                <h2 
                  id="dialog-title"
                  className="text-xl font-bold text-slate-900"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p 
                  id="dialog-description"
                  className="text-sm text-slate-600 mt-1"
                >
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={`p-6 ${size === 'full' ? 'flex-1 overflow-y-auto' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

const DialogContent: React.FC<DialogContentProps> = ({
  title,
  description,
  icon,
  actions = [],
  children,
  variant = 'default'
}) => {
  const getVariantIcon = () => {
    switch (variant) {
      case 'alert':
        return <AlertCircle className="w-6 h-6 text-blue-600" />;
      case 'confirm':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'destructive':
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      default:
        return <Info className="w-6 h-6 text-slate-600" />;
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'alert':
        return 'text-blue-900';
      case 'confirm':
        return 'text-green-900';
      case 'destructive':
        return 'text-red-900';
      default:
        return 'text-slate-900';
    }
  };

  return (
    <div className="text-center">
      {icon || getVariantIcon()}
      {title && (
        <h3 className={`text-lg font-bold mt-4 ${getVariantClasses()}`}>
          {title}
        </h3>
      )}
      {description && (
        <p className="text-slate-600 mt-2 text-sm leading-relaxed">
          {description}
        </p>
      )}
      {children && (
        <div className="mt-4 text-left">
          {children}
        </div>
      )}
      {actions.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              disabled={action.disabled || action.loading}
              className={`
                px-6 py-2.5 rounded-xl font-bold text-sm transition-all
                ${action.loading ? 'opacity-50 cursor-not-allowed' : ''}
                ${action.variant === 'primary' 
                  ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-500/20' 
                  : action.variant === 'destructive'
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-500/20'
                  : action.variant === 'outline'
                  ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }
              `}
            >
              {action.loading && <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Preset dialog components
export const AlertDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  actions?: DialogAction[];
}> = ({ isOpen, onClose, title, description, actions = [] }) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} variant="alert" size="sm">
      <DialogContent
        title={title}
        description={description}
        variant="alert"
        actions={actions}
      />
    </Dialog>
  );
};

export const ConfirmDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'destructive';
  loading?: boolean;
}> = ({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  onConfirm, 
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  loading = false
}) => {
  const actions: DialogAction[] = [
    {
      label: cancelLabel,
      onClick: onClose,
      variant: 'outline'
    },
    {
      label: confirmLabel,
      onClick: onConfirm,
      variant: confirmVariant,
      loading
    }
  ];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} variant="confirm" size="sm">
      <DialogContent
        title={title}
        description={description}
        variant="confirm"
        actions={actions}
      />
    </Dialog>
  );
};

export const DestructiveDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}> = ({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  onConfirm, 
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  loading = false
}) => {
  const actions: DialogAction[] = [
    {
      label: cancelLabel,
      onClick: onClose,
      variant: 'outline'
    },
    {
      label: confirmLabel,
      onClick: onConfirm,
      variant: 'destructive',
      loading
    }
  ];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} variant="destructive" size="sm">
      <DialogContent
        title={title}
        description={description}
        variant="destructive"
        actions={actions}
      />
    </Dialog>
  );
};

export default Dialog;
